<script lang="ts">
  import { base } from '$app/paths';
  import type { Studio } from '$lib/nostr/studios';
  import { profileByPubkey } from '$lib/stores/profiles';

  export let studio: Studio;

  $: author = $profileByPubkey[studio.pubkey];
  $: authorName = author?.display_name || author?.name || 'Artist';
  $: cover =
    studio.content.picture ||
    studio.content.items.find((i) => i.type === 'image')?.url ||
    author?.picture;
</script>

<a class="card link" href={`${base}/studios/${studio.naddr}`}>
  <div class="thumb">
    {#if cover}
      <img src={cover} alt="" loading="lazy" />
    {:else}
      <div class="placeholder">
        <div class="muted">Studio</div>
      </div>
    {/if}
  </div>

  <div class="body">
    <div class="title">{studio.content.name}</div>
    {#if studio.content.about}
      <div class="muted about">{studio.content.about}</div>
    {/if}
    <div class="meta">
      <span class="pill muted">{authorName}</span>
      <span class="pill muted">{studio.content.items.length} item(s)</span>
      {#if studio.content.channelId}
        <span class="pill">Live chat</span>
      {/if}
      {#if studio.content.streamUrl}
        <span class="pill">Stream</span>
      {/if}
    </div>
  </div>
</a>

<style>
  .link:hover {
    text-decoration: none;
  }
  .thumb {
    height: 170px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid var(--border);
  }
  .thumb img {
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
    display: grid;
    gap: 0.55rem;
  }
  .title {
    font-weight: 950;
    line-height: 1.15;
  }
  .about {
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.2rem;
  }
</style>

