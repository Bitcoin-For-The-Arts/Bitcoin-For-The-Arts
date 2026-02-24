<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { nanoid } from 'nanoid';
  import { publishNip15Product, publishNip15Stall, publishNip99Classified } from '$lib/nostr/publish';
  import type { Nip15ProductContent, Nip15StallContent, Nip99Classified } from '$lib/nostr/types';
  import { isAuthed, pubkey, profile } from '$lib/stores/auth';

  type Mode = 'service' | 'classified';
  let mode: Mode = 'service';

  let title = '';
  let summary = '';
  let description = '';
  let imagesCsv = '';
  let tagsCsv = '';
  let category = '';
  let priceSats: number | null = 10000;
  let availability: Nip15ProductContent['availability'] = 'made_to_order';
  let auctionEnabled = false;
  let auctionEndDays = 7;
  let status: Nip99Classified['status'] = 'active';

  let busy = false;
  let error: string | null = null;

  function csvList(v: string): string[] {
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 24);
  }

  function deriveStallId(pk: string): string {
    return `bfta-${pk.slice(0, 10)}`;
  }

  async function publish() {
    error = null;
    if (!$isAuthed || !$pubkey) {
      error = 'Connect your signer first.';
      return;
    }
    if (!title.trim()) {
      error = 'Title is required.';
      return;
    }

    busy = true;
    try {
      const images = csvList(imagesCsv);
      const tags = csvList(tagsCsv).map((t) => t.replace(/^#/, ''));

      if (mode === 'service') {
        const stallId = deriveStallId($pubkey);
        const stall: Nip15StallContent = {
          id: stallId,
          name: ($profile?.display_name || $profile?.name || 'Artist') + ' — Services',
          description: 'Bitcoin for the Arts • Artist Hub (NIP-15 stall)',
          currency: 'sat',
        };
        await publishNip15Stall(stall);

        const prod: Nip15ProductContent = {
          id: nanoid(),
          stall_id: stallId,
          name: title.trim(),
          description: description.trim() || summary.trim(),
          images,
          price: Math.max(0, Number(priceSats ?? 0)),
          currency: 'sat',
          tags,
          category: category.trim() || undefined,
          availability,
          auction: auctionEnabled
            ? {
                enabled: true,
                end_at: Math.floor(Date.now() / 1000) + auctionEndDays * 24 * 3600,
                reserve_price: Math.max(0, Number(priceSats ?? 0)),
              }
            : { enabled: false },
        };

        const ev = await publishNip15Product(prod);
        await goto(`${base}/listing/${ev.id}`);
        return;
      }

      const classified: Nip99Classified = {
        title: title.trim(),
        summary: summary.trim() || undefined,
        markdown: description.trim() || summary.trim(),
        images,
        tags,
        category: category.trim() || undefined,
        status,
        price: priceSats != null ? { amount: String(Math.max(0, Number(priceSats))) , currency: 'sat' } : undefined,
      };
      const ev = await publishNip99Classified(classified);
      await goto(`${base}/listing/${ev.id}`);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }
</script>

<div class="card" style="padding: 1rem;">
  <div class="muted" style="margin-bottom: 0.55rem;">Listing type</div>
  <div class="row">
    <button class={`btn ${mode === 'service' ? 'primary' : ''}`} on:click={() => (mode = 'service')}>
      Service / Gig (NIP-15)
    </button>
    <button class={`btn ${mode === 'classified' ? 'primary' : ''}`} on:click={() => (mode = 'classified')}>
      One-off / Collab request (NIP-99)
    </button>
  </div>

  <div class="grid cols-2" style="margin-top: 0.9rem;">
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Title</div>
      <input class="input" bind:value={title} placeholder="Custom Bitcoin illustration / Seeking film collaborator…" />
    </div>
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Category</div>
      <select class="select" bind:value={category}>
        <option value="">Pick a category</option>
        <option value="Visual Arts">Visual Arts</option>
        <option value="Music">Music</option>
        <option value="Film">Film</option>
        <option value="Writing">Writing</option>
        <option value="Design">Design</option>
        <option value="Workshops">Workshops</option>
        <option value="Collaboration">Collaboration</option>
      </select>
    </div>
  </div>

  <div class="grid cols-2" style="margin-top: 0.9rem;">
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Price (sats)</div>
      <input class="input" type="number" min="0" step="1" bind:value={priceSats} />
      <div class="muted" style="margin-top:0.35rem; font-size:0.9rem;">
        For open-ended collaborations, you can set 0 or leave blank.
      </div>
    </div>
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Tags / hashtags (comma-separated)</div>
      <input class="input" bind:value={tagsCsv} placeholder="#BitcoinArt, #NostrArt, #Commission…" />
    </div>
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Short summary (optional)</div>
    <input class="input" bind:value={summary} placeholder="One line elevator pitch…" />
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Description</div>
    <textarea class="textarea" bind:value={description} placeholder="Details, deliverables, timeline, terms…"></textarea>
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Images (comma-separated URLs)</div>
    <input class="input" bind:value={imagesCsv} placeholder="https://…, https://…" />
  </div>

  {#if mode === 'service'}
    <div class="card" style="margin-top: 0.9rem; padding: 0.9rem; background: rgba(0,0,0,0.18);">
      <div class="muted" style="margin-bottom: 0.6rem;">Service settings (NIP-15)</div>
      <div class="grid cols-2">
        <div>
          <div class="muted" style="margin-bottom:0.35rem;">Availability</div>
          <select class="select" bind:value={availability}>
            <option value="made_to_order">Made to order</option>
            <option value="in_stock">In stock</option>
            <option value="limited">Limited</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
        <div>
          <div class="muted" style="margin-bottom:0.35rem;">Auction (experimental)</div>
          <div class="row">
            <label class="pill">
              <input type="checkbox" bind:checked={auctionEnabled} />
              Enable
            </label>
            <label class="pill muted">
              Ends in
              <input class="input" style="width:92px; padding:0.35rem 0.5rem;" type="number" min="1" max="30" bind:value={auctionEndDays} />
              days
            </label>
          </div>
        </div>
      </div>
      <div class="muted" style="margin-top:0.6rem; line-height:1.35;">
        Auction support is stored in the NIP-15 product content for compatibility; you can map it to NIP-1021/1022 in future iterations.
      </div>
    </div>
  {:else}
    <div class="card" style="margin-top: 0.9rem; padding: 0.9rem; background: rgba(0,0,0,0.18);">
      <div class="muted" style="margin-bottom: 0.6rem;">Classified status (NIP-99)</div>
      <select class="select" bind:value={status}>
        <option value="active">Active</option>
        <option value="sold">Sold / Closed</option>
      </select>
    </div>
  {/if}

  <div style="margin-top: 1rem; display:flex; gap:0.5rem; align-items:center; justify-content:space-between;">
    <button class="btn primary" disabled={busy} on:click={publish}>
      {busy ? 'Publishing…' : 'Publish listing'}
    </button>
    <div class="muted" style="font-size:0.92rem;">
      Publishes to public relays as signed Nostr events (no central database).
    </div>
  </div>

  {#if error}
    <div class="card" style="margin-top: 0.85rem; padding: 0.8rem; border-color: rgba(251,113,133,0.35);">
      <div class="muted">{error}</div>
    </div>
  {/if}
</div>

<style>
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }
</style>

