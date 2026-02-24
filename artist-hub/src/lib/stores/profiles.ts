import type { NDKUserProfile } from '@nostr-dev-kit/ndk';
import { writable } from 'svelte/store';
import { ensureNdk } from '$lib/stores/ndk';
import type { ArtistProfile } from '$lib/stores/auth';

export const profileByPubkey = writable<Record<string, ArtistProfile>>({});

const inflight = new Map<string, Promise<ArtistProfile | null>>();

export async function fetchProfileFor(pubkey: string): Promise<ArtistProfile | null> {
  if (!pubkey) return null;
  if (inflight.has(pubkey)) return inflight.get(pubkey)!;

  const p = (async () => {
    const ndk = await ensureNdk();
    const user = ndk.getUser({ pubkey });
    await user.fetchProfile();
    const prof = (user.profile as unknown as NDKUserProfile | null) ?? null;
    if (prof) {
      profileByPubkey.update((m) => ({ ...m, [pubkey]: prof as unknown as ArtistProfile }));
      return prof as unknown as ArtistProfile;
    }
    return null;
  })().finally(() => inflight.delete(pubkey));

  inflight.set(pubkey, p);
  return p;
}

