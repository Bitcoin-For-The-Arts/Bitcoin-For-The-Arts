<script lang="ts">
  import RichText from '$lib/components/RichText.svelte';
  import LinkCard from '$lib/components/LinkCard.svelte';
  import { autoPauseVideo } from '$lib/ui/video';
  import { detectMediaType, extractUrls } from '$lib/ui/media';

  export let text = '';
  export let linksAs: 'a' | 'span' = 'a';
  export let maxUrls = 4;
  export let showPreviews = true;
  export let compactLinks = false;

  $: urls = showPreviews ? extractUrls(text).slice(0, Math.max(0, Math.min(12, maxUrls))) : [];
</script>

<div class="wrap">
  <div class="text"><RichText {text} {linksAs} /></div>

  {#if showPreviews && urls.length}
    <div class="media">
      {#each urls as u (u)}
        {@const t = detectMediaType(u)}
        {#if t === 'image'}
          <a href={u} target="_blank" rel="noreferrer" class="m image">
            <img src={u} alt="" loading="lazy" />
          </a>
        {:else if t === 'video'}
          <div class="m video">
            <!-- svelte-ignore a11y_media_has_caption -->
            <video src={u} controls playsinline preload="metadata" use:autoPauseVideo></video>
          </div>
        {:else if t === 'audio'}
          <div class="m audio">
            <audio src={u} controls preload="none"></audio>
          </div>
        {:else}
          <LinkCard url={u} compact={compactLinks} as={linksAs === 'a' ? 'a' : 'div'} />
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .wrap {
    display: grid;
    gap: 0.65rem;
    min-width: 0;
  }
  .text {
    line-height: 1.55;
  }
  .media {
    display: grid;
    gap: 0.55rem;
    max-width: 860px;
  }
  .m {
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.18);
  }
  .m.image img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    display: block;
  }
  .m.video video {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: contain;
    background: rgba(0, 0, 0, 0.55);
    display: block;
  }
  .m.audio audio {
    width: 100%;
    display: block;
  }
</style>

