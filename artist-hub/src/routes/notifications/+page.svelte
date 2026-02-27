<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';
  import { isAuthed } from '$lib/stores/auth';
  import { notifications, markAllRead } from '$lib/stores/notifications';

  function relTime(ts: number): string {
    const s = Math.max(0, Math.floor(Date.now() / 1000) - Math.floor(ts || 0));
    if (s < 20) return 'just now';
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 48) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  }

  function iconFor(t: string): string {
    if (t === 'like') return '🧡';
    if (t === 'zap') return '⚡';
    if (t === 'repost') return '🔁';
    if (t === 'reply') return '💬';
    if (t === 'mention') return '@';
    if (t === 'follow') return '➕';
    if (t === 'dm') return '✉️';
    if (t === 'invite') return '📩';
    return '•';
  }

  onMount(() => {
    // Opening the notifications view marks all current items as seen (unread badge clears).
    if ($isAuthed) markAllRead();
  });
</script>

{#if !$isAuthed}
  <div class="card" style="padding: 1rem; border-color: rgba(246,196,83,0.35);">
    <div class="muted">Connect your signer to see notifications.</div>
  </div>
{:else}
  <div class="card" style="padding: 1rem;">
    <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
      <div style="font-size: 1.15rem; font-weight: 950;">Notifications</div>
      <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
        <button class="btn" on:click={markAllRead}>Mark all read</button>
        <a class="btn" href={`${base}/pulse`}>Open Pulse</a>
      </div>
    </div>
    <div class="muted" style="margin-top:0.35rem; line-height:1.45;">
      Best-effort inbox from your connected relays (likes, zaps, reposts, replies, mentions, follows, and DMs).
    </div>
  </div>

  <div class="grid" style="gap:0.6rem; margin-top: 1rem;">
    {#each $notifications as n (n.id)}
      {@const prof = $profileByPubkey[n.authorPubkey]}
      {@const name = (prof?.display_name || prof?.name || npubFor(n.authorPubkey).slice(0, 12) + '…').trim()}
      <a class="card row" href={`${base}${n.href}`} style="padding: 0.85rem 0.95rem; display:flex; gap:0.75rem; align-items:flex-start;">
        <div class="left">
          {#if prof?.picture}
            <img class="avatar" src={prof.picture} alt="" />
          {:else}
            <div class="avatar ph"></div>
          {/if}
        </div>
        <div class="main">
          <div style="display:flex; gap:0.5rem; align-items:baseline; flex-wrap:wrap;">
            <span class="muted" style="font-weight: 950;">{iconFor(n.type)}</span>
            <span style="font-weight: 900;">{name}</span>
            <span class="muted">{n.summary}</span>
            <span class="muted" style="margin-left:auto; font-size:0.85rem;">{relTime(n.createdAt)}</span>
          </div>
          <div class="muted mono" style="margin-top:0.35rem; font-size:0.82rem; overflow:hidden; text-overflow:ellipsis;">
            {n.authorPubkey.slice(0, 12)}…{n.authorPubkey.slice(-10)}
          </div>
        </div>
      </a>
    {/each}

    {#if $notifications.length === 0}
      <div class="card" style="padding: 1rem;">
        <div class="muted">No notifications yet (depends on relays).</div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .row:hover {
    text-decoration: none;
    border-color: rgba(139, 92, 246, 0.22);
    background: rgba(255, 255, 255, 0.02);
  }
  .avatar {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    border: 1px solid var(--border);
    object-fit: cover;
    background: rgba(0, 0, 0, 0.22);
    flex: 0 0 auto;
  }
  .avatar.ph {
    display: block;
  }
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  }
  .main {
    min-width: 0;
    flex: 1;
  }
</style>

