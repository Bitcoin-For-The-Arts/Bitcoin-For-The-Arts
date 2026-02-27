<script lang="ts">
  import { onMount } from 'svelte';
  import { canSign } from '$lib/stores/auth';
  import { hubEvents, hubEventsLoading, startHubEvents } from '$lib/stores/events';
  import EventCard from '$lib/components/EventCard.svelte';
  import EventForm from '$lib/components/EventForm.svelte';

  let showCreate = false;

  onMount(() => {
    void startHubEvents();
  });

  $: upcoming = $hubEvents
    .filter((e) => (e.end ?? e.start ?? e.createdAt) >= Math.floor(Date.now() / 1000) - 86400)
    .sort((a, b) => (a.start ?? a.createdAt) - (b.start ?? b.createdAt))
    .slice(0, 200);
</script>

<div class="card" style="padding: 1rem;">
  <div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 1rem; flex-wrap:wrap;">
    <div>
      <div style="font-size: 1.25rem; font-weight: 950;">Events</div>
      <div class="muted" style="margin-top:0.35rem; line-height:1.55;">
        Workshops, exhibitions, meetups, and livestreams — discovered via Nostr (NIP-99) and tagged with `#event`.
      </div>
    </div>
    <div style="display:flex; gap:0.5rem; align-items:center;">
      <button class="btn primary" on:click={() => (showCreate = !showCreate)} disabled={!$canSign}>
        {showCreate ? 'Close' : 'Publish event'}
      </button>
    </div>
  </div>
</div>

{#if !$canSign}
  <div class="card" style="margin-top: 1rem; padding: 1rem; border-color: rgba(246,196,83,0.35);">
    <div class="muted">Connect your signer to publish events.</div>
  </div>
{/if}

{#if showCreate && $canSign}
  <div style="margin-top: 1rem;">
    <EventForm />
  </div>
{/if}

<div style="margin-top: 1rem; display:flex; align-items:center; justify-content:space-between;">
  <div class="muted">{#if $hubEventsLoading}Loading relays…{/if}</div>
  <div class="muted">{upcoming.length} upcoming</div>
</div>

<div class="grid cols-3" style="margin-top: 0.9rem;">
  {#each upcoming as e (e.eventId)}
    <EventCard ev={e} />
  {/each}
  {#if !$hubEventsLoading && upcoming.length === 0}
    <div class="card" style="padding: 1rem; grid-column: 1 / -1;">
      <div class="muted">No upcoming events found on connected relays yet.</div>
    </div>
  {/if}
</div>

