# Rollback runbook — 2026 BFTA rebrand (PR #207)

The 2026 brand redesign (cream / black / orange / lime + new BFTA bug +
lime nav/footer + retinted Artist Hub) shipped via PR
[#207](https://github.com/DionWilson/bitcoinforthearts/pull/207).

If something looks wrong on bitcoinforthearts.org after merge — broken
layout, donation flow regression, missing logo, illegible text on a key
page — pick **one** of the three rollback paths below. They all undo the
rebrand on the live site; pick whichever you can execute fastest.

---

## Path 1 — Vercel one-click (fastest, ~30 seconds, no code)

This is the recommended path for time-pressured rollback. It does not
touch the git repo, just re-points the production alias at an older
build that already exists in Vercel's history.

1. Open the Vercel project: <https://vercel.com/bt4arts-projects/bitcoinforthearts>
2. Click **Deployments** in the top nav.
3. Filter the list to the **Production** environment.
4. Find the deployment whose **Commit** column shows SHA `967ec35` (or
   any deploy older than the rebrand merge — anything from before the PR
   #207 merge timestamp).
5. Click the **`⋯`** menu on that row → **Promote to Production**.
6. Confirm. The production domain swaps over within a few seconds.

What this does: leaves the rebrand commits in place on `main`, but
serves the older build to visitors. Good for "we need the old site back
right now, we'll figure out the rebrand later." No git history changes.

To restore the rebrand later, **Promote to Production** on the most
recent rebrand deploy.

---

## Path 2 — Git revert (cleanest history, ~2 minutes)

Use this if you want the rebrand permanently undone in git history (so
the next deploy from `main` is also pre-rebrand). Requires push access
to `main`.

```bash
git fetch origin
git checkout main
git pull --ff-only origin main

# Revert every commit between the pre-rebrand anchor and current HEAD
# in one batch, then commit them all as a single revert commit.
git revert --no-commit pre-rebrand-2026..HEAD
git commit -m "revert: roll back 2026 rebrand (PR #207) to pre-rebrand-2026"

git push origin main
```

Vercel auto-deploys the revert commit; production updates in 1–2
minutes. The original rebrand commits remain in history, just neutralized
by the revert commit on top — so we can re-apply them later by reverting
the revert.

---

## Path 3 — Redeploy from the tag (fastest "permanent" rollback, ~1 minute)

Use this if you don't have time for `git revert` to play through and
just want to point production at the tagged pre-rebrand state, without
touching `main`.

```bash
# Create a deploy-only branch off the pre-rebrand tag and push it.
git push origin refs/tags/pre-rebrand-2026:refs/heads/hotfix/pre-rebrand-2026
```

Then in Vercel:

1. Open the project's **Deployments** tab.
2. Find the build for branch `hotfix/pre-rebrand-2026`.
3. Promote it to Production.

This is essentially Path 1 but for the case where the older Vercel
deployments have aged out of the dashboard's quick view.

---

## What the `pre-rebrand-2026` tag points at

```
tag    pre-rebrand-2026
sha    967ec352de71c0703550d1468c4ab055a74ae2a3
title  Add files via upload
note   Last commit on main before any rebrand work was merged.
```

This tag is pushed to `origin` so it's available to anyone with read
access to the repo. It will not move; safe to rely on indefinitely.

---

## What about the Artist Hub fallback?

The Artist Hub also lives in a separate repo
(`Bitcoin-For-The-Arts/Artist-Hub`) that the build script falls back to
if the local `artist-hub/` folder is missing. After a rollback via any
of the paths above, the artist hub goes back to using the local
(pre-rebrand) `artist-hub/` folder, so it auto-rolls-back too.

If that upstream repo has *also* been updated with the rebrand patch
(per `docs/artist-hub-upstream-sync/README.md`), no action needed
either — the local fallback chain still produces the pre-rebrand hub.

---

## Don't forget afterward

After any rollback:

1. **Comment on PR #207** noting the rollback so the team knows what's
   live vs. what's in `main`.
2. **Don't close the PR.** Even if the rebrand is fully reverted in git,
   leaving the PR open preserves the discussion thread and review
   history for next time.
3. **Open a new issue** capturing what went wrong, so the next attempt
   can fix the actual problem instead of re-discovering it.
