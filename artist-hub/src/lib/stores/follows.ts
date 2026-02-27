import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import { pubkey as myPubkey } from '$lib/stores/auth';
import { fetchMyContactsEvent, followingFromContactsTags, publishMyContactsBulkFollow, publishMyContactsUpdate } from '$lib/nostr/follows';

export const followingSet = writable<Set<string>>(new Set());
export const followingLoading = writable<boolean>(false);
export const followingError = writable<string | null>(null);

let syncing = false;
let stopSync: (() => void) | null = null;

export async function refreshFollowing(): Promise<void> {
  followingError.set(null);
  const pk = get(myPubkey);
  if (!browser || !pk) {
    followingSet.set(new Set());
    followingLoading.set(false);
    return;
  }

  followingLoading.set(true);
  try {
    const ev = await fetchMyContactsEvent(pk);
    const next = ev ? followingFromContactsTags(ev.tags) : new Set<string>();
    followingSet.set(new Set(next));
  } catch (e) {
    followingError.set(e instanceof Error ? e.message : String(e));
  } finally {
    followingLoading.set(false);
  }
}

export function isFollowing(pk: string, set: Set<string>): boolean {
  return !!pk && set.has(pk);
}

export async function setFollow(targetPubkey: string, follow: boolean): Promise<void> {
  followingError.set(null);
  const pk = get(myPubkey);
  if (!pk) {
    followingError.set('Connect your npub to follow.');
    return;
  }
  if (!targetPubkey) return;
  if (pk === targetPubkey) return;

  followingLoading.set(true);
  try {
    const res = await publishMyContactsUpdate({ myPubkey: pk, targetPubkey, follow });
    followingSet.set(new Set(res.following));
  } catch (e) {
    followingError.set(e instanceof Error ? e.message : String(e));
  } finally {
    followingLoading.set(false);
  }
}

export async function toggleFollow(targetPubkey: string): Promise<void> {
  const cur = get(followingSet);
  await setFollow(targetPubkey, !cur.has(targetPubkey));
}

export async function followMany(pubkeys: string[]): Promise<{ added: number } | null> {
  followingError.set(null);
  const pk = get(myPubkey);
  if (!pk) {
    followingError.set('Connect your npub to follow.');
    return null;
  }
  const add = (pubkeys || []).filter(Boolean);
  if (!add.length) return { added: 0 };

  followingLoading.set(true);
  try {
    const res = await publishMyContactsBulkFollow({ myPubkey: pk, addPubkeys: add });
    followingSet.set(new Set(res.following));
    return { added: res.added };
  } catch (e) {
    followingError.set(e instanceof Error ? e.message : String(e));
    return null;
  } finally {
    followingLoading.set(false);
  }
}

export function startFollowingSync(): () => void {
  if (!browser) return () => {};
  if (syncing && stopSync) return stopSync;
  syncing = true;

  const unsub = myPubkey.subscribe((pk) => {
    if (!pk) {
      followingSet.set(new Set());
      followingError.set(null);
      followingLoading.set(false);
      return;
    }
    void refreshFollowing();
  });

  stopSync = () => {
    unsub();
    syncing = false;
    stopSync = null;
  };
  return stopSync;
}

