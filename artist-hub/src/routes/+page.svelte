<script lang="ts">
  import { base } from '$app/paths';
</script>

<div class="card" style="padding: 1.2rem;">
  <div style="font-size: 1.45rem; font-weight: 900;">Bitcoin for the Arts • Artist Hub</div>
  <p class="muted" style="line-height: 1.5;">
    A decentralized gig + collaboration marketplace. Profiles, listings, and conversations are Nostr events signed in your browser.
    Payments happen peer-to-peer over Lightning (WebLN / zaps).
  </p>
  <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top: 0.6rem;">
    <a class="btn primary" href={`${base}/discover`}>Explore listings</a>
    <a class="btn" href={`${base}/create`}>Create a listing</a>
    <a class="btn" href={`${base}/me`}>Set up my profile</a>
  </div>
</div>

