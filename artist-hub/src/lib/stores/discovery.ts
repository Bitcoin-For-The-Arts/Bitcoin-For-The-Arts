import type { NDKSubscription } from '@nostr-dev-kit/ndk';
import { derived, get, writable } from 'svelte/store';
import { ensureNdk } from '$lib/stores/ndk';
import { NOSTR_KINDS } from '$lib/nostr/constants';
import type { Listing } from '$lib/nostr/types';
import { eventToListing } from '$lib/nostr/parse';
import { fetchProfileFor } from '$lib/stores/profiles';

export const discoveryListings = writable<Listing[]>([]);
export const discoveryError = writable<string | null>(null);
export const discoveryLoading = writable<boolean>(false);

export const discoveryQuery = writable<string>('');
export const discoveryTags = writable<string[]>([]);
export const discoveryCategory = writable<string>('');
export const discoveryKinds = writable<Array<Listing['kind']>>(['nip15_product', 'nip99_classified']);

export const filteredListings = derived(
  [discoveryListings, discoveryQuery, discoveryTags, discoveryCategory, discoveryKinds],
  ([$listings, $q, $tags, $cat, $kinds]) => {
    const q = $q.trim().toLowerCase();
    const tags = $tags.map((t) => t.replace(/^#/, '').toLowerCase()).filter(Boolean);
    const cat = $cat.trim().toLowerCase();

    return $listings.filter((l) => {
      if ($kinds.length && !$kinds.includes(l.kind)) return false;
      if (cat && (l.category || '').toLowerCase() !== cat) return false;
      if (tags.length) {
        const ltags = (l.tags || []).map((t) => t.toLowerCase());
        if (!tags.every((t) => ltags.includes(t))) return false;
      }
      if (!q) return true;
      const hay = `${l.title} ${l.summary ?? ''} ${l.description ?? ''} ${(l.tags || []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  },
);

let sub: NDKSubscription | null = null;

export async function startDiscovery(): Promise<void> {
  if (sub) return;
  discoveryError.set(null);
  discoveryLoading.set(true);
  const ndk = await ensureNdk();

  const s = ndk.subscribe(
    {
      kinds: [NOSTR_KINDS.nip15_product, NOSTR_KINDS.nip99_classified],
      limit: 200,
    },
    { closeOnEose: false },
  );
  sub = s;

  s.on('event', (ev) => {
    const listing = eventToListing(ev as any);
    if (!listing) return;

    discoveryListings.update((prev) => {
      if (prev.some((p) => p.eventId === listing.eventId)) return prev;
      const next = [listing, ...prev];
      next.sort((a, b) => b.createdAt - a.createdAt);
      return next.slice(0, 400);
    });

    void fetchProfileFor(listing.pubkey);
  });

  s.on('eose', () => discoveryLoading.set(false));
}

export function stopDiscovery(): void {
  if (!sub) return;
  try {
    sub.stop();
  } finally {
    sub = null;
  }
}

export function setQuickTag(tag: string): void {
  const clean = tag.replace(/^#/, '').trim();
  if (!clean) return;
  const current = get(discoveryTags);
  if (current.map((t) => t.toLowerCase()).includes(clean.toLowerCase())) return;
  discoveryTags.set([clean, ...current].slice(0, 6));
}

