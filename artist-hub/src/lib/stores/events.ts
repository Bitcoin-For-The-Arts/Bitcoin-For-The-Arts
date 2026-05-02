import type { NDKSubscription } from '@nostr-dev-kit/ndk';
import { writable } from 'svelte/store';
import { ensureNdk } from '$lib/stores/ndk';
import { NOSTR_KINDS } from '$lib/nostr/constants';
import type { HubEvent } from '$lib/nostr/events';
import { parseHubEvent } from '$lib/nostr/events';
import { fetchProfileFor } from '$lib/stores/profiles';

export const hubEvents = writable<HubEvent[]>([]);
export const hubEventsLoading = writable<boolean>(false);
export const hubEventsError = writable<string | null>(null);

let sub: NDKSubscription | null = null;

export async function startHubEvents(): Promise<void> {
  if (sub) return;
  hubEventsError.set(null);
  hubEventsLoading.set(true);

  const ndk = await ensureNdk();
  const s = ndk.subscribe(
    {
      kinds: [NOSTR_KINDS.nip99_classified],
      '#t': ['event', 'workshop', 'meetup', 'exhibition', 'residency'],
      limit: 200,
    } as any,
    { closeOnEose: false },
  );
  sub = s;

  s.on('event', (ev) => {
    const parsed = parseHubEvent(ev as any);
    if (!parsed) return;
    hubEvents.update((prev) => {
      const next = [parsed, ...prev.filter((x) => x.eventId !== parsed.eventId)];
      next.sort((a, b) => (b.start ?? b.createdAt) - (a.start ?? a.createdAt));
      return next.slice(0, 300);
    });
    void fetchProfileFor(parsed.pubkey);
  });
  s.on('eose', () => hubEventsLoading.set(false));
}

export function stopHubEvents(): void {
  if (!sub) return;
  try {
    sub.stop();
  } finally {
    sub = null;
  }
}

