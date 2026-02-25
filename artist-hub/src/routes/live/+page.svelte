<script lang="ts">
  import { onMount } from 'svelte';
  import { channels, startChannels } from '$lib/stores/channels';
  import ChannelChat from '$lib/components/ChannelChat.svelte';

  let selected: string | null = null;

  onMount(() => {
    void startChannels();
  });

  $: channelList = Object.values($channels).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 50);
  $: if (!selected && channelList.length) selected = channelList[0].id;
</script>

<div class="grid cols-2">
  <div class="card" style="padding: 1rem;">
    <div style="font-size: 1.25rem; font-weight: 950;">Live</div>
    <div class="muted" style="margin-top: 0.35rem; line-height: 1.55;">
      Public channels and real-time collaboration spaces using NIP-28 (kinds 40/41/42). No servers, no accounts —
      just signed events on relays.
    </div>

    <div style="margin-top: 1rem; display:flex; align-items:center; justify-content:space-between;">
      <div style="font-weight: 900;">Channels</div>
      <div class="muted">{channelList.length}</div>
    </div>

    <div style="margin-top: 0.75rem; display:grid; gap:0.5rem;">
      {#each channelList as c (c.id)}
        <button
          class={`card ch ${selected === c.id ? 'active' : ''}`}
          style="padding: 0.75rem 0.85rem; text-align:left;"
          on:click={() => (selected = c.id)}
        >
          <div style="display:flex; gap:0.65rem; align-items:center;">
            {#if c.picture}
              <img src={c.picture} alt="" style="width:34px; height:34px; border-radius:14px; border:1px solid var(--border); object-fit:cover;" />
            {/if}
            <div style="min-width:0;">
              <div style="font-weight: 900; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                {c.name}
              </div>
              <div class="muted" style="font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                {c.about || '—'}
              </div>
            </div>
          </div>
        </button>
      {/each}

      {#if channelList.length === 0}
        <div class="muted">No channels found on connected relays yet.</div>
      {/if}
    </div>
  </div>

  <div>
    {#if selected}
      <ChannelChat channelId={selected} />
    {:else}
      <div class="card" style="padding: 1rem;">
        <div class="muted">Select a channel to view chat.</div>
      </div>
    {/if}
  </div>
</div>

<style>
  .ch.active {
    border-color: rgba(246, 196, 83, 0.35);
    background: rgba(246, 196, 83, 0.08);
  }
</style>

