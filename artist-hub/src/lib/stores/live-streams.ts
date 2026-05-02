import { writable } from 'svelte/store';
import { ensureNdk } from '$lib/stores/ndk';
import { fetchProfileFor } from '$lib/stores/profiles';
import { isZapStreamLiveEvent, parseLiveEvent30311, type LiveEvent30311 } from '$lib/nostr/nip53';
import { collectEventsWithDeadline } from '$lib/nostr/collect';

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
      const since = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 7;

      function accept(ev: any): LiveEvent30311 | null {
        const parsed = parseLiveEvent30311(ev as any);
        if (!parsed) return null;
        if (source === 'zapstream' && !isZapStreamLiveEvent((ev.tags as any) as string[][])) return null;
        if (String(parsed.status).toLowerCase() !== 'live') return null;
        return parsed;
      }

      // Backfill first (avoids infinite skeleton if EOSE never fires).
      try {
        const res = await collectEventsWithDeadline(ndk as any, { kinds: [30311], since, limit: 800 } as any, { timeoutMs: 12_000, maxEvents: 800 });
        const evs = res.events;
        const out: LiveEvent30311[] = [];
        for (const ev of Array.from(evs || [])) {
          const parsed = accept(ev as any);
          if (!parsed) continue;
          out.push(parsed);
          void fetchProfileFor(parsed.hostPubkey);
        }
        liveStreams.set(
          out
            .sort((a, b) => b.currentParticipants - a.currentParticipants || b.createdAt - a.createdAt)
            .slice(0, limit),
        );
      } catch {
        // ignore backfill failures
      } finally {
        liveStreamsLoading.set(false);
      }

      // Live subscription for updates.
      const sub = ndk.subscribe({ kinds: [30311], since, limit: 600 } as any, { closeOnEose: false });
      const fallbackTimer = setTimeout(() => liveStreamsLoading.set(false), 1800);

      sub.on('event', (ev) => {
        const parsed = accept(ev as any);
        if (!parsed) return;
        void fetchProfileFor(parsed.hostPubkey);
        liveStreams.update((prev) =>
          [parsed, ...prev.filter((x) => x.eventId !== parsed.eventId)]
            .sort((a, b) => b.currentParticipants - a.currentParticipants || b.createdAt - a.createdAt)
            .slice(0, limit),
        );
      });

      sub.on('eose', () => {
        clearTimeout(fallbackTimer);
        liveStreamsLoading.set(false);
      });

      stop = () => {
        clearTimeout(fallbackTimer);
        sub.stop();
      };
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

