<script lang="ts">
  import { onDestroy } from 'svelte';
  import PulseFeed from '$lib/components/PulseFeed.svelte';
  import ZapStreamScroller from '$lib/components/ZapStreamScroller.svelte';
  import { nip19 } from 'nostr-tools';
  import { profileByPubkey } from '$lib/stores/profiles';
  import { ensureNdk } from '$lib/stores/ndk';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import { isAuthed } from '$lib/stores/auth';
  import { followingError, followingLoading, followingSet, refreshFollowing } from '$lib/stores/follows';

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

  $: if (mode === 'following') {
    tags = [];
    const list = Array.from($followingSet || []).filter(Boolean);
    authors = list.slice(0, 120);
  }

  let tagInput = '';
  let search = '';
  let searching = false;
  let searchError: string | null = null;
  let remoteHits: Array<{ pubkey: string; name: string }> = [];
  let stopSearch: (() => void) | null = null;
  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  function addTag() {
    mode = 'all';
    const t = tagInput.trim().replace(/^#/, '');
    if (!t) return;
    const has = tags.some((x) => x.toLowerCase() === t.toLowerCase());
    tags = has ? tags : [t, ...tags].slice(0, 6);
    tagInput = '';
  }

  function addTagFromSearch() {
    mode = 'all';
    const t = search.trim().replace(/^#/, '');
    if (!t) return;
    const has = tags.some((x) => x.toLowerCase() === t.toLowerCase());
    tags = has ? tags : [t, ...tags].slice(0, 6);
    search = '';
  }

  function addAuthor(pubkeyHex: string) {
    mode = 'all';
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
    mode = 'all';
    const q = search.trim();
    if (!q) return;
    if (q.startsWith('#')) {
      addTagFromSearch();
      return;
    }
    addAuthorFromSearch();
  }

  function addQuick(t: string) {
    mode = 'all';
    const clean = t.replace(/^#/, '').trim();
    if (!clean) return;
    const has = tags.some((x) => x.toLowerCase() === clean.toLowerCase());
    tags = has ? tags : [clean, ...tags].slice(0, 6);
  }

  function parseProfileContent(content: string): any | null {
    try {
      const j = JSON.parse(content);
      if (!j || typeof j !== 'object') return null;
      return j;
    } catch {
      return null;
    }
  }

  async function runRemoteProfileSearch(q: string) {
    if (stopSearch) stopSearch();
    stopSearch = null;
    remoteHits = [];
    searchError = null;

    const query = (q || '').trim();
    if (query.length < 2) return;

    searching = true;
    try {
      const ndk = await ensureNdk();
      const buf: Array<{ pubkey: string; name: string }> = [];
      const seen = new Set<string>();

      // NIP-50-style search for kind:0 metadata. Not all relays support this.
      const sub = ndk.subscribe({ kinds: [NOSTR_KINDS.metadata], search: query, limit: 60 } as any, { closeOnEose: true });
      stopSearch = () => sub.stop();
      sub.on('event', (ev: any) => {
        const pk = String(ev?.pubkey || '');
        if (!pk || seen.has(pk)) return;
        const prof = parseProfileContent(String(ev?.content || ''));
        const name = String((prof?.display_name || prof?.name || '') ?? '').trim();
        if (!name) return;
        seen.add(pk);
        buf.push({ pubkey: pk, name });

        // Seed local profile cache so other parts of the UI can show names immediately.
        profileByPubkey.update((m) => ({ ...m, [pk]: prof }));
      });
      await new Promise<void>((resolve) => sub.on('eose', () => resolve()));

      remoteHits = buf
        .filter((x) => x.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 10);
    } catch (e) {
      searchError = e instanceof Error ? e.message : String(e);
    } finally {
      searching = false;
    }
  }

  // Auto-search as the user types (debounced).
  $: if (typeof window !== 'undefined') {
    const q = search.trim();
    if (!q || q.startsWith('#') || q.startsWith('npub') || q.startsWith('nprofile')) {
      if (stopSearch) stopSearch();
      stopSearch = null;
      remoteHits = [];
      searchError = null;
      searching = false;
    } else {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(() => void runRemoteProfileSearch(q), 250);
    }
  }

  $: suggestions = (() => {
    const q = search.trim().toLowerCase();
    if (!q || q.startsWith('#') || q.startsWith('npub') || q.startsWith('nprofile')) return [];

    // Prefer remote search results; fallback to locally-known profiles.
    if (remoteHits.length) return remoteHits;
    const entries = Object.entries($profileByPubkey || {});
    return entries
      .map(([pk, p]) => ({ pubkey: pk, name: (p?.display_name || p?.name || '').trim() }))
      .filter((x) => x.name && x.name.toLowerCase().includes(q))
      .slice(0, 10);
  })();

  onDestroy(() => {
    if (searchTimer) clearTimeout(searchTimer);
    if (stopSearch) stopSearch();
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
          <div class="muted" style="font-size:0.85rem; margin-bottom:0.4rem;">
            Matches {searching ? '• searching…' : ''}
          </div>
          <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
            {#each suggestions as s}
              <button class="pill muted" on:click={() => addAuthor(s.pubkey)} title="Filter by this author">
                {s.name}
              </button>
            {/each}
          </div>
        </div>
      {/if}
      {#if !suggestions.length && searching}
        <div class="muted" style="margin-top:0.6rem;">Searching relays…</div>
      {/if}
      {#if searchError}
        <div class="muted" style="margin-top:0.6rem; color: var(--danger);">{searchError}</div>
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

