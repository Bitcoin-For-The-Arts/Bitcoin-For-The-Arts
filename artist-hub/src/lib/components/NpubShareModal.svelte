<script lang="ts">
  import { browser } from '$app/environment';
  import Modal from '$lib/components/Modal.svelte';

  export let open = false;
  export let npub = '';
  export let label = 'npub';
  export let onClose: () => void = () => {};

  let svg: string | null = null;
  let loading = false;
  let error: string | null = null;
  let copied = false;

  const value = () => {
    const v = (npub || '').trim();
    if (!v) return '';
    return v.startsWith('nostr:') ? v : `nostr:${v}`;
  };

  async function gen() {
    svg = null;
    error = null;
    copied = false;
    const v = value();
    if (!browser || !v) return;
    loading = true;
    try {
      const mod = await import('qrcode');
      const QR: any = (mod as any).default || mod;
      svg = await QR.toString(v, {
        type: 'svg',
        margin: 1,
        width: 260,
        color: { dark: '#8b5cf6', light: '#00000000' },
      });
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  $: if (open) void gen();

  async function copy() {
    copied = false;
    error = null;
    const v = (npub || '').trim();
    if (!v) return;
    try {
      await navigator.clipboard.writeText(v);
      copied = true;
      setTimeout(() => (copied = false), 1200);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }
</script>

<Modal {open} title="Share npub" onClose={onClose}>
  <div class="grid" style="gap: 1rem;">
    <div class="muted" style="line-height:1.45;">
      {label}: scan the QR code or copy/paste the npub.
    </div>

    <div class="qr card" style="padding: 1rem; background: rgba(0,0,0,0.18);">
      {#if loading}
        <div class="muted">Generating QR…</div>
      {:else if svg}
        <div class="qrInner" aria-label="npub QR code">
          {@html svg}
        </div>
      {:else}
        <div class="muted">No npub.</div>
      {/if}
    </div>

    <div>
      <div class="muted" style="margin-bottom:0.35rem;">npub</div>
      <div class="npubRow">
        <input
          class="input mono"
          value={(npub || '').trim()}
          readonly
          on:focus={(e) => (e.currentTarget as HTMLInputElement).select()}
        />
        <button class="btn primary" on:click={copy} disabled={!npub.trim()}>{copied ? 'Copied' : 'Copy'}</button>
      </div>
      <div class="muted" style="margin-top:0.45rem; line-height:1.45;">
        QR encodes
        <span class="encoded mono">{value()}</span>
      </div>
    </div>

    {#if error}
      <div class="muted" style="color: var(--danger);">{error}</div>
    {/if}
  </div>
</Modal>

<style>
  .qr {
    display: grid;
    place-items: center;
  }
  .qrInner :global(svg) {
    width: min(320px, 100%);
    height: auto;
    display: block;
  }
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  }
  .npubRow {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    max-width: 100%;
  }
  .npubRow :global(input) {
    flex: 1 1 260px;
    min-width: 0;
  }
  .encoded {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    padding: 0.35rem 0.55rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.06);
  }
  .encoded::-webkit-scrollbar {
    height: 10px;
  }

  @media (max-width: 560px) {
    .npubRow {
      flex-direction: column;
      align-items: stretch;
    }
    .npubRow :global(button) {
      width: 100%;
    }
  }
</style>

