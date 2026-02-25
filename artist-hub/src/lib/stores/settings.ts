import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { DEFAULT_RELAYS } from '$lib/nostr/constants';
import * as publicEnv from '$env/static/public';

const RELAYS_KEY = 'bfta:artist-hub:relays';

function loadRelays(): string[] {
  const fromEnv = (((publicEnv as any).PUBLIC_BFTA_RELAYS as string | undefined) || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  const initial = fromEnv.length ? fromEnv : DEFAULT_RELAYS;

  if (!browser) return initial;
  try {
    const raw = localStorage.getItem(RELAYS_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((r) => typeof r === 'string')) return parsed;
    return initial;
  } catch {
    return initial;
  }
}

export const relayUrls = writable<string[]>(loadRelays());

if (browser) {
  relayUrls.subscribe((urls) => {
    try {
      localStorage.setItem(RELAYS_KEY, JSON.stringify(urls));
    } catch {
      // ignore
    }
  });
}

export const bftaAdminNpub = writable<string>(
  ((publicEnv as any).PUBLIC_BFTA_ADMIN_NPUB as string | undefined) || ''
);

