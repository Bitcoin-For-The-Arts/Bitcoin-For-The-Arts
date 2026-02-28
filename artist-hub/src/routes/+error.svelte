<script lang="ts">
  import { page } from '$app/stores';
  import { base } from '$app/paths';
</script>

<div class="card" style="padding: 2rem; margin-top: 2rem; text-align: center;">
  <div style="font-size: 1.6rem; font-weight: 950; margin-bottom: 0.75rem;">
    {$page.status ?? 'Error'}
  </div>
  <div class="muted" style="line-height: 1.55; max-width: 45ch; margin: 0 auto;">
    {$page.error?.message ?? 'Something went wrong. Please try again.'}
  </div>
  <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
    <a class="btn" href={base || '/artist-hub'}>Back to Artist Hub</a>
    <button class="btn primary" on:click={() => location.reload()}>Reload page</button>
  </div>
</div>
