import { writable } from 'svelte/store';

export type HoverProfileState = {
  pubkey: string;
  x: number;
  y: number;
  pinned?: boolean;
} | null;

export const hoverProfile = writable<HoverProfileState>(null);

export function setHoverProfile(next: Exclude<HoverProfileState, null>): void {
  hoverProfile.set({ ...next, pinned: false });
}

export function clearHoverProfile(pubkey?: string): void {
  hoverProfile.update((cur) => {
    if (!cur) return null;
    if (pubkey && cur.pubkey !== pubkey) return cur;
    if (cur.pinned) return cur;
    return null;
  });
}

export function pinHoverProfile(pubkey?: string): void {
  hoverProfile.update((cur) => {
    if (!cur) return null;
    if (pubkey && cur.pubkey !== pubkey) return cur;
    return { ...cur, pinned: true };
  });
}

export function forceClearHoverProfile(pubkey?: string): void {
  hoverProfile.update((cur) => {
    if (!cur) return null;
    if (pubkey && cur.pubkey !== pubkey) return cur;
    return null;
  });
}

