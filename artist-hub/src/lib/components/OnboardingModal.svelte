<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  import { browser } from '$app/environment';
  import { connectNostr, connectReadOnly, connectWithNsec, hasNip07 } from '$lib/stores/auth';

  export let open = false;
  export let onClose: () => void = () => {};

  let step: 'intro' | 'generate' | 'done' = 'intro';
  let generatedPubHex = '';
  let generatedPrivHex = '';
  let generatedNpub = '';
  let generatedNsec = '';
  let keysSaved = false;
  let nsecRevealed = false;
  let rememberOnDevice = false;
  let existingNsec = '';
  let readonlyNpub = '';
  let busy = false;
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

  async function signInWithNsec(nsec: string) {
    error = null;
    const trimmed = (nsec || '').trim();
    if (!trimmed) {
      error = 'Paste your nsec to continue.';
      return;
    }

    busy = true;
    try {
      await connectWithNsec(trimmed, { remember: rememberOnDevice });
      onClose();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }

  async function signInReadOnly(npub: string) {
    error = null;
    const trimmed = (npub || '').trim();
    if (!trimmed) {
      error = 'Paste an npub to continue.';
      return;
    }
    busy = true;
    try {
      await connectReadOnly(trimmed, { remember: rememberOnDevice });
      onClose();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }

  async function connectWithExtension() {
    error = null;
    busy = true;
    try {
      await connectNostr();
      onClose();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
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
            {#if $hasNip07}
              <button class="btn" disabled={busy} on:click={connectWithExtension}>{busy ? 'Connecting…' : 'Use extension now'}</button>
            {/if}
          </div>
          <p class="muted" style="font-size: 0.82rem; margin-top: 0.5rem;">
            After installing, reload this page and click "Connect" in the header.
          </p>
        </div>

        <div class="option card">
          <div class="option-title">Option 2: Create an Account (Generate Keys)</div>
          <p class="muted option-desc">
            Generate a key pair now. You must save your private key (nsec) securely — it cannot be recovered.
          </p>
          <button class="btn" on:click={generateKeys}>Generate Key Pair</button>
        </div>

        <div class="option card">
          <div class="option-title">Option 3: Sign In with an Existing nsec</div>
          <p class="muted option-desc">
            Already have keys? Paste your private key (nsec) to use it in Artist Hub. We recommend using a signer extension instead.
          </p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <input class="input" style="flex: 1; min-width: 260px;" bind:value={existingNsec} placeholder="nsec1…" />
            <button class="btn primary" disabled={busy || !existingNsec.trim()} on:click={() => signInWithNsec(existingNsec)}>
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
          <label class="pill" style="cursor: pointer; margin-top: 0.6rem; display: inline-flex; gap: 0.5rem; align-items: center;">
            <input type="checkbox" bind:checked={rememberOnDevice} />
            Remember on this device
          </label>
          <div class="muted" style="font-size: 0.82rem; margin-top: 0.5rem; line-height: 1.45;">
            Only do this on a trusted device. Anyone with access to this browser could potentially use your key.
          </div>
        </div>

        <div class="option card">
          <div class="option-title">Option 4: Browse Read-Only</div>
          <p class="muted option-desc">
            Explore listings, live streams, and forum posts without connecting. You can connect later when ready.
          </p>
          <button class="btn" on:click={onClose}>Continue Browsing</button>
        </div>

        <div class="option card">
          <div class="option-title">Option 5: View a Profile (Read-Only npub)</div>
          <p class="muted option-desc">
            Paste an <strong>npub</strong> to browse as that profile in read-only mode. You won’t be able to post, follow, DM, or zap without a signer.
          </p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <input class="input" style="flex: 1; min-width: 260px;" bind:value={readonlyNpub} placeholder="npub1…" />
            <button class="btn primary" disabled={busy || !readonlyNpub.trim()} on:click={() => signInReadOnly(readonlyNpub)}>
              {busy ? 'Loading…' : 'View'}
            </button>
          </div>
          <label class="pill" style="cursor: pointer; margin-top: 0.6rem; display: inline-flex; gap: 0.5rem; align-items: center;">
            <input type="checkbox" bind:checked={rememberOnDevice} />
            Remember on this device
          </label>
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
          Recommended: import these keys into a signer extension like <strong>Alby</strong> or <strong>nos2x</strong>.
          You can also use this key directly inside Artist Hub on this device (not recommended for high-value keys).
        </p>
      </div>

      <div style="margin-top: 1rem;">
        <label class="pill" style="cursor: pointer; display: inline-flex; gap: 0.5rem; align-items: center;">
          <input type="checkbox" bind:checked={rememberOnDevice} />
          Remember on this device
        </label>
      </div>

      <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn primary" disabled={!keysSaved || busy} on:click={() => signInWithNsec(generatedNsec)}>
          {busy ? 'Connecting…' : 'Use this key in Artist Hub'}
        </button>
        <button class="btn" disabled={busy} on:click={() => (step = 'done')}>Done</button>
        <button class="btn" on:click={() => (step = 'intro')}>Back</button>
      </div>
    </div>

  {:else if step === 'done'}
    <div class="step">
      <div class="step-icon">✅</div>
      <h3 class="step-title">You're Ready</h3>
      <p class="muted step-desc">
        You can use a signer extension (recommended) or an in-app key to start publishing, messaging, and zapping on Bitcoin for the Arts.
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
