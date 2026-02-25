<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  import { browser } from '$app/environment';

  export let open = false;
  export let onClose: () => void = () => {};

  let step: 'intro' | 'generate' | 'done' = 'intro';
  let generatedPubHex = '';
  let generatedPrivHex = '';
  let generatedNpub = '';
  let generatedNsec = '';
  let keysSaved = false;
  let nsecRevealed = false;
  let error: string | null = null;

  async function generateKeys() {
    error = null;
    try {
      const { generateSecretKey, getPublicKey } = await import('nostr-tools');
      const { nip19 } = await import('nostr-tools');

      const sk = generateSecretKey();
      const pk = getPublicKey(sk);

      generatedPrivHex = Array.from(sk).map((b) => b.toString(16).padStart(2, '0')).join('');
      generatedPubHex = pk;
      generatedNpub = nip19.npubEncode(pk);
      generatedNsec = nip19.nsecEncode(sk);

      step = 'generate';
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  function copyToClipboard(text: string) {
    if (browser) navigator.clipboard.writeText(text);
  }
</script>

<Modal {open} title="Welcome to Bitcoin for the Arts" onClose={onClose}>
  {#if step === 'intro'}
    <div class="step">
      <div class="step-icon">🔑</div>
      <h3 class="step-title">Getting Started with Nostr</h3>
      <p class="muted step-desc">
        This app uses <strong>Nostr</strong>, an open protocol for decentralized social networking.
        Your identity is a cryptographic key pair — no email, no password, no account creation.
      </p>

      <div class="options">
        <div class="option card">
          <div class="option-title">Option 1: Install a Signer Extension (Recommended)</div>
          <p class="muted option-desc">
            A signer extension manages your keys securely. It signs events for you without exposing your private key.
          </p>
          <div class="option-links">
            <a href="https://getalby.com" target="_blank" rel="noreferrer" class="btn primary">Alby (Browser + Lightning)</a>
            <a href="https://github.com/nicnocquee/nos2x" target="_blank" rel="noreferrer" class="btn">nos2x (Chrome)</a>
          </div>
          <p class="muted" style="font-size: 0.82rem; margin-top: 0.5rem;">
            After installing, reload this page and click "Connect" in the header.
          </p>
        </div>

        <div class="option card">
          <div class="option-title">Option 2: Generate Keys Here</div>
          <p class="muted option-desc">
            Generate a key pair now for quick access. You must save your private key (nsec) securely — it cannot be recovered.
          </p>
          <button class="btn" on:click={generateKeys}>Generate Key Pair</button>
        </div>

        <div class="option card">
          <div class="option-title">Option 3: Browse Read-Only</div>
          <p class="muted option-desc">
            Explore listings, live streams, and forum posts without connecting. You can connect later when ready.
          </p>
          <button class="btn" on:click={onClose}>Continue Browsing</button>
        </div>
      </div>
    </div>

  {:else if step === 'generate'}
    <div class="step">
      <div class="step-icon">🗝️</div>
      <h3 class="step-title">Your New Nostr Keys</h3>

      <div class="key-warning card" style="border-color: rgba(251,113,133,0.35); padding: 0.85rem;">
        <strong>Save your private key (nsec) now.</strong> It cannot be recovered. Anyone who has it controls your identity.
        Never share it publicly.
      </div>

      <div class="key-block">
        <div class="key-label muted">Public Key (npub) — shareable</div>
        <div class="key-value card">
          <code>{generatedNpub}</code>
          <button class="btn" style="font-size: 0.8rem; padding: 0.3rem 0.5rem;" on:click={() => copyToClipboard(generatedNpub)}>Copy</button>
        </div>
      </div>

      <div class="key-block">
        <div class="key-label muted">Private Key (nsec) — keep secret</div>
        <div class="key-value card" style="border-color: rgba(251,113,133,0.2);">
          {#if nsecRevealed}
            <code class="nsec">{generatedNsec}</code>
          {:else}
            <code class="nsec">{'•'.repeat(32)}...</code>
          {/if}
          <button class="btn" style="font-size: 0.8rem; padding: 0.3rem 0.5rem;" on:click={() => (nsecRevealed = !nsecRevealed)}>
            {nsecRevealed ? 'Hide' : 'Reveal'}
          </button>
          <button class="btn" style="font-size: 0.8rem; padding: 0.3rem 0.5rem;" on:click={() => copyToClipboard(generatedNsec)}>Copy</button>
        </div>
      </div>

      <div style="margin-top: 1rem;">
        <label class="pill" style="cursor: pointer;">
          <input type="checkbox" bind:checked={keysSaved} />
          I have saved my private key securely
        </label>
      </div>

      <div style="margin-top: 0.85rem;">
        <p class="muted" style="line-height: 1.5;">
          To use these keys, import them into a Nostr signer extension like <strong>Alby</strong> or <strong>nos2x</strong>.
          Paste your nsec into the extension's import flow, then return here and click "Connect" in the header.
        </p>
      </div>

      <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
        <button class="btn primary" disabled={!keysSaved} on:click={() => (step = 'done')}>
          I've Saved My Keys
        </button>
        <button class="btn" on:click={() => (step = 'intro')}>Back</button>
      </div>
    </div>

  {:else if step === 'done'}
    <div class="step">
      <div class="step-icon">✅</div>
      <h3 class="step-title">You're Ready</h3>
      <p class="muted step-desc">
        Import your nsec into a signer extension, then click "Connect" in the header to start publishing,
        messaging, and zapping on Bitcoin for the Arts.
      </p>
      <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
        <button class="btn primary" on:click={onClose}>Start Exploring</button>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="card" style="margin-top: 0.75rem; padding: 0.8rem; border-color: rgba(251,113,133,0.35);">
      <div class="muted">{error}</div>
    </div>
  {/if}
</Modal>

<style>
  .step {
    max-width: 520px;
  }
  .step-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  .step-title {
    font-weight: 900;
    font-size: 1.15rem;
    margin: 0 0 0.5rem;
  }
  .step-desc {
    line-height: 1.55;
    margin: 0;
  }
  .options {
    margin-top: 1rem;
    display: grid;
    gap: 0.75rem;
  }
  .option {
    padding: 0.9rem 1rem;
  }
  .option-title {
    font-weight: 850;
    font-size: 0.95rem;
    margin-bottom: 0.35rem;
  }
  .option-desc {
    font-size: 0.9rem;
    line-height: 1.45;
    margin: 0 0 0.6rem;
  }
  .option-links {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .key-warning {
    margin: 0.75rem 0;
    font-size: 0.9rem;
    line-height: 1.45;
    color: var(--danger);
  }
  .key-block {
    margin-top: 0.75rem;
  }
  .key-label {
    font-size: 0.82rem;
    margin-bottom: 0.3rem;
  }
  .key-value {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 0.7rem;
    overflow: hidden;
  }
  .key-value code {
    flex: 1;
    word-break: break-all;
    font-size: 0.78rem;
    line-height: 1.3;
  }
  .nsec {
    color: var(--danger);
  }
</style>
