<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { nip19 } from 'nostr-tools';
  import { ensureNdk } from '$lib/stores/ndk';
  import { parseZapChallengeEvent, type ZapChallenge } from '$lib/nostr/challenges';
  import { fetchProfileFor, profileByPubkey } from '$lib/stores/profiles';
  import ZapComposer from '$lib/components/ZapComposer.svelte';
  import ZapLeaderboard from '$lib/components/ZapLeaderboard.svelte';
  import { npubFor } from '$lib/nostr/helpers';

  let challenge: ZapChallenge | null = null;
  let loading = true;
  let error: string | null = null;
  let zapOpen = false;

  async function load() {
    loading = true;
    error = null;
    challenge = null;

    try {
      const naddr = String($page.params.naddr || '');
      const decoded = nip19.decode(naddr);
      if (decoded.type !== 'naddr') throw new Error('Invalid naddr');

      const data = decoded.data as any;
      const kind = Number(data.kind);
      const pubkey = String(data.pubkey);
      const identifier = String(data.identifier);

      const ndk = await ensureNdk();
      const ev = await ndk.fetchEvent({ kinds: [kind], authors: [pubkey], '#d': [identifier] } as any);
      const parsed = ev ? parseZapChallengeEvent(ev as any) : null;
      if (!parsed) throw new Error('Challenge not found on relays (or invalid content).');

      challenge = parsed;
      void fetchProfileFor(parsed.pubkey);
      void fetchProfileFor(parsed.content.targetPubkey);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  }

  onMount(() => void load());
  $: if ($page.params.naddr) void load();

  $: host = challenge ? $profileByPubkey[challenge.pubkey] : null;
  $: hostName = host?.display_name || host?.name || (challenge ? npubFor(challenge.pubkey).slice(0, 12) + '…' : 'Host');

  $: target = challenge ? $profileByPubkey[challenge.content.targetPubkey] : null;
  $: targetName =
    (challenge?.content.targetLabel || target?.display_name || target?.name) ??
    (challenge ? npubFor(challenge.content.targetPubkey).slice(0, 12) + '…' : 'Artist');
</script>

{#if loading}
  <div class="muted">Loading challenge…</div>
{:else if error}
  <div class="card" style="padding: 1rem; border-color: rgba(251,113,133,0.35);">
    <div style="font-weight: 950;">Couldn’t load challenge</div>
    <div class="muted" style="margin-top: 0.35rem;">{error}</div>
    <div style="margin-top: 0.75rem;">
      <a class="btn" href={`${base}/challenges`}>Back to challenges</a>
    </div>
  </div>
{:else if challenge}
  <div class="grid" style="gap: 0.9rem;">
    <div class="card hero">
      {#if challenge.content.picture}
        <img src={challenge.content.picture} alt="" class="cover" />
      {/if}
      <div class="pad">
        <div style="display:flex; gap:0.6rem; align-items:flex-start; justify-content:space-between; flex-wrap:wrap;">
          <div>
            <div class="title">{challenge.content.title}</div>
            <div class="muted" style="margin-top:0.3rem;">
              Host: <span style="color:var(--text)">{hostName}</span>
            </div>
            <div class="muted" style="margin-top:0.15rem;">
              Target: <span style="color:var(--text)">{targetName}</span>
            </div>
          </div>
          <div style="display:flex; gap:0.35rem; flex-wrap:wrap; justify-content:flex-end;">
            <span class="pill muted">
              {new Date(challenge.content.startsAt * 1000).toLocaleString()} → {new Date(challenge.content.endsAt * 1000).toLocaleString()}
            </span>
            {#if challenge.content.goalSats}
              <span class="pill">Goal: {challenge.content.goalSats.toLocaleString()} sats</span>
            {/if}
          </div>
        </div>

        {#if challenge.content.about}
          <div class="muted about">{challenge.content.about}</div>
        {/if}

        <div style="margin-top: 0.85rem;" class="grid cols-2">
          <div class="card" style="padding: 0.9rem;">
            <div style="font-weight: 950;">Zap the target</div>
            <div class="muted" style="margin-top:0.35rem; line-height:1.55;">
              Your zap goes directly to the target’s Lightning address (from their kind:0 metadata). The leaderboard is
              derived from public zap receipts that reference this challenge.
            </div>
            <div style="margin-top:0.7rem;">
              <button class="btn primary" on:click={() => (zapOpen = true)}>Zap / Pay</button>
            </div>
          </div>
          <div>
            <ZapLeaderboard {challenge} />
          </div>
        </div>
      </div>
    </div>

    <div style="display:flex; gap:0.5rem; align-items:center;">
      <a class="btn" href={`${base}/challenges`}>Back</a>
      <a class="btn" href={`${base}/profile/${npubFor(challenge.content.targetPubkey)}`}>View target profile</a>
    </div>
  </div>

  <ZapComposer
    open={zapOpen}
    recipientPubkey={challenge.content.targetPubkey}
    recipientLabel={targetName}
    eventId={challenge.eventId}
    address={challenge.address}
    onClose={() => (zapOpen = false)}
  />
{/if}

<style>
  .hero {
    overflow: hidden;
  }
  .cover {
    width: 100%;
    height: 220px;
    object-fit: cover;
    display: block;
    border-bottom: 1px solid var(--border);
  }
  .pad {
    padding: 1rem;
  }
  .title {
    font-weight: 1000;
    font-size: 1.35rem;
    line-height: 1.15;
  }
  .about {
    margin-top: 0.75rem;
    line-height: 1.55;
    white-space: pre-wrap;
  }
</style>

