<script lang="ts">
  import { onMount } from 'svelte';
  import { isAuthed } from '$lib/stores/auth';
  import { startZapChallenges, zapChallenges, zapChallengesLoading } from '$lib/stores/challenges';
  import ZapChallengeCard from '$lib/components/ZapChallengeCard.svelte';
  import ZapChallengeForm from '$lib/components/ZapChallengeForm.svelte';

  let showForm = false;
  onMount(() => {
    void startZapChallenges();
  });

  $: now = Math.floor(Date.now() / 1000);
  $: live = $zapChallenges.filter((c) => c.content.startsAt <= now && c.content.endsAt >= now);
  $: upcoming = $zapChallenges.filter((c) => c.content.startsAt > now).slice(0, 20);
  $: ended = $zapChallenges.filter((c) => c.content.endsAt < now).slice(0, 20);
</script>

<div class="grid" style="gap: 0.9rem;">
  <div class="card" style="padding: 1rem;">
    <div style="display:flex; gap:1rem; align-items:flex-start; justify-content:space-between;">
      <div>
        <div style="font-weight: 950; font-size: 1.25rem;">Zap Challenges</div>
        <div class="muted" style="margin-top:0.35rem; line-height:1.55;">
          Time-boxed “zap battles” published to public relays. Leaderboards are computed from NIP-57 zap receipts in real time.
        </div>
      </div>
      <div style="display:flex; gap:0.5rem; align-items:center; justify-content:flex-end;">
        {#if $isAuthed}
          <button class="btn primary" on:click={() => (showForm = !showForm)}>
            {showForm ? 'Close' : 'Create'}
          </button>
        {:else}
          <span class="pill muted">Connect to create</span>
        {/if}
      </div>
    </div>
  </div>

  {#if showForm}
    <ZapChallengeForm />
  {/if}

  {#if $zapChallengesLoading && !$zapChallenges.length}
    <div class="muted">Loading challenges from relays…</div>
  {/if}

  {#if live.length}
    <div style="font-weight: 950; margin-top: 0.25rem;">Live now</div>
    <div class="grid cards">
      {#each live as c (c.address)}
        <ZapChallengeCard challenge={c} />
      {/each}
    </div>
  {/if}

  {#if upcoming.length}
    <div style="font-weight: 950; margin-top: 0.25rem;">Upcoming</div>
    <div class="grid cards">
      {#each upcoming as c (c.address)}
        <ZapChallengeCard challenge={c} />
      {/each}
    </div>
  {/if}

  {#if ended.length}
    <div style="font-weight: 950; margin-top: 0.25rem;">Recently ended</div>
    <div class="grid cards">
      {#each ended as c (c.address)}
        <ZapChallengeCard challenge={c} />
      {/each}
    </div>
  {/if}

  {#if !$zapChallenges.length && !$zapChallengesLoading}
    <div class="muted">No challenges found yet. Create the first one.</div>
  {/if}
</div>

<style>
  .cards {
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 0.8rem;
  }
  @media (min-width: 800px) {
    .cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (min-width: 1100px) {
    .cards {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>

