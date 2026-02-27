<script lang="ts">
  import { onDestroy } from 'svelte';
  import { base } from '$app/paths';
  import PulseFeed from '$lib/components/PulseFeed.svelte';
  import ZapStreamScroller from '$lib/components/ZapStreamScroller.svelte';
  import { profileByPubkey } from '$lib/stores/profiles';
  import { fetchProfileFor } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';
  import { isAuthed } from '$lib/stores/auth';
  import { followingError, followingLoading, followingSet, refreshFollowing } from '$lib/stores/follows';
  import { browser } from '$app/environment';

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
  let mode: 'all' | 'following' = 'all';
  let trending: Array<any> = [];

  const MODE_KEY = 'bfta:artist-hub:pulse:mode';

  // Restore mode on refresh / revisit (client-side only).
  if (browser) {
    try {
      const saved = (localStorage.getItem(MODE_KEY) || '').trim();
      if (saved === 'following' || saved === 'all') mode = saved;
    } catch {
      // ignore
    }
  }

  // Persist mode as it changes.
  $: if (browser) {
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      // ignore
    }
  }

  // If user isn't connected, don't keep "Following" selected.
  $: if (mode === 'following' && !$isAuthed) {
    mode = 'all';
  }

  $: if (mode === 'following') {
    tags = [];
    const list = Array.from($followingSet || []).filter(Boolean);
    authors = list.slice(0, 120);
  }

  $: followingPreview = (() => {
    if (mode !== 'following') return [];
    const list = Array.from($followingSet || []).filter(Boolean);
    const out = list.slice(0, 18);
    for (const pk of out) void fetchProfileFor(pk);
    return out;
  })();

  let tagInput = '';

  function addTag() {
    mode = 'all';
    const t = tagInput.trim().replace(/^#/, '');
    if (!t) return;
    const has = tags.some((x) => x.toLowerCase() === t.toLowerCase());
    tags = has ? tags : [t, ...tags].slice(0, 6);
    tagInput = '';
  }

  function addQuick(t: string) {
    mode = 'all';
    const clean = t.replace(/^#/, '').trim();
    if (!clean) return;
    const has = tags.some((x) => x.toLowerCase() === clean.toLowerCase());
    tags = has ? tags : [clean, ...tags].slice(0, 6);
  }

  onDestroy(() => {
    // no-op (kept for symmetry)
  });
</script>

<div class="layout">
  <div class="card controls" style="padding: 1rem;">
    <div style="font-size: 1.25rem; font-weight: 950;">Pulse</div>
    <div class="muted" style="margin-top: 0.35rem; line-height: 1.55;">
      Live posts (notes + zaps) from public relays. No backend — just signed events.
    </div>

    <div style="margin-top: 0.9rem;">
      <div class="muted" style="margin-bottom: 0.35rem;">Feed</div>
      <div style="display:flex; gap:0.35rem; flex-wrap:wrap; align-items:center;">
        <button class={`pill ${mode === 'all' ? '' : 'muted'}`} on:click={() => ((mode = 'all'), (tags = []), (authors = []))} title="Show all posts">
          All
        </button>
        <button
          class={`pill ${mode === 'following' ? '' : 'muted'}`}
          disabled={!$isAuthed || $followingLoading}
          on:click={() => {
            mode = 'following';
            void refreshFollowing();
          }}
          title={$isAuthed ? 'Show only people you follow' : 'Connect to use Following feed'}
        >
          Following
        </button>
        {#if mode === 'following'}
          <span class="muted" style="font-size:0.85rem;">
            {$followingLoading ? 'Loading…' : `${$followingSet.size.toLocaleString()} following`}
          </span>
        {/if}
      </div>
      {#if mode === 'following' && $followingError}
        <div class="muted" style="margin-top:0.55rem; color: var(--danger);">{$followingError}</div>
      {/if}
      {#if mode === 'following' && followingPreview.length}
        <div style="margin-top: 0.65rem; display:flex; gap:0.35rem; flex-wrap:wrap;">
          {#each followingPreview as pk (pk)}
            {@const p = $profileByPubkey[pk]}
            {@const name = (p?.display_name || p?.name || pk.slice(0, 10) + '…').trim()}
            <a
              class="pill muted"
              href={`${base}/profile/${npubFor(pk)}`}
              title={name}
              style="display:inline-flex; gap:0.35rem; align-items:center;"
            >
              {#if p?.picture}
                <img src={p.picture} alt="" style="width:16px; height:16px; border-radius:6px; border:1px solid var(--border); object-fit:cover;" />
              {:else}
                <span style="width:16px; height:16px; border-radius:6px; border:1px solid var(--border); background: rgba(255,255,255,0.06); display:inline-block;"></span>
              {/if}
              {name.length > 16 ? `${name.slice(0, 16)}…` : name}
            </a>
          {/each}
          {#if $followingSet.size > followingPreview.length}
            <span class="muted" style="font-size:0.85rem;">+{$followingSet.size - followingPreview.length} more</span>
          {/if}
        </div>
      {/if}

      {#if authors.length && mode !== 'following'}
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
        <button
          class="pill"
          on:click={() => {
            mode = 'all';
            tags = [];
            authors = [];
          }}
          title="Show all posts"
          >All posts</button
        >
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
    <div class="mainCol">
      <ZapStreamScroller />
      <PulseFeed
        {tags}
        {authors}
        limit={40}
        onTrending={(items) => {
          trending = items || [];
          for (const t of trending.slice(0, 8)) void fetchProfileFor(t.pubkey);
        }}
      />
    </div>
    <aside class="sideCol">
      <div class="card" style="padding: 1rem;">
        <div style="font-size: 1.05rem; font-weight: 950;">Trending</div>
        <div class="muted" style="margin-top:0.35rem; line-height: 1.45;">Top posts by zaps/likes in the last ~18 hours.</div>
        {#if trending.length === 0}
          <div class="muted" style="margin-top:0.8rem;">Waiting for stats…</div>
        {:else}
          <div class="grid" style="gap:0.55rem; margin-top:0.8rem;">
            {#each trending.slice(0, 8) as t (t.id)}
              {@const p = $profileByPubkey[t.pubkey]}
              {@const name = (p?.display_name || p?.name || npubFor(t.pubkey).slice(0, 14) + '…').trim()}
              <a class="trend" href={`${base}/profile/${npubFor(t.pubkey)}`} title="View profile">
                <div class="row1">
                  <div class="who">
                    {#if p?.picture}
                      <img src={p.picture} alt="" class="avatar" />
                    {:else}
                      <span class="avatar ph"></span>
                    {/if}
                    <span class="nm">{name}</span>
                  </div>
                  <div class="score muted">⚡ {Math.max(0, Math.floor(t.sats || 0)).toLocaleString()}</div>
                </div>
                <div class="muted blurb">{String(t.content || '').slice(0, 120)}{String(t.content || '').length > 120 ? '…' : ''}</div>
                <div class="muted meta">💬 {t.comments || 0} · 🔁 {t.reposts || 0} · ❤️ {t.likes || 0} · ⚡ {t.zaps || 0}</div>
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </aside>
  </div>
</div>

<style>
  .layout {
    display: grid;
    gap: 1rem;
  }
  @media (min-width: 980px) {
    .layout {
      grid-template-columns: 360px minmax(0, 1fr);
      align-items: start;
    }
    .controls {
      position: sticky;
      top: 92px;
      height: fit-content;
    }
  }
  .feedWrap {
    width: 100%;
    max-width: none;
  }
  @media (min-width: 980px) {
    .feedWrap {
      margin-left: 0;
    }
  }
  @media (min-width: 1120px) {
    .feedWrap {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 360px;
      gap: 1rem;
      align-items: start;
    }
    .sideCol {
      position: sticky;
      top: 92px;
      height: fit-content;
    }
  }
  .mainCol {
    min-width: 0;
  }
  .trend {
    display: grid;
    gap: 0.35rem;
    padding: 0.75rem 0.85rem;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.05);
    text-decoration: none;
  }
  .trend:hover {
    text-decoration: none;
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(246, 196, 83, 0.28);
  }
  .row1 {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: center;
  }
  .who {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }
  .nm {
    font-weight: 900;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .avatar {
    width: 22px;
    height: 22px;
    border-radius: 8px;
    border: 1px solid var(--border);
    object-fit: cover;
    flex-shrink: 0;
  }
  .avatar.ph {
    background: rgba(255, 255, 255, 0.06);
    display: inline-block;
  }
  .blurb {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.35;
    font-size: 0.9rem;
  }
  .meta {
    font-size: 0.84rem;
  }

  @media (max-width: 560px) {
    .controls {
      padding: 0.85rem !important;
    }
    .feedWrap {
      max-width: 100%;
    }
    .layout :global(.row) {
      flex-wrap: wrap;
    }
    .layout :global(.input) {
      min-width: 0;
    }
  }
</style>

