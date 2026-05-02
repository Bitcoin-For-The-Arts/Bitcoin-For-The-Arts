import { nanoid } from 'nanoid';
import { get } from 'svelte/store';
import { publishSignedEvent, signWithNip07 } from '$lib/nostr/pool';
import { NOSTR_KINDS } from '$lib/nostr/constants';
import { getAllTagValues, getFirstTagValue, safeJsonParse } from '$lib/nostr/helpers';
import { pubkey as myPubkey } from '$lib/stores/auth';

function requirePubkey(): string {
  const pk = get(myPubkey);
  if (!pk) throw new Error('Connect a signer (or create an in-app key) first.');
  return pk;
}

export type HubEvent = {
  eventId: string;
  pubkey: string;
  createdAt: number;
  title: string;
  summary?: string;
  markdown: string;
  images: string[];
  tags: string[];
  start?: number; // unix seconds
  end?: number; // unix seconds
  location?: string;
  url?: string;
};

export function parseHubEvent(ev: {
  id?: string;
  pubkey?: string;
  created_at?: number;
  kind?: number;
  content?: string;
  tags?: string[][];
}): HubEvent | null {
  if (ev.kind !== NOSTR_KINDS.nip99_classified) return null;
  if (!ev.id || !ev.pubkey || !ev.created_at) return null;

  const title = getFirstTagValue(ev.tags ?? [], 'title') || 'Untitled event';
  const summary = getFirstTagValue(ev.tags ?? [], 'summary');
  const images = getAllTagValues(ev.tags ?? [], 'image');
  const tags = getAllTagValues(ev.tags ?? [], 't');

  // Optional time/location tags (non-standard, but common)
  const start = Number(getFirstTagValue(ev.tags ?? [], 'start') || '');
  const end = Number(getFirstTagValue(ev.tags ?? [], 'end') || '');
  const location = getFirstTagValue(ev.tags ?? [], 'location') || getFirstTagValue(ev.tags ?? [], 'g');
  const url = getFirstTagValue(ev.tags ?? [], 'url');

  return {
    eventId: ev.id,
    pubkey: ev.pubkey,
    createdAt: ev.created_at,
    title,
    summary: summary || undefined,
    markdown: ev.content || '',
    images,
    tags,
    start: Number.isFinite(start) ? start : undefined,
    end: Number.isFinite(end) ? end : undefined,
    location: location || undefined,
    url: url || undefined,
  };
}

export async function publishHubEvent(input: {
  title: string;
  summary?: string;
  markdown: string;
  images?: string[];
  tags?: string[];
  start?: number;
  end?: number;
  location?: string;
  url?: string;
}): Promise<string> {
  const pubkey = requirePubkey();
  const d = nanoid();

  const tags: string[][] = [
    ['d', d],
    ['title', input.title.trim()],
    ['t', 'event'],
    ['t', 'bfta'],
  ];
  if (input.summary?.trim()) tags.push(['summary', input.summary.trim()]);
  for (const img of input.images ?? []) tags.push(['image', img]);
  for (const t of input.tags ?? []) tags.push(['t', t.replace(/^#/, '')]);
  if (input.start) tags.push(['start', String(Math.floor(input.start))]);
  if (input.end) tags.push(['end', String(Math.floor(input.end))]);
  if (input.location?.trim()) tags.push(['location', input.location.trim()]);
  if (input.url?.trim()) tags.push(['url', input.url.trim()]);

  const unsigned = {
    kind: NOSTR_KINDS.nip99_classified,
    created_at: Math.floor(Date.now() / 1000),
    content: input.markdown,
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

