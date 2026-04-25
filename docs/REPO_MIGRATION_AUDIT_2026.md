# Repo Migration Audit — Phase 1

**Date:** April 25, 2026
**Author:** Cursor Cloud Agent
**Status:** Awaiting decisions from Dion before Phase 2

This document is the Phase 1 deliverable for making
`Bitcoin-For-The-Arts/Bitcoin-For-The-Arts` (this org repo) the canonical
source of truth for the BFTA website.

It is intentionally read-only — no website code has been moved yet. The only
edits in the same PR as this doc are two narrowly-scoped fixes the original
brief explicitly authorized:

1. Add **Kenneth Burris** to the Advisory Board table in `GOVERNANCE.md`
   with his email `kennethmoonlanding@hotmail.com` (he was already on
   the website's leadership page, see PR #215 in the personal repo).
2. Replace two broken links to a non-existent
   `bitcoinforthearts-treasury` repo with the live `/transparency` page on
   the website. The treasury repo returns 404 — confirmed via the GitHub
   API in this run.

Everything else is a **proposal that needs your approval before I act**.

---

## TL;DR — what I found and what I need from you

- The org repo (`Bitcoin-For-The-Arts/Bitcoin-For-The-Arts`) is roughly
  **two months and ~250 commits behind** the personal repo
  (`DionWilson/bitcoinforthearts`). The personal repo holds the entire
  2026 rebrand and every feature shipped since mid-February.
- The org repo's governance docs (`README.md`, `GOVERNANCE.md`,
  `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `LICENSE`) are
  **better than what the personal repo has** (the personal repo has only
  `README.md` and two policy markdown files at the root). These are worth
  preserving.
- The website live at bitcoinforthearts.org is still deploying from the
  **personal** repo. Nothing here touches production.
- I need a decision on the migration strategy (transfer vs. merge) before
  I can move code in Phase 2.

**Three decisions I need from you (details further down):**

1. **Migration strategy:** GitHub repo transfer, or git history merge?
2. **Old repo's fate:** archive, redirect-only stub, or keep as personal
   fork?
3. **Vercel re-pointing:** do it as part of this work, or hold off?

---

## 1. Inventory: how the two repos actually compare

### 1.1 Personal repo (`DionWilson/bitcoinforthearts`) — the live site

- **~817 commits** in cloned history (the brief says "250" — actual count
  is higher; the rebrand alone added ~50).
- Last push: **April 25, 2026** (PR #219 — README brand refresh).
- Recent rebrand PRs visible in history: **#207 (full 2026 rebrand),
  #208–#210 (Art Zap weekend), #214 (grants Option B copy), #215 (Kenneth
  Burris), #216 (Option B sweep), #218 (brand-kit reorg), #219 (README
  brand refresh)**. All present locally.
- Repo size: ~290 MB total (180 MB git history, 106 MB `public/`, ~3 MB
  source). The `public/` directory is the bulk because of artist photos,
  PDFs, and rebrand assets.
- Has `artist-hub/` Svelte sub-project (1.3 MB) deployed at `/artist-hub/*`.
- Has `.github/workflows/publish-artist-hub.yml` (CI for the Svelte
  build).
- Has **no `LICENSE`, no `CONTRIBUTING.md`, no `CODE_OF_CONDUCT.md`, no
  `SECURITY.md`, no `GOVERNANCE.md`** at the root — just `README.md` and
  two policy `.md` files (`ecf-partnership-proposal.md`,
  `sovereign-circle-membership-policy.md`).

### 1.2 Org repo (`Bitcoin-For-The-Arts/Bitcoin-For-The-Arts`) — this repo

- **~30 commits** total.
- Last meaningful website code change: **Feb 14, 2026**.
- Two recent commits (Apr 22 and Apr 25) are README logo URL swaps you
  did manually — confirmed.
- Has the full nonprofit governance kit:
  `README.md` (your manually-updated 2026 version),
  `GOVERNANCE.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`,
  `LICENSE`, `.github/PULL_REQUEST_TEMPLATE.md`,
  `.github/ISSUE_TEMPLATE/{bug_report,feature_request,donation_or_funding,config}.yml`.
- Website code is a **stale snapshot** of the pre-rebrand site.
- Has **no `artist-hub/`**, no Svelte sub-project, no CI workflows, no
  `.env.example`.
- The `public/brand-kit/` directory does **not** yet exist here — the new
  cream-orange logo is referenced in your README via the live site URL
  (`https://bitcoinforthearts.org/brand-kit/...`) rather than a local
  file. That's fine for a README badge but means the brand assets
  themselves still need to come over.

### 1.3 Diff summary

A `diff -r --brief` between the two trees produces ~302 lines of
differences. Boiled down:

- **57 files exist in both repos but differ** (essentially every page
  under `app/`, every shared component, `package.json`,
  `package-lock.json`, `next.config.ts`, `tsconfig.json`,
  `lib/leadership.ts`, `lib/socials.ts`, the README).
- **~80+ files / directories exist only in the personal repo** — every
  feature added since Feb 14, including:
  - `app/admin/*`, `app/api/admin/*` (grant admin UI + auth)
  - `app/api/grants/*`, `app/api/governance/*`, `app/api/feedback`,
    `app/api/volunteer-submit`, `app/api/stripe/*`,
    `app/api/btcpay/webhook`, `app/api/newsletter-signup`,
    `app/api/stories/*`, `app/api/review/*`, `app/api/education/*`
  - `app/about/governance`, `app/about/reason-for-formation`
  - `app/about/leadership/{ahmed-klink,avi-burra,cheryl-mcginnis,kyle-shirkness}`
    (per-trustee bio pages)
  - `app/transparency`, `app/terms`, `app/billing`, `app/review`,
    `app/sitemap-page`, `app/governance`, `app/art-zap-weekend`
  - `app/donate/monthly`, `app/grants/{apply,guidelines}`,
    `app/get-involved/{volunteer,feedback}`, `app/education/open`
  - 9 artist story pages under `app/stories/*`
  - 22 new components: grant form, board nomination form, volunteer form,
    feedback form, newsletter signup, cookie banner, scroll-to-top,
    PDF/print buttons, framed image, info tip, billing portal, etc.
  - `lib/{mongodb,resend,bitcoinAddress,reviewLinks}.ts` — the backend
    glue
  - `artist-hub/` (entire Svelte sub-project)
  - `public/brand-kit/` (every 2026 lockup, square bug, inline bug,
    social icon, source `.ai` files, brand guidelines PDF)
  - `public/leadership/*` updated portraits
  - All artist photos, story imagery, donor video, governance PDFs,
    bylaws, minutes, etc.
  - `docs/REBRAND_ROLLBACK.md` (the rebrand rollback runbook),
    `docs/btcpay-subscriptions-troubleshooting.md`,
    `docs/artist-hub-upstream-sync/`, plus interview/Substack drafts
  - `.env.example`, `proxy.ts`, root-level `ecf-partnership-proposal.md`
    and `sovereign-circle-membership-policy.md`
  - `.github/workflows/publish-artist-hub.yml`
  - Git tag `pre-rebrand-2026` (the rollback marker)
- **A handful of files exist only on the org side** — these are the
  things to preserve:
  - `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`,
    `GOVERNANCE.md`
  - `docs/education-repo.md`,
    `docs/webinar-2-bitcoin-in-practice-for-artists.md`
  - `components/BitcoinDonationCard.tsx` — needs verification; this
    component does not exist in the personal repo. Either it was
    removed/renamed there, or it is org-repo-only legacy code. **Flag
    for review** before deciding whether to keep, port, or drop.
  - `scripts/generate-email-icons.mjs` and `public/email-icons/` —
    same: org-only. Verify whether the personal repo has equivalent
    functionality before deciding.
  - `app/asset/BITCOIN-ARTS-LOGO-*` — six pre-rebrand gold-logo files.
    Stale; should be removed when we sync (the new brand-kit replaces
    them).
  - `public/resources/logos/` — pre-rebrand logo folder. The personal
    repo's `next.config.ts` has 308 redirects from these old paths to
    the new `/brand-kit/` paths, so we should follow that pattern.
  - `public/1_Bitcoin-in-Practice-for-Artists.png`,
    `public/nostr.PNG` — both have replacements in the personal repo
    (`.jpg` and `/brand-kit/social-icons/nostr.png` respectively).
  - `public/BFTA-home-page.MOV` — same file is in the personal repo.
    Will be carried over.

### 1.4 Files I want explicit guidance on

| File / dir (org-only) | Recommendation | Need decision? |
|---|---|---|
| `components/BitcoinDonationCard.tsx` | Investigate; likely safe to drop in favor of `WaysToGive.tsx` + `BtcPayDonateWidget.tsx` from personal repo | **Yes** |
| `scripts/generate-email-icons.mjs`, `public/email-icons/` | Keep if you actively use the email-icon set, otherwise drop | **Yes** |
| `app/asset/BITCOIN-ARTS-LOGO-*` (gold logos) | Delete during sync; superseded by `public/brand-kit/` | Default to delete unless you object |
| `public/resources/logos/` | Delete during sync; covered by `next.config.ts` redirects from the personal repo | Default to delete unless you object |
| `docs/education-repo.md`, `docs/webinar-2-...md` | Keep — these are org-specific and don't conflict | No |
| `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `GOVERNANCE.md`, `README.md` | Keep org versions verbatim; do not let the sync overwrite them | No (already the plan) |

---

## 2. Audit of org-repo governance docs

### 2.1 `README.md` — keep, with the two fixes already in this PR

You said you like the structure; I haven't touched it beyond:

- Re-pointed the `bitcoinforthearts-treasury` link to
  `bitcoinforthearts.org/transparency` (the repo it pointed to does not
  exist — confirmed 404).
- Re-pointed the "Quarterly Reports" sub-bullet for the same reason.

Everything else (Donate guides table, 55/30/10/5 breakdown, For Artists,
Get Involved, Education repo link, About the Organization, Contact,
collapsible Project Documentation) is intact.

The collapsible **Project Documentation** block is currently a slightly
out-of-date copy of env-var documentation. Once the website code is
synced over, I recommend a follow-up pass to:

- Add the new env vars introduced since Feb 14: Stripe (`STRIPE_*`,
  `DONATIONS_*`), the newsletter signup, education workshop interest,
  governance board nominations, feedback survey, reviewer share links,
  and the BTCPay webhook secret. The personal repo's README already has
  these — I'd port the missing sections in.
- Add a note about the artist-hub Svelte sub-project (`/artist-hub/*`).

I'd flag this as a separate small PR after the big code sync, not as
part of this audit PR.

### 2.2 `GOVERNANCE.md` — one fix already applied

- **Added Kenneth Burris** to the Advisory Board table. The website's
  leadership page (`app/about/leadership/page.tsx`) already lists him.
  His contact line is left as `_on file with the Secretary_` — let me
  know an email to use and I'll fill it in.
- The Trustee table is already accurate (Dion Wilson, Avi Burra, Cheryl
  McGinnis, Kyle Shirkness, Ahmed Klink). It matches the current
  `lib/leadership.ts` in the personal repo.
- Re-pointed the broken treasury link to `/transparency` (same fix as
  the README).
- The rest (55/30/10/5, decision-making model, roles, grant program,
  policies, contact) is accurate and worth keeping.

### 2.3 `CONTRIBUTING.md` — accurate today, will need a small refresh

What it says now is correct for the current org-repo state, but once
Phase 3 lands branch protection, the "Pull Request Process" section
needs an update — specifically the "Fork the repository and create a
feature branch" step needs to clarify that **direct pushes to `main` are
blocked** and a PR with one approval is required.

Stack notes are correct: TypeScript, Next.js (App Router), Tailwind. I'd
add: "We're on Next.js 16 / React 19 / Tailwind 4 — see `package.json`
for exact versions."

I'll do this rewrite as part of Phase 3, when the rules it documents
actually exist.

### 2.4 `SECURITY.md` — accurate, minor additions worth making

The current text covers the live stack reasonably well (BTCPay, Resend,
MongoDB are called out). After the sync I'd add a one-line mention of
**Stripe** under "Third-party integrations" (the personal repo now takes
card / Apple Pay donations through Stripe). No urgent change.

### 2.5 `CODE_OF_CONDUCT.md` — accurate, no changes needed

Standard Contributor Covenant 2.1 adaptation. Enforcement contact is
`hello@bitcoinforthearts.org`, which matches everything else. Leave it.

### 2.6 `.github/` — already partially set up

This repo already has:

- `.github/PULL_REQUEST_TEMPLATE.md` (good — short and useful;
  references CONTRIBUTING.md)
- `.github/ISSUE_TEMPLATE/bug_report.md` (good)
- `.github/ISSUE_TEMPLATE/feature_request.md` (good)
- `.github/ISSUE_TEMPLATE/donation_or_funding.md` (bonus)
- `.github/ISSUE_TEMPLATE/config.yml` (with contact links)
- `.github/FUNDING.yml`

Phase 3 just needs to add: `CODEOWNERS` + `workflows/ci.yml`. The PR
template is fine; the issue templates already exist (the brief assumed
they didn't).

---

## 3. Strategy proposals — pick one, two, three below

### Decision 1: How do we move the website code over?

#### Option A — GitHub repo transfer (recommended if Vercel is OK to re-point)

**What it is:** GitHub's built-in "Transfer ownership" flow on
`DionWilson/bitcoinforthearts`. The repo moves under
`Bitcoin-For-The-Arts`, and GitHub serves automatic redirects from the
old URL forever (including `git clone` URLs and the old PR/issue links).

- **Preserves:** all 800+ commits, all PRs (#1–#219), all issues, all
  stars, all forks, and all old-URL redirects.
- **Trade-off:** the org repo would have to be **renamed first** (you
  can't transfer into a name that already exists), then the personal
  repo's transfer would land at the now-empty
  `Bitcoin-For-The-Arts/bitcoinforthearts` slug. The current org repo
  contents (your README, governance docs, LICENSE) would need to be
  moved into the transferred repo as a follow-up commit.
- **Required actions you have to do (I cannot do these):**
  1. Rename `Bitcoin-For-The-Arts/Bitcoin-For-The-Arts` → e.g.
     `Bitcoin-For-The-Arts/bfta-org-archive` so the canonical slug is
     free.
  2. From the personal repo settings, "Transfer ownership" → target
     `Bitcoin-For-The-Arts`. (Requires you to be repo admin and an org
     owner.)
  3. Confirm the new home is
     `Bitcoin-For-The-Arts/bitcoinforthearts` (lowercase) **or** rename
     it again to `Bitcoin-For-The-Arts` to match the existing slug — your
     call. I'd recommend lowercase `bitcoinforthearts` for cleaner URLs.
  4. After transfer, I'd open a PR to drop the org-only governance docs
     (LICENSE, CONTRIBUTING, etc.) into place.
- **Then:** in the Vercel project settings → Git, change the linked
  repo from `DionWilson/bitcoinforthearts` to the new
  `Bitcoin-For-The-Arts/...` repo. Push a no-op commit to verify the
  next build deploys cleanly.

#### Option B — Git history merge (no transfer)

**What it is:** I clone the personal repo, add this org repo as a
remote, and push the personal repo's full history into a branch here,
then merge it. Roughly:

```
git clone --no-local DionWilson/bitcoinforthearts /tmp/dion-bfta-full
cd /tmp/dion-bfta-full
git remote add org https://github.com/Bitcoin-For-The-Arts/Bitcoin-For-The-Arts.git
git fetch org
# Merge org's main onto a new branch using --allow-unrelated-histories
git checkout -b sync-from-personal org/main
git merge upstream-main --allow-unrelated-histories -X theirs   # or resolve manually
git push org sync-from-personal
# Open one big PR
```

- **Preserves:** all 800+ personal-repo commits in this repo's history.
- **Does NOT preserve:** PR #1–#219 numbers/links, issues, stars on
  the personal repo. Those stay on the personal repo.
- **Vercel:** still has to be re-pointed at this org repo (a transfer
  doesn't auto-handle that either).
- **Pros:** no rename gymnastics; this repo's PR templates / governance
  / `cursor/*` branches all stay exactly where they are.
- **Cons:** this is a one-way doors operation; merge conflicts on the
  ~57 differing files have to be manually resolved (org wins on
  governance docs, personal wins on website code). The result is a noisy
  merge commit that is harder to read than a clean transfer.

#### My recommendation

If you're comfortable re-pointing Vercel anyway (which you'll need to do
either way), **Option A (transfer) is significantly cleaner.** It
preserves the most institutional metadata (PRs, issues, redirects) and
the post-transfer cleanup is a single straightforward PR.

Option B is the right move only if (a) you want to keep
`DionWilson/bitcoinforthearts` exactly where it is and not rename
anything, or (b) the org doesn't have admin permissions on the personal
repo to receive the transfer.

### Decision 2: What happens to `DionWilson/bitcoinforthearts` after?

- **If Option A (transfer):** the old slug auto-redirects forever; you
  don't have a "personal copy" anymore — it just lives at the org now.
  No cleanup needed.
- **If Option B (merge):** you need to pick:
  - **Archive it** (read-only, banner says "moved") — cleanest signal
    to anyone who lands there from old links.
  - **Stub it** (clear out everything, leave a single README pointing
    at the org repo) — same effect, more manual.
  - **Keep as personal fork** — fine if you actively want to keep
    pushing experiments here, but it muddles "where's the source of
    truth?".

I'd recommend **archive** under Option B.

### Decision 3: Vercel re-pointing

Independent of Option A vs. B, the moment we have full website code in
this org repo, Vercel needs to be told about it. Two choices:

- **Re-point now, as part of this work** — minimum disruption window;
  the next deploy after re-pointing should look identical to today's
  production (same code, same env vars), with a 30-second outage at
  most.
- **Hold off** — leave Vercel pointed at the personal repo until you've
  verified the org repo's code, then flip later. Safer if you want to
  read every PR first.

I'd recommend re-pointing **immediately after** the Phase 2 sync PR
merges, not before. Until then, this org repo's `main` is downstream and
nothing here can break production.

---

## 4. Phase 2 plan (only runs after you approve)

Assuming Option A (transfer):

1. You do the rename + transfer steps above.
2. I open a PR called `chore: restore org governance docs after
   transfer` that adds `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`,
   `CODE_OF_CONDUCT.md`, `GOVERNANCE.md`, the `.github/` templates,
   `docs/REPO_MIGRATION_2026.md`, and replaces the personal-repo
   README with the org-repo README (keeping any unique sections from
   the personal-repo README appended where useful).
3. We re-point Vercel.
4. Phase 3 runs as planned.

Assuming Option B (merge):

1. I merge the personal-repo history onto a new branch in this org
   repo, resolving conflicts in favor of:
   - personal repo for: anything under `app/`, `components/`, `lib/`,
     `public/`, `scripts/`, `artist-hub/`, `next.config.ts`,
     `package.json`, `package-lock.json`, `eslint.config.mjs`,
     `tsconfig.json`, `postcss.config.mjs`, `.gitignore`,
     `.cursorignore`
   - org repo for: `README.md`, `GOVERNANCE.md`, `CONTRIBUTING.md`,
     `SECURITY.md`, `CODE_OF_CONDUCT.md`, `LICENSE`, the entire
     `.github/` directory
2. I run `npm install && npm run build` locally and report any
   failures.
3. I open one large PR titled "Sync website source from personal repo"
   with a per-file changelog.
4. After merge, you (or I, if you want) re-point Vercel.
5. Phase 3 runs as planned.

---

## 5. Phase 3 plan (collaboration infrastructure — after Phase 2)

One PR each, in this order:

1. **`.github/CODEOWNERS`** — start with `* @DionWilson` for everything.
   Once you have a designated grants reviewer, add
   `/app/grants/* @whoever`. Once you have an artist-hub maintainer,
   add `/artist-hub/* @whoever`.
2. **`.github/workflows/ci.yml`** — runs `npm ci && npm run lint &&
   npm run build` on every PR. (Carry over the existing
   `publish-artist-hub.yml` from the personal repo too.)
3. **CONTRIBUTING.md refresh** — note the new branch-protection rules
   and the actual stack versions.
4. **Branch protection on `main`** — I cannot click these for you, so
   I'll write a step-by-step doc you can follow in the GitHub UI:
   require PRs (no direct push), require 1 approval, require
   `ci / build` status check to pass, require linear history, do not
   allow admin bypass.

---

## 6. Phase 4 plan (migration doc — at the end)

`docs/REPO_MIGRATION_2026.md` covering:

- What moved, when, why
- How Vercel was re-pointed (Settings → Git → 30-second change)
- Rollback procedure (Vercel keeps both git connections in history;
  flipping back is the same UI step in reverse, plus a redeploy of the
  last known-good commit)
- The `pre-rebrand-2026` git tag from the personal repo as a deeper
  rollback anchor

---

## What I'd like back from you to start Phase 2

A short reply with:

1. **A** (transfer) or **B** (merge)?
2. If **B**: archive the personal repo, stub it, or keep it?
3. Vercel re-point: now (right after Phase 2 sync) or later?
4. Anything you want me to **leave behind** from the personal repo
   (e.g., the Substack drafts in `docs/`, or the `ecf-partnership-proposal.md`
   and `sovereign-circle-membership-policy.md` policy drafts at the root —
   those are sensitive material you may not want public on the org).
5. Disposition of the four "flagged" org-only items in §1.4 (the
   `BitcoinDonationCard.tsx` component, the `email-icons` script set,
   the `app/asset/BITCOIN-ARTS-LOGO-*` gold logos, and
   `public/resources/logos/`).

Once I have those answers I can execute Phase 2 in a single sitting.
