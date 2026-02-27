<script lang="ts">
  import { browser } from '$app/environment';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { env as publicEnv } from '$env/dynamic/public';
  import { connectNostr, disconnectNostr, isAuthed, npub, authError, hasNip07, authMode, canSign } from '$lib/stores/auth';
  import { ndkError, ndkStatus, reconnectNdk } from '$lib/stores/ndk';
  import { openOnboarding } from '$lib/stores/onboarding';
  import { unreadCount } from '$lib/stores/notifications';
  import GlobalSearch from '$lib/components/GlobalSearch.svelte';

  let mobileMenuOpen = false;
  let searchOpen = false;
  const mainSiteUrl = ((((publicEnv as any).PUBLIC_MAIN_SITE_URL as string | undefined) || 'https://bitcoinforthearts.org') + '').trim();

  const nav = [
    { href: '/discover', label: 'Discover', icon: '🔍' },
    { href: '/packs', label: 'Packs', icon: '📦' },
    { href: '/pulse', label: 'Pulse', icon: '🫀' },
    { href: '/streams', label: 'Streams', icon: '📺' },
    { href: '/live', label: 'Live', icon: '📡' },
    { href: '/studios', label: 'Studios', icon: '🏛️' },
    { href: '/events', label: 'Events', icon: '📅' },
    { href: '/challenges', label: 'Challenges', icon: '🏆' },
    { href: '/artstack', label: 'ArtStack', icon: '💬' },
    { href: '/featured', label: 'Featured', icon: '⭐' },
    { href: '/create', label: 'Create', icon: '✨' },
    { href: '/messages', label: 'Messages', icon: '✉️' },
    { href: '/me', label: 'Me', icon: '👤' },
  ];

  function isActive(pathname: string, href: string): boolean {
    const full = `${base}${href}`;
    return pathname === full || pathname.startsWith(`${full}/`);
  }

  function toggleMobile() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function toggleSearch() {
    searchOpen = !searchOpen;
  }

  function handleConnect() {
    if (browser && !window.nostr?.getPublicKey) {
      openOnboarding();
      return;
    }
    void connectNostr();
  }
</script>

