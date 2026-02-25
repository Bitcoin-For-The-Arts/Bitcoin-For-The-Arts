import { nanoid } from 'nanoid';
import { nip19 } from 'nostr-tools';
import { NOSTR_KINDS } from '$lib/nostr/constants';
import { addressFor, getDTag, safeJsonParse } from '$lib/nostr/helpers';
import { publishSignedEvent, signWithNip07 } from '$lib/nostr/pool';

export type ZapChallengeContent = {
  id: string; // also `d` tag
  title: string;
  about?: string;
  picture?: string;
  tags?: string[];
  startsAt: number; // unix seconds
  endsAt: number; // unix seconds
  goalSats?: number;

  // Recipient of zaps (the “arena” target)
  targetPubkey: string;
  targetLabel?: string;

  // Optional: link to a Live channel for hype/chat
  channelId?: string; // kind:40 id
};

export type ZapChallenge = {
  kind: number;
  eventId: string;
  pubkey: string; // challenge creator
  createdAt: number;
  d: string;
  address: string;
  naddr: string;
  content: ZapChallengeContent;
};

export function parseZapChallengeEvent(ev: {
  id?: string;
  pubkey?: string;
  created_at?: number;
  kind?: number;
  content?: string;
  tags?: string[][];
}): ZapChallenge | null {
  if (ev.kind !== NOSTR_KINDS.bfta_zap_challenge) return null;
  if (!ev.id || !ev.pubkey || !ev.created_at) return null;
  const d = getDTag(ev.tags ?? []);
  if (!d) return null;

  const parsed = safeJsonParse<ZapChallengeContent>(ev.content ?? '');
  if (!parsed?.title || !parsed?.targetPubkey) return null;
  if (!parsed.startsAt || !parsed.endsAt) return null;

  const address = addressFor(NOSTR_KINDS.bfta_zap_challenge, ev.pubkey, d);
  const naddr = nip19.naddrEncode({
    kind: NOSTR_KINDS.bfta_zap_challenge,
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

export async function publishZapChallenge(input: Omit<ZapChallengeContent, 'id'> & { id?: string }): Promise<string> {
  const pubkey = await window.nostr!.getPublicKey();
  const id = (input.id || `challenge-${nanoid(10)}`).trim();
  if (!id) throw new Error('Missing challenge id');
  if (!input.title.trim()) throw new Error('Title is required');
  if (!input.targetPubkey.trim()) throw new Error('Target pubkey is required');
  if (!input.startsAt || !input.endsAt || input.endsAt <= input.startsAt) throw new Error('Invalid start/end time');

  const content: ZapChallengeContent = {
    id,
    title: input.title.trim(),
    about: input.about?.trim() || undefined,
    picture: input.picture?.trim() || undefined,
    tags: (input.tags ?? []).map((t) => t.replace(/^#/, '')).filter(Boolean),
    startsAt: Math.floor(input.startsAt),
    endsAt: Math.floor(input.endsAt),
    goalSats: input.goalSats && input.goalSats > 0 ? Math.floor(input.goalSats) : undefined,
    targetPubkey: input.targetPubkey.trim(),
    targetLabel: input.targetLabel?.trim() || undefined,
    channelId: input.channelId?.trim() || undefined,
  };

  const tags: string[][] = [
    ['d', id],
    ['t', 'zap-challenge'],
    ['t', 'bfta'],
    ['p', content.targetPubkey],
    ['start', String(content.startsAt)],
    ['end', String(content.endsAt)],
  ];
  for (const t of content.tags ?? []) tags.push(['t', t]);
  if (content.goalSats) tags.push(['goal', String(content.goalSats), 'sat']);
  if (content.channelId) tags.push(['channel', content.channelId]);

  const unsigned = {
    kind: NOSTR_KINDS.bfta_zap_challenge,
    created_at: Math.floor(Date.now() / 1000),
    content: JSON.stringify(content),
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

