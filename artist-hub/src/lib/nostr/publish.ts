import { nanoid } from 'nanoid';
import { NOSTR_KINDS } from '$lib/nostr/constants';
import type { Nip15ProductContent, Nip15StallContent, Nip99Classified } from '$lib/nostr/types';
import { publishSignedEvent, signWithNip07 } from '$lib/nostr/pool';

export async function publishNip15Stall(stall: Nip15StallContent): Promise<string> {
  const pubkey = await window.nostr!.getPublicKey();
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
  const pubkey = await window.nostr!.getPublicKey();

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
  const pubkey = await window.nostr!.getPublicKey();

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
  rootAddress?: string;
  content: string;
  tags?: string[];
}): Promise<string> {
  const pubkey = await window.nostr!.getPublicKey();

  const tags: string[][] = [['e', opts.rootEventId, '', 'root']];
  if (opts.rootAddress) tags.push(['a', opts.rootAddress, '', 'root']);
  for (const t of opts.tags ?? []) tags.push(['t', t.replace(/^#/, '')]);

  const unsigned = {
    kind: NOSTR_KINDS.note,
    created_at: Math.floor(Date.now() / 1000),
    content: opts.content,
    tags,
    pubkey,
  };
  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return signed.id;
}

export async function publishDm(toPubkey: string, plaintext: string): Promise<string> {
  const pubkey = await window.nostr!.getPublicKey();
  if (!window.nostr?.nip04?.encrypt) {
    throw new Error('Your signer does not support NIP-04 encryption for DMs.');
  }
  const content = await window.nostr.nip04.encrypt(toPubkey, plaintext);
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

export async function publishCuratedSet(opts: {
  d: string;
  title: string;
  description?: string;
  pubkeys?: string[];
  addresses?: string[];
}): Promise<string> {
  const pubkey = await window.nostr!.getPublicKey();

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

