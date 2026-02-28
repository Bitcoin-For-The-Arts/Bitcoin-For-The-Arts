import { browser } from '$app/environment';
import NDK from '@nostr-dev-kit/ndk';
import { get, writable } from 'svelte/store';
import { normalizeRelayUrls, relayUrls } from '$lib/stores/settings';

export type NdkStatus = 'idle' | 'connecting' | 'connected' | 'error';

export const ndk = writable<NDK | null>(null);
export const ndkStatus = writable<NdkStatus>('idle');
export const ndkError = writable<string | null>(null);

let connectPromise: Promise<NDK> | null = null;

type RelayProbe = { url: string; ok: boolean; ms: number; error?: string };

async function probeRelay(url: string, timeoutMs: number): Promise<RelayProbe> {
  const started = Date.now();
  return await new Promise<RelayProbe>((resolve) => {
    let done = false;
    let ws: WebSocket | null = null;

    const finish = (r: RelayProbe) => {
      if (done) return;
      done = true;
      try {
        ws?.close();
      } catch {
        // ignore
      }
      resolve(r);
    };

    const t = setTimeout(() => {
      finish({ url, ok: false, ms: Date.now() - started, error: 'timeout' });
    }, timeoutMs);

    try {
      ws = new WebSocket(url);
      ws.onopen = () => {
        clearTimeout(t);
        finish({ url, ok: true, ms: Date.now() - started });
      };
      ws.onerror = () => {
        clearTimeout(t);
        finish({ url, ok: false, ms: Date.now() - started, error: 'error' });
      };
      ws.onclose = () => {
        // Some relays close quickly on failure; only treat as fail if we never got onopen.
        if (!done) {
          clearTimeout(t);
          finish({ url, ok: false, ms: Date.now() - started, error: 'closed' });
        }
      };
    } catch (e) {
      clearTimeout(t);
      finish({ url, ok: false, ms: Date.now() - started, error: e instanceof Error ? e.message : String(e) });
    }
  });
}

async function probeRelays(urls: string[]): Promise<{ ok: string[]; report: RelayProbe[] }> {
  const list = (urls || []).slice(0, 18);
  const out: RelayProbe[] = [];

  // small concurrency
  const concurrency = 4;
  let idx = 0;
  const workers: Promise<void>[] = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(
      (async () => {
        while (idx < list.length) {
          const cur = list[idx++];
          const r = await probeRelay(cur, 4500);
          out.push(r);
        }
      })(),
    );
  }
  await Promise.all(workers);
  const ok = out.filter((r) => r.ok).sort((a, b) => a.ms - b.ms).map((r) => r.url);
  return { ok, report: out.sort((a, b) => (a.ok === b.ok ? a.ms - b.ms : a.ok ? -1 : 1)) };
}

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

    const urls = normalizeRelayUrls(get(relayUrls));
    if (!urls.length) {
      ndkStatus.set('error');
      ndkError.set('No valid relay URLs configured.');
      throw new Error('No valid relay URLs configured.');
    }

    // Work around NDK connect behaving like all-or-nothing with explicitRelayUrls:
    // probe relays first, then connect using only reachable ones.
    const { ok, report } = await probeRelays(urls);
    const chosen = ok.length ? ok.slice(0, 8) : urls.slice(0, 6);
    if (!chosen.length) {
      const summary = report.map((r) => `${r.ok ? 'OK' : 'FAIL'} ${r.url} (${r.ms}ms${r.error ? ` ${r.error}` : ''})`).join(' | ');
      ndkStatus.set('error');
      ndkError.set(`No relays reachable. ${summary}`);
      throw new Error('No relays reachable.');
    }

    const client = new NDK({ explicitRelayUrls: chosen });

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

