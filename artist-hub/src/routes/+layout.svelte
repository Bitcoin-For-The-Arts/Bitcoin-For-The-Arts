<script lang="ts">
  import '../app.css';
  import AppHeader from '$lib/components/AppHeader.svelte';
  import { onMount } from 'svelte';
  import { ensureNdk } from '$lib/stores/ndk';
  import ProfileHoverTooltip from '$lib/components/ProfileHoverTooltip.svelte';

  onMount(() => {
    void ensureNdk();
  });
</script>

<AppHeader />

<main class="container" style="padding: 1.2rem 0 2.5rem;">
  <slot />
</main>

<footer class="container muted" style="padding: 0 0 2.2rem; line-height: 1.4;">
  Built on Nostr + Lightning. No server-side storage: profiles, listings, comments, and messages are signed events on public relays.
  <br />
  Bitcoin-only: no ordinals, no NFTs.
</footer>

<ProfileHoverTooltip />

