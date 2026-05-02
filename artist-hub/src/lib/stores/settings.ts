import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import { DEFAULT_RELAYS } from '$lib/nostr/constants';
import { env as publicEnv } from '$env/dynamic/public';

const RELAYS_KEY = 'bfta:artist-hub:relays';
const RELAYS_SOURCE_KEY = 'bfta:artist-hub:relays-source';

export function normalizeRelayUrl(raw: string): string | null {
  const s = (raw || '').trim();
  if (!s) return null;

  const fixed = s
    .replace(/^wss\/\//i, 'wss://')
    .replace(/^ws\/\//i, 'ws://')
    .replace(/^wss:\/(?=[^/])/i, 'wss://')
    .replace(/^ws:\/(?=[^/])/i, 'ws://');

  const trimmed = fixed.replace(/\/+$/g, '');

  if (!trimmed.startsWith('wss://') && !trimmed.startsWith('ws://')) {
    const withProto = `wss://${trimmed}`;
    try {
      const u = new URL(withProto);
      if (u.hostname) return u.toString().replace(/\/+$/g, '');
    } catch {
      // fall through
    }
  }

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
  const envRaw = (((publicEnv as any).PUBLIC_BFTA_RELAYS as string | undefined) || '').trim();
  const fromEnv = envRaw
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);
  const envRelays = normalizeRelayUrls(fromEnv);
  const fallback = normalizeRelayUrls(DEFAULT_RELAYS);

  if (browser) {
    console.log('[BFTA] Relay config:', {
      envVar: envRaw || '(not set)',
      envParsed: envRelays,
      defaults: fallback,
    });
  }

  if (envRelays.length) {
    if (browser) {
      try {
        localStorage.removeItem(RELAYS_KEY);
        localStorage.removeItem(RELAYS_SOURCE_KEY);
      } catch { /* ignore */ }
      console.log('[BFTA] Using env relays:', envRelays);
    }
    return envRelays;
  }

  if (browser) {
    try {
      localStorage.removeItem(RELAYS_KEY);
      localStorage.removeItem(RELAYS_SOURCE_KEY);
    } catch { /* ignore */ }
    console.log('[BFTA] Using default relays:', fallback);
  }

  return fallback;
}

export const relayUrls = writable<string[]>(loadRelays());

// Relay URLs are sourced from env var or defaults only.
// No localStorage persistence to avoid stale cache issues.

export const bftaAdminNpub = writable<string>(
  ((publicEnv as any).PUBLIC_BFTA_ADMIN_NPUB as string | undefined) || ''
);

