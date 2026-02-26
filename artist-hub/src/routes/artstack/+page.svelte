<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { base } from '$app/paths';
  import { ensureNdk } from '$lib/stores/ndk';
  import { NOSTR_KINDS } from '$lib/nostr/constants';
  import { isAuthed, pubkey } from '$lib/stores/auth';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import { npubFor } from '$lib/nostr/helpers';
  import { signWithNip07, publishSignedEvent } from '$lib/nostr/pool';
  import ZapComposer from '$lib/components/ZapComposer.svelte';
  import EmojiPicker from '$lib/components/EmojiPicker.svelte';
  import { insertAtCursor } from '$lib/ui/text';
  import RichText from '$lib/components/RichText.svelte';

  type Post = {
    id: string;
    pubkey: string;
    content: string;
    createdAt: number;
    tags: string[];
    channel: string;
    replyCount: number;
    zapCount: number;
  };

  type Reply = {
    id: string;
    pubkey: string;
    content: string;
    createdAt: number;
  };

  const channels = [
    { id: 'general', label: 'General', desc: 'Open discussion for all artists' },
    { id: 'artcritique', label: 'Art Critique', desc: 'Share work and get feedback' },
    { id: 'gigbounty', label: 'Gig Bounties', desc: 'Post and claim paid creative tasks' },
    { id: 'showcase', label: 'Showcase', desc: 'Show off your latest creations' },
    { id: 'collab', label: 'Collaboration', desc: 'Find artists to work with' },
    { id: 'tech', label: 'Tools & Tech', desc: 'Software, hardware, and workflow tips' },
    { id: 'bitcoin', label: 'Bitcoin & Art', desc: 'Where bitcoin culture meets creativity' },
  ];

  let activeChannel = 'general';
  let posts: Post[] = [];
  let loading = true;
  let stop: (() => void) | null = null;

  let selectedPost: Post | null = null;
  let replies: Reply[] = [];
  let replyStop: (() => void) | null = null;

  let newPostContent = '';
  let newPostEl: HTMLTextAreaElement | null = null;
  let newPostTags = '';
  let postBusy = false;
  let postError: string | null = null;

  let replyText = '';
  let replyEl: HTMLInputElement | null = null;
  let replyBusy = false;

  let sortBy: 'recent' | 'zaps' = 'recent';

  let zapOpen = false;
  let zapTarget = '';
  let zapLabel = '';
  let zapEventId = '';

  function postChannel(post: Post): string {
    return post.channel || 'general';
  }

  $: filteredPosts = posts
    .filter((p) => postChannel(p) === activeChannel)
    .sort((a, b) => {
      if (sortBy === 'zaps') return b.zapCount - a.zapCount || b.createdAt - a.createdAt;
      return b.createdAt - a.createdAt;
    });

  async function loadPosts() {
    if (stop) stop();
    loading = true;
    posts = [];
    const ndk = await ensureNdk();

    const sub = ndk.subscribe(
      { kinds: [NOSTR_KINDS.note], '#t': ['ArtStack'], limit: 300 },
      { closeOnEose: false },
    );

    sub.on('event', (ev) => {
      const tags = (ev.tags as string[][]).filter((t) => t[0] === 't').map((t) => t[1]);
      const channel = tags.find((t) => channels.some((c) => c.id === t.toLowerCase()))?.toLowerCase() || 'general';
      void fetchProfileFor(ev.pubkey!);

      const post: Post = {
        id: ev.id!,
        pubkey: ev.pubkey!,
        content: ev.content || '',
        createdAt: ev.created_at!,
        tags: tags.filter((t) => t.toLowerCase() !== 'artstack'),
        channel,
        replyCount: 0,
        zapCount: 0,
      };

      posts = [post, ...posts.filter((p) => p.id !== post.id)]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 500);
    });

    sub.on('eose', () => (loading = false));
    stop = () => sub.stop();
  }

  async function selectPost(post: Post) {
    if (replyStop) replyStop();
    replies = [];
    selectedPost = post;

    const ndk = await ensureNdk();
    const sub = ndk.subscribe(
      [
        { kinds: [NOSTR_KINDS.note], '#e': [post.id], limit: 100 },
        { kinds: [NOSTR_KINDS.nip57_zap_receipt], '#e': [post.id], limit: 50 },
      ] as any,
      { closeOnEose: false },
    );

    sub.on('event', (cev) => {
      if (cev.kind === NOSTR_KINDS.note) {
        void fetchProfileFor(cev.pubkey!);
        const reply: Reply = { id: cev.id!, pubkey: cev.pubkey!, content: cev.content || '', createdAt: cev.created_at! };
        replies = [...replies.filter((r) => r.id !== reply.id), reply].sort((a, b) => a.createdAt - b.createdAt);
        const p = posts.find((pp) => pp.id === post.id);
        if (p) p.replyCount = replies.length;
        posts = [...posts];
      }
      if (cev.kind === NOSTR_KINDS.nip57_zap_receipt) {
        const p = posts.find((pp) => pp.id === post.id);
        if (p) p.zapCount += 1;
        posts = [...posts];
      }
    });

    replyStop = () => sub.stop();
  }

  async function publishPost() {
    postError = null;
    if (!$isAuthed || !$pubkey) { postError = 'Connect your signer first.'; return; }
    if (!newPostContent.trim()) { postError = 'Write something first.'; return; }
    postBusy = true;

    try {
      const extraTags = newPostTags.split(',').map((s) => s.trim().replace(/^#/, '')).filter(Boolean);
      const tags: string[][] = [
        ['t', 'ArtStack'],
        ['t', activeChannel],
      ];
      for (const t of extraTags) tags.push(['t', t]);

      const unsigned = {
        kind: NOSTR_KINDS.note,
        created_at: Math.floor(Date.now() / 1000),
        content: newPostContent.trim(),
        tags,
        pubkey: $pubkey,
      };
      const signed = await signWithNip07(unsigned as any);
      await publishSignedEvent(signed as any);
      newPostContent = '';
      newPostTags = '';
    } catch (e) {
      postError = e instanceof Error ? e.message : String(e);
    } finally {
      postBusy = false;
    }
  }

  async function publishReply() {
    if (!selectedPost || !replyText.trim() || !$isAuthed) return;
    replyBusy = true;
    try {
      const pk = $pubkey;
      if (!pk) throw new Error('Connect a signer (or create an in-app key) first.');
      const unsigned = {
        kind: NOSTR_KINDS.note,
        created_at: Math.floor(Date.now() / 1000),
        content: replyText.trim(),
        tags: [
          ['e', selectedPost.id, '', 'root'],
          ['t', 'ArtStack'],
        ],
        pubkey: pk,
      };
      const signed = await signWithNip07(unsigned as any);
      await publishSignedEvent(signed as any);
      replyText = '';
    } catch {
      // silently fail
    } finally {
      replyBusy = false;
    }
  }

  onMount(() => void loadPosts());
  onDestroy(() => {
    if (stop) stop();
    if (replyStop) replyStop();
  });
</script>

<div class="artstack-hero card">
  <div class="hero-inner">
    <h1 class="hero-title">ArtStack</h1>
    <p class="muted hero-desc">
      A decentralized forum for artists. Post threads, share work, request critiques, post bounties, and
      support others with Lightning zaps. All posts are Nostr events — compatible with any Nostr client.
    </p>
  </div>
</div>

<div class="layout" style="margin-top: 1rem;">
  <aside class="sidebar">
    <div class="sidebar-section">
      <div class="sidebar-label muted">Channels</div>
      {#each channels as ch}
        <button
          class="channel-btn"
          class:active={activeChannel === ch.id}
          on:click={() => { activeChannel = ch.id; selectedPost = null; }}
        >
          <div class="channel-name">{ch.label}</div>
          <div class="channel-desc muted">{ch.desc}</div>
        </button>
      {/each}
    </div>

    <div class="sidebar-section" style="margin-top: 0.75rem;">
      <div class="sidebar-label muted">Sort</div>
      <div style="display: flex; gap: 0.35rem;">
        <button class="btn" class:primary={sortBy === 'recent'} style="flex: 1; font-size: 0.85rem;" on:click={() => (sortBy = 'recent')}>Recent</button>
        <button class="btn" class:primary={sortBy === 'zaps'} style="flex: 1; font-size: 0.85rem;" on:click={() => (sortBy = 'zaps')}>Top Zaps</button>
      </div>
    </div>
  </aside>

  <div class="main-content">
    {#if $isAuthed}
      <div class="card compose-card">
        <textarea
          class="textarea"
          bind:this={newPostEl}
          bind:value={newPostContent}
          placeholder="Share a thought, ask for feedback, post a bounty..."
          style="min-height: 80px;"
        ></textarea>
        <div class="compose-footer">
          <EmojiPicker on:pick={(e) => (newPostContent = insertAtCursor(newPostEl, newPostContent, e.detail.emoji))} />
          <input class="input" style="max-width: 280px;" bind:value={newPostTags} placeholder="Tags: #Commission, #Feedback..." />
          <button class="btn primary" disabled={postBusy || !newPostContent.trim()} on:click={publishPost}>
            {postBusy ? 'Posting...' : 'Post to #' + activeChannel}
          </button>
        </div>
        {#if postError}
          <div class="muted" style="margin-top: 0.5rem; color: var(--danger);">{postError}</div>
        {/if}
      </div>
    {:else}
      <div class="card" style="padding: 0.85rem 1rem; border-color: rgba(246,196,83,0.3);">
        <div class="muted">Connect your Nostr signer to post and reply.</div>
      </div>
    {/if}

    {#if loading}
      <div class="card" style="padding: 1rem; margin-top: 0.75rem;">
        <div class="muted">Loading posts from relays...</div>
      </div>
    {/if}

    <div class="posts-list">
      {#each filteredPosts as post (post.id)}
        <button
          class="card post-card"
          class:active={selectedPost?.id === post.id}
          on:click={() => selectPost(post)}
        >
          <div class="post-header">
            <div class="post-author">
              {#if $profileByPubkey[post.pubkey]?.picture}
                <img src={$profileByPubkey[post.pubkey].picture} alt="" class="post-avatar" loading="lazy" />
              {:else}
                <div class="post-avatar post-avatar-placeholder"></div>
              {/if}
              <div>
                <div class="post-name">
                  {$profileByPubkey[post.pubkey]?.display_name || $profileByPubkey[post.pubkey]?.name || npubFor(post.pubkey).slice(0, 14) + '...'}
                </div>
                <div class="muted post-time">{new Date(post.createdAt * 1000).toLocaleString()}</div>
              </div>
            </div>
            <div class="post-stats">
              {#if post.zapCount > 0}
                <span class="pill stat-zap">⚡ {post.zapCount}</span>
              {/if}
              {#if post.replyCount > 0}
                <span class="pill muted stat-reply">{post.replyCount} replies</span>
              {/if}
            </div>
          </div>

          <div class="post-content"><RichText text={post.content} linksAs="span" /></div>

          {#if post.tags.length}
            <div class="post-tags">
              {#each post.tags.slice(0, 5) as t}
                <span class="pill muted" style="font-size: 0.75rem; padding: 0.12rem 0.4rem;">#{t}</span>
              {/each}
            </div>
          {/if}
        </button>
      {/each}
      {#if !loading && filteredPosts.length === 0}
        <div class="card" style="padding: 1.5rem; text-align: center;">
          <div class="muted">No posts in #{activeChannel} yet. Be the first to start a conversation!</div>
        </div>
      {/if}
    </div>
  </div>

  <div class="detail-panel">
    {#if selectedPost}
      <div class="card" style="padding: 1rem;">
        <div class="detail-header">
          <div class="post-author">
            {#if $profileByPubkey[selectedPost.pubkey]?.picture}
              <img src={$profileByPubkey[selectedPost.pubkey].picture} alt="" class="post-avatar" loading="lazy" />
            {:else}
              <div class="post-avatar post-avatar-placeholder"></div>
            {/if}
            <div>
              <a class="post-name" href={`${base}/profile/${npubFor(selectedPost.pubkey)}`} style="text-decoration: underline;">
                {$profileByPubkey[selectedPost.pubkey]?.display_name || $profileByPubkey[selectedPost.pubkey]?.name || 'Artist'}
              </a>
              <div class="muted post-time">{new Date(selectedPost.createdAt * 1000).toLocaleString()}</div>
            </div>
          </div>
          <button
            class="btn primary"
            style="font-size: 0.85rem;"
            on:click={() => { zapTarget = selectedPost?.pubkey ?? ''; zapLabel = $profileByPubkey[selectedPost?.pubkey ?? '']?.display_name || 'Artist'; zapEventId = selectedPost?.id ?? ''; zapOpen = true; }}
          >
            Zap
          </button>
        </div>

        <div class="detail-content"><RichText text={selectedPost.content} /></div>

        <div class="replies-section">
          <div style="font-weight: 850; margin-bottom: 0.5rem;">Replies ({replies.length})</div>

          <div class="replies-list">
            {#each replies as r (r.id)}
              <div class="reply-card">
                <div class="reply-header">
                  <span class="reply-name">
                    {$profileByPubkey[r.pubkey]?.display_name || $profileByPubkey[r.pubkey]?.name || npubFor(r.pubkey).slice(0, 14) + '...'}
                  </span>
                  <span class="muted reply-time">{new Date(r.createdAt * 1000).toLocaleString()}</span>
                </div>
                <div class="reply-content"><RichText text={r.content} /></div>
              </div>
            {/each}
          </div>

          {#if $isAuthed}
            <div style="display: flex; gap: 0.5rem; margin-top: 0.65rem;">
              <EmojiPicker on:pick={(e) => (replyText = insertAtCursor(replyEl, replyText, e.detail.emoji))} />
              <input
                class="input"
                bind:this={replyEl}
                bind:value={replyText}
                placeholder="Reply..."
                on:keydown={(e) => e.key === 'Enter' && publishReply()}
              />
              <button class="btn primary" disabled={replyBusy || !replyText.trim()} on:click={publishReply}>Reply</button>
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <div class="card" style="padding: 2rem 1.5rem; text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💬</div>
        <div class="muted">Select a post to view details and replies.</div>
      </div>
    {/if}
  </div>
</div>

<ZapComposer
  open={zapOpen}
  recipientPubkey={zapTarget}
  recipientLabel={zapLabel}
  eventId={zapEventId}
  onClose={() => (zapOpen = false)}
/>

<style>
  .artstack-hero {
    padding: 1.5rem 1.3rem;
    text-align: center;
    border-color: rgba(56, 189, 248, 0.2);
    background: linear-gradient(180deg, rgba(56, 189, 248, 0.06), rgba(255, 255, 255, 0.04));
  }
  .hero-inner { max-width: 560px; margin: 0 auto; }
  .hero-title { font-size: 1.7rem; font-weight: 950; margin: 0; }
  .hero-desc { margin: 0.5rem 0 0; line-height: 1.55; }
  .layout {
    display: grid;
    grid-template-columns: 200px 1fr 1fr;
    gap: 1rem;
  }
  .sidebar {
    position: sticky;
    top: 80px;
    align-self: start;
  }
  .sidebar-label {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.4rem;
  }
  .channel-btn {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.55rem 0.65rem;
    border-radius: 10px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    color: var(--text);
    margin-bottom: 0.2rem;
    transition: background 0.15s;
  }
  .channel-btn:hover {
    background: rgba(255, 255, 255, 0.06);
  }
  .channel-btn.active {
    background: rgba(56, 189, 248, 0.1);
    border-color: rgba(56, 189, 248, 0.25);
  }
  .channel-name { font-weight: 750; font-size: 0.9rem; }
  .channel-desc { font-size: 0.75rem; margin-top: 0.1rem; line-height: 1.3; }
  .compose-card {
    padding: 0.85rem 1rem;
    margin-bottom: 0.75rem;
  }
  .compose-footer {
    margin-top: 0.6rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }
  .posts-list {
    display: grid;
    gap: 0.5rem;
  }
  .post-card {
    padding: 0.85rem 1rem;
    text-align: left;
    cursor: pointer;
    width: 100%;
    transition: border-color 0.15s, background 0.15s;
  }
  .post-card:hover { border-color: rgba(56, 189, 248, 0.25); }
  .post-card.active {
    border-color: rgba(56, 189, 248, 0.4);
    background: rgba(56, 189, 248, 0.04);
  }
  .post-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .post-author {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }
  .post-avatar {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    border: 1px solid var(--border);
    object-fit: cover;
    flex-shrink: 0;
  }
  .post-avatar-placeholder {
    background: rgba(255, 255, 255, 0.06);
  }
  .post-name { font-weight: 750; font-size: 0.9rem; }
  .post-time { font-size: 0.75rem; }
  .post-stats { display: flex; gap: 0.3rem; flex-shrink: 0; }
  .stat-zap {
    background: rgba(246, 196, 83, 0.12);
    border-color: rgba(246, 196, 83, 0.25);
    color: var(--accent);
    font-size: 0.78rem;
  }
  .stat-reply { font-size: 0.78rem; }
  .post-content {
    margin-top: 0.55rem;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .post-tags {
    margin-top: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  .detail-content {
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border);
  }
  .replies-section {
    margin-top: 0.85rem;
  }
  .replies-list {
    display: grid;
    gap: 0.45rem;
    max-height: 320px;
    overflow-y: auto;
  }
  .reply-card {
    padding: 0.55rem 0.7rem;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.15);
  }
  .reply-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.82rem;
  }
  .reply-name { font-weight: 700; }
  .reply-time { font-size: 0.75rem; }
  .reply-content {
    margin-top: 0.25rem;
    line-height: 1.45;
    font-size: 0.9rem;
    white-space: pre-wrap;
    word-break: break-word;
  }
  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
    }
    .sidebar {
      position: static;
    }
    .sidebar-section:first-child {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      align-items: center;
    }
    .sidebar-section:first-child .sidebar-label {
      width: 100%;
    }
    .channel-btn {
      flex: 0 0 auto;
      padding: 0.4rem 0.6rem;
    }
    .channel-desc {
      display: none;
    }
    .detail-panel {
      margin-top: 1rem;
    }
  }
</style>
