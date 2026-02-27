<script lang="ts">
  import '../app.css';
  import AppHeader from '$lib/components/AppHeader.svelte';
  import OnboardingModal from '$lib/components/OnboardingModal.svelte';
  import ProfileHoverTooltip from '$lib/components/ProfileHoverTooltip.svelte';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { get } from 'svelte/store';
  import { ensureNdk } from '$lib/stores/ndk';
  import { startFollowingSync } from '$lib/stores/follows';
  import { localNsec } from '$lib/stores/local-signer';
  import { pubkey } from '$lib/stores/auth';
  import { onboardingOpen, openOnboarding, closeOnboarding } from '$lib/stores/onboarding';
  import { startLiveStreams } from '$lib/stores/live-streams';

  onMount(() => {
    void ensureNdk();
    startFollowingSync();
    void startLiveStreams({ source: 'zapstream', limit: 60 });

    if (browser && !window.nostr?.getPublicKey && !get(localNsec) && !get(pubkey)) {
      const dismissed = sessionStorage.getItem('bfta:onboarding-dismissed');
      if (!dismissed) {
        openOnboarding();
      }
    }
  });

  function dismissOnboarding() {
    closeOnboarding();
    if (browser) sessionStorage.setItem('bfta:onboarding-dismissed', '1');
  }
</script>

<AppHeader />

<main class="container" style="padding: 1.2rem 0 2.5rem;">
  <slot />
</main>

<footer class="footer container">
  <div class="footer-inner">
    <div class="footer-brand">Bitcoin for the Arts, Inc.</div>
    <div class="muted footer-text">
      Built on Nostr + Lightning. No server-side storage: profiles, listings, comments, and messages are signed events on public relays.
      Your keys, your identity.
    </div>
  </div>
</footer>

<OnboardingModal open={$onboardingOpen} onClose={dismissOnboarding} />

<ProfileHoverTooltip />

<style>
  .footer {
    padding: 0 0 2.5rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
  }
  .footer-inner {
    padding-top: 1.5rem;
    text-align: center;
  }
  .footer-brand {
    font-weight: 850;
    font-size: 0.95rem;
    margin-bottom: 0.4rem;
    color: var(--accent);
  }
  .footer-text {
    line-height: 1.5;
    font-size: 0.88rem;
    max-width: 560px;
    margin: 0 auto;
  }
</style>

