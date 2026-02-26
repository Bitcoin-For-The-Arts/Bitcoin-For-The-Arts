import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { DEFAULT_RELAYS } from '$lib/nostr/constants';
import { env as publicEnv } from '$env/dynamic/public';

const RELAYS_KEY = 'bfta:artist-hub:relays';

export function normalizeRelayUrl(raw: string): string | null {
  const s = (raw || '').trim();
  if (!s) return null;

  // Common typo: "wss//nos.lol" (missing colon)
  const fixed = s.replace(/^wss\/\//i, 'wss://').replace(/^ws\/\//i, 'ws://');

  // Strip trailing slash
  const trimmed = fixed.replace(/\/+$/g, '');

  try {
    const u = new URL(trimmed);
    if (u.protocol !== 'wss:' && u.protocol !== 'ws:') return null;
    if (!u.hostname) return null;
    return u.toString().replace(/\/+$/g, '');
  } catch {
    return null;
  }
}

export function normalizeRelayUrls(urls: string[]): string[] {
  const out: string[] = [];
  for (const r of urls || []) {
    const n = normalizeRelayUrl(r);
    if (!n) continue;
    if (!out.includes(n)) out.push(n);
  }
  return out;
}

function loadRelays(): string[] {
  const fromEnv = (((publicEnv as any).PUBLIC_BFTA_RELAYS as string | undefined) || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  const initial = normalizeRelayUrls(fromEnv.length ? fromEnv : DEFAULT_RELAYS);
  const fallback = normalizeRelayUrls(DEFAULT_RELAYS);

  if (!browser) return initial.length ? initial : fallback;
  try {
    const raw = localStorage.getItem(RELAYS_KEY);
    if (!raw) return initial.length ? initial : fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((r) => typeof r === 'string')) {
      const next = normalizeRelayUrls(parsed);
      return next.length ? next : (initial.length ? initial : fallback);
    }
    return initial.length ? initial : fallback;
  } catch {
    return initial.length ? initial : fallback;
  }
}

export const relayUrls = writable<string[]>(loadRelays());

if (browser) {
  relayUrls.subscribe((urls) => {
    try {
      const normalized = normalizeRelayUrls(urls);
      localStorage.setItem(RELAYS_KEY, JSON.stringify(normalized));
    } catch {
      // ignore
    }
  });
}

export const bftaAdminNpub = writable<string>(
  ((publicEnv as any).PUBLIC_BFTA_ADMIN_NPUB as string | undefined) || ''
);

