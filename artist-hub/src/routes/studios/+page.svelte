<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import StudioCard from '$lib/components/StudioCard.svelte';
  import StudioForm from '$lib/components/StudioForm.svelte';
  import { canSign, isAuthed } from '$lib/stores/auth';
  import { startStudios, studios, studiosLoading } from '$lib/stores/studios';

  let showCreate = false;

  onMount(() => {
    void startStudios();
  });
</script>

<div class="card" style="padding: 1rem;">
  <div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 1rem; flex-wrap:wrap;">
    <div>
      <div style="font-size: 1.25rem; font-weight: 950;">Virtual Studios</div>
      <div class="muted" style="margin-top:0.35rem; line-height:1.55;">
        Studios are immersive, shareable “rooms” for your work — published as Nostr events (`kind:30050`). Visitors can
        explore items, leave notes, and zap directly.
      </div>
    </div>
    <div style="display:flex; gap:0.5rem; align-items:center;">
      <button class="btn primary" on:click={() => (showCreate = !showCreate)} disabled={!$canSign}>
        {showCreate ? 'Close' : 'Create studio'}
      </button>
      <a class="btn" href={`${base}/discover`}>Back to Discover</a>
    </div>
  </div>
</div>

{#if !$canSign}
  <div class="card" style="margin-top: 1rem; padding: 1rem; border-color: rgba(246,196,83,0.35);">
    <div class="muted">Connect your signer to create a studio.</div>
  </div>
{/if}

{#if showCreate && $canSign}
  <div style="margin-top: 1rem;">
    <StudioForm />
  </div>
{/if}

<div style="margin-top: 1rem; display:flex; align-items:center; justify-content:space-between;">
  <div class="muted">{#if $studiosLoading}Loading relays…{/if}</div>
  <div class="muted">{$studios.length} studio(s)</div>
</div>

<div class="grid cols-3" style="margin-top: 0.9rem;">
  {#each $studios as s (s.address)}
    <StudioCard studio={s} />
  {/each}
  {#if !$studiosLoading && $studios.length === 0}
    <div class="card" style="padding: 1rem; grid-column: 1 / -1;">
      <div class="muted">No studios found yet on connected relays.</div>
    </div>
  {/if}
</div>

