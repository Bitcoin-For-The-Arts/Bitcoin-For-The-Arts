import { browser } from '$app/environment';

export type UploadResult = { url: string };

function guessExt(mime: string): string {
  const m = (mime || '').toLowerCase();
  if (m.includes('png')) return 'png';
  if (m.includes('jpeg') || m.includes('jpg')) return 'jpg';
  if (m.includes('webp')) return 'webp';
  return 'jpg';
}

/**
 * Best-effort public image upload (no backend).
 * Uses nostr.build's anonymous upload API if available.
 */
export async function uploadImage(file: File, opts?: { endpoint?: string }): Promise<UploadResult> {
  if (!browser) throw new Error('Upload requires a browser.');
  if (!file) throw new Error('Missing file.');
  if (!file.type.startsWith('image/')) throw new Error('Please choose a PNG/JPEG image.');
  if (file.size > 15 * 1024 * 1024) throw new Error('Image too large (max 15MB).');

  const endpoint = (opts?.endpoint || 'https://nostr.build/api/v2/upload/files').trim();
  if (!endpoint.startsWith('http')) throw new Error('Invalid upload endpoint.');

  const fd = new FormData();
  // Most endpoints accept "file". Some accept "files[]"; we try "file" first.
  fd.append('file', file, file.name || `upload.${guessExt(file.type)}`);

  const res = await fetch(endpoint, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);

  let j: any = null;
  try {
    j = await res.json();
  } catch {
    // ignore
  }

  const url =
    j?.data?.[0]?.url ||
    j?.data?.[0]?.fileUrl ||
    j?.data?.url ||
    j?.url ||
    j?.fileUrl ||
    j?.files?.[0]?.url ||
    j?.files?.[0]?.fileUrl;

  const out = typeof url === 'string' ? url.trim() : '';
  if (!out.startsWith('http')) throw new Error('Upload succeeded but returned no URL.');
  return { url: out };
}

