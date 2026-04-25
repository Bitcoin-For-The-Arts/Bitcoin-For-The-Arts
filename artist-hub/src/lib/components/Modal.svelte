<script lang="ts">
  export let open = false;
  export let title = '';
  export let onClose: () => void = () => {};

  function close() {
    onClose();
  }
</script>

{#if open}
  <div class="backdrop" role="presentation" on:click|self={close}>
    <div class="modal card" role="dialog" aria-modal="true" aria-label={title}>
      <div class="head">
        <div class="t">{title}</div>
        <button class="btn" on:click={close} aria-label="Close">✕</button>
      </div>
      <div class="body">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: grid;
    place-items: center;
    padding: 1.25rem;
    z-index: 100;
  }
  .modal {
    width: min(720px, 100%);
    max-height: min(86vh, 800px);
    overflow: auto;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.9rem 1rem;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    background: rgba(11, 11, 15, 0.7);
    backdrop-filter: blur(10px);
  }
  .t {
    font-weight: 850;
  }
  .body {
    padding: 1rem;
  }
</style>

