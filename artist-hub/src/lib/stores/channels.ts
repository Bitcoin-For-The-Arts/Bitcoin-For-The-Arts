import type { NDKEvent, NDKSubscription } from '@nostr-dev-kit/ndk';
import { writable } from 'svelte/store';
import { ensureNdk } from '$lib/stores/ndk';

export type Nip28ChannelMeta = {
  id: string; // kind:40 event id
  name: string;
  about?: string;
  picture?: string;
  relays?: string[];
  updatedAt: number; // created_at of latest kind:41 or kind:40
  createdAt: number; // kind:40 created_at
  creator: string; // pubkey
};

export type Nip28Message = {
  id: string;
  channelId: string;
  pubkey: string;
  createdAt: number;
  content: string;
  replyTo?: string;
};

export const channels = writable<Record<string, Nip28ChannelMeta>>({});
export const channelMessages = writable<Record<string, Nip28Message[]>>({});
export const channelParticipants = writable<Record<string, { count: number; last10m: number }>>({});

let subChannels: NDKSubscription | null = null;
let subMeta: NDKSubscription | null = null;
const subMessages = new Map<string, NDKSubscription>();

function parseChannelMeta(ev: NDKEvent): Partial<Nip28ChannelMeta> {
  try {
    const json = JSON.parse(ev.content || '{}');
    return {
      name: String(json?.name || '').trim(),
      about: typeof json?.about === 'string' ? json.about : undefined,
      picture: typeof json?.picture === 'string' ? json.picture : undefined,
      relays: Array.isArray(json?.relays) ? json.relays.filter((r: any) => typeof r === 'string') : undefined,
    };
  } catch {
    return {};
  }
}

export async function startChannels(): Promise<void> {
  if (subChannels) return;
  const ndk = await ensureNdk();

  // kind:40 create channel
  subChannels = ndk.subscribe({ kinds: [40], limit: 100 }, { closeOnEose: false });
  subChannels.on('event', (ev) => {
    const meta = parseChannelMeta(ev as any);
    const id = ev.id!;
    if (!meta.name) meta.name = `Channel ${id.slice(0, 8)}`;
    channels.update((m) => {
      const prev = m[id];
      const createdAt = ev.created_at || Math.floor(Date.now() / 1000);
      const updatedAt = Math.max(prev?.updatedAt ?? 0, createdAt);
      return {
        ...m,
        [id]: {
          id,
          name: meta.name!,
          about: meta.about,
          picture: meta.picture,
          relays: meta.relays,
          updatedAt,
          createdAt: prev?.createdAt ?? createdAt,
          creator: prev?.creator ?? ev.pubkey!,
        },
      };
    });
  });

  // kind:41 set channel metadata (latest per channel)
  subMeta = ndk.subscribe({ kinds: [41], limit: 200 }, { closeOnEose: false });
  subMeta.on('event', (ev) => {
    const tags = (ev.tags as any as string[][]) || [];
    const channelId = tags.find((t) => t[0] === 'e')?.[1];
    if (!channelId) return;
    const meta = parseChannelMeta(ev as any);
    if (!meta.name) return;

    channels.update((m) => {
      const prev = m[channelId];
      const updatedAt = ev.created_at || Math.floor(Date.now() / 1000);
      if (prev && prev.updatedAt > updatedAt) return m;
      return {
        ...m,
        [channelId]: {
          id: channelId,
          name: meta.name!,
          about: meta.about,
          picture: meta.picture,
          relays: meta.relays,
          updatedAt,
          createdAt: prev?.createdAt ?? updatedAt,
          creator: prev?.creator ?? ev.pubkey!,
        },
      };
    });
  });
}

export async function stopChannels(): Promise<void> {
  try {
    subChannels?.stop();
    subMeta?.stop();
  } finally {
    subChannels = null;
    subMeta = null;
  }

  for (const [, s] of subMessages) s.stop();
  subMessages.clear();
}

export async function startChannelMessages(channelId: string): Promise<void> {
  if (!channelId) return;
  if (subMessages.has(channelId)) return;
  const ndk = await ensureNdk();

  const sub = ndk.subscribe(
    { kinds: [42], '#e': [channelId], limit: 200 },
    { closeOnEose: false },
  );
  subMessages.set(channelId, sub);

  sub.on('event', (ev) => {
    const tags = (ev.tags as any as string[][]) || [];
    const replyTo = tags.find((t) => t[0] === 'e' && t[1] !== channelId)?.[1];
    const msg: Nip28Message = {
      id: ev.id!,
      channelId,
      pubkey: ev.pubkey!,
      createdAt: ev.created_at || Math.floor(Date.now() / 1000),
      content: ev.content || '',
      replyTo,
    };

    let computedNext: Nip28Message[] | null = null;
    channelMessages.update((m) => {
      const prev = m[channelId] ?? [];
      if (prev.some((x) => x.id === msg.id)) return m;
      const next = [...prev, msg].sort((a, b) => a.createdAt - b.createdAt).slice(-400);
      computedNext = next;
      return { ...m, [channelId]: next };
    });

    const msgs = computedNext;
    if (msgs) {
      const uniq = new Set(msgs.map((x) => x.pubkey));
      const now = Math.floor(Date.now() / 1000);
      const uniq10m = new Set(msgs.filter((x) => now - x.createdAt < 600).map((x) => x.pubkey));
      channelParticipants.update((p) => ({
        ...p,
        [channelId]: { count: uniq.size, last10m: uniq10m.size },
      }));
    }
  });
}

export function stopChannelMessages(channelId: string): void {
  const s = subMessages.get(channelId);
  if (!s) return;
  s.stop();
  subMessages.delete(channelId);
}

