<script lang="ts">
  import { nanoid } from 'nanoid';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { canSign } from '$lib/stores/auth';
  import { publishStudio, type StudioContent, type StudioItem } from '$lib/nostr/studios';

  let name = '';
  let about = '';
  let picture = '';
  let tagsCsv = 'BitcoinArt, NostrArt';
  let itemsCsv = '';
  let channelId = '';
  let streamUrl = '';

  let busy = false;
  let error: string | null = null;

  function csv(v: string): string[] {
    return v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30);
  }

  function parseItems(v: string): StudioItem[] {
    const lines = v
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30);
    const items: StudioItem[] = [];
    for (const line of lines) {
      const [urlRaw, titleRaw] = line.split('|').map((s) => s.trim());
      const url = urlRaw || '';
      const title = titleRaw || undefined;
      if (!url) continue;
      const lower = url.toLowerCase();
      if (lower.match(/\.(png|jpg|jpeg|gif|webp)(\?|#|$)/)) items.push({ type: 'image', url, title });
      else if (lower.match(/\.(mp4|webm|mov)(\?|#|$)/)) items.push({ type: 'video', url, title });
      else items.push({ type: 'link', url, title });
    }
    return items;
  }

  async function publish() {
    error = null;
    if (!$canSign) {
      error = 'Connect your signer to publish a studio.';
      return;
    }
    busy = true;
    try {
      const content: StudioContent = {
        id: `studio-${nanoid(10)}`,
        name: name.trim(),
        about: about.trim() || undefined,
        picture: picture.trim() || undefined,
        tags: csv(tagsCsv).map((t) => t.replace(/^#/, '')),
        items: parseItems(itemsCsv),
        channelId: channelId.trim() || undefined,
        streamUrl: streamUrl.trim() || undefined,
      };
      const id = await publishStudio(content);
      // Studio is addressable; we navigate by naddr using best-effort client-side encoding in list.
      await goto(`${base}/studios`);
      return id;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }
</script>

<div class="card" style="padding: 1rem;">
  <div style="font-weight: 950; font-size: 1.1rem;">Create a Virtual Studio</div>
  <div class="muted" style="margin-top:0.35rem; line-height:1.55;">
    Studios are published as parameterized replaceable Nostr events (`kind:30050` + `d` tag). They’re a persistent,
    linkable “room” where people can explore your work and leave notes/zaps.
  </div>

  <div class="grid cols-2" style="margin-top: 0.9rem;">
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Studio name</div>
      <input class="input" bind:value={name} placeholder="Sovereign Studio / Workshop Room…" />
    </div>
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Cover image URL (optional)</div>
      <input class="input" bind:value={picture} placeholder="https://…" />
    </div>
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">About</div>
    <textarea class="textarea" bind:value={about} placeholder="What’s inside this studio? What’s the vibe?"></textarea>
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Tags (comma-separated)</div>
    <input class="input" bind:value={tagsCsv} placeholder="BitcoinArt, NostrArt, Film, Dance…" />
  </div>

  <div style="margin-top: 0.9rem;">
    <div class="muted" style="margin-bottom:0.35rem;">Studio items (one per line)</div>
    <textarea
      class="textarea"
      bind:value={itemsCsv}
      placeholder="https://example.com/artwork.png | Title (optional)\nhttps://example.com/demo.mp4 | Process video\nhttps://your-site.com | Portfolio link"
    ></textarea>
    <div class="muted" style="margin-top:0.35rem; line-height:1.4;">
      Tip: add image/video URLs hosted anywhere (Nostr relays store references, not files).
    </div>
  </div>

  <div class="grid cols-2" style="margin-top: 0.9rem;">
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Live chat channel id (optional)</div>
      <input class="input" bind:value={channelId} placeholder="kind:40 event id (NIP-28)" />
    </div>
    <div>
      <div class="muted" style="margin-bottom:0.35rem;">Stream URL (optional)</div>
      <input class="input" bind:value={streamUrl} placeholder="YouTube/Vimeo/Audio stream URL…" />
    </div>
  </div>

  <div style="margin-top: 1rem; display:flex; gap:0.5rem; align-items:center;">
    <button class="btn primary" disabled={busy} on:click={publish}>{busy ? 'Publishing…' : 'Publish studio'}</button>
    <a class="btn" href={`${base}/studios`}>Back</a>
  </div>

  {#if error}
    <div class="card" style="margin-top: 0.85rem; padding: 0.8rem; border-color: rgba(251,113,133,0.35);">
      <div class="muted">{error}</div>
    </div>
  {/if}
</div>

