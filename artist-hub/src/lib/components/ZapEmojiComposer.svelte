<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  import { zapOrPay } from '$lib/lightning/zaps';
  import { profileByPubkey } from '$lib/stores/profiles';

  export let open = false;
  export let recipientPubkey: string;
  export let recipientLabel: string = '';
  export let eventId: string | undefined = undefined;
  export let onClose: () => void = () => {};

  const emojis = ['⚡', '🔥', '💛', '🎨', '🎶', '🎬', '🧡', '🙏', '💫', '🚀', '✨', '🫡', '🏆', '🧠', '🤝'];

  let amount = 1000;
  let emoji: string = '⚡';
  let busy = false;
  let error: string | null = null;
  let ok: string | null = null;

  $: prof = recipientPubkey ? $profileByPubkey[recipientPubkey] : undefined;
  $: lud16 = (prof as any)?.lud16 as string | undefined;
  $: lud06 = (prof as any)?.lud06 as string | undefined;

  async function send() {
    error = null;
    ok = null;
    busy = true;
    try {
      const res = await zapOrPay({
        recipientPubkey,
        lud16,
        lud06,
        amountSats: amount,
        comment: emoji,
        eventId,
      });
      ok = res.mode === 'zap' ? 'Zap sent.' : 'Payment sent.';
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }
</script>

<Modal {open} title="Zap (emoji-only)" onClose={onClose}>
  <div class="muted" style="margin-bottom: 0.9rem; line-height:1.45;">
    Recipient: <span class="pill">{recipientLabel || 'Artist'}</span>
  </div>

  <div class="grid cols-2">
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Amount (sats)</div>
      <input class="input" type="number" min="1" step="1" bind:value={amount} />
    </div>
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Lightning address</div>
      <input class="input" value={lud16 || lud06 || ''} disabled />
    </div>
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Emoji attachment (zap-only)</div>
    <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
      {#each emojis as e (e)}
        <button class={`pill ${emoji === e ? '' : 'muted'}`} on:click={() => (emoji = e)}>{e}</button>
      {/each}
    </div>
    <div class="muted" style="margin-top:0.4rem;">
      Rule: only zaps can include emoji attachments. Comments are text-only.
    </div>
  </div>

  <div class="row">
    <button class="btn primary" disabled={busy || amount <= 0} on:click={send}>
      {busy ? 'Processing…' : 'Zap / Pay'}
    </button>
    <button class="btn" on:click={onClose}>Close</button>
  </div>

  {#if error}
    <div class="card" style="margin-top: 0.75rem; padding: 0.8rem; border-color: rgba(251,113,133,0.35);">
      <div class="muted">{error}</div>
    </div>
  {/if}

  {#if ok}
    <div class="card" style="margin-top: 0.75rem; padding: 0.8rem; border-color: rgba(246,196,83,0.35);">
      <div class="muted">{ok}</div>
    </div>
  {/if}
</Modal>

<style>
  .row {
    margin-top: 0.9rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>

