<script lang="ts">
  import { base } from '$app/paths';
  import { npubFor } from '$lib/nostr/helpers';
  import { profileByPubkey } from '$lib/stores/profiles';
  import { profileHover } from '$lib/ui/profile-hover';
  import { liveByHostPubkey } from '$lib/stores/live-by-host';

  export let pubkey: string;

  $: prof = $profileByPubkey[pubkey];
  $: name = prof?.display_name || prof?.name || 'Artist';
  $: about = (prof?.about || '').trim();
  $: npub = npubFor(pubkey);
  $: live = $liveByHostPubkey[pubkey];

  function openLive(url: string, e: MouseEvent | KeyboardEvent) {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  }
</script>

<a class="card link" href={`${base}/profile/${npub}`} use:profileHover={pubkey}>
  <div class="inner">
    <div class="left">
      {#if prof?.picture}
        <img class="avatar" src={prof.picture} alt="" loading="lazy" on:error={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
      {:else}
        <div class="avatar placeholder"></div>
      {/if}
      <div class="who">
        <div class="name">
          {name}
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
        <div class="muted mono">{npub.slice(0, 14)}…</div>
      </div>
    </div>

    {#if about}
      <div class="muted about">{about}</div>
    {/if}
  </div>
</a>

<style>
  .link:hover {
    text-decoration: none;
  }
  .inner {
    padding: 0.95rem;
    display: grid;
    gap: 0.7rem;
  }
  .left {
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }
  .avatar {
    width: 46px;
    height: 46px;
    border-radius: 16px;
    border: 1px solid var(--border);
    object-fit: cover;
  }
  .placeholder {
    background: rgba(255, 255, 255, 0.06);
  }
  .who {
    min-width: 0;
  }
  .name {
    font-weight: 850;
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
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
    font-size: 0.85rem;
  }
  .about {
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>

