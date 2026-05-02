<script lang="ts">
  import type { HubEvent } from '$lib/nostr/events';
  import { profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';
  import { profileHover } from '$lib/ui/profile-hover';

  export let ev: HubEvent;

  $: author = $profileByPubkey[ev.pubkey];
  $: authorName = author?.display_name || author?.name || 'Host';
  $: cover = ev.images?.[0] || author?.picture;
  $: startText = ev.start ? new Date(ev.start * 1000).toLocaleString() : undefined;
</script>

<div class="card wrap">
  <div class="thumb">
    {#if cover}
      <img src={cover} alt="" loading="lazy" />
    {:else}
      <div class="placeholder muted">Event</div>
    {/if}
  </div>
  <div class="body">
    <div class="title">{ev.title}</div>
    {#if ev.summary}
      <div class="muted summary">{ev.summary}</div>
    {/if}
    <div class="meta">
      {#if startText}<span class="pill">{startText}</span>{/if}
      {#if ev.location}<span class="pill muted">{ev.location}</span>{/if}
      <span class="pill muted" use:profileHover={ev.pubkey}>{authorName}</span>
      <span class="pill muted" use:profileHover={ev.pubkey}>{npubFor(ev.pubkey).slice(0, 12)}…</span>
    </div>
    <div class="row">
      {#if ev.url}
        <a class="btn primary" href={ev.url} target="_blank" rel="noreferrer">Open</a>
      {/if}
      <a class="btn" href={`https://njump.me/${ev.eventId}`} target="_blank" rel="noreferrer">View on Nostr</a>
    </div>
  </div>
</div>

<style>
  .wrap {
    overflow: hidden;
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
  .summary {
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .meta {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }
  .row {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.2rem;
  }
</style>

