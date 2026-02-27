<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { ensureNdk } from '$lib/stores/ndk';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';
  import { extractUrls } from '$lib/ui/media';
  import { parseZapReceipt } from '$lib/nostr/zap-receipts';
  import { publishComment, publishEdit, publishNote, publishQuoteRepost, publishReaction, publishRepost } from '$lib/nostr/publish';
  import { canSign, pubkey as myPubkey } from '$lib/stores/auth';
  import Modal from '$lib/components/Modal.svelte';
  import ZapComposer from '$lib/components/ZapComposer.svelte';
  import ZapEmojiComposer from '$lib/components/ZapEmojiComposer.svelte';
  import EmojiPicker from '$lib/components/EmojiPicker.svelte';
  import ContentBody from '$lib/components/ContentBody.svelte';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import { profileHover } from '$lib/ui/profile-hover';
  import { insertAtCursor } from '$lib/ui/text';

  export let tags: string[] = [];
  export let authors: string[] = [];
  export let limit = 40;
  export let showComposer = true;
  export let includeReplies = false;
  export let onlyReplies = false;
  export let onTrending: ((items: any[]) => void) | null = null;

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
    likes: number;
    sats: number;
    zapEmojis?: string[];
    finalized?: boolean;
    editedContent?: string;
    editedAt?: number;
  };

  type TrendingItem = {
    id: string;
    pubkey: string;
    createdAt: number;
    content: string;
    score: number;
    sats: number;
    zaps: number;
    likes: number;
    reposts: number;
    comments: number;
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
  let trendingTimer: ReturnType<typeof setTimeout> | null = null;

  type MyZap = { amountSats: number; comment?: string; at: number };
  type MyRepost = { at: number; quote?: string };
  type MyLike = { at: number };
  const myZapsById = new Map<string, MyZap>();
  const myRepostsById = new Map<string, MyRepost>();
  const myLikesById = new Map<string, MyLike>();
  let myTick = 0;

  function getMyZap(id: string): MyZap | null {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = myTick;
    return myZapsById.get(id) ?? null;
  }
  function getMyRepost(id: string): MyRepost | null {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = myTick;
    return myRepostsById.get(id) ?? null;
  }
  function getMyLike(id: string): MyLike | null {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = myTick;
    return myLikesById.get(id) ?? null;
  }

  function noteMyZap(eventId: string | undefined, amountSats: number, comment?: string) {
    if (!eventId) return;
    myZapsById.set(eventId, { amountSats: Math.max(0, Math.floor(amountSats)), comment, at: Date.now() });
    myTick++;

    // Optimistically bump stats for posts (comments won't have stats here).
    const prev = statsById.get(eventId);
    if (prev) {
      statsById.set(eventId, { ...prev, zaps: (prev.zaps || 0) + 1, sats: (prev.sats || 0) + Math.max(0, Math.floor(amountSats)) });
      tick++;
    }
  }

  function noteMyRepost(eventId: string | undefined, quote?: string) {
    if (!eventId) return;
    myRepostsById.set(eventId, { at: Date.now(), quote: quote?.trim() || undefined });
    myTick++;

    const prev = statsById.get(eventId);
    if (prev) {
      statsById.set(eventId, { ...prev, reposts: (prev.reposts || 0) + 1 });
      tick++;
    }
  }

  function noteMyLike(eventId: string | undefined) {
    if (!eventId) return;
    myLikesById.set(eventId, { at: Date.now() });
    myTick++;
    const prev = statsById.get(eventId);
    if (prev) {
      statsById.set(eventId, { ...prev, likes: (prev.likes || 0) + 1 });
      tick++;
    }
  }

  function isLikeReactionContent(content: unknown): boolean {
    const c = typeof content === 'string' ? content.trim() : '';
    if (!c) return false;
    return c !== '-';
  }

  let toast: string | null = null;
  let toastTimer: any = null;
  function showToast(msg: string) {
    toast = msg;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast = null), 2200);
  }

  // Composer
  let newPost = '';
  let newPostEl: HTMLTextAreaElement | null = null;
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
  let commentEl: HTMLTextAreaElement | null = null;
  let commentBusy = false;
  let commentError: string | null = null;
  let replyTo: { id: string; pubkey: string } | null = null;

  // Edit modal
  let editOpenFor: Post | null = null;
  let editText = '';
  let editEl: HTMLTextAreaElement | null = null;
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
  let repostQuoteEl: HTMLTextAreaElement | null = null;
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
    // Allow "Following" feeds (can be >3 authors) while still preventing runaway filter sizes.
    return out.slice(0, 120);
  }

  function eventToPost(ev: any): Post | null {
    if (!ev?.id || !ev?.pubkey || !ev?.created_at) return null;
    const replyLike = isReplyLike(ev);
    if (onlyReplies && !replyLike) return null;
    if (!includeReplies && replyLike) return null; // keep Pulse as a top-level timeline by default
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
    emitTrendingSoon();
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

  function computeTrending(): TrendingItem[] {
    const now = Math.floor(Date.now() / 1000);
    const windowSecs = 60 * 60 * 18; // ~18h
    const out: TrendingItem[] = [];
    for (const p of posts) {
      if (!p?.id) continue;
      if (now - (p.createdAt || 0) > windowSecs) continue;
      const s = statsById.get(p.id);
      if (!s) continue;
      const sats = Math.max(0, Math.floor(s.sats || 0));
      const zaps = Math.max(0, Math.floor(s.zaps || 0));
      const likes = Math.max(0, Math.floor(s.likes || 0));
      const reposts = Math.max(0, Math.floor(s.reposts || 0));
      const comments = Math.max(0, Math.floor(s.comments || 0));
      const score = sats + zaps * 250 + likes * 40 + reposts * 80 + comments * 60;
      if (score > 0) out.push({ id: p.id, pubkey: p.pubkey, createdAt: p.createdAt, content: p.content, score, sats, zaps, likes, reposts, comments });
    }
    out.sort((a, b) => b.score - a.score);
    if (out.length) return out.slice(0, 8);

    // Fallback: if we don't have any stats yet, show recent posts so the rail isn't empty.
    return posts
      .slice(0, 8)
      .map((p) => ({ id: p.id, pubkey: p.pubkey, createdAt: p.createdAt, content: p.content, score: 0, sats: 0, zaps: 0, likes: 0, reposts: 0, comments: 0 }));
  }

  function emitTrendingSoon() {
    if (!onTrending) return;
    if (trendingTimer) clearTimeout(trendingTimer);
    trendingTimer = setTimeout(() => {
      try {
        onTrending?.(computeTrending());
      } catch {
        // ignore
      }
    }, 150);
  }

  // Recompute trending when stats update.
  $: if (onTrending) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _t = tick;
    emitTrendingSoon();
  }

  const statsQueue = new Set<string>();
  function ensureStatsFor(p: Post) {
    if (!p?.id) return;
    if (statsById.has(p.id)) return;
    if (statsQueue.has(p.id)) return;
    // Create a placeholder immediately so badges render with "…" instead of disappearing.
    statsById.set(p.id, { comments: 0, reposts: 0, zaps: 0, likes: 0, sats: 0, finalized: false });
    tick++;
    statsQueue.add(p.id);
    void loadStatsFor(p).finally(() => statsQueue.delete(p.id));
  }

  async function refreshStatsFor(p: Post): Promise<void> {
    statsById.delete(p.id);
    await loadStatsFor(p);
  }

  async function loadStatsFor(p: Post): Promise<void> {
    const existing = statsById.get(p.id);
    if (existing?.finalized) return;
    // If a previous attempt got stuck, allow retry by overwriting.
    statsById.set(p.id, { comments: 0, reposts: 0, zaps: 0, likes: 0, sats: 0, finalized: false });
    tick++;

    try {
      const ndk = await ensureNdk();

      // Use fetchEvents for reliability (avoids EOSE issues and "all zeros" UI).
      const [evsE, evsQ, evsZ] = await Promise.all([
        ndk.fetchEvents({ kinds: [NOSTR_KINDS.note, NOSTR_KINDS.repost, NOSTR_KINDS.nip37_edit, NOSTR_KINDS.reaction], '#e': [p.id], limit: 1200 } as any),
        ndk.fetchEvents({ kinds: [NOSTR_KINDS.note], '#q': [p.id], limit: 600 } as any),
        ndk.fetchEvents({ kinds: [NOSTR_KINDS.nip57_zap_receipt], '#p': [p.pubkey], limit: 1600 } as any),
      ]);

      const eArr = Array.from(evsE || []);
      const qArr = Array.from(evsQ || []);
      const zArr = Array.from(evsZ || []);

      let commentsCount = 0;
      let repostsCount = 0;
      let quoteRepostsCount = 0;
      let likesCount = 0;
      let zapsCount = 0;
      let satsSum = 0;
      const emojis: string[] = [];
      let latestEdit: { at: number; content: string } | null = null;

      for (const ev of eArr as any[]) {
        if (ev.kind === NOSTR_KINDS.note) {
          if (ev.id === p.id) continue;
          const tags = (ev.tags as string[][]) || [];
          const isQuote = tags.some((t) => t[0] === 'q' && t[1] === p.id);
          if (!isQuote) commentsCount += 1;
        } else if (ev.kind === NOSTR_KINDS.repost) {
          repostsCount += 1;
        } else if (ev.kind === NOSTR_KINDS.reaction) {
          if (!isLikeReactionContent(ev.content)) continue;
          likesCount += 1;
          if ($myPubkey && ev.pubkey === $myPubkey) {
            if (!myLikesById.has(p.id)) {
              myLikesById.set(p.id, { at: Date.now() });
              myTick++;
            }
          }
        } else if (ev.kind === NOSTR_KINDS.nip37_edit) {
          if (ev.pubkey !== p.pubkey) continue;
          const at = ev.created_at || 0;
          if (!latestEdit || at > latestEdit.at) latestEdit = { at, content: ev.content || '' };
        }
      }

      // Quotes (kind 1 with q tag)
      for (const ev of qArr as any[]) {
        if (!ev?.id) continue;
        if (ev.id === p.id) continue;
        quoteRepostsCount += 1;
      }

      // Zaps (query by recipient pubkey and filter client-side by embedded e tags)
      for (const ev of zArr as any[]) {
        const parsed = parseZapReceipt(ev);
        if (!parsed?.eTags?.includes(p.id)) continue;
        zapsCount += 1;
        satsSum += parsed.amountSats ?? 0;
        const c = (parsed.comment || '').trim();
        if (c && c.length <= 8 && !emojis.includes(c)) emojis.unshift(c);
        if (emojis.length > 6) emojis.length = 6;
      }

      statsById.set(p.id, {
        comments: commentsCount,
        reposts: repostsCount + quoteRepostsCount,
        zaps: zapsCount,
        likes: likesCount,
        sats: satsSum,
        zapEmojis: emojis.length ? emojis : undefined,
        finalized: true,
        editedContent: latestEdit?.content?.trim() ? latestEdit.content.trim() : undefined,
        editedAt: latestEdit?.at,
      });
      tick++;
    } catch {
      // ignore stats failures
    }
  }

  let likeBusy = false;
  async function doLike(p: Post) {
    if (!p?.id) return;
    if (!$canSign) {
      showToast('Connect a signer to like.');
      return;
    }
    if (getMyLike(p.id)) return;
    likeBusy = true;
    try {
      await publishReaction({ eventId: p.id, eventPubkey: p.pubkey, content: '+' });
      noteMyLike(p.id);
    } catch (e) {
      showToast(e instanceof Error ? e.message : String(e));
    } finally {
      likeBusy = false;
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

      // Prefetch stats for the newest slice (so `/me` and initial load show counts immediately).
      if (opts?.initial) {
        const n = Math.max(20, Math.min(50, Math.max(30, limit)));
        for (const p of posts.slice(0, n)) void loadStatsFor(p);
      }

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
    if (!$canSign) {
      publishError = 'Connect a signer to post.';
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
    if (!$canSign) {
      commentError = 'Connect a signer to comment.';
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
    if (!$canSign) {
      editError = 'Connect a signer to edit.';
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
    if (!$canSign) {
      repostComposeError = 'Connect a signer to repost.';
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
      noteMyRepost(repostComposeFor.id);
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
    if (!$canSign) {
      repostComposeError = 'Connect a signer to repost.';
      return;
    }
    repostComposeBusy = true;
    try {
      await publishQuoteRepost({ eventId: repostComposeFor.id, eventPubkey: repostComposeFor.pubkey, quote: repostQuote });
      noteMyRepost(repostComposeFor.id, repostQuote);
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
    if (toastTimer) clearTimeout(toastTimer);
    if (trendingTimer) clearTimeout(trendingTimer);
    if (stop) stop();
    if (io) io.disconnect();
  });
</script>

<div class="grid" style="gap: 1rem;">
  {#if toast}
    <div class="card" style="padding: 0.85rem 1rem; border-color: rgba(139,92,246,0.22);">
      <div class="muted">{toast}</div>
    </div>
  {/if}
  {#if showComposer}
    <div class="card" style="padding: 1rem;">
      <div style="font-weight: 950;">Post</div>
      <div class="muted" style="margin-top: 0.35rem; line-height:1.55;">
        Publish a note to Nostr. Comments are replies. Zaps are Lightning payments with optional emoji attachments.
      </div>
      <div style="margin-top: 0.75rem;">
        <textarea
          class="textarea"
          bind:this={newPostEl}
          bind:value={newPost}
          placeholder="Share an update, drop a link, announce a listing…"
        ></textarea>
        <div style="margin-top:0.65rem; display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
          <EmojiPicker on:pick={(e) => (newPost = insertAtCursor(newPostEl, newPost, e.detail.emoji))} />
          <button class="btn primary" disabled={publishBusy || !newPost.trim()} on:click={doPublishPost}>
            {publishBusy ? 'Publishing…' : 'Publish'}
          </button>
          {#if publishError}<span class="muted" style="color:var(--danger);">{publishError}</span>{/if}
        </div>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="card" style="padding: 1rem; border-color: rgba(251,113,133,0.35);">
      <div class="muted">{error}</div>
    </div>
  {/if}

  <div class="feed">
    {#each posts as p (p.id)}
      {@const prof = $profileByPubkey[p.pubkey]}
      {@const name = prof?.display_name || prof?.name || npubFor(p.pubkey).slice(0, 12) + '…'}
      {@const _ensure = (ensureStatsFor(p), 0)}
      {@const st = getStats(p.id)}
      {@const mz = getMyZap(p.id)}
      {@const mr = getMyRepost(p.id)}
      {@const ml = getMyLike(p.id)}
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
          <ContentBody text={body} maxUrls={4} />
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
            {#if st?.finalized}
              <button class="badgeBtn" on:click={() => openComments(p)} aria-label={`${st.comments} comments`}>
                {st.comments}
              </button>
            {:else if st}
              <button class="badgeBtn" on:click={() => openComments(p)} aria-label="Loading comments">…</button>
            {/if}
          </div>

          <div class="aw" title="Likes">
            <button
              class="iconBtn likeBtn"
              class:liked={Boolean(ml)}
              disabled={likeBusy || Boolean(ml)}
              on:click={() => void doLike(p)}
              aria-label="Like"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 21s-7-4.6-9.5-8.3C.5 9.8 2.3 6.5 6 6.1c2-.2 3.4.9 4 2 0 0 .9-2.4 4-2 3.7.4 5.5 3.7 3.5 6.6C19 16.4 12 21 12 21z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </button>
            {#if st?.finalized}
              <button class="badgeBtn" disabled={true} aria-label={`${st.likes} likes`}>
                {st.likes}
              </button>
            {:else if st}
              <button class="badgeBtn" disabled={true} aria-label="Loading likes">…</button>
            {/if}
          </div>

          <div class="aw" title="Zaps">
            <button class="iconBtn primary" class:sent={Boolean(mz)} on:click={() => (zapOpenFor = p)} aria-label="Zap">
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
            {#if st?.finalized}
              <button
                class="badgeBtn"
                title={`${st.sats.toLocaleString()} sats`}
                on:click={() => openZaps(p)}
                aria-label={`${st.zaps} zaps`}
              >
                {st.zaps}
              </button>
            {:else if st}
              <button class="badgeBtn" on:click={() => openZaps(p)} aria-label="Loading zaps">…</button>
            {/if}
          </div>

          <div class="aw" title="Reposts">
            <button
              class="iconBtn"
              class:sent={Boolean(mr)}
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
            {#if st?.finalized}
              <button class="badgeBtn" on:click={() => openReposts(p)} aria-label={`${st.reposts} reposts`}>
                {st.reposts}
              </button>
            {:else if st}
              <button class="badgeBtn" on:click={() => openReposts(p)} aria-label="Loading reposts">…</button>
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

        {#if st && (st.sats > 0 || (st.zapEmojis && st.zapEmojis.length))}
          <div class="zapMetaRow" aria-label="Zap totals">
            {#if st.sats > 0}
              <span class="pill muted">⚡ {st.sats.toLocaleString()} sats</span>
            {/if}
            {#if st.zapEmojis?.length}
              <span class="pill muted" title="Emoji attachments">{st.zapEmojis.slice(0, 6).join(' ')}</span>
            {/if}
          </div>
        {/if}

        {#if mz || mr || ml}
          <div class="myRow" aria-label="Your recent actions">
            {#if ml}
              <span class="pill muted myPill" title="Your like">🧡 Liked</span>
            {/if}
            {#if mz}
              <span class="pill myPill" title="Your zap">
                ⚡ You zapped {mz.amountSats.toLocaleString()} sats{mz.comment ? ` ${mz.comment}` : ''}
              </span>
            {/if}
            {#if mr}
              <span class="pill muted myPill" title="Your repost">
                🔁 Reposted{mr.quote ? ' (quote)' : ''}{mr.quote ? `: ${mr.quote.slice(0, 42)}${mr.quote.length > 42 ? '…' : ''}` : ''}
              </span>
            {/if}
          </div>
        {/if}
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

    <textarea
      class="textarea"
      bind:this={commentEl}
      bind:value={commentText}
      placeholder="Write a comment (public)…"
    ></textarea>
    <div style="margin-top: 0.65rem; display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
      <EmojiPicker on:pick={(e) => (commentText = insertAtCursor(commentEl, commentText, e.detail.emoji))} />
      <button class="btn primary" disabled={commentBusy || !commentText.trim()} on:click={postComment}>
        {commentBusy ? 'Posting…' : 'Post comment'}
      </button>
      {#if commentError}<span class="muted" style="color:var(--danger);">{commentError}</span>{/if}
    </div>

    <div style="margin-top: 1rem; display:grid; gap:0.6rem;">
      {#each comments as c (c.id)}
        {@const cp = $profileByPubkey[c.pubkey]}
        {@const cName = cp?.display_name || cp?.name || npubFor(c.pubkey).slice(0, 18) + '…'}
        {@const cmz = getMyZap(c.id)}
        {@const cmr = getMyRepost(c.id)}
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
          <div style="margin-top: 0.45rem; line-height: 1.5;">
            <ContentBody text={c.content} maxUrls={3} compactLinks={true} />
          </div>
          <div style="margin-top:0.6rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button class="btn" on:click={() => (replyTo = { id: c.id, pubkey: c.pubkey })}>Reply</button>
            <button
              class="btn primary"
              class:sent={Boolean(cmz)}
              on:click={() => (zapPayOpenFor = { recipientPubkey: c.pubkey, recipientLabel: cName, eventId: c.id })}
            >
              Zap
            </button>
            <button class="btn" class:sent={Boolean(cmr)} on:click={() => openRepostComposer({ id: c.id, pubkey: c.pubkey, label: cName }, null)}>
              Repost / Quote
            </button>
          </div>
          {#if cmz || cmr}
            <div class="myRow" style="margin-top:0.6rem;">
              {#if cmz}
                <span class="pill myPill" title="Your zap">
                  ⚡ You zapped {cmz.amountSats.toLocaleString()} sats{cmz.comment ? ` ${cmz.comment}` : ''}
                </span>
              {/if}
              {#if cmr}
                <span class="pill muted myPill" title="Your repost">
                  🔁 Reposted{cmr.quote ? ' (quote)' : ''}
                </span>
              {/if}
            </div>
          {/if}
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
      <textarea class="textarea" bind:this={repostQuoteEl} bind:value={repostQuote} placeholder="Add your quote…"></textarea>
      <div style="margin-top:0.65rem; display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
        <EmojiPicker on:pick={(e) => (repostQuote = insertAtCursor(repostQuoteEl, repostQuote, e.detail.emoji))} />
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
                <div style="margin-top:0.5rem; line-height: 1.5;">
                  <RichText text={`${r.content.slice(0, 240)}${r.content.length > 240 ? '…' : ''}`} />
                </div>
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
    <textarea class="textarea" bind:this={editEl} bind:value={editText} placeholder="Edit your post…"></textarea>
    <div style="margin-top: 0.65rem; display:flex; gap:0.5rem; align-items:center;">
      <EmojiPicker on:pick={(e) => (editText = insertAtCursor(editEl, editText, e.detail.emoji))} />
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
  on:sent={(e) => noteMyZap(e.detail.eventId, e.detail.amountSats, e.detail.comment)}
  onClose={() => (zapOpenFor = null)}
/>

<ZapComposer
  open={Boolean(zapPayOpenFor)}
  recipientPubkey={zapPayOpenFor?.recipientPubkey || ''}
  recipientLabel={zapPayOpenFor?.recipientLabel || 'Artist'}
  eventId={zapPayOpenFor?.eventId}
  on:sent={(e) => noteMyZap(e.detail.eventId, e.detail.amountSats, e.detail.comment)}
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
  .iconBtn.sent {
    box-shadow: 0 0 0 2px rgba(246, 196, 83, 0.22);
    border-color: rgba(246, 196, 83, 0.28);
  }
  .iconBtn.liked {
    color: rgba(251, 146, 60, 0.98);
    box-shadow: 0 0 0 2px rgba(251, 146, 60, 0.18);
    border-color: rgba(251, 146, 60, 0.25);
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

  .myRow {
    margin-top: 0.65rem;
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
    align-items: center;
  }
  .myPill {
    font-size: 0.82rem;
    padding: 0.18rem 0.5rem;
  }
  .zapMetaRow {
    margin-top: 0.65rem;
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
    align-items: center;
  }

  :global(.btn.sent) {
    border-color: rgba(74, 222, 128, 0.25);
    box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.18);
  }
</style>

