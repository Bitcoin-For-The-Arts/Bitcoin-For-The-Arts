<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { nip19 } from 'nostr-tools';
  import { ensureNdk } from '$lib/stores/ndk';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import ListingCard from '$lib/components/ListingCard.svelte';
  import type { Listing } from '$lib/nostr/types';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import { eventToListing } from '$lib/nostr/parse';
  import DMComposer from '$lib/components/DMComposer.svelte';
  import ZapComposer from '$lib/components/ZapComposer.svelte';
  import PulseFeed from '$lib/components/PulseFeed.svelte';
  import RichText from '$lib/components/RichText.svelte';
  import { parseZapReceipt } from '$lib/nostr/zap-receipts';
  import { isAuthed, pubkey as myPubkey } from '$lib/stores/auth';
  import { followingError, followingLoading, followingSet, toggleFollow } from '$lib/stores/follows';
  import NpubShareModal from '$lib/components/NpubShareModal.svelte';

  let pubkey = '';
  let error: string | null = null;
  let listings: Listing[] = [];
  let stop: (() => void) | null = null;

  let dmOpen = false;
  let zapOpen = false;
  let shareOpen = false;

  let tab: 'posts' | 'listings' = 'posts';

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

      // Followers (best-effort): unique authors of kind 3 that include '#p' = pk.
      const followersLimit = 1200;
      const followerAuthors = new Set<string>();
      const followerEvents = await ndk.fetchEvents({ kinds: [NOSTR_KINDS.contacts], '#p': [pk], limit: followersLimit } as any);
      const followerArr = Array.from(followerEvents || []);
      for (const ev of followerArr as any[]) {
        if (typeof ev?.pubkey === 'string') followerAuthors.add(ev.pubkey);
      }
      const followersSeen = followerArr.length;

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
  $: banner = ((prof as any)?.banner as string | undefined) || '';
  $: website = (prof?.website || '').trim();
  $: websiteIcon = (((prof as any)?.website_icon as string | undefined) || '').trim();
  $: lud16 = ((prof as any)?.lud16 as string | undefined) || ((prof as any)?.lud06 as string | undefined) || '';
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
  <div class="card headCard">
    <div class="banner" style={banner ? `background-image:url('${banner.replace(/'/g, '%27')}')` : ''}></div>
    <div class="headInner">
      <div class="topRow">
        <div class="left">
          {#if prof?.picture}
            <img class="avatar" src={prof.picture} alt="" />
          {:else}
            <div class="avatar ph"></div>
          {/if}
          <div class="titles">
            <div class="hName">{name}</div>
            <div class="mono muted npub">{$page.params.npub}</div>
            <div class="metaRow">
              {#if nip05}
                <span class="pill muted">NIP-05: {nip05}</span>
              {/if}
              {#if lud16}
                <span class="pill muted" title="Lightning address">{lud16}</span>
              {/if}
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn" on:click={() => (dmOpen = true)}>Message</button>
          <button class="btn primary" on:click={() => (zapOpen = true)}>Zap / Pay</button>
          {#if canFollow}
            <button class={`btn ${isFollowing ? '' : 'primary'}`} disabled={$followingLoading} on:click={onToggleFollow}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          {/if}
          {#if website}
            {@const host = (() => { try { return new URL(website.startsWith('http') ? website : `https://${website}`).hostname; } catch { return ''; } })()}
            {@const fav = host ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64` : ''}
            <a class="btn websiteBtn" href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noreferrer">
              {#if websiteIcon || fav}
                <img class="wicon" src={websiteIcon || fav} alt="" />
              {/if}
              Website
            </a>
          {/if}
          <button class="btn" on:click={() => (shareOpen = true)}>Copy npub</button>
        </div>
      </div>

      {#if canFollow && $followingError}
        <div class="muted" style="margin-top:0.65rem; color:var(--danger);">{$followingError}</div>
      {/if}

      {#if about}
        <div class="about"><RichText text={about} /></div>
      {/if}

      <div style="margin-top: 0.9rem;">
        <div class="muted" style="margin-bottom:0.35rem;">Overview</div>
        <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
          <span class="pill muted">Followers: {metricsLoading ? '…' : metrics?.followers ? `${metrics.followers.approx ? '≥' : ''}${metrics.followers.value.toLocaleString()}` : '—'}</span>
          <span class="pill muted">Following: {metricsLoading ? '…' : metrics?.following ? `${metrics.following.approx ? '≥' : ''}${metrics.following.value.toLocaleString()}` : '—'}</span>
          <span class="pill muted">Posts: {metricsLoading ? '…' : metrics?.posts ? `${metrics.posts.approx ? '≥' : ''}${metrics.posts.value.toLocaleString()}` : '—'}</span>
          <span class="pill muted">Replies: {metricsLoading ? '…' : metrics?.replies ? `${metrics.replies.approx ? '≥' : ''}${metrics.replies.value.toLocaleString()}` : '—'}</span>
          <span class="pill muted" title="Includes quote reposts">
            🔁 Reposts: {metricsLoading ? '…' : metrics?.reposts ? `${metrics.reposts.approx ? '≥' : ''}${metrics.reposts.value.toLocaleString()}` : '—'}
          </span>
          <span class="pill" title="Total sats (zap receipts)">
            ⚡ Zaps: {metricsLoading ? '…' : metrics?.zaps ? `${metrics.zaps.approx ? '≥' : ''}${metrics.zaps.sats.toLocaleString()} sats` : '—'}
          </span>
        </div>
      </div>

      {#if skills?.length}
        <div style="margin-top: 0.9rem;">
          <div class="muted" style="margin-bottom:0.35rem;">Skills</div>
          <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
            {#each skills.slice(0, 18) as s}
              <span class="pill">{s}</span>
            {/each}
          </div>
        </div>
      {/if}

      {#if hashtags?.length}
        <div style="margin-top: 0.9rem;">
          <div class="muted" style="margin-bottom:0.35rem;">Hashtags</div>
          <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
            {#each hashtags.slice(0, 18) as t}
              <span class="pill muted">#{t}</span>
            {/each}
          </div>
        </div>
      {/if}

      {#if portfolio?.length}
        <div style="margin-top: 0.9rem;">
          <div class="muted" style="margin-bottom:0.35rem;">Portfolio</div>
          <div style="display:grid; gap:0.35rem;">
            {#each portfolio.slice(0, 8) as url}
              <a href={url} target="_blank" rel="noreferrer" class="pill">{url}</a>
            {/each}
          </div>
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
                  <img
                    src={b.thumb}
                    alt=""
                    style="width:16px; height:16px; border-radius:6px; border:1px solid var(--border); object-fit:cover; margin-right:0.35rem; vertical-align:-3px;"
                  />
                {/if}
                {b.name}
              </span>
            {/each}
          </div>
        {:else}
          <div class="muted" style="margin-top:0.5rem;">No badges found yet.</div>
        {/if}
      </div>

      <div class="tabs">
        <button class={`tab ${tab === 'posts' ? 'active' : ''}`} on:click={() => (tab = 'posts')}>
          Posts {metricsLoading ? '…' : metrics?.posts ? `(${metrics.posts.value})` : ''}
        </button>
        <button class={`tab ${tab === 'listings' ? 'active' : ''}`} on:click={() => (tab = 'listings')}>
          Listings {listings.length ? `(${listings.length})` : ''}
        </button>
      </div>
    </div>
  </div>

  {#if tab === 'posts'}
    <div style="margin-top: 1rem;">
      <PulseFeed tags={[]} authors={[pubkey]} limit={50} showComposer={false} />
    </div>
  {:else if tab === 'listings'}
    <div class="card" style="padding: 1rem; margin-top: 1rem;">
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
  {/if}

  <DMComposer open={dmOpen} toPubkey={pubkey} toLabel={name} onClose={() => (dmOpen = false)} />
  <ZapComposer
    open={zapOpen}
    recipientPubkey={pubkey}
    recipientLabel={name}
    onClose={() => (zapOpen = false)}
  />
  <NpubShareModal open={shareOpen} npub={$page.params.npub} label={name} onClose={() => (shareOpen = false)} />
{/if}

<style>
  .headCard {
    overflow: hidden;
  }
  .banner {
    height: 140px;
    background:
      radial-gradient(900px 240px at 15% 30%, rgba(139, 92, 246, 0.35), transparent 60%),
      radial-gradient(700px 240px at 85% 35%, rgba(246, 196, 83, 0.26), transparent 60%),
      rgba(0, 0, 0, 0.18);
    background-size: cover;
    background-position: center;
    border-bottom: 1px solid var(--border);
  }
  .headInner {
    padding: 1rem;
  }
  .topRow {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .left {
    display: flex;
    gap: 0.85rem;
    align-items: flex-start;
    min-width: 0;
  }
  .avatar {
    width: 86px;
    height: 86px;
    margin-top: -42px;
    border-radius: 26px;
    border: 1px solid var(--border);
    object-fit: cover;
    background: rgba(0, 0, 0, 0.22);
    flex: 0 0 auto;
  }
  .avatar.ph {
    display: block;
  }
  .titles {
    min-width: 0;
  }
  .hName {
    font-size: 1.45rem;
    font-weight: 950;
    line-height: 1.1;
  }
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  }
  .npub {
    margin-top: 0.25rem;
    font-size: 0.88rem;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 78ch;
  }
  .metaRow {
    margin-top: 0.5rem;
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
    align-items: center;
  }
  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
  }
  .websiteBtn {
    gap: 0.45rem;
  }
  .wicon {
    width: 16px;
    height: 16px;
    border-radius: 6px;
    border: 1px solid var(--border);
    object-fit: cover;
  }
  .about {
    margin-top: 0.9rem;
    color: var(--muted);
    line-height: 1.55;
    max-width: 78ch;
  }
  .tabs {
    margin-top: 1rem;
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }
  .tab {
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text);
    border-radius: 999px;
    padding: 0.35rem 0.65rem;
    cursor: pointer;
    font-weight: 800;
  }
  .tab.active {
    border-color: rgba(139, 92, 246, 0.35);
    background: rgba(139, 92, 246, 0.16);
  }
  @media (max-width: 600px) {
    .banner {
      height: 120px;
    }
    .avatar {
      width: 74px;
      height: 74px;
      margin-top: -36px;
      border-radius: 22px;
    }
  }
</style>

