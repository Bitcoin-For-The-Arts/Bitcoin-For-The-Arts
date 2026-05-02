<script lang="ts">
  import { onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { nip19 } from 'nostr-tools';
  import { ensureNdk } from '$lib/stores/ndk';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import { profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';

  export let placeholder = 'Search people (name or npub)…';
  export let compact = false;

  let q = '';
  let open = false;
  let searching = false;
  let error: string | null = null;
  let remoteHits: Array<{ pubkey: string; name: string }> = [];
  let stopSearch: (() => void) | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function parseProfileContent(content: string): any | null {
    try {
      const j = JSON.parse(content);
      return j && typeof j === 'object' ? j : null;
    } catch {
      return null;
    }
  }

  function parseToHexPubkey(input: string): string | null {
    const raw = (input || '').trim();
    if (!raw) return null;
    const v = raw.startsWith('nostr:') ? raw.slice('nostr:'.length) : raw;
    if (/^[0-9a-f]{64}$/i.test(v)) return v.toLowerCase();
    try {
      const decoded = nip19.decode(v);
      if (decoded.type === 'npub') return String(decoded.data).toLowerCase();
      if (decoded.type === 'nprofile') return String((decoded.data as any)?.pubkey || '').toLowerCase() || null;
    } catch {
      // ignore
    }
    return null;
  }

  async function runRemoteProfileSearch(query: string) {
    if (stopSearch) stopSearch();
    stopSearch = null;
    remoteHits = [];
    error = null;

    const qq = (query || '').trim();
    if (qq.length < 2) return;

    searching = true;
    try {
      const ndk = await ensureNdk();
      const buf: Array<{ pubkey: string; name: string }> = [];
      const seen = new Set<string>();

      // NIP-50 search for kind:0 metadata (best-effort; not all relays support).
      const sub = ndk.subscribe({ kinds: [NOSTR_KINDS.metadata], search: qq, limit: 60 } as any, { closeOnEose: true });
      stopSearch = () => sub.stop();

      sub.on('event', (ev: any) => {
        const pk = String(ev?.pubkey || '').trim().toLowerCase();
        if (!pk || seen.has(pk)) return;
        const prof = parseProfileContent(String(ev?.content || ''));
        const name = String((prof?.display_name || prof?.name || '') ?? '').trim();
        if (!name) return;
        seen.add(pk);
        buf.push({ pubkey: pk, name });

        // Seed local cache for avatar/name rendering.
        profileByPubkey.update((m) => ({ ...m, [pk]: prof }));
      });

      await new Promise<void>((resolve) => sub.on('eose', () => resolve()));

      remoteHits = buf
        .filter((x) => x.name.toLowerCase().includes(qq.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 10);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      searching = false;
    }
  }

  $: suggestions = (() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    // Prefer remote; fallback to local cache.
    if (remoteHits.length) return remoteHits;
    const entries = Object.entries($profileByPubkey || {});
    return entries
      .map(([pk, p]) => ({ pubkey: pk, name: (p?.display_name || p?.name || '').trim() }))
      .filter((x) => x.name && x.name.toLowerCase().includes(query))
      .slice(0, 10);
  })();

  function close() {
    open = false;
  }

  async function goToProfile(pkHex: string) {
    const npub = npubFor(pkHex);
    close();
    await goto(`${base}/profile/${npub}`);
  }

  async function submit() {
    const v = q.trim();
    if (!v) return;
    const pk = parseToHexPubkey(v);
    if (pk) {
      await goToProfile(pk);
      return;
    }
    if (suggestions.length) {
      await goToProfile(suggestions[0].pubkey);
      return;
    }
    // No-op if it looks like a name but no relay support.
    open = true;
  }

  // Debounced remote search
  $: {
    const query = q.trim();
    if (!query || query.startsWith('#') || query.startsWith('npub') || query.startsWith('nprofile') || /^[0-9a-f]{64}$/i.test(query)) {
      if (timer) clearTimeout(timer);
      if (stopSearch) stopSearch();
      stopSearch = null;
      remoteHits = [];
      error = null;
      searching = false;
    } else {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void runRemoteProfileSearch(query), 250);
    }
  }

  onDestroy(() => {
    if (timer) clearTimeout(timer);
    if (stopSearch) stopSearch();
  });
</script>

<div class={`wrap ${compact ? 'compact' : ''}`} on:focusin={() => (open = true)} on:focusout={() => setTimeout(() => close(), 120)}>
  <div class="row">
    <input
      class="input"
      bind:value={q}
      {placeholder}
      on:focus={() => (open = true)}
      on:keydown={(e) => e.key === 'Enter' && submit()}
    />
    <button class="btn" on:click={submit} aria-label="Search">Search</button>
  </div>

  {#if open && (suggestions.length || searching || error)}
    <div class="card results">
      <div class="muted head">
        {#if searching}
          Searching relays…
        {:else if error}
          {error}
        {:else}
          People
        {/if}
      </div>
      <div class="list">
        {#each suggestions as s (s.pubkey)}
          <button class="item" on:click={() => goToProfile(s.pubkey)}>
            <span class="name">{s.name}</span>
            <span class="muted mono">{npubFor(s.pubkey).slice(0, 12)}…</span>
          </button>
        {/each}
        {#if !searching && !error && suggestions.length === 0}
          <div class="muted empty">No matches.</div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .wrap {
    position: relative;
    width: 100%;
    max-width: 460px;
  }
  .wrap.compact {
    max-width: 360px;
  }
  .row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .results {
    position: absolute;
    z-index: 60;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    padding: 0.65rem;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(14px);
  }
  .head {
    font-size: 0.85rem;
    margin-bottom: 0.45rem;
  }
  .list {
    display: grid;
    gap: 0.35rem;
  }
  .item {
    width: 100%;
    text-align: left;
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: baseline;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text);
    border-radius: 12px;
    padding: 0.5rem 0.6rem;
    cursor: pointer;
  }
  .item:hover {
    background: rgba(255, 255, 255, 0.08);
    text-decoration: none;
  }
  .name {
    font-weight: 850;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 0.82rem;
    flex-shrink: 0;
  }
  .empty {
    padding: 0.35rem 0.2rem;
  }
</style>

