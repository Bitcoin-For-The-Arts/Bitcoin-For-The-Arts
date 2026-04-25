import type { NDKSubscription } from '@nostr-dev-kit/ndk';
import { writable } from 'svelte/store';
import { ensureNdk } from '$lib/stores/ndk';
import { NOSTR_KINDS } from '$lib/nostr/constants';
import type { ZapChallenge } from '$lib/nostr/challenges';
import { parseZapChallengeEvent } from '$lib/nostr/challenges';
import { fetchProfileFor } from '$lib/stores/profiles';

export const zapChallenges = writable<ZapChallenge[]>([]);
export const zapChallengesLoading = writable<boolean>(false);
export const zapChallengesError = writable<string | null>(null);

let sub: NDKSubscription | null = null;

export async function startZapChallenges(): Promise<void> {
  if (sub) return;
  zapChallengesError.set(null);
  zapChallengesLoading.set(true);

  const ndk = await ensureNdk();
  const s = ndk.subscribe(
    { kinds: [NOSTR_KINDS.bfta_zap_challenge], limit: 200 },
    { closeOnEose: false },
  );
  sub = s;

  s.on('event', (ev) => {
    const parsed = parseZapChallengeEvent(ev as any);
    if (!parsed) return;
    zapChallenges.update((prev) => {
      const next = [parsed, ...prev.filter((x) => x.address !== parsed.address)].sort((a, b) => b.content.startsAt - a.content.startsAt);
      return next.slice(0, 300);
    });
    void fetchProfileFor(parsed.pubkey);
    void fetchProfileFor(parsed.content.targetPubkey);
  });
  s.on('eose', () => zapChallengesLoading.set(false));
}

export function stopZapChallenges(): void {
  if (!sub) return;
  try {
    sub.stop();
  } finally {
    sub = null;
  }
}

