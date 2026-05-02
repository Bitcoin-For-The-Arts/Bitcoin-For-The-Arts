<script lang="ts">
  import { base } from '$app/paths';
  import type { ZapChallenge } from '$lib/nostr/challenges';
  import { profileByPubkey } from '$lib/stores/profiles';
  import { profileHover } from '$lib/ui/profile-hover';

  export let challenge: ZapChallenge;

  $: host = $profileByPubkey[challenge.pubkey];
  $: hostName = host?.display_name || host?.name || 'Host';
  $: target = $profileByPubkey[challenge.content.targetPubkey];
  $: targetName = challenge.content.targetLabel || target?.display_name || target?.name || 'Artist';
  $: cover = challenge.content.picture || target?.picture || host?.picture;

  const now = Math.floor(Date.now() / 1000);
  $: status =
    now < challenge.content.startsAt
      ? 'Upcoming'
      : now > challenge.content.endsAt
        ? 'Ended'
        : 'Live';
</script>

<a class="card link" href={`${base}/challenges/${challenge.naddr}`}>
  <div class="thumb">
    {#if cover}
      <img src={cover} alt="" loading="lazy" />
    {:else}
      <div class="placeholder"><div class="muted">Challenge</div></div>
    {/if}
  </div>
  <div class="body">
    <div class="top">
      <div class="title">{challenge.content.title}</div>
      <span class={`pill ${status === 'Live' ? '' : 'muted'}`}>{status}</span>
    </div>
    {#if challenge.content.about}
      <div class="muted about">{challenge.content.about}</div>
    {/if}
    <div class="meta">
      <span class="pill muted" use:profileHover={challenge.content.targetPubkey}>Target: {targetName}</span>
      <span class="pill muted" use:profileHover={challenge.pubkey}>Host: {hostName}</span>
      <span class="pill muted">
        {new Date(challenge.content.startsAt * 1000).toLocaleString()}
      </span>
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
  .top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.6rem;
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
  }
</style>

