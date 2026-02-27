<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { nip04, nip19 } from 'nostr-tools';
  import { ensureNdk } from '$lib/stores/ndk';
  import { isAuthed, pubkey } from '$lib/stores/auth';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import DMComposer from '$lib/components/DMComposer.svelte';
  import { profileHover } from '$lib/ui/profile-hover';
  import { getLocalSecretKey } from '$lib/stores/local-signer';
  import ContentBody from '$lib/components/ContentBody.svelte';
  import { publishDeletion } from '$lib/nostr/publish';

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

  let deleted = new Set<string>();
  let cleared: Record<string, number> = {}; // withPubkey -> unix seconds
  let actionError: string | null = null;
  let actionBusy = false;

  function deletedKey(me: string) {
    return `bfta:dm:deleted:${me}`;
  }
  function clearedKey(me: string) {
    return `bfta:dm:cleared:${me}`;
  }
  function loadLocalState(me: string) {
    deleted = new Set<string>();
    cleared = {};
    actionError = null;
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(deletedKey(me));
      const arr = raw ? (JSON.parse(raw) as any) : [];
      if (Array.isArray(arr)) for (const id of arr) if (typeof id === 'string') deleted.add(id);
    } catch {
      // ignore
    }
    try {
      const raw = localStorage.getItem(clearedKey(me));
      const obj = raw ? (JSON.parse(raw) as any) : null;
      if (obj && typeof obj === 'object') cleared = obj as Record<string, number>;
    } catch {
      // ignore
    }
  }
  function persistDeleted(me: string) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(deletedKey(me), JSON.stringify(Array.from(deleted).slice(-2000)));
    } catch {
      // ignore
    }
  }
  function persistCleared(me: string) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(clearedKey(me), JSON.stringify(cleared));
    } catch {
      // ignore
    }
  }

  function withPkFor(msg: Msg, me: string): string {
    return msg.from === me ? msg.to : msg.from;
  }

  function rebuildThreads(me: string) {
    const best = new Map<string, Msg>();
    for (const m of messages) {
      if (deleted.has(m.id)) continue;
      const withPk = withPkFor(m, me);
      const cutoff = cleared[withPk] || 0;
      if (m.at <= cutoff) continue;
      const prev = best.get(withPk);
      if (!prev || m.at > prev.at) best.set(withPk, m);
    }
    threads = Array.from(best.entries())
      .map(([withPk, m]) => ({ with: withPk, lastAt: m.at, lastText: m.text.slice(0, 140) }))
      .sort((a, b) => b.lastAt - a.lastAt)
      .slice(0, 50);
    if (selected && !threads.some((t) => t.with === selected)) selected = threads[0]?.with ?? null;
  }

  async function decrypt(ev: any, me: string): Promise<Msg | null> {
    const from = ev.pubkey as string;
    const to = (ev.tags as string[][]).find((t) => t[0] === 'p')?.[1] as string | undefined;
    if (!to) return null;
    const counterparty = from === me ? to : from;

    const ciphertext = ev.content || '';
    let text: string | null = null;
    if (window.nostr?.nip04?.decrypt) {
      text = await window.nostr.nip04.decrypt(counterparty, ciphertext);
    } else {
      const sk = getLocalSecretKey();
      if (!sk) return null;
      text = await nip04.decrypt(sk, counterparty, ciphertext);
    }
    return { id: ev.id, from, to, at: ev.created_at, text };
  }

  async function start() {
    if (!$pubkey) return;
    error = null;
    loading = true;
    actionError = null;

    const hasDecrypt = Boolean(window.nostr?.nip04?.decrypt) || Boolean(getLocalSecretKey());
    if (!hasDecrypt) {
      error = 'No NIP-04 decrypt available. Install Alby/nos2x, or sign in with an in-app key to use DMs.';
      loading = false;
      return;
    }

    const ndk = await ensureNdk();
    const me = $pubkey;
    loadLocalState(me);

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
        if (deleted.has(msg.id)) return;
        const cutoff = cleared[withPk] || 0;
        if (msg.at <= cutoff) return;
        void fetchProfileFor(withPk);
        messages = [...messages.filter((m) => m.id !== msg.id), msg].sort((a, b) => a.at - b.at).slice(-200);
        rebuildThreads(me);
        if (!selected) selected = withPk;
      } catch {
        // ignore undecryptable messages
      }
    });

    // Listen for your deletion events (NIP-09) so deletions from other clients are respected.
    const subDel = ndk.subscribe({ kinds: [NOSTR_KINDS.deletion], authors: [me], limit: 200 } as any, { closeOnEose: false });
    subDel.on('event', (ev: any) => {
      const tags = (ev?.tags as string[][]) || [];
      const ids = tags.filter((t) => t[0] === 'e' && typeof t[1] === 'string').map((t) => t[1]);
      let changed = false;
      for (const id of ids) {
        if (!deleted.has(id)) {
          deleted.add(id);
          changed = true;
        }
      }
      if (!changed) return;
      persistDeleted(me);
      messages = messages.filter((m) => !deleted.has(m.id));
      rebuildThreads(me);
    });

    stop = () => {
      sub.stop();
      subDel.stop();
    };
    loading = false;
  }

  async function removeMessage(m: Msg) {
    if (!$pubkey) return;
    const me = $pubkey;
    actionError = null;
    actionBusy = true;
    try {
      deleted.add(m.id);
      persistDeleted(me);
      messages = messages.filter((x) => x.id !== m.id);
      rebuildThreads(me);

      // If you authored it, publish a NIP-09 deletion event (best-effort).
      if (m.from === me) {
        await publishDeletion({ eventIds: [m.id], reason: 'deleted' });
      }
    } catch (e) {
      actionError = e instanceof Error ? e.message : String(e);
    } finally {
      actionBusy = false;
    }
  }

  function clearConversation(withPk: string) {
    if (!$pubkey) return;
    const me = $pubkey;
    actionError = null;
    const now = Math.floor(Date.now() / 1000);
    cleared = { ...cleared, [withPk]: now };
    persistCleared(me);
    messages = messages.filter((m) => withPkFor(m, me) !== withPk || m.at > now);
    rebuildThreads(me);
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
    deleted = new Set();
    cleared = {};
    actionError = null;
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
          {@const tp = $profileByPubkey[t.with]}
          {@const tname = (tp?.display_name || tp?.name || t.with.slice(0, 12) + '…').trim()}
          <button
            class={`card thread ${selected === t.with ? 'active' : ''}`}
            on:click={() => (selected = t.with)}
            style="padding: 0.75rem 0.85rem; text-align:left;"
          >
            <div style="display:flex; gap:0.6rem; align-items:center; min-width:0;">
              {#if tp?.picture}
                <img src={tp.picture} alt="" class="tAvatar" use:profileHover={t.with} />
              {:else}
                <div class="tAvatar ph" use:profileHover={t.with}></div>
              {/if}
              <div style="min-width:0;">
                <div style="font-weight: 850; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" use:profileHover={t.with}>
                  {tname}
                </div>
                <div class="muted" style="margin-top:0.25rem; line-height:1.35;">
                  {t.lastText}
                </div>
              </div>
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
          <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
            <button class="btn" disabled={actionBusy} on:click={() => clearConversation(selected!)}>Clear</button>
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
          </div>
        {/if}
      </div>
      {#if selected}
        <div style="margin-top:0.55rem; display:flex; gap:0.6rem; align-items:center;">
          {#if selectedProfile?.picture}
            <img class="tAvatar" src={selectedProfile.picture} alt="" use:profileHover={selected} />
          {:else}
            <div class="tAvatar ph" use:profileHover={selected}></div>
          {/if}
          <div class="muted">
            With: <span class="pill" use:profileHover={selected}>{selectedName}</span>
          </div>
        </div>
      {/if}

      <div style="margin-top: 0.85rem; display:grid; gap:0.5rem;">
        {#each messages.filter((m) => selected && (m.from === selected || m.to === selected) && !deleted.has(m.id)) as m (m.id)}
          <div class="card" style="padding: 0.75rem 0.85rem; background: rgba(0,0,0,0.18);">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem;">
              <div class="muted" style="font-size: 0.86rem;">
                {m.from === $pubkey ? 'You' : 'Them'} • {new Date(m.at * 1000).toLocaleString()}
              </div>
              <button class="pill muted" disabled={actionBusy} on:click={() => removeMessage(m)} title={m.from === $pubkey ? 'Delete (publish NIP-09)' : 'Remove from your inbox'}>
                🗑
              </button>
            </div>
            <div style="margin-top:0.35rem; line-height: 1.5;"><ContentBody text={m.text} maxUrls={2} compactLinks={true} /></div>
          </div>
        {/each}
        {#if !selected}
          <div class="muted">Pick a thread to view messages.</div>
        {/if}
        {#if selected && messages.filter((m) => (m.from === selected || m.to === selected) && !deleted.has(m.id)).length === 0}
          <div class="muted">No messages in this conversation.</div>
        {/if}
      </div>
      {#if actionError}
        <div class="muted" style="margin-top:0.65rem; color: var(--danger);">{actionError}</div>
      {/if}
    </div>
  </div>

  <DMComposer open={composerOpen} toPubkey={composerTo} toLabel={composerLabel} onClose={() => (composerOpen = false)} />
{/if}

<style>
  .thread.active {
    border-color: rgba(246, 196, 83, 0.35);
    background: rgba(246, 196, 83, 0.08);
  }
  .tAvatar {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    border: 1px solid var(--border);
    object-fit: cover;
    background: rgba(0, 0, 0, 0.22);
    flex: 0 0 auto;
  }
  .tAvatar.ph {
    display: block;
    background: rgba(255, 255, 255, 0.06);
  }
</style>

