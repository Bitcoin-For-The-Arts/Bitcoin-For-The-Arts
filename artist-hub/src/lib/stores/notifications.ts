import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import { ensureNdk } from '$lib/stores/ndk';
import { NOSTR_KINDS } from '$lib/nostr/constants';
import { pubkey as myPubkey } from '$lib/stores/auth';
import { fetchProfileFor } from '$lib/stores/profiles';
import { parseZapReceipt } from '$lib/nostr/zap-receipts';
import { npubFor } from '$lib/nostr/helpers';

export type NotificationType = 'like' | 'zap' | 'repost' | 'mention' | 'reply' | 'follow' | 'dm' | 'invite';

export type NotificationItem = {
  id: string;
  type: NotificationType;
  createdAt: number; // unix seconds
  authorPubkey: string;
  summary: string;
  // A best-effort link target within the hub.
  href: string;
  // Raw event (useful later)
  ev: any;
};

function lastSeenKey(pk: string) {
  return `bfta:artist-hub:notifs:lastSeen:${pk}`;
}

function loadLastSeen(pk: string): number {
  if (!browser) return 0;
  try {
    const raw = localStorage.getItem(lastSeenKey(pk));
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  } catch {
    return 0;
  }
}

function persistLastSeen(pk: string, ts: number) {
  if (!browser) return;
  try {
    localStorage.setItem(lastSeenKey(pk), String(Math.max(0, Math.floor(ts))));
  } catch {
    // ignore
  }
}

export const notifications = writable<NotificationItem[]>([]);
export const lastSeenAt = writable<number>(0);

export const unreadCount = derived([notifications, lastSeenAt], ([$n, $seen]) => {
  const seen = Math.max(0, Math.floor($seen || 0));
  return $n.filter((x) => (x.createdAt || 0) > seen).length;
});

let stop: (() => void) | null = null;
let activePk: string | null = null;
const byId = new Map<string, NotificationItem>();

function upsert(n: NotificationItem) {
  byId.set(n.id, n);
  const out = Array.from(byId.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 500);
  notifications.set(out);
}

function isLikeReactionContent(content: unknown): boolean {
  const c = typeof content === 'string' ? content.trim() : '';
  if (!c) return false;
  return c !== '-';
}

function noteHrefFor(type: NotificationType, authorPk: string): string {
  if (type === 'follow') return `/profile/${npubFor(authorPk)}`;
  if (type === 'dm') return `/messages`;
  // Most activity is best surfaced via Pulse for now.
  return `/pulse`;
}

function tagValue(tags: string[][], name: string): string | undefined {
  return tags.find((t) => t[0] === name)?.[1];
}

