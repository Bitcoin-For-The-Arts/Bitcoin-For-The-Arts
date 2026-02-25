<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { nip19 } from 'nostr-tools';
  import { ensureNdk } from '$lib/stores/ndk';
  import { isAuthed, pubkey } from '$lib/stores/auth';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import DMComposer from '$lib/components/DMComposer.svelte';

  type Msg = { id: string; from: string; to: string; at: number; text: string };
  type Thread = { with: string; lastAt: number; lastText: string };

  let threads: Thread[] = [];
  let selected: string | null = null;
  let messages: Msg[] = [];
  let error: string | null = null;
  let loading = false;
  let stop: (() => void) | null = null;

  let newNpub = '';
  let composerOpen = false;
  let composerTo = '';
  let composerLabel = '';

  function upsertThread(withPk: string, msg: Msg) {
    const next = threads.filter((t) => t.with !== withPk);
    next.unshift({ with: withPk, lastAt: msg.at, lastText: msg.text.slice(0, 140) });
    threads = next.sort((a, b) => b.lastAt - a.lastAt).slice(0, 50);
  }

  async function decrypt(ev: any, me: string): Promise<Msg | null> {
    const from = ev.pubkey as string;
    const to = (ev.tags as string[][]).find((t) => t[0] === 'p')?.[1] as string | undefined;
    if (!to) return null;
    const counterparty = from === me ? to : from;

    if (!window.nostr?.nip04?.decrypt) return null;
    const text = await window.nostr.nip04.decrypt(counterparty, ev.content || '');
    return { id: ev.id, from, to, at: ev.created_at, text };
  }

  async function start() {
    if (!$pubkey) return;
    error = null;
    loading = true;

    if (!window.nostr?.nip04?.decrypt) {
      error = 'Your signer does not support NIP-04 decrypt. Install Alby or a Nostr signer with DM support.';
      loading = false;
      return;
    }

    const ndk = await ensureNdk();
    const me = $pubkey;

    const sub = ndk.subscribe(
      [
        { kinds: [NOSTR_KINDS.dm], authors: [me], limit: 50 },
        { kinds: [NOSTR_KINDS.dm], '#p': [me], limit: 50 },
      ] as any,
      { closeOnEose: false },
    );

    sub.on('event', async (ev) => {
      try {
        const msg = await decrypt(ev, me);
        if (!msg) return;
        const withPk = msg.from === me ? msg.to : msg.from;
        void fetchProfileFor(withPk);
        messages = [...messages.filter((m) => m.id !== msg.id), msg].sort((a, b) => a.at - b.at).slice(-200);
        upsertThread(withPk, msg);
        if (!selected) selected = withPk;
      } catch {
        // ignore undecryptable messages
      }
    });

    stop = () => sub.stop();
    loading = false;
  }

  function openNew() {
    error = null;
    try {
      const decoded = nip19.decode(newNpub.trim());
      if (decoded.type !== 'npub') throw new Error('Not an npub');
      composerTo = decoded.data as string;
      composerLabel = ($profileByPubkey[composerTo]?.display_name || $profileByPubkey[composerTo]?.name || '').trim();
      composerOpen = true;
      selected = composerTo;
      newNpub = '';
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  $: selectedProfile = selected ? $profileByPubkey[selected] : undefined;
  $: selectedName = selectedProfile?.display_name || selectedProfile?.name || (selected ? selected.slice(0, 10) + '…' : '');

  onMount(() => {
    if ($isAuthed) void start();
  });

  $: if ($isAuthed && $pubkey && !stop) {
    void start();
  }
  $: if (!$isAuthed) {
    threads = [];
    messages = [];
    selected = null;
    if (stop) stop();
    stop = null;
  }

  onDestroy(() => {
    if (stop) stop();
  });
</script>

<div class="card" style="padding: 1rem;">
  <div style="font-size: 1.25rem; font-weight: 900;">Messages</div>
  <div class="muted" style="margin-top: 0.35rem; line-height: 1.5;">
    Encrypted DMs via NIP-04. Decryption happens locally in your signer (no server).
  </div>
</div>

{#if !$isAuthed}
  <div class="card" style="margin-top: 1rem; padding: 1rem; border-color: rgba(246,196,83,0.35);">
    <div class="muted">Connect your signer to decrypt and send DMs.</div>
  </div>
{:else}
  {#if error}
    <div class="card" style="margin-top: 1rem; padding: 1rem; border-color: rgba(251,113,133,0.35);">
      <div class="muted">{error}</div>
    </div>
  {/if}

  <div class="grid cols-2" style="margin-top: 1rem;">
    <div class="card" style="padding: 1rem;">
      <div class="muted" style="margin-bottom: 0.35rem;">Start a new DM</div>
      <div style="display:flex; gap:0.5rem; align-items:center;">
        <input class="input" bind:value={newNpub} placeholder="Paste npub…" />
        <button class="btn primary" on:click={openNew} disabled={!newNpub.trim()}>Open</button>
      </div>

      <div style="margin-top: 1rem; display:flex; align-items:center; justify-content:space-between;">
        <div style="font-weight: 850;">Threads</div>
        <div class="muted">{loading ? 'Loading…' : `${threads.length}`}</div>
      </div>
      <div style="margin-top: 0.75rem; display:grid; gap:0.5rem;">
        {#each threads as t (t.with)}
          <button
            class={`card thread ${selected === t.with ? 'active' : ''}`}
            on:click={() => (selected = t.with)}
            style="padding: 0.75rem 0.85rem; text-align:left;"
          >
            <div style="font-weight: 850;">
              {$profileByPubkey[t.with]?.display_name || $profileByPubkey[t.with]?.name || t.with.slice(0, 12) + '…'}
            </div>
            <div class="muted" style="margin-top:0.25rem; line-height:1.35;">
              {t.lastText}
            </div>
          </button>
        {/each}
        {#if threads.length === 0}
          <div class="muted">No DMs found yet on connected relays.</div>
        {/if}
      </div>
    </div>

    <div class="card" style="padding: 1rem;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap: 1rem;">
        <div style="font-weight: 900;">Conversation</div>
        {#if selected}
          <button
            class="btn primary"
            on:click={() => {
              composerTo = selected!;
              composerLabel = selectedName;
              composerOpen = true;
            }}
          >
            Send message
          </button>
        {/if}
      </div>
      {#if selected}
        <div class="muted" style="margin-top:0.35rem;">With: <span class="pill">{selectedName}</span></div>
      {/if}

      <div style="margin-top: 0.85rem; display:grid; gap:0.5rem;">
        {#each messages.filter((m) => selected && (m.from === selected || m.to === selected)) as m (m.id)}
          <div class="card" style="padding: 0.75rem 0.85rem; background: rgba(0,0,0,0.18);">
            <div class="muted" style="font-size: 0.86rem;">
              {m.from === $pubkey ? 'You' : 'Them'} • {new Date(m.at * 1000).toLocaleString()}
            </div>
            <div style="margin-top:0.35rem; white-space: pre-wrap; line-height: 1.5;">{m.text}</div>
          </div>
        {/each}
        {#if !selected}
          <div class="muted">Pick a thread to view messages.</div>
        {/if}
      </div>
    </div>
  </div>

  <DMComposer open={composerOpen} toPubkey={composerTo} toLabel={composerLabel} onClose={() => (composerOpen = false)} />
{/if}

<style>
  .thread.active {
    border-color: rgba(246, 196, 83, 0.35);
    background: rgba(246, 196, 83, 0.08);
  }
</style>

