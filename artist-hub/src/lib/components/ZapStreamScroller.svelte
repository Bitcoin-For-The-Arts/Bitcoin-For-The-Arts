<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';
  import { profileHover } from '$lib/ui/profile-hover';
  import { liveStreams, liveStreamsError, liveStreamsLoading, startLiveStreams } from '$lib/stores/live-streams';

  export let limit = 24;
  onMount(() => {
    void startLiveStreams({ source: 'zapstream', limit: Math.max(1, Math.min(60, limit)) });
  });
</script>

<div class="wrap">
  <div class="head">
    <div class="titleRow">
      <div class="title">Live on zap.stream</div>
      <div style="display:flex; gap:0.6rem; align-items:baseline;">
        <a class="muted link" href={`${base}/streams`} style="text-decoration: underline;">All streams</a>
        <a class="muted link" href="https://zap.stream" target="_blank" rel="noreferrer">Open zap.stream</a>
      </div>
    </div>
    <div class="muted desc">Click a stream to watch on zap.stream.</div>
  </div>

  {#if $liveStreamsError}
    <div class="card" style="padding: 0.85rem 1rem; border-color: rgba(251,113,133,0.35);">
      <div class="muted">{$liveStreamsError}</div>
    </div>
  {:else if $liveStreamsLoading && $liveStreams.length === 0}
    <div class="row">
      {#each Array(6) as _}
        <div class="card skel"></div>
      {/each}
    </div>
  {:else if $liveStreams.length === 0}
    <div class="card empty">
      <div class="muted">No live zap.stream streams found right now.</div>
    </div>
  {:else}
    <div class="row" aria-label="zap.stream live streams">
      {#each $liveStreams.slice(0, limit) as s (s.eventId)}
        <a class="card item" href={s.watchUrl} target="_blank" rel="noreferrer" aria-label={`Watch ${s.title}`}>
          <div
            class="thumb"
            style={`background-image:url('${(s.thumb || s.image || '').replace(/'/g, '%27')}')`}
          >
            <div class="badge">LIVE</div>
            {#if s.currentParticipants > 0}
              <div class="count">👁 {s.currentParticipants}</div>
            {/if}
          </div>

          <div class="meta">
            <div class="name">{s.title}</div>
            <div class="by muted">
              by
              <span class="who" use:profileHover={s.hostPubkey}>
                {$profileByPubkey[s.hostPubkey]?.display_name ||
                $profileByPubkey[s.hostPubkey]?.name ||
                npubFor(s.hostPubkey).slice(0, 14) + '…'}
              </span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .wrap {
    margin-bottom: 1rem;
  }
  .head {
    margin-bottom: 0.65rem;
  }
  .titleRow {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .title {
    font-size: 1.05rem;
    font-weight: 950;
  }
  .link {
    font-size: 0.88rem;
    text-decoration: underline;
  }
  .desc {
    margin-top: 0.25rem;
    font-size: 0.9rem;
    line-height: 1.45;
  }

  .row {
    display: flex;
    gap: 0.6rem;
    overflow-x: auto;
    padding-bottom: 0.35rem;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
  }
  .row::-webkit-scrollbar {
    height: 10px;
  }

  .item {
    flex: 0 0 auto;
    width: 260px;
    padding: 0;
    overflow: hidden;
    scroll-snap-align: start;
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
  }

  .skel {
    width: 260px;
    height: 230px;
    padding: 0;
    background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03), rgba(255,255,255,0.06));
    background-size: 200% 100%;
    animation: shimmer 1.2s ease-in-out infinite;
  }
  .empty {
    padding: 0.85rem 1rem;
    border-color: rgba(255, 255, 255, 0.12);
  }
  @keyframes shimmer {
    0% { background-position: 0% 0; }
    100% { background-position: 200% 0; }
  }
</style>

