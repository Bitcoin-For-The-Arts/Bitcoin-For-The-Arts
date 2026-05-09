# Contributing to Bitcoin For The Arts

Thank you for your interest in contributing to Bitcoin For The Arts, Inc.
We welcome contributions from developers, designers, writers, and anyone
who supports our mission of funding sovereign creators with Bitcoin.

## Ways to Contribute

### Code & Development

- Fix bugs or improve existing features
- Build new tools for artists and donors
- Improve accessibility, performance, or security
- Write or improve documentation

### Non-Code Contributions

- Report bugs or suggest features via GitHub Issues
- Improve copy, translations, or educational materials
- Help with design, UX research, or accessibility audits
- Spread the word about Bitcoin For The Arts

### Financial Support

- Donate Bitcoin: [bitcoinforthearts.org/donate](https://bitcoinforthearts.org/donate)
- All donations are tax-deductible under our 501(c)(3) status

## Project Stack

This is a Next.js monorepo that powers
[bitcoinforthearts.org](https://bitcoinforthearts.org). Exact versions
live in [`package.json`](./package.json) — the headlines are:

- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 (via `@tailwindcss/postcss`)
- **Hosting:** Vercel
- **Donations:** BTCPay Server (Bitcoin / Lightning) + Stripe (card / Apple Pay)
- **Email:** Resend (preferred) with SMTP fallback (Zoho / Nodemailer)
- **Database:** MongoDB (grant applications, volunteer signups, donations log,
  reviewer share links)
- **Spam protection:** Cloudflare Turnstile (forms)
- **Analytics:** Vercel Analytics + Speed Insights, gated behind cookie consent

There is also a **Svelte sub-project** at [`artist-hub/`](./artist-hub/)
that is built during `npm run build` and deployed at `/artist-hub/*`.
See [`artist-hub/README.md`](./artist-hub/README.md) for its own
contributing notes.

## Getting Started

### Prerequisites

- **Node.js 22** (or 20.18+) — match the version pinned in
  [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)
- **npm 10+** (ships with Node 22)

### Local Development

```bash
git clone https://github.com/Bitcoin-For-The-Arts/Bitcoin-For-The-Arts.git
cd Bitcoin-For-The-Arts

npm install
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

Copy [`.env.example`](./.env.example) to `.env.local` and fill in the
values you need. Most of the site renders without any env vars set —
features that require external services (BTCPay, Stripe, MongoDB,
Resend, Turnstile, the admin UI) are documented in detail in the
collapsible **Project Documentation** block of the
[README](./README.md).

## Submitting Changes

### Branching & PR Workflow

**Direct pushes to `main` are not allowed.** Every change ships via a
pull request. Specifically:

1. **Create a feature branch off `main`.**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b your-username/short-description
   ```
   Cursor / Cloud Agent runs use the `cursor/<descriptive-name>-<suffix>`
   convention; humans can use whatever scheme they like.
2. **Make your changes** with clear, descriptive commits.
3. **Run lint and build locally** before pushing:
   ```bash
   npm run lint      # must be clean
   npm run build     # must succeed
   ```
   Both of these run in CI on every PR (see
   [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) and a
   failing CI blocks merge.
4. **Push your branch and open a PR against `main`.** Use the
   pre-filled [pull request template](./.github/PULL_REQUEST_TEMPLATE.md);
   describe what changed, why, and how you tested it.
5. **Get one approving review** before merging. The
   [`CODEOWNERS`](./.github/CODEOWNERS) file routes review requests
   automatically.
6. **Merge with a linear history.** Use "Squash and merge" or "Rebase
   and merge" — merge commits are not allowed on `main`.

If you are an external contributor and don't have push access, fork the
repo and submit a PR from your fork. Same rules apply on our end.

### Commit Messages

Use clear, descriptive commit messages. We loosely follow Conventional
Commits because it makes scanning the log easier:

- `feat: add Lightning donation support`
- `fix: correct mobile nav overflow`
- `docs: update grant application instructions`
- `style: improve donation card contrast`
- `chore: bump next to 16.1.2`
- `refactor: extract shared form fields into a hook`

Multi-line commit bodies are encouraged for non-trivial changes — explain
the *why*, not just the *what*.

### Code Style

- Follow the existing patterns in the codebase. When in doubt, look at
  a recently-merged PR for the same area.
- Don't introduce comments that just narrate what code does — only add
  comments that explain non-obvious intent or trade-offs.
- Use TypeScript types liberally; avoid `any` unless you have a
  specific reason.
- Tailwind: prefer the existing semantic color tokens
  (`text-foreground`, `bg-surface`, `border-border`, etc.) over hex
  values. The 2026 brand palette is defined in
  [`app/globals.css`](./app/globals.css).

### Brand Assets

Use logos and lockups from [`public/brand-kit/`](./public/brand-kit/).
The directory has its own
[README](./public/brand-kit/README.md) with a "pick the right asset"
cheat sheet, and the official brand guidelines PDF is at
[`public/brand-kit/guidelines/BFTA-Brand-Guidelines.pdf`](./public/brand-kit/guidelines/BFTA-Brand-Guidelines.pdf).

## Issue Guidelines

Use the issue templates — they're in
[`.github/ISSUE_TEMPLATE/`](./.github/ISSUE_TEMPLATE/):

- **Bug report** — steps to reproduce, expected vs. actual,
  browser/OS, screenshots.
- **Feature request** — the problem, the proposed solution,
  alternatives considered.
- **Donation or funding** — for grant inquiries and donor questions.

For private issues (security, financial, or anything sensitive), do
**not** open a public issue. See [`SECURITY.md`](./SECURITY.md) for the
security disclosure process; for everything else, email
[hello@bitcoinforthearts.org](mailto:hello@bitcoinforthearts.org).

## Code of Conduct

This project follows our [Code of Conduct](./CODE_OF_CONDUCT.md). By
participating, you agree to uphold a welcoming, inclusive, and
respectful environment.

## Questions?

- Email: [hello@bitcoinforthearts.org](mailto:hello@bitcoinforthearts.org)
- Website: [bitcoinforthearts.org](https://bitcoinforthearts.org)

## License

By contributing, you agree that your contributions will be licensed
under the [MIT License](./LICENSE).
