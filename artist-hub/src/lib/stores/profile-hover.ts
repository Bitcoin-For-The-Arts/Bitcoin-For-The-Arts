import { writable } from 'svelte/store';

export type HoverProfileState = {
  pubkey: string;
  x: number;
  y: number;
} | null;

export const hoverProfile = writable<HoverProfileState>(null);

export function setHoverProfile(next: Exclude<HoverProfileState, null>): void {
  hoverProfile.set(next);
}

export function clearHoverProfile(pubkey?: string): void {
  hoverProfile.update((cur) => {
    if (!cur) return null;
    if (pubkey && cur.pubkey !== pubkey) return cur;
    return null;
  });
}

