import { writable } from 'svelte/store';

export const onboardingOpen = writable(false);

export function openOnboarding(): void {
  onboardingOpen.set(true);
}

export function closeOnboarding(): void {
  onboardingOpen.set(false);
}

