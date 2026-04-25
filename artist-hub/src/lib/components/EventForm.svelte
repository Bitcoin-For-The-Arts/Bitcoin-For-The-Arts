<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { canSign } from '$lib/stores/auth';
  import { publishHubEvent } from '$lib/nostr/events';

  let title = '';
  let summary = '';
  let markdown = '';
  let imagesCsv = '';
  let tagsCsv = 'workshop, bitcoinart';
  let start = '';
  let end = '';
  let location = '';
  let url = '';

  let busy = false;
  let error: string | null = null;
  let ok: string | null = null;

  function csv(v: string): string[] {
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30);
  }

  function parseTime(v: string): number | undefined {
    const t = Date.parse(v);
    if (!Number.isFinite(t)) return undefined;
    return Math.floor(t / 1000);
  }

  async function publish() {
    error = null;
    ok = null;
    if (!$canSign) {
      error = 'Connect your signer to publish an event.';
      return;
    }
    if (!title.trim()) {
      error = 'Title is required.';
      return;
    }
    busy = true;
    try {
      const id = await publishHubEvent({
        title: title.trim(),
        summary: summary.trim() || undefined,
        markdown: (markdown.trim() || summary.trim()).trim(),
        images: csv(imagesCsv),
        tags: csv(tagsCsv),
        start: parseTime(start),
        end: parseTime(end),
        location: location.trim() || undefined,
        url: url.trim() || undefined,
      });
      ok = `Published. (${id.slice(0, 12)}…)`;
      await goto(`${base}/events`);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }
</script>

<div class="card" style="padding: 1rem;">
  <div style="font-weight: 950; font-size: 1.1rem;">Publish an event</div>
  <div class="muted" style="margin-top:0.35rem; line-height:1.55;">
    Events are published as NIP-99 classifieds (`kind:30402`) tagged with `#event`. This keeps it simple, portable, and
    relay-native.
  </div>

  <div class="grid cols-2" style="margin-top: 0.9rem;">
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Title</div>
      <input class="input" bind:value={title} placeholder="Workshop: Bitcoin for Artists / Exhibition opening…" />
    </div>
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Location (optional)</div>
      <input class="input" bind:value={location} placeholder="NYC / Online / Geohash / Venue…" />
    </div>
  </div>

  <div class="grid cols-2" style="margin-top: 0.9rem;">
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Start (optional)</div>
      <input class="input" bind:value={start} placeholder="2026-03-12 18:00 ET" />
    </div>
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">End (optional)</div>
      <input class="input" bind:value={end} placeholder="2026-03-12 20:00 ET" />
    </div>
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Link (optional)</div>
    <input class="input" bind:value={url} placeholder="Registration page / livestream link / ticket link…" />
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Summary (optional)</div>
    <input class="input" bind:value={summary} placeholder="One-line description…" />
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Description</div>
    <textarea class="textarea" bind:value={markdown} placeholder="Agenda, speakers, how to join, etc."></textarea>
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Images (comma-separated URLs)</div>
    <input class="input" bind:value={imagesCsv} placeholder="https://…, https://…" />
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Tags (comma-separated)</div>
    <input class="input" bind:value={tagsCsv} placeholder="workshop, meetup, exhibition, film…" />
  </div>

  <div style="margin-top: 1rem; display:flex; gap:0.5rem; align-items:center;">
    <button class="btn primary" disabled={busy} on:click={publish}>{busy ? 'Publishing…' : 'Publish event'}</button>
    <a class="btn" href={`${base}/events`}>Back</a>
    {#if ok}<span class="muted">{ok}</span>{/if}
  </div>

  {#if error}
    <div class="card" style="margin-top: 0.85rem; padding: 0.8rem; border-color: rgba(251,113,133,0.35);">
      <div class="muted">{error}</div>
    </div>
  {/if}
</div>

