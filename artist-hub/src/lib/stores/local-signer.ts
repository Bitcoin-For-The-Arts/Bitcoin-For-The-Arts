import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import { getPublicKey, nip19 } from 'nostr-tools';

const STORAGE_LOCAL = 'bfta:local-nsec';
const STORAGE_SESSION = 'bfta:session-nsec';

export const localNsec = writable<string | null>(null);
export const hasLocalSigner = derived(localNsec, ($nsec) => Boolean($nsec));

export function initLocalSignerFromStorage(): void {
  if (!browser) return;

  const nsec = localStorage.getItem(STORAGE_LOCAL) || sessionStorage.getItem(STORAGE_SESSION);
  if (nsec && typeof nsec === 'string') localNsec.set(nsec);
}

export function setLocalSigner(nsec: string, opts?: { remember?: boolean }): void {
  const remember = Boolean(opts?.remember);
  localNsec.set(nsec);

  if (!browser) return;

  // Keep only one copy around, depending on user choice.
  localStorage.removeItem(STORAGE_LOCAL);
  sessionStorage.removeItem(STORAGE_SESSION);

  if (remember) localStorage.setItem(STORAGE_LOCAL, nsec);
  else sessionStorage.setItem(STORAGE_SESSION, nsec);
}

export function clearLocalSigner(): void {
  localNsec.set(null);
  if (!browser) return;
  localStorage.removeItem(STORAGE_LOCAL);
  sessionStorage.removeItem(STORAGE_SESSION);
}

export function getLocalSecretKey(): Uint8Array | null {
  const nsec = get(localNsec);
  if (!nsec) return null;
  try {
    const decoded = nip19.decode(nsec);
    if (decoded.type !== 'nsec') return null;
    return decoded.data as Uint8Array;
  } catch {
    return null;
  }
}

export function getLocalPubkeyHex(): string | null {
  const sk = getLocalSecretKey();
  if (!sk) return null;
  try {
    return getPublicKey(sk);
  } catch {
    return null;
  }
}

