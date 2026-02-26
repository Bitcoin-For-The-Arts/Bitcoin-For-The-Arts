<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { nip19 } from 'nostr-tools';
  import { ensureNdk } from '$lib/stores/ndk';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import { parseStudioEvent, type Studio, type StudioItem } from '$lib/nostr/studios';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import ZapComposer from '$lib/components/ZapComposer.svelte';
  import ChannelChat from '$lib/components/ChannelChat.svelte';
  import ContentBody from '$lib/components/ContentBody.svelte';
  import { publishComment } from '$lib/nostr/publish';
  import { npubFor } from '$lib/nostr/helpers';

  let studio: Studio | null = null;
  let error: string | null = null;
  let loading = true;

  let zapOpen = false;
  let selectedItem: StudioItem | null = null;

  type Guestbook = { id: string; pubkey: string; content: string; createdAt: number };
  let guestbook: Guestbook[] = [];
  let note = '';
  let noteBusy = false;
  let noteError: string | null = null;

  let stop: (() => void) | null = null;

  $: author = studio ? $profileByPubkey[studio.pubkey] : undefined;
  $: authorName = author?.display_name || author?.name || 'Artist';
  $: authorNpub = studio ? npubFor(studio.pubkey) : '';

  async function load() {
    loading = true;
    error = null;
    studio = null;
    guestbook = [];
    if (stop) stop();
    stop = null;

    const naddr = String($page.params.naddr || '');
    try {
      const decoded = nip19.decode(naddr);
      if (decoded.type !== 'naddr') throw new Error('Invalid studio link (expected naddr).');
      const data = decoded.data as any;
      const ndk = await ensureNdk();
      const ev = await ndk.fetchEvent({
        kinds: [NOSTR_KINDS.bfta_studio],
        authors: [data.pubkey],
        '#d': [data.identifier],
        limit: 1,
      } as any);
      if (!ev) throw new Error('Studio not found on connected relays.');

      const parsed = parseStudioEvent(ev as any);
      if (!parsed) throw new Error('Failed to parse studio.');
      studio = parsed;
      void fetchProfileFor(parsed.pubkey);

      const sub = ndk.subscribe(
        {
          kinds: [NOSTR_KINDS.note],
          '#a': [parsed.address],
          limit: 200,
        } as any,
        { closeOnEose: false },
      );

      sub.on('event', (cev) => {
        guestbook = [
          ...guestbook.filter((g) => g.id !== cev.id),
          { id: cev.id!, pubkey: cev.pubkey!, content: cev.content || '', createdAt: cev.created_at! },
        ].sort((a, b) => b.createdAt - a.createdAt);
        void fetchProfileFor(cev.pubkey!);
      });
      stop = () => sub.stop();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  async function signGuestbook() {
    if (!studio) return;
    noteError = null;
    noteBusy = true;
    try {
      await publishComment({
        rootEventId: studio.eventId,
        rootAddress: studio.address,
        content: note.trim(),
        tags: ['studio'],
      });
      note = '';
    } catch (e) {
      noteError = e instanceof Error ? e.message : String(e);
    } finally {
      noteBusy = false;
    }
  }

  onMount(() => void load());
  onDestroy(() => {
    if (stop) stop();
  });
</script>

{#if loading}
  <div class="card" style="padding: 1rem;">
    <div class="muted">Loading studio…</div>
  </div>
{:else if error}
  <div class="card" style="padding: 1rem; border-color: rgba(251,113,133,0.35);">
    <div class="muted">{error}</div>
  </div>
{:else if studio}
  <div class="grid cols-2">
    <div class="card" style="padding: 1rem;">
      <div class="pill muted">Virtual Studio • kind:{studio.kind}</div>
      <div style="margin-top:0.7rem; font-size: 1.55rem; font-weight: 980; line-height:1.15;">
        {studio.content.name}
      </div>
      {#if studio.content.about}
        <div class="muted" style="margin-top:0.75rem; line-height:1.6;">
          {studio.content.about}
        </div>
      {/if}

      <div class="card" style="margin-top: 1rem; padding: 0.9rem; background: rgba(0,0,0,0.18);">
        <div class="muted">Artist</div>
        <div style="display:flex; gap:0.7rem; align-items:center; margin-top: 0.55rem;">
          {#if author?.picture}
            <img src={author.picture} alt="" style="width:46px; height:46px; border-radius:16px; border:1px solid var(--border); object-fit:cover;" />
          {/if}
          <div style="min-width:0;">
            <div style="font-weight: 900;">{authorName}</div>
            <a class="muted" href={`${base}/profile/${authorNpub}`} style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
              {authorNpub.slice(0, 18)}…
            </a>
          </div>
        </div>
        <div style="margin-top: 0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button class="btn primary" on:click={() => (zapOpen = true)}>Zap / Pay</button>
          <a class="btn" href={`https://njump.me/${studio.naddr}`} target="_blank" rel="noreferrer">Open in njump</a>
        </div>
      </div>

      <div style="margin-top: 1rem;">
        <div class="muted" style="margin-bottom:0.35rem;">Studio items</div>
        <div class="grid cols-2">
          {#each studio.content.items as item (item.url)}
            <button class="card item" on:click={() => (selectedItem = item)} style="padding: 0; overflow:hidden; text-align:left;">
              {#if item.type === 'image'}
                <img src={item.url} alt="" loading="lazy" style="width:100%; height:170px; object-fit:cover; display:block;" />
              {:else if item.type === 'video'}
                <!-- svelte-ignore a11y_media_has_caption -->
                <video
                  src={item.url}
                  controls
                  playsinline
                  preload="metadata"
                  style="width:100%; height:170px; object-fit:cover; display:block;"
                ></video>
              {:else}
                <div style="padding: 0.85rem 0.95rem;">
                  <div style="font-weight: 900;">{item.title || (item.type === 'video' ? 'Video' : 'Link')}</div>
                  <div class="muted" style="margin-top:0.35rem; word-break:break-word;">{item.url}</div>
                </div>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <div>
      {#if studio.content.channelId}
        <ChannelChat channelId={studio.content.channelId} compact={true} />
      {/if}

      <div class="card" style="padding: 1rem; margin-top: {studio.content.channelId ? '1rem' : '0'};">
        <div style="font-weight: 950;">Guestbook</div>
        <div class="muted" style="margin-top:0.35rem; line-height:1.5;">
          Leave a note in this studio. It’s a public Nostr reply tagged to the studio address (no platform database).
        </div>

        <div style="margin-top: 0.85rem;">
          <textarea class="textarea" bind:value={note} placeholder="Say hi, leave feedback, propose a collab…"></textarea>
          <div style="margin-top: 0.65rem; display:flex; gap:0.5rem; align-items:center;">
            <button class="btn primary" disabled={noteBusy || !note.trim()} on:click={signGuestbook}>
              {noteBusy ? 'Posting…' : 'Post note'}
            </button>
            {#if noteError}<span class="muted">{noteError}</span>{/if}
          </div>
        </div>
      </div>

      <div style="margin-top: 1rem; display:grid; gap:0.6rem;">
        {#each guestbook as g (g.id)}
          <div class="card" style="padding: 0.85rem 1rem;">
            <div class="muted" style="font-size: 0.88rem;">
              {npubFor(g.pubkey).slice(0, 18)}… • {new Date(g.createdAt * 1000).toLocaleString()}
            </div>
            <div style="margin-top: 0.45rem; line-height: 1.5;"><ContentBody text={g.content} maxUrls={3} compactLinks={true} /></div>
          </div>
        {/each}
        {#if guestbook.length === 0}
          <div class="card" style="padding: 1rem;">
            <div class="muted">No notes yet.</div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <ZapComposer
    open={zapOpen}
    recipientPubkey={studio.pubkey}
    recipientLabel={authorName}
    address={studio.address}
    onClose={() => (zapOpen = false)}
  />

  {#if selectedItem}
    <div
      class="backdrop"
      role="button"
      aria-label="Close"
      tabindex="0"
      on:click|self={() => (selectedItem = null)}
      on:keydown={(e) => e.key === 'Escape' && (selectedItem = null)}
    >
      <div class="card modal" style="padding: 1rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem;">
          <div style="font-weight: 950;">{selectedItem.title || 'Studio item'}</div>
          <button class="btn" on:click={() => (selectedItem = null)}>Close</button>
        </div>
        <div class="muted" style="margin-top:0.5rem; word-break: break-word;">
          <a href={selectedItem.url} target="_blank" rel="noreferrer">{selectedItem.url}</a>
        </div>
        {#if selectedItem.type === 'image'}
          <div style="margin-top: 0.85rem;">
            <img src={selectedItem.url} alt="" style="width:100%; border-radius: 14px; border:1px solid var(--border);" />
          </div>
        {:else if selectedItem.type === 'video'}
          <div style="margin-top: 0.85rem;">
            <!-- svelte-ignore a11y_media_has_caption -->
            <video
              src={selectedItem.url}
              controls
              playsinline
              preload="metadata"
              style="width:100%; border-radius: 14px; border:1px solid var(--border); background: rgba(0,0,0,0.25);"
            ></video>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <style>
    .item:hover {
      border-color: rgba(246, 196, 83, 0.35);
    }
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      display: grid;
      place-items: center;
      padding: 1.25rem;
      z-index: 100;
    }
    .modal {
      width: min(860px, 100%);
      max-height: min(86vh, 900px);
      overflow: auto;
    }
  </style>
{/if}

