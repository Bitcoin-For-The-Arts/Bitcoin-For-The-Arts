<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { base } from '$app/paths';
  import { env as publicEnv } from '$env/dynamic/public';
  import { nip19 } from 'nostr-tools';
  import { goto } from '$app/navigation';
  import { canSign, isAuthed, pubkey as myPubkey } from '$lib/stores/auth';
  import { notifications } from '$lib/stores/notifications';
  import { ensureNdk } from '$lib/stores/ndk';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import { parseFollowPackEvent, type FollowPack } from '$lib/nostr/follow-packs';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import { collectEventsWithDeadline } from '$lib/nostr/collect';
  import { refreshFollowing, followingSet, followingLoading } from '$lib/stores/follows';

  const rawPackD = ((publicEnv as any).PUBLIC_BFTA_FOLLOW_PACK_D as string | undefined) || '';
  const rawPackAuthor = ((publicEnv as any).PUBLIC_BFTA_FOLLOW_PACK_AUTHOR as string | undefined) || '';
  const LAST_PACK_KEY = 'bfta:last-pack-url';

  let lastPackUrl: string | null = null;
  if (browser) {
    try { lastPackUrl = sessionStorage.getItem(LAST_PACK_KEY) || null; } catch { /* ignore */ }
  }

  let myPacks: FollowPack[] = [];
  let myPacksLoading = false;
  let myPacksError: string | null = null;
  let myPacksLoaded = false;

  async function loadMyPacks() {
    const pk = $myPubkey;
    if (!pk) return;
    myPacksLoading = true;
    myPacksError = null;
    try {
      const ndk = await ensureNdk();
      const res = await collectEventsWithDeadline(
        ndk as any,
        { kinds: [NOSTR_KINDS.follow_pack], '#p': [pk], limit: 50 } as any,
        { timeoutMs: 8000, maxEvents: 50 },
      );
      const authored = await collectEventsWithDeadline(
        ndk as any,
        { kinds: [NOSTR_KINDS.follow_pack], authors: [pk], limit: 20 } as any,
        { timeoutMs: 6000, maxEvents: 20 },
      );
      const seen = new Set<string>();
      const all: FollowPack[] = [];
      for (const ev of [...Array.from(res.events || []), ...Array.from(authored.events || [])] as any[]) {
        const fp = parseFollowPackEvent(ev);
        if (!fp) continue;
        const key = `${fp.pubkey}:${fp.d}`;
        if (seen.has(key)) continue;
        seen.add(key);
        all.push(fp);
        void fetchProfileFor(fp.pubkey);
      }
      all.sort((a, b) => b.createdAt - a.createdAt);
      myPacks = all.slice(0, 30);
      myPacksLoaded = true;
    } catch (e) {
      myPacksError = e instanceof Error ? e.message : String(e);
    } finally {
      myPacksLoading = false;
    }
  }

  $: if ($isAuthed && $myPubkey && !myPacksLoaded && !myPacksLoading) {
    void loadMyPacks();
  }

  $: if ($isAuthed && $myPubkey && $followingSet.size === 0 && !$followingLoading) {
    void refreshFollowing();
  }

  function normalizeAuthorParam(v: string): string {
    const raw = (v || '').trim();
    if (!raw) return '';
    if (/^[0-9a-f]{64}$/i.test(raw)) return raw.toLowerCase();
    try {
      const decoded = nip19.decode(raw);
      if (decoded.type === 'npub') return String(decoded.data).toLowerCase();
      if (decoded.type === 'nprofile') return String((decoded.data as any)?.pubkey || '').toLowerCase() || '';
    } catch {
      // ignore
    }
    return raw;
  }

  function parsePackInput(raw: string): { d?: string; nevent?: string; p?: string } | null {
    const v = (raw || '').trim();
    if (!v) return null;

    try {
      const u = new URL(v);
      const d = u.searchParams.get('d') || u.searchParams.get('id') || '';
      const p = u.searchParams.get('p') || '';
      const nevent = u.searchParams.get('nevent') || u.searchParams.get('event') || '';
      if (d || nevent) return { d: d || undefined, nevent: nevent || undefined, p: p || undefined };
      const parts = u.pathname.split('/').filter(Boolean);
      const idx = parts.findIndex((x) => x === 'd');
      if (idx >= 0 && parts[idx + 1]) return { d: parts[idx + 1] };
    } catch {
      // not a URL
    }

    const noPrefix = v.startsWith('nostr:') ? v.slice('nostr:'.length) : v;
    if (noPrefix.startsWith('nevent') || noPrefix.startsWith('note')) return { nevent: noPrefix };
    return { d: noPrefix };
  }

  let input = '';
  let inputError: string | null = null;

  function openFromInput() {
    inputError = null;
    const parsed = parsePackInput(input);
    if (!parsed) {
      inputError = 'Paste a pack `d` id or a `nevent`.';
      return;
    }
    const params = new URLSearchParams();
    if (parsed.d) params.set('d', parsed.d);
    if (parsed.nevent) params.set('nevent', parsed.nevent);
    if (parsed.p) params.set('p', parsed.p);
    void goto(`${base}/d?${params.toString()}`);
  }

  $: inviteNotifs = $notifications.filter((n) => n.type === 'invite').slice(0, 25);
