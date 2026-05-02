<script lang="ts">
  import { normalizeUrl } from '$lib/ui/media';

  export let text = '';
  export let linksAs: 'a' | 'span' = 'a'; // Use 'span' inside <button>/<a> containers.

  type Tok =
    | { kind: 'text'; text: string }
    | { kind: 'url'; url: string; text: string }
    | { kind: 'tag'; tag: string; text: string };

  function parse(input: string): Tok[] {
    const s = input || '';
    if (!s) return [{ kind: 'text', text: '' }];

    // URLs + hashtags (keep whitespace/newlines as-is by slicing original string).
    const re = /https?:\/\/[^\s<>"']+|#[A-Za-z0-9_]{1,50}/g;
    const out: Tok[] = [];
    let last = 0;
    let m: RegExpExecArray | null = null;

    while ((m = re.exec(s))) {
      const start = m.index;
      const raw = m[0] || '';
      if (start > last) out.push({ kind: 'text', text: s.slice(last, start) });

      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        const cleaned = normalizeUrl(raw);
        if (cleaned) out.push({ kind: 'url', url: cleaned, text: cleaned });
        const trailing = raw.slice(cleaned.length);
        if (trailing) out.push({ kind: 'text', text: trailing });
      } else if (raw.startsWith('#')) {
        out.push({ kind: 'tag', tag: raw.slice(1), text: raw });
      } else {
        out.push({ kind: 'text', text: raw });
      }

      last = start + raw.length;
    }

    if (last < s.length) out.push({ kind: 'text', text: s.slice(last) });
    return out.length ? out : [{ kind: 'text', text: s }];
  }

  $: tokens = parse(text);

  function openUrl(url: string) {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      // ignore
    }
  }

  function onKeyOpen(e: KeyboardEvent, url: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      openUrl(url);
    }
  }
</script>

<span class="rt">
  {#each tokens as t, i (i)}
    {#if t.kind === 'text'}
      {t.text}
    {:else if t.kind === 'tag'}
      <span class="rtTag" title="Hashtag">{t.text}</span>
    {:else}
      {#if linksAs === 'a'}
        <a class="rtLink" href={t.url} target="_blank" rel="noreferrer noopener">{t.text}</a>
      {:else}
        <span
          class="rtLink"
          role="link"
          tabindex="0"
          on:click|stopPropagation|preventDefault={() => openUrl(t.url)}
          on:keydown={(e) => onKeyOpen(e, t.url)}
          >{t.text}</span
        >
      {/if}
    {/if}
  {/each}
</span>

<style>
  .rt {
    white-space: pre-wrap;
    word-break: break-word;
  }
  .rtLink,
  .rtTag {
    color: var(--accent-2);
  }
  .rtLink {
    text-decoration: none;
  }
  .rtLink:hover {
    text-decoration: underline;
  }
  .rtTag {
    font-weight: 750;
  }
</style>

