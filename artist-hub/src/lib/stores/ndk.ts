import { browser } from '$app/environment';
import NDK from '@nostr-dev-kit/ndk';
import { get, writable } from 'svelte/store';
import { normalizeRelayUrls, relayUrls } from '$lib/stores/settings';

export type NdkStatus = 'idle' | 'connecting' | 'connected' | 'error';

export const ndk = writable<NDK | null>(null);
export const ndkStatus = writable<NdkStatus>('idle');
export const ndkError = writable<string | null>(null);

let instance: NDK | null = null;
let connectPromise: Promise<NDK> | null = null;

export async function ensureNdk(): Promise<NDK> {
  if (!browser) throw new Error('Nostr client can only run in the browser');

  if (instance) {
    const connected = instance.pool?.connectedRelays?.()?.length ?? 0;
    if (connected > 0) return instance;
  }

  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    ndkStatus.set('connecting');
    ndkError.set(null);

    const urls = normalizeRelayUrls(get(relayUrls));
    if (!urls.length) {
      ndkStatus.set('error');
      ndkError.set('No valid relay URLs configured.');
      throw new Error('No valid relay URLs configured.');
    }

    if (instance) {
      try { instance.pool?.removeAll?.(); } catch { /* ignore */ }
    }

    const client = new NDK({ explicitRelayUrls: urls });

    try {
      await client.connect(6000);
    } catch (err) {
      console.warn('[BFTA] NDK connect() rejected, checking partial connectivity:', err);
    }

    const connected = client.pool?.connectedRelays?.()?.length ?? 0;
    if (connected > 0) {
      instance = client;
      ndk.set(client);
      ndkStatus.set('connected');
      connectPromise = null;
      return client;
    }

    console.warn('[BFTA] No relays connected after initial attempt, retrying with longer timeout...');
    try {
      await client.connect(12000);
    } catch {
      /* ignore */
    }

    const retryConnected = client.pool?.connectedRelays?.()?.length ?? 0;
    if (retryConnected > 0) {
      instance = client;
      ndk.set(client);
      ndkStatus.set('connected');
      connectPromise = null;
      return client;
    }

    const msg = `Could not connect to any relay. Tried: ${urls.join(', ')}`;
    ndkError.set(msg);
    ndkStatus.set('error');
    connectPromise = null;
    throw new Error(msg);
  })();

  return connectPromise;
}

export async function reconnectNdk(): Promise<NDK> {
  instance = null;
  ndk.set(null);
  connectPromise = null;
  return ensureNdk();
}
