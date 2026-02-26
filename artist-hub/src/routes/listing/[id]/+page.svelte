<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { ensureNdk } from '$lib/stores/ndk';
  import { eventToListing } from '$lib/nostr/parse';
  import type { Listing } from '$lib/nostr/types';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';
  import DMComposer from '$lib/components/DMComposer.svelte';
  import ZapComposer from '$lib/components/ZapComposer.svelte';
  import { publishComment } from '$lib/nostr/publish';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import ContentBody from '$lib/components/ContentBody.svelte';
  import { parseZapReceipt } from '$lib/nostr/zap-receipts';

  type Comment = { id: string; pubkey: string; content: string; createdAt: number };

  let listing: Listing | null = null;
  let rawKind: number | null = null;
  let loading = true;
  let error: string | null = null;

  let dmOpen = false;
  let zapOpen = false;

  let comments: Comment[] = [];
  let commentText = '';
  let commentBusy = false;
  let commentError: string | null = null;

  let zapReceipts = 0;
  let stop: (() => void) | null = null;

  $: author = listing ? $profileByPubkey[listing.pubkey] : undefined;
  $: authorName = author?.display_name || author?.name || 'Artist';
  $: authorNpub = listing ? npubFor(listing.pubkey) : '';

  async function load() {
    loading = true;
    error = null;
    listing = null;
    comments = [];
    zapReceipts = 0;
    if (stop) stop();
    stop = null;

    const id = String($page.params.id || '');
    try {
      const ndk = await ensureNdk();
      const ev = await ndk.fetchEvent(id);
      if (!ev) throw new Error('Listing not found on connected relays.');

      rawKind = ev.kind ?? null;
      const l = eventToListing(ev as any);
      if (!l) throw new Error('Unsupported listing kind.');
      listing = l;
      void fetchProfileFor(l.pubkey);

      const sub = ndk.subscribe(
        {
          kinds: [NOSTR_KINDS.note, NOSTR_KINDS.nip57_zap_receipt],
          // Notes use '#e' reliably; zap receipts are best-effort here and filtered client-side.
          '#e': [id],
          limit: 200,
        },
        { closeOnEose: false },
      );
      const subZaps = ndk.subscribe(
        { kinds: [NOSTR_KINDS.nip57_zap_receipt], '#p': [ev.pubkey!], since: Math.max(0, (ev.created_at || 0) - 60), limit: 800 } as any,
        { closeOnEose: false },
      );

      sub.on('event', (cev) => {
        if (cev.kind === NOSTR_KINDS.note) {
          comments = [
            ...comments.filter((c) => c.id !== cev.id),
            { id: cev.id!, pubkey: cev.pubkey!, content: cev.content || '', createdAt: cev.created_at! },
          ].sort((a, b) => b.createdAt - a.createdAt);
          void fetchProfileFor(cev.pubkey!);
        }
      });
      subZaps.on('event', (z) => {
        const parsed = parseZapReceipt(z as any);
        if (!parsed?.eTags?.includes(id)) return;
        zapReceipts += 1;
      });

      stop = () => {
        sub.stop();
        subZaps.stop();
      };
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  async function postComment() {
    if (!listing) return;
    commentError = null;
    commentBusy = true;
    try {
      await publishComment({
        rootEventId: listing.eventId,
        rootAddress: listing.address,
        content: commentText.trim(),
        tags: ['review'],
      });
      commentText = '';
    } catch (e) {
      commentError = e instanceof Error ? e.message : String(e);
    } finally {
      commentBusy = false;
    }
  }

  onMount(() => void load());
  onDestroy(() => {
    if (stop) stop();
  });
</script>

{#if loading}
  <div class="card" style="padding: 1rem;">
    <div class="muted">Loading listing from relays…</div>
  </div>
{:else if error}
  <div class="card" style="padding: 1rem; border-color: rgba(251,113,133,0.35);">
    <div class="muted">{error}</div>
  </div>
{:else if listing}
  <div class="grid cols-2">
    <div class="card" style="padding: 1rem;">
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center; justify-content:space-between;">
        <div class="pill muted">{listing.kind === 'nip15_product' ? 'Service (NIP-15)' : 'Classified (NIP-99)'}</div>
        <div class="pill muted">kind:{rawKind}</div>
      </div>

      <div style="margin-top: 0.75rem; font-size: 1.5rem; font-weight: 950; line-height:1.15;">
        {listing.title}
      </div>

      {#if listing.priceSats}
        <div style="margin-top: 0.55rem;">
          <span class="pill">Price: {listing.priceSats.toLocaleString()} sats</span>
        </div>
      {/if}

      <div class="muted" style="margin-top: 0.85rem; line-height: 1.6; white-space: pre-wrap;">
        {listing.description || listing.summary || ''}
      </div>

      {#if listing.images.length}
        <div style="margin-top: 0.9rem; display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:0.5rem;">
          {#each listing.images.slice(0, 6) as img}
            <a href={img} target="_blank" rel="noreferrer" class="card" style="overflow:hidden;">
              {#if img.toLowerCase().match(/\.(mp4|webm|mov|m4v)(\?|#|$)/)}
                <!-- svelte-ignore a11y_media_has_caption -->
                <video
                  src={img}
                  controls
                  playsinline
                  preload="metadata"
                  style="width:100%; height:160px; object-fit:cover; display:block;"
                ></video>
              {:else}
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  style="width:100%; height:160px; object-fit:cover; display:block;"
                />
              {/if}
            </a>
          {/each}
        </div>
      {/if}

      {#if listing.tags.length}
        <div style="margin-top: 0.9rem; display:flex; gap:0.35rem; flex-wrap:wrap;">
          {#each listing.tags as t}
            <span class="pill muted">#{t}</span>
          {/each}
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
          <button class="btn" on:click={() => (dmOpen = true)}>Message</button>
          <button class="btn primary" on:click={() => (zapOpen = true)}>Zap / Pay</button>
          <span class="pill muted" title="Zap receipts (best-effort)">Zaps: {zapReceipts}</span>
        </div>
      </div>
    </div>

    <div>
      <div class="card" style="padding: 1rem;">
        <div style="font-size: 1.15rem; font-weight: 900;">Comments / reviews</div>
        <div class="muted" style="margin-top: 0.35rem; line-height: 1.5;">
          Replies are regular notes (kind:1) tagged to this listing. Use them as public reviews, questions, and updates.
        </div>
      </div>

      <div class="card" style="margin-top: 1rem; padding: 1rem;">
        <textarea class="textarea" bind:value={commentText} placeholder="Write a comment (public)…"></textarea>
        <div style="margin-top: 0.7rem; display:flex; gap:0.5rem; align-items:center;">
          <button class="btn primary" disabled={commentBusy || !commentText.trim()} on:click={postComment}>
            {commentBusy ? 'Posting…' : 'Post comment'}
          </button>
          {#if commentError}<span class="muted">{commentError}</span>{/if}
        </div>
      </div>

      <div style="margin-top: 1rem; display:grid; gap:0.6rem;">
        {#each comments as c (c.id)}
          <div class="card" style="padding: 0.85rem 1rem;">
            <div class="muted" style="font-size: 0.88rem;">
              {npubFor(c.pubkey).slice(0, 18)}… • {new Date(c.createdAt * 1000).toLocaleString()}
            </div>
            <div style="margin-top: 0.45rem; line-height: 1.5;"><ContentBody text={c.content} maxUrls={3} compactLinks={true} /></div>
          </div>
        {/each}
        {#if comments.length === 0}
          <div class="card" style="padding: 1rem;">
            <div class="muted">No comments yet.</div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <DMComposer
    open={dmOpen}
    toPubkey={listing.pubkey}
    toLabel={authorName}
    onClose={() => (dmOpen = false)}
  />

  <ZapComposer
    open={zapOpen}
    recipientPubkey={listing.pubkey}
    recipientLabel={authorName}
    eventId={listing.eventId}
    address={listing.address}
    onClose={() => (zapOpen = false)}
  />
{/if}

