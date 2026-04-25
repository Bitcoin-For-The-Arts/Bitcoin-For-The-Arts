import type { NDKSubscription } from '@nostr-dev-kit/ndk';
import { derived, get, writable } from 'svelte/store';
import { ensureNdk } from '$lib/stores/ndk';
import { BFTA_DEFAULT_FEATURED_SET_D, NOSTR_KINDS } from '$lib/nostr/constants';
import { bftaAdminNpub } from '$lib/stores/settings';
import { nip19 } from 'nostr-tools';
import { fetchProfileFor } from '$lib/stores/profiles';

export const featuredPubkeys = writable<string[]>([]);
export const featuredAddresses = writable<string[]>([]);
export const featuredError = writable<string | null>(null);

export const featuredNpubs = derived(featuredPubkeys, ($pks) => $pks.map((pk) => nip19.npubEncode(pk)));

let sub: NDKSubscription | null = null;

export async function startFeatured(): Promise<void> {
  if (sub) return;
  featuredError.set(null);

  const adminNpub = get(bftaAdminNpub).trim();
  if (!adminNpub) {
    featuredError.set('BFTA admin npub is not configured for featured curation.');
    return;
  }

  let adminPubkey: string;
  try {
    const decoded = nip19.decode(adminNpub);
    if (decoded.type !== 'npub') throw new Error('Not an npub');
    adminPubkey = decoded.data as string;
  } catch (e) {
    featuredError.set(`Invalid admin npub: ${e instanceof Error ? e.message : String(e)}`);
    return;
  }

  const ndk = await ensureNdk();
  const s = ndk.subscribe(
    {
      kinds: [NOSTR_KINDS.nip51_curated_set],
      authors: [adminPubkey],
      '#d': [BFTA_DEFAULT_FEATURED_SET_D],
      limit: 5,
    },
    { closeOnEose: false },
  );
  sub = s;

  s.on('event', (ev) => {
    const pks = (ev.tags as any as string[][])
      .filter((t) => t[0] === 'p' && typeof t[1] === 'string')
      .map((t) => t[1]);
    const addrs = (ev.tags as any as string[][])
      .filter((t) => t[0] === 'a' && typeof t[1] === 'string')
      .map((t) => t[1]);

    featuredPubkeys.set([...new Set(pks)]);
    featuredAddresses.set([...new Set(addrs)]);
    for (const pk of pks) void fetchProfileFor(pk);
  });
}

export function stopFeatured(): void {
  if (!sub) return;
  try {
    sub.stop();
  } finally {
    sub = null;
  }
}

