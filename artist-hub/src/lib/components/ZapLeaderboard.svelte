<script lang="ts">
  import { onDestroy } from 'svelte';
  import { ensureNdk } from '$lib/stores/ndk';
  import { parseZapReceipt } from '$lib/nostr/zap-receipts';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';
  import type { ZapChallenge } from '$lib/nostr/challenges';

  export let challenge: ZapChallenge;

  type Row = { pubkey: string; sats: number; zaps: number; lastAt: number; comment?: string };

  let rows: Row[] = [];
  let totalSats = 0;
  let unique = 0;
  let receipts = 0;
  let loading = false;
  let error: string | null = null;
  let stop: (() => void) | null = null;

  function recomputeFrom(all: any[]) {
    const m = new Map<string, Row>();
    let total = 0;

    for (const ev of all) {
      const parsed = parseZapReceipt(ev);
      if (!parsed?.senderPubkey) continue;

      // Match challenge by address or event id (from request tags or receipt tags).
      const matches =
        parsed.aTags.includes(challenge.address) || parsed.eTags.includes(challenge.eventId);
      if (!matches) continue;

      // Restrict to challenge time window using receipt timestamp.
      if (parsed.createdAt < challenge.content.startsAt || parsed.createdAt > challenge.content.endsAt) continue;

      const sats = parsed.amountSats ?? 0;
      total += sats;
      const prev = m.get(parsed.senderPubkey) || { pubkey: parsed.senderPubkey, sats: 0, zaps: 0, lastAt: 0 };
      prev.sats += sats;
      prev.zaps += 1;
      prev.lastAt = Math.max(prev.lastAt, parsed.createdAt);
      if (parsed.comment && !prev.comment) prev.comment = parsed.comment;
      m.set(parsed.senderPubkey, prev);
    }

    const out = Array.from(m.values()).sort((a, b) => b.sats - a.sats || b.lastAt - a.lastAt).slice(0, 25);
    rows = out;
    totalSats = total;
    unique = m.size;
  }

  async function start() {
    error = null;
    loading = true;
    rows = [];
    totalSats = 0;
    unique = 0;
    receipts = 0;
    if (stop) stop();
    stop = null;

    try {
      const ndk = await ensureNdk();

      const buf: any[] = [];
      const sub = ndk.subscribe(
        {
          kinds: [9735],
          '#p': [challenge.content.targetPubkey],
          limit: 500,
        } as any,
        { closeOnEose: false },
      );

      sub.on('event', (ev) => {
        buf.push(ev);
        receipts = buf.length;
        recomputeFrom(buf);
        for (const r of rows) void fetchProfileFor(r.pubkey);
      });
      sub.on('eose', () => (loading = false));
      stop = () => sub.stop();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      loading = false;
    }
  }

  let lastKey: string | null = null;
  $: key = challenge ? `${challenge.address}:${challenge.eventId}` : null;
  $: if (key && key !== lastKey) {
    lastKey = key;
    void start();
  }

  onDestroy(() => {
    if (stop) stop();
  });

  $: goal = challenge.content.goalSats;
  $: pct = goal ? Math.min(100, Math.floor((totalSats / goal) * 100)) : null;
</script>

<div class="card" style="padding: 1rem;">
  <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem;">
    <div style="font-weight: 950;">Leaderboard</div>
    <div class="muted">{#if loading}Live…{/if}</div>
  </div>

  <div style="margin-top:0.55rem; display:flex; gap:0.35rem; flex-wrap:wrap;">
    <span class="pill">Total: {totalSats.toLocaleString()} sats</span>
    <span class="pill muted">Zappers: {unique}</span>
    <span class="pill muted">Receipts: {receipts}</span>
    {#if goal}
      <span class="pill">Goal: {goal.toLocaleString()} sats</span>
      <span class="pill muted">{pct}%</span>
    {/if}
  </div>

  {#if goal}
    <div class="bar" aria-label="Goal progress" title={`${pct}%`}>
      <div class="fill" style={`width:${pct}%`}></div>
    </div>
  {/if}

  {#if error}
    <div class="muted" style="margin-top:0.75rem; color: var(--danger);">{error}</div>
  {/if}

  <div style="margin-top: 0.85rem; display:grid; gap:0.5rem;">
    {#each rows as r, idx (r.pubkey)}
      <div class="row">
        <div class="rank">#{idx + 1}</div>
        <div class="who">
          {#if $profileByPubkey[r.pubkey]?.picture}
            <img src={$profileByPubkey[r.pubkey].picture} alt="" class="avatar" />
          {/if}
          <div class="name">
            {$profileByPubkey[r.pubkey]?.display_name ||
              $profileByPubkey[r.pubkey]?.name ||
              npubFor(r.pubkey).slice(0, 12) + '…'}
            <div class="muted small">{npubFor(r.pubkey).slice(0, 16)}…</div>
          </div>
        </div>
        <div class="score">
          <div style="font-weight: 950;">{r.sats.toLocaleString()} sats</div>
          <div class="muted small">{r.zaps} zap(s)</div>
        </div>
      </div>
    {/each}

    {#if !rows.length && !loading}
      <div class="muted">No zaps attributed to this challenge yet.</div>
    {/if}
  </div>
</div>

<style>
  .bar {
    margin-top: 0.7rem;
    height: 10px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: linear-gradient(90deg, rgba(246, 196, 83, 0.55), rgba(139, 92, 246, 0.45));
  }
  .row {
    display: grid;
    grid-template-columns: 52px 1fr auto;
    gap: 0.75rem;
    align-items: center;
    padding: 0.75rem 0.85rem;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: rgba(0, 0, 0, 0.16);
  }
  .rank {
    font-weight: 950;
    color: var(--accent);
  }
  .who {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    min-width: 0;
  }
  .avatar {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    border: 1px solid var(--border);
    object-fit: cover;
  }
  .name {
    min-width: 0;
    font-weight: 900;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .score {
    text-align: right;
    min-width: 120px;
  }
  .small {
    font-size: 0.86rem;
  }
</style>

