import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Open education materials',
  description:
    'Free, publicly available Bitcoin education materials for artists, published under an open license.',
};

type Material = {
  title: string;
  description: string;
  href: string;
  format: 'Markdown' | 'PDF' | 'Video' | 'Link';
};

const materials: Material[] = [
  {
    title: 'Bitcoin in Practice for Artists — PDF Webinar',
    description:
      'A hands-on guide covering real-world custody setups, accepting payments, pricing strategies, and the practical steps to using Bitcoin every day.',
    href: 'https://drive.google.com/file/d/1n9EyXi933K5KIe8ljPgEb5KQJdNGMZYp/view?usp=drive_link',
    format: 'PDF',
  },
  {
    title: 'Bitcoin for Artists — Open Webinar Notes',
    description:
      'A Bitcoin-only, creator-focused introduction: getting paid, custody basics, pricing in sats, and record-keeping.',
    href: '/resources/education/bitcoin-for-artists-webinar.md',
    format: 'Markdown',
  },
  {
    title: 'BTCPay Setup Guide (BTC + Lightning)',
    description: 'Accept BTC without third parties using BTCPay Server.',
    href: '/resources/btcpay-setup-guide.md',
    format: 'Markdown',
  },
  {
    title: 'Donor receipt template',
    description: 'Simple donation record-keeping template.',
    href: '/resources/donor-receipt-template.md',
    format: 'Markdown',
  },
];

export default function OpenEducationMaterialsPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Education
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Open education materials
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            These materials are free for anyone to access and reuse. Unless
            otherwise noted, they are published under an open license (
            <strong>CC BY 4.0</strong>).
          </p>

          <div className="mt-6 rounded-2xl border border-border bg-surface/60 p-5 text-sm text-muted">
            <div className="font-semibold text-foreground">
              License (default for education materials)
            </div>
            <div className="mt-2">
              Creative Commons Attribution 4.0 International (CC BY 4.0):{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                view terms
              </a>
              .
            </div>
            <div className="mt-3">
              Local license files:{' '}
              <a
                href="/resources/education/README.md"
                className="underline underline-offset-4"
              >
                README
              </a>{' '}
              and{' '}
              <a
                href="/resources/education/LICENSE.md"
                className="underline underline-offset-4"
              >
                LICENSE
              </a>
              .
            </div>
          </div>

          <div className="mt-10 space-y-4">
            {materials.map((m) => (
              <div
                key={m.href}
                className="rounded-2xl border border-border bg-background p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-lg font-semibold tracking-tight">
                    {m.title}
                  </div>
                  <div className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    {m.format}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {m.description}
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <a
                    href={m.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
                  >
                    Open
                  </a>
                  <a
                    href={m.href}
                    download
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-2 text-sm font-semibold transition-colors hover:bg-surface"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/education"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface"
            >
              Back to Education
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

