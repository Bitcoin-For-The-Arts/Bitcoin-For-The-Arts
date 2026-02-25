<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { page } from '$app/stores';
  import { nip19 } from 'nostr-tools';
  import { ensureNdk } from '$lib/stores/ndk';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import ListingCard from '$lib/components/ListingCard.svelte';
  import type { Listing } from '$lib/nostr/types';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import { eventToListing } from '$lib/nostr/parse';
  import DMComposer from '$lib/components/DMComposer.svelte';
  import ZapComposer from '$lib/components/ZapComposer.svelte';
  import ActivityFeed from '$lib/components/ActivityFeed.svelte';

  let pubkey = '';
  let error: string | null = null;
  let listings: Listing[] = [];
  let stop: (() => void) | null = null;

  let dmOpen = false;
  let zapOpen = false;

  async function start() {
    if (!pubkey) return;
    const ndk = await ensureNdk();
    const sub = ndk.subscribe(
      {
        kinds: [NOSTR_KINDS.nip15_product, NOSTR_KINDS.nip99_classified],
        authors: [pubkey],
        limit: 100,
      },
      { closeOnEose: false },
    );
    sub.on('event', (ev) => {
      const l = eventToListing(ev as any);
      if (!l) return;
      listings = [l, ...listings.filter((x) => x.eventId !== l.eventId)].sort((a, b) => b.createdAt - a.createdAt);
    });
    stop = () => sub.stop();
  }

  onMount(() => {
    error = null;
    listings = [];
    const npub = String($page.params.npub || '');
    try {
      const decoded = nip19.decode(npub);
      if (decoded.type !== 'npub') throw new Error('Not an npub');
      pubkey = decoded.data as string;
      void fetchProfileFor(pubkey);
      void start();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  });

  onDestroy(() => {
    if (stop) stop();
  });

  $: prof = pubkey ? $profileByPubkey[pubkey] : undefined;
  $: name = prof?.display_name || prof?.name || 'Artist';
  $: about = (prof?.about || '').trim();
  $: skills = (prof as any)?.skills as string[] | undefined;
  $: hashtags = (prof as any)?.hashtags as string[] | undefined;
  $: portfolio = (prof as any)?.portfolio as string[] | undefined;
</script>

{#if error}
  <div class="card" style="padding: 1rem; border-color: rgba(251,113,133,0.35);">
    <div class="muted">{error}</div>
  </div>
{:else}
  <div class="grid cols-2">
    <div class="card" style="padding: 1rem;">
      <div style="display:flex; gap:0.9rem; align-items:center;">
        {#if prof?.picture}
          <img src={prof.picture} alt="" style="width:72px; height:72px; border-radius:22px; border:1px solid var(--border); object-fit:cover;" />
        {/if}
        <div style="min-width:0;">
          <div style="font-size: 1.4rem; font-weight: 950; line-height:1.1;">{name}</div>
          <div class="muted" style="margin-top: 0.25rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
            {$page.params.npub}
          </div>
        </div>
      </div>

      {#if about}
        <div class="muted" style="margin-top: 0.9rem; line-height: 1.55;">{about}</div>
      {/if}

      <div style="margin-top: 1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
        <button class="btn" on:click={() => (dmOpen = true)}>Message</button>
        <button class="btn primary" on:click={() => (zapOpen = true)}>Zap / Pay</button>
        {#if prof?.website}
          <a class="btn" href={prof.website} target="_blank" rel="noreferrer">Website</a>
        {/if}
      </div>

      {#if skills?.length}
        <div style="margin-top: 0.9rem;">
          <div class="muted" style="margin-bottom:0.35rem;">Skills</div>
          <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
            {#each skills.slice(0, 14) as s}
              <span class="pill">{s}</span>
            {/each}
          </div>
        </div>
      {/if}

      {#if hashtags?.length}
        <div style="margin-top: 0.9rem;">
          <div class="muted" style="margin-bottom:0.35rem;">Hashtags</div>
          <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
            {#each hashtags.slice(0, 14) as t}
              <span class="pill muted">#{t}</span>
            {/each}
          </div>
        </div>
      {/if}

      {#if portfolio?.length}
        <div style="margin-top: 0.9rem;">
          <div class="muted" style="margin-bottom:0.35rem;">Portfolio</div>
          <div style="display:grid; gap:0.35rem;">
            {#each portfolio.slice(0, 10) as url}
              <a href={url} target="_blank" rel="noreferrer" class="pill">{url}</a>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <div>
      <div class="card" style="padding: 1rem;">
        <div style="font-size: 1.15rem; font-weight: 900;">Listings</div>
        <div class="muted" style="margin-top: 0.35rem;">Services (NIP-15) and classifieds/collabs (NIP-99).</div>
      </div>

      <div class="grid cols-2" style="margin-top: 1rem;">
        {#each listings as l (l.eventId)}
          <ListingCard listing={l} />
        {/each}
        {#if listings.length === 0}
          <div class="card" style="padding: 1rem; grid-column: 1 / -1;">
            <div class="muted">No listings found on the connected relays yet.</div>
          </div>
        {/if}
      </div>

      <div style="margin-top: 1rem;">
        <ActivityFeed
          title="Recent activity (notes & zaps)"
          tags={(hashtags && hashtags.length ? hashtags : ['BitcoinArt', 'NostrArt']).map((t) => t.replace(/^#/, ''))}
          limit={20}
        />
      </div>
    </div>
  </div>

  <DMComposer open={dmOpen} toPubkey={pubkey} toLabel={name} onClose={() => (dmOpen = false)} />
  <ZapComposer
    open={zapOpen}
    recipientPubkey={pubkey}
    recipientLabel={name}
    onClose={() => (zapOpen = false)}
  />
{/if}

