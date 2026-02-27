import { nanoid } from 'nanoid';
import { nip04, nip19 } from 'nostr-tools';
import { get } from 'svelte/store';
import { NOSTR_KINDS } from '$lib/nostr/constants';
import type { Nip15ProductContent, Nip15StallContent, Nip99Classified } from '$lib/nostr/types';
import { publishSignedEvent, signWithNip07 } from '$lib/nostr/pool';
import { pubkey as myPubkey } from '$lib/stores/auth';
import { getLocalSecretKey } from '$lib/stores/local-signer';

function requirePubkey(): string {
  const pk = get(myPubkey);
  if (!pk) throw new Error('Connect a signer (or create an in-app key) first.');
  return pk;
}

export async function publishNote(opts: { content: string; tags?: string[] }): Promise<string> {
  const pubkey = requirePubkey();
  const content = (opts.content || '').trim();
  if (!content) throw new Error('Post content is empty.');

  const tags: string[][] = [];
  for (const t of opts.tags ?? []) {
    const clean = t.replace(/^#/, '').trim();
    if (clean) tags.push(['t', clean]);
  }

  const unsigned = {
    kind: NOSTR_KINDS.note,
    created_at: Math.floor(Date.now() / 1000),
    content,
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

export async function publishRepost(original: {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  content: string;
  tags: string[][];
  sig?: string;
}): Promise<string> {
  const pubkey = requirePubkey();
  if (!original?.id || !original?.pubkey) throw new Error('Missing original event.');

  const tags: string[][] = [
    ['e', original.id],
    ['p', original.pubkey],
  ];

  const unsigned = {
    kind: NOSTR_KINDS.repost,
    created_at: Math.floor(Date.now() / 1000),
    content: JSON.stringify(original),
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

export async function publishQuoteRepost(opts: { eventId: string; eventPubkey: string; quote: string }): Promise<string> {
  const pubkey = requirePubkey();
  const quote = (opts.quote || '').trim();
  if (!opts.eventId || !opts.eventPubkey) throw new Error('Missing quoted event.');
  if (!quote) throw new Error('Quote is empty.');

  const tags: string[][] = [
    ['q', opts.eventId],
    ['p', opts.eventPubkey],
  ];

  const unsigned = {
    kind: NOSTR_KINDS.note,
    created_at: Math.floor(Date.now() / 1000),
    content: `${quote}\n\nnostr:${nip19.noteEncode(opts.eventId)}`,
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

export async function publishReaction(opts: { eventId: string; eventPubkey: string; content?: string }): Promise<string> {
  const pubkey = requirePubkey();
  if (!opts?.eventId || !opts?.eventPubkey) throw new Error('Missing reacted event.');
  const content = (opts.content || '+').trim() || '+';

  const tags: string[][] = [
    ['e', opts.eventId],
    ['p', opts.eventPubkey],
  ];

  const unsigned = {
    kind: NOSTR_KINDS.reaction,
    created_at: Math.floor(Date.now() / 1000),
    content,
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

export async function publishEdit(opts: { originalEventId: string; content: string }): Promise<string> {
  const pubkey = requirePubkey();
  const content = (opts.content || '').trim();
  if (!content) throw new Error('Edited content is empty.');
  if (!opts.originalEventId) throw new Error('Missing original event id.');

  const tags: string[][] = [
    ['d', opts.originalEventId],
    ['e', opts.originalEventId],
  ];

  const unsigned = {
    kind: NOSTR_KINDS.nip37_edit,
    created_at: Math.floor(Date.now() / 1000),
    content,
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

export async function publishNip15Stall(stall: Nip15StallContent): Promise<string> {
  const pubkey = requirePubkey();
  const unsigned = {
    kind: NOSTR_KINDS.nip15_stall,
    created_at: Math.floor(Date.now() / 1000),
    content: JSON.stringify(stall),
    tags: [['d', stall.id]],
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

export async function publishNip15Product(product: Nip15ProductContent): Promise<string> {
  const pubkey = requirePubkey();

  const tags: string[][] = [['d', product.id]];
  for (const t of product.tags ?? []) tags.push(['t', t.replace(/^#/, '')]);
  if (product.category) tags.push(['category', product.category]);
  tags.push(['stall', product.stall_id]);

  const unsigned = {
    kind: NOSTR_KINDS.nip15_product,
    created_at: Math.floor(Date.now() / 1000),
    content: JSON.stringify(product),
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

export async function publishNip99Classified(listing: Nip99Classified): Promise<string> {
  const pubkey = requirePubkey();

  const d = nanoid();
  const tags: string[][] = [
    ['d', d],
    ['title', listing.title],
  ];
  if (listing.summary) tags.push(['summary', listing.summary]);
  if (listing.category) tags.push(['category', listing.category]);
  if (listing.status) tags.push(['status', listing.status]);
  if (listing.geohash) tags.push(['g', listing.geohash]);
  for (const img of listing.images ?? []) tags.push(['image', img]);
  for (const t of listing.tags ?? []) tags.push(['t', t.replace(/^#/, '')]);
  if (listing.price?.amount) {
    tags.push(['price', listing.price.amount, listing.price.currency ?? 'sat', listing.price.period ?? '']);
  }

  const unsigned = {
    kind: NOSTR_KINDS.nip99_classified,
    created_at: Math.floor(Date.now() / 1000),
    content: listing.markdown,
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

export async function publishComment(opts: {
  rootEventId: string;
  rootPubkey?: string;
  rootAddress?: string;
  replyToEventId?: string;
  replyToPubkey?: string;
  content: string;
  tags?: string[];
}): Promise<string> {
  const pubkey = requirePubkey();

  const content = (opts.content || '').trim();
  if (!content) throw new Error('Comment is empty.');

  const tags: string[][] = [['e', opts.rootEventId, '', 'root']];
  if (opts.rootAddress) tags.push(['a', opts.rootAddress, '', 'root']);
  if (opts.rootPubkey) tags.push(['p', opts.rootPubkey]);
  if (opts.replyToEventId) tags.push(['e', opts.replyToEventId, '', 'reply']);
  if (opts.replyToPubkey) tags.push(['p', opts.replyToPubkey]);
  for (const t of opts.tags ?? []) tags.push(['t', t.replace(/^#/, '')]);

  const unsigned = {
    kind: NOSTR_KINDS.note,
    created_at: Math.floor(Date.now() / 1000),
    content,
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

export async function publishDm(toPubkey: string, plaintext: string): Promise<string> {
  const pubkey = requirePubkey();

  let content = '';
  if (window.nostr?.nip04?.encrypt) {
    content = await window.nostr.nip04.encrypt(toPubkey, plaintext);
  } else {
    const sk = getLocalSecretKey();
    if (!sk) throw new Error('No NIP-04 encryption available. Install Alby/nos2x or use an in-app key.');
    content = await nip04.encrypt(sk, toPubkey, plaintext);
  }

  const unsigned = {
    kind: NOSTR_KINDS.dm,
    created_at: Math.floor(Date.now() / 1000),
    content,
    tags: [['p', toPubkey]],
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

export async function publishDeletion(opts: { eventIds: string[]; reason?: string }): Promise<string> {
  const pubkey = requirePubkey();
  const ids = (opts.eventIds || []).map((x) => (x || '').trim()).filter(Boolean).slice(0, 200);
  if (!ids.length) throw new Error('Nothing to delete.');

  const tags: string[][] = [];
  for (const id of ids) tags.push(['e', id]);

  const unsigned = {
    kind: NOSTR_KINDS.deletion,
    created_at: Math.floor(Date.now() / 1000),
    content: (opts.reason || '').trim(),
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

export async function publishCuratedSet(opts: {
  d: string;
  title: string;
  description?: string;
  pubkeys?: string[];
  addresses?: string[];
}): Promise<string> {
  const pubkey = requirePubkey();

  const tags: string[][] = [
    ['d', opts.d],
    ['title', opts.title],
  ];
  if (opts.description) tags.push(['description', opts.description]);
  for (const pk of opts.pubkeys ?? []) tags.push(['p', pk]);
  for (const a of opts.addresses ?? []) tags.push(['a', a]);

  const unsigned = {
    kind: NOSTR_KINDS.nip51_curated_set,
    created_at: Math.floor(Date.now() / 1000),
    content: '',
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

export async function publishFollowPackInvite(opts: {
  packAuthorPubkey: string;
  packD: string;
  inviteePubkey: string;
  message?: string;
}): Promise<string> {
  const pubkey = requirePubkey();
  if (!opts?.packAuthorPubkey || !opts?.packD) throw new Error('Missing follow pack.');
  if (!opts?.inviteePubkey) throw new Error('Missing invitee pubkey.');
  if (pubkey !== opts.packAuthorPubkey) throw new Error('Only the pack author can send invites.');

  const address = `${NOSTR_KINDS.follow_pack}:${opts.packAuthorPubkey}:${opts.packD}`;
  const tags: string[][] = [
    ['t', 'follow-pack-invite'],
    ['p', opts.inviteePubkey],
    ['a', address],
    ['d', opts.packD],
  ];

  const unsigned = {
    kind: NOSTR_KINDS.note,
    created_at: Math.floor(Date.now() / 1000),
    content: (opts.message || 'You are invited to join this follow pack.').trim(),
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

export async function publishFollowPackAccept(opts: { packAuthorPubkey: string; packD: string; message?: string }): Promise<string> {
  const pubkey = requirePubkey();
  if (!opts?.packAuthorPubkey || !opts?.packD) throw new Error('Missing follow pack.');

  const address = `${NOSTR_KINDS.follow_pack}:${opts.packAuthorPubkey}:${opts.packD}`;
  const tags: string[][] = [
    ['t', 'follow-pack-accept'],
    ['p', opts.packAuthorPubkey],
    ['a', address],
    ['d', opts.packD],
  ];

  const unsigned = {
    kind: NOSTR_KINDS.note,
    created_at: Math.floor(Date.now() / 1000),
    content: (opts.message || 'I accept the invite to join this follow pack.').trim(),
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

