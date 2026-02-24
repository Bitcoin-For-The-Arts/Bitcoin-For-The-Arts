import { NDKEvent } from '@nostr-dev-kit/ndk';
import { nanoid } from 'nanoid';
import { ensureNdk } from '$lib/stores/ndk';
import { NOSTR_KINDS } from '$lib/nostr/constants';
import type { Nip15ProductContent, Nip15StallContent, Nip99Classified } from '$lib/nostr/types';

export async function publishNip15Stall(stall: Nip15StallContent): Promise<NDKEvent> {
  const ndk = await ensureNdk({ withSigner: true });
  const ev = new NDKEvent(ndk);
  ev.kind = NOSTR_KINDS.nip15_stall;
  ev.tags = [['d', stall.id]];
  ev.content = JSON.stringify(stall);
  await ev.publish();
  return ev;
}

export async function publishNip15Product(product: Nip15ProductContent): Promise<NDKEvent> {
  const ndk = await ensureNdk({ withSigner: true });
  const ev = new NDKEvent(ndk);
  ev.kind = NOSTR_KINDS.nip15_product;

  const tags: string[][] = [['d', product.id]];
  for (const t of product.tags ?? []) tags.push(['t', t.replace(/^#/, '')]);
  if (product.category) tags.push(['category', product.category]);
  tags.push(['stall', product.stall_id]);

  ev.tags = tags;
  ev.content = JSON.stringify(product);
  await ev.publish();
  return ev;
}

export async function publishNip99Classified(listing: Nip99Classified): Promise<NDKEvent> {
  const ndk = await ensureNdk({ withSigner: true });
  const ev = new NDKEvent(ndk);
  ev.kind = NOSTR_KINDS.nip99_classified;

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

  ev.tags = tags;
  ev.content = listing.markdown;
  await ev.publish();
  return ev;
}

export async function publishComment(opts: {
  rootEventId: string;
  rootAddress?: string;
  content: string;
  tags?: string[];
}): Promise<NDKEvent> {
  const ndk = await ensureNdk({ withSigner: true });
  const ev = new NDKEvent(ndk);
  ev.kind = NOSTR_KINDS.note;

  const tags: string[][] = [['e', opts.rootEventId, '', 'root']];
  if (opts.rootAddress) tags.push(['a', opts.rootAddress, '', 'root']);
  for (const t of opts.tags ?? []) tags.push(['t', t.replace(/^#/, '')]);

  ev.tags = tags;
  ev.content = opts.content;
  await ev.publish();
  return ev;
}

export async function publishDm(toPubkey: string, plaintext: string): Promise<NDKEvent> {
  const ndk = await ensureNdk({ withSigner: true });
  const ev = new NDKEvent(ndk);
  ev.kind = NOSTR_KINDS.dm;
  ev.tags = [['p', toPubkey]];
  if (!window.nostr?.nip04?.encrypt) {
    throw new Error('Your signer does not support NIP-04 encryption for DMs.');
  }
  ev.content = await window.nostr.nip04.encrypt(toPubkey, plaintext);
  await ev.publish();
  return ev;
}

export async function publishCuratedSet(opts: {
  d: string;
  title: string;
  description?: string;
  pubkeys?: string[];
  addresses?: string[];
}): Promise<NDKEvent> {
  const ndk = await ensureNdk({ withSigner: true });
  const ev = new NDKEvent(ndk);
  ev.kind = NOSTR_KINDS.nip51_curated_set;

  const tags: string[][] = [
    ['d', opts.d],
    ['title', opts.title],
  ];
  if (opts.description) tags.push(['description', opts.description]);
  for (const pk of opts.pubkeys ?? []) tags.push(['p', pk]);
  for (const a of opts.addresses ?? []) tags.push(['a', a]);

  ev.tags = tags;
  ev.content = '';
  await ev.publish();
  return ev;
}

