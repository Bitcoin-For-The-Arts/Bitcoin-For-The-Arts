<script lang="ts">
  import { browser } from '$app/environment';
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';

  export let disabled = false;
  export let title = 'Add emoji';
  export let hideOnMobile = true;

  const dispatch = createEventDispatcher<{ pick: { emoji: string } }>();

  const emojis = [
    '😀',
    '😁',
    '😂',
    '🤣',
    '😅',
    '😊',
    '😍',
    '😘',
    '🤔',
    '😎',
    '🥳',
    '🤯',
    '😭',
    '😡',
    '👍',
    '👎',
    '🙏',
    '🤝',
    '🫡',
    // Requested: zap, rainbow, purple heart, flags, colored squares
    '⚡',
    '🔥',
    '💜',
    '💛',
    '🧡',
    '🌈',
    '🟥',
    '🟧',
    '🟦',
    '🟪',
    '🇺🇸',
    '🇨🇦',
    '🇲🇽',
    '🇧🇷',
    '🇦🇷',
    '🇸🇻',
    '🇬🇧',
    '🇫🇷',
    '🇩🇪',
    '🇪🇸',
    '🇮🇹',
    '🇳🇱',
    '🇸🇪',
    '🇳🇴',
    '🇫🇮',
    '🇯🇵',
    '🇰🇷',
    '🇦🇺',
    '🇮🇳',
    '🇳🇬',
    '✨',
    '💫',
    '🚀',
    '🎨',
    '🎶',
    '🎬',
    '🧠',
    '🏆',
    '💯',
    '✅',
  ];

  let open = false;
  let root: HTMLDivElement | null = null;
  let hidden = false;

  function toggle() {
    if (disabled) return;
    open = !open;
  }

  function pick(emoji: string) {
    dispatch('pick', { emoji });
    open = false;
  }

  function onDocDown(e: MouseEvent) {
    if (!open) return;
    const t = e.target as Node | null;
    if (!root || !t) return;
    if (!root.contains(t)) open = false;
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('mousedown', onDocDown);
  }

  function computeHidden() {
    if (!browser) return;
    if (!hideOnMobile) {
      hidden = false;
      return;
    }
    try {
      const coarse = window.matchMedia?.('(hover: none) and (pointer: coarse)')?.matches ?? false;
      const narrow = window.matchMedia?.('(max-width: 600px)')?.matches ?? false;
      hidden = coarse || narrow;
      if (hidden) open = false;
    } catch {
      hidden = false;
    }
  }

  onMount(() => {
    computeHidden();
    if (!browser) return;
    const onResize = () => computeHidden();
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') document.removeEventListener('mousedown', onDocDown);
  });
</script>

{#if !hidden}
  <div class="wrap" bind:this={root}>
    <button class="btn emojiBtn" type="button" disabled={disabled} on:click|preventDefault={toggle} aria-label={title} title={title}>
      🙂
    </button>

    {#if open}
      <div class="pop card" role="dialog" aria-label="Emoji picker">
        <div class="grid">
          {#each emojis as e (e)}
            <button class="emo" type="button" on:click|preventDefault={() => pick(e)} aria-label={`Insert ${e}`}>
              {e}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .wrap {
    position: relative;
    display: inline-flex;
  }
  .emojiBtn {
    padding: 0 0.65rem;
    height: 38px;
    border-radius: 12px;
    font-size: 1.05rem;
    line-height: 38px;
  }
  .pop {
    position: absolute;
    right: 0;
    bottom: calc(100% + 8px);
    padding: 0.55rem;
    z-index: 50;
    min-width: 240px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 0.25rem;
  }
  .emo {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.04);
    cursor: pointer;
    display: grid;
    place-items: center;
    font-size: 1rem;
  }
  .emo:hover {
    background: rgba(255, 255, 255, 0.08);
  }
</style>

