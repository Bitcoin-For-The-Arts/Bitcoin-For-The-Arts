import type { NDKEvent, NDKSubscription } from '@nostr-dev-kit/ndk';
import { writable } from 'svelte/store';
import { ensureNdk } from '$lib/stores/ndk';
import { NOSTR_KINDS } from '$lib/nostr/constants';
import type { Studio } from '$lib/nostr/studios';
import { parseStudioEvent } from '$lib/nostr/studios';
import { fetchProfileFor } from '$lib/stores/profiles';

export const studios = writable<Studio[]>([]);
export const studiosLoading = writable<boolean>(false);
export const studiosError = writable<string | null>(null);

let sub: NDKSubscription | null = null;

export async function startStudios(): Promise<void> {
  if (sub) return;
  studiosError.set(null);
  studiosLoading.set(true);

  const ndk = await ensureNdk();
  const s = ndk.subscribe(
    { kinds: [NOSTR_KINDS.bfta_studio], limit: 200 },
    { closeOnEose: false },
  );
  sub = s;

  s.on('event', (ev) => {
    const studio = parseStudioEvent(ev as any);
    if (!studio) return;
    studios.update((prev) => {
      const next = [studio, ...prev.filter((x) => x.address !== studio.address)].sort((a, b) => b.createdAt - a.createdAt);
      return next.slice(0, 300);
    });
    void fetchProfileFor(studio.pubkey);
  });

  s.on('eose', () => studiosLoading.set(false));
}

export function stopStudios(): void {
  if (!sub) return;
  try {
    sub.stop();
  } finally {
    sub = null;
  }
}

