import type { NDKUserProfile } from '@nostr-dev-kit/ndk';
import { writable } from 'svelte/store';
import { ensureNdk } from '$lib/stores/ndk';
import type { ArtistProfile } from '$lib/stores/auth';

export const profileByPubkey = writable<Record<string, ArtistProfile>>({});

const inflight = new Map<string, Promise<ArtistProfile | null>>();
const attempted = new Set<string>();

const PROFILE_CONCURRENCY = 4;
let profileActive = 0;
type QueueItem = { pubkey: string; resolve: (v: ArtistProfile | null) => void };
const profileQueue: QueueItem[] = [];

function doFetch(pk: string): Promise<ArtistProfile | null> {
  const p = (async () => {
    const ndk = await ensureNdk();
    const user = ndk.getUser({ pubkey: pk });
    await user.fetchProfile();
    const prof = (user.profile as unknown as NDKUserProfile | null) ?? null;
    if (prof) {
      profileByPubkey.update((m) => ({ ...m, [pk]: prof as unknown as ArtistProfile }));
      return prof as unknown as ArtistProfile;
    }
    return null;
  })().finally(() => {
    inflight.delete(pk);
    attempted.add(pk);
    profileActive--;
    drainProfileQueue();
  });
  inflight.set(pk, p);
  return p;
}

function drainProfileQueue() {
  while (profileActive < PROFILE_CONCURRENCY && profileQueue.length > 0) {
    const item = profileQueue.shift()!;
    if (attempted.has(item.pubkey) || inflight.has(item.pubkey)) {
      const existing = inflight.get(item.pubkey);
      item.resolve(existing ? existing : Promise.resolve(null) as any);
      continue;
    }
    profileActive++;
    doFetch(item.pubkey).then(item.resolve, () => item.resolve(null));
  }
}

export async function fetchProfileFor(pubkey: string): Promise<ArtistProfile | null> {
  if (!pubkey) return null;
  if (inflight.has(pubkey)) return inflight.get(pubkey)!;
  if (attempted.has(pubkey)) return null;

  return new Promise<ArtistProfile | null>((resolve) => {
    profileQueue.push({ pubkey, resolve });
    drainProfileQueue();
  });
}

