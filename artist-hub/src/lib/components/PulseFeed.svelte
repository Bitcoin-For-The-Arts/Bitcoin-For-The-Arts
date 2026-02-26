<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { ensureNdk } from '$lib/stores/ndk';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';
  import { detectMediaType, extractUrls } from '$lib/ui/media';
  import { autoPauseVideo } from '$lib/ui/video';
  import { parseZapReceipt } from '$lib/nostr/zap-receipts';
  import { publishComment, publishEdit, publishNote, publishQuoteRepost, publishRepost } from '$lib/nostr/publish';
  import { isAuthed, pubkey as myPubkey } from '$lib/stores/auth';
  import Modal from '$lib/components/Modal.svelte';
  import ZapComposer from '$lib/components/ZapComposer.svelte';
  import ZapEmojiComposer from '$lib/components/ZapEmojiComposer.svelte';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import { profileHover } from '$lib/ui/profile-hover';

  export let tags: string[] = [];
  export let authors: string[] = [];
  export let limit = 40;

  type Post = {
    id: string;
    pubkey: string;
    createdAt: number;
    content: string;
    urls: string[];
  };

  type Stats = {
    comments: number;
    reposts: number;
    zaps: number;
    sats: number;
    editedContent?: string;
    editedAt?: number;
  };

  let posts: Post[] = [];
  let loading = false;
  let error: string | null = null;
  let stop: (() => void) | null = null; // live subscription
  let backfillBusy = false;
  let backfillDone = false;
  let cursorUntil: number | null = null; // unix seconds
  let loadMoreError: string | null = null;
  let sentinel: HTMLDivElement | null = null;
  let io: IntersectionObserver | null = null;
  const statsById = new Map<string, Stats>();
  let tick = 0; // invalidate for stats changes

  // Composer
  let newPost = '';
  let publishBusy = false;
  let publishError: string | null = null;

  // Comment modal
  let commentsOpenFor: Post | null = null;
  let comments: Array<{
    id: string;
    pubkey: string;
    createdAt: number;
    content: string;
    replyTo?: string;
  }> = [];
  let commentText = '';
  let commentBusy = false;
  let commentError: string | null = null;
  let replyTo: { id: string; pubkey: string } | null = null;

  // Edit modal
  let editOpenFor: Post | null = null;
  let editText = '';
  let editBusy = false;
  let editError: string | null = null;

  // Zap modal
  let zapOpenFor: Post | null = null;
  let zapsOpenFor: Post | null = null;
  let zapsLoading = false;
  let zapsError: string | null = null;
  let zapReceipts: Array<{ id: string; pubkey: string; createdAt: number; sats: number; emoji?: string }> = [];
  let zapPayOpenFor: { recipientPubkey: string; recipientLabel: string; eventId?: string } | null = null;

  // Reposts modal
  let repostsOpenFor: Post | null = null;
  let repostsLoading = false;
  let repostsError: string | null = null;
  let reposts: Array<{ id: string; pubkey: string; createdAt: number }> = [];
  let quoteReposts: Array<{ id: string; pubkey: string; createdAt: number; content: string }> = [];

  // Repost / quote composer (for posts + comments)
  let repostComposeFor: { id: string; pubkey: string; label: string } | null = null;
  let repostComposeFromPost: Post | null = null;
  let repostQuote = '';
  let repostComposeBusy = false;
  let repostComposeError: string | null = null;

  function cleanTags(xs: string[]): string[] {
    return xs.map((t) => t.replace(/^#/, '').trim()).filter(Boolean).slice(0, 6);
  }

  function cleanAuthors(xs: string[]): string[] {
    const out: string[] = [];
    for (const x of xs || []) {
      const pk = (x || '').trim().toLowerCase();
      if (!pk) continue;
      if (!/^[0-9a-f]{64}$/.test(pk)) continue;
      if (!out.includes(pk)) out.push(pk);
    }
    return out.slice(0, 3);
  }

  function eventToPost(ev: any): Post | null {
    if (!ev?.id || !ev?.pubkey || !ev?.created_at) return null;
    if (isReplyLike(ev)) return null; // keep Pulse as a top-level timeline
    const content = (ev.content || '').trim();
    if (!content) return null;
    return {
      id: ev.id,
      pubkey: ev.pubkey,
      createdAt: ev.created_at,
      content,
      urls: extractUrls(content),
    };
  }

  function upsertPost(post: Post, opts?: { cap?: number }): void {
    const cap = Math.max(80, Math.min(1200, opts?.cap ?? 600));
    posts = [post, ...posts.filter((x) => x.id !== post.id)]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, cap);
  }

  function isReplyLike(ev: any): boolean {
    const tags = (ev.tags as string[][]) || [];
    return tags.some((t) => t[0] === 'e');
  }

  function replyTargetFor(ev: any, rootId: string): string | undefined {
    const tags = (ev.tags as string[][]) || [];
    const explicit = tags.find((t) => t[0] === 'e' && t[3] === 'reply')?.[1];
    if (explicit) return explicit;
    const others = tags.filter((t) => t[0] === 'e' && typeof t[1] === 'string').map((t) => t[1]);
    const guess = others.find((id) => id !== rootId);
    return guess;
  }

  function getStats(id: string): Stats | null {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = tick;
    return statsById.get(id) ?? null;
  }

  async function refreshStatsFor(p: Post): Promise<void> {
    statsById.delete(p.id);
    await loadStatsFor(p);
  }

  async function loadStatsFor(p: Post): Promise<void> {
    if (statsById.has(p.id)) return;
    statsById.set(p.id, { comments: 0, reposts: 0, zaps: 0, sats: 0 });
    tick++;

    try {
      const ndk = await ensureNdk();
      const sub = ndk.subscribe(
        { kinds: [NOSTR_KINDS.note, NOSTR_KINDS.repost, NOSTR_KINDS.nip57_zap_receipt, NOSTR_KINDS.nip37_edit], '#e': [p.id], limit: 250 } as any,
        { closeOnEose: true },
      );
      const subQuotes = ndk.subscribe({ kinds: [NOSTR_KINDS.note], '#q': [p.id], limit: 250 } as any, { closeOnEose: true });

      let commentsCount = 0;
      let repostsCount = 0;
      let quoteRepostsCount = 0;
      let zapsCount = 0;
      let satsSum = 0;
      let latestEdit: { at: number; content: string } | null = null;

      sub.on('event', (ev) => {
        if (ev.kind === NOSTR_KINDS.note) {
          if (ev.id === p.id) return;
          const tags = (ev.tags as string[][]) || [];
          const isQuote = tags.some((t) => t[0] === 'q' && t[1] === p.id);
          if (!isQuote) commentsCount += 1;
        }
        if (ev.kind === NOSTR_KINDS.repost) repostsCount += 1;
        if (ev.kind === NOSTR_KINDS.nip57_zap_receipt) {
          const parsed = parseZapReceipt(ev);
          if (parsed?.eTags.includes(p.id)) {
            zapsCount += 1;
            satsSum += parsed.amountSats ?? 0;
          }
        }
        if (ev.kind === NOSTR_KINDS.nip37_edit) {
          if (ev.pubkey !== p.pubkey) return;
          const at = ev.created_at || 0;
          if (!latestEdit || at > latestEdit.at) latestEdit = { at, content: ev.content || '' };
        }
      });

      subQuotes.on('event', (ev) => {
        if (!ev?.id) return;
        if (ev.id === p.id) return;
        quoteRepostsCount += 1;
      });

      let doneA = false;
      let doneB = false;
      function finalize() {
        if (!doneA || !doneB) return;
        const prev = statsById.get(p.id);
        if (!prev) return;
        statsById.set(p.id, {
          comments: commentsCount,
          reposts: repostsCount + quoteRepostsCount,
          zaps: zapsCount,
          sats: satsSum,
          editedContent: latestEdit?.content?.trim() ? latestEdit.content.trim() : undefined,
          editedAt: latestEdit?.at,
        });
        tick++;
      }

      sub.on('eose', () => {
        doneA = true;
        finalize();
      });
      subQuotes.on('eose', () => {
        doneB = true;
        finalize();
      });
    } catch {
      // ignore stats failures
    }
  }

  async function start(): Promise<void> {
    error = null;
    loading = true;
    loadMoreError = null;
    posts = [];
    backfillDone = false;
    cursorUntil = null;
    if (stop) stop();
    stop = null;

    try {
      const ndk = await ensureNdk();
      const t = cleanTags(tags);
      const a = cleanAuthors(authors);

      // Initial backfill (latest page).
      await loadMore({ ndk, t, a, initial: true });

      // Live subscription for new posts going forward.
      const since = Math.floor(Date.now() / 1000) - 60;
      const filter: any = { kinds: [NOSTR_KINDS.note], limit: Math.max(120, limit), since };
      if (t.length) filter['#t'] = t;
      if (a.length) filter.authors = a;

      const sub = ndk.subscribe(filter, { closeOnEose: false });
      sub.on('event', (ev) => {
        const post = eventToPost(ev);
        if (!post) return;
        upsertPost(post);
        void fetchProfileFor(post.pubkey);
        // Stats are expensive; prefetch for a bounded window.
        if (posts.length <= Math.max(60, limit)) void loadStatsFor(post);
      });
      sub.on('eose', () => (loading = false));
      stop = () => sub.stop();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      loading = false;
    }
  }

  async function loadMore(opts?: { ndk?: any; t?: string[]; a?: string[]; initial?: boolean }): Promise<void> {
    if (backfillBusy || backfillDone) return;
    backfillBusy = true;
    loadMoreError = null;
    try {
      const ndk = opts?.ndk ?? (await ensureNdk());
      const t = opts?.t ?? cleanTags(tags);
      const a = opts?.a ?? cleanAuthors(authors);

      const pageSize = Math.max(20, limit);
      const until = cursorUntil ?? Math.floor(Date.now() / 1000);
      const filter: any = { kinds: [NOSTR_KINDS.note], limit: pageSize, until };
      if (t.length) filter['#t'] = t;
      if (a.length) filter.authors = a;

      const sub = ndk.subscribe(filter, { closeOnEose: true });
      let minTs = until;
      let added = 0;
      sub.on('event', (ev) => {
        const post = eventToPost(ev);
        if (!post) return;
        const had = posts.some((p) => p.id === post.id);
        upsertPost(post);
        if (!had) added += 1;
        if (post.createdAt && post.createdAt < minTs) minTs = post.createdAt;
        void fetchProfileFor(post.pubkey);
      });

      await new Promise<void>((resolve) => sub.on('eose', () => resolve()));

      if (minTs <= 0 || minTs >= until) {
        backfillDone = true;
      } else {
        cursorUntil = Math.max(0, minTs - 1);
      }

      // For subsequent pages, if we didn’t add anything new, assume we’re done.
      if (!opts?.initial && added === 0) backfillDone = true;
    } catch (e) {
      loadMoreError = e instanceof Error ? e.message : String(e);
    } finally {
      backfillBusy = false;
      loading = false;
    }
  }

  async function doPublishPost() {
    publishError = null;
    if (!$isAuthed) {
      publishError = 'Connect your npub to post.';
      return;
    }
    const body = newPost.trim();
    if (!body) return;
    publishBusy = true;
    try {
      await publishNote({ content: body, tags: cleanTags(tags) });
      newPost = '';
    } catch (e) {
      publishError = e instanceof Error ? e.message : String(e);
    } finally {
      publishBusy = false;
    }
  }

  async function openComments(p: Post) {
    commentsOpenFor = p;
    comments = [];
    commentText = '';
    commentError = null;
    replyTo = null;

    try {
      const ndk = await ensureNdk();
      const sub = ndk.subscribe({ kinds: [NOSTR_KINDS.note], '#e': [p.id], limit: 200 } as any, { closeOnEose: true });
      const buf: any[] = [];
      sub.on('event', (ev) => {
        if (!ev?.id || !ev?.pubkey || !ev?.created_at) return;
        if (ev.id === p.id) return;
        buf.push(ev);
      });
      sub.on('eose', () => {
        const out = buf
          .map((ev) => ({
            id: ev.id,
            pubkey: ev.pubkey,
            createdAt: ev.created_at,
            content: (ev.content || '').trim(),
            replyTo: replyTargetFor(ev, p.id),
          }))
          .filter((x) => x.content)
          .sort((a, b) => a.createdAt - b.createdAt)
          .slice(0, 120);
        comments = out;
        for (const c of out.slice(0, 25)) void fetchProfileFor(c.pubkey);
      });
    } catch (e) {
      commentError = e instanceof Error ? e.message : String(e);
    }
  }

  async function openZaps(p: Post) {
    zapsOpenFor = p;
    zapsLoading = true;
    zapsError = null;
    zapReceipts = [];

    try {
      const ndk = await ensureNdk();
      // More robust than '#e': query by recipient and filter client-side by embedded zap-request tags.
      const sub = ndk.subscribe(
        { kinds: [NOSTR_KINDS.nip57_zap_receipt], '#p': [p.pubkey], limit: 600 } as any,
        { closeOnEose: true },
      );
      const buf: any[] = [];
      sub.on('event', (ev) => {
        const parsed = parseZapReceipt(ev);
        if (!parsed?.senderPubkey) return;
        if (!parsed.eTags.includes(p.id)) return;
        buf.push(parsed);
      });
      sub.on('eose', () => {
        const out = buf
          .map((z) => ({
            id: z.receiptId,
            pubkey: z.senderPubkey!,
            createdAt: z.createdAt,
            sats: z.amountSats ?? 0,
            emoji: z.comment,
          }))
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 200);
        zapReceipts = out;
        for (const z of out.slice(0, 30)) void fetchProfileFor(z.pubkey);
        zapsLoading = false;
      });
    } catch (e) {
      zapsError = e instanceof Error ? e.message : String(e);
      zapsLoading = false;
    }
  }

  async function openReposts(p: Post) {
    repostsOpenFor = p;
    repostsLoading = true;
    repostsError = null;
    reposts = [];
    quoteReposts = [];

    try {
      const ndk = await ensureNdk();
      const sub = ndk.subscribe(
        { kinds: [NOSTR_KINDS.repost], '#e': [p.id], limit: 500 } as any,
        { closeOnEose: true },
      );
      const subQuotes = ndk.subscribe({ kinds: [NOSTR_KINDS.note], '#q': [p.id], limit: 500 } as any, { closeOnEose: true });

      const seen = new Set<string>();
      const buf: Array<{ id: string; pubkey: string; createdAt: number }> = [];
      const bufQuotes: Array<{ id: string; pubkey: string; createdAt: number; content: string }> = [];

      sub.on('event', (ev) => {
        if (!ev?.id || !ev?.pubkey || !ev?.created_at) return;
        if (seen.has(ev.id)) return;
        seen.add(ev.id);
        buf.push({ id: ev.id, pubkey: ev.pubkey, createdAt: ev.created_at });
      });

      subQuotes.on('event', (ev) => {
        if (!ev?.id || !ev?.pubkey || !ev?.created_at) return;
        if (seen.has(ev.id)) return;
        seen.add(ev.id);
        bufQuotes.push({ id: ev.id, pubkey: ev.pubkey, createdAt: ev.created_at, content: (ev.content || '').trim() });
      });

      let doneA = false;
      let doneB = false;
      function finalize() {
        if (!doneA || !doneB) return;
        reposts = buf.sort((a, b) => b.createdAt - a.createdAt).slice(0, 250);
        quoteReposts = bufQuotes.sort((a, b) => b.createdAt - a.createdAt).slice(0, 250);
        for (const r of reposts.slice(0, 25)) void fetchProfileFor(r.pubkey);
        for (const r of quoteReposts.slice(0, 25)) void fetchProfileFor(r.pubkey);
        repostsLoading = false;
      }

      sub.on('eose', () => {
        doneA = true;
        finalize();
      });
      subQuotes.on('eose', () => {
        doneB = true;
        finalize();
      });
    } catch (e) {
      repostsError = e instanceof Error ? e.message : String(e);
      repostsLoading = false;
    }
  }

  async function postComment() {
    if (!commentsOpenFor) return;
    commentError = null;
    if (!$isAuthed) {
      commentError = 'Connect your npub to comment.';
      return;
    }
    const body = commentText.trim();
    if (!body) return;
    commentBusy = true;
    try {
      await publishComment({
        rootEventId: commentsOpenFor.id,
        rootPubkey: commentsOpenFor.pubkey,
        replyToEventId: replyTo?.id,
        replyToPubkey: replyTo?.pubkey,
        content: body,
      });
      commentText = '';
      replyTo = null;
      await openComments(commentsOpenFor);
      await refreshStatsFor(commentsOpenFor);
    } catch (e) {
      commentError = e instanceof Error ? e.message : String(e);
    } finally {
      commentBusy = false;
    }
  }

  function openEdit(p: Post) {
    editOpenFor = p;
    const st = getStats(p.id);
    editText = st?.editedContent ?? p.content;
    editError = null;
  }

  async function saveEdit() {
    if (!editOpenFor) return;
    editError = null;
    if (!$isAuthed) {
      editError = 'Connect your npub to edit.';
      return;
    }
    if ($myPubkey !== editOpenFor.pubkey) {
      editError = 'You can only edit your own posts.';
      return;
    }
    editBusy = true;
    try {
      await publishEdit({ originalEventId: editOpenFor.id, content: editText });
      await refreshStatsFor(editOpenFor);
      editOpenFor = null;
    } catch (e) {
      editError = e instanceof Error ? e.message : String(e);
    } finally {
      editBusy = false;
    }
  }

  function openRepostComposer(target: { id: string; pubkey: string; label: string }, fromPost: Post | null) {
    repostComposeFor = target;
    repostComposeFromPost = fromPost;
    repostQuote = '';
    repostComposeError = null;
  }

  async function doPlainRepostFromComposer() {
    if (!repostComposeFor) return;
    repostComposeError = null;
    if (!$isAuthed) {
      repostComposeError = 'Connect your npub to repost.';
      return;
    }
    repostComposeBusy = true;
    try {
      const ndk = await ensureNdk();
      const ev = await ndk.fetchEvent(repostComposeFor.id);
      if (!ev) throw new Error('Original event not found on connected relays.');
      await publishRepost({
        id: ev.id!,
        pubkey: ev.pubkey!,
        created_at: ev.created_at!,
        kind: ev.kind!,
        content: ev.content || '',
        tags: (ev.tags as any as string[][]) || [],
        sig: (ev as any).sig,
      });
      if (repostComposeFromPost) await refreshStatsFor(repostComposeFromPost);
      repostComposeFor = null;
      repostComposeFromPost = null;
    } catch (e) {
      repostComposeError = e instanceof Error ? e.message : String(e);
    } finally {
      repostComposeBusy = false;
    }
  }

  async function doQuoteRepostFromComposer() {
    if (!repostComposeFor) return;
    repostComposeError = null;
    if (!$isAuthed) {
      repostComposeError = 'Connect your npub to repost.';
      return;
    }
    repostComposeBusy = true;
    try {
      await publishQuoteRepost({ eventId: repostComposeFor.id, eventPubkey: repostComposeFor.pubkey, quote: repostQuote });
      if (repostComposeFromPost) await refreshStatsFor(repostComposeFromPost);
      repostComposeFor = null;
      repostComposeFromPost = null;
    } catch (e) {
      repostComposeError = e instanceof Error ? e.message : String(e);
    } finally {
      repostComposeBusy = false;
    }
  }

  onMount(() => void start());
  onMount(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    if (!sentinel) return;
    if (io) io.disconnect();
    io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void loadMore();
      },
      { rootMargin: '700px 0px' },
    );
    io.observe(sentinel);
  });
  let lastKey = '';
  $: {
    const key = JSON.stringify({ tags: cleanTags(tags), authors: cleanAuthors(authors), limit });
    if (key !== lastKey) {
      lastKey = key;
      void start();
    }
  }

  onDestroy(() => {
    if (stop) stop();
    if (io) io.disconnect();
  });
