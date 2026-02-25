<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { ensureNdk } from '$lib/stores/ndk';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';
  import { nip19 } from 'nostr-tools';
  import { profileHover } from '$lib/ui/profile-hover';

  type Stream = {
    eventId: string;
    pubkey: string; // event pubkey (usually zap.stream service key)
    d: string;
    hostPubkey: string;
    title: string;
    summary?: string;
    image?: string;
    thumb?: string;
    watchUrl: string;
    status: string;
    currentParticipants: number;
    updatedAt: number;
    starts?: number;
  };

  export let limit = 24;

  let streams: Stream[] = [];
  let loading = true;
  let error: string | null = null;
  let stop: (() => void) | null = null;

  function getFirstTag(tags: string[][], name: string): string | undefined {
    return (tags || []).find((t) => t[0] === name)?.[1];
  }

  function getAllTag(tags: string[][], name: string): string[] {
    return (tags || []).filter((t) => t[0] === name && typeof t[1] === 'string').map((t) => t[1]);
  }

  function hostFromTags(tags: string[][], fallback: string): string {
    const host = (tags || []).find((t) => t[0] === 'p' && (t[3] || '').toLowerCase() === 'host')?.[1];
    return (host && typeof host === 'string' && host) ? host : fallback;
  }

  function watchUrlFromTags(evPubkey: string, d: string, tags: string[][]): string {
    const alt = getFirstTag(tags, 'alt') || '';
    const m = alt.match(/https:\/\/zap\.stream\/[a-z0-9]+/i);
    if (m?.[0]) return m[0];

    if (d && evPubkey) {
      try {
        const naddr = nip19.naddrEncode({ kind: 30311, pubkey: evPubkey, identifier: d, relays: [] });
        return `https://zap.stream/${naddr}`;
      } catch {
        // ignore
      }
    }
    return 'https://zap.stream';
  }

  function isZapStreamEvent(tags: string[][]): boolean {
    const alt = (getFirstTag(tags, 'alt') || '').toLowerCase();
    if (alt.includes('zap.stream')) return true;
    const service = (getFirstTag(tags, 'service') || '').toLowerCase();
    if (service.includes('zap.stream')) return true;
    const streaming = getAllTag(tags, 'streaming').join(' ').toLowerCase();
    if (streaming.includes('zap.stream')) return true;
    return false;
  }

  function parse(ev: any): Stream | null {
    if (!ev?.id || !ev?.pubkey || !ev?.created_at) return null;
    const tags = (ev.tags as string[][]) || [];
    if (!isZapStreamEvent(tags)) return null;

    const d = (getFirstTag(tags, 'd') || '').trim();
    if (!d) return null;

    const status = (getFirstTag(tags, 'status') || '').trim().toLowerCase();
    const title = (getFirstTag(tags, 'title') || '').trim() || 'Live on zap.stream';
    const summary = (getFirstTag(tags, 'summary') || '').trim() || undefined;
    const image = (getFirstTag(tags, 'image') || '').trim() || undefined;
    const thumb = (getFirstTag(tags, 'thumb') || '').trim() || undefined;

    const cur = Number(getFirstTag(tags, 'current_participants') || '');
    const currentParticipants = Number.isFinite(cur) && cur >= 0 ? cur : 0;
    const starts = Number(getFirstTag(tags, 'starts') || '');

    const hostPubkey = hostFromTags(tags, ev.pubkey);
    void fetchProfileFor(hostPubkey);

    return {
      eventId: ev.id,
      pubkey: ev.pubkey,
      d,
      hostPubkey,
      title,
      summary,
      image,
      thumb,
      watchUrl: watchUrlFromTags(ev.pubkey, d, tags),
      status,
      currentParticipants,
      updatedAt: ev.created_at,
      starts: Number.isFinite(starts) ? starts : undefined,
    };
  }

  async function start(): Promise<void> {
    if (stop) stop();
    streams = [];
    loading = true;
    error = null;

    try {
      const ndk = await ensureNdk();
      const since = Math.floor(Date.now() / 1000) - 60 * 60 * 24;

      const sub = ndk.subscribe({ kinds: [30311], since, limit: 400 } as any, { closeOnEose: false });
      sub.on('event', (ev) => {
        const s = parse(ev);
        if (!s) return;
        streams = [s, ...streams.filter((x) => x.eventId !== s.eventId)]
          .filter((x) => x.status === 'live')
          .sort((a, b) => b.currentParticipants - a.currentParticipants || b.updatedAt - a.updatedAt)
          .slice(0, limit);
      });
      sub.on('eose', () => (loading = false));
      stop = () => sub.stop();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      loading = false;
    }
  }

  onMount(() => void start());
  onDestroy(() => {
    if (stop) stop();
  });
