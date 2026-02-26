<script lang="ts">
  import { browser } from '$app/environment';
  import { profile as profileStore, publishProfile, pubkey, type ArtistProfile } from '$lib/stores/auth';

  let draft: ArtistProfile = {};
  let saving = false;
  let error: string | null = null;
  let ok: string | null = null;

  let initialized = false;
  let localSavedAt: number | null = null;

  function keyFor(pk: string) {
    return `bfta:artist-hub:profile-draft:${pk}`;
  }

  function csvToList(v: string): string[] {
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 24);
  }

  function listToCsv(v?: string[]): string {
    return (v ?? []).join(', ');
  }

  let skillsCsv = '';
  let hashtagsCsv = '';
  let portfolioCsv = '';

  function faviconForSite(site: string): string {
    const raw = (site || '').trim();
    if (!raw) return '';
    try {
      const u = raw.startsWith('http://') || raw.startsWith('https://') ? new URL(raw) : new URL(`https://${raw}`);
      const domain = u.hostname;
      if (!domain) return '';
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
    } catch {
      return '';
    }
  }

  function useWebsiteFavicon() {
    const icon = faviconForSite(draft.website || '');
    if (icon) draft = { ...draft, website_icon: icon };
  }

  function hydrateFromProfile(p: ArtistProfile) {
    draft = { ...p };
    skillsCsv = listToCsv(p.skills);
    hashtagsCsv = listToCsv(p.hashtags);
    portfolioCsv = listToCsv(p.portfolio);
  }

  function loadLocal(pk: string): boolean {
    if (!browser) return false;
    try {
      const raw = localStorage.getItem(keyFor(pk));
      if (!raw) return false;
      const parsed = JSON.parse(raw) as any;
      if (!parsed?.draft || typeof parsed.draft !== 'object') return false;
      draft = parsed.draft as ArtistProfile;
      skillsCsv = typeof parsed.skillsCsv === 'string' ? parsed.skillsCsv : listToCsv(draft.skills);
      hashtagsCsv = typeof parsed.hashtagsCsv === 'string' ? parsed.hashtagsCsv : listToCsv(draft.hashtags);
      portfolioCsv = typeof parsed.portfolioCsv === 'string' ? parsed.portfolioCsv : listToCsv(draft.portfolio);
      localSavedAt = typeof parsed.savedAt === 'number' ? parsed.savedAt : null;
      return true;
    } catch {
      return false;
    }
  }

  function persistLocal(pk: string) {
    if (!browser) return;
    const payload = {
      draft,
      skillsCsv,
      hashtagsCsv,
      portfolioCsv,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(keyFor(pk), JSON.stringify(payload));
      localSavedAt = payload.savedAt;
    } catch {
      // ignore
    }
  }

  function clearLocal(pk: string) {
    if (!browser) return;
    try {
      localStorage.removeItem(keyFor(pk));
      localSavedAt = null;
    } catch {
      // ignore
    }
  }

  // Initialize editor state: prefer local draft; fallback to published kind:0 profile.
  $: if (!initialized && $pubkey) {
    const hadLocal = loadLocal($pubkey);
    if (!hadLocal && $profileStore) hydrateFromProfile($profileStore);
    initialized = true;
  }

  // If published profile arrives later and there is no local draft, hydrate once.
  $: if (initialized && $pubkey && !localSavedAt && $profileStore && !draft?.name && !draft?.about) {
    hydrateFromProfile($profileStore);
  }

  // Auto-save local draft while typing (client-side only).
  let lastPersistKey = '';
  let persistTimer: ReturnType<typeof setTimeout> | null = null;
  $: if (browser && $pubkey && initialized) {
    const key = JSON.stringify({ draft, skillsCsv, hashtagsCsv, portfolioCsv });
    if (key !== lastPersistKey) {
      lastPersistKey = key;
      if (persistTimer) clearTimeout(persistTimer);
      persistTimer = setTimeout(() => persistLocal($pubkey!), 450);
    }
  }

  async function save() {
    error = null;
    ok = null;
    saving = true;
    try {
      const next: ArtistProfile = {
        ...draft,
        skills: csvToList(skillsCsv),
        hashtags: csvToList(hashtagsCsv).map((t) => t.replace(/^#/, '')),
        portfolio: csvToList(portfolioCsv),
      };
      const id = await publishProfile(next);
      ok = id ? 'Profile published to Nostr (kind:0).' : 'Profile publish attempted.';
      if ($pubkey) clearLocal($pubkey);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      saving = false;
    }
  }
</script>

<div class="card" style="padding: 1rem;">
  <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom: 0.75rem;">
    <div class="muted">
      {#if localSavedAt}
        Draft saved locally: {new Date(localSavedAt).toLocaleString()}
      {:else}
        No local draft saved.
      {/if}
    </div>
    <div style="display:flex; gap:0.5rem; align-items:center;">
      <button class="btn" disabled={!$pubkey} on:click={() => $pubkey && $profileStore && hydrateFromProfile($profileStore)}>
        Reset to published
      </button>
      <button class="btn danger" disabled={!$pubkey} on:click={() => $pubkey && clearLocal($pubkey)}>
        Clear local draft
      </button>
    </div>
  </div>

  <div class="grid cols-2">
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Name</div>
      <input class="input" bind:value={draft.name} placeholder="Artist name" />
    </div>
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Display name</div>
      <input class="input" bind:value={draft.display_name} placeholder="Optional" />
    </div>
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Bio</div>
    <textarea class="textarea" bind:value={draft.about} placeholder="What do you make? What do you offer?"></textarea>
  </div>

  <div class="grid cols-2" style="margin-top: 0.9rem;">
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Avatar image URL</div>
      <input class="input" bind:value={draft.picture} placeholder="https://…" />
    </div>
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Banner image URL</div>
      <input class="input" bind:value={draft.banner} placeholder="https://…" />
    </div>
  </div>

  <div class="grid cols-2" style="margin-top: 0.9rem;">
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Website / portfolio</div>
      <input class="input" bind:value={draft.website} placeholder="https://…" />
    </div>
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Website logo URL (optional)</div>
      <input class="input" bind:value={draft.website_icon} placeholder="https://… (favicon/logo)" />
      <div class="muted" style="margin-top:0.35rem; display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
        <button class="pill muted" type="button" on:click={useWebsiteFavicon}>Use site favicon</button>
        {#if draft.website_icon}
          <span class="pill muted" style="display:inline-flex; gap:0.35rem; align-items:center;">
            <img src={draft.website_icon} alt="" style="width:16px; height:16px; border-radius:6px; border:1px solid var(--border); object-fit:cover;" />
            Preview
          </span>
        {/if}
      </div>
    </div>
  </div>

  <div class="grid cols-2" style="margin-top: 0.9rem;">
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Lightning address (lud16)</div>
      <input class="input" bind:value={draft.lud16} placeholder="name@domain.com" />
    </div>
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">LNURL (lud06)</div>
      <input class="input" bind:value={draft.lud06} placeholder="lnurl1…" />
    </div>
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Skills (comma-separated)</div>
    <input class="input" bind:value={skillsCsv} placeholder="Illustration, Animation, Music production…" />
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Hashtags (comma-separated)</div>
    <input class="input" bind:value={hashtagsCsv} placeholder="#BitcoinArt, #NostrArt, #Film…" />
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Portfolio links (comma-separated)</div>
    <input class="input" bind:value={portfolioCsv} placeholder="https://…, https://…" />
  </div>

  <div style="margin-top: 1rem; display:flex; gap:0.5rem; align-items:center;">
    <button class="btn primary" disabled={saving} on:click={save}>
      {saving ? 'Publishing…' : 'Publish profile'}
    </button>
    {#if ok}<span class="muted">{ok}</span>{/if}
  </div>

  {#if error}
    <div class="card" style="margin-top: 0.85rem; padding: 0.8rem; border-color: rgba(251,113,133,0.35);">
      <div class="muted">{error}</div>
    </div>
  {/if}
</div>

