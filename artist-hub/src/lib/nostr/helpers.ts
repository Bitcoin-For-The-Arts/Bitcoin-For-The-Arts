import { nip19 } from 'nostr-tools';

export function getFirstTagValue(tags: string[][], name: string): string | undefined {
  for (const t of tags) {
    if (t[0] === name && typeof t[1] === 'string') return t[1];
  }
  return undefined;
}

export function getAllTagValues(tags: string[][], name: string): string[] {
  const out: string[] = [];
  for (const t of tags) if (t[0] === name && typeof t[1] === 'string') out.push(t[1]);
  return out;
}

export function getDTag(tags: string[][]): string | undefined {
  return getFirstTagValue(tags, 'd');
}

export function addressFor(kind: number, pubkey: string, d: string): string {
  return `${kind}:${pubkey}:${d}`;
}

export function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function npubFor(pubkey: string): string {
  return nip19.npubEncode(pubkey);
}

export function noteFor(id: string): string {
  return nip19.noteEncode(id);
}

