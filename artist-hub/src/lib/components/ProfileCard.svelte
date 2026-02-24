<script lang="ts">
  import { base } from '$app/paths';
  import { npubFor } from '$lib/nostr/helpers';
  import { profileByPubkey } from '$lib/stores/profiles';

  export let pubkey: string;

  $: prof = $profileByPubkey[pubkey];
  $: name = prof?.display_name || prof?.name || 'Artist';
  $: about = (prof?.about || '').trim();
  $: npub = npubFor(pubkey);
</script>

<a class="card link" href={`${base}/profile/${npub}`}>
  <div class="inner">
    <div class="left">
      {#if prof?.picture}
        <img class="avatar" src={prof.picture} alt="" loading="lazy" />
      {:else}
        <div class="avatar placeholder"></div>
      {/if}
      <div class="who">
        <div class="name">{name}</div>
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

