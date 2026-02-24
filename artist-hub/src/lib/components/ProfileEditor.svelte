<script lang="ts">
  import { profile as profileStore, publishProfile, type ArtistProfile } from '$lib/stores/auth';

  let draft: ArtistProfile = {};
  let saving = false;
  let error: string | null = null;
  let ok: string | null = null;

  $: if ($profileStore) draft = { ...$profileStore };

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

  $: skillsCsv = listToCsv(draft.skills);
  $: hashtagsCsv = listToCsv(draft.hashtags);
  $: portfolioCsv = listToCsv(draft.portfolio);

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
      await publishProfile(next);
      ok = 'Profile published to Nostr (kind:0).';
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      saving = false;
    }
  }
</script>

<div class="card" style="padding: 1rem;">
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
      <div class="muted" style="margin-bottom:0.35rem;">Website / portfolio</div>
      <input class="input" bind:value={draft.website} placeholder="https://…" />
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

