import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Programming',
  description:
    'Workshops, residencies, and productions connecting artists and the Bitcoin community.',
};

export default function ProgrammingPage() {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-black/60">
            Workshops • residencies • productions
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Programming that brings artists and Bitcoiners together.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-black/70 sm:text-lg">
            Beyond grants, we build spaces for artists to learn, collaborate, and
            present work — from intimate workshops to public performances.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black/85"
            >
              Upcoming events
            </Link>
            <a
              href="mailto:hello@bitcoinforthearts.org?subject=Programming%20proposal"
              className="inline-flex items-center justify-center rounded-md border border-black/15 px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/5"
            >
              Propose a program
            </a>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-black/10 p-6">
            <div className="text-sm font-semibold tracking-tight">
              Bitcoin for artists workshops
            </div>
            <p className="mt-2 text-sm leading-relaxed text-black/70">
              Practical sessions on self-custody, receiving Bitcoin, and long-term
              financial sovereignty for creators.
            </p>
          </div>
          <div className="rounded-xl border border-black/10 p-6">
            <div className="text-sm font-semibold tracking-tight">Residencies</div>
            <p className="mt-2 text-sm leading-relaxed text-black/70">
              Time and space to create — with light-touch support and community
              connection.
            </p>
          </div>
          <div className="rounded-xl border border-black/10 p-6">
            <div className="text-sm font-semibold tracking-tight">
              Co-productions & showcases
            </div>
            <p className="mt-2 text-sm leading-relaxed text-black/70">
              Live and digital productions that elevate artist work and bring
              patrons along for the process.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-black/10 bg-black/[0.02] p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h2 className="text-xl font-semibold tracking-tight">
                Want to host something in your city?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-black/70">
                If you’re an artist, venue, or community organizer, we’d love to
                collaborate on workshops, screenings, salons, or performances.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <a
                href="mailto:hello@bitcoinforthearts.org?subject=Host%20a%20Bitcoin%20for%20the%20Arts%20event"
                className="inline-flex items-center justify-center rounded-md border border-black/15 bg-white px-5 py-3 text-sm font-semibold transition-colors hover:bg-black/5"
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

