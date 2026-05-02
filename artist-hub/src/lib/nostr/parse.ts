import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { NOSTR_KINDS } from '$lib/nostr/constants';
import { addressFor, getAllTagValues, getDTag, getFirstTagValue, safeJsonParse } from '$lib/nostr/helpers';
import type { Listing, Nip15ProductContent, Nip99Classified } from '$lib/nostr/types';

export function eventToListing(ev: NDKEvent): Listing | null {
  if (ev.kind === NOSTR_KINDS.nip15_product) return nip15ProductToListing(ev);
  if (ev.kind === NOSTR_KINDS.nip99_classified) return nip99ToListing(ev);
  return null;
}

function nip15ProductToListing(ev: NDKEvent): Listing | null {
  const content = safeJsonParse<Nip15ProductContent>(ev.content ?? '');
  if (!content?.name) return null;

  const d = getDTag(ev.tags as any);
  const address = d ? addressFor(ev.kind!, ev.pubkey!, d) : undefined;

  const images = Array.isArray(content.images) ? content.images.filter((u) => typeof u === 'string') : [];
  const tags = Array.isArray(content.tags) ? content.tags.filter((t) => typeof t === 'string') : [];
  const currency = content.currency || 'sat';
  const priceSats = currency.toLowerCase().startsWith('sat') ? Number(content.price) : undefined;

  return {
    kind: 'nip15_product',
    eventId: ev.id!,
    address,
    pubkey: ev.pubkey!,
    createdAt: ev.created_at!,
    title: content.name,
    summary: content.description,
    description: content.description,
    images,
    tags,
    category: content.category,
    priceSats,
    currency,
    status:
      content.availability === 'unavailable'
        ? 'sold'
        : 'active',
  };
}

function nip99ToListing(ev: NDKEvent): Listing | null {
  const title = getFirstTagValue(ev.tags as any, 'title') || 'Untitled';
  const summary = getFirstTagValue(ev.tags as any, 'summary');
  const images = getAllTagValues(ev.tags as any, 'image');
  const tags = getAllTagValues(ev.tags as any, 't');
  const status = (getFirstTagValue(ev.tags as any, 'status') as 'active' | 'sold' | undefined) ?? 'active';
  const category = getFirstTagValue(ev.tags as any, 'category');

  const priceTag = (ev.tags as any as string[][]).find((t) => t[0] === 'price');
  const priceSats = priceTag?.[2]?.toLowerCase().startsWith('sat') ? Number(priceTag?.[1]) : undefined;
  const currency = priceTag?.[2] ?? 'sat';

  const markdown = ev.content || '';
  const normalized: Nip99Classified = {
    title,
    summary,
    markdown,
    images,
    tags,
    status,
    category,
    price: priceTag
      ? { amount: String(priceTag?.[1] ?? ''), currency: priceTag?.[2], period: priceTag?.[3] }
      : undefined,
  };

  return {
    kind: 'nip99_classified',
    eventId: ev.id!,
    pubkey: ev.pubkey!,
    createdAt: ev.created_at!,
    title: normalized.title,
    summary: normalized.summary,
    description: normalized.markdown,
    images: normalized.images ?? [],
    tags: normalized.tags ?? [],
    category: normalized.category,
    priceSats,
    currency,
    status: normalized.status,
  };
}

