![Bitcoin For The Arts](app/asset/BITCOIN-ARTS-LOGO-Gold%20(3).png)

# Bitcoin For The Arts, Inc.

**501(c)(3) Nonprofit | The first nonprofit paying artists in Bitcoin.**

[![Donate Bitcoin](https://img.shields.io/badge/Donate-Bitcoin-f7931a?style=for-the-badge&logo=bitcoin&logoColor=white)](https://bitcoinforthearts.org/donate)
[![Website](https://img.shields.io/badge/Website-bitcoinforthearts.org-000?style=for-the-badge)](https://bitcoinforthearts.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## Our Mission

> "In the sovereign spirit of Bitcoin — uncensorable money for uncensorable minds — we ignite a self-sustaining global renaissance in art. Through Bitcoin micro-grants, performance workshops, and live + digital productions, we back sovereign creators across visual arts, theater, dance, music, writing, storytelling, and film."

Every donation fuels direct support to creators, powers exhibitions and residencies, and plants a seed in a permanent Bitcoin reserve — building an endowment for human creativity that no institution or inflation can touch.

---

## Donate

All donations support working artists and are tax-deductible under our 501(c)(3) status.

| Method | Link |
|--------|------|
| Bitcoin (on-chain & Lightning) | [bitcoinforthearts.org/donate#bitcoin](https://bitcoinforthearts.org/donate#bitcoin) |
| All donation methods | [bitcoinforthearts.org/donate](https://bitcoinforthearts.org/donate) |
| Donor-Advised Fund (DAF) | [DAF giving guide](https://bitcoinforthearts.org/donate/guides/daf) |
| IRA Qualified Charitable Distribution | [IRA QCD guide](https://bitcoinforthearts.org/donate/guides/ira-qcd) |
| Securities & stock | [Securities guide](https://bitcoinforthearts.org/donate/guides/securities) |
| Estate planning & bequests | [Estate planning guide](https://bitcoinforthearts.org/donate/guides/estate-planning) |
| Life insurance | [Life insurance guide](https://bitcoinforthearts.org/donate/guides/life-insurance) |
| Royalties & IP | [Royalties guide](https://bitcoinforthearts.org/donate/guides/royalties-ip) |

### Donor Perks

- **All donors:** Named in the donor leaderboard (or anonymous)
- **0.01+ BTC:** Digital thank-you card
- **1+ BTC:** Name a grant + steel seed backup

---

## The 55/30/10/5 Rule

Every dollar (or sat) follows a clear, public allocation model:

| Allocation | % | Purpose |
|---|---|---|
| Artist Grants | 55% | Direct BTC micro-grants to working creators |
| Programs | 30% | Workshops, residencies, co-productions |
| Operations | 10% | Compliance, admin, infrastructure |
| HODL Vault | 5% | Long-term Bitcoin reserve (1 BTC by 2030) |

---

## Treasury & Transparency

We believe in radical financial transparency. All funds are designed to be publicly verifiable on-chain.

- **Live Treasury:** [github.com/Bitcoin-For-The-Arts/bitcoinforthearts-treasury](https://github.com/Bitcoin-For-The-Arts/bitcoinforthearts-treasury)
- **HODL Vault:** Secure 3-of-5 multisig
- **Quarterly Reports:** Published in the treasury repo
- **Grant Tracking:** 0 → 750 artists by 2028

---

## For Artists

### Grants
We fund sovereign creators across all disciplines — visual arts, theater, dance, music, writing, storytelling, and film.

- **Apply:** [bitcoinforthearts.org/grants](https://bitcoinforthearts.org/grants)
- **FAQ:** [bitcoinforthearts.org/grants/faq](https://bitcoinforthearts.org/grants/faq)
- **Grant terms:** [Grant Terms PDF](https://bitcoinforthearts.org/resources/grants/grant-terms.pdf)

### Programs
- Workshops, residencies, and live productions
- [bitcoinforthearts.org/programming](https://bitcoinforthearts.org/programming)

### Why Bitcoin?
- [bitcoinforthearts.org/artists/why-bitcoin](https://bitcoinforthearts.org/artists/why-bitcoin)

---

## Get Involved

- **Volunteer:** [bitcoinforthearts.org/get-involved](https://bitcoinforthearts.org/get-involved)
- **DIY Fundraising:** [bitcoinforthearts.org/get-involved/diy-fundraising-guide](https://bitcoinforthearts.org/get-involved/diy-fundraising-guide)
- **Contribute code:** See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Board nominations:** [bitcoinforthearts.org/about/governance](https://bitcoinforthearts.org/about/governance)

---

## Education

We maintain public education materials in a dedicated repository:

- **Education repo:** [github.com/Bitcoin-For-The-Arts/education](https://github.com/Bitcoin-For-The-Arts/education)
- **License:** CC BY 4.0
- **Setup guide:** [docs/education-repo.md](docs/education-repo.md)

---

## About the Organization

- **Type:** 501(c)(3) nonprofit corporation
- **Founded:** 2025
- **Headquarters:** New York, NY
- **Leadership:** [bitcoinforthearts.org/about/leadership](https://bitcoinforthearts.org/about/leadership)
- **Governance:** [GOVERNANCE.md](GOVERNANCE.md)

### Core Principles
- 100% on-chain transparency
- 100% open-source
- No fiat middlemen
- No gatekeepers
- Artist-first, always

---

## Contact

| Channel | Link |
|---------|------|
| Website | [bitcoinforthearts.org](https://bitcoinforthearts.org) |
| Email | hello@bitcoinforthearts.org |
| X (Twitter) | [@Bitcoinfta](https://x.com/Bitcoinfta) |
| Grants | grants@bitcoinforthearts.org |

---

## Project Documentation

<details>
<summary><strong>Developer Setup & Deployment Guide</strong> (click to expand)</summary>

### Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Hosting:** Vercel
- **Payments:** BTCPay Server

### Local Development

```bash
git clone https://github.com/Bitcoin-For-The-Arts/Bitcoin-For-The-Arts.git
cd Bitcoin-For-The-Arts
npm install
npm run dev
```

### Homepage Intro Video (Easy Swap)

- Turn it on/off (Vercel env var):
  - default is ON
  - `NEXT_PUBLIC_SHOW_HOME_INTRO=0` → disable the intro video
- Swap the video (no code changes):
  - Upload/replace this file: `public/BFTA-home-page.MOV`
  - Deploy (or run `npm run build`)
  - The build will automatically convert it to: `public/BFTA-home-page.mp4` for browser playback

### Contact Form (Send Directly From the Website)

The Contact page now sends email directly (no "open your email app" prompt).

#### Option A (recommended): Resend (no Zoho app password needed)

Set these Vercel environment variables:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (can start as `onboarding@resend.dev`, then switch to `hello@bitcoinforthearts.org` after you verify the domain in Resend)
- `CONTACT_TO_EMAIL` (where you want submissions delivered, usually `hello@bitcoinforthearts.org`)
- `CONTACT_FROM_EMAIL` (optional if you set `RESEND_FROM_EMAIL`)

#### Option B: SMTP (Zoho, etc.)

Set these Vercel environment variables:

- `CONTACT_SMTP_USER` (example: `hello@bitcoinforthearts.org`)
- `CONTACT_SMTP_PASS` (Zoho SMTP password or app password)
- `CONTACT_TO_EMAIL` (where you want submissions delivered, usually `hello@bitcoinforthearts.org`)
- `CONTACT_FROM_EMAIL` (usually same as `CONTACT_SMTP_USER`)

Optional:

- `CONTACT_SMTP_HOST` (default `smtp.zoho.com`)
- `CONTACT_SMTP_PORT` (default `465`)
- `CONTACT_SMTP_SECURE` (default `true`)
- `CONTACT_SUBJECT_PREFIX` (default `Website contact`)

### Grants Application (First-Party / No Google Forms)

- Apply: `/grants/apply`
- Admin list: `/admin/applications` (Basic Auth)

#### Database (required)

- `MONGODB_URI` (MongoDB connection string)
- `MONGODB_DB` (optional; defaults to `bitcoinforthearts`)

Uploads are stored in MongoDB GridFS (bucket: `grantUploads`).

#### Email notifications (optional but recommended)

If email is not configured, applications will still be stored in MongoDB.

Preferred grant env vars (falls back to the contact SMTP vars above if present):

- `GRANTS_TO_EMAIL` (defaults to `grants@bitcoinforthearts.org`)
- `GRANTS_FROM_EMAIL`
- `GRANTS_SMTP_USER`
- `GRANTS_SMTP_PASS`

Optional:

- `GRANTS_SMTP_HOST` (default `smtp.zoho.com`)
- `GRANTS_SMTP_PORT` (default `465`)
- `GRANTS_SMTP_SECURE` (default `true`)

#### Spam protection (optional): Cloudflare Turnstile

To enable Turnstile on the grant application, set both:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public site key)
- `TURNSTILE_SECRET_KEY` (secret key; server-side verification)

If only one is set, the app will not enforce Turnstile (to avoid accidental lockouts).

Optional debugging (shows Turnstile error codes in responses):

- `TURNSTILE_DEBUG=1` (server-side)
- `NEXT_PUBLIC_TURNSTILE_DEBUG=1` (client-side)

#### Admin (Basic Auth)

- `ADMIN_USER`
- `ADMIN_PASS`

If `ADMIN_USER`/`ADMIN_PASS` are not set, `/admin/*` returns 404.

### Volunteer Signup (Send Directly From the Website)

- Page: `/get-involved/volunteer`
- API: `/api/volunteer-submit`

Email settings (optional — submissions are still saved to MongoDB even if email fails):

- `VOLUNTEER_TO_EMAIL` (defaults to `volunteers@bitcoinforthearts.org`)
- `VOLUNTEER_FALLBACK_TO_EMAIL` (optional; if the primary recipient bounces, retry once to this inbox)

SMTP settings (optional; falls back to grants/contact SMTP):

- `VOLUNTEER_FROM_EMAIL`
- `VOLUNTEER_SMTP_USER`
- `VOLUNTEER_SMTP_PASS`
- `VOLUNTEER_SMTP_HOST`
- `VOLUNTEER_SMTP_PORT`
- `VOLUNTEER_SMTP_SECURE`

### Education Workshop Waitlist (Send Directly From the Website)

- Page: `/education`
- API: `/api/education/workshop-interest`

Email settings (optional — submissions are still saved to MongoDB even if email fails):

- `EDU_TO_EMAIL` (defaults to `education@bitcoinforthearts.org`)
- `EDU_FALLBACK_TO_EMAIL` (optional; if the primary recipient bounces, retry once to this inbox)

SMTP settings (optional; falls back to grants/contact SMTP):

- `EDU_FROM_EMAIL`
- `EDU_SMTP_USER`
- `EDU_SMTP_PASS`
- `EDU_SMTP_HOST`
- `EDU_SMTP_PORT`
- `EDU_SMTP_SECURE`

### Governance Board Nominations (First-Party)

- Page: `/about/governance`
- API: `/api/governance/board-nomination`

Routing:

- `GOVERNANCE_TO_EMAIL` (or `BOARD_NOMINATION_TO_EMAIL`; defaults to `hello@bitcoinforthearts.org`)

Sender:

- `GOVERNANCE_FROM_EMAIL` (optional; falls back to `RESEND_FROM_EMAIL`)

Spam protection:

- Uses the same Turnstile vars as the grant application:
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`

### Feedback Survey (First-Party)

- Page: `/get-involved/feedback`
- API: `/api/feedback`

Routing:

- `FEEDBACK_TO_EMAIL` (defaults to `CONTACT_TO_EMAIL` / `hello@bitcoinforthearts.org`)

Sender:

- `FEEDBACK_FROM_EMAIL` (optional; falls back to `RESEND_FROM_EMAIL`)

Spam protection:

- Uses Turnstile when configured:
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`

#### Reviewer share links (read-only)

To email applications to reviewers without giving them admin credentials:

- `REVIEW_LINK_SECRET` (required; any long random string)

</details>

---

<p align="center">
  <strong>"The NEA of the Bitcoin Era."</strong><br>
  First. Transparent. Unstoppable.
</p>
