import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Webinars — Bitcoin for the Arts',
  description:
    'Creator-focused webinars on why Bitcoin matters for artists: practical custody, getting paid globally, and building long-term sovereignty.',
};

const pdfUrl =
  'https://drive.google.com/file/d/1n9EyXi933K5KIe8ljPgEb5KQJdNGMZYp/view?usp=drive_link';
const gammaUrl = 'https://copy-of-bitcoin-for-arti-1sbvsbl.gamma.site/';

export default function EducationWebinarPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-4xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Education • Webinars
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Bitcoin Webinars for Artists.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Practical, creator-focused presentations on Bitcoin: custody, getting
            paid, pricing in sats, and building long-term sovereignty. All materials
            are published under our open license (CC&nbsp;BY&nbsp;4.0).
          </p>

          {/* ── Featured: Bitcoin in Practice for Artists ─────────────── */}
          <section className="mt-10">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-3xl border border-border bg-surface/80 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src="/1_Bitcoin-in-Practice-for-Artists.png"
                  alt="Bitcoin in Practice for Artists — webinar cover"
                  fill
                  priority
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
              </div>
              <div className="p-6 sm:p-8">
                <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                  New — PDF Webinar
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Bitcoin in Practice for Artists
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  A hands-on guide for artists ready to put Bitcoin to work — covering
                  real-world custody setups, accepting payments, pricing strategies, and
                  the practical steps between &ldquo;I&rsquo;ve heard of Bitcoin&rdquo; and
                  &ldquo;I&rsquo;m using it every day.&rdquo;
                </p>
                <div className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-6 py-2 text-sm font-semibold text-white transition-colors group-hover:opacity-90">
                  View PDF presentation &rarr;
                </div>
              </div>
            </a>

            <div className="mt-4 rounded-2xl border border-border bg-surface/60 p-5 text-sm text-muted">
              <div className="font-semibold text-foreground">License</div>
              <div className="mt-2">
                This webinar is published under{' '}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  Creative Commons Attribution 4.0 International (CC BY 4.0)
                </a>
                . You may share and adapt the material with attribution:{' '}
                <span className="font-medium text-foreground">
                  &ldquo;Bitcoin for the Arts (bitcoinforthearts.org) — CC BY 4.0&rdquo;
                </span>
              </div>
            </div>
          </section>

          {/* ── Original webinar: Unlocking New Creative Freedom ────── */}
          <section className="mt-14">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              Webinar
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Bitcoin for Artists: Unlocking New Creative Freedom.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Study the webinar below. It&rsquo;s embedded from Gamma so it keeps the
              exact presentation format and navigation.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="relative w-full" style={{ paddingTop: '64.2857%' }}>
                <iframe
                  src={gammaUrl}
                  title="Bitcoin for Artists: Unlocking New Creative Freedom."
                  allow="fullscreen"
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <a
                href={gammaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-2 text-sm font-semibold transition-colors hover:bg-surface"
              >
                Open full-screen
              </a>
              <Link
                href="/education/open"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-2 text-sm font-semibold transition-colors hover:bg-surface"
              >
                Open education materials (CC BY 4.0)
              </Link>
            </div>

            <div className="mt-4 text-xs leading-relaxed text-muted">
              If you see a Gamma login, open the webinar in a new tab and make sure
              the Gamma page is published publicly (and embedding is allowed).
            </div>
          </section>

          <div className="mt-12">
            <Link
              href="/education"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface"
            >
              &larr; Back to Education
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
