import type { Metadata } from 'next';
import Link from 'next/link';
import FullBleedHero from '@/components/FullBleedHero';

export const metadata: Metadata = {
  title: 'Monthly Giving',
  description:
    'Join the Sovereign Circle with a monthly donation that funds artist grants, workshops, and residencies.',
};

type Tier = {
  name: string;
  amount: string;
  perks: string[];
  href: string;
  impact: string[];
  meter: {
    grants: number;
    programs: number;
    reserve: number;
  };
};

const tiers: Tier[] = [
  {
    name: 'Satoshi Supporter',
    amount: '$5',
    perks: [
      'Monthly impact email with grant updates and on-chain reports',
      'Name on the Sovereign Circle donors page (with your consent)',
      'Access to the donor-only community group',
    ],
    href: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_5_LINK?.trim() || 'https://buy.stripe.com/4gMbJ21LU9RHgGo6rn83C05',
    impact: [
      'Helps cover a portion of a micro-grant over the year.',
      'Supports one workshop seat for an emerging creator.',
      'Strengthens the long-term reserve for artist payments.',
    ],
    meter: { grants: 35, programs: 30, reserve: 25 },
  },
  {
    name: 'Orange Piller Patron',
    amount: '$11',
    perks: [
      'Shoutout in the monthly newsletter',
      'Early access to all webinar recordings',
      'Behind-the-scenes updates from active grants',
    ],
    href: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_11_LINK?.trim() || 'https://buy.stripe.com/6oU5kE8aibZP3TCbLH83C06',
    impact: [
      'Enables roughly half to one micro-grant per year.',
      'Covers materials for 2-4 workshop participants.',
      'Builds reserve capacity for future grants.',
    ],
    meter: { grants: 50, programs: 45, reserve: 35 },
  },
  {
    name: 'Hard Cap Hero',
    amount: '$21',
    perks: [
      'Quarterly virtual hangout with artists and team',
      'BFTA sticker pack (one-time welcome kit)',
      'Vote on a quarterly community "Audience Choice" grant',
    ],
    href: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_21_LINK?.trim() || 'https://buy.stripe.com/cNi8wQ9em5Br75OeXT83C0a',
    impact: [
      'Powers one micro-grant over the course of a year.',
      'Funds up to five workshop spots or a residency boost.',
      'Grows the mission reserve for artist-first funding.',
    ],
    meter: { grants: 60, programs: 55, reserve: 45 },
  },
  {
    name: 'Sovereign Stacker',
    amount: '$51',
    perks: [
      'Personalized video thank-you from a grant recipient (at signup)',
      'Named on the website supporters wall',
      'Annual year-in-review letter from the board',
    ],
    href: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_51_LINK?.trim() || 'https://buy.stripe.com/aFa3cw2PYd3TeygdTP83C08',
    impact: [
      'Delivers 1-3 micro-grants per year for working artists.',
      'Supports 6-12 workshop or residency seats annually.',
      'Keeps the reserve growing for long-horizon support.',
    ],
    meter: { grants: 75, programs: 70, reserve: 55 },
  },
  {
    name: 'Renaissance Guardian',
    amount: '$101',
    perks: [
      'Name a grant cycle',
      'Donor spotlight feature on site and newsletter',
      'Invitation to annual strategy call with the board',
      'Early review of grant applications before public announcement',
    ],
    href: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_101_LINK?.trim() || 'https://buy.stripe.com/3cIaEY4Y6fc1cq8bLH83C09',
    impact: [
      'Fuels 4+ micro-grants annually for bold creators.',
      'Sponsors full workshops or co-production moments.',
      'Accelerates the reserve that sustains the mission.',
    ],
    meter: { grants: 90, programs: 85, reserve: 70 },
  },
];

