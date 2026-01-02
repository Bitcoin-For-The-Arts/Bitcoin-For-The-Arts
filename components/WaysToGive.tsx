import Link from 'next/link';

type Way = {
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
};

const ways: Way[] = [
  {
    title: 'Cash & Monthly Gifts',
    description:
      'One-time or recurring via credit card/check (Stripe). Monthly patrons can opt into a public leaderboard spot.',
    ctaLabel: 'Donate (fiat)',
    href: 'mailto:hello@bitcoinforthearts.org?subject=Fiat%20donation%20(Stripe)%20setup',
  },
  {
    title: 'Bitcoin & Lightning',
    description:
      'Donate on-chain to our wallet or use BTCPay (BTC + Lightning). On-chain proof can be reflected in our public treasury.',
    ctaLabel: 'Donate BTC',
    href: '/donate#bitcoin',
  },
  {
    title: 'Stocks, Bonds, Mutual Funds',
    description:
      'Potentially avoid capital gains tax by donating appreciated securities. We can liquidate and convert to BTC.',
    ctaLabel: 'Learn more',
    href: '/donate/guides/securities',
  },
  {
    title: 'IRA Qualified Charitable Distributions (QCDs)',
    description:
      'For eligible donors: give directly from an IRA and count toward RMD. We can convert proceeds to BTC.',
    ctaLabel: 'Get the guide',
    href: '/donate/guides/ira-qcd',
  },
  {
    title: 'Donor-Advised Funds (DAFs)',
    description:
      'Recommend a grant from your DAF to support our mission. We can convert proceeds to BTC.',
    ctaLabel: 'How to donate',
    href: 'mailto:hello@bitcoinforthearts.org?subject=DAF%20donation%20instructions',
  },
  {
    title: 'Corporate Matching & Workplace Giving',
    description:
      'Some employers match donations. Ask if your company supports matching or workplace giving (Benevity/YourCause/etc.).',
    ctaLabel: 'Ask about matching',
    href: 'mailto:hello@bitcoinforthearts.org?subject=Employer%20matching%20donation',
  },
  {
    title: 'Bequests & Estate Planning',
    description:
      'Name us in your will or trust to create a future legacy for uncensorable art.',
    ctaLabel: 'Estate planning',
    href: 'mailto:hello@bitcoinforthearts.org?subject=Bequest%20and%20estate%20planning',
  },
  {
    title: 'Life Insurance Policies',
    description:
      'Make us a beneficiary or donate a policy to support the mission long-term.',
    ctaLabel: 'Guide',
    href: '/donate/guides/life-insurance',
  },
  {
    title: 'Real Estate, Vehicles, Or In-Kind Gifts',
    description:
      'Donate property, vehicles, or goods. We can coordinate liquidation and convert proceeds to BTC.',
    ctaLabel: 'Contact us',
    href: '/contact',
  },
  {
    title: 'Royalties/IP Or Other Assets',
    description:
      'Assign royalties or other asset income to support artists over time.',
    ctaLabel: 'Details',
    href: 'mailto:hello@bitcoinforthearts.org?subject=Royalties%2FIP%20gift',
  },
];

export default function WaysToGive() {
  return (
    <section className="mt-10 rounded-2xl border border-border bg-background p-6">
      <h2 className="text-xl font-semibold tracking-tight">Ways To Give</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Support uncensorable art—donate in Bitcoin, fiat, stocks, or planned gifts.
        Where possible, fiat contributions can be converted to BTC (volatility
        policy applies).
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {ways.map((w) => (
          <div
            key={w.title}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="text-sm font-semibold tracking-tight">{w.title}</div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{w.description}</p>
            <div className="mt-4">
              {w.href.startsWith('/') ? (
                <Link
                  href={w.href}
                  className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
                >
                  {w.ctaLabel}
                </Link>
              ) : (
                <a
                  href={w.href}
                  className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
                >
                  {w.ctaLabel}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Questions? Email{' '}
        <a
          href="mailto:hello@bitcoinforthearts.org"
          className="font-semibold underline underline-offset-4"
        >
          hello@bitcoinforthearts.org
        </a>
        . Tax treatment depends on your jurisdiction and the organization’s status;
        consult your advisor.
      </p>
    </section>
  );
}

