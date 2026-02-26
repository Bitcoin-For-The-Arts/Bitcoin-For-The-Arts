<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  import { publishDm } from '$lib/nostr/publish';
  import { isAuthed } from '$lib/stores/auth';
  import { npubFor } from '$lib/nostr/helpers';
  import EmojiPicker from '$lib/components/EmojiPicker.svelte';
  import { insertAtCursor } from '$lib/ui/text';

  export let open = false;
  export let toPubkey: string;
  export let toLabel: string = '';
  export let onClose: () => void = () => {};

  let message = '';
  let messageEl: HTMLTextAreaElement | null = null;
  let sending = false;
  let error: string | null = null;
  let ok: string | null = null;

  $: toNpub = toPubkey ? npubFor(toPubkey) : '';

  async function send() {
    error = null;
    ok = null;
    if (!$isAuthed) {
      error = 'Connect your signer to send encrypted DMs.';
      return;
    }
    if (!message.trim()) return;
    sending = true;
    try {
      await publishDm(toPubkey, message.trim());
      ok = 'Sent.';
      message = '';
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      sending = false;
    }
  }
</script>

<Modal {open} title="Message" onClose={onClose}>
  <div class="muted" style="margin-bottom: 0.75rem;">
    To: <span class="pill">{toLabel || toNpub.slice(0, 12) + '…'}</span>
    <span class="pill muted">{toNpub.slice(0, 16)}…</span>
  </div>

  <textarea
    class="textarea"
    bind:this={messageEl}
    bind:value={message}
    placeholder="Write a message (NIP-04 encrypted DM)…"
  ></textarea>

  <div class="row">
    <EmojiPicker on:pick={(e) => (message = insertAtCursor(messageEl, message, e.detail.emoji))} />
    <button class="btn primary" disabled={sending || !message.trim()} on:click={send}>
      {sending ? 'Sending…' : 'Send DM'}
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
    margin-top: 0.85rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>