export default function MonthlyDonatePage() {
  const heroImage = '/donor-hype.JPG';
  const meterItems = [
    { key: 'grants', label: 'Grants' },
    { key: 'programs', label: 'Programs' },
    { key: 'reserve', label: 'Reserve' },
  ] as const;

  return (
    <main className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[url('/coin-holders.JPG')] bg-cover bg-center opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-background/50" />
      <FullBleedHero
        imageSrc={heroImage}
        imageAlt="Monthly donations support artists."
        label="Monthly Giving"
        title="Stack culture on sound money."
        description="Join the Sovereign Circle and power steady support for artist grants, workshops, and residencies."
      />

      <div className="relative mx-auto max-w-6xl px-8 py-14 sm:px-6">
        <div className="max-w-4xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Become a monthly donor
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Join the Sovereign Circle – empower artists every month.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            At Bitcoin for the Arts (BFTA), your monthly gift is a commitment to
            uncensorable money fueling uncensorable minds. As the NEA of the Bitcoin
            Era, we are breaking artists free from fiat decay, one sat at a time.
            Monthly donors ensure steady support for micro-grants, workshops, and
            residencies, creating a self-sustaining arts renaissance that no inflation
            or gatekeeper can touch.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Unlike one-time gifts, monthly contributions provide reliable fuel for our
            mission, allowing us to plan boldly and respond swiftly to artists&apos;
            needs. With our transparent 55/30/10/5 rule, you see exactly where your
            sats stack up: 55% to direct grants, 30% to programs, 10% to operations,
            and 5% to our eternal HODL Vault.
          </p>
        </div>

        <section className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            { label: 'Grants', value: '55%' },
            { label: 'Programs', value: '30%' },
            { label: 'Operations', value: '10%' },
            { label: 'HODL Vault', value: '5%' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border bg-background/90 p-5 text-center shadow-sm"
            >
              <div className="text-2xl font-semibold text-primary">{item.value}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
                {item.label}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-surface/80 p-6">
          <h2 className="text-xl font-semibold tracking-tight">Why go monthly?</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-5">
              <div className="text-sm font-semibold">Consistent empowerment</div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Your recurring gift helps artists escape economic volatility, funding
                Bitcoin wallets for dancers facing tour cuts or grants for musicians
                battling streaming royalties.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-5">
              <div className="text-sm font-semibold">Amplified reach</div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Monthly stacking compounds like Bitcoin itself, enabling more
                workshops (like Bitcoin for Performers) and co-productions with NYC
                icons like BAM or the Whitney.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-background/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight">
              See your impact multiply
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Monthly momentum
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Monthly giving turns steady support into bold outcomes. A $21 Hard Cap Hero
            gift can fund an artist&apos;s first Bitcoin wallet and spark sovereignty.
            Track the momentum in quarterly updates and on-chain reports.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-background/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight">
              See the monthly impact
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Donor spotlight
            </span>
          </div>
          <div className="mt-4 mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-black">
            <video
              src="/BFTA-donor-vid.MP4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full"
            />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Every month keeps the lights on for artists building uncensorable work.
          </p>
        </section>

        <section id="tiers" className="mt-10 scroll-mt-28">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              Monthly donation tiers
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Select amount & tier
            </span>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-surface/60 p-4">
            <div className="flex items-start gap-3">
              <svg
                viewBox="0 0 24 24"
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z"
                />
              </svg>
              <div>
                <div className="text-sm font-semibold">Perks stack up</div>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Every tier includes all perks from the tiers below it.
                  A Renaissance Guardian gets everything a Satoshi Supporter,
                  Orange Piller, Hard Cap Hero, and Sovereign Stacker receives — plus
                  their own exclusive benefits.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {tiers.map((tier, tierIndex) => {
              const prevTierName = tierIndex > 0 ? tiers[tierIndex - 1].name : null;
              return (
                <div
                  key={tier.name}
                  className={[
                    'rounded-2xl border bg-background p-6 shadow-sm',
                    tierIndex === tiers.length - 1
                      ? 'border-primary/40 ring-1 ring-primary/20'
                      : 'border-border',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">{tier.name}</div>
                      <div className="mt-1 text-sm text-muted">
                        {tier.amount} / month
                      </div>
                    </div>
                    {tierIndex === tiers.length - 1 ? (
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                        Most impact
                      </span>
                    ) : (
                      <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                        Monthly
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Your perks
                    </div>
                    <ul className="mt-2 space-y-2">
                      {tier.perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-2 text-sm leading-relaxed">
                          <svg
                            viewBox="0 0 20 20"
                            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                            aria-hidden="true"
                          >
                            <path
                              fill="currentColor"
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                    {prevTierName && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-2 text-xs text-muted">
                        <svg
                          viewBox="0 0 20 20"
                          className="h-3.5 w-3.5 shrink-0 text-primary/70"
                          aria-hidden="true"
                        >
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>
                          Plus everything in <strong>{prevTierName}</strong>{tierIndex > 1 ? ' and below' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl border border-border bg-surface/80 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Impact metrics
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-muted">
                      {tier.impact.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <svg
                            viewBox="0 0 24 24"
                            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.16" />
                            <path
                              d="M12 7.5v9M9.5 9.5h5"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 space-y-3">
                      {meterItems.map((metric) => {
                        const value = tier.meter[metric.key];
                        return (
                          <div key={metric.key}>
                            <div className="flex items-center justify-between text-[11px] text-muted">
                              <span>{metric.label}</span>
                              <span className="tabular-nums">{value}%</span>
                            </div>
                            <div className="mt-1 h-2 w-full overflow-hidden rounded-full border border-border bg-background">
                              <div
                                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(126,87,194,0.95),rgba(247,147,26,0.9))]"
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <a
                    href={tier.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={[
                      'mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition-colors hover:opacity-90',
                      tierIndex === tiers.length - 1
                        ? 'bg-primary text-white'
                        : 'bg-accent text-white',
                    ].join(' ')}
                  >
                    Choose {tier.amount} / month
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        <p className="mt-6 text-xs leading-relaxed text-muted">
          Impact metrics are illustrative estimates based on our allocation model and
          will evolve as data grows.
        </p>

        <div className="mt-10 rounded-2xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold tracking-tight">Tax perks</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            As a 501(c)(3) tax-exempt nonprofit, your gifts may be tax-deductible as
            allowed by law. Receipts are provided automatically.
          </p>
        </div>

        <section className="mt-6 rounded-2xl border border-border bg-primary text-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Sovereign Circle pledge
              </div>
              <div className="mt-2 text-xl font-semibold">
                Your monthly gift keeps art free and artists paid in sound money.
              </div>
            </div>
            <Link
              href="#tiers"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-primary transition-colors hover:opacity-90"
            >
              Choose a tier
            </Link>
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-border bg-surface/80 p-6">
          <h2 className="text-lg font-semibold tracking-tight">On-chain transparency</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Track your impact via our public main wallet and watch your sats turn into
            artist sovereignty.
          </p>
        </div>

        <div className="mt-8 text-center text-sm text-muted">
          Questions? Email{' '}
          <a
            href="mailto:donate@bitcoinforthearts.org"
            className="font-semibold underline underline-offset-4"
          >
            donate@bitcoinforthearts.org
          </a>
          . Your support is uncensorable — thank you for stacking with us! ⚡️
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/donate"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface"
          >
            Back to donate page
          </Link>
        </div>
      </div>
    </main>
  );
}
