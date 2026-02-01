import type { Metadata } from 'next';
import BtcPayDonateWidget from '@/components/BtcPayDonateWidget';
import WaysToGive from '@/components/WaysToGive';
import Link from 'next/link';
import FullBleedHero from '@/components/FullBleedHero';
import StripeCustomDonateForm from '@/components/StripeCustomDonateForm';

export const metadata: Metadata = {
  title: 'Donate',
  description:
    'Donate Bitcoin to support artists through micro-grants and programming.',
};

export default function DonatePage({
}: {
  searchParams?: { amount?: string };
}) {
  const heroImage = process.env.NEXT_PUBLIC_HERO_DONATE_IMAGE ?? '/bitcoin band.JPG';
  const ein = process.env.NEXT_PUBLIC_BFTA_EIN?.trim();
  const normalizeStripeUrl = (value?: string) => {
    const trimmed = value?.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('buy.stripe.com')) {
      return `https://${trimmed}`;
    }
    return undefined;
  };

  const stripeOneTimeUrl = normalizeStripeUrl(
    process.env.NEXT_PUBLIC_STRIPE_DONATION_LINK,
  );
  const stripeOneTimeCoverFeesUrl = normalizeStripeUrl(
    process.env.NEXT_PUBLIC_STRIPE_DONATION_LINK_COVER_FEES,
  );
  const hasStripeOneTime = Boolean(stripeOneTimeUrl);
  const hasStripeCoverFees = Boolean(stripeOneTimeCoverFeesUrl);

  return (
    <main className="bg-background">
      <FullBleedHero
        imageSrc={heroImage}
        imageAlt="Support artists with Bitcoin."
        label="Donate"
        title="Fund artists. Strengthen sovereign creativity."
        description="Give in Bitcoin, fiat, stocks, or planned gifts — and help build a long-term reserve for creators."
      />

      <div className="mx-auto max-w-6xl px-8 py-14 sm:px-6">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Support artists with Bitcoin
          </div>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Donate to Bitcoin for the Arts.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Your donation helps fund artist micro-grants, workshops, residencies, and
            productions — and supports a long-term Bitcoin reserve.
          </p>
          <div className="mt-5 rounded-2xl border border-border bg-surface/80 p-4 text-sm text-muted">
            Bitcoin For The Arts, Inc. is a 501(c)(3) tax-exempt nonprofit. Donations
            may be tax-deductible as allowed by law.
            {ein ? (
              <>
                <br />
                <span className="font-semibold text-foreground">EIN:</span> {ein}
              </>
            ) : null}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/grants"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface"
            >
              Learn about grants
            </Link>
            <Link
              href="/about/governance"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface"
            >
              Governance & reporting
            </Link>
          </div>
        </div>

        <div id="card" className="mt-10 rounded-2xl border border-border bg-background p-6">
          <h2 className="text-xl font-semibold tracking-tight">Donate by card</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Give securely by card. Choose one-time or monthly support to fuel artist
            grants and programming.
          </p>

          <StripeCustomDonateForm />

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {hasStripeOneTime ? (
              <>
                <a
                  href={stripeOneTimeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
                >
                  Give once
                </a>
                {hasStripeCoverFees ? (
                  <a
                    href={stripeOneTimeCoverFeesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface"
                  >
                    Give once (cover fees)
                  </a>
                ) : null}
              </>
            ) : (
              <a
                href="mailto:donate@bitcoinforthearts.org?subject=Credit%20card%20donation"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface"
              >
                Email to donate
              </a>
            )}

            <Link
              href="/donate/monthly"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface"
            >
              Give monthly
            </Link>
          </div>
          {!hasStripeOneTime ? (
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Add a Stripe payment link to enable instant card donations.
            </p>
          ) : null}
          {hasStripeOneTime && !hasStripeCoverFees ? (
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Want to offer a “cover fees” option? Add a second Stripe Payment Link and set{' '}
              <span className="font-semibold text-foreground">
                NEXT_PUBLIC_STRIPE_DONATION_LINK_COVER_FEES
              </span>
              .
            </p>
          ) : null}
        </div>

        <WaysToGive />

        <section id="bitcoin" className="mt-10 scroll-mt-28">
          <BtcPayDonateWidget />
        </section>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold tracking-tight">
            Where The Money Goes
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            We follow a clear allocation model: 55% grants, 30% programs, 10%
            operations, 5% long-term reserve.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-background p-4 text-center">
              <div className="text-xl font-semibold">55%</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-muted">
                Grants
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4 text-center">
              <div className="text-xl font-semibold">30%</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-muted">
                Programs
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4 text-center">
              <div className="text-xl font-semibold">10%</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-muted">
                Ops
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4 text-center">
              <div className="text-xl font-semibold">5%</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-muted">
                Reserve
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

