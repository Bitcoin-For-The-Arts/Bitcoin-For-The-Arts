<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  import { zapOrPay } from '$lib/lightning/zaps';
  import { profileByPubkey } from '$lib/stores/profiles';
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let recipientPubkey: string;
  export let recipientLabel: string = '';
  export let eventId: string | undefined = undefined;
  export let address: string | undefined = undefined;
  export let onClose: () => void = () => {};

  const dispatch = createEventDispatcher<{
    sent: { eventId?: string; amountSats: number; comment?: string; mode: 'zap' | 'pay' };
  }>();

  let amount = 1000;
  let comment = '';
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
        comment: comment.trim() || undefined,
        eventId,
        address,
      });
      ok = res.mode === 'zap' ? 'Zap sent.' : 'Payment sent.';
      dispatch('sent', { eventId, amountSats: amount, comment: comment.trim() || undefined, mode: res.mode });
      onClose();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }
</script>

<Modal {open} title="Zap / Pay" onClose={onClose}>
  <div class="muted" style="margin-bottom: 0.9rem;">
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
    <div class="muted" style="margin-bottom:0.35rem;">Comment (optional)</div>
    <input class="input" bind:value={comment} placeholder="Thanks / details / context…" />
  </div>

  <div class="row">
    <button class="btn primary" disabled={busy || amount <= 0} on:click={send}>
      {busy ? 'Processing…' : 'Zap / Pay'}
    </button>
    <button class="btn" on:click={onClose}>Close</button>
  </div>

  <div class="muted" style="margin-top:0.75rem; line-height:1.35;">
    Uses WebLN (Alby) to pay a Lightning invoice. If the recipient supports Nostr zaps (NIP-57), this will
    create a signed zap request and publish a zap receipt to relays.
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

