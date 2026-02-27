<script lang="ts">
  import { base } from '$app/paths';
  import { hoverProfile, forceClearHoverProfile, pinHoverProfile } from '$lib/stores/profile-hover';
  import { profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';
  import { followingSet, followingError, followingLoading, toggleFollow } from '$lib/stores/follows';
  import { canSign, pubkey as myPubkey } from '$lib/stores/auth';

  let innerWidth = 1200;
  let innerHeight = 800;

  $: hp = $hoverProfile;
  $: pk = hp?.pubkey || '';
  $: prof = pk ? $profileByPubkey[pk] : undefined;
  $: name = prof?.display_name || prof?.name || (pk ? npubFor(pk).slice(0, 12) + '…' : '');
  $: about = (prof?.about || '').trim();
  $: nip05 = (prof as any)?.nip05 as string | undefined;
  $: website = (prof as any)?.website as string | undefined;
  $: lud16 = (prof as any)?.lud16 as string | undefined;
  $: canFollow = Boolean(pk) && $canSign && $myPubkey && $myPubkey !== pk;
  $: isFollowing = Boolean(pk) && $followingSet.has(pk);

  const W = 340;
  const H = 252;
  $: left = hp ? Math.min(hp.x + 14, Math.max(8, innerWidth - W - 8)) : 0;
  $: top = hp ? Math.min(hp.y + 14, Math.max(8, innerHeight - H - 8)) : 0;

  async function onToggleFollow() {
    if (!pk) return;
    await toggleFollow(pk);
  }
</script>

<svelte:window bind:innerWidth bind:innerHeight />

{#if hp}
  <div
    class="tip"
    style={`left:${left}px; top:${top}px; width:${W}px;`}
    role="dialog"
    aria-label="Profile preview"
    tabindex="-1"
    on:mouseenter={() => pinHoverProfile(pk)}
    on:mouseleave={() => forceClearHoverProfile(pk)}
    on:wheel|stopPropagation
    on:touchmove|stopPropagation
  >
    <div class="row">
      {#if prof?.picture}
        <img src={prof.picture} alt="" class="avatar" />
      {:else}
        <div class="avatar placeholder"></div>
      {/if}
      <div class="meta">
        <div class="name">{name}</div>
        <div class="muted mono">{npubFor(pk).slice(0, 18)}…</div>
      </div>
    </div>

    {#if about}
      <div class="muted about">{about}</div>
    {/if}

    <div class="actions">
      <a class="btn" href={`${base}/profile/${npubFor(pk)}`}>View profile</a>
      {#if canFollow}
        <button class={`btn ${isFollowing ? '' : 'primary'}`} disabled={$followingLoading} on:click={onToggleFollow}>
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      {/if}
    </div>
    {#if canFollow && $followingError}
      <div class="muted" style="margin-top:0.45rem; color:var(--danger);">{$followingError}</div>
    {/if}

    <div class="pills">
      {#if nip05}
        <span class="pill muted">NIP-05: {nip05}</span>
      {/if}
      {#if lud16}
        <span class="pill muted">⚡ {lud16}</span>
      {/if}
      {#if website}
        <span class="pill muted">🔗 {website}</span>
      {/if}
      {#if canFollow}
        <span class={`pill ${isFollowing ? '' : 'muted'}`}>{isFollowing ? 'Following' : 'Not following'}</span>
      {/if}
    </div>
  </div>
{/if}

<style>
  .tip {
    position: fixed;
    z-index: 9999;
    pointer-events: auto;
    background: rgba(12, 12, 20, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 14px 40px rgba(0, 0, 0, 0.45),
      0 0 0 1px rgba(0, 0, 0, 0.35) inset;
    border-radius: 16px;
    padding: 0.85rem 0.95rem;
    backdrop-filter: blur(10px);
    max-height: 70vh;
    overflow: auto;
    overscroll-behavior: contain;
  }
  .row {
    display: flex;
    gap: 0.7rem;
    align-items: center;
    min-width: 0;
  }
  .avatar {
    width: 44px;
    height: 44px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    object-fit: cover;
    flex: 0 0 auto;
  }
  .placeholder {
    background: rgba(255, 255, 255, 0.08);
  }
  .meta {
    min-width: 0;
  }
  .name {
    font-weight: 950;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 260px;
  }
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 0.84rem;
  }
  .about {
    margin-top: 0.65rem;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .pills {
    margin-top: 0.65rem;
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }
  .actions {
    margin-top: 0.65rem;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: center;
  }
  .btn {
    padding: 0.45rem 0.7rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.07);
    color: inherit;
    font-weight: 850;
    cursor: pointer;
    text-decoration: none;
  }
  .btn.primary {
    border-color: rgba(246, 196, 83, 0.35);
    background: rgba(246, 196, 83, 0.14);
  }
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .pill {
    font-size: 0.82rem;
    padding: 0.24rem 0.55rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.06);
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .muted {
    color: var(--muted);
  }
</style>

