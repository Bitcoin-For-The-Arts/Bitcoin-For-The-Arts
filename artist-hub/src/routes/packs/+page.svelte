<script lang="ts">
  import { base } from '$app/paths';
  import { env as publicEnv } from '$env/dynamic/public';
  import { nip19 } from 'nostr-tools';
  import { goto } from '$app/navigation';
  import { isAuthed } from '$lib/stores/auth';
  import { notifications } from '$lib/stores/notifications';

  const rawPackD = ((publicEnv as any).PUBLIC_BFTA_FOLLOW_PACK_D as string | undefined) || '';
  const rawPackAuthor = ((publicEnv as any).PUBLIC_BFTA_FOLLOW_PACK_AUTHOR as string | undefined) || '';

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

    // Support full URLs (following.space, njump, etc)
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
  <div style="font-size: 1.25rem; font-weight: 900;">Follow Packs</div>
  <div class="muted" style="margin-top: 0.35rem; line-height: 1.5;">
    Following.space-compatible follow packs (kind:39089). Open a pack link, accept an invite, and follow everyone in the pack — all inside Artist Hub.
  </div>
</div>

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

<style>
  .row:hover {
    text-decoration: none;
    border-color: rgba(139, 92, 246, 0.22);
    background: rgba(255, 255, 255, 0.02);
  }
</style>

