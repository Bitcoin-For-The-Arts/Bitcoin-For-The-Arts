import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Why Bitcoin',
  description:
    'Why Bitcoin matters for artists: ownership, censorship resistance, and long-term creation.',
};

export default function WhyBitcoinPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <Link href="/artists" className="hover:underline">
              Artists
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">Why Bitcoin</span>
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Why Bitcoin?
          </h1>

          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            As an artist, you pour your soul into your work—only to watch galleries
            take huge cuts, grants dry up, and inflation eat your savings. Bitcoin
            changes that. It&apos;s not just “magic internet money”—it&apos;s{' '}
            <strong>uncensorable freedom</strong> for creators like you.
          </p>

          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Here&apos;s why every artist needs Bitcoin, explained simply, and what a
            “Bitcoin standard” could mean for art&apos;s future.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-surface p-5 text-sm text-muted">
            To learn more about Bitcoin, visit{' '}
            <a
              href="https://bitcoin.org/bitcoin.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-4"
            >
              the Bitcoin whitepaper
            </a>
            .
          </div>

          <div className="mt-10 space-y-10">
            <section>
              <h2 className="text-xl font-semibold tracking-tight">
                1. Bitcoin protects your earnings from theft (inflation &amp; fees)
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Imagine getting paid for a commission, but a portion of that money
                vanishes every year just sitting in your bank. That&apos;s inflation—the
                silent thief of fiat. Bitcoin is “sound money”: its supply is fixed
                at 21 million, so it can&apos;t be printed endlessly.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Sell a painting for $1,000 and save in Bitcoin—your
                purchasing power may hold up better over the long run than cash.
                Bitcoin is volatile, but it gives artists an alternative to a system
                designed for debasement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">
                2. Bitcoin gives you true ownership (no gatekeepers)
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Galleries, platforms, and banks can control your art and money—taking
                cuts, censoring content, or freezing accounts for “controversial”
                work. Bitcoin is peer-to-peer: supporters can pay you directly, with
                no middleman.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                A dancer censored on a platform can still be supported by
                direct payments. A writer can publish and receive support without
                permission. On a Bitcoin standard, artists can own their work and
                wealth—long-term.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">
                3. Bitcoin enables low time preference art (create without deadlines)
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Fiat systems push “high time preference”—rush jobs for quick cash.
                Bitcoin rewards patience and long-term thinking. A Bitcoin standard
                lets artists plan years ahead, crafting timeless work instead of
                chasing the next rent check.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Imagine funding a 5-year sculpture series or an
                epic film trilogy with staged Bitcoin grants. The Renaissance thrived
                on sound money; the next one can thrive on Bitcoin.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">
                4. Bitcoin builds community (direct fan support)
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Traditional funding is top-down: wait for grants, approvals, and
                gatekeepers. Bitcoin is bottom-up: supporters can send sats instantly,
                globally. It turns passive admirers into active patrons.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Small contributions from many supporters can add up to real,
                steady support—without asking permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold tracking-tight">
                5. Why join us? Bitcoin For The Arts makes it easy
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Our goal is to turn donations into real support for creators: fund
                you in Bitcoin, help you learn self-custody, and build community
                through workshops and programming. Your first grant can include help
                setting up a wallet and receiving Bitcoin safely.
              </p>
            </section>
          </div>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/grants"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              Apply for a grant
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              Donate
            </Link>
          </div>

          <p className="mt-8 text-sm leading-relaxed text-muted">
            Bitcoin isn&apos;t just money—it&apos;s a tool for uncensorable, abundant
            creative life. Let&apos;s build it together.
          </p>
        </div>
      </div>
    </main>
  );
}

