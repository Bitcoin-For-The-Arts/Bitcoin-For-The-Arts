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
  import { parseZapReceipt } from '$lib/nostr/zap-receipts';
  import { isAuthed, pubkey as myPubkey } from '$lib/stores/auth';
  import { followingError, followingLoading, followingSet, toggleFollow } from '$lib/stores/follows';

  let pubkey = '';
  let error: string | null = null;
  let listings: Listing[] = [];
  let stop: (() => void) | null = null;

  let dmOpen = false;
  let zapOpen = false;

  type Metrics = {
    following: { value: number; approx: boolean } | null;
    followers: { value: number; approx: boolean } | null;
    posts: { value: number; approx: boolean } | null;
    replies: { value: number; approx: boolean } | null;
    reposts: { value: number; approx: boolean; plain: number; quotes: number } | null;
    zaps: { sats: number; count: number; approx: boolean } | null;
  };

  let metrics: Metrics | null = null;
  let metricsLoading = false;
  let metricsError: string | null = null;

  type Badge = { address: string; name: string; description?: string; image?: string; thumb?: string };
  let badges: Badge[] = [];
  let badgesLoading = false;
  let badgesError: string | null = null;

  function tagValue(tags: string[][], name: string): string | undefined {
    return tags.find((t) => t[0] === name)?.[1];
  }

  function isReply(ev: any): boolean {
    const tags = (ev.tags as string[][]) || [];
    return tags.some((t) => t[0] === 'e');
  }

  function isQuote(ev: any): boolean {
    const tags = (ev.tags as string[][]) || [];
    return tags.some((t) => t[0] === 'q');
  }

  async function loadMetricsFor(pk: string) {
    metricsError = null;
    metricsLoading = true;
    metrics = null;

    try {
      const ndk = await ensureNdk();

      // Following (NIP-02 contacts list, kind 3)
      const contacts = await ndk.fetchEvent({ kinds: [NOSTR_KINDS.contacts], authors: [pk] } as any);
      const following = contacts?.tags ? (contacts.tags as any as string[][]).filter((t) => t[0] === 'p').length : 0;

      // Followers (best-effort: unique authors of kind 3 that include '#p' = pk)
      const followersLimit = 1000;
      const followerAuthors = new Set<string>();
      let followersSeen = 0;
      await new Promise<void>((resolve, reject) => {
        const sub = ndk.subscribe(
          { kinds: [NOSTR_KINDS.contacts], '#p': [pk], limit: followersLimit } as any,
          { closeOnEose: true },
        );
        sub.on('event', (ev) => {
          followersSeen += 1;
          if (typeof ev?.pubkey === 'string') followerAuthors.add(ev.pubkey);
        });
        sub.on('eose', () => resolve());
        sub.on('error', (e: any) => reject(e));
      });

      // Posts / replies / quote reposts (kind 1)
      const notesLimit = 1000;
      let posts = 0;
      let replies = 0;
      let quoteReposts = 0;
      let notesSeen = 0;
      await new Promise<void>((resolve, reject) => {
        const sub = ndk.subscribe({ kinds: [NOSTR_KINDS.note], authors: [pk], limit: notesLimit } as any, { closeOnEose: true });
        sub.on('event', (ev) => {
          notesSeen += 1;
          if (isQuote(ev)) {
            quoteReposts += 1;
            return;
          }
          if (isReply(ev)) {
            replies += 1;
            return;
          }
          posts += 1;
        });
        sub.on('eose', () => resolve());
        sub.on('error', (e: any) => reject(e));
      });

      // Plain reposts (kind 6)
      const repostLimit = 1000;
      let plainReposts = 0;
      let repostsSeen = 0;
      await new Promise<void>((resolve, reject) => {
        const sub = ndk.subscribe({ kinds: [NOSTR_KINDS.repost], authors: [pk], limit: repostLimit } as any, { closeOnEose: true });
        sub.on('event', () => {
          repostsSeen += 1;
          plainReposts += 1;
        });
        sub.on('eose', () => resolve());
        sub.on('error', (e: any) => reject(e));
      });

      // Zap receipts (kind 9735) to this pubkey (best-effort totals)
      const zapsLimit = 1000;
      let zapCount = 0;
      let zapSats = 0;
      let zapsSeen = 0;
      await new Promise<void>((resolve, reject) => {
        const sub = ndk.subscribe(
          { kinds: [NOSTR_KINDS.nip57_zap_receipt], '#p': [pk], limit: zapsLimit } as any,
          { closeOnEose: true },
        );
        sub.on('event', (ev) => {
          zapsSeen += 1;
          const parsed = parseZapReceipt(ev);
          if (!parsed) return;
          if (parsed.recipientPubkey !== pk) return;
          zapCount += 1;
          zapSats += parsed.amountSats ?? 0;
        });
        sub.on('eose', () => resolve());
        sub.on('error', (e: any) => reject(e));
      });

      metrics = {
        following: { value: following, approx: false },
        followers: { value: followerAuthors.size, approx: followersSeen >= followersLimit },
        posts: { value: posts, approx: notesSeen >= notesLimit },
        replies: { value: replies, approx: notesSeen >= notesLimit },
        reposts: { value: plainReposts + quoteReposts, approx: repostsSeen >= repostLimit || notesSeen >= notesLimit, plain: plainReposts, quotes: quoteReposts },
        zaps: { sats: zapSats, count: zapCount, approx: zapsSeen >= zapsLimit },
      };
    } catch (e) {
      metricsError = e instanceof Error ? e.message : String(e);
    } finally {
      metricsLoading = false;
    }
  }

  function parseAddress(a: string): { kind: number; pubkey: string; d: string } | null {
    if (!a || typeof a !== 'string') return null;
    const parts = a.split(':');
    if (parts.length < 3) return null;
    const kind = Number(parts[0]);
    if (!Number.isFinite(kind)) return null;
    const pubkey = parts[1];
    const d = parts.slice(2).join(':');
    if (!pubkey || !d) return null;
    return { kind, pubkey, d };
  }

  async function loadBadgesFor(pk: string) {
    badgesError = null;
    badgesLoading = true;
    badges = [];

    try {
      const ndk = await ensureNdk();
      const limit = 200;
      const addresses = new Set<string>();

      await new Promise<void>((resolve, reject) => {
        const sub = ndk.subscribe({ kinds: [NOSTR_KINDS.nip58_badge_award], '#p': [pk], limit } as any, { closeOnEose: true });
        sub.on('event', (ev) => {
          const tags = (ev.tags as string[][]) || [];
          for (const t of tags) {
            if (t[0] === 'a' && typeof t[1] === 'string') addresses.add(t[1]);
          }
        });
        sub.on('eose', () => resolve());
        sub.on('error', (e: any) => reject(e));
      });

      const out: Badge[] = [];
      for (const a of Array.from(addresses).slice(0, 30)) {
        const parsed = parseAddress(a);
        if (!parsed) continue;
        if (parsed.kind !== NOSTR_KINDS.nip58_badge_definition) continue;
        const def = await ndk.fetchEvent({ kinds: [parsed.kind], authors: [parsed.pubkey], '#d': [parsed.d] } as any);
        const tags = (def?.tags as any as string[][]) || [];
        const name = tagValue(tags, 'name') || 'Badge';
        const description = tagValue(tags, 'description');
        const image = tagValue(tags, 'image');
        const thumb = tagValue(tags, 'thumb') || image;
        out.push({ address: a, name, description, image, thumb });
      }

      badges = out;
    } catch (e) {
      badgesError = e instanceof Error ? e.message : String(e);
    } finally {
      badgesLoading = false;
    }
  }

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
      void loadMetricsFor(pubkey);
      void loadBadgesFor(pubkey);
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
  $: nip05 = (prof as any)?.nip05 as string | undefined;
  $: canFollow = $isAuthed && $myPubkey && pubkey && $myPubkey !== pubkey;
  $: isFollowing = pubkey ? $followingSet.has(pubkey) : false;

  async function onToggleFollow() {
    if (!pubkey) return;
    await toggleFollow(pubkey);
  }
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

      <div style="margin-top: 0.9rem;">
        <div style="font-weight: 950;">Stats</div>
        <div class="muted" style="margin-top:0.35rem; line-height:1.45;">
          Best-effort counts from your connected relays (no central index).
        </div>
        {#if metricsError}
          <div class="muted" style="margin-top:0.5rem; color:var(--danger);">{metricsError}</div>
        {:else if metricsLoading}
          <div class="muted" style="margin-top:0.5rem;">Loading stats…</div>
        {:else if metrics}
          <div style="margin-top:0.55rem; display:flex; gap:0.35rem; flex-wrap:wrap;">
            <span class="pill muted">
              Followers: {metrics.followers ? `${metrics.followers.approx ? '≥' : ''}${metrics.followers.value.toLocaleString()}` : '—'}
            </span>
            <span class="pill muted">
              Following: {metrics.following ? `${metrics.following.approx ? '≥' : ''}${metrics.following.value.toLocaleString()}` : '—'}
            </span>
            <span class="pill muted">
              Posts: {metrics.posts ? `${metrics.posts.approx ? '≥' : ''}${metrics.posts.value.toLocaleString()}` : '—'}
            </span>
            <span class="pill muted">
              Replies: {metrics.replies ? `${metrics.replies.approx ? '≥' : ''}${metrics.replies.value.toLocaleString()}` : '—'}
            </span>
            <span class="pill muted" title="Includes quote reposts">
              Reposts: {metrics.reposts ? `${metrics.reposts.approx ? '≥' : ''}${metrics.reposts.value.toLocaleString()}` : '—'}
            </span>
            <span class="pill" title="Total sats (zap receipts)">
              Zaps: {metrics.zaps ? `${metrics.zaps.approx ? '≥' : ''}${metrics.zaps.sats.toLocaleString()} sats` : '—'}
            </span>
          </div>
          {#if metrics.reposts}
            <div class="muted small" style="margin-top:0.35rem;">
              Reposts breakdown: {metrics.reposts.plain.toLocaleString()} plain • {metrics.reposts.quotes.toLocaleString()} quote
            </div>
          {/if}
          {#if metrics.zaps}
            <div class="muted small" style="margin-top:0.15rem;">Zap receipts counted: {metrics.zaps.count.toLocaleString()}</div>
          {/if}
        {/if}
      </div>

      {#if nip05}
        <div style="margin-top: 0.9rem;">
          <div class="muted" style="margin-bottom:0.35rem;">NIP-05</div>
          <span class="pill">{nip05}</span>
        </div>
      {/if}

      <div style="margin-top: 0.9rem;">
        <div style="font-weight: 950;">Badges</div>
        {#if badgesError}
          <div class="muted" style="margin-top:0.5rem; color:var(--danger);">{badgesError}</div>
        {:else if badgesLoading}
          <div class="muted" style="margin-top:0.5rem;">Loading badges…</div>
        {:else if badges.length}
          <div style="margin-top:0.55rem; display:flex; gap:0.35rem; flex-wrap:wrap;">
            {#each badges as b (b.address)}
              <span class="pill muted" title={b.description || b.address}>
                {#if b.thumb}
                  <img src={b.thumb} alt="" style="width:16px; height:16px; border-radius:6px; border:1px solid var(--border); object-fit:cover; margin-right:0.35rem; vertical-align:-3px;" />
                {/if}
                {b.name}
              </span>
            {/each}
          </div>
        {:else}
          <div class="muted" style="margin-top:0.5rem;">No badges found yet.</div>
        {/if}
      </div>

      <div style="margin-top: 1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
        <button class="btn" on:click={() => (dmOpen = true)}>Message</button>
        <button class="btn primary" on:click={() => (zapOpen = true)}>Zap / Pay</button>
        {#if canFollow}
          <button class={`btn ${isFollowing ? '' : 'primary'}`} disabled={$followingLoading} on:click={onToggleFollow}>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        {/if}
        {#if prof?.website}
          <a class="btn" href={prof.website} target="_blank" rel="noreferrer">Website / Portfolio</a>
        {/if}
      </div>
      {#if canFollow && $followingError}
        <div class="muted" style="margin-top:0.5rem; color:var(--danger);">{$followingError}</div>
      {/if}

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

