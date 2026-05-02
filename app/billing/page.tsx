import type { Metadata } from 'next';
import BillingPortalRequestForm from '@/components/BillingPortalRequestForm';

export const metadata: Metadata = {
  title: 'Billing & subscription help',
  description: 'Manage your Bitcoin for the Arts subscription and billing.',
};

export default function BillingPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const status = (searchParams?.status ?? '').trim();
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Billing support
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Manage your subscription
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            If you’re a monthly donor and want to update your payment method, view
            invoices, or cancel your subscription, request a secure Stripe customer
            portal link by email below.
          </p>

          {status === 'expired' || status === 'missing' || status === 'unavailable' ? (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm"
            >
              {status === 'expired' ? (
                <div>
                  That link has expired. Please request a new link below.
                </div>
              ) : status === 'missing' ? (
                <div>
                  Missing token. Please request a new link below.
                </div>
              ) : (
                <div>
                  Subscription self-service is temporarily unavailable. Please email{' '}
                  <a className="underline underline-offset-4" href="mailto:donate@bitcoinforthearts.org">
                    donate@bitcoinforthearts.org
                  </a>
                  .
                </div>
              )}
            </div>
          ) : null}

          <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
            <BillingPortalRequestForm />
          </div>

          <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
            <h2>Notes</h2>
            <ul>
              <li>
                If you recently donated, Stripe may also send an invoice/receipt email
                depending on your settings.
              </li>
              <li>
                For help, email{' '}
                <a href="mailto:donate@bitcoinforthearts.org">donate@bitcoinforthearts.org</a>.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

