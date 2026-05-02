import type NDK from '@nostr-dev-kit/ndk';

export type CollectResult<T = any> = {
  events: T[];
  timedOut: boolean;
  eose: boolean;
  error?: string;
};

/**
 * Collect events from a subscription, but never hang forever.
 * If the timeout hits, the subscription is stopped and partial events are returned.
 */
export async function collectEventsWithDeadline(
  ndk: NDK,
  filter: any,
  opts?: { timeoutMs?: number; maxEvents?: number },
): Promise<CollectResult> {
  const timeoutMs = Math.max(1200, Math.min(20_000, opts?.timeoutMs ?? 10_000));
  const maxEvents = Math.max(50, Math.min(2000, opts?.maxEvents ?? (filter?.limit ? Number(filter.limit) : 500)));

  const events: any[] = [];
  let timedOut = false;
  let eose = false;
  let error: string | undefined;

  return await new Promise<CollectResult>((resolve) => {
    let sub: any = null;
    let done = false;
    let t: ReturnType<typeof setTimeout> | null = null;
    const finish = () => {
      if (done) return;
      done = true;
      if (t) clearTimeout(t);
      try {
        sub?.stop();
      } catch {
        // ignore
      }
      resolve({ events, timedOut, eose, error });
    };

    t = setTimeout(() => {
      timedOut = true;
      finish();
    }, timeoutMs);

    try {
      sub = ndk.subscribe(filter, { closeOnEose: true });
      sub.on('event', (ev: any) => {
        if (done) return;
        events.push(ev);
        if (events.length >= maxEvents) {
          finish();
        }
      });
      sub.on('eose', () => {
        eose = true;
        finish();
      });
      sub.on('error', (e: any) => {
        error = e instanceof Error ? e.message : String(e);
        finish();
      });
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      finish();
    }
  });
}

