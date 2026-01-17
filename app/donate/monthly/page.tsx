import type { Metadata } from 'next';
import Link from 'next/link';
import FullBleedHero from '@/components/FullBleedHero';

export const metadata: Metadata = {
  title: 'Monthly Giving',
  description:
    'Join the Sovereign Circle with a monthly donation that funds artist grants, workshops, and residencies.',
};

const tiers = [
  {
    name: 'Satoshi Supporter',
    amount: '$5',
    sats: '5,258 sats / mo',
    perk: 'Monthly impact updates.',
    href: 'https://buy.stripe.com/4gMbJ21LU9RHgGo6rn83C05',
  },
  {
    name: 'Orange Piller Patron',
    amount: '$11',
    sats: '11,568 sats / mo',
    perk: 'Shoutouts in our newsletter + early access to webinar recordings.',
    href: 'https://buy.stripe.com/6oU5kE8aibZP3TCbLH83C06',
  },
  {
    name: 'Hard Cap Hero',
    amount: '$21',
    sats: '21,000 sats / mo',
    perk: 'Honor the 21M cap — custom stickers + artist priority.',
    href: 'https://buy.stripe.com/cNi8wQ9em5Br75OeXT83C0a',
  },
  {
    name: 'Sovereign Stacker',
    amount: '$51',
    sats: '53,636 sats / mo',
    perk: 'Personalized thank-you from an artist + invite to virtual meetups.',
    href: 'https://buy.stripe.com/aFa3cw2PYd3TeygdTP83C08',
  },
  {
    name: 'Renaissance Guardian',
    amount: '$101',
    sats: '106,220 sats+ / mo',
    perk: 'Name a grant + board shoutout.',
    href: 'https://buy.stripe.com/3cIaEY4Y6fc1cq8bLH83C09',
  },
];

export default function MonthlyDonatePage() {
  const heroImage = '/donor-hype.JPG';

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
              See the monthly impact
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Donor spotlight
            </span>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-black">
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

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="rounded-2xl border border-border bg-background p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">{tier.name}</div>
                    <div className="mt-1 text-sm text-muted">
                      {tier.amount} | {tier.sats}
                    </div>
                  </div>
                  <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    Monthly
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">{tier.perk}</p>
                <a
                  href={tier.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
                >
                  Choose {tier.amount} monthly
                </a>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 rounded-2xl border border-border bg-background p-6">
          <h2 className="text-lg font-semibold tracking-tight">Tax perks</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            As a 501(c)(3) pending nonprofit, your gifts may be tax-deductible
            retroactively upon approval. Receipts are provided automatically.
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
