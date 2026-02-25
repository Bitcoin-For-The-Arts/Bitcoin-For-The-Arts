<script lang="ts">
  import { onMount } from 'svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { channelParticipants, channels, startChannels } from '$lib/stores/channels';
  import ChannelChat from '$lib/components/ChannelChat.svelte';

  let selected: string | null = null;
  let pickerOpen = false;
  let q = '';
  let showAll = false;

  const blockedPrefixes = ['openclaw-world-'];
  const blockedNames = new Set(['ochat-hq/undefined']);

  onMount(() => {
    void startChannels();
  });

  $: all = Object.values($channels);
  $: filtered = all
    .filter((c) => (showAll ? true : !blockedPrefixes.some((p) => c.name.startsWith(p)) && !blockedNames.has(c.name)))
    .filter((c) => {
      const qq = q.trim().toLowerCase();
      if (!qq) return true;
      return `${c.name} ${c.about ?? ''}`.toLowerCase().includes(qq);
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
  $: channelList = filtered.slice(0, 80);
  $: if (!selected && channelList.length) selected = channelList[0].id;

  function pick(id: string) {
    selected = id;
    pickerOpen = false;
  }
</script>

<div class="grid" style="gap: 1rem;">
  <div class="card" style="padding: 1rem;">
    <div style="font-size: 1.25rem; font-weight: 950;">Live Channels</div>
    <div class="muted" style="margin-top: 0.35rem; line-height: 1.55;">
      NIP-28 public channels (kinds 40/41/42). Channel history depends on your connected relays.
    </div>

    <div class="controls">
      <input class="input" bind:value={q} placeholder="Search channels…" />
      <label class="muted toggle">
        <input type="checkbox" bind:checked={showAll} />
        Show all (including noisy channels)
      </label>
      <button class="btn mobileOnly" on:click={() => (pickerOpen = true)}>Pick channel</button>
    </div>
  </div>

  <div class="layout">
    <aside class="sidebar card">
      <div class="sideHead">
        <div style="font-weight: 900;">Channels</div>
        <div class="muted">{channelList.length}</div>
      </div>

      <div class="list">
        {#each channelList as c (c.id)}
          <button
            class={`card ch ${selected === c.id ? 'active' : ''}`}
            style="padding: 0.7rem 0.8rem; text-align:left;"
            on:click={() => pick(c.id)}
          >
            <div style="display:flex; gap:0.65rem; align-items:center;">
              {#if c.picture}
                <img
                  src={c.picture}
                  alt=""
                  style="width:34px; height:34px; border-radius:14px; border:1px solid var(--border); object-fit:cover;"
                />
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
    </aside>

    <section class="chat">
      {#if selected}
        <div class="mobileBar card">
          <div class="muted">
            Selected: <span style="color:var(--text); font-weight:850;">{$channels[selected]?.name ?? selected.slice(0, 10) + '…'}</span>
            {#if $channelParticipants[selected]}
              <span class="pill muted" style="margin-left:0.35rem;">
                {$channelParticipants[selected].last10m} active • {$channelParticipants[selected].count} seen
              </span>
            {/if}
          </div>
          <button class="btn" on:click={() => (pickerOpen = true)}>Change</button>
        </div>
        <ChannelChat channelId={selected} />
      {:else}
        <div class="card" style="padding: 1rem;">
          <div class="muted">Pick a channel to view chat.</div>
        </div>
      {/if}
    </section>
  </div>
</div>

<Modal open={pickerOpen} title="Pick a channel" onClose={() => (pickerOpen = false)}>
  <div class="muted" style="margin-bottom:0.75rem;">
    Tip: use the search box above to filter. Channel history depends on relays.
  </div>
  <div style="display:grid; gap:0.5rem;">
    {#each channelList as c (c.id)}
      <button class={`card ch ${selected === c.id ? 'active' : ''}`} style="padding:0.75rem 0.85rem; text-align:left;" on:click={() => pick(c.id)}>
        <div style="font-weight:900;">{c.name}</div>
        <div class="muted" style="margin-top:0.2rem;">{c.about || '—'}</div>
      </button>
    {/each}
  </div>
</Modal>

<style>
  .controls {
    margin-top: 0.9rem;
    display: grid;
    gap: 0.6rem;
  }
  .toggle {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .layout {
    display: grid;
    gap: 1rem;
  }
  @media (min-width: 980px) {
    .layout {
      grid-template-columns: 360px 1fr;
      align-items: start;
    }
  }

  .sidebar {
    padding: 0;
    overflow: hidden;
    height: fit-content;
    position: sticky;
    top: 92px;
  }
  .sideHead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid var(--border);
    background: rgba(0, 0, 0, 0.18);
  }
  .list {
    padding: 0.85rem 1rem 1rem;
    display: grid;
    gap: 0.5rem;
    max-height: min(66vh, 760px);
    overflow: auto;
  }

  .chat {
    display: grid;
    gap: 0.75rem;
  }
  .mobileBar {
    padding: 0.75rem 0.85rem;
    display: none;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  @media (max-width: 979px) {
    .sidebar {
      display: none;
    }
    .mobileBar {
      display: flex;
    }
    .mobileOnly {
      display: inline-flex;
    }
  }
  @media (min-width: 980px) {
    .mobileOnly {
      display: none;
    }
  }

  .ch.active {
    border-color: rgba(246, 196, 83, 0.35);
    background: rgba(246, 196, 83, 0.08);
  }
</style>

