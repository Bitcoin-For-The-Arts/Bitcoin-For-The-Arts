<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { nip19 } from 'nostr-tools';
  import { ensureNdk } from '$lib/stores/ndk';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import { parseFollowPackEvent, type FollowPack } from '$lib/nostr/follow-packs';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import { canSign, isAuthed, pubkey as myPubkey } from '$lib/stores/auth';
  import { followMany, followingError, followingLoading, followingSet } from '$lib/stores/follows';
  import ProfileCard from '$lib/components/ProfileCard.svelte';
  import { publishFollowPack, publishFollowPackAccept, publishFollowPackInvite } from '$lib/nostr/publish';

  let pack: FollowPack | null = null;
  let loading = true;
  let error: string | null = null;
  let success: string | null = null;
  let followingAll = false;
  let showN = 80;

  // Invite / accept flow (membership in the pack, not required to follow)
  let inviteNpub = '';
  let inviteBusy = false;
  let inviteError: string | null = null;
  let acceptBusy = false;
  let acceptError: string | null = null;
  let invited = false;
  let accepted = false;

  // Pack author tools
  let pendingAccepts: string[] = [];
  let pendingLoading = false;
  let pendingError: string | null = null;
  let addBusy = false;
  let addError: string | null = null;

  function stripNostrPrefix(x: string): string {
    const v = (x || '').trim();
    if (!v) return '';
    return v.startsWith('nostr:') ? v.slice('nostr:'.length) : v;
  }

  function parseAuthorParam(v: string | null): string | null {
    const raw = (v || '').trim();
    if (!raw) return null;
    if (/^[0-9a-f]{64}$/i.test(raw)) return raw.toLowerCase();
    try {
      const decoded = nip19.decode(raw);
      if (decoded.type === 'npub') return String(decoded.data).toLowerCase();
      if (decoded.type === 'nprofile') return String((decoded.data as any)?.pubkey || '').toLowerCase() || null;
    } catch {
      // ignore
    }
    return null;
  }

  function hasTag(ev: any, name: string, value?: string): boolean {
    const tags = (ev?.tags as string[][]) || [];
    return tags.some((t) => t[0] === name && (value ? t[1] === value : true));
  }

  function addr(): string {
    if (!pack) return '';
    return `${NOSTR_KINDS.follow_pack}:${pack.pubkey}:${pack.d}`;
  }

  async function loadPendingAccepts() {
    pendingAccepts = [];
    pendingError = null;
    if (!$canSign || !$myPubkey || !pack) return;
    if ($myPubkey !== pack.pubkey) return;
    pendingLoading = true;
    try {
      const ndk = await ensureNdk();
      const address = addr();
      const accEvents = await ndk.fetchEvents(
        { kinds: [NOSTR_KINDS.note], '#p': [pack.pubkey], '#t': ['follow-pack-accept'], limit: 250 } as any,
      );
      const out = new Set<string>();
      for (const ev of Array.from(accEvents || []) as any[]) {
        const pk = typeof ev?.pubkey === 'string' ? ev.pubkey.trim().toLowerCase() : '';
        if (!pk || pk === pack.pubkey) continue;
        if (hasTag(ev, 'a', address) || hasTag(ev, 'd', pack.d)) out.add(pk);
      }
      pendingAccepts = Array.from(out).slice(0, 250);
      for (const pk of pendingAccepts.slice(0, 60)) void fetchProfileFor(pk);
    } catch (e) {
      pendingError = e instanceof Error ? e.message : String(e);
    } finally {
      pendingLoading = false;
    }
  }

  async function addAcceptedToPack() {
    addError = null;
    success = null;
    if (!$canSign || !$myPubkey) {
      addError = 'Connect your signer to update the pack.';
      return;
    }
    if (!pack) return;
    if ($myPubkey !== pack.pubkey) {
      addError = 'Only the pack author can update the pack.';
      return;
    }
    const existing = new Set(pack.entries.map((e) => (e.pubkey || '').trim().toLowerCase()).filter(Boolean));
    const toAdd = (pendingAccepts || []).map((x) => (x || '').trim().toLowerCase()).filter(Boolean).filter((pk) => !existing.has(pk));
    if (!toAdd.length) {
      success = 'No new accepted members to add.';
      return;
    }
    addBusy = true;
    try {
      await publishFollowPack({
        d: pack.d,
        title: pack.title,
        description: pack.description,
        image: pack.image,
        entries: [...pack.entries, ...toAdd.map((pk) => ({ pubkey: pk }))],
      });
      success = `Updated pack: added ${toAdd.length.toLocaleString()} member${toAdd.length === 1 ? '' : 's'}.`;
      await load();
      void loadPendingAccepts();
    } catch (e) {
      addError = e instanceof Error ? e.message : String(e);
    } finally {
      addBusy = false;
    }
  }

  async function loadInviteState() {
    if (!$canSign || !$myPubkey || !pack) return;
    invited = false;
    accepted = false;
    try {
      const ndk = await ensureNdk();
      const me = $myPubkey;
      const address = addr();

      const invEvents = await ndk.fetchEvents({ kinds: [NOSTR_KINDS.note], '#p': [me], '#t': ['follow-pack-invite'], limit: 50 } as any);
      for (const ev of Array.from(invEvents || [])) {
        if (hasTag(ev, 'a', address) || hasTag(ev, 'd', pack.d)) {
          invited = true;
          break;
        }
      }

      const accEvents = await ndk.fetchEvents(
        { kinds: [NOSTR_KINDS.note], authors: [me], '#p': [pack.pubkey], '#t': ['follow-pack-accept'], limit: 50 } as any,
      );
      for (const ev of Array.from(accEvents || [])) {
        if (hasTag(ev, 'a', address) || hasTag(ev, 'd', pack.d)) {
          accepted = true;
          break;
        }
      }
    } catch {
      // ignore
    }
  }

  async function load() {
    loading = true;
    error = null;
    success = null;
    pack = null;
    invited = false;
    accepted = false;
    inviteError = null;
    acceptError = null;
    showN = 80;

    try {
      const dParam = stripNostrPrefix($page.url.searchParams.get('d') || $page.url.searchParams.get('id') || '');
      const neventParam = stripNostrPrefix($page.url.searchParams.get('nevent') || $page.url.searchParams.get('event') || '');
      const p = parseAuthorParam($page.url.searchParams.get('p'));

      const ndk = await ensureNdk();

      let chosen: FollowPack | null = null;

      if (neventParam) {
        try {
          const decoded = nip19.decode(neventParam);
          if (decoded.type === 'nevent' || decoded.type === 'note') {
            const eventId = decoded.type === 'note' ? (decoded.data as string) : String((decoded.data as any)?.id || '');
            if (eventId) {
              const ev = await ndk.fetchEvent(eventId as any);
              const fp = ev ? parseFollowPackEvent(ev as any) : null;
              if (fp) chosen = fp;
            }
          }
        } catch {
          // ignore
        }
      }

      if (!chosen) {
        if (!dParam) throw new Error('Missing `d` (pack id) or `nevent`.');
        const filter: any = { kinds: [NOSTR_KINDS.follow_pack], '#d': [dParam], limit: 50 };
        if (p) filter.authors = [p];
        const events = await ndk.fetchEvents(filter as any);
        const arr = Array.from(events || []).sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0));
        const parsed = arr.map((e: any) => parseFollowPackEvent(e)).filter(Boolean) as FollowPack[];
        chosen = parsed[0] || null;
      }

      if (!chosen) throw new Error('Follow pack not found on your connected relays.');
      pack = chosen;
      void fetchProfileFor(pack.pubkey);
      for (const e of pack.entries.slice(0, 60)) void fetchProfileFor(e.pubkey);
      if ($canSign && $myPubkey) void loadInviteState();
      if ($canSign && $myPubkey && $myPubkey === pack.pubkey) void loadPendingAccepts();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  async function followAll() {
    if (!$canSign) {
      success = null;
      error = 'Connect your signer to follow this pack.';
      return;
    }
    if (!pack || followingAll) return;
    followingAll = true;
    error = null;
    success = null;
    try {
      const pubkeys = pack.entries.map((x) => x.pubkey).filter(Boolean);
      const already = $followingSet;
      const toAdd = pubkeys.filter((pk) => !already.has(pk));
      if (!toAdd.length) {
        success = 'You were already following everyone in this pack.';
        return;
      }
      const res = await followMany(toAdd);
      if (!res) throw new Error($followingError || 'Failed to follow pack.');
      success = `Followed ${res.added.toLocaleString()} new account${res.added === 1 ? '' : 's'} from this pack.`;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      followingAll = false;
    }
  }

  function parseInvitee(n: string): string | null {
    const raw = (n || '').trim();
    if (!raw) return null;
    try {
      const decoded = nip19.decode(raw);
      if (decoded.type === 'npub') return String(decoded.data).toLowerCase();
      if (decoded.type === 'nprofile') return String((decoded.data as any)?.pubkey || '').toLowerCase() || null;
    } catch {
      // ignore
    }
    if (/^[0-9a-f]{64}$/i.test(raw)) return raw.toLowerCase();
    return null;
  }

  async function sendInvite() {
    if (!pack) return;
    inviteError = null;
    acceptError = null;
    if (!$canSign || !$myPubkey) {
      inviteError = 'Connect your signer to invite.';
      return;
    }
    if ($myPubkey !== pack.pubkey) {
      inviteError = 'Only the pack author can invite.';
      return;
    }
    const pk = parseInvitee(inviteNpub);
    if (!pk) {
      inviteError = 'Paste a valid npub.';
      return;
    }
    inviteBusy = true;
    try {
      await publishFollowPackInvite({ packAuthorPubkey: pack.pubkey, packD: pack.d, inviteePubkey: pk });
      inviteNpub = '';
      success = 'Invite sent.';
    } catch (e) {
      inviteError = e instanceof Error ? e.message : String(e);
    } finally {
      inviteBusy = false;
    }
  }

  async function acceptInvite() {
    if (!pack) return;
    acceptError = null;
    inviteError = null;
    if (!$canSign || !$myPubkey) {
      acceptError = 'Connect your signer to accept.';
      return;
    }
    acceptBusy = true;
    try {
      await publishFollowPackAccept({ packAuthorPubkey: pack.pubkey, packD: pack.d });
      accepted = true;
      success = 'Accepted. The pack owner can now add you to the pack.';
    } catch (e) {
      acceptError = e instanceof Error ? e.message : String(e);
    } finally {
      acceptBusy = false;
    }
  }

  $: authorProfile = pack ? $profileByPubkey[pack.pubkey] : null;
  $: authorName = (authorProfile?.display_name || authorProfile?.name || '').trim();
  $: followedInPack = pack?.entries?.reduce((n, e) => (e?.pubkey && $followingSet.has(e.pubkey) ? n + 1 : n), 0) ?? 0;
  $: visiblePubkeys = pack ? pack.entries.map((e) => e.pubkey).filter(Boolean).slice(0, Math.max(20, showN)) : [];

  onMount(() => void load());
