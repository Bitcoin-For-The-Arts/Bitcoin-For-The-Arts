# Repo Migration 2026 — Vercel Re-Point Runbook

**Status:** waiting on Dion to execute the Vercel step (planned for the
week of May 2, 2026, after the Bitcoin conference).

This is the post-conference companion to the Phase 1 audit
([`REPO_MIGRATION_AUDIT_2026.md`](./REPO_MIGRATION_AUDIT_2026.md)). It
documents what was already done in the agent runs of April 25, 2026,
and the 30-second Vercel dashboard change that finishes the migration.

---

## Background — what already happened

| When | What | Where |
|---|---|---|
| 2026-04-25 | **Phase 1 audit** posted | PR #30 |
| 2026-04-25 | **Phase 2 sync** — full personal-repo history merged into the org repo with `--allow-unrelated-histories`. Org governance docs (`README.md`, `GOVERNANCE.md`, `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/*`) preserved. Pre-rebrand cruft cleaned up. | PR #31 |
| 2026-04-25 | **Phase 3 collaboration infra** — `CODEOWNERS`, `.github/workflows/ci.yml` (lint + build), refreshed `CONTRIBUTING.md`, `docs/BRANCH_PROTECTION_SETUP.md` walkthrough | PR #32 |
| **TBD (post-conference)** | **Phase 4 — Vercel re-point** (this doc) | manual UI step |

After PR #31 merges, `main` on this repo holds **identical website code**
to the live production deploy at bitcoinforthearts.org. The site is still
deploying from `DionWilson/bitcoinforthearts` — flipping that connection
is the last action of this migration.

---

## Migration strategy (recap)

We chose **Option B (git history merge)** from the audit, not Option A
(GitHub repo transfer). Reasons:

- Dion didn't want to disturb the live site or the personal repo before
  returning from the Bitcoin conference.
