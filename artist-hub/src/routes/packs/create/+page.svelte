<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { nip19 } from 'nostr-tools';
  import { ensureNdk } from '$lib/stores/ndk';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import { parseFollowPackEvent, type FollowPack, type FollowPackEntry } from '$lib/nostr/follow-packs';
  import { isAuthed, pubkey as myPubkey } from '$lib/stores/auth';
  import { publishFollowPack } from '$lib/nostr/publish';

  function randomId(len = 12): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }

  function normAuthorParam(v: string | null): string | null {
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

  function parseEntryList(raw: string): FollowPackEntry[] {
    const items = (raw || '')
      .split(/[\n,]+/g)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6000);
    const out: FollowPackEntry[] = [];
    const seen = new Set<string>();
    for (const v of items) {
      const noPrefix = v.startsWith('nostr:') ? v.slice('nostr:'.length) : v;
      let pk = '';
      if (/^[0-9a-f]{64}$/i.test(noPrefix)) pk = noPrefix.toLowerCase();
      else {
        try {
          const decoded = nip19.decode(noPrefix);
          if (decoded.type === 'npub') pk = String(decoded.data).toLowerCase();
          if (decoded.type === 'nprofile') pk = String((decoded.data as any)?.pubkey || '').toLowerCase() || '';
        } catch {
          // ignore
        }
      }
      if (!pk || !/^[0-9a-f]{64}$/i.test(pk)) continue;
      if (seen.has(pk)) continue;
      seen.add(pk);
      out.push({ pubkey: pk });
    }
    return out.slice(0, 5000);
  }

  let mode: 'create' | 'edit' = 'create';
  let loading = false;
  let loadError: string | null = null;

  let d = randomId();
  let authorParam = '';

  let title = '';
  let description = '';
  let image = '';
  let entriesText = '';

  let saving = false;
  let saveError: string | null = null;
  let saveOk: string | null = null;

  async function loadExisting() {
    loadError = null;
    saveOk = null;
    saving = false;
    if (!d.trim()) {
      loadError = 'Missing pack id (d).';
      return;
    }
    loading = true;
    try {
      const ndk = await ensureNdk();
      const p = normAuthorParam(authorParam) || undefined;
      const filter: any = { kinds: [NOSTR_KINDS.follow_pack], '#d': [d.trim()], limit: 50 };
      if (p) filter.authors = [p];
      const events = await ndk.fetchEvents(filter as any);
      const arr = Array.from(events || []).sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0));
      const parsed = arr.map((e: any) => parseFollowPackEvent(e)).filter(Boolean) as FollowPack[];
      const chosen = parsed[0] || null;
      if (!chosen) throw new Error('Pack not found on your connected relays.');

      mode = 'edit';
      d = chosen.d;
      title = chosen.title;
      description = chosen.description || '';
      image = chosen.image || '';
      entriesText = chosen.entries.map((e) => e.pubkey).join('\n');
    } catch (e) {
      loadError = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  async function save() {
    saveError = null;
    saveOk = null;
    if (!$isAuthed || !$myPubkey) {
      saveError = 'Connect your signer to publish a pack.';
      return;
    }

    const packId = d.trim();
    const packTitle = title.trim();
    if (!packId) {
      saveError = 'Missing pack id (d).';
      return;
    }
    if (!packTitle) {
      saveError = 'Missing title.';
      return;
    }

    saving = true;
    try {
      const entries = parseEntryList(entriesText);
      const id = await publishFollowPack({
        d: packId,
        title: packTitle,
        description: description.trim() || undefined,
        image: image.trim() || undefined,
        entries,
      });
      saveOk = `Published follow pack event: ${id.slice(0, 12)}…`;
      mode = 'edit';
    } catch (e) {
      saveError = e instanceof Error ? e.message : String(e);
    } finally {
      saving = false;
    }
  }

  onMount(() => {
    const qd = ($page.url.searchParams.get('d') || '').trim();
    const qp = ($page.url.searchParams.get('p') || '').trim();
    if (qd) d = qd;
    if (qp) authorParam = qp;
    if (qd) void loadExisting();
  });
</script>

<div class="card" style="padding: 1rem;">
  <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
    <div>
      <div style="font-size: 1.25rem; font-weight: 900;">{mode === 'edit' ? 'Edit pack' : 'Create pack'}</div>
      <div class="muted" style="margin-top:0.35rem; line-height:1.5;">
        Following.space-compatible follow pack event (kind:39089). Publishing again with the same `d` updates the pack.
      </div>
    </div>
    <a class="btn" href={`${base}/packs`}>Back to packs</a>
  </div>
</div>

{#if !$isAuthed}
  <div class="card" style="margin-top: 1rem; padding: 1rem; border-color: rgba(246,196,83,0.35);">
    <div class="muted">Connect your signer to create or update follow packs.</div>
  </div>
{/if}

<div class="card" style="margin-top: 1rem; padding: 1rem;">
  <div style="font-weight: 900;">Load existing pack (optional)</div>
  <div class="muted" style="margin-top:0.35rem; line-height:1.5;">
    If the pack already exists on your relays, load it by `d` (and optionally the author’s npub).
  </div>
  <div style="margin-top:0.75rem; display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
    <input class="input" style="min-width: 220px;" bind:value={d} placeholder="d (pack id)" />
    <input class="input" style="min-width: 240px; flex:1;" bind:value={authorParam} placeholder="optional: author npub / hex pubkey" />
    <button class="btn" disabled={loading} on:click={loadExisting}>
      {loading ? 'Loading…' : 'Load'}
    </button>
  </div>
  {#if loadError}
    <div class="muted" style="margin-top:0.6rem; color: var(--danger);">{loadError}</div>
  {/if}
</div>

<div class="card" style="margin-top: 1rem; padding: 1rem;">
  <div class="muted" style="margin-bottom:0.35rem;">Title</div>
  <input class="input" bind:value={title} placeholder="e.g. Bitcoin for the Arts — Artists" />

  <div class="muted" style="margin-top:0.85rem; margin-bottom:0.35rem;">Description (optional)</div>
  <textarea class="textarea" bind:value={description} placeholder="What is this pack for?"></textarea>

  <div class="muted" style="margin-top:0.85rem; margin-bottom:0.35rem;">Image URL (optional)</div>
  <input class="input" bind:value={image} placeholder="https://…" />

  <div class="muted" style="margin-top:0.85rem; margin-bottom:0.35rem;">Entries (npub or hex pubkeys)</div>
  <textarea class="textarea" style="min-height: 220px;" bind:value={entriesText} placeholder="one per line"></textarea>

  <div style="margin-top: 0.85rem; display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
    <button class="btn primary" disabled={!$isAuthed || saving} on:click={save}>
      {saving ? 'Publishing…' : 'Publish pack'}
    </button>
    {#if saveOk}<span class="muted">{saveOk}</span>{/if}
  </div>
  {#if saveError}
    <div class="muted" style="margin-top:0.6rem; color: var(--danger);">{saveError}</div>
  {/if}
</div>