</script>

{#if loading}
  <div class="card" style="padding: 1rem;">
    <div class="muted">Loading follow pack…</div>
  </div>
{:else if error}
  <div class="card" style="padding: 1rem; border-color: rgba(251,113,133,0.35);">
    <div class="muted">{error}</div>
  </div>
{:else if pack}
  <div class="card" style="padding: 1rem;">
    <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
      <div>
        <div style="font-size: 1.35rem; font-weight: 950;">{pack.title}</div>
        <div class="muted" style="margin-top:0.35rem;">
          {pack.entries.length.toLocaleString()} accounts • {followedInPack.toLocaleString()} already followed
        </div>
        {#if authorName || pack.pubkey}
          <div class="muted" style="margin-top:0.35rem;">
            Created by {authorName || pack.pubkey.slice(0, 12) + '…'}
          </div>
        {/if}
      </div>
      <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
        <a class="btn" href={`${base}/packs`}>Exit pack</a>
        <a class="btn" href={`${base}/packs`}>Open different pack</a>
        <a class="btn" href={`${base}/packs/create`}>Create pack</a>
        <button class="btn primary" disabled={!$canSign || $followingLoading || followingAll} on:click={followAll}>
          {followingAll ? 'Following…' : 'Follow all'}
        </button>
        <button class="btn" on:click={load}>Reload</button>
      </div>
    </div>

    {#if pack.image}
      <div style="margin-top:0.85rem;">
        <img src={pack.image} alt="" style="width:100%; max-height: 220px; object-fit: cover; border-radius: 14px; border: 1px solid var(--border);" />
      </div>
    {/if}

    {#if pack.description}
      <div class="muted" style="margin-top:0.85rem; line-height:1.55;">{pack.description}</div>
    {/if}

    <div class="card" style="margin-top: 0.9rem; padding: 0.9rem; background: rgba(0,0,0,0.18);">
      <div style="font-weight: 950;">Invite-only membership (optional)</div>
      <div class="muted" style="margin-top:0.35rem; line-height:1.5;">
        Following this pack is public. Being included in the pack is invite-based: the pack owner invites you, you accept, then the owner updates the pack.
      </div>
      {#if $canSign && $myPubkey === pack.pubkey}
        <div class="muted" style="margin-top:0.65rem;">Invite someone (paste their npub)</div>
        <div style="margin-top:0.35rem; display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
          <input class="input" style="min-width: 260px;" bind:value={inviteNpub} placeholder="npub…" />
          <button class="btn primary" disabled={inviteBusy || !inviteNpub.trim()} on:click={sendInvite}>
            {inviteBusy ? 'Inviting…' : 'Send invite'}
          </button>
        </div>
        {#if inviteError}<div class="muted" style="margin-top:0.5rem; color: var(--danger);">{inviteError}</div>{/if}
      {:else if $isAuthed}
        {#if invited}
          <div class="muted" style="margin-top:0.65rem;">You have an invite for this pack.</div>
          {#if accepted}
            <div class="muted" style="margin-top:0.35rem; color: rgba(74,222,128,0.95);">Accepted.</div>
          {:else}
            <button class="btn primary" style="margin-top:0.5rem;" disabled={!$canSign || acceptBusy} on:click={acceptInvite}>
              {acceptBusy ? 'Accepting…' : 'Accept invite'}
            </button>
            {#if acceptError}<div class="muted" style="margin-top:0.5rem; color: var(--danger);">{acceptError}</div>{/if}
          {/if}
        {:else}
          <div class="muted" style="margin-top:0.65rem;">
            No invite found for your pubkey on your connected relays.
          </div>
        {/if}
      {:else}
        <div class="muted" style="margin-top:0.65rem;">Connect your signer to check invites / accept.</div>
      {/if}
    </div>

    {#if $canSign && $myPubkey === pack.pubkey}
      <div class="card" style="margin-top: 0.9rem; padding: 0.9rem; background: rgba(0,0,0,0.18);">
        <div style="font-weight: 950;">Pack owner tools</div>
        <div class="muted" style="margin-top:0.35rem; line-height:1.5;">
          Add accepted invitees to the pack (updates the kind:39089 event with the same `d` tag).
        </div>
        <div style="margin-top:0.65rem; display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
          <button class="btn primary" disabled={pendingLoading || addBusy} on:click={addAcceptedToPack}>
            {addBusy ? 'Updating…' : `Add accepted (${pendingAccepts.length})`}
          </button>
          <button class="btn" disabled={pendingLoading} on:click={loadPendingAccepts}>
            {pendingLoading ? 'Loading…' : 'Refresh accepted'}
          </button>
        </div>
        {#if pendingError}
          <div class="muted" style="margin-top:0.5rem; color: var(--danger);">{pendingError}</div>
        {/if}
        {#if addError}
          <div class="muted" style="margin-top:0.5rem; color: var(--danger);">{addError}</div>
        {/if}
      </div>
    {/if}

    {#if success}
      <div class="muted" style="margin-top:0.85rem; color: rgba(74,222,128,0.95);">{success}</div>
    {/if}
    {#if $followingError}
      <div class="muted" style="margin-top:0.85rem; color: var(--danger);">{$followingError}</div>
    {/if}
  </div>

  <div class="grid cols-2" style="margin-top: 1rem;">
    {#each visiblePubkeys as pk (pk)}
      <ProfileCard pubkey={pk} />
    {/each}
    {#if pack.entries.length > visiblePubkeys.length}
      <div class="card" style="padding: 1rem; grid-column: 1 / -1;">
        <div class="muted">
          Showing {visiblePubkeys.length.toLocaleString()} of {pack.entries.length.toLocaleString()}.
        </div>
        <button class="btn" style="margin-top:0.6rem;" on:click={() => (showN = Math.min(pack.entries.length, showN + 120))}>
          Load more
        </button>
      </div>
    {/if}
  </div>
{/if}

