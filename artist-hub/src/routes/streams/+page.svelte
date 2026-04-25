<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import StreamCard from '$lib/components/StreamCard.svelte';
  import { liveStreams, liveStreamsError, liveStreamsLoading, startLiveStreams, stopLiveStreams } from '$lib/stores/live-streams';

  let showAllServices = false;

  onMount(() => {
    if (!browser) return;
    void startLiveStreams({ source: showAllServices ? 'all' : 'zapstream', limit: 60 });
  });

  $: if (browser) void startLiveStreams({ source: showAllServices ? 'all' : 'zapstream', limit: 60 });

  onDestroy(() => {
    stopLiveStreams();
  });
</script>

<div class="grid" style="gap: 1rem;">
  <div class="card" style="padding: 1rem;">
    <div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 1rem; flex-wrap:wrap;">
      <div>
        <div style="font-size: 1.25rem; font-weight: 950;">Streams</div>
        <div class="muted" style="margin-top:0.35rem; line-height:1.55;">
          Live broadcasts discovered on Nostr via NIP-53 (kind:30311). Click a stream card to open it on the streaming service.
        </div>
      </div>
      <div style="display:flex; gap:0.5rem; align-items:center;">
        <label class="pill muted" style="cursor:pointer; display:flex; gap:0.5rem; align-items:center;">
          <input type="checkbox" bind:checked={showAllServices} />
          Show all services
        </label>
      </div>
    </div>
  </div>

  {#if $liveStreamsError}
    <div class="card" style="padding: 0.85rem 1rem; border-color: rgba(251,113,133,0.35);">
      <div class="muted">{$liveStreamsError}</div>
    </div>
  {/if}

  {#if $liveStreamsLoading && !$liveStreams.length}
    <div class="muted">Loading streams from relays…</div>
  {/if}

  <div class="grid cards">
    {#each $liveStreams as s (s.eventId)}
      <StreamCard stream={s} />
    {/each}
    {#if !$liveStreamsLoading && $liveStreams.length === 0 && !$liveStreamsError}
      <div class="card" style="padding: 1rem; grid-column: 1 / -1;">
        <div class="muted">No live streams found right now on your connected relays.</div>
      </div>
    {/if}
  </div>
</div>

<style>
  .cards {
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 0.8rem;
  }
  @media (min-width: 720px) {
    .cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (min-width: 1100px) {
    .cards {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>