</script>

<div class="card" style="padding: 1rem;">
  <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
    <div>
      <div style="font-size: 1.25rem; font-weight: 900;">Follow Packs</div>
      <div class="muted" style="margin-top: 0.35rem; line-height: 1.5;">
        Following.space-compatible follow packs (kind:39089). Open a pack link, accept an invite, and follow everyone in the pack — all inside Artist Hub.
      </div>
    </div>
    {#if $canSign}
      <a class="btn primary" href={`${base}/packs/create`}>Create pack</a>
    {/if}
  </div>
</div>

{#if lastPackUrl}
  <div class="card" style="margin-top: 1rem; padding: 1rem; border-color: rgba(139,92,246,0.25);">
    <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
      <div>
        <div style="font-weight: 900;">Resume last pack</div>
        <div class="muted" style="margin-top:0.35rem;">Pick up where you left off.</div>
      </div>
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <a class="btn primary" href={`${base}/d${lastPackUrl}`}>Open pack</a>
        <button class="btn" on:click={() => { lastPackUrl = null; try { sessionStorage.removeItem(LAST_PACK_KEY); } catch {} }}>Dismiss</button>
      </div>
    </div>
  </div>
{/if}

{#if rawPackD.trim()}
  {@const d = rawPackD.trim()}
  {@const p = normalizeAuthorParam(rawPackAuthor)}
  <div class="card" style="margin-top: 1rem; padding: 1rem; border-color: rgba(246,196,83,0.35);">
    <div style="font-weight: 900;">Bitcoin for the Arts follow pack</div>
    <div class="muted" style="margin-top:0.35rem; line-height:1.5;">
      Quick access to the official BFTA pack.
    </div>
    <div style="margin-top:0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
      <a class="btn primary" href={`${base}/d?d=${encodeURIComponent(d)}${p ? `&p=${encodeURIComponent(p)}` : ''}`}>Open BFTA pack</a>
      <a class="btn" href={`${base}/d?d=${encodeURIComponent(d)}${p ? `&p=${encodeURIComponent(p)}` : ''}`}>Follow / Accept invite</a>
    </div>
    <div class="muted" style="margin-top:0.6rem; font-size:0.82rem;">
      Configure with `PUBLIC_BFTA_FOLLOW_PACK_D` (and optional `PUBLIC_BFTA_FOLLOW_PACK_AUTHOR`) at deploy time.
    </div>
  </div>
{/if}

<div class="card" style="margin-top: 1rem; padding: 1rem;">
  <div style="font-weight: 900;">Open a pack</div>
  <div class="muted" style="margin-top:0.35rem; line-height:1.5;">
    Paste a pack `d` id, a `nevent`, or a link (e.g. from following.space).
  </div>
  <div style="margin-top:0.75rem; display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
    <input class="input" style="min-width: 280px; flex: 1;" bind:value={input} placeholder="d=… or nevent1… or https://following.space/d/…" on:keydown={(e) => e.key === 'Enter' && openFromInput()} />
    <button class="btn primary" on:click={openFromInput}>Open</button>
  </div>
  {#if inputError}
    <div class="muted" style="margin-top:0.6rem; color: var(--danger);">{inputError}</div>
  {/if}
</div>

<div class="card" style="margin-top: 1rem; padding: 1rem;">
  <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
    <div>
      <div style="font-weight: 900;">Invites</div>
      <div class="muted" style="margin-top:0.35rem; line-height:1.5;">
        Follow-pack invites delivered over Nostr (look for 📩 in notifications).
      </div>
    </div>
    <a class="btn" href={`${base}/notifications`}>Open notifications</a>
  </div>

  {#if !$isAuthed}
    <div class="muted" style="margin-top:0.75rem;">Connect your signer to receive and accept invites.</div>
  {:else if inviteNotifs.length === 0}
    <div class="muted" style="margin-top:0.75rem;">No follow-pack invites yet.</div>
  {:else}
    <div class="grid" style="gap:0.6rem; margin-top: 0.85rem;">
      {#each inviteNotifs as n (n.id)}
        <a class="card row" href={`${base}${n.href}`} style="padding: 0.85rem 0.95rem;">
          <div style="display:flex; gap:0.5rem; align-items:baseline; flex-wrap:wrap;">
            <span class="muted" style="font-weight: 950;">📩</span>
            <span class="muted">{n.summary}</span>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

{#if $isAuthed}
  <div class="card" style="margin-top: 1rem; padding: 1rem;">
    <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
      <div>
        <div style="font-weight: 900;">My Packs</div>
        <div class="muted" style="margin-top:0.35rem; line-height:1.5;">
          Packs you created or are a member of.
        </div>
      </div>
      <button class="btn" disabled={myPacksLoading} on:click={loadMyPacks}>{myPacksLoading ? 'Loading…' : 'Refresh'}</button>
    </div>
    {#if myPacksError}
      <div class="muted" style="margin-top:0.75rem; color: var(--danger);">{myPacksError}</div>
    {:else if myPacksLoading && myPacks.length === 0}
      <div class="muted" style="margin-top:0.75rem;">Loading your packs…</div>
    {:else if myPacks.length === 0 && myPacksLoaded}
      <div class="muted" style="margin-top:0.75rem;">No packs found (depends on relays).</div>
    {:else}
      <div class="grid" style="gap:0.6rem; margin-top: 0.85rem;">
        {#each myPacks as fp (`${fp.pubkey}:${fp.d}`)}
          {@const author = $profileByPubkey[fp.pubkey]}
          {@const authorName = (author?.display_name || author?.name || fp.pubkey.slice(0, 12) + '…').trim()}
          <a class="card row" href={`${base}/d?d=${encodeURIComponent(fp.d)}&p=${encodeURIComponent(fp.pubkey)}`} style="padding: 0.85rem 0.95rem;">
            <div style="display:flex; gap:0.65rem; align-items:center; justify-content:space-between; flex-wrap:wrap;">
              <div style="min-width:0;">
                <div style="font-weight: 900;">{fp.title || 'Untitled pack'}</div>
                <div class="muted" style="margin-top:0.25rem;">
                  {fp.entries.length} members • by {authorName}
                </div>
              </div>
              {#if fp.pubkey === $myPubkey}
                <span class="pill" style="font-size:0.8rem;">Your pack</span>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>
{/if}

{#if $isAuthed && $followingSet.size > 0}
  <div class="card" style="margin-top: 1rem; padding: 1rem;">
    <div class="muted" style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
      <span>Following: <strong>{$followingSet.size.toLocaleString()}</strong> accounts</span>
      {#if $followingLoading}
        <span class="pill muted" style="font-size:0.8rem;">Syncing…</span>
      {/if}
    </div>
  </div>
{/if}

<style>
  .row:hover {
    text-decoration: none;
    border-color: rgba(139, 92, 246, 0.22);
    background: rgba(255, 255, 255, 0.02);
  }
</style>

