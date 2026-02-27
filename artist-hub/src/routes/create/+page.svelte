<script lang="ts">
  import ListingForm from '$lib/components/ListingForm.svelte';
  import { canSign } from '$lib/stores/auth';
</script>

<div class="card" style="padding: 1rem;">
  <div style="font-size: 1.25rem; font-weight: 900;">Create a listing</div>
  <div class="muted" style="margin-top: 0.35rem; line-height: 1.5;">
    Publish a service/gig using NIP-15 (stall + product) or a one-off request using NIP-99 (classified ad).
    Everything is stored as signed Nostr events on public relays.
  </div>
</div>

<div style="margin-top: 1rem;">
  {#if $canSign}
    <ListingForm />
  {:else}
    <div class="card" style="padding: 1rem; border-color: rgba(246,196,83,0.35);">
      <div class="muted">Connect your Nostr signer to publish listings.</div>
    </div>
  {/if}
</div>

