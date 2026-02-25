<script lang="ts">
  import { base } from '$app/paths';
  import type { Listing } from '$lib/nostr/types';
  import { profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';
  import { detectMediaType } from '$lib/ui/media';
  import { profileHover } from '$lib/ui/profile-hover';
  import { liveByHostPubkey } from '$lib/stores/live-by-host';

  export let listing: Listing;

  $: author = $profileByPubkey[listing.pubkey];
  $: authorName = author?.display_name || author?.name || 'Artist';
  $: img = listing.images?.[0];
  $: thumbType = img ? detectMediaType(img) : 'link';
  $: price = listing.priceSats ? `${listing.priceSats.toLocaleString()} sats` : undefined;
  $: live = $liveByHostPubkey[listing.pubkey];

  function openLive(url: string, e: MouseEvent | KeyboardEvent) {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  }
</script>

<a class="card link" href={`${base}/listing/${listing.eventId}`}>
  <div class="thumb">
    {#if img}
      {#if thumbType === 'video'}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video src={img} controls playsinline preload="metadata"></video>
      {:else}
        <img src={img} alt="" loading="lazy" />
      {/if}
    {:else}
      <div class="placeholder">
        <div class="muted">No image</div>
      </div>
    {/if}
  </div>

  <div class="body">
    <div class="top">
      <div class="title">{listing.title}</div>
      <div class="kind pill muted">{listing.kind === 'nip15_product' ? 'Service' : 'Classified'}</div>
    </div>

    {#if listing.summary}
      <div class="muted summary">{listing.summary}</div>
    {/if}

    <div class="meta">
      <div class="author" use:profileHover={listing.pubkey}>
        {#if author?.picture}
          <img src={author.picture} alt="" class="avatar" loading="lazy" />
        {/if}
        <div class="who">
          <div class="name">
            {authorName}
            {#if live}
              <span
                class="live"
                role="link"
                tabindex="0"
                title="Live now"
                on:click={(e) => openLive(live.watchUrl, e)}
                on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && openLive(live.watchUrl, e)}
              >
                LIVE
              </span>
            {/if}
          </div>
          <div class="muted npub">{npubFor(listing.pubkey).slice(0, 14)}…</div>
        </div>
      </div>

      <div class="price">
        {#if price}
          <span class="pill" title="Price">{price}</span>
        {:else}
          <span class="pill muted">Open</span>
        {/if}
      </div>
    </div>

    {#if listing.tags?.length}
      <div class="tags">
        {#each listing.tags.slice(0, 5) as t}
          <span class="pill muted">#{t}</span>
        {/each}
      </div>
    {/if}
  </div>
</a>

<style>
  .link:hover {
    text-decoration: none;
  }
  .card {
    overflow: hidden;
  }
  .thumb {
    height: 180px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid var(--border);
  }
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .thumb video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .placeholder {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
  }
  .body {
    padding: 0.9rem 0.95rem 1rem;
  }
  .top {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    justify-content: space-between;
  }
  .title {
    font-weight: 800;
    line-height: 1.2;
  }
  .kind {
    white-space: nowrap;
    font-size: 0.82rem;
  }
  .summary {
    margin-top: 0.55rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.35;
  }
  .meta {
    margin-top: 0.9rem;
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: space-between;
  }
  .author {
    display: flex;
    gap: 0.65rem;
    align-items: center;
    min-width: 0;
  }
  .avatar {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    border: 1px solid var(--border);
  }
  .who {
    display: grid;
    gap: 0.1rem;
    min-width: 0;
  }
  .name {
    font-weight: 750;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }
  .live {
    font-size: 0.7rem;
    font-weight: 950;
    letter-spacing: 0.6px;
    padding: 0.16rem 0.45rem;
    border-radius: 999px;
    background: rgba(239, 68, 68, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: white;
    flex: 0 0 auto;
    text-decoration: none;
  }
  .live:hover {
    text-decoration: none;
    opacity: 0.92;
  }
  .npub {
    font-size: 0.82rem;
  }
  .tags {
    margin-top: 0.85rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }
</style>

