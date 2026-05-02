import { detectMediaType, normalizeUrl } from '$lib/ui/media';

export type LinkPreview = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  site?: string;
};

type CacheEntry =
  | { status: 'ok'; value: LinkPreview | null; at: number }
  | { status: 'err'; error: string; at: number };

const cache = new Map<string, CacheEntry>();
const TTL_MS = 1000 * 60 * 30; // 30 minutes

function hostFor(url: string): string | undefined {
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}

function firstImageUrlFromText(content: string): string | undefined {
  if (!content) return undefined;
  const re = /(https?:\/\/[^\s<>"']+\.(png|jpe?g|gif|webp|avif)(\?[^\s<>"']*)?)/gi;
  const m = re.exec(content);
  return m?.[1];
}

function pickMeta(doc: Document, prop: string): string | undefined {
  const el = doc.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
  const v = el?.getAttribute('content') || '';
  return v.trim() || undefined;
}

async function fetchPreviewViaHtml(url: string, signal: AbortSignal): Promise<LinkPreview | null> {
  // This often fails due to CORS, but works for some hosts.
  const res = await fetch(url, { signal, redirect: 'follow', headers: { accept: 'text/html,application/xhtml+xml' } });
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  if (!res.ok) return null;
  if (!ct.includes('text/html')) return null;
  const html = await res.text();
  if (!html) return null;

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const title = pickMeta(doc, 'og:title') || doc.querySelector('title')?.textContent?.trim() || undefined;
  const description = pickMeta(doc, 'og:description') || pickMeta(doc, 'description');
  const image = pickMeta(doc, 'og:image') || undefined;
  return { url, title, description, image, site: hostFor(url) };
}

async function fetchPreviewViaJina(url: string, signal: AbortSignal): Promise<LinkPreview | null> {
  // Best-effort fallback. This is a third-party reader service and may not always return images.
  const readerUrl = `https://r.jina.ai/${url}`;
  const res = await fetch(readerUrl, { signal, headers: { accept: 'application/json' } });
  if (!res.ok) return null;

  const j: any = await res.json().catch(() => null);
  if (!j) return null;

  const data = (j && typeof j === 'object' && 'data' in j && j.data && typeof j.data === 'object') ? j.data : j;
  const title = (data?.title && String(data.title).trim()) || undefined;
  const description = (data?.description && String(data.description).trim()) || undefined;

  // Some variants include `images` arrays, otherwise we try to find an image URL inside the extracted content.
  const images = Array.isArray(data?.images) ? data.images : Array.isArray(data?.imageUrls) ? data.imageUrls : undefined;
  const imageFromList = images?.find((u: any) => typeof u === 'string' && detectMediaType(u) === 'image') as string | undefined;
  const content = typeof data?.content === 'string' ? data.content : typeof data?.text === 'string' ? data.text : '';
  const imageFromContent = firstImageUrlFromText(content);
  const image = (imageFromList || imageFromContent || undefined) as string | undefined;

  return { url, title, description, image, site: hostFor(url) };
}

export async function getLinkPreview(rawUrl: string): Promise<LinkPreview | null> {
  // Unfurling is client-side only (CORS, DOM parsing).
  if (typeof window === 'undefined') return null;

  const url = normalizeUrl(rawUrl || '');
  if (!url) return null;

  const cached = cache.get(url);
  const now = Date.now();
  if (cached && now - cached.at < TTL_MS) {
    if (cached.status === 'ok') return cached.value;
    return null;
  }

  // Don’t unfurl direct media; those are rendered directly elsewhere.
  if (detectMediaType(url) !== 'link') {
    const v: LinkPreview = { url, site: hostFor(url) };
    cache.set(url, { status: 'ok', value: v, at: now });
    return v;
  }

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 4500);
  try {
    let out: LinkPreview | null = null;
    try {
      out = await fetchPreviewViaHtml(url, ac.signal);
    } catch {
      // ignore
    }
    if (!out) {
      try {
        out = await fetchPreviewViaJina(url, ac.signal);
      } catch {
        // ignore
      }
    }

    cache.set(url, { status: 'ok', value: out, at: Date.now() });
    return out;
  } catch (e) {
    cache.set(url, { status: 'err', error: e instanceof Error ? e.message : String(e), at: Date.now() });
    return null;
  } finally {
    clearTimeout(t);
  }
}

