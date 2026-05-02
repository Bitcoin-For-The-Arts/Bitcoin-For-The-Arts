import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { SimplePool, type Event as NostrEvent, finalizeEvent, getPublicKey, nip19 } from 'nostr-tools';
import { relayUrls } from '$lib/stores/settings';
import { localNsec } from '$lib/stores/local-signer';

let pool: SimplePool | null = null;

export function getPool(): SimplePool {
  if (!pool) pool = new SimplePool();
  return pool;
}

export function getRelaysForPublish(): string[] {
  const urls = get(relayUrls);
  return urls.length ? urls : [];
}

export async function signWithNip07(unsigned: Omit<NostrEvent, 'id' | 'sig'>): Promise<NostrEvent> {
  if (!browser) throw new Error('Signing requires a browser');

  // Prefer NIP-07 if present.
  if (window.nostr?.signEvent) {
    const signed = await window.nostr.signEvent(unsigned as any);
    if (!signed?.id || !signed?.sig) throw new Error('Signer did not return a valid signed event.');
    return signed as NostrEvent;
  }

  // Fallback: local in-app key (nsec) signer.
  const nsec = get(localNsec);
  if (nsec) {
    const decoded = nip19.decode(nsec);
    if (decoded.type !== 'nsec') throw new Error('Invalid local signer key.');
    const sk = decoded.data as Uint8Array;
    const pk = getPublicKey(sk);
    const signed = finalizeEvent({ ...(unsigned as any), pubkey: pk }, sk);
    if (!signed?.id || !(signed as any)?.sig) throw new Error('Local signer failed to sign event.');
    return signed as NostrEvent;
  }

  throw new Error('No signer available. Install Alby/nos2x (NIP-07) or create an in-app key from onboarding.');
}

export async function publishSignedEvent(ev: NostrEvent): Promise<void> {
  const relays = getRelaysForPublish();
  if (!relays.length) throw new Error('No relays configured.');
  const p = getPool().publish(relays, ev);
  // publish returns a set of promises (one per relay)
  await Promise.allSettled(Array.from(p));
}

