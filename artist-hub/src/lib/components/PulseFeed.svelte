<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { ensureNdk } from '$lib/stores/ndk';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';
  import { detectMediaType, extractUrls } from '$lib/ui/media';
  import { parseZapReceipt } from '$lib/nostr/zap-receipts';
  import { publishComment, publishEdit, publishNote, publishRepost } from '$lib/nostr/publish';
  import { isAuthed, pubkey as myPubkey } from '$lib/stores/auth';
  import Modal from '$lib/components/Modal.svelte';
  import ZapEmojiComposer from '$lib/components/ZapEmojiComposer.svelte';
  import { NOSTR_KINDS } from '$lib/nostr/constants';

  export let tags: string[] = [];
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
  let stop: (() => void) | null = null;
  const statsById = new Map<string, Stats>();
  let tick = 0; // invalidate for stats changes

  // Composer
  let newPost = '';
  let publishBusy = false;
  let publishError: string | null = null;

  // Comment modal
  let commentsOpenFor: Post | null = null;
  let comments: Array<{ id: string; pubkey: string; createdAt: number; content: string }> = [];
  let commentText = '';
  let commentBusy = false;
  let commentError: string | null = null;

  // Edit modal
  let editOpenFor: Post | null = null;
  let editText = '';
  let editBusy = false;
  let editError: string | null = null;

  // Zap modal
  let zapOpenFor: Post | null = null;

  function cleanTags(xs: string[]): string[] {
    return xs.map((t) => t.replace(/^#/, '').trim()).filter(Boolean).slice(0, 6);
  }

  function isReplyLike(ev: any): boolean {
    const tags = (ev.tags as string[][]) || [];
    return tags.some((t) => t[0] === 'e');
  }

  function getStats(id: string): Stats | null {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = tick;
    return statsById.get(id) ?? null;
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

      let commentsCount = 0;
      let repostsCount = 0;
      let zapsCount = 0;
      let satsSum = 0;
      let latestEdit: { at: number; content: string } | null = null;

      sub.on('event', (ev) => {
        if (ev.kind === NOSTR_KINDS.note) {
          if (ev.id !== p.id) commentsCount += 1;
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

      sub.on('eose', () => {
        const prev = statsById.get(p.id);
        if (!prev) return;
        statsById.set(p.id, {
          comments: commentsCount,
          reposts: repostsCount,
          zaps: zapsCount,
          sats: satsSum,
          editedContent: latestEdit?.content?.trim() ? latestEdit.content.trim() : undefined,
          editedAt: latestEdit?.at,
        });
        tick++;
      });
    } catch {
      // ignore stats failures
    }
  }

  async function start(): Promise<void> {
    error = null;
    loading = true;
    posts = [];
    if (stop) stop();
    stop = null;

    try {
      const ndk = await ensureNdk();
      const t = cleanTags(tags);
      const filter: any = { kinds: [NOSTR_KINDS.note], limit };
      if (t.length) filter['#t'] = t;

      const sub = ndk.subscribe(filter, { closeOnEose: false });
      sub.on('event', (ev) => {
        if (!ev?.id || !ev?.pubkey || !ev?.created_at) return;
        if (isReplyLike(ev)) return; // keep Pulse as a top-level timeline
        const content = (ev.content || '').trim();
        if (!content) return;

        const post: Post = {
          id: ev.id,
          pubkey: ev.pubkey,
          createdAt: ev.created_at,
          content,
          urls: extractUrls(content),
        };

        posts = [post, ...posts.filter((x) => x.id !== post.id)].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
        void fetchProfileFor(post.pubkey);
        void loadStatsFor(post);
      });
      sub.on('eose', () => (loading = false));
      stop = () => sub.stop();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
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
          .map((ev) => ({ id: ev.id, pubkey: ev.pubkey, createdAt: ev.created_at, content: (ev.content || '').trim() }))
          .filter((x) => x.content)
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 120);
        comments = out;
        for (const c of out.slice(0, 25)) void fetchProfileFor(c.pubkey);
      });
    } catch (e) {
      commentError = e instanceof Error ? e.message : String(e);
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
      await publishComment({ rootEventId: commentsOpenFor.id, content: body });
      commentText = '';
      await openComments(commentsOpenFor);
      await loadStatsFor(commentsOpenFor);
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
      await loadStatsFor(editOpenFor);
      editOpenFor = null;
    } catch (e) {
      editError = e instanceof Error ? e.message : String(e);
    } finally {
      editBusy = false;
    }
  }

  async function doRepost(p: Post) {
    if (!$isAuthed) return;
    try {
      const ndk = await ensureNdk();
      const ev = await ndk.fetchEvent(p.id);
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
      await loadStatsFor(p);
    } catch {
      // ignore (best-effort)
    }
  }

  onMount(() => void start());
  let lastKey = '';
  $: {
    const key = JSON.stringify({ tags: cleanTags(tags), limit });
    if (key !== lastKey) {
      lastKey = key;
      void start();
    }
  }

  onDestroy(() => {
    if (stop) stop();
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
              <img src={prof.picture} alt="" class="avatar" />
            {/if}
            <div class="meta">
              <div class="name">{name}</div>
              <div class="muted small">
                {new Date(p.createdAt * 1000).toLocaleString()}
                {#if st?.editedAt} • edited{/if}
              </div>
            </div>
          </div>
          <div class="stats">
            <span class="pill muted">{st ? `${st.comments} comments` : '…'}</span>
            <span class="pill muted">{st ? `${st.reposts} reposts` : '…'}</span>
            <span class="pill muted">{st ? `${st.zaps} zaps` : '…'}</span>
            <span class="pill">{st ? `${st.sats.toLocaleString()} sats` : '…'}</span>
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
                    <video src={u} controls playsinline preload="metadata"></video>
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

        <div class="actions">
          <button class="btn" on:click={() => openComments(p)}>Comment</button>
          <button class="btn primary" on:click={() => (zapOpenFor = p)}>Zap</button>
          <button class="btn" on:click={() => doRepost(p)}>Repost</button>
          {#if $myPubkey === p.pubkey}
            <button class="btn" on:click={() => openEdit(p)}>Edit</button>
          {/if}
        </div>
      </div>
    {/each}

    {#if !posts.length && !loading}
      <div class="card" style="padding: 1rem;">
        <div class="muted">No posts found yet for these tags.</div>
      </div>
    {/if}
  </div>
</div>

<Modal open={Boolean(commentsOpenFor)} title="Comments" onClose={() => (commentsOpenFor = null)}>
  {#if commentsOpenFor}
    <div class="muted" style="margin-bottom:0.75rem;">
      Replying to: <span class="pill">{commentsOpenFor.id.slice(0, 10)}…</span>
    </div>

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
        <div class="card" style="padding: 0.85rem 1rem;">
          <div class="muted" style="font-size: 0.88rem;">
            {cp?.display_name || cp?.name || npubFor(c.pubkey).slice(0, 18) + '…'} • {new Date(c.createdAt * 1000).toLocaleString()}
          </div>
          <div style="margin-top: 0.45rem; white-space: pre-wrap; line-height: 1.5;">{c.content}</div>
        </div>
      {/each}
      {#if comments.length === 0}
        <div class="muted">No comments yet.</div>
      {/if}
    </div>
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

<ZapEmojiComposer
  open={Boolean(zapOpenFor)}
  recipientPubkey={zapOpenFor?.pubkey || ''}
  recipientLabel={(zapOpenFor && ($profileByPubkey[zapOpenFor.pubkey]?.display_name || $profileByPubkey[zapOpenFor.pubkey]?.name)) || 'Artist'}
  eventId={zapOpenFor?.id}
  onClose={() => (zapOpenFor = null)}
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
  .stats {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
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
    gap: 0.5rem;
    flex-wrap: wrap;
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

