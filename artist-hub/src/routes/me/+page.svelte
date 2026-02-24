<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { isAuthed, pubkey, profile } from '$lib/stores/auth';
  import ProfileEditor from '$lib/components/ProfileEditor.svelte';
  import { ensureNdk } from '$lib/stores/ndk';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import type { Listing } from '$lib/nostr/types';
  import { eventToListing } from '$lib/nostr/parse';
  import ListingCard from '$lib/components/ListingCard.svelte';

  let mine: Listing[] = [];
  let stop: (() => void) | null = null;

  async function start() {
    if (!$pubkey) return;
    const ndk = await ensureNdk();
    const sub = ndk.subscribe(
      {
        kinds: [NOSTR_KINDS.nip15_product, NOSTR_KINDS.nip99_classified],
        authors: [$pubkey],
        limit: 100,
      },
      { closeOnEose: false },
    );

    sub.on('event', (ev) => {
      const l = eventToListing(ev as any);
      if (!l) return;
      mine = [l, ...mine.filter((x) => x.eventId !== l.eventId)].sort((a, b) => b.createdAt - a.createdAt);
    });

    stop = () => sub.stop();
  }

  onMount(() => {
    if ($pubkey) void start();
  });

  $: if ($pubkey) {
    // When a user connects after page load.
    if (!stop) void start();
  } else {
    mine = [];
    if (stop) stop();
    stop = null;
  }

  onDestroy(() => {
    if (stop) stop();
  });
</script>

<div class="grid cols-2">
  <div>
    <div class="card" style="padding: 1rem;">
      <div style="font-size: 1.25rem; font-weight: 900;">My profile</div>
      <div class="muted" style="margin-top: 0.35rem; line-height: 1.5;">
        Your identity is your npub. Edit your profile metadata (kind:0) and publish it to relays.
      </div>
    </div>

    <div style="margin-top: 1rem;">
      {#if $isAuthed}
        <ProfileEditor />
      {:else}
        <div class="card" style="padding: 1rem; border-color: rgba(246,196,83,0.35);">
          <div class="muted">Connect your signer to view and edit your profile.</div>
        </div>
      {/if}
    </div>
  </div>

  <div>
    <div class="card" style="padding: 1rem;">
      <div style="font-size: 1.25rem; font-weight: 900;">My listings</div>
      <div class="muted" style="margin-top: 0.35rem;">Latest NIP-15 services and NIP-99 classifieds you’ve published.</div>
    </div>

    <div class="grid cols-2" style="margin-top: 1rem;">
      {#each mine as l (l.eventId)}
        <ListingCard listing={l} />
      {/each}
      {#if $isAuthed && mine.length === 0}
        <div class="card" style="padding: 1rem; grid-column: 1 / -1;">
          <div class="muted">No listings found yet. Create one from the “Create” tab.</div>
        </div>
      {/if}
    </div>
  </div>
</div>

