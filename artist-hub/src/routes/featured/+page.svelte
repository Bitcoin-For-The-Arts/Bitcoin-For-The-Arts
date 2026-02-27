<script lang="ts">
  import { onMount } from 'svelte';
  import ProfileCard from '$lib/components/ProfileCard.svelte';
  import { featuredError, featuredPubkeys, startFeatured } from '$lib/stores/featured';
  import { bftaAdminNpub } from '$lib/stores/settings';
  import { pubkey, canSign } from '$lib/stores/auth';
  import { nip19 } from 'nostr-tools';
  import { publishCuratedSet } from '$lib/nostr/publish';
  import { BFTA_DEFAULT_FEATURED_SET_D } from '$lib/nostr/constants';

  let adminPubkey: string | null = null;
  $: {
    const raw = ($bftaAdminNpub || '').trim();
    if (!raw) adminPubkey = null;
    else {
      try {
        const decoded = nip19.decode(raw);
        adminPubkey = decoded.type === 'npub' ? (decoded.data as string) : null;
      } catch {
        adminPubkey = null;
      }
    }
  }

  $: isAdmin = Boolean($canSign && adminPubkey && $pubkey === adminPubkey);

  let npubsCsv = '';
  let saving = false;
  let saveError: string | null = null;
  let saveOk: string | null = null;

  async function saveFeatured() {
    saveError = null;
    saveOk = null;
    if (!isAdmin) {
      saveError = 'You are not connected as the configured BFTA admin npub.';
      return;
    }
    const items = npubsCsv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 200);
    const pubkeys: string[] = [];
    for (const v of items) {
      try {
        const decoded = nip19.decode(v);
        if (decoded.type === 'npub') pubkeys.push(decoded.data as string);
      } catch {
        // ignore
      }
    }
    if (!pubkeys.length) {
      saveError = 'No valid npubs provided.';
      return;
    }

    saving = true;
    try {
      await publishCuratedSet({
        d: BFTA_DEFAULT_FEATURED_SET_D,
        title: 'BFTA Featured Artists',
        description: 'Curated list of artists featured by Bitcoin for the Arts.',
        pubkeys,
      });
      saveOk = 'Featured list published (kind:30004).';
    } catch (e) {
      saveError = e instanceof Error ? e.message : String(e);
    } finally {
      saving = false;
    }
  }

  onMount(() => {
    void startFeatured();
  });
</script>

<div class="card" style="padding: 1rem;">
  <div style="font-size: 1.25rem; font-weight: 900;">Featured Artists</div>
  <div class="muted" style="margin-top: 0.35rem; line-height: 1.5;">
    Curated by BFTA admins via a NIP-51 curated set event (kind:30004). No server database.
  </div>
</div>

{#if isAdmin}
  <div class="card" style="margin-top: 1rem; padding: 1rem; border-color: rgba(246,196,83,0.35);">
    <div style="font-weight: 900;">Admin curation</div>
    <div class="muted" style="margin-top:0.35rem; line-height:1.5;">
      Publish the featured list as a NIP-51 curated set (`d={BFTA_DEFAULT_FEATURED_SET_D}`) from the configured admin npub.
    </div>
    <div style="margin-top:0.75rem;">
      <div class="muted" style="margin-bottom:0.35rem;">Featured artist npubs (comma-separated)</div>
      <textarea class="textarea" bind:value={npubsCsv} placeholder="npub1…, npub1…, …"></textarea>
    </div>
    <div style="margin-top:0.75rem; display:flex; gap:0.5rem; align-items:center;">
      <button class="btn primary" disabled={saving} on:click={saveFeatured}>
        {saving ? 'Publishing…' : 'Publish featured set'}
      </button>
      {#if saveOk}<span class="muted">{saveOk}</span>{/if}
    </div>
    {#if saveError}
      <div class="card" style="margin-top:0.75rem; padding:0.8rem; border-color: rgba(251,113,133,0.35);">
        <div class="muted">{saveError}</div>
      </div>
    {/if}
  </div>
{/if}

{#if $featuredError}
  <div class="card" style="margin-top: 1rem; padding: 1rem; border-color: rgba(251,113,133,0.35);">
    <div class="muted">{$featuredError}</div>
  </div>
{/if}

<div class="grid cols-3" style="margin-top: 1rem;">
  {#each $featuredPubkeys as pk (pk)}
    <ProfileCard pubkey={pk} />
  {/each}
  {#if !$featuredError && $featuredPubkeys.length === 0}
    <div class="card" style="padding: 1rem; grid-column: 1 / -1;">
      <div class="muted">
        No featured artists yet. Configure `PUBLIC_BFTA_ADMIN_NPUB` and publish a curated set with `d=bfta-featured-artists`.
      </div>
    </div>
  {/if}
</div>

