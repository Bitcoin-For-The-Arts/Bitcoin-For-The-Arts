export type MediaType = 'image' | 'video' | 'audio' | 'link';

function stripTrailingPunctuation(url: string): string {
  // Common in posts: "...jpg)" or "...mp4."
  return url.replace(/[)\].,;!?]+$/g, '');
}

export function normalizeUrl(raw: string): string {
  return stripTrailingPunctuation(raw.trim());
}

export function detectMediaType(url: string): MediaType {
  const u = url.toLowerCase();
  if (u.match(/\.(png|jpe?g|gif|webp|avif)(\?|#|$)/)) return 'image';
  if (u.match(/\.(mp4|webm|mov|m4v)(\?|#|$)/)) return 'video';
  if (u.match(/\.(mp3|wav|ogg|m4a|aac|flac)(\?|#|$)/)) return 'audio';
  return 'link';
}

export function extractUrls(text: string): string[] {
  if (!text) return [];
  const re = /(https?:\/\/[^\s<>"']+)/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null = null;
  while ((m = re.exec(text))) {
    const cleaned = normalizeUrl(m[1] || '');
    if (!cleaned) continue;
    if (!out.includes(cleaned)) out.push(cleaned);
    if (out.length >= 12) break;
  }
  return out;
}

