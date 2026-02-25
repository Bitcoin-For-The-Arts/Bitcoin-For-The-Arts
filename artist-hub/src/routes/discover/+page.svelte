<script lang="ts">
  import { onMount } from 'svelte';
  import ListingCard from '$lib/components/ListingCard.svelte';
  import {
    discoveryCategory,
    discoveryLoading,
    discoveryQuery,
    discoveryTags,
    filteredListings,
    setQuickTag,
    startDiscovery,
  } from '$lib/stores/discovery';

  const quickCategories = [
    'Visual Arts',
    'Music',
    'Film',
    'Dance',
    'Theater',
    'Animation',
    'Storytelling',
    'Installation',
    'Writing',
    'Design',
    'Workshops',
    'Collaboration',
  ];
  const quickTags = [
    'BitcoinArt',
    'NostrArt',
    'VisualArt',
    'DigitalArt',
    'Music',
    'Writing',
    'Storytelling',
    'Theater',
    'Dance',
    'Film',
    'InstallationArt',
    'Animation',
    'Mixing',
    'Poster',
    'Workshop',
    'Collab',
  ];

  onMount(() => {
    void startDiscovery();
  });

  let tagInput = '';
  function addTag() {
    const t = tagInput.trim().replace(/^#/, '');
    if (!t) return;
    discoveryTags.update((prev) => {
      const has = prev.some((x) => x.toLowerCase() === t.toLowerCase());
      return has ? prev : [t, ...prev].slice(0, 6);
    });
    tagInput = '';
  }
</script>

<div class="grid cols-2">
  <div class="card" style="padding: 1rem;">
    <div style="font-size: 1.25rem; font-weight: 900;">Discover</div>
    <div class="muted" style="margin-top: 0.35rem; line-height: 1.5;">
      Search decentralized listings across public relays (NIP-15 services + NIP-99 classifieds).
    </div>

    <div style="margin-top: 0.85rem;">
      <input class="input" bind:value={$discoveryQuery} placeholder="Search: illustration, mixing, collaboration…" />
    </div>

    <div style="margin-top: 0.75rem;">
      <div class="muted" style="margin-bottom: 0.35rem;">Category</div>
      <select class="select" bind:value={$discoveryCategory}>
        <option value="">All categories</option>
        {#each quickCategories as c}
          <option value={c}>{c}</option>
        {/each}
      </select>
    </div>

    <div style="margin-top: 0.75rem;">
      <div class="muted" style="margin-bottom: 0.35rem;">Tags</div>
      <div style="display:flex; gap:0.5rem; align-items:center;">
        <input
          class="input"
          bind:value={tagInput}
          placeholder="#BitcoinArt, #VisualArt, #Writing…"
          on:keydown={(e) => e.key === 'Enter' && addTag()}
        />
        <button class="btn" on:click={addTag}>Add</button>
      </div>
      {#if $discoveryTags.length}
        <div style="margin-top: 0.55rem; display:flex; gap:0.35rem; flex-wrap:wrap;">
          {#each $discoveryTags as t}
            <button
              class="pill muted"
              on:click={() =>
                discoveryTags.update((prev) => prev.filter((x) => x.toLowerCase() !== t.toLowerCase()))}
              title="Remove tag"
            >
              #{t} ✕
            </button>
          {/each}
          <button class="pill" on:click={() => discoveryTags.set([])}>Clear</button>
        </div>
      {/if}
    </div>

    <div class="card" style="margin-top: 1rem; padding: 0.9rem; background: rgba(0,0,0,0.18);">
      <div class="muted" style="margin-bottom:0.55rem;">Quick picks</div>
      <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
        {#each quickTags as t}
          <button class="pill muted" on:click={() => setQuickTag(t)}>#{t}</button>
        {/each}
      </div>
    </div>
  </div>

  <div class="card" style="padding: 1rem;">
    <div style="display:flex; align-items:center; justify-content:space-between; gap: 1rem;">
      <div style="font-weight: 850;">Results</div>
      <div class="muted">{#if $discoveryLoading}Loading relays…{/if}</div>
    </div>

    <div class="muted" style="margin-top:0.35rem;">
      Showing {$filteredListings.length} listing(s).
    </div>

    <div class="grid cols-2" style="margin-top: 0.9rem;">
      {#each $filteredListings as l (l.eventId)}
        <ListingCard listing={l} />
      {/each}
    </div>
  </div>
</div>

