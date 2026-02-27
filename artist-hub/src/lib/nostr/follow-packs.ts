import { NOSTR_KINDS } from '$lib/nostr/constants';

export type FollowPackEntry = { pubkey: string; relay?: string };

export type FollowPack = {
  d: string;
  eventId: string;
  pubkey: string; // author
  createdAt: number;
  title: string;
  description?: string;
  image?: string;
  entries: FollowPackEntry[];
};

function firstTag(tags: string[][], name: string): string | undefined {
  return tags.find((t) => t[0] === name)?.[1];
}

export function addressForFollowPack(pubkey: string, d: string): string {
  return `${NOSTR_KINDS.follow_pack}:${pubkey}:${d}`;
}

export function parseFollowPackEvent(ev: any): FollowPack | null {
  if (!ev?.id || !ev?.pubkey || !ev?.created_at) return null;
  if (ev.kind !== NOSTR_KINDS.follow_pack) return null;
  const tags = (ev.tags as string[][]) || [];

  const d = firstTag(tags, 'd') || ev.id;
  const title = firstTag(tags, 'title') || firstTag(tags, 'n') || 'Follow Pack';
  const description = firstTag(tags, 'description') || undefined;
  const image = firstTag(tags, 'image') || undefined;
  const entries = tags
    .filter((t) => t[0] === 'p' && typeof t[1] === 'string' && t[1])
    .map((t) => ({ pubkey: t[1], relay: typeof t[2] === 'string' ? t[2] : undefined }))
    .slice(0, 5000);

  return {
    d,
    eventId: ev.id,
    pubkey: ev.pubkey,
    createdAt: ev.created_at,
    title,
    description,
    image,
    entries,
  };
}

