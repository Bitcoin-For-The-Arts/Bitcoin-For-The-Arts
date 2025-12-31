import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Artists',
  description:
    'Artist spotlights and updates from Bitcoin for the Arts — and how to be featured.',
};

export default function ArtistsPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Artist spotlights
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Artists we support (coming soon).
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            We’re building a public archive of artists, projects, and grants — and a
            place to share updates from funded work.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/grants"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              Apply for a grant
            </Link>
            <a
              href="mailto:hello@bitcoinforthearts.org?subject=Artist%20spotlight%20submission"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface"
            >
              Submit your work
            </a>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 className="text-lg font-semibold tracking-tight">
              What we’ll feature here
            </h2>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
              <li>Artist profiles + portfolios</li>
              <li>Grant announcements + on-chain receipts (when possible)</li>
              <li>Behind-the-scenes process notes</li>
              <li>Premieres, shows, and recordings</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold tracking-tight">
              Want to be featured?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Send links to your work and a short project summary. If you’ve
              received a grant, include an update and where people can see the
              finished piece.
            </p>
            <div className="mt-6">
              <a
                href="mailto:hello@bitcoinforthearts.org?subject=Artist%20spotlight%20submission"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-surface"
              >
                Email submissions
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

