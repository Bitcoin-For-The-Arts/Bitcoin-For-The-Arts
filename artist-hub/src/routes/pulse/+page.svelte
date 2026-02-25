<script lang="ts">
  import PulseFeed from '$lib/components/PulseFeed.svelte';

  const quickTags = [
    'BitcoinArt',
    'NostrArt',
    'BFTA',
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
    'Workshop',
    'Collab',
  ];

  let tags: string[] = ['BitcoinArt', 'NostrArt', 'BFTA'];
  let tagInput = '';

  function addTag() {
    const t = tagInput.trim().replace(/^#/, '');
    if (!t) return;
    const has = tags.some((x) => x.toLowerCase() === t.toLowerCase());
    tags = has ? tags : [t, ...tags].slice(0, 6);
    tagInput = '';
  }

  function addQuick(t: string) {
    const clean = t.replace(/^#/, '').trim();
    if (!clean) return;
    const has = tags.some((x) => x.toLowerCase() === clean.toLowerCase());
    tags = has ? tags : [clean, ...tags].slice(0, 6);
  }
</script>

<div class="layout">
  <div class="card controls" style="padding: 1rem;">
    <div style="font-size: 1.25rem; font-weight: 950;">Pulse</div>
    <div class="muted" style="margin-top: 0.35rem; line-height: 1.55;">
      Live posts (notes + zaps) from public relays. No backend — just signed events.
    </div>

    <div style="margin-top: 0.9rem;">
      <div class="muted" style="margin-bottom: 0.35rem;">Tags</div>
      <div style="display:flex; gap:0.5rem; align-items:center;">
        <input
          class="input"
          bind:value={tagInput}
          placeholder="#BitcoinArt, #Film, #Workshop…"
          on:keydown={(e) => e.key === 'Enter' && addTag()}
        />
        <button class="btn" on:click={addTag}>Add</button>
      </div>

      {#if tags.length}
        <div style="margin-top: 0.55rem; display:flex; gap:0.35rem; flex-wrap:wrap;">
          {#each tags as t}
            <button class="pill muted" on:click={() => (tags = tags.filter((x) => x !== t))} title="Remove tag">
              #{t} ✕
            </button>
          {/each}
          <button class="pill" on:click={() => (tags = [])} title="Show all posts (no tag filter)">All posts</button>
        </div>
      {/if}
    </div>

    <div class="card" style="margin-top: 1rem; padding: 0.9rem; background: rgba(0,0,0,0.18);">
      <div class="muted" style="margin-bottom:0.55rem;">Quick picks</div>
      <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
        {#each quickTags as t}
          <button class="pill muted" on:click={() => addQuick(t)}>#{t}</button>
        {/each}
      </div>
    </div>
  </div>

  <div class="feedWrap">
    <PulseFeed {tags} limit={40} />
  </div>
</div>

<style>
  .layout {
    display: grid;
    gap: 1rem;
  }
  @media (min-width: 980px) {
    .layout {
      grid-template-columns: 340px 1fr;
      align-items: start;
    }
    .controls {
      position: sticky;
      top: 92px;
      height: fit-content;
    }
  }
  .feedWrap {
    max-width: 920px;
  }
  @media (min-width: 980px) {
    .feedWrap {
      margin-left: auto;
    }
  }
</style>