- Option B leaves `DionWilson/bitcoinforthearts` 100% untouched,
  including all PRs (#1–#219), all issues, all stars, and all old-URL
  redirects. The personal repo continues to deploy production unchanged
  until Vercel is told otherwise.
- Trade-off: PR numbers from the personal repo (#1–#219) don't carry
  over here. Issues and stars stay on the personal repo. This was
  judged acceptable given the goal was a clean cut, not a verbatim
  history transfer of metadata.

---

## The Vercel re-point — actual procedure

**Time required:** ~90 seconds of clicking + ~2 minutes for Vercel to
build the first deploy from the new connection.

**Risk:** very low. The code on `main` here is identical to the code
currently deploying from the personal repo. Worst case, Vercel
auto-rolls back to the previous deploy in ~30 seconds via the
dashboard.

### Pre-flight checks (do these the night before)

1. Confirm PR #31 (the Phase 2 sync) has been merged into `main` in
   this org repo.
2. Confirm `npm run build` passes locally on a fresh clone of `main`.
3. Confirm the CI workflow (`Lint & Build (Next.js)`) is green on
   `main`.
4. Confirm every Vercel environment variable currently set on the
   `bt4arts-projects/bitcoinforthearts` Vercel project. List is in
   the README's collapsible "Project Documentation" block — at minimum
   you should see:
   - `BTCPAY_URL`, `BTCPAY_API_KEY`, `BTCPAY_STORE_ID`,
     `BTCPAY_WEBHOOK_SECRET`
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `MONGODB_URI`, `MONGODB_DB`
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL`
   - `ADMIN_USER`, `ADMIN_PASS`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
   - `REVIEW_LINK_SECRET`
5. Take a screenshot of the Vercel project's **Deployments** tab so
   you have a known-good deploy ID for rollback. The most recent
   "Production" deploy is the one to remember.

### Step 1 — Disconnect the old git connection

1. Go to <https://vercel.com/bt4arts-projects/bitcoinforthearts/settings/git>
2. Under **Connected Git Repository**, click **Disconnect**.
3. Confirm the disconnect.

This **does not** delete any deployments or environment variables. It
just severs the auto-deploy link to `DionWilson/bitcoinforthearts`.

### Step 2 — Reconnect to the org repo

1. Same page (now showing "No Git Repository Connected").
2. Click **Connect Git Repository**.
3. Pick **GitHub** → search for
   `Bitcoin-For-The-Arts/Bitcoin-For-The-Arts` → click **Connect**.
4. Confirm the production branch is `main`.
5. Save.

If the org repo doesn't appear in the picker, you'll need to grant the
**Vercel** GitHub App access to the `Bitcoin-For-The-Arts` org. Click
the "Adjust GitHub App Permissions" link Vercel offers, install/enable
the app on the org, and refresh the picker.

### Step 3 — Trigger the first deploy

Vercel does **not** auto-deploy immediately on reconnection. You need
to nudge it:

- Easiest: from the Vercel **Deployments** tab, click **Redeploy** on
  the most recent commit on `main` (the one matching the last commit
  on the org repo).
- Or: push any tiny commit to `main` (e.g., a comment whitespace
  change). The new git connection will pick it up and start a build.

Watch the build log. You should see the same `next build` output as
production has always shown — the prebuild steps run (home video,
public images, artist-hub Svelte build), then `next build` succeeds,
then Vercel publishes.

### Step 4 — Smoke test the new deploy

Open <https://bitcoinforthearts.org> and click through the high-risk
paths:

- [ ] Homepage loads, intro video plays
- [ ] Brand logo lockup renders (no broken images)
- [ ] `/donate` — both BTCPay and Stripe widgets render
- [ ] `/grants/apply` — form renders, submits to MongoDB (test with a
  dummy entry, then delete from the admin UI)
- [ ] `/admin/applications` — Basic Auth prompt appears
- [ ] `/transparency` — page renders with current allocations
- [ ] `/about/leadership` — Kenneth Burris listed under Advisory Board
- [ ] `/about/leadership/dion-wilson` — bio page renders
- [ ] `/stories` — all 9 artist stories listed
- [ ] `/artist-hub` — Svelte sub-app loads
- [ ] `/contact` — form sends a real email (Resend)
- [ ] Cookie banner appears and stores consent
- [ ] No console errors in DevTools

If any of these fail, **roll back immediately** (next section).

### Step 5 — Update DNS / external integrations (probably nothing to do)

DNS is at Hostinger and points at Vercel by `cname.vercel-dns.com`.
Re-pointing the *git* connection does not change DNS, so this should
keep working untouched. Sanity-check with `dig bitcoinforthearts.org +short`.

If you ever recreate the Vercel project (vs. just re-linking it),
you'd need to re-add the custom domain in Vercel and DNS would need a
fresh CNAME — but you're not doing that here.

---

## Rollback procedure

Vercel makes this very fast. Two flavors:

### Option R1 — Roll back the deploy (fastest, ~30 seconds)

If the new deploy is broken but the previous one was good:

1. Go to <https://vercel.com/bt4arts-projects/bitcoinforthearts/deployments>
2. Find the last known-good production deploy (the one you screenshotted
   in pre-flight).
3. Click the `…` menu on that row → **Promote to Production**.

Production goes back to the old code. The new git connection is still
in place; you can fix the issue in a follow-up PR and try again.

### Option R2 — Re-point Vercel back to the personal repo (~90 seconds)

If something is structurally wrong with the org repo (which would be
surprising — the code is identical) and you need to fully revert the
git connection:

1. Vercel → Settings → Git → **Disconnect**.
2. **Connect Git Repository** → pick `DionWilson/bitcoinforthearts`.
3. Production branch: `main`. Save.
4. Click **Redeploy** on the latest personal-repo commit.

You're back to the pre-migration state. The org repo still has all the
synced code; you can investigate at leisure.

### Option R3 — Hard rollback to pre-rebrand (last resort)

The personal repo has a `pre-rebrand-2026` git tag (carried over to
this repo by PR #31) marking the last commit before the 2026 brand
refresh. If you ever need to wholesale revert the rebrand:

1. Vercel → Deployments → find the production deploy from
   2026-04-22 or earlier (pre-rebrand).
2. Promote to production.

Or, code-side:

```bash
git checkout main
git checkout -b emergency-rollback-pre-rebrand
git revert --no-commit pre-rebrand-2026..HEAD
git commit -m "emergency: revert to pre-rebrand-2026 state"
# open a PR, merge, Vercel auto-deploys
```

This is a heavy hammer. The original brief considered it the rebrand
rollback path; document is at
[`docs/REBRAND_ROLLBACK.md`](./REBRAND_ROLLBACK.md).

---

## After the re-point

Once production is stable on the new connection:

1. Open a small PR to update the README's local-development clone URL
   if anything mentions the personal repo (the org-side README already
   says `https://github.com/Bitcoin-For-The-Arts/Bitcoin-For-The-Arts.git`,
   so this is probably a no-op).
2. Decide what to do with `DionWilson/bitcoinforthearts`:
   - **Recommended:** archive it (Settings → General → "Archive this
     repository" at the bottom). Read-only, banner says "moved",
     no further pushes possible. Preserves all history and links.
   - **Alternative:** edit its README to a single sentence: "Moved to
     [Bitcoin-For-The-Arts/Bitcoin-For-The-Arts](https://github.com/Bitcoin-For-The-Arts/Bitcoin-For-The-Arts)."
3. Apply branch protection — see
   [`BRANCH_PROTECTION_SETUP.md`](./BRANCH_PROTECTION_SETUP.md).
4. Triage the four sensitive-content items flagged in PR #31's body
   (`ecf-partnership-proposal.md`,
   `sovereign-circle-membership-policy.md`, `proxy.ts`, the Substack
   drafts in `docs/`).
5. Decide on the `Bitcoin-For-The-Arts/Artist-Hub` standalone repo —
   the audit flagged it as a follow-up consolidation candidate
   (probably archive or sync-from-monorepo).

---

## Open questions and follow-ups

- **Repo rename?** This repo is currently
  `Bitcoin-For-The-Arts/Bitcoin-For-The-Arts` (org name = repo name).
  Some folks find that confusing. Renaming to
  `Bitcoin-For-The-Arts/bitcoinforthearts` (lowercase, matching the
  domain) would mirror the personal repo's slug and read more
  naturally as a clone URL. GitHub auto-redirects from old slugs to
  new ones, so this is safe to do later. Your call.
- **GitHub App permissions:** the Vercel re-point above assumes the
  Vercel GitHub App is installed on the `Bitcoin-For-The-Arts` org. If
  it isn't yet, the re-point will halt at Step 2 until you grant
  access. Do this in advance to avoid a surprise during the live
  migration.
- **CI minutes:** GitHub Actions on a public repo is free and
  unlimited, so the new CI workflow has no cost implications. If the
  org repo ever goes private, watch the Actions usage.

---

*Last updated: 2026-04-25 by the Phase 3 cloud-agent run.*