</script>

<div class="wrap">
  <div class="head">
    <div class="titleRow">
      <div class="title">Live on zap.stream</div>
      <a class="muted link" href="https://zap.stream" target="_blank" rel="noreferrer">Open zap.stream</a>
    </div>
    <div class="muted desc">Click a stream to watch on zap.stream.</div>
  </div>

  {#if error}
    <div class="card" style="padding: 0.85rem 1rem; border-color: rgba(251,113,133,0.35);">
      <div class="muted">{error}</div>
    </div>
  {:else if loading && streams.length === 0}
    <div class="row">
      {#each Array(6) as _}
        <div class="card skel"></div>
      {/each}
    </div>
  {:else if streams.length === 0}
    <div class="card empty">
      <div class="muted">No live zap.stream streams found right now.</div>
    </div>
  {:else}
    <div class="row" aria-label="zap.stream live streams">
      {#each streams as s (s.eventId)}
        <a class="card item" href={s.watchUrl} target="_blank" rel="noreferrer" aria-label={`Watch ${s.title} on zap.stream`}>
          <div
            class="thumb"
            style={`background-image:url('${(s.thumb || s.image || '').replace(/'/g, '%27')}')`}
          >
            <div class="badge">LIVE</div>
            {#if s.currentParticipants > 0}
              <div class="count">👁 {s.currentParticipants}</div>
            {/if}
          </div>

          <div class="meta">
            <div class="name">{s.title}</div>
            <div class="by muted">
              by
              <span class="who" use:profileHover={s.hostPubkey}>
                {$profileByPubkey[s.hostPubkey]?.display_name ||
                $profileByPubkey[s.hostPubkey]?.name ||
                npubFor(s.hostPubkey).slice(0, 14) + '…'}
              </span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .wrap {
    margin-bottom: 1rem;
  }
  .head {
    margin-bottom: 0.65rem;
  }
  .titleRow {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .title {
    font-size: 1.05rem;
    font-weight: 950;
  }
  .link {
    font-size: 0.88rem;
    text-decoration: underline;
  }
  .desc {
    margin-top: 0.25rem;
    font-size: 0.9rem;
    line-height: 1.45;
  }

  .row {
    display: flex;
    gap: 0.6rem;
    overflow-x: auto;
    padding-bottom: 0.35rem;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
  }
  .row::-webkit-scrollbar {
    height: 10px;
  }

  .item {
    flex: 0 0 auto;
    width: 260px;
    padding: 0;
    overflow: hidden;
    scroll-snap-align: start;
    text-decoration: none;
    border-color: rgba(255, 255, 255, 0.14);
  }
  .item:hover {
    text-decoration: none;
    border-color: rgba(246, 196, 83, 0.35);
    transform: translateY(-1px);
  }

  .thumb {
    height: 146px;
    background: linear-gradient(180deg, rgba(246, 196, 83, 0.1), rgba(0, 0, 0, 0.3));
    background-size: cover;
    background-position: center;
    position: relative;
  }
  .badge {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.6px;
    padding: 0.22rem 0.5rem;
    border-radius: 999px;
    background: rgba(239, 68, 68, 0.92);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.18);
  }
  .count {
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 0.78rem;
    font-weight: 800;
    padding: 0.22rem 0.5rem;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: white;
    backdrop-filter: blur(8px);
  }

  .meta {
    padding: 0.7rem 0.85rem 0.85rem;
  }
  .name {
    font-weight: 900;
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .by {
    margin-top: 0.35rem;
    font-size: 0.86rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .who {
    color: var(--text);
    font-weight: 800;
  }

  .skel {
    width: 260px;
    height: 230px;
    padding: 0;
    background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03), rgba(255,255,255,0.06));
    background-size: 200% 100%;
    animation: shimmer 1.2s ease-in-out infinite;
  }
  .empty {
    padding: 0.85rem 1rem;
    border-color: rgba(255, 255, 255, 0.12);
  }
  @keyframes shimmer {
    0% { background-position: 0% 0; }
    100% { background-position: 200% 0; }
  }
</style>

