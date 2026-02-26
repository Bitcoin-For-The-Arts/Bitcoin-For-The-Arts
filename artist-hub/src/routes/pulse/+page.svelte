<script lang="ts">
  import PulseFeed from '$lib/components/PulseFeed.svelte';
  import ZapStreamScroller from '$lib/components/ZapStreamScroller.svelte';
  import { nip19 } from 'nostr-tools';
  import { profileByPubkey } from '$lib/stores/profiles';

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

  let tags: string[] = [];
  let authors: string[] = [];

  let tagInput = '';
  let search = '';

  function addTag() {
    const t = tagInput.trim().replace(/^#/, '');
    if (!t) return;
    const has = tags.some((x) => x.toLowerCase() === t.toLowerCase());
    tags = has ? tags : [t, ...tags].slice(0, 6);
    tagInput = '';
  }

  function addTagFromSearch() {
    const t = search.trim().replace(/^#/, '');
    if (!t) return;
    const has = tags.some((x) => x.toLowerCase() === t.toLowerCase());
    tags = has ? tags : [t, ...tags].slice(0, 6);
    search = '';
  }

  function addAuthor(pubkeyHex: string) {
    const pk = (pubkeyHex || '').trim();
    if (!pk) return;
    const has = authors.some((x) => x === pk);
    authors = has ? authors : [pk, ...authors].slice(0, 3);
    search = '';
  }

  function addAuthorFromSearch() {
    const q = search.trim();
    if (!q) return;

    try {
      const decoded = nip19.decode(q);
      if (decoded.type === 'npub') {
        addAuthor(decoded.data as string);
        return;
      }
      if (decoded.type === 'nprofile') {
        const d = decoded.data as any;
        if (d?.pubkey) addAuthor(d.pubkey);
        return;
      }
    } catch {
      // ignore
    }
  }

  function applySearch() {
    const q = search.trim();
    if (!q) return;
    if (q.startsWith('#')) {
      addTagFromSearch();
      return;
    }
    addAuthorFromSearch();
  }

  function addQuick(t: string) {
    const clean = t.replace(/^#/, '').trim();
    if (!clean) return;
    const has = tags.some((x) => x.toLowerCase() === clean.toLowerCase());
    tags = has ? tags : [clean, ...tags].slice(0, 6);
  }

  $: suggestions = (() => {
    const q = search.trim().toLowerCase();
    if (!q || q.startsWith('#') || q.startsWith('npub') || q.startsWith('nprofile')) return [];
    const entries = Object.entries($profileByPubkey || {});
    const hits = entries
      .map(([pk, p]) => ({
        pubkey: pk,
        name: (p?.display_name || p?.name || '').trim(),
      }))
      .filter((x) => x.name && x.name.toLowerCase().includes(q))
      .slice(0, 8);
    return hits;
  })();
</script>

<div class="layout">
  <div class="card controls" style="padding: 1rem;">
    <div style="font-size: 1.25rem; font-weight: 950;">Pulse</div>
    <div class="muted" style="margin-top: 0.35rem; line-height: 1.55;">
      Live posts (notes + zaps) from public relays. No backend — just signed events.
    </div>

    <div style="margin-top: 0.9rem;">
      <div class="muted" style="margin-bottom: 0.35rem;">Search</div>
      <div style="display:flex; gap:0.5rem; align-items:center;">
        <input
          class="input"
          bind:value={search}
          placeholder="Search #hashtag or paste npub… or type a name"
          on:keydown={(e) => e.key === 'Enter' && applySearch()}
        />
        <button class="btn" on:click={applySearch}>Go</button>
      </div>

      {#if suggestions.length}
        <div class="card" style="margin-top:0.6rem; padding:0.7rem; background: rgba(0,0,0,0.18);">
          <div class="muted" style="font-size:0.85rem; margin-bottom:0.4rem;">Matches</div>
          <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
            {#each suggestions as s}
              <button class="pill muted" on:click={() => addAuthor(s.pubkey)} title="Filter by this author">
                {s.name}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if authors.length}
        <div style="margin-top: 0.55rem; display:flex; gap:0.35rem; flex-wrap:wrap;">
          {#each authors as a}
            <button class="pill muted" on:click={() => (authors = authors.filter((x) => x !== a))} title="Remove author filter">
              Author {a.slice(0, 8)}… ✕
            </button>
          {/each}
          <button class="pill" on:click={() => (authors = [])} title="Clear author filter">Clear authors</button>
        </div>
      {/if}

      {#if tags.length}
        <div style="margin-top: 0.55rem; display:flex; gap:0.35rem; flex-wrap:wrap;">
          {#each tags as t}
            <button class="pill muted" on:click={() => (tags = tags.filter((x) => x !== t))} title="Remove tag">
              #{t} ✕
            </button>
          {/each}
          <button class="pill" on:click={() => (tags = [])} title="Clear tag filter">Clear tags</button>
        </div>
      {/if}

      <div style="margin-top:0.55rem;">
        <button class="pill" on:click={() => { tags = []; authors = []; }} title="Show all posts">All posts</button>
      </div>
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
    <ZapStreamScroller />
    <PulseFeed {tags} {authors} limit={40} />
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

