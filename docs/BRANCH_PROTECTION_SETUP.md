# Branch Protection Setup

Status: **needs to be applied by you in the GitHub UI** — this is one
of the few things only a repo admin can do, not a PR.

This doc walks you through turning on branch protection for `main` so
that:

- Nobody (including you) can push directly to `main` — every change
  must go through a pull request.
- PRs require **one approving review** before they can merge.
- PRs require the **CI workflow** (lint + build) to pass before they
  can merge.
- The history on `main` stays linear (no messy merge commits).
- Force-pushes and branch deletion on `main` are blocked.

It takes about 90 seconds.

## When to do this

**Wait until after PR #31 (the Phase 2 sync) and the Phase 3 PRs are
all merged.** If you turn protection on first, the Phase 3 PRs
themselves can't be merged without a reviewer (and you may be the only
person with the reviewer role today, in which case GitHub will tell you
"At least 1 approving review is required" and refuse to let you merge
your own PR).

If you want to enable protection while you're the sole reviewer, see
the **"Sole maintainer" mode** section below — it's the same setup
minus the review requirement.

## Step-by-step (UI)

1. Open the repo: <https://github.com/Bitcoin-For-The-Arts/Bitcoin-For-The-Arts>
2. Click **Settings** (top-right).
3. In the left sidebar, click **Branches**.
4. Under "Branch protection rules", click **Add branch protection
   rule** (or **Add classic branch protection rule** if GitHub shows
   you the new ruleset UI by default — both work, the classic UI is
   what these instructions describe).
5. **Branch name pattern:** `main`
6. Tick the following boxes (leave the rest off unless noted):

   - [x] **Require a pull request before merging**
     - [x] Require approvals → set to **1**
     - [x] Dismiss stale pull request approvals when new commits are
       pushed
     - [x] Require review from Code Owners (this uses the
       `.github/CODEOWNERS` file added in Phase 3)
   - [x] **Require status checks to pass before merging**
     - [x] Require branches to be up to date before merging
     - In the **search** box, type `Lint & Build (Next.js)` and select
       it. (You may need to first push a PR that triggers the new CI
       once so GitHub registers the check name.)
   - [x] **Require linear history**
   - [x] **Do not allow bypassing the above settings** (this is the
     "no admin bypass" requirement from the original brief — keeps you
     honest)
   - [x] **Restrict who can push to matching branches** → leave the
     allowlist empty so nobody can direct-push (PRs are the only path)

   Leave **off** for now (can revisit later):

   - "Require signed commits" — adds friction; turn on once everyone on
     the team has GPG/SSH commit signing configured.
   - "Require deployments to succeed before merging" — Vercel handles
     this on its end; not needed at the GitHub layer.
   - "Lock branch" — that would freeze `main` entirely.
   - "Allow force pushes" — leave unchecked.
   - "Allow deletions" — leave unchecked.

7. Click **Create** at the bottom.

That's it.

## Verifying it works

Open a small PR — anything will do. You should see:

- A **"1 approving review required"** banner at the bottom of the PR
  (until someone reviews it).
- A **"Lint & Build (Next.js) — pending"** check that flips to green
  when CI finishes.
- The **"Merge pull request"** button is greyed out until both of the
  above are satisfied.

Try `git push origin main` from your laptop with any commit — GitHub
should reject it with `protected branch hook declined`.

## Sole maintainer mode

If you're the only person with merge rights right now and you don't
want to be locked out of merging your own PRs, do **everything
above except**:

- Tick **"Require a pull request before merging"** but set
  approvals to **0**.

You still get all the other guard rails (CI must pass, linear history,
no force-push, no direct push). When a second maintainer joins, edit
the rule and bump approvals back to 1.

## When the rule needs updating

- **Adding a new required CI check** (e.g., a lighthouse perf check):
  same Settings → Branches page, edit the rule, search for the new
  check name in the status-checks box.
- **Adding more code owners**: edit `.github/CODEOWNERS` via a normal
  PR — no Settings change needed.
- **Letting someone bypass for an emergency**: untick "Do not allow
  bypassing", do the emergency thing, tick it back on. Better still:
  open a hotfix PR with `[hotfix]` in the title, get a quick review,
  merge normally.

## Rollback

If branch protection ever causes a real problem (you genuinely need to
push to `main` *right now* and CI is wedged), you can:

1. Settings → Branches → click the rule → **Delete**.
2. Do the thing you needed to do.
3. Re-create the rule using this doc.

It takes the same 90 seconds in the other direction.

## What this does NOT cover

- **Vercel deploys:** Vercel does its own protection (preview vs.
  production environments, deploy approvals if you turn them on). This
  doc is GitHub-side only. The Vercel re-pointing runbook is a
  separate doc — see [`REPO_MIGRATION_2026.md`](./REPO_MIGRATION_2026.md).
- **Other branches:** rules above only apply to `main`. The
  `cursor/*` feature branches have no protection, which is what we
  want — agents and humans need to be able to push freely to them.
- **Tags:** if you ever start cutting GitHub releases, consider
  adding tag protection too (Settings → Tags). For now we only have
  the `pre-rebrand-2026` tag inherited from the personal repo and
  no release cadence, so this can wait.