<header class="header">
  <div class="container inner">
    <div class="brand">
      <div class="logo" aria-label="Bitcoin for the Arts — Artist Hub">
        <a class="logo-img-link" href={mainSiteUrl} aria-label="Back to Bitcoin for the Arts main website">
          <img class="logo-img" src={`${base}/bfta-logo.png`} alt="Bitcoin for the Arts, Inc." width="44" height="44" />
        </a>
        <a class="logo-home-link" href={`${base}/`} aria-label="Artist Hub home">
          <span class="logo-title">Artist Hub</span>
        </a>
      </div>
      <span class="muted status">
        <span class="status-dot" class:connected={$ndkStatus === 'connected'}></span>
        {$ndkStatus}
      </span>
      {#if $ndkStatus === 'error'}
        <button class="pill muted" style="cursor:pointer;" on:click={() => void reconnectNdk()} title={$ndkError || 'Reconnect'}>
          Reconnect
        </button>
      {/if}
    </div>

    <nav class="nav">
      {#each nav as item}
        <a class={`navlink ${isActive($page.url.pathname, item.href) ? 'active' : ''}`} href={`${base}${item.href}`}
          >{item.label}</a
        >
      {/each}
    </nav>

    <div class="auth">
      {#if $isAuthed}
        <a class="bell" href={`${base}/notifications`} aria-label="Notifications" title="Notifications">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            ></path>
            <path
              d="M13.73 21a2 2 0 01-3.46 0"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            ></path>
          </svg>
          {#if $unreadCount > 0}
            <span class="badge" aria-label={`${$unreadCount} unread notifications`}>
              {$unreadCount > 99 ? '99+' : $unreadCount}
            </span>
          {/if}
        </a>
        <span class="pill muted mono" title={$npub ?? ''}>
          {($npub ?? '').slice(0, 10)}…{($npub ?? '').slice(-8)}
        </span>
        {#if !$canSign}
          <span class="pill muted" title="Read-only profile (no signer)">Read-only</span>
        {/if}
        <button class="btn" on:click={() => openOnboarding()}>Switch</button>
        <button class="btn" on:click={disconnectNostr}>Log out</button>
      {:else}
        <button class="btn primary" on:click={handleConnect}>{$hasNip07 ? 'Connect' : 'Get started'}</button>
      {/if}
      <button class="btn search-toggle" on:click={toggleSearch} aria-label="Search" title="Search">
        🔎
      </button>
      <button class="btn mobile-toggle" on:click={toggleMobile} aria-label="Toggle menu">
        {mobileMenuOpen ? '✕' : '☰'}
      </button>
    </div>
  </div>

  {#if searchOpen}
    <div class="container search-pop">
      <div class="card" style="padding: 0.85rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap: 0.75rem; flex-wrap:wrap;">
          <div style="font-weight: 900;">Search</div>
          <button class="pill muted" style="cursor:pointer;" on:click={() => (searchOpen = false)}>Close</button>
        </div>
        <div style="margin-top: 0.65rem;">
          <GlobalSearch placeholder="Search people (name or npub)…" />
        </div>
      </div>
    </div>
  {/if}

  {#if mobileMenuOpen}
    <nav class="mobile-nav container">
      {#each nav as item}
        <a
          class={`navlink ${isActive($page.url.pathname, item.href) ? 'active' : ''}`}
          href={`${base}${item.href}`}
          on:click={() => (mobileMenuOpen = false)}
          >{item.icon} {item.label}</a
        >
      {/each}
    </nav>
  {/if}

  {#if $authError}
    <div class="container" style="margin-top: 0.6rem;">
      <div class="card" style="padding: 0.8rem 1rem; border-color: rgba(251,113,133,0.35);">
        <div class="muted">{$authError}</div>
      </div>
    </div>
  {/if}
  {#if $ndkStatus === 'error' && $ndkError}
    <div class="container" style="margin-top: 0.6rem;">
      <div class="card" style="padding: 0.8rem 1rem; border-color: rgba(251,113,133,0.35);">
        <div class="muted">Relay connection error: {$ndkError}</div>
      </div>
    </div>
  {/if}
</header>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(14px);
    background: rgba(11, 11, 15, 0.82);
    border-bottom: 1px solid var(--border);
  }
  .inner {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 0.7rem 0;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
    flex-shrink: 0;
  }
  .logo {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
  }
  .logo-img-link,
  .logo-home-link {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
  }
  .logo-img-link:hover,
  .logo-home-link:hover {
    text-decoration: none;
    opacity: 0.92;
  }
  .logo-img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
    object-fit: cover;
    flex-shrink: 0;
  }
  .logo-title {
    font-size: 1.12rem;
    font-weight: 900;
    color: var(--text);
    white-space: nowrap;
    letter-spacing: -0.2px;
    text-transform: uppercase;
  }
  .status {
    font-size: 0.78rem;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
  }
  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    flex-shrink: 0;
  }
  .status-dot.connected {
    background: #4ade80;
    box-shadow: 0 0 6px rgba(74, 222, 128, 0.5);
  }
  .nav {
    display: none;
    gap: 0.25rem;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
  .navlink {
    padding: 0.5rem 0.65rem;
    border-radius: 10px;
    border: 1px solid transparent;
    color: var(--muted);
    font-weight: 650;
    font-size: 0.88rem;
    transition:
      background 0.15s,
      color 0.15s;
    white-space: nowrap;
  }
  .navlink:hover {
    text-decoration: none;
    background: rgba(255, 255, 255, 0.06);
    color: var(--text);
  }
  .navlink.active {
    background: rgba(246, 196, 83, 0.1);
    border-color: rgba(246, 196, 83, 0.25);
    color: var(--accent);
  }
  .auth {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
    min-width: 0;
  }
  .search-pop {
    padding-bottom: 0.75rem;
  }
  .bell {
    position: relative;
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.06);
    color: var(--text);
    text-decoration: none;
  }
  .bell:hover {
    background: rgba(255, 255, 255, 0.09);
    text-decoration: none;
  }
  .bell svg {
    width: 20px;
    height: 20px;
    opacity: 0.95;
  }
  .badge {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(0, 0, 0, 0.82);
    color: var(--text);
    font-size: 0.75rem;
    font-weight: 900;
    line-height: 18px;
  }
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 0.84rem;
  }
  .mobile-toggle {
    display: flex;
    font-size: 1.15rem;
    padding: 0.4rem 0.55rem;
  }
  .mobile-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    padding-bottom: 0.75rem;
  }
  @media (min-width: 960px) {
    .nav {
      display: flex;
    }
    .mobile-toggle {
      display: none;
    }
    .mobile-nav {
      display: none;
    }
  }
  @media (max-width: 600px) {
    .logo-title {
      font-size: 0.92rem;
    }
    .logo-img {
      width: 36px;
      height: 36px;
    }
    .mono {
      display: none;
    }
  }
  @media (max-width: 420px) {
    .search-toggle {
      padding-left: 0.7rem;
      padding-right: 0.7rem;
    }
  }
</style>

