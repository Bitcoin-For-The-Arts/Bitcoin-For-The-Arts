import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Artists',
  description:
    'Artist spotlights and updates from Bitcoin for the Arts — and how to be featured.',
};

export default function ArtistsPage() {
  return (
    <main className="bg-background relative overflow-hidden min-h-screen">
      {/* Background image (50% opacity) */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/image.jpg"
          alt=""
          fill
          priority={false}
          className="object-cover object-center opacity-50"
        />
        {/* Soft blend layer for readability */}
        <div className="absolute inset-0 bg-background/60" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Artist Spotlights
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
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 border border-accent/60"
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
              What We’ll Feature Here
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
              Want To Be Featured?
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

        <section className="mt-12">
          <div className="max-w-4xl">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              Testimonials • What micro-grants unlock
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              “What would a $500–$2,000 Bitcoin-native micro-grant unlock in 30 days?”
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              We asked artists on Nostr. These responses are practical, specific, and exactly why small grants matter:
              time, materials, travel, studio sessions, and the ability to say “yes” to opportunities.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <figure className="rounded-2xl border border-border bg-background p-6">
                <blockquote className="text-sm leading-relaxed text-muted">
                  “3/5s of a new sound bag, craft services and wardrobe for an indie film, or 1/3 of a camera.”
                </blockquote>
                <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                  FuzzyNibs • Nostr
                </figcaption>
              </figure>

              <figure className="rounded-2xl border border-border bg-background p-6">
                <blockquote className="text-sm leading-relaxed text-muted">
                  “$500 would unlock a week to focus on recording and producing music instead of the casual work I need
                  to cover bills…”
                </blockquote>
                <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                  Matt Finlay • Nostr
                </figcaption>
              </figure>

              <figure className="rounded-2xl border border-border bg-background p-6">
                <blockquote className="text-sm leading-relaxed text-muted">
                  “Right now, I’m applying for juried art fair booths — $500 to $1,500 depending on the city/venue. I do
                  15–20 a year and pay 4–6 months in advance. The grant would help alleviate financial stress. Paying for
                  shows and travel is my biggest expense.”
                </blockquote>
                <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                  unit • Nostr
                </figcaption>
              </figure>

              <figure className="rounded-2xl border border-border bg-background p-6">
                <blockquote className="text-sm leading-relaxed text-muted">
                  “I would adopt an alpaca at the farm down the street… they shear in May and you get the wool. I’d use
                  the felt to make insulation for my mittens — plus fabric, materials, a heat press, and dies to make
                  more sizes.”
                </blockquote>
                <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                  sunavaunt • Nostr
                </figcaption>
              </figure>

              <figure className="rounded-2xl border border-border bg-background p-6 md:col-span-2">
                <blockquote className="text-sm leading-relaxed text-muted">
                  “For any of our artists, that would unlock a good chunk of studio time to record a handful of tracks.
                  If the opportunity arose and the stars aligned for a show or tour, that would cover most of
                  travel/lodging.”
                </blockquote>
                <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                  Hash Power Music • Nostr
                </figcaption>
              </figure>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/donate"
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
              >
                Fund micro-grants
              </Link>
              <Link
                href="/grants"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface"
              >
                Learn about grants
              </Link>
            </div>

            <div className="mt-3 text-xs text-muted">
              Want to share what a micro-grant would unlock for you? Email{' '}
              <a
                href="mailto:hello@bitcoinforthearts.org?subject=Micro-grant%20impact%20story"
                className="font-semibold underline underline-offset-4"
              >
                hello@bitcoinforthearts.org
              </a>
              .
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

