import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Programming',
  description:
    'Workshops, residencies, and productions connecting artists and the Bitcoin community.',
};

export default function ProgrammingPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Workshops • residencies • productions
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Programming that brings artists and Bitcoiners together.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Beyond grants, we build spaces for artists to learn, collaborate, and
            present work — from intimate workshops to public performances.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              Upcoming events
            </Link>
            <a
              href="mailto:hello@bitcoinforthearts.org?subject=Programming%20proposal"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface"
            >
              Propose a program
            </a>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-6">
            <div className="text-sm font-semibold tracking-tight">
              Bitcoin For Artists Workshops
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Practical sessions on self-custody, receiving Bitcoin, and long-term
              financial sovereignty for creators.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-6">
            <div className="text-sm font-semibold tracking-tight">Residencies</div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Time and space to create — with light-touch support and community
              connection.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background p-6">
            <div className="text-sm font-semibold tracking-tight">
              Co-Productions & Showcases
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Live and digital productions that elevate artist work and bring
              patrons along for the process.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-surface p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h2 className="text-xl font-semibold tracking-tight">
                Want To Host Something In Your City?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                If you’re an artist, venue, or community organizer, we’d love to
                collaborate on workshops, screenings, salons, or performances.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <a
                href="mailto:hello@bitcoinforthearts.org?subject=Host%20a%20Bitcoin%20for%20the%20Arts%20event"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-surface"
              >
                Contact us
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

