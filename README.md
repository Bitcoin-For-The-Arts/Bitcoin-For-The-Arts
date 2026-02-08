![Bitcoin For The Arts](BITCOIN-ARTS-LOGO-Gold%20(3))

# Bitcoin-For-The-Arts

**Bitcoin For The Arts, Inc. – 501(c)(3) Nonprofit**  
*The **first** nonprofit paying artists in Bitcoin.*  
*55/30/10/5 Rule | 100% On-Chain | 100% Open-Source*

---

### **Our Mission**
> **“In the sovereign spirit of Bitcoin—uncensorable money for uncensorable minds—we ignite a self-sustaining global renaissance in art.**  
> **Through Bitcoin micro-grants, performance workshops, and live + digital productions, we back sovereign creators across visual arts, theater, dance, music, writing, storytelling, and film. We favor low time preference work—timeless craft that resists censorship and celebrates financial freedom through Bitcoin-aligned innovation. Every donation fuels direct support to creators, powers exhibitions and residencies, and plants a seed in a permanent Bitcoin reserve—building an endowment for human creativity that no institution or inflation can touch.”**

---

### **What We Do**
- **55%**Staking art on sound money
- **30%** → **workshops, residencies, co-productions** with BAM, Whitney, Carnegie  
- **10%** → **operations**  
- **5%** → **HODL Vault** (secure, non-public endowment reserve)  

---

### **Reserve (HODL Vault)**
- **HODL Vault**: secure multisig endowment reserve (**address not public** for safety)
- **Transparency**: we share **aggregated reporting** and publish governance/policy documents on the website

**Donate**: see `bitcoinforthearts.org/donate`

---

### **BTCPay Server (Donations)**
The donation flow calls the BTCPay Server API. Configure these **deployment**
environment variables (e.g., in Vercel or your hosting provider):

- `BTCPAY_URL` (public HTTPS URL, e.g. `https://pay.bitcoinforthearts.org`)
- `BTCPAY_API_KEY` (store API key from BTCPay Server)
- `BTCPAY_STORE_ID` (store ID from BTCPay Server)
- `BTCPAY_WEBHOOK_SECRET` (optional but recommended; used to verify BTCPay webhook signatures)

Notes:
- `.local` and `.onion` URLs will not work for a public website.
- Restart/redeploy after updating env vars.
- Vercel only deploys new commits automatically; if your Git link was reconnected, make a fresh deploy (or merge a small PR) to trigger a new production build.

---

### **Stripe Webhooks (Card Donations / Apple Pay)**
If you want to run automation after donations (e.g., log donations to MongoDB, send donor thank-you emails), configure a Stripe webhook endpoint.

- **Webhook URL**: `https://bitcoinforthearts.org/api/stripe/webhook`

Environment variables:
- `STRIPE_WEBHOOK_SECRET` (required; from Stripe Dashboard → Developers → Webhooks)
- `STRIPE_SECRET_KEY` (optional; used by the Stripe SDK for future expansion)
- `DONATION_THANKYOU_THRESHOLD_USD` (optional; default `50`)
- `DONATIONS_FROM_EMAIL` (optional; defaults to `RESEND_FROM_EMAIL`)
- `DONATIONS_REPLY_TO` (optional; defaults to `donate@bitcoinforthearts.org`)

Notes:
- The webhook stores paid `checkout.session.completed` events in MongoDB (`donations` collection).
- Stripe still handles official receipts automatically.

---

### **Donor Perks**
- **All donors:** Named in [leaderboard.csv](donors/leaderboard.csv)  
- **≥ 0.01 BTC:** Digital thank-you card  
- **≥ 1 BTC:** Name a grant + steel seed backup

---

### **The 55/30/10/5 Rule**
| **Use** | **%** | **Purpose** |
|--------|------|------------|
| Artist Grants | 55% | BTC to creators |
| Programs | 30% | Workshops, residencies, co-productions |
| Admin | 10% | Compliance & ops |
| HODL Vault | 5% | 1 BTC by 2030 |

---

### **Stacking Culture on Sound Money**
- **No fiat**  
- **No VCs**  
- **No inflation**  
- **No gatekeepers**  

---

