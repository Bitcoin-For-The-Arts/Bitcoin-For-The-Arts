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

  if (envRelays.length) {
    if (browser) {
      try {
        const prevSource = localStorage.getItem(RELAYS_SOURCE_KEY) || '';
        if (prevSource !== envRaw) {
          localStorage.setItem(RELAYS_KEY, JSON.stringify(envRelays));
          localStorage.setItem(RELAYS_SOURCE_KEY, envRaw);
        }
      } catch {
        // ignore
      }
    }
    return envRelays;
  }

  if (!browser) return fallback;
  try {
    const raw = localStorage.getItem(RELAYS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((r) => typeof r === 'string')) {
      const next = normalizeRelayUrls(parsed);
      return next.length ? next : fallback;
    }
    return fallback;
  } catch {
    return fallback;
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

