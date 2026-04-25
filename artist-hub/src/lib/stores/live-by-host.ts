import { derived } from 'svelte/store';
import { liveStreams } from '$lib/stores/live-streams';
import type { LiveEvent30311 } from '$lib/nostr/nip53';

export const liveByHostPubkey = derived(liveStreams, ($liveStreams) => {
  const best: Record<string, LiveEvent30311> = {};
  for (const s of $liveStreams || []) {
    const host = s.hostPubkey;
    if (!host) continue;
    const cur = best[host];
    if (
      !cur ||
      s.currentParticipants > cur.currentParticipants ||
      (s.currentParticipants === cur.currentParticipants && s.createdAt > cur.createdAt)
    ) {
      best[host] = s;
    }
  }
  return best;
});

