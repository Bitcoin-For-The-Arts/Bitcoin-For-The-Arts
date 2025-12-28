import Link from 'next/link';

export default function Home() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-14 sm:pb-20 sm:pt-18">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center rounded-full border border-black/10 bg-black/5 px-3 py-1 text-xs font-medium tracking-wide">
              Nonprofit • Bitcoin-native patronage
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Stack culture on sound money.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-black/70 sm:text-lg">
              Bitcoin for the Arts supports artists across disciplines with Bitcoin
              micro-grants, workshops, residencies, and productions — with radical
              transparency and a long-term reserve.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center rounded-md bg-orange-400 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-orange-500"
              >
                Donate Bitcoin
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-md border border-black/15 px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/5"
              >
                Read our mission
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-black/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Grants
                </div>
                <div className="mt-2 text-sm text-black/80">
                  Fast, small BTC grants for working artists.
                </div>
              </div>
              <div className="rounded-lg border border-black/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Programs
                </div>
                <div className="mt-2 text-sm text-black/80">
                  Workshops, residencies, and co-productions.
                </div>
              </div>
              <div className="rounded-lg border border-black/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-black/60">
                  Transparency
                </div>
                <div className="mt-2 text-sm text-black/80">
                  Public reporting and a Bitcoin reserve mandate.
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-orange-50 to-white p-6">
              <div className="text-sm font-semibold tracking-tight">
                The 55/30/10/5 rule
              </div>
              <p className="mt-2 text-sm leading-relaxed text-black/70">
                A simple, explicit allocation model so donors and artists know
                exactly what support means.
              </p>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <span className="font-medium">55%</span>
                  <span className="text-black/70">Artist grants</span>
                </div>
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <span className="font-medium">30%</span>
                  <span className="text-black/70">Programs</span>
                </div>
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <span className="font-medium">10%</span>
                  <span className="text-black/70">Operations</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">5%</span>
                  <span className="text-black/70">HODL vault reserve</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href="/grants"
                  className="inline-flex items-center justify-center rounded-md border border-black/15 px-4 py-2 text-sm font-semibold transition-colors hover:bg-black/5"
                >
                  Explore grants
                </Link>
                <a
                  href="https://github.com/Bitcoin-For-The-Arts/bitcoinforthearts-treasury"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md border border-black/15 px-4 py-2 text-sm font-semibold transition-colors hover:bg-black/5"
                >
                  View live treasury
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-black/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-start">
            <div className="md:col-span-5">
              <h2 className="text-2xl font-semibold tracking-tight">
                Built for artists. Built on Bitcoin.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-black/70">
                We fund artists across visual art, theater, dance, and music — and
                we do it with the hardest money ever known.
              </p>
            </div>
            <div className="md:col-span-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-black/10 bg-white p-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-black/60">
                    No gatekeepers
                  </div>
                  <p className="mt-2 text-sm text-black/75">
                    Micro-grants designed to move quickly and help artists keep
                    creating.
                  </p>
                </div>
                <div className="rounded-lg border border-black/10 bg-white p-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-black/60">
                    No inflation
                  </div>
                  <p className="mt-2 text-sm text-black/75">
                    A reserve policy so support compounds over time instead of
                    decaying.
                  </p>
                </div>
                <div className="rounded-lg border border-black/10 bg-white p-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-black/60">
                    Public accountability
                  </div>
                  <p className="mt-2 text-sm text-black/75">
                    Clear allocations, public reporting, and transparent
                    fundraising goals.
                  </p>
                </div>
                <div className="rounded-lg border border-black/10 bg-white p-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-black/60">
                    Community-first
                  </div>
                  <p className="mt-2 text-sm text-black/75">
                    Events and programming that connect artists and Bitcoiners in
                    real life.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center rounded-md border border-black/15 px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/5"
                >
                  See events
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md border border-black/15 px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/5"
                >
                  Get in touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
