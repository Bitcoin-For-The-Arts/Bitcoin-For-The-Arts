import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { SimplePool, type Event as NostrEvent } from 'nostr-tools';
import { relayUrls } from '$lib/stores/settings';

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
  if (!window.nostr?.signEvent) throw new Error('No NIP-07 signer available (window.nostr.signEvent missing).');
  const signed = await window.nostr.signEvent(unsigned as any);
  if (!signed?.id || !signed?.sig) throw new Error('Signer did not return a valid signed event.');
  return signed as NostrEvent;
}

export async function publishSignedEvent(ev: NostrEvent): Promise<void> {
  const relays = getRelaysForPublish();
  if (!relays.length) throw new Error('No relays configured.');
  const p = getPool().publish(relays, ev);
  // publish returns a set of promises (one per relay)
  await Promise.allSettled(Array.from(p));
}