**X:** [@Orangepillman](https://x.com/Orangepillman)  
**Email:** hello@bitcoinforthearts.org  

---

### **Homepage Intro Video (Easy Swap)**
- **Turn it on/off (Vercel env var)**:
  - default is **ON**
  - `NEXT_PUBLIC_SHOW_HOME_INTRO=0` → disable the intro video
- **Swap the video (no code changes)**:
  - Upload/replace this file: `public/BFTA-home-page.MOV`
  - Deploy (or run `npm run build`)
  - The build will automatically convert it to: `public/BFTA-home-page.mp4` for browser playback

---

### **Webinar Promo (Homepage Card)**
To promote an upcoming webinar/class on the homepage (without adding a second blocking modal), set:

- `NEXT_PUBLIC_SHOW_WEBINAR_PROMO=1`
- `NEXT_PUBLIC_WEBINAR_SIGNUP_URL=https://...` (**required**)

Optional copy:
- `NEXT_PUBLIC_WEBINAR_TITLE=Bitcoin for Artists — Live Webinar`
- `NEXT_PUBLIC_WEBINAR_DATE_TEXT=Feb 8 • 12:00 PM ET`
- `NEXT_PUBLIC_WEBINAR_BODY_TEXT=...`

Optional flyer image:
- Easiest workflow: upload/replace `public/webinar-flyer.png` (the promo uses this by default)
- Or upload a specific flyer and set `NEXT_PUBLIC_WEBINAR_FLYER_SRC=/path-to-flyer.png`

If you want to prevent the donation popup from competing with the webinar promo (homepage only), set:
- `NEXT_PUBLIC_SUPPRESS_DONATE_POPUP_FOR_WEBINAR=1`

---

### **Contact Form (Send Directly From the Website)**
The Contact page now sends email directly (no “open your email app” prompt).

#### Option A (recommended): Resend (no Zoho app password needed)
Set these **Vercel environment variables**:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (can start as `onboarding@resend.dev`, then switch to `hello@bitcoinforthearts.org` after you verify the domain in Resend)
- `CONTACT_TO_EMAIL` (where you want submissions delivered, usually `hello@bitcoinforthearts.org`)
- `CONTACT_FROM_EMAIL` (optional if you set `RESEND_FROM_EMAIL`)

#### Option B: SMTP (Zoho, etc.)
Set these **Vercel environment variables**:
- `CONTACT_SMTP_USER` (example: `hello@bitcoinforthearts.org`)
- `CONTACT_SMTP_PASS` (Zoho SMTP password or app password)
- `CONTACT_TO_EMAIL` (where you want submissions delivered, usually `hello@bitcoinforthearts.org`)
- `CONTACT_FROM_EMAIL` (usually same as `CONTACT_SMTP_USER`)

Optional:
- `CONTACT_SMTP_HOST` (default `smtp.zoho.com`)
- `CONTACT_SMTP_PORT` (default `465`)
- `CONTACT_SMTP_SECURE` (default `true`)
- `CONTACT_SUBJECT_PREFIX` (default `Website contact`)

---

### **Grants Application (First-Party / No Google Forms)**

- **Apply:** `/grants/apply`
- **Admin list:** `/admin/applications` (Basic Auth)

#### Database (required)
- `MONGODB_URI` (MongoDB connection string)
- `MONGODB_DB` (optional; defaults to `bitcoinforthearts`)

Uploads are stored in **MongoDB GridFS** (bucket: `grantUploads`).

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
To enable Turnstile on the grant application, set **both**:
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public site key)
- `TURNSTILE_SECRET_KEY` (secret key; server-side verification)

If only one is set, the app will **not** enforce Turnstile (to avoid accidental lockouts).

Optional debugging (shows Turnstile error codes in responses):
- `TURNSTILE_DEBUG=1` (server-side)
- `NEXT_PUBLIC_TURNSTILE_DEBUG=1` (client-side)

#### Admin (Basic Auth)
- `ADMIN_USER`
- `ADMIN_PASS`

If `ADMIN_USER`/`ADMIN_PASS` are not set, `/admin/*` returns 404.

---

### **Volunteer Signup (Send Directly From the Website)**
- **Page:** `/get-involved/volunteer`
- **API:** `/api/volunteer-submit`

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

---

### **Education Workshop Waitlist (Send Directly From the Website)**
- **Page:** `/education`
- **API:** `/api/education/workshop-interest`

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

---

### **Governance Board Nominations (First-Party)**
- **Page:** `/about/governance`
- **API:** `/api/governance/board-nomination`

Routing:
- `GOVERNANCE_TO_EMAIL` (or `BOARD_NOMINATION_TO_EMAIL`; defaults to `hello@bitcoinforthearts.org`)

Sender:
- `GOVERNANCE_FROM_EMAIL` (optional; falls back to `RESEND_FROM_EMAIL`)

Spam protection:
- Uses the same Turnstile vars as the grant application:
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`

---

### **Feedback Survey (First-Party)**
- **Page:** `/get-involved/feedback`
- **API:** `/api/feedback`

Routing:
- `FEEDBACK_TO_EMAIL` (defaults to `CONTACT_TO_EMAIL` / `hello@bitcoinforthearts.org`)

Sender:
- `FEEDBACK_FROM_EMAIL` (optional; falls back to `RESEND_FROM_EMAIL`)

Spam protection:
- Uses Turnstile when configured:
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`

#### Reviewer share links (read-only)
To email applications to reviewers **without giving them admin credentials**:

- `REVIEW_LINK_SECRET` (required; any long random string)

> **“The NEA of the Bitcoin Era.”**  
> **First. Transparent. Unstoppable.**

**November 16, 2025 | 12:40 AM EST | New York, NY**
