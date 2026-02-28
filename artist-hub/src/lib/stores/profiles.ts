import { browser } from '$app/environment';
import type { NDKUserProfile } from '@nostr-dev-kit/ndk';
import { get, writable } from 'svelte/store';
import { ensureNdk } from '$lib/stores/ndk';
import type { ArtistProfile } from '$lib/stores/auth';

export const profileByPubkey = writable<Record<string, ArtistProfile>>({});

const CACHE_KEY = 'bfta:profile-cache';
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

type CacheEntry = { prof: ArtistProfile; at: number };

function loadCachedProfiles(): Record<string, CacheEntry> {
  if (!browser) return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || !parsed) return {};
    return parsed as Record<string, CacheEntry>;
  } catch {
    return {};
  }
}

function saveCachedProfile(pk: string, prof: ArtistProfile) {
  if (!browser) return;
  try {
    const cache = loadCachedProfiles();
    cache[pk] = { prof, at: Date.now() };
    const keys = Object.keys(cache);
    if (keys.length > 200) {
      const sorted = keys.sort((a, b) => (cache[a].at || 0) - (cache[b].at || 0));
      for (const k of sorted.slice(0, keys.length - 150)) delete cache[k];
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore quota errors
  }
}

if (browser) {
  const cache = loadCachedProfiles();
  const now = Date.now();
  const initial: Record<string, ArtistProfile> = {};
  for (const [pk, entry] of Object.entries(cache)) {
    if (now - (entry.at || 0) < CACHE_TTL_MS && entry.prof) {
      initial[pk] = entry.prof;
    }
  }
  if (Object.keys(initial).length > 0) {
    profileByPubkey.set(initial);
  }
}

const inflight = new Map<string, Promise<ArtistProfile | null>>();
const attempted = new Set<string>();

const PROFILE_CONCURRENCY = 4;
let profileActive = 0;
type QueueItem = { pubkey: string; resolve: (v: ArtistProfile | null) => void };
const profileQueue: QueueItem[] = [];

function doFetch(pk: string): Promise<ArtistProfile | null> {
  const p = (async () => {
    const ndk = await ensureNdk();
    const user = ndk.getUser({ pubkey: pk });
    await user.fetchProfile();
    const prof = (user.profile as unknown as NDKUserProfile | null) ?? null;
    if (prof) {
      profileByPubkey.update((m) => ({ ...m, [pk]: prof as unknown as ArtistProfile }));
      saveCachedProfile(pk, prof as unknown as ArtistProfile);
      return prof as unknown as ArtistProfile;
    }
    return null;
  })().finally(() => {
    inflight.delete(pk);
    attempted.add(pk);
    profileActive--;
    drainProfileQueue();
  });
  inflight.set(pk, p);
  return p;
}

function drainProfileQueue() {
  while (profileActive < PROFILE_CONCURRENCY && profileQueue.length > 0) {
    const item = profileQueue.shift()!;
    if (attempted.has(item.pubkey) || inflight.has(item.pubkey)) {
      const existing = inflight.get(item.pubkey);
      item.resolve(existing ? existing : Promise.resolve(null) as any);
      continue;
    }
    profileActive++;
    doFetch(item.pubkey).then(item.resolve, () => item.resolve(null));
  }
}

export async function fetchProfileFor(pubkey: string): Promise<ArtistProfile | null> {
  if (!pubkey) return null;
  if (inflight.has(pubkey)) return inflight.get(pubkey)!;
  if (attempted.has(pubkey)) return null;

  const current = get(profileByPubkey);
  if (current[pubkey]) {
    attempted.add(pubkey);
    return current[pubkey];
  }

  return new Promise<ArtistProfile | null>((resolve) => {
    profileQueue.push({ pubkey, resolve });
    drainProfileQueue();
  });
}

