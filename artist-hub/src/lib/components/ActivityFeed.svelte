<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { ensureNdk } from '$lib/stores/ndk';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';

  type Item =
    | { kind: 'note'; id: string; pubkey: string; createdAt: number; content: string }
    | { kind: 'zap'; id: string; pubkey: string; createdAt: number; sats?: number; comment?: string };

  export let title = 'Live Activity';
  export let tags: string[] = [];
  export let eventId: string | undefined = undefined;
  export let address: string | undefined = undefined;
  export let limit = 50;

  let items: Item[] = [];
  let error: string | null = null;
  let loading = false;
  let stop: (() => void) | null = null;

  function parseZap(ev: any): Item | null {
    const tags = (ev.tags as string[][]) || [];
    let sats: number | undefined;
    const amountTag = tags.find((t) => t[0] === 'amount')?.[1];
    if (amountTag && !Number.isNaN(Number(amountTag))) sats = Math.floor(Number(amountTag) / 1000);

    const desc = tags.find((t) => t[0] === 'description')?.[1];
    let comment: string | undefined;
    if (desc) {
      try {
        const j = JSON.parse(desc);
        if (typeof j?.content === 'string' && j.content.trim()) comment = j.content.trim();
        if (!sats && Array.isArray(j?.tags)) {
          const amt = j.tags.find((t: any) => Array.isArray(t) && t[0] === 'amount')?.[1];
          if (amt && !Number.isNaN(Number(amt))) sats = Math.floor(Number(amt) / 1000);
        }
      } catch {
        // ignore
      }
    }

    return {
      kind: 'zap',
      id: ev.id,
      pubkey: ev.pubkey,
      createdAt: ev.created_at,
      sats,
      comment,
    };
  }

  function parseNote(ev: any): Item | null {
    const content = (ev.content || '').trim();
    if (!content) return null;
    return {
      kind: 'note',
      id: ev.id,
      pubkey: ev.pubkey,
      createdAt: ev.created_at,
      content,
    };
  }

  async function start() {
    error = null;
    loading = true;
    items = [];
    if (stop) stop();
    stop = null;

    try {
      const ndk = await ensureNdk();
      const cleanTags = tags.map((t) => t.replace(/^#/, '')).filter(Boolean).slice(0, 6);

      const filter: any = {
        kinds: [1, 9735],
        limit,
      };
      if (eventId) filter['#e'] = [eventId];
      if (address) filter['#a'] = [address];
      if (cleanTags.length) filter['#t'] = cleanTags;

      const sub = ndk.subscribe(filter, { closeOnEose: false });
      sub.on('event', (ev) => {
        let item: Item | null = null;
        if (ev.kind === 1) item = parseNote(ev);
        if (ev.kind === 9735) item = parseZap(ev);
        if (!item) return;

        items = [item, ...items.filter((x) => x.id !== item!.id)]
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, limit);

        void fetchProfileFor(item.pubkey);
      });
      sub.on('eose', () => (loading = false));
      stop = () => sub.stop();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      loading = false;
    }
  }

  onMount(() => void start());
  let lastKey = '';
  $: {
    const key = JSON.stringify({
      tags: tags.map((t) => t.replace(/^#/, '')).filter(Boolean).slice(0, 6),
      eventId: eventId || '',
      address: address || '',
      limit,
    });
    if (key !== lastKey) {
      lastKey = key;
      void start();
    }
  }

  onDestroy(() => {
    if (stop) stop();
  });
</script>

<div class="card" style="padding: 1rem;">
  <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem;">
    <div style="font-weight: 950;">{title}</div>
    <div class="muted">{#if loading}Live…{/if}</div>
  </div>
  {#if tags.length}
    <div style="margin-top:0.55rem; display:flex; gap:0.35rem; flex-wrap:wrap;">
      {#each tags.slice(0, 6) as t}
        <span class="pill muted">#{t.replace(/^#/, '')}</span>
      {/each}
    </div>
  {/if}

  {#if error}
    <div class="muted" style="margin-top:0.75rem; color: var(--danger);">{error}</div>
  {/if}

  <div style="margin-top: 0.85rem; display:grid; gap:0.6rem;">
    {#each items as it (it.id)}
      <div class="row">
        <div class="who">
          {#if $profileByPubkey[it.pubkey]?.picture}
            <img src={$profileByPubkey[it.pubkey].picture} alt="" class="avatar" />
          {/if}
          <div class="meta">
            <div class="name">
              {$profileByPubkey[it.pubkey]?.display_name ||
                $profileByPubkey[it.pubkey]?.name ||
                npubFor(it.pubkey).slice(0, 12) + '…'}
            </div>
            <div class="muted small">{new Date(it.createdAt * 1000).toLocaleTimeString()}</div>
          </div>
        </div>

        <div class="body">
          {#if it.kind === 'zap'}
            <div class="pill">
              Zap{it.sats ? ` • ${it.sats.toLocaleString()} sats` : ''}
            </div>
            {#if it.comment}
              <div class="muted" style="margin-top:0.35rem; line-height:1.45; white-space: pre-wrap;">{it.comment}</div>
            {/if}
          {:else}
            <div style="line-height:1.45; white-space: pre-wrap;">{it.content}</div>
          {/if}
        </div>
      </div>
    {/each}

    {#if !items.length && !loading}
      <div class="muted">No activity found yet.</div>
    {/if}
  </div>
</div>

<style>
  .row {
    display: grid;
    gap: 0.35rem;
    padding: 0.75rem 0.85rem;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: rgba(0, 0, 0, 0.16);
  }
  .who {
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }
  .avatar {
    width: 26px;
    height: 26px;
    border-radius: 10px;
    border: 1px solid var(--border);
    object-fit: cover;
  }
  .meta {
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
    min-width: 0;
  }
  .name {
    font-weight: 900;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 260px;
  }
  .small {
    font-size: 0.86rem;
  }
</style>

