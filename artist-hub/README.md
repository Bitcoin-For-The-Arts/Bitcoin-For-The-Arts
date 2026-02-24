## Bitcoin for the Arts — Artist Hub (Fully Decentralized)

This is a **SvelteKit + TypeScript** single-page app that implements a **Bitcoin-native, Nostr-hosted** Artist Hub:

- **Auth**: NIP-07 browser signers (Alby / nos2x) — no email/password
- **Profiles**: `kind:0` metadata (+ optional `skills/hashtags/portfolio` extensions)
- **Listings**:
  - **NIP-15** marketplace: stalls (`kind:30017`) + products/services (`kind:30018`)
  - **NIP-99** classifieds: one-offs/collab requests (`kind:30402`)
- **Messaging**: encrypted DMs via **NIP-04** (`kind:4`)
- **Payments**: WebLN invoices + **NIP-57** zaps (when receiver supports zaps)
- **Curation**: “Featured Artists” via **NIP-51** curated sets (`kind:30004`)

All data lives on public relays as signed events. There is **no backend API** and **no server-side storage**.

## Routes

- `/artist-hub/discover`: search + category/tag filters across relays
- `/artist-hub/listing/<eventId>`: listing detail, comments, zap/pay, message artist
- `/artist-hub/profile/<npub>`: profile view + their listings
- `/artist-hub/create`: publish a listing (NIP-15 or NIP-99)
- `/artist-hub/messages`: decrypt + read/send NIP-04 DMs
- `/artist-hub/featured`: admin-curated featured list
- `/artist-hub/me`: publish your profile (kind:0) + see your listings

## Nostr relays

Default relay set is in `src/lib/nostr/constants.ts` and can be overridden at build time:

- `PUBLIC_BFTA_RELAYS=wss://nostr.wine,wss://purplepag.es,...`

Relay URLs are also cached client-side in `localStorage` (`bfta:artist-hub:relays`).

## Featured Artists (BFTA admin)

Set the admin npub at build time:

- `PUBLIC_BFTA_ADMIN_NPUB=npub1...`

Admins can publish the featured list from `/artist-hub/featured`, which writes a **NIP-51 curated set**:

- `kind:30004`
- `d=bfta-featured-artists`
- `p` tags for featured artist pubkeys

## Local development (standalone)

Run the hub at the root path (no `/artist-hub` base) for convenience:

```bash
cd artist-hub
npm install
BASE_PATH="" npm run dev
```

## Local development (integrated into the BFTA website)

From repo root:

```bash
npm install
npm run artist-hub:build
npm run dev
```

Then visit `/artist-hub`.

## Deployment

The root website build runs `node scripts/build-artist-hub.mjs` during `prebuild`, which:

- installs `artist-hub/` dependencies
- builds a static bundle (`adapter-static` + SPA fallback)
- copies output into `public/artist-hub/`

So deploying the Next.js site automatically deploys the Artist Hub at `/artist-hub`.

