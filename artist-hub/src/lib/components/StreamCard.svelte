<script lang="ts">
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import type { LiveEvent30311 } from '$lib/nostr/nip53';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';
  import { onMount } from 'svelte';
  import { profileHover } from '$lib/ui/profile-hover';

  export let stream: LiveEvent30311;

  $: host = $profileByPubkey[stream.hostPubkey];
  $: hostName = host?.display_name || host?.name || 'Host';
  $: thumb = stream.thumb || stream.image;
  $: hostHref = `${base}/profile/${npubFor(stream.hostPubkey)}`;

  onMount(() => {
    void fetchProfileFor(stream.hostPubkey);
  });

  function openHost(e: MouseEvent | KeyboardEvent) {
    e.preventDefault();
    e.stopPropagation();
    void goto(hostHref);
  }
</script>

<a class="card item" href={stream.watchUrl} target="_blank" rel="noreferrer" aria-label={`Watch ${stream.title}`}>
  <div class="thumb" style={`background-image:url('${(thumb || '').replace(/'/g, '%27')}')`}>
    <div class="badge">LIVE</div>
    {#if stream.currentParticipants > 0}
      <div class="count">👁 {stream.currentParticipants}</div>
    {/if}
  </div>

  <div class="meta">
    <div class="name">{stream.title}</div>
    <div class="by muted">
      by
      <span
        class="who"
        role="link"
        tabindex="0"
        use:profileHover={stream.hostPubkey}
        on:click={openHost}
        on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && openHost(e)}
      >
        {hostName}
      </span>
    </div>
    {#if stream.summary}
      <div class="muted summary">{stream.summary}</div>
    {/if}
  </div>
</a>

<style>
  .item {
    padding: 0;
    overflow: hidden;
    text-decoration: none;
    border-color: rgba(255, 255, 255, 0.14);
  }
  .item:hover {
    text-decoration: none;
    border-color: rgba(246, 196, 83, 0.35);
    transform: translateY(-1px);
  }

  .thumb {
    height: 146px;
    background: linear-gradient(180deg, rgba(246, 196, 83, 0.1), rgba(0, 0, 0, 0.3));
    background-size: cover;
    background-position: center;
    position: relative;
  }
  .badge {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.6px;
    padding: 0.22rem 0.5rem;
    border-radius: 999px;
    background: rgba(239, 68, 68, 0.92);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.18);
  }
  .count {
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 0.78rem;
    font-weight: 800;
    padding: 0.22rem 0.5rem;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: white;
    backdrop-filter: blur(8px);
  }

  .meta {
    padding: 0.7rem 0.85rem 0.85rem;
  }
  .name {
    font-weight: 900;
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .by {
    margin-top: 0.35rem;
    font-size: 0.86rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .who {
    color: var(--text);
    font-weight: 800;
    text-decoration: underline;
  }
  .summary {
    margin-top: 0.5rem;
    line-height: 1.35;
    font-size: 0.88rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>

