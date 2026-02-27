import { browser } from '$app/environment';
import { ensureNdk } from '$lib/stores/ndk';
import { NOSTR_KINDS } from '$lib/nostr/constants';
import { publishSignedEvent, signWithNip07 } from '$lib/nostr/pool';

export type ContactsEvent = {
  id?: string;
  pubkey: string;
  created_at: number;
  kind: number;
  content: string;
  tags: string[][];
};

export function followingFromContactsTags(tags: string[][]): Set<string> {
  const out = new Set<string>();
  for (const t of tags || []) {
    if (t?.[0] !== 'p') continue;
    const pk = t?.[1];
    if (typeof pk === 'string' && pk) out.add(pk);
  }
  return out;
}

function dedupeKeepFirstP(tags: string[][]): string[][] {
  const seen = new Set<string>();
  const out: string[][] = [];
  for (const t of tags || []) {
    if (!Array.isArray(t) || typeof t[0] !== 'string') continue;
    if (t[0] !== 'p') {
      out.push(t);
      continue;
    }
    const pk = t[1];
    if (typeof pk !== 'string' || !pk) continue;
    if (seen.has(pk)) continue;
    seen.add(pk);
    out.push(t);
  }
  return out;
}

export async function fetchMyContactsEvent(pubkey: string): Promise<ContactsEvent | null> {
  const ndk = await ensureNdk();
  const ev = await ndk.fetchEvent({ kinds: [NOSTR_KINDS.contacts], authors: [pubkey] } as any);
  if (!ev) return null;
  return {
    id: ev.id,
    pubkey: ev.pubkey!,
    created_at: ev.created_at!,
    kind: ev.kind!,
    content: ev.content || '',
    tags: ((ev.tags as any) as string[][]) || [],
  };
}

export function updateContactsTagsForFollow(tags: string[][], targetPubkey: string, follow: boolean): string[][] {
  const cur = (tags || []).filter((t) => Array.isArray(t)) as string[][];

  if (follow) {
    const next = [...cur, ['p', targetPubkey]];
    return dedupeKeepFirstP(next);
  }

  // unfollow: remove all matching p tags
  const next = cur.filter((t) => !(t[0] === 'p' && t[1] === targetPubkey));
  return dedupeKeepFirstP(next);
}

export function updateContactsTagsForBulkFollow(tags: string[][], targetPubkeys: string[]): string[][] {
  const cur = (tags || []).filter((t) => Array.isArray(t)) as string[][];
  const add = (targetPubkeys || [])
    .map((x) => (x || '').trim())
    .filter(Boolean)
    .filter((pk) => /^[0-9a-f]{64}$/i.test(pk))
    .slice(0, 5000);
  const next = [...cur, ...add.map((pk) => ['p', pk] as string[])];
  return dedupeKeepFirstP(next);
}

export async function publishMyContactsUpdate(opts: {
  myPubkey: string;
  targetPubkey: string;
  follow: boolean;
}): Promise<{ id: string; following: Set<string> }> {
  if (!browser) throw new Error('Follow requires a browser');
  if (!opts.myPubkey) throw new Error('Missing my pubkey');
  if (!opts.targetPubkey) throw new Error('Missing target pubkey');
  if (opts.myPubkey === opts.targetPubkey) throw new Error('Cannot follow yourself');

  const prev = await fetchMyContactsEvent(opts.myPubkey);
  const prevTags = prev?.tags || [];
  const nextTags = updateContactsTagsForFollow(prevTags, opts.targetPubkey, opts.follow);
  const content = prev?.content || '';

  const unsigned = {
    kind: NOSTR_KINDS.contacts,
    created_at: Math.floor(Date.now() / 1000),
    content,
    tags: nextTags,
    pubkey: opts.myPubkey,
  };

  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return { id: signed.id, following: followingFromContactsTags(nextTags) };
}

export async function publishMyContactsBulkFollow(opts: {
  myPubkey: string;
  addPubkeys: string[];
}): Promise<{ id: string; following: Set<string>; added: number }> {
  if (!browser) throw new Error('Follow requires a browser');
  if (!opts.myPubkey) throw new Error('Missing my pubkey');
  const add = (opts.addPubkeys || [])
    .map((x) => (x || '').trim())
    .filter(Boolean)
    .filter((pk) => pk !== opts.myPubkey)
    .slice(0, 5000);
  if (!add.length) throw new Error('Nothing to follow.');

  const prev = await fetchMyContactsEvent(opts.myPubkey);
  const prevTags = prev?.tags || [];
  const prevSet = followingFromContactsTags(prevTags);
  const nextTags = updateContactsTagsForBulkFollow(prevTags, add);
  const nextSet = followingFromContactsTags(nextTags);
  const added = Math.max(0, nextSet.size - prevSet.size);
  const content = prev?.content || '';

  const unsigned = {
    kind: NOSTR_KINDS.contacts,
    created_at: Math.floor(Date.now() / 1000),
    content,
    tags: nextTags,
    pubkey: opts.myPubkey,
  };

  const signed = await signWithNip07(unsigned as any);
  await publishSignedEvent(signed as any);
  return { id: signed.id, following: nextSet, added };
}

