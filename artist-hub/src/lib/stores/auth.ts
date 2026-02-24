import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import { nip19 } from 'nostr-tools';
import { ensureNdk } from '$lib/stores/ndk';
import { NDKEvent } from '@nostr-dev-kit/ndk';

export type ArtistProfile = {
  name?: string;
  display_name?: string;
  about?: string;
  picture?: string;
  website?: string;
  nip05?: string;
  lud16?: string;
  lud06?: string;

  // Extensions (non-standard but common in kind:0 content)
  skills?: string[];
  hashtags?: string[];
  portfolio?: string[];
  location?: string;
};

export const pubkey = writable<string | null>(null);
export const npub = derived(pubkey, ($pubkey) => {
  if (!$pubkey) return null;
  try {
    return nip19.npubEncode($pubkey);
  } catch {
    return null;
  }
});

export const profile = writable<ArtistProfile | null>(null);
export const authError = writable<string | null>(null);
export const hasNip07 = derived([], () => (browser ? Boolean(window.nostr?.getPublicKey) : false));

export const isAuthed = derived(pubkey, ($pubkey) => Boolean($pubkey));

export async function connectNostr(): Promise<void> {
  if (!browser) return;
  authError.set(null);

  if (!window.nostr?.getPublicKey) {
    authError.set('No NIP-07 Nostr extension found. Install Alby, nos2x, or another Nostr signer.');
    return;
  }

  const ndk = await ensureNdk({ withSigner: true });
  const pk = await window.nostr.getPublicKey();
  pubkey.set(pk);

  // Fetch current metadata (kind:0) from relays
  try {
    const user = ndk.getUser({ pubkey: pk });
    await user.fetchProfile();
    profile.set((user.profile as unknown as ArtistProfile) || null);
  } catch {
    // non-fatal
  }
}

export function disconnectNostr(): void {
  pubkey.set(null);
  profile.set(null);
  authError.set(null);
}

export async function publishProfile(next: ArtistProfile): Promise<NDKEvent | null> {
  const pk = get(pubkey);
  if (!pk) {
    authError.set('Connect your Nostr signer first.');
    return null;
  }

  const ndk = await ensureNdk({ withSigner: true });
  // Use NDKEvent directly to avoid NDKUser mutations
  const ev = new NDKEvent(ndk);
  ev.kind = 0;
  ev.content = JSON.stringify(next);
  await ev.publish();
  profile.set(next);
  return ev;
}

