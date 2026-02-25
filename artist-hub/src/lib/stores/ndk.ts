import { browser } from '$app/environment';
import NDK from '@nostr-dev-kit/ndk';
import { get, writable } from 'svelte/store';
import { relayUrls } from '$lib/stores/settings';

export type NdkStatus = 'idle' | 'connecting' | 'connected' | 'error';

export const ndk = writable<NDK | null>(null);
export const ndkStatus = writable<NdkStatus>('idle');
export const ndkError = writable<string | null>(null);

let connectPromise: Promise<NDK> | null = null;

export async function ensureNdk(): Promise<NDK> {
  if (!browser) throw new Error('Nostr client can only run in the browser');

  const existing = get(ndk);
  if (existing) {
    return existing;
  }

  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    ndkStatus.set('connecting');
    ndkError.set(null);

    const urls = get(relayUrls);
    const client = new NDK({
      explicitRelayUrls: urls,
    });

    try {
      await client.connect();
      ndk.set(client);
      ndkStatus.set('connected');
      return client;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      ndkError.set(msg);
      ndkStatus.set('error');
      throw err;
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
}

export async function reconnectNdk(): Promise<NDK> {
  ndk.set(null);
  return ensureNdk();
}

