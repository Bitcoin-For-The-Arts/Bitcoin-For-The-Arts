<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { ensureNdk } from '$lib/stores/ndk';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import { parseZapReceipt } from '$lib/nostr/zap-receipts';
  import { collectEventsWithDeadline } from '$lib/nostr/collect';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';

  export let recipientPubkey: string;
  export let limit = 200;

  type Row = {
    id: string;
    createdAt: number;
    senderPubkey: string;
    sats: number;
    comment?: string;
    targetEventId?: string;
  };

  let loading = false;
  let error: string | null = null;
  let rows: Row[] = [];
  let showN = 60;
  let partial = false;

  async function load() {
    error = null;
    rows = [];
    if (!recipientPubkey) return;
    loading = true;
    partial = false;
    try {
      const ndk = await ensureNdk();
      const pk = recipientPubkey.trim().toLowerCase();
      const res = await collectEventsWithDeadline(
        ndk as any,
        { kinds: [NOSTR_KINDS.nip57_zap_receipt], '#p': [pk], limit: Math.max(50, Math.min(1200, limit)) } as any,
        { timeoutMs: 18_000, maxEvents: Math.max(200, Math.min(2000, limit)) },
      );
      partial = res.timedOut;
      const parsed: Row[] = [];
      for (const ev of Array.from(res.events || []) as any[]) {
        const z = parseZapReceipt(ev);
        if (!z) continue;
        if ((z.recipientPubkey || '').trim().toLowerCase() !== pk) continue;
        const sender = (z.senderPubkey || ev?.pubkey || '').trim().toLowerCase();
        if (!sender) continue;
        const sats = Math.max(0, Math.floor(z.amountSats || 0));
        const targetEventId = (z.eTags || []).find((x) => typeof x === 'string' && x) || undefined;
        parsed.push({
          id: z.receiptId,
          createdAt: z.createdAt,
          senderPubkey: sender,
          sats,
          comment: z.comment,
          targetEventId,
        });
        void fetchProfileFor(sender);
      }
      parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      rows = parsed.slice(0, 900);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  $: if (recipientPubkey) void load();
  onMount(() => void load());
</script>

<div class="card" style="padding: 1rem;">
  <div style="display:flex; align-items:center; justify-content:space-between; gap: 1rem; flex-wrap:wrap;">
    <div>
      <div style="font-size: 1.05rem; font-weight: 950;">Zaps received</div>
      <div class="muted" style="margin-top:0.35rem; line-height:1.5;">
        Showing {Math.min(showN, rows.length).toLocaleString()} of {rows.length.toLocaleString()} zap receipt(s) found on your connected relays.
      </div>
      {#if partial}
        <div class="muted" style="margin-top:0.35rem; line-height:1.4;">
          Some relays are slow/unreachable — this list may be incomplete. Try Refresh.
        </div>
      {/if}
    </div>
    <button class="btn" disabled={loading} on:click={load}>{loading ? 'Loading…' : 'Refresh'}</button>
  </div>

  {#if error}
    <div class="muted" style="margin-top:0.75rem; color: var(--danger);">{error}</div>
  {:else if loading && rows.length === 0}
    <div class="muted" style="margin-top:0.75rem;">Loading zaps…</div>
  {:else if rows.length === 0}
    <div class="muted" style="margin-top:0.75rem;">No zap receipts found yet (depends on relays).</div>
  {:else}
    <div class="grid" style="gap:0.6rem; margin-top: 0.85rem;">
      {#each rows.slice(0, showN) as r (r.id)}
        {@const prof = $profileByPubkey[r.senderPubkey]}
        {@const name = (prof?.display_name || prof?.name || npubFor(r.senderPubkey).slice(0, 12) + '…').trim()}
        <div class="card" style="padding: 0.85rem 0.95rem;">
          <div style="display:flex; gap:0.5rem; align-items:baseline; flex-wrap:wrap;">
            <span style="font-weight: 950;">⚡ {r.sats.toLocaleString()} sats</span>
            <a class="muted" href={`${base}/profile/${npubFor(r.senderPubkey)}`}>{name}</a>
            {#if r.comment}
              <span class="muted">— {r.comment}</span>
            {/if}
          </div>
          {#if r.targetEventId}
            <div class="muted mono" style="margin-top:0.35rem; font-size:0.82rem; overflow:hidden; text-overflow:ellipsis;">
              Target event: {r.targetEventId.slice(0, 12)}…{r.targetEventId.slice(-10)}
            </div>
          {/if}
        </div>
      {/each}

      {#if rows.length > showN}
        <div class="card" style="padding: 1rem;">
          <div class="muted">Load more zaps.</div>
          <button class="btn" style="margin-top:0.6rem;" on:click={() => (showN = Math.min(rows.length, showN + 80))}>Load more</button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  }
</style>

