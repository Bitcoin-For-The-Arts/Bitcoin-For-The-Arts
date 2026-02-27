import { nip19 } from 'nostr-tools';

export type LiveEvent30311 = {
  eventId: string;
  pubkey: string;
  createdAt: number;

  d: string;
  hostPubkey: string;

  title: string;
  summary?: string;
  image?: string;
  thumb?: string;

  status: 'planned' | 'live' | 'ended' | string;
  currentParticipants: number;
  totalParticipants?: number;
  starts?: number;
  ends?: number;

  streamingUrls: string[];
  service?: string;

  watchUrl: string;
};

export function getFirstTagValue(tags: string[][], name: string): string | undefined {
  return (tags || []).find((t) => t?.[0] === name)?.[1];
}

export function getAllTagValues(tags: string[][], name: string): string[] {
  return (tags || []).filter((t) => t?.[0] === name && typeof t[1] === 'string').map((t) => t[1]);
}

export function hostPubkeyFromTags(tags: string[][], fallbackPubkey: string): string {
  const host = (tags || []).find((t) => t?.[0] === 'p' && (t?.[3] || '').toLowerCase() === 'host')?.[1];
  if (typeof host === 'string' && host) return host;
  return fallbackPubkey;
}

export function isZapStreamLiveEvent(tags: string[][]): boolean {
  const alt = (getFirstTagValue(tags, 'alt') || '').toLowerCase();
  if (alt.includes('zap.stream')) return true;
  const service = (getFirstTagValue(tags, 'service') || '').toLowerCase();
  if (service.includes('zap.stream')) return true;
  const url = (getFirstTagValue(tags, 'url') || '').toLowerCase();
  if (url.includes('zap.stream')) return true;
  const streaming = getAllTagValues(tags, 'streaming').join(' ').toLowerCase();
  if (streaming.includes('zap.stream')) return true;
  return false;
}

export function watchUrlFromEvent(pubkey: string, d: string, tags: string[][]): string {
  const alt = getFirstTagValue(tags, 'alt') || '';
  const zap = alt.match(/https:\/\/zap\.stream\/[a-z0-9]+/i);
  if (zap?.[0]) return zap[0];

  // Some providers include a direct link in `alt`, `url`, or `streaming`.
  const anyUrl = alt.match(/https?:\/\/[^\s]+/i)?.[0];
  if (anyUrl) return anyUrl;
  const urlTag = (getFirstTagValue(tags, 'url') || '').trim();
  if (urlTag.startsWith('http://') || urlTag.startsWith('https://')) return urlTag;

  const streaming = getAllTagValues(tags, 'streaming').find((u) => (u || '').startsWith('https://') || (u || '').startsWith('http://'));
  if (streaming && !streaming.startsWith('moq://')) return streaming;

  if (pubkey && d) {
    try {
      const naddr = nip19.naddrEncode({ kind: 30311, pubkey, identifier: d, relays: [] });
      return `https://zap.stream/${naddr}`;
    } catch {
      // ignore
    }
  }

  return 'https://zap.stream';
}

export function parseLiveEvent30311(ev: {
  id?: string;
  pubkey?: string;
  created_at?: number;
  kind?: number;
  tags?: string[][];
}): LiveEvent30311 | null {
  if (ev.kind !== 30311) return null;
  if (!ev.id || !ev.pubkey || !ev.created_at) return null;
  const tags = (ev.tags || []) as string[][];

  const d = (getFirstTagValue(tags, 'd') || '').trim();
  if (!d) return null;

  const statusRaw = (getFirstTagValue(tags, 'status') || '').trim().toLowerCase();
  const status = (statusRaw || 'planned') as LiveEvent30311['status'];

  const title = (getFirstTagValue(tags, 'title') || '').trim() || 'Live event';
  const summary = (getFirstTagValue(tags, 'summary') || '').trim() || undefined;
  const image = (getFirstTagValue(tags, 'image') || '').trim() || undefined;
  const thumb = (getFirstTagValue(tags, 'thumb') || '').trim() || undefined;

  const cur = Number(getFirstTagValue(tags, 'current_participants') || '');
  const tot = Number(getFirstTagValue(tags, 'total_participants') || '');
  const starts = Number(getFirstTagValue(tags, 'starts') || '');
  const ends = Number(getFirstTagValue(tags, 'ends') || '');

  const currentParticipants = Number.isFinite(cur) && cur >= 0 ? cur : 0;
  const totalParticipants = Number.isFinite(tot) && tot >= 0 ? tot : undefined;

  const hostPubkey = hostPubkeyFromTags(tags, ev.pubkey);
  const streamingUrls = getAllTagValues(tags, 'streaming');
  const service = (getFirstTagValue(tags, 'service') || '').trim() || undefined;

  return {
    eventId: ev.id,
    pubkey: ev.pubkey,
    createdAt: ev.created_at,
    d,
    hostPubkey,
    title,
    summary,
    image,
    thumb,
    status,
    currentParticipants,
    totalParticipants,
    starts: Number.isFinite(starts) ? starts : undefined,
    ends: Number.isFinite(ends) ? ends : undefined,
    streamingUrls,
    service,
    watchUrl: watchUrlFromEvent(ev.pubkey, d, tags),
  };
}

