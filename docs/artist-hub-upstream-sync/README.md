# Artist Hub upstream sync — 2026 rebrand

The Svelte Artist Hub lives in two places:

1. **This monorepo** at `artist-hub/`. This is what the production Vercel
   build actually uses, because `scripts/build-artist-hub.mjs` prefers the
   local folder when one exists.
2. **A standalone GitHub repo** at
   [`Bitcoin-For-The-Arts/Artist-Hub`](https://github.com/Bitcoin-For-The-Arts/Artist-Hub).
   This is used as a **fallback** by the build script — if anyone runs a
   build from a checkout where the `artist-hub/` folder is missing, the
   script clones the standalone repo at `main` and uses that instead.

If only the monorepo is rebranded, the live site stays correct, but
anyone setting up a fresh build environment risks accidentally pulling
the un-rebranded fallback. To keep the two in sync, apply this patch on
top of `main` of the standalone repo.

## Apply the patch

From a clean checkout of `Bitcoin-For-The-Arts/Artist-Hub`:

```bash
git checkout -b rebrand-2026
git am /path/to/0001-rebrand-2026-retint-to-bfta-palette.patch
git push -u origin rebrand-2026
# then open a PR in the GitHub UI: rebrand-2026 -> main
```

The patch was generated from the monorepo commit `c7e4c74` with paths
relative to `artist-hub/`, so it lays down cleanly on the upstream repo
root.

## What's in the patch

- Replaces `static/bfta-logo.png` with the green-2 BFTA bug
- Retints `--accent` (gold → lime) and `--accent-2` (purple → orange) in
  `src/app.css`
- Repaints body radial-gradient washes onto the new palette
- Sweeps every inline `rgba()` and hex color reference across all Svelte
  components and routes from gold/purple to lime/orange (≈26 files)
- Updates the QR-code dark color in `NpubShareModal.svelte` so generated
  QR codes render in BFTA orange instead of purple

No structural changes, no dependency changes — color and logo only.

## When to apply it

Anytime, but at minimum **before** anyone runs a fresh build that doesn't
have the monorepo's `artist-hub/` folder available. The site itself goes
live with the rebrand the moment PR #207 (this repo) merges, regardless
of whether this patch has been applied upstream.
