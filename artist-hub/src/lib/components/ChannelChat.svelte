<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { channels, channelMessages, channelParticipants, startChannelMessages, stopChannelMessages } from '$lib/stores/channels';
  import { isAuthed } from '$lib/stores/auth';
  import { publishChannelMessage } from '$lib/nostr/nip28';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';

  export let channelId: string;
  export let compact = false;

  let text = '';
  let busy = false;
  let error: string | null = null;

  $: meta = channelId ? $channels[channelId] : undefined;
  $: msgs = channelId ? $channelMessages[channelId] ?? [] : [];
  $: participants = channelId ? $channelParticipants[channelId] : undefined;

  onMount(() => {
    if (channelId) void startChannelMessages(channelId);
  });

  $: if (channelId) {
    void startChannelMessages(channelId);
  }

  onDestroy(() => {
    if (channelId) stopChannelMessages(channelId);
  });

  async function send() {
    error = null;
    if (!$isAuthed) {
      error = 'Connect your npub to chat.';
      return;
    }
    const body = text.trim();
    if (!body) return;
    busy = true;
    try {
      await publishChannelMessage({ channelId, content: body });
      text = '';
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void send();
  }

  $: for (const m of msgs.slice(-30)) void fetchProfileFor(m.pubkey);
</script>

<div class={`card wrap ${compact ? 'compact' : ''}`}>
  <div class="head">
    <div class="left">
      {#if meta?.picture}
        <img src={meta.picture} alt="" class="pic" />
      {/if}
      <div class="title">
        <div style="font-weight: 900;">{meta?.name ?? `Channel ${channelId.slice(0, 8)}`}</div>
        <div class="muted small">
          {#if participants}
            {participants.last10m} active • {participants.count} seen
          {:else}
            Live chat (NIP-28)
          {/if}
        </div>
      </div>
    </div>
    <a
      class="pill muted mono"
      href={`https://njump.me/${channelId}`}
      target="_blank"
      rel="noreferrer"
      title="Open in external Nostr viewer"
      >{channelId.slice(0, 10)}…</a
    >
  </div>

  {#if meta?.about}
    <div class="muted about">{meta.about}</div>
  {/if}

  <div class="feed">
    {#each msgs.slice(-120) as m (m.id)}
      <div class="msg">
        <div class="who">
          {#if $profileByPubkey[m.pubkey]?.picture}
            <img src={$profileByPubkey[m.pubkey].picture} alt="" class="avatar" />
          {/if}
          <div class="meta">
            <div class="name">
              {$profileByPubkey[m.pubkey]?.display_name ||
                $profileByPubkey[m.pubkey]?.name ||
                npubFor(m.pubkey).slice(0, 12) + '…'}
            </div>
            <div class="muted small">{new Date(m.createdAt * 1000).toLocaleTimeString()}</div>
          </div>
        </div>
        <div class="body">{m.content}</div>
      </div>
    {/each}
    {#if msgs.length === 0}
      <div class="muted">No messages yet.</div>
    {/if}
  </div>

  <div class="composer">
    <textarea
      class="textarea"
      bind:value={text}
      placeholder="Chat… (Ctrl/⌘ + Enter to send)"
      on:keydown={onKey}
    ></textarea>
    <div class="row">
      <button class="btn primary" disabled={busy || !text.trim()} on:click={send}>
        {busy ? 'Sending…' : 'Send'}
      </button>
      <div class="muted small">Public messages via `kind:42`.</div>
    </div>
    {#if error}
      <div class="muted" style="color: var(--danger);">{error}</div>
    {/if}
  </div>
</div>

<style>
  .wrap {
    padding: 0;
    overflow: hidden;
  }
  .compact .feed {
    max-height: 340px;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.9rem 1rem;
    border-bottom: 1px solid var(--border);
    background: rgba(0, 0, 0, 0.18);
  }
  .left {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-width: 0;
  }
  .pic {
    width: 38px;
    height: 38px;
    border-radius: 14px;
    border: 1px solid var(--border);
    object-fit: cover;
  }
  .title {
    min-width: 0;
  }
  .about {
    padding: 0.75rem 1rem 0;
    line-height: 1.45;
  }
  .feed {
    padding: 0.85rem 1rem;
    display: grid;
    gap: 0.75rem;
    max-height: 520px;
    overflow: auto;
  }
  .msg {
    display: grid;
    gap: 0.35rem;
  }
  .who {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .avatar {
    width: 26px;
    height: 26px;
    border-radius: 10px;
    border: 1px solid var(--border);
    object-fit: cover;
  }
  .meta {
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
    min-width: 0;
  }
  .name {
    font-weight: 850;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 320px;
  }
  .body {
    line-height: 1.45;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .composer {
    border-top: 1px solid var(--border);
    padding: 0.85rem 1rem 1rem;
    background: rgba(0, 0, 0, 0.18);
  }
  .row {
    margin-top: 0.6rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }
  .small {
    font-size: 0.88rem;
  }
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
      monospace;
  }
</style>

