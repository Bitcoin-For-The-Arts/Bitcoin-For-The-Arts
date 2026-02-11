import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Education Webinars',
  description:
    'Free Bitcoin education webinars for artists — wallet setup, self-custody, Lightning payments, micro-grants, and more.',
};

const GAMMA_EMBED_URL =
  'https://copy-of-bitcoin-for-arti-1sbvsbl.gamma.site/';

const WEBINAR_2_PDF =
  'https://drive.google.com/file/d/1n9EyXi933K5KIe8ljPgEb5KQJdNGMZYp/view?usp=drive_link';

export default function WebinarPage() {
  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-14">
        {/* Page header */}
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <Link href="/education" className="hover:underline">
              Education
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">Webinars</span>
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Education Webinars.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Practical, no-jargon sessions designed for working artists. Learn
            how to use Bitcoin, protect your earnings, and build a sovereign
            creative life.
          </p>
        </div>

        {/* ─── Webinar 2: Hero Card ─── */}
        <section className="mt-12">
          <div className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white mb-4">
            Latest Webinar
          </div>

          <a
            href={WEBINAR_2_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="group block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
              <Image
                src="/1_Bitcoin-in-Practice-for-Artists.png"
                alt="Bitcoin in Practice for Artists — Education Webinar 2 cover."
                fill
                priority
                className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 1152px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Bitcoin in Practice for Artists
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
                  Hands-on session: set up a wallet, accept Bitcoin for your art,
                  Lightning payments, apply for a micro-grant, and security best
                  practices.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors group-hover:bg-white/30">
                  View PDF
                  <span aria-hidden="true">&rarr;</span>
                </div>
              </div>
            </div>
          </a>

          {/* Topics covered */}
          <div className="mt-6 rounded-2xl border border-border bg-background p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              What you&apos;ll learn
            </div>
            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                'Setting up your first Bitcoin wallet',
                'Self-custody for creative independence',
                'Three ways to accept Bitcoin for your art',
                'The Lightning Network & instant payments',
                'Building a Bitcoin patron community',
                'Tax basics for artists receiving Bitcoin',
                'How to apply for a BFTA micro-grant ($500–$2,000)',
                'Security best practices',
              ].map((topic) => (
                <li
                  key={topic}
                  className="flex items-start gap-2 text-sm leading-relaxed text-muted"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  {topic}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={WEBINAR_2_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 border border-accent/60"
              >
                Download the PDF
              </a>
              <a
                href="https://github.com/Bitcoin-For-The-Arts/education"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-6 py-3 text-sm font-semibold transition-colors hover:opacity-90"
              >
                Open education materials
              </a>
            </div>
          </div>
        </section>

        {/* ─── Webinar 1: Gamma Embed ─── */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">
            Webinar 1: Bitcoin for Artists &mdash; Unlocking New Creative Freedom
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Our inaugural webinar on why Bitcoin matters for artists: inflation,
            censorship resistance, getting paid globally, and building long-term
            sovereignty. Embedded from Gamma so it keeps the exact presentation
            format and navigation.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={GAMMA_EMBED_URL}
                title="Bitcoin for Artists: Unlocking New Creative Freedom — Gamma presentation"
                className="absolute inset-0 h-full w-full"
                allow="fullscreen"
                loading="lazy"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted">
              <span className="font-semibold text-foreground">Open-licensed materials:</span>{' '}
              Prefer a self-hosted, openly licensed version? Use our{' '}
              <a
                href="https://github.com/Bitcoin-For-The-Arts/education"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-4"
              >
                open education materials
              </a>{' '}
              (CC BY 4.0).
            </div>
            <a
              href={GAMMA_EMBED_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-surface whitespace-nowrap"
            >
              Open full-screen
            </a>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-background p-4 text-xs text-muted">
            If you see a Gamma login, open the webinar in a new tab and make
            sure the Gamma page is published publicly (and embedding is allowed).
          </div>
        </section>

        {/* Back link */}
        <div className="mt-14">
          <Link
            href="/education"
            className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-6 py-3 text-sm font-semibold transition-colors hover:opacity-90"
          >
            &larr; Back to Education
          </Link>
        </div>
      </div>
    </main>
  );
}
