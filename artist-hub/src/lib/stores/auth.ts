import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import { getPublicKey, nip19 } from 'nostr-tools';
import { ensureNdk } from '$lib/stores/ndk';
import { signWithNip07, publishSignedEvent } from '$lib/nostr/pool';
import { clearLocalSigner, getLocalPubkeyHex, initLocalSignerFromStorage, setLocalSigner } from '$lib/stores/local-signer';

export type ArtistProfile = {
  name?: string;
  display_name?: string;
  about?: string;
  picture?: string;
  banner?: string;
  website?: string;
  // Non-standard, used for UI (optional)
  website_icon?: string;
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
export const authMode = writable<'none' | 'nip07' | 'local'>('none');
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

const STORAGE_NIP07_PUBKEY = 'bfta:nip07-pubkey';

async function fetchMyProfile(pk: string): Promise<void> {
  try {
    const ndk = await ensureNdk();
    const user = ndk.getUser({ pubkey: pk });
    await user.fetchProfile();
    profile.set((user.profile as unknown as ArtistProfile) || null);
  } catch {
    // ignore
  }
}

export async function refreshMyProfile(): Promise<void> {
  const pk = get(pubkey);
  if (!pk) return;
  await fetchMyProfile(pk);
}

if (browser) {
  initLocalSignerFromStorage();
  const pk = getLocalPubkeyHex();
  if (pk) {
    pubkey.set(pk);
    authMode.set('local');
    void fetchMyProfile(pk);
  } else {
    // Best-effort: restore previous NIP-07 pubkey so the UI doesn't "disconnect" on refresh.
    // We still may need to re-authorize signing when the user performs an action.
    try {
      const saved = (localStorage.getItem(STORAGE_NIP07_PUBKEY) || '').trim();
      if (saved && /^[0-9a-f]{64}$/i.test(saved) && window.nostr?.getPublicKey) {
        pubkey.set(saved.toLowerCase());
        authMode.set('nip07');
        void fetchMyProfile(saved.toLowerCase());
        // Verify with extension in background (may prompt depending on wallet settings).
        void window.nostr
          .getPublicKey()
          .then((realPk) => {
            if (typeof realPk === 'string' && /^[0-9a-f]{64}$/i.test(realPk)) {
              const norm = realPk.toLowerCase();
              pubkey.set(norm);
              authMode.set('nip07');
              localStorage.setItem(STORAGE_NIP07_PUBKEY, norm);
              void fetchMyProfile(norm);
            }
          })
          .catch(() => {
            // ignore
          });
      }
    } catch {
      // ignore
    }
  }
}

export async function connectNostr(): Promise<void> {
  if (!browser) return;
  authError.set(null);

  if (!window.nostr?.getPublicKey) {
    authError.set('No NIP-07 Nostr extension found. Install Alby/nos2x, or use an in-app key from onboarding.');
    return;
  }

  try {
    clearLocalSigner();
    const pk = await window.nostr.getPublicKey();
    pubkey.set(pk);
    authMode.set('nip07');
    try {
      localStorage.setItem(STORAGE_NIP07_PUBKEY, pk);
    } catch {
      // ignore
    }

    // Fetch current metadata (kind:0) from relays (non-fatal)
    await fetchMyProfile(pk);
  } catch (e) {
    authError.set(e instanceof Error ? e.message : String(e));
  }
}

export async function connectWithNsec(nsec: string, opts?: { remember?: boolean }): Promise<void> {
  if (!browser) return;
  authError.set(null);
  const trimmed = (nsec || '').trim();
  if (!trimmed) {
    authError.set('Missing nsec.');
    throw new Error('Missing nsec.');
  }

  try {
    const decoded = nip19.decode(trimmed);
    if (decoded.type !== 'nsec') throw new Error('Not an nsec.');
    const sk = decoded.data as Uint8Array;
    const pk = getPublicKey(sk);

    setLocalSigner(trimmed, { remember: Boolean(opts?.remember) });
    pubkey.set(pk);
    authMode.set('local');
    await fetchMyProfile(pk);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    authError.set(msg);
    throw new Error(msg);
  }
}

export function disconnectNostr(): void {
  pubkey.set(null);
  profile.set(null);
  authError.set(null);
  authMode.set('none');
  clearLocalSigner();
  if (browser) {
    try {
      localStorage.removeItem(STORAGE_NIP07_PUBKEY);
    } catch {
      // ignore
    }
  }
}

export async function publishProfile(next: ArtistProfile): Promise<string | null> {
  const pk = get(pubkey);
  if (!pk) {
    authError.set('Connect a Nostr signer (or create an in-app key) first.');
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

