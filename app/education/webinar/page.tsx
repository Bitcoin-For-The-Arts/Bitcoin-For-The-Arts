import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Bitcoin for Artists: Unlocking New Creative Freedom',
  description:
    'A creator-focused webinar on why Bitcoin matters for artists: inflation, censorship resistance, getting paid globally, and building long-term sovereignty.',
};

export default function EducationWebinarPage() {
  const webinarUrl = 'https://copy-of-bitcoin-for-arti-1sbvsbl.gamma.site/';
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-4xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Education • Webinar
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Bitcoin for Artists: Unlocking New Creative Freedom.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Study the webinar below. It’s embedded from Gamma so it keeps the exact
            presentation format and navigation.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="relative w-full" style={{ paddingTop: '64.2857%' }}>
              <iframe
                src={webinarUrl}
                title="Bitcoin for Artists: Unlocking New Creative Freedom."
                allow="fullscreen"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a
              href={webinarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-2 text-sm font-semibold transition-colors hover:bg-surface"
            >
              Open full-screen
            </a>
            <Link
              href="/education"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-2 text-sm font-semibold transition-colors hover:bg-surface"
            >
              Back to Education
            </Link>
          </div>

          <div className="mt-6 text-xs leading-relaxed text-muted">
            If you see a Gamma login, open the webinar in a new tab and make sure
            the Gamma page is published publicly (and embedding is allowed).
          </div>
        </div>
      </div>
    </main>
  );
}

