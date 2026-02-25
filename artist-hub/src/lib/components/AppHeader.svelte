<script lang="ts">
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { connectNostr, disconnectNostr, isAuthed, npub, authError } from '$lib/stores/auth';
  import { ndkStatus } from '$lib/stores/ndk';

  const nav = [
    { href: '/discover', label: 'Discover' },
    { href: '/live', label: 'Live' },
    { href: '/studios', label: 'Studios' },
    { href: '/events', label: 'Events' },
    { href: '/featured', label: 'Featured' },
    { href: '/create', label: 'Create' },
    { href: '/messages', label: 'Messages' },
    { href: '/me', label: 'Me' },
  ];

  function isActive(pathname: string, href: string): boolean {
    const full = `${base}${href}`;
    return pathname === full || pathname.startsWith(`${full}/`);
  }
</script>

<header class="header">
  <div class="container inner">
    <div class="brand">
      <a class="logo" href={`${base}/discover`} aria-label="Artist Hub home">
        <span class="mark">B</span>
        <span>Artist Hub</span>
      </a>
      <span class="muted status">Nostr: {$ndkStatus}</span>
    </div>

    <nav class="nav">
      {#each nav as item}
        <a
          class={`navlink ${isActive($page.url.pathname, item.href) ? 'active' : ''}`}
          href={`${base}${item.href}`}
          >{item.label}</a
        >
      {/each}
    </nav>

    <div class="auth">
      {#if $isAuthed}
        <span class="pill muted mono" title={$npub ?? ''}>
          {($npub ?? '').slice(0, 10)}…{($npub ?? '').slice(-8)}
        </span>
        <button class="btn" on:click={disconnectNostr}>Disconnect</button>
      {:else}
        <button class="btn primary" on:click={() => connectNostr()}>Connect npub</button>
      {/if}
    </div>
  </div>

  {#if $authError}
    <div class="container" style="margin-top: 0.6rem;">
      <div class="card" style="padding: 0.8rem 1rem; border-color: rgba(251,113,133,0.35);">
        <div class="muted">{$authError}</div>
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
    background: rgba(11, 11, 15, 0.7);
    border-bottom: 1px solid var(--border);
  }
  .inner {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 0.9rem 0;
  }
  .brand {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    min-width: 180px;
  }
  .logo {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.2px;
  }
  .mark {
    display: inline-flex;
    width: 28px;
    height: 28px;
    border-radius: 10px;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(246, 196, 83, 0.35);
    background: linear-gradient(180deg, rgba(246, 196, 83, 0.22), rgba(246, 196, 83, 0.1));
    color: var(--accent);
  }
  .status {
    font-size: 0.85rem;
  }
  .nav {
    display: none;
    gap: 0.4rem;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
  .navlink {
    padding: 0.55rem 0.7rem;
    border-radius: 10px;
    border: 1px solid transparent;
    color: var(--muted);
    font-weight: 650;
    font-size: 0.92rem;
  }
  .navlink:hover {
    text-decoration: none;
    background: rgba(255, 255, 255, 0.06);
    color: var(--text);
  }
  .navlink.active {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--border);
    color: var(--text);
  }
  .auth {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: flex-end;
    min-width: 210px;
  }
  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
    font-size: 0.84rem;
  }
  @media (min-width: 900px) {
    .nav {
      display: flex;
    }
  }
</style>

