<script lang="ts">
  import { onMount } from 'svelte';
  import { getLinkPreview, type LinkPreview } from '$lib/ui/link-preview';

  export let url: string;
  export let compact = false;
  export let as: 'a' | 'div' = 'a';

  let preview: LinkPreview | null = null;
  let loading = false;

  $: host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return '';
    }
  })();

  onMount(() => {
    if (!url) return;
    loading = true;
    void getLinkPreview(url)
      .then((p) => (preview = p))
      .finally(() => (loading = false));
  });

  function open() {
    if (!url) return;
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      // ignore
    }
  }
</script>

{#if as === 'a'}
  <a class={`card linkCard ${compact ? 'compact' : ''}`} href={url} target="_blank" rel="noreferrer noopener">
    <div class="img" style={`background-image:url('${(preview?.image || '').replace(/'/g, '%27')}')`}>
      {#if !preview?.image}<div class="imgPh">{host ? host[0].toUpperCase() : '↗'}</div>{/if}
    </div>
    <div class="meta">
      <div class="title">{preview?.title || host || url}</div>
      {#if preview?.description && !compact}
        <div class="desc muted">{preview.description.slice(0, 140)}{preview.description.length > 140 ? '…' : ''}</div>
      {/if}
      <div class="site muted">{host}</div>
      {#if loading}
        <div class="muted small" style="margin-top:0.25rem;">Loading preview…</div>
      {/if}
    </div>
  </a>
{:else}
  <div
    class={`card linkCard ${compact ? 'compact' : ''}`}
    role="link"
    tabindex="0"
    on:click|stopPropagation|preventDefault={open}
    on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && open()}
  >
    <div class="img" style={`background-image:url('${(preview?.image || '').replace(/'/g, '%27')}')`}>
      {#if !preview?.image}<div class="imgPh">{host ? host[0].toUpperCase() : '↗'}</div>{/if}
    </div>
    <div class="meta">
      <div class="title">{preview?.title || host || url}</div>
      {#if preview?.description && !compact}
        <div class="desc muted">{preview.description.slice(0, 140)}{preview.description.length > 140 ? '…' : ''}</div>
      {/if}
      <div class="site muted">{host}</div>
      {#if loading}
        <div class="muted small" style="margin-top:0.25rem;">Loading preview…</div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .linkCard {
    display: grid;
    grid-template-columns: 92px 1fr;
    gap: 0.75rem;
    padding: 0.65rem;
    border-radius: 16px;
    border: 1px solid var(--border);
    background: rgba(0, 0, 0, 0.16);
    align-items: center;
    text-decoration: none;
    color: inherit;
    min-width: 0;
  }
  .linkCard.compact {
    grid-template-columns: 72px 1fr;
    padding: 0.55rem;
  }
  .img {
    width: 100%;
    height: 68px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background-size: cover;
    background-position: center;
    background-color: rgba(255, 255, 255, 0.04);
    overflow: hidden;
    display: grid;
    place-items: center;
  }
  .linkCard.compact .img {
    height: 54px;
    border-radius: 12px;
  }
  .imgPh {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    font-weight: 950;
    color: var(--accent-2);
    background: radial-gradient(200px 90px at 30% 30%, rgba(139, 92, 246, 0.22), rgba(0, 0, 0, 0.2));
  }
  .meta {
    min-width: 0;
  }
  .title {
    font-weight: 900;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .desc {
    margin-top: 0.25rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .site {
    margin-top: 0.35rem;
    font-size: 0.82rem;
    color: var(--accent-2);
  }
  .small {
    font-size: 0.82rem;
  }
</style>

