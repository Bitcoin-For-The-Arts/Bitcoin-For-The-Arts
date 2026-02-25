import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import { nip19 } from 'nostr-tools';
import { ensureNdk } from '$lib/stores/ndk';
import { signWithNip07, publishSignedEvent } from '$lib/nostr/pool';

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

  try {
    const pk = await window.nostr.getPublicKey();
    pubkey.set(pk);

    // Fetch current metadata (kind:0) from relays (non-fatal)
    try {
      const ndk = await ensureNdk();
      const user = ndk.getUser({ pubkey: pk });
      await user.fetchProfile();
      profile.set((user.profile as unknown as ArtistProfile) || null);
    } catch {
      // ignore
    }
  } catch (e) {
    authError.set(e instanceof Error ? e.message : String(e));
  }
}

export function disconnectNostr(): void {
  pubkey.set(null);
  profile.set(null);
  authError.set(null);
}

export async function publishProfile(next: ArtistProfile): Promise<string | null> {
  const pk = get(pubkey);
  if (!pk) {
    authError.set('Connect your Nostr signer first.');
    return null;
  }

  try {
    const unsigned = {
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      content: JSON.stringify(next),
      tags: [],
      pubkey: pk,
    };
    const signed = await signWithNip07(unsigned as any);
    await publishSignedEvent(signed as any);
    profile.set(next);
    return signed.id;
  } catch (e) {
    authError.set(e instanceof Error ? e.message : String(e));
    return null;
  }
}