function toNotification(ev: any, me: string): NotificationItem | null {
  if (!ev?.id || !ev?.created_at || !ev?.pubkey) return null;
  if (ev.pubkey === me) return null;

  const tags = (ev.tags as string[][]) || [];
  const createdAt = Number(ev.created_at) || 0;

  if (ev.kind === NOSTR_KINDS.reaction) {
    if (!isLikeReactionContent(ev.content)) return null;
    return {
      id: ev.id,
      type: 'like',
      createdAt,
      authorPubkey: ev.pubkey,
      summary: 'liked your post',
      href: noteHrefFor('like', ev.pubkey),
      ev,
    };
  }

  if (ev.kind === NOSTR_KINDS.nip57_zap_receipt) {
    const parsed = parseZapReceipt(ev);
    if (!parsed) return null;
    if (parsed.recipientPubkey !== me) return null;
    const sats = parsed.amountSats ?? 0;
    const emoji = (parsed.comment || '').trim();
    const extra = emoji && emoji.length <= 12 ? ` ${emoji}` : '';
    return {
      id: ev.id,
      type: 'zap',
      createdAt,
      authorPubkey: parsed.senderPubkey || ev.pubkey,
      summary: `zapped you ${sats.toLocaleString()} sats${extra}`,
      href: noteHrefFor('zap', parsed.senderPubkey || ev.pubkey),
      ev,
    };
  }

  if (ev.kind === NOSTR_KINDS.repost) {
    return {
      id: ev.id,
      type: 'repost',
      createdAt,
      authorPubkey: ev.pubkey,
      summary: 'reposted your note',
      href: noteHrefFor('repost', ev.pubkey),
      ev,
    };
  }

  if (ev.kind === NOSTR_KINDS.note) {
    // Follow-pack invite (kind:1 with tags)
    const isInvite = tags.some((t) => t[0] === 't' && t[1] === 'follow-pack-invite');
    if (isInvite) {
      const d = tagValue(tags, 'd') || '';
      const href = d ? `/d/${d}?p=${ev.pubkey}` : '/pulse';
      return {
        id: ev.id,
        type: 'invite',
        createdAt,
        authorPubkey: ev.pubkey,
        summary: 'invited you to a follow pack',
        href,
        ev,
      };
    }
    const isReply = tags.some((t) => t[0] === 'e');
    return {
      id: ev.id,
      type: isReply ? 'reply' : 'mention',
      createdAt,
      authorPubkey: ev.pubkey,
      summary: isReply ? 'replied to you' : 'mentioned you',
      href: noteHrefFor(isReply ? 'reply' : 'mention', ev.pubkey),
      ev,
    };
  }

  if (ev.kind === NOSTR_KINDS.dm) {
    return {
      id: ev.id,
      type: 'dm',
      createdAt,
      authorPubkey: ev.pubkey,
      summary: 'sent you a message',
      href: noteHrefFor('dm', ev.pubkey),
      ev,
    };
  }

  if (ev.kind === NOSTR_KINDS.contacts) {
    // Kind 3 events are replaceable; each event implies the author follows some set.
    // If we received it via '#p': [me], treat as follow.
    return {
      id: ev.id,
      type: 'follow',
      createdAt,
      authorPubkey: ev.pubkey,
      summary: 'followed you',
      href: noteHrefFor('follow', ev.pubkey),
      ev,
    };
  }

  return null;
}

async function startFor(pk: string) {
  const me = pk.toLowerCase();
  activePk = me;
  lastSeenAt.set(loadLastSeen(me));
  notifications.set([]);
  byId.clear();

  const ndk = await ensureNdk();

  // Subscribe to activity that should show up as notifications.
  const subs: any[] = [];
  const make = (filter: any) => {
    const sub = ndk.subscribe(filter, { closeOnEose: false });
    sub.on('event', (ev: any) => {
      if (!activePk || activePk !== me) return;
      const n = toNotification(ev, me);
      if (!n) return;
      upsert(n);
      void fetchProfileFor(n.authorPubkey);
    });
    subs.push(sub);
  };

  // Likes on your notes / events (your pubkey is tagged as 'p').
  make({ kinds: [NOSTR_KINDS.reaction], '#p': [me], limit: 200 });

  // Zaps to you (receipts tag recipient in 'p').
  make({ kinds: [NOSTR_KINDS.nip57_zap_receipt], '#p': [me], limit: 400 });

  // Reposts of your notes (authors tag original pubkey in 'p').
  make({ kinds: [NOSTR_KINDS.repost], '#p': [me], limit: 250 });

  // Mentions / replies to you (our own publishComment includes a 'p' tag for root pubkey).
  make({ kinds: [NOSTR_KINDS.note], '#p': [me], limit: 400 });

  // New DMs to you.
  make({ kinds: [NOSTR_KINDS.dm], '#p': [me], limit: 200 });

  // Follows (contacts lists that include you).
  make({ kinds: [NOSTR_KINDS.contacts], '#p': [me], limit: 250 });

  stop = () => subs.forEach((s) => s.stop());
}

function stopAll() {
  if (stop) stop();
  stop = null;
  activePk = null;
  notifications.set([]);
  byId.clear();
  lastSeenAt.set(0);
}

export function markAllRead(): void {
  const me = get(myPubkey);
  if (!me) return;
  const now = Math.floor(Date.now() / 1000);
  lastSeenAt.set(now);
  persistLastSeen(me, now);
}

export function startNotifications(): void {
  // Backwards-compatible explicit start; current implementation auto-starts on pubkey change.
  const pk = get(myPubkey);
  if (pk) void startFor(pk);
}

// Auto-start/stop based on auth state.
if (browser) {
  myPubkey.subscribe((pk) => {
    const norm = (pk || '').trim().toLowerCase();
    if (!norm) {
      stopAll();
      return;
    }
    if (activePk === norm) return;
    stopAll();
    void startFor(norm);
  });
}