</script>

<div class="grid" style="gap: 1rem;">
  <div class="card" style="padding: 1rem;">
    <div style="font-weight: 950;">Post</div>
    <div class="muted" style="margin-top: 0.35rem; line-height:1.55;">
      Publish a note to Nostr. Comments are replies. Zaps are Lightning payments with optional emoji attachments.
    </div>
    <div style="margin-top: 0.75rem;">
      <textarea class="textarea" bind:value={newPost} placeholder="Share an update, drop a link, announce a listing…"></textarea>
      <div style="margin-top:0.65rem; display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
        <button class="btn primary" disabled={publishBusy || !newPost.trim()} on:click={doPublishPost}>
          {publishBusy ? 'Publishing…' : 'Publish'}
        </button>
        {#if publishError}<span class="muted" style="color:var(--danger);">{publishError}</span>{/if}
      </div>
    </div>
  </div>

  {#if error}
    <div class="card" style="padding: 1rem; border-color: rgba(251,113,133,0.35);">
      <div class="muted">{error}</div>
    </div>
  {/if}

  <div class="feed">
    {#each posts as p (p.id)}
      {@const prof = $profileByPubkey[p.pubkey]}
      {@const name = prof?.display_name || prof?.name || npubFor(p.pubkey).slice(0, 12) + '…'}
      {@const st = getStats(p.id)}
      {@const body = st?.editedContent ?? p.content}

      <div class="card post">
        <div class="head">
          <div class="who">
            {#if prof?.picture}
              <img src={prof.picture} alt="" class="avatar" use:profileHover={p.pubkey} />
            {/if}
            <div class="meta">
              <div class="name" use:profileHover={p.pubkey}>{name}</div>
              <div class="muted small">
                {new Date(p.createdAt * 1000).toLocaleString()}
                {#if st?.editedAt} • edited{/if}
              </div>
            </div>
          </div>
        </div>

        <div class="content">
          <div class="text">{body}</div>

          {#if p.urls.length}
            <div class="media">
              {#each p.urls.slice(0, 4) as u (u)}
                {@const t = detectMediaType(u)}
                {#if t === 'image'}
                  <a href={u} target="_blank" rel="noreferrer" class="m image">
                    <img src={u} alt="" loading="lazy" />
                  </a>
                {:else if t === 'video'}
                  <div class="m video">
                    <!-- svelte-ignore a11y_media_has_caption -->
                    <video src={u} controls playsinline preload="metadata" use:autoPauseVideo></video>
                  </div>
                {:else if t === 'audio'}
                  <div class="m audio">
                    <audio src={u} controls preload="none"></audio>
                  </div>
                {:else}
                  <a href={u} target="_blank" rel="noreferrer" class="pill muted mono link">{u}</a>
                {/if}
              {/each}
            </div>
          {/if}
        </div>

        <div class="actions" aria-label="Post actions">
          <div class="aw" title="Comments">
            <button class="iconBtn" on:click={() => openComments(p)} aria-label="Comment">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M8 10h8M8 14h5M6 20l-2 2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-3 2z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </button>
            {#if st}
              <button class="badgeBtn" on:click={() => openComments(p)} aria-label={`${st.comments} comments`}>
                {st.comments}
              </button>
            {/if}
          </div>

          <div class="aw" title="Zaps">
            <button class="iconBtn primary" on:click={() => (zapOpenFor = p)} aria-label="Zap">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M13 2L3 14h7l-1 8 12-14h-7l-1-6z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </button>
            {#if st}
              <button
                class="badgeBtn"
                title={`${st.sats.toLocaleString()} sats`}
                on:click={() => openZaps(p)}
                aria-label={`${st.zaps} zaps`}
              >
                {st.zaps}
              </button>
            {/if}
          </div>

          <div class="aw" title="Reposts">
            <button
              class="iconBtn"
              on:click={() => openRepostComposer({ id: p.id, pubkey: p.pubkey, label: name }, p)}
              aria-label="Repost / quote repost"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M7 7h11l-2-2m2 2-2 2M17 17H6l2 2m-2-2 2-2"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </button>
            {#if st}
              <button class="badgeBtn" on:click={() => openReposts(p)} aria-label={`${st.reposts} reposts`}>
                {st.reposts}
              </button>
            {/if}
          </div>

          {#if $myPubkey === p.pubkey}
            <div class="aw" title="Edit">
              <button class="iconBtn" on:click={() => openEdit(p)} aria-label="Edit">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 20h4l10.5-10.5a2 2 0 0 0 0-3L16.5 4a2 2 0 0 0-3 0L3 14.5V20z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                  ></path>
                </svg>
              </button>
            </div>
          {/if}
        </div>
      </div>
    {/each}

    {#if !posts.length && !loading}
      <div class="card" style="padding: 1rem;">
        <div class="muted">No posts found yet for these filters.</div>
      </div>
    {/if}

    {#if posts.length}
      <div style="margin-top: 0.75rem;">
        {#if loadMoreError}
          <div class="muted" style="color: var(--danger);">{loadMoreError}</div>
        {:else if backfillBusy}
          <div class="muted">Loading more…</div>
        {:else if backfillDone}
          <div class="muted">You’ve reached the end of the feed (for your current relays/filters).</div>
        {/if}
      </div>
    {/if}

    <div bind:this={sentinel} style="height: 1px;"></div>
  </div>
</div>

<Modal open={Boolean(commentsOpenFor)} title="Comments" onClose={() => (commentsOpenFor = null)}>
  {#if commentsOpenFor}
    <div class="muted" style="margin-bottom:0.75rem;">
      Replying to: <span class="pill">{commentsOpenFor.id.slice(0, 10)}…</span>
    </div>

    {#if replyTo}
      <div style="margin-bottom:0.6rem; display:flex; gap:0.35rem; flex-wrap:wrap; align-items:center;">
        <span class="pill">Replying to comment: {replyTo.id.slice(0, 10)}…</span>
        <button class="pill muted pillBtn" on:click={() => (replyTo = null)}>Cancel reply</button>
      </div>
    {/if}

    <textarea class="textarea" bind:value={commentText} placeholder="Write a comment (public)…"></textarea>
    <div style="margin-top: 0.65rem; display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
      <button class="btn primary" disabled={commentBusy || !commentText.trim()} on:click={postComment}>
        {commentBusy ? 'Posting…' : 'Post comment'}
      </button>
      {#if commentError}<span class="muted" style="color:var(--danger);">{commentError}</span>{/if}
    </div>

    <div style="margin-top: 1rem; display:grid; gap:0.6rem;">
      {#each comments as c (c.id)}
        {@const cp = $profileByPubkey[c.pubkey]}
        {@const cName = cp?.display_name || cp?.name || npubFor(c.pubkey).slice(0, 18) + '…'}
        <div
          class="card"
          style={`padding: 0.85rem 1rem; ${c.replyTo ? 'border-left: 3px solid rgba(246,196,83,0.35); margin-left: 0.75rem;' : ''}`}
        >
          <div class="muted" style="font-size: 0.88rem;" use:profileHover={c.pubkey}>
            {cName} • {new Date(c.createdAt * 1000).toLocaleString()}
          </div>
          {#if c.replyTo}
            <div class="muted small" style="margin-top:0.2rem;">↳ reply to {c.replyTo.slice(0, 10)}…</div>
          {/if}
          <div style="margin-top: 0.45rem; white-space: pre-wrap; line-height: 1.5;">{c.content}</div>
          <div style="margin-top:0.6rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button class="btn" on:click={() => (replyTo = { id: c.id, pubkey: c.pubkey })}>Reply</button>
            <button
              class="btn primary"
              on:click={() => (zapPayOpenFor = { recipientPubkey: c.pubkey, recipientLabel: cName, eventId: c.id })}
            >
              Zap
            </button>
            <button class="btn" on:click={() => openRepostComposer({ id: c.id, pubkey: c.pubkey, label: cName }, null)}>
              Repost / Quote
            </button>
          </div>
        </div>
      {/each}
      {#if comments.length === 0}
        <div class="muted">No comments yet.</div>
      {/if}
    </div>
  {/if}
</Modal>

<Modal open={Boolean(repostComposeFor)} title="Repost / Quote" onClose={() => ((repostComposeFor = null), (repostComposeFromPost = null))}>
  {#if repostComposeFor}
    <div class="muted" style="margin-bottom:0.75rem; line-height:1.45;">
      Target: <span class="pill">{repostComposeFor.label}</span> <span class="pill muted">{repostComposeFor.id.slice(0, 10)}…</span>
    </div>

    <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
      <button class="btn" disabled={repostComposeBusy} on:click={doPlainRepostFromComposer}>Repost (no quote)</button>
      <button class="btn" on:click={() => ((repostComposeFor = null), (repostComposeFromPost = null))}>Close</button>
    </div>

    <div style="margin-top:0.9rem;">
      <div style="font-weight:950;">Quote repost</div>
      <div class="muted" style="margin-top:0.35rem; line-height:1.45;">
        This publishes a note with a `q` tag to the target event, plus a `nostr:note…` link.
      </div>
      <textarea class="textarea" bind:value={repostQuote} placeholder="Add your quote…"></textarea>
      <div style="margin-top:0.65rem; display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
        <button class="btn primary" disabled={repostComposeBusy || !repostQuote.trim()} on:click={doQuoteRepostFromComposer}>
          {repostComposeBusy ? 'Publishing…' : 'Quote repost'}
        </button>
        {#if repostComposeError}
          <span class="muted" style="color:var(--danger);">{repostComposeError}</span>
        {/if}
      </div>
    </div>
  {/if}
</Modal>

<!-- Reposts (retweets) -->
<Modal open={Boolean(repostsOpenFor)} title="Reposts" onClose={() => (repostsOpenFor = null)}>
  {#if repostsOpenFor}
    <div class="muted" style="margin-bottom:0.75rem;">
      Reposts of: <span class="pill">{repostsOpenFor.id.slice(0, 10)}…</span>
    </div>

    {#if repostsError}
      <div class="muted" style="color:var(--danger);">{repostsError}</div>
    {/if}

    {#if repostsLoading}
      <div class="muted">Loading reposts…</div>
    {:else}
      <div style="display:flex; gap:0.35rem; flex-wrap:wrap; margin-bottom:0.75rem;">
        <span class="pill muted">{reposts.length + quoteReposts.length} total</span>
        <span class="pill muted">{reposts.length} repost(s)</span>
        <span class="pill muted">{quoteReposts.length} quote repost(s)</span>
      </div>
      <div style="display:grid; gap:0.6rem;">
        {#each reposts as r (r.id)}
          {@const rp = $profileByPubkey[r.pubkey]}
          <div class="card" style="padding: 0.85rem 1rem;">
            <div style="display:flex; gap:0.55rem; align-items:center; justify-content:space-between;">
              <div style="display:flex; gap:0.55rem; align-items:center; min-width:0;" use:profileHover={r.pubkey}>
                {#if rp?.picture}
                  <img src={rp.picture} alt="" style="width:26px; height:26px; border-radius:10px; border:1px solid var(--border); object-fit:cover;" />
                {/if}
                <div style="min-width:0;">
                  <div style="font-weight:900; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    {rp?.display_name || rp?.name || npubFor(r.pubkey).slice(0, 18) + '…'}
                  </div>
                  <div class="muted small">{new Date(r.createdAt * 1000).toLocaleString()}</div>
                </div>
              </div>
              <a class="pill muted mono link" href={`https://njump.me/${r.id}`} target="_blank" rel="noreferrer">njump</a>
            </div>
          </div>
        {/each}
        {#if reposts.length === 0}
          <div class="muted">No reposts found yet (depends on relays).</div>
        {/if}
      </div>

      {#if quoteReposts.length}
        <div style="margin-top: 1rem; font-weight:950;">Quote reposts</div>
        <div style="margin-top: 0.6rem; display:grid; gap:0.6rem;">
          {#each quoteReposts as r (r.id)}
            {@const rp = $profileByPubkey[r.pubkey]}
            <div class="card" style="padding: 0.85rem 1rem;">
              <div style="display:flex; gap:0.55rem; align-items:center; justify-content:space-between;">
                <div style="display:flex; gap:0.55rem; align-items:center; min-width:0;" use:profileHover={r.pubkey}>
                  {#if rp?.picture}
                    <img src={rp.picture} alt="" style="width:26px; height:26px; border-radius:10px; border:1px solid var(--border); object-fit:cover;" />
                  {/if}
                  <div style="min-width:0;">
                    <div style="font-weight:900; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      {rp?.display_name || rp?.name || npubFor(r.pubkey).slice(0, 18) + '…'}
                    </div>
                    <div class="muted small">{new Date(r.createdAt * 1000).toLocaleString()}</div>
                  </div>
                </div>
                <a class="pill muted mono link" href={`https://njump.me/${r.id}`} target="_blank" rel="noreferrer">njump</a>
              </div>
              {#if r.content}
                <div style="margin-top:0.5rem; white-space: pre-wrap; line-height: 1.5;">{r.content.slice(0, 240)}{r.content.length > 240 ? '…' : ''}</div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  {/if}
</Modal>

<Modal open={Boolean(editOpenFor)} title="Edit post" onClose={() => (editOpenFor = null)}>
  {#if editOpenFor}
    <div class="muted" style="margin-bottom:0.75rem;">
      This publishes an edit event (NIP-37). Some clients may still show the original note.
    </div>
    <textarea class="textarea" bind:value={editText} placeholder="Edit your post…"></textarea>
    <div style="margin-top: 0.65rem; display:flex; gap:0.5rem; align-items:center;">
      <button class="btn primary" disabled={editBusy || !editText.trim()} on:click={saveEdit}>
        {editBusy ? 'Saving…' : 'Publish edit'}
      </button>
      <button class="btn" on:click={() => (editOpenFor = null)}>Cancel</button>
    </div>
    {#if editError}
      <div class="muted" style="margin-top:0.65rem; color:var(--danger);">{editError}</div>
    {/if}
  {/if}
</Modal>

<Modal open={Boolean(zapsOpenFor)} title="Zaps" onClose={() => (zapsOpenFor = null)}>
  {#if zapsOpenFor}
    <div class="muted" style="margin-bottom:0.75rem;">
      Zaps referencing: <span class="pill">{zapsOpenFor.id.slice(0, 10)}…</span>
    </div>

    {#if zapsError}
      <div class="muted" style="color:var(--danger);">{zapsError}</div>
    {/if}

    {#if zapsLoading}
      <div class="muted">Loading zap receipts…</div>
    {:else}
      <div style="display:flex; gap:0.35rem; flex-wrap:wrap; margin-bottom:0.75rem;">
        <span class="pill muted">{zapReceipts.length} zap(s)</span>
        <span class="pill">{zapReceipts.reduce((s, z) => s + (z.sats || 0), 0).toLocaleString()} sats</span>
      </div>

      <div style="display:grid; gap:0.6rem;">
        {#each zapReceipts as z (z.id)}
          {@const zp = $profileByPubkey[z.pubkey]}
          <div class="card" style="padding: 0.85rem 1rem;">
            <div style="display:flex; gap:0.55rem; align-items:center; justify-content:space-between;">
              <div style="display:flex; gap:0.55rem; align-items:center; min-width:0;" use:profileHover={z.pubkey}>
                {#if zp?.picture}
                  <img src={zp.picture} alt="" style="width:26px; height:26px; border-radius:10px; border:1px solid var(--border); object-fit:cover;" />
                {/if}
                <div style="min-width:0;">
                  <div style="font-weight:900; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    {zp?.display_name || zp?.name || npubFor(z.pubkey).slice(0, 18) + '…'}
                  </div>
                  <div class="muted small">{new Date(z.createdAt * 1000).toLocaleString()}</div>
                </div>
              </div>
              <div style="display:flex; gap:0.35rem; align-items:center; justify-content:flex-end; flex-wrap:wrap;">
                <span class="pill">{z.sats.toLocaleString()} sats</span>
                {#if z.emoji}
                  <span class="pill muted" title="Emoji attachment">{z.emoji}</span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
        {#if zapReceipts.length === 0}
          <div class="muted">No zap receipts found yet (depends on relays).</div>
        {/if}
      </div>
    {/if}
  {/if}
</Modal>

<ZapEmojiComposer
  open={Boolean(zapOpenFor)}
  recipientPubkey={zapOpenFor?.pubkey || ''}
  recipientLabel={(zapOpenFor && ($profileByPubkey[zapOpenFor.pubkey]?.display_name || $profileByPubkey[zapOpenFor.pubkey]?.name)) || 'Artist'}
  eventId={zapOpenFor?.id}
  onClose={() => (zapOpenFor = null)}
/>

<ZapComposer
  open={Boolean(zapPayOpenFor)}
  recipientPubkey={zapPayOpenFor?.recipientPubkey || ''}
  recipientLabel={zapPayOpenFor?.recipientLabel || 'Artist'}
  eventId={zapPayOpenFor?.eventId}
  onClose={() => (zapPayOpenFor = null)}
/>

<style>
  .feed {
    display: grid;
    gap: 1rem;
  }
  .post {
    padding: 0.95rem 1rem 1rem;
  }
  .head {
    display: grid;
    gap: 0.75rem;
  }
  .who {
    display: flex;
    gap: 0.7rem;
    align-items: center;
    min-width: 0;
  }
  .avatar {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    border: 1px solid var(--border);
    object-fit: cover;
  }
  .meta {
    min-width: 0;
  }
  .name {
    font-weight: 950;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 520px;
  }
  .small {
    font-size: 0.86rem;
  }

  .content {
    margin-top: 0.75rem;
  }
  .text {
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-word;
    max-width: 72ch;
  }
  .media {
    margin-top: 0.65rem;
    display: grid;
    gap: 0.55rem;
    max-width: 860px;
  }
  .m {
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.18);
  }
  .m.image img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    display: block;
  }
  .m.video video {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: contain;
    background: rgba(0, 0, 0, 0.55);
    display: block;
  }
  .m.audio audio {
    width: 100%;
    display: block;
  }

  .actions {
    margin-top: 0.9rem;
    display: flex;
    gap: 0.65rem;
    flex-wrap: wrap;
    align-items: center;
  }
  .aw {
    position: relative;
    width: 42px;
    height: 42px;
  }
  .iconBtn {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.06);
    display: grid;
    place-items: center;
    cursor: pointer;
  }
  .iconBtn:hover {
    background: rgba(255, 255, 255, 0.09);
  }
  .iconBtn.primary {
    border-color: rgba(246, 196, 83, 0.35);
    background: rgba(246, 196, 83, 0.14);
  }
  .iconBtn.primary:hover {
    background: rgba(246, 196, 83, 0.18);
  }
  .iconBtn svg {
    width: 20px;
    height: 20px;
    opacity: 0.95;
  }
  .badgeBtn {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(0, 0, 0, 0.78);
    color: var(--text);
    font-size: 0.75rem;
    font-weight: 900;
    line-height: 18px;
    cursor: pointer;
  }
  .badgeBtn:hover {
    background: rgba(0, 0, 0, 0.9);
  }
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
    font-size: 0.84rem;
  }
  .link {
    width: fit-content;
  }
</style>

