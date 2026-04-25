import { nip19 } from 'nostr-tools';
import { get } from 'svelte/store';
import { NOSTR_KINDS } from '$lib/nostr/constants';
import { getDTag, safeJsonParse, addressFor } from '$lib/nostr/helpers';
import { publishSignedEvent, signWithNip07 } from '$lib/nostr/pool';
import { pubkey as myPubkey } from '$lib/stores/auth';

function requirePubkey(): string {
  const pk = get(myPubkey);
  if (!pk) throw new Error('Connect a signer (or create an in-app key) first.');
  return pk;
}

export type StudioItem =
  | { type: 'image'; url: string; title?: string }
  | { type: 'video'; url: string; title?: string }
  | { type: 'link'; url: string; title?: string };

export type StudioContent = {
  id: string; // also used as `d` tag
  name: string;
  about?: string;
  picture?: string;
  tags?: string[];
  items: StudioItem[];

  // Optional collaboration hooks
  channelId?: string; // NIP-28 channel kind:40 id
  streamUrl?: string; // workshop/demo stream url (embed/link)
};

export type Studio = {
  kind: number;
  eventId: string;
  pubkey: string;
  createdAt: number;
  d: string;
  address: string;
  naddr: string;
  content: StudioContent;
};

export function parseStudioEvent(ev: { id?: string; pubkey?: string; created_at?: number; kind?: number; content?: string; tags?: string[][] }): Studio | null {
  if (ev.kind !== NOSTR_KINDS.bfta_studio) return null;
  if (!ev.id || !ev.pubkey || !ev.created_at) return null;
  const d = getDTag(ev.tags ?? []);
  if (!d) return null;

  const parsed = safeJsonParse<StudioContent>(ev.content ?? '');
  if (!parsed?.name || !Array.isArray(parsed.items)) return null;

  const address = addressFor(NOSTR_KINDS.bfta_studio, ev.pubkey, d);
  const naddr = nip19.naddrEncode({
    kind: NOSTR_KINDS.bfta_studio,
    pubkey: ev.pubkey,
    identifier: d,
    relays: [],
  });

  return {
    kind: ev.kind,
    eventId: ev.id,
    pubkey: ev.pubkey,
    createdAt: ev.created_at,
    d,
    address,
    naddr,
    content: parsed,
  };
}

export async function publishStudio(studio: StudioContent): Promise<string> {
  const pubkey = requirePubkey();
  const d = studio.id.trim();
  if (!d) throw new Error('Studio id is required');
  if (!studio.name.trim()) throw new Error('Studio name is required');
  if (!Array.isArray(studio.items) || studio.items.length === 0) throw new Error('Add at least one item');

  const tags: string[][] = [
    ['d', d],
    ['t', 'bfta-studio'],
  ];
  for (const t of studio.tags ?? []) tags.push(['t', t.replace(/^#/, '')]);
  if (studio.channelId) tags.push(['channel', studio.channelId]);
  if (studio.streamUrl) tags.push(['stream', studio.streamUrl]);

  const unsigned = {
    kind: NOSTR_KINDS.bfta_studio,
    created_at: Math.floor(Date.now() / 1000),
    content: JSON.stringify(studio),
    tags,
    pubkey,
  };

  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

