<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { canSign, pubkey } from '$lib/stores/auth';
  import { publishZapChallenge } from '$lib/nostr/challenges';

  let title = '';
  let about = '';
  let picture = '';
  let tagsCsv = 'BitcoinArt, NostrArt, BFTA';
  let goalSats: number | null = 50000;

  // Default: start now, run 24h
  const now = new Date();
  let startsAt = now.toISOString().slice(0, 16);
  let endsAt = new Date(now.getTime() + 24 * 3600 * 1000).toISOString().slice(0, 16);

  let targetPubkey = '';
  let targetLabel = '';
  let channelId = '';

  let busy = false;
  let error: string | null = null;

  function csv(v: string): string[] {
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30);
  }

  function parseTime(v: string): number {
    const ms = Date.parse(v);
    if (!Number.isFinite(ms)) throw new Error('Invalid date/time');
    return Math.floor(ms / 1000);
  }

  $: if ($pubkey && !targetPubkey) targetPubkey = $pubkey;

  async function publish() {
    error = null;
    if (!$canSign) {
      error = 'Connect your signer to publish a challenge.';
      return;
    }
    busy = true;
    try {
      await publishZapChallenge({
        title: title.trim(),
        about: about.trim() || undefined,
        picture: picture.trim() || undefined,
        tags: csv(tagsCsv).map((t) => t.replace(/^#/, '')),
        startsAt: parseTime(startsAt),
        endsAt: parseTime(endsAt),
        goalSats: goalSats != null ? Math.max(0, Number(goalSats)) : undefined,
        targetPubkey: targetPubkey.trim(),
        targetLabel: targetLabel.trim() || undefined,
        channelId: channelId.trim() || undefined,
      });
      await goto(`${base}/challenges`);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }
</script>

<div class="card" style="padding: 1rem;">
  <div style="font-weight: 950; font-size: 1.1rem;">Create Zap Challenge</div>
  <div class="muted" style="margin-top:0.35rem; line-height:1.55;">
    A Zap Challenge is a time-boxed “arena” published as a Nostr event (`kind:30051`). Anyone can participate by zapping
    the target during the window. The leaderboard is computed from public zap receipts (no server).
  </div>

  <div class="grid cols-2" style="margin-top: 0.9rem;">
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Title</div>
      <input class="input" bind:value={title} placeholder="Zap Battle: Fund the Workshop / Top Zappers…" />
    </div>
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Cover image URL (optional)</div>
      <input class="input" bind:value={picture} placeholder="https://…" />
    </div>
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">About</div>
    <textarea class="textarea" bind:value={about} placeholder="Explain the purpose, prize, rules, and vibe…"></textarea>
  </div>

  <div class="grid cols-2" style="margin-top: 0.9rem;">
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Starts</div>
      <input class="input" type="datetime-local" bind:value={startsAt} />
    </div>
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Ends</div>
      <input class="input" type="datetime-local" bind:value={endsAt} />
    </div>
  </div>

  <div class="grid cols-2" style="margin-top: 0.9rem;">
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Target pubkey</div>
      <input class="input" bind:value={targetPubkey} placeholder="hex pubkey (defaults to your pubkey)" />
      <div class="muted" style="margin-top:0.35rem; line-height:1.4;">
        Zaps go directly to this pubkey’s Lightning address (from their kind:0 metadata).
      </div>
    </div>
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Target label (optional)</div>
      <input class="input" bind:value={targetLabel} placeholder="Bitcoin For The Arts / Artist name…" />
    </div>
  </div>

  <div class="grid cols-2" style="margin-top: 0.9rem;">
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Goal (sats, optional)</div>
      <input class="input" type="number" min="0" step="1" bind:value={goalSats} />
    </div>
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Live channel id (optional)</div>
      <input class="input" bind:value={channelId} placeholder="NIP-28 channel (kind:40 id)" />
    </div>
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Tags (comma-separated)</div>
    <input class="input" bind:value={tagsCsv} placeholder="BitcoinArt, Workshop, Film, Dance…" />
  </div>

  <div style="margin-top: 1rem; display:flex; gap:0.5rem; align-items:center;">
    <button class="btn primary" disabled={busy} on:click={publish}>{busy ? 'Publishing…' : 'Publish challenge'}</button>
    <a class="btn" href={`${base}/challenges`}>Back</a>
  </div>

  {#if error}
    <div class="card" style="margin-top: 0.85rem; padding: 0.8rem; border-color: rgba(251,113,133,0.35);">
      <div class="muted">{error}</div>
    </div>
  {/if}
</div>

