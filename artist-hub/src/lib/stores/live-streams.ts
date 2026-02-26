import { writable } from 'svelte/store';
import { ensureNdk } from '$lib/stores/ndk';
import { fetchProfileFor } from '$lib/stores/profiles';
import { isZapStreamLiveEvent, parseLiveEvent30311, type LiveEvent30311 } from '$lib/nostr/nip53';

export const liveStreams = writable<LiveEvent30311[]>([]);
export const liveStreamsLoading = writable(false);
export const liveStreamsError = writable<string | null>(null);

let stop: (() => void) | null = null;
let active: { source: 'zapstream' | 'all'; limit: number } | null = null;
let inflight: Promise<void> | null = null;

export async function startLiveStreams(opts?: { source?: 'zapstream' | 'all'; limit?: number }): Promise<void> {
  const source = opts?.source ?? 'zapstream';
  const limit = Math.max(1, Math.min(120, opts?.limit ?? 40));

  if (active && active.source === source && active.limit === limit && stop) return;
  if (inflight && active && active.source === source && active.limit === limit) return inflight;

  active = { source, limit };

  if (stop) stop();
  stop = null;

  liveStreamsLoading.set(true);
  liveStreamsError.set(null);
  liveStreams.set([]);

  inflight = (async () => {
    try {
    const ndk = await ensureNdk();
    const since = Math.floor(Date.now() / 1000) - 60 * 60 * 24;

    const sub = ndk.subscribe({ kinds: [30311], since, limit: 600 } as any, { closeOnEose: false });

    sub.on('event', (ev) => {
      const parsed = parseLiveEvent30311(ev as any);
      if (!parsed) return;
      if (source === 'zapstream' && !isZapStreamLiveEvent((ev.tags as any) as string[][])) return;
      if (String(parsed.status).toLowerCase() !== 'live') return;

      void fetchProfileFor(parsed.hostPubkey);

      liveStreams.update((prev) =>
        [parsed, ...prev.filter((x) => x.eventId !== parsed.eventId)]
          .sort((a, b) => b.currentParticipants - a.currentParticipants || b.createdAt - a.createdAt)
          .slice(0, limit),
      );
    });

    sub.on('eose', () => liveStreamsLoading.set(false));
    stop = () => sub.stop();
    } catch (e) {
      liveStreamsError.set(e instanceof Error ? e.message : String(e));
      liveStreamsLoading.set(false);
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function stopLiveStreams(): void {
  if (stop) stop();
  stop = null;
  active = null;
  inflight = null;
  liveStreamsLoading.set(false);
}

