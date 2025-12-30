import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Grants',
  description:
    'Bitcoin micro-grants for artists across disciplines. Learn how to apply and what we fund.',
};

export default function GrantsPage() {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-black/60">
            Bitcoin micro-grants
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Grants for working artists — paid in Bitcoin.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-black/70 sm:text-lg">
            We support artists across visual art, theater, dance, and music. Grants
            are designed to be small, fast, and impactful — helping you keep
            creating.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:hello@bitcoinforthearts.org?subject=Grant%20application"
              className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black/85"
            >
              Apply via email
            </a>
            <Link
              href="/donate"
              className="inline-flex items-center justify-center rounded-md border border-black/15 px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/5"
            >
              Fund a grant
            </Link>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-black/10 p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-black/60">
              What we fund
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-black/75">
              <li>Creation costs (materials, studio time, rehearsal space)</li>
              <li>Production costs (recording, staging, print, fabrication)</li>
              <li>Travel tied to a specific project or performance</li>
              <li>Artist-led community programming</li>
            </ul>
          </div>
          <div className="rounded-xl border border-black/10 p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-black/60">
              Who can apply
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-black/75">
              <li>Independent artists and small collectives</li>
              <li>Any discipline: visual, theater, dance, music</li>
              <li>Working on a specific project with clear next steps</li>
              <li>Open to all geographies (subject to program capacity)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-black/10 p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-black/60">
              What to send
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-black/75">
              <li>Your name + links (website, portfolio, socials)</li>
              <li>Project description (what, why, and timeline)</li>
              <li>Budget + requested amount</li>
              <li>A Bitcoin address to receive funds</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-black/10 bg-black/[0.02] p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h2 className="text-xl font-semibold tracking-tight">
                Transparent by default
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-black/70">
                Our goal is radical clarity: how funds are allocated, how grants are
                paid, and how reserves are maintained over time.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <a
                href="https://github.com/Bitcoin-For-The-Arts/bitcoinforthearts-treasury"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-black/15 bg-white px-5 py-3 text-sm font-semibold transition-colors hover:bg-black/5"
              >
                View treasury
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

