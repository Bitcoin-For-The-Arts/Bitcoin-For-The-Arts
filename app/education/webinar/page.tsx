import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Webinars — Bitcoin for the Arts',
  description:
    'Creator-focused webinars on why Bitcoin matters for artists: practical custody, getting paid globally, and building long-term sovereignty.',
};

const gammaUrl = 'https://copy-of-bitcoin-for-arti-1sbvsbl.gamma.site/';
const pdfUrl =
  'https://drive.google.com/file/d/1n9EyXi933K5KIe8ljPgEb5KQJdNGMZYp/view?usp=drive_link';

/* ── Slide data for "What Is Money?" webinar ──────────────────── */
const whatIsMoneySlides = [
  {
    number: 1,
    title: 'What Is Money?',
    body: 'The Origins of Money, Human Action, and Why Bitcoin Matters — a simple, friendly guide written so a fifth grader can follow along.',
  },
  {
    number: 2,
    title: 'Imagine a World With No Money',
    body: "You painted a picture and you're hungry. You offer the sandwich maker your painting, but she doesn't want a painting — she needs shoes. Now you have to find someone who wants your painting AND has shoes. This exhausting problem is called the \"coincidence of wants\" — and it's the reason money was invented.",
  },
  {
    number: 3,
    title: 'The Very First Trades: Barter',
    body: 'Before money, people traded directly: eggs for nails, fish for cloth. But barter only works when both people want what the other has, things can be split evenly, goods don\'t spoil, and values are easy to compare. People needed something better — they needed money.',
  },
  {
    number: 4,
    title: 'How Money Is Born (Nobody Forces It)',
    body: 'No king declared it. No government created it. Money emerged naturally from people trading. Over time certain goods were easier to trade, so people chose them — not because they were told to, but because it made life easier. Like a hiking trail worn into the woods by hundreds of walkers, money appeared from individual choices.',
  },
  {
    number: 5,
    title: 'What Makes Good Money?',
    body: 'Durable (doesn\'t rot), Portable (easy to carry), Divisible (can split into small pieces), Fungible (one unit equals another), Scarce (hard to make more), and Recognizable (easy to verify). Gold and silver scored highest on all these qualities throughout history.',
  },
  {
    number: 6,
    title: 'Human Action: Why People Do What They Do',
    body: 'Every action you take — eating, creating, saving — is you trying to move from a less satisfying situation to a more satisfying one. Economist Ludwig von Mises called this "human action." Every person has their own needs, wants, desires, and their own timeline. Human action is how we try to satisfy them.',
  },
  {
    number: 7,
    title: 'Why Money Is Essential for Human Action',
    body: 'Without money, everyone would have to make everything themselves. Money lets people specialize — focus on what they\'re best at and trade for the rest. This is called economizing: using limited time and resources in the smartest way to satisfy the most needs. Money lets you save, compare, trade, and plan.',
  },
  {
    number: 8,
    title: 'What Is a Free Market Economy?',
    body: 'A system where people trade voluntarily. No one forces you to buy, sell, or work. It creates accountability (bad products lose customers), best possible arrangements (competition drives value), and individual empowerment (everyone acts on their own timeline and needs). A free market isn\'t chaos — it\'s coordination through voluntary choice.',
  },
  {
    number: 9,
    title: 'Prices: The Language of the Free Market',
    body: 'Prices tell a story: how much work went into something, how many people want it, how available it is. They help every person make smart decisions. Without honest prices, people can\'t economize well — they can\'t compare, plan, or save effectively. Sound money makes honest prices possible.',
  },
  {
    number: 10,
    title: 'Building a Circular Economy in Your Community',
    body: 'When people trade locally — bread from the baker, a painting from the artist, framing from the carpenter — money circulates and stays in the community. Everyone benefits, everyone is accountable. This is human action at its most powerful: specializing, trading freely, building trust, and economizing together.',
  },
  {
    number: 11,
    title: 'How Communities Evolve Through Human Action',
    body: 'Free and honest trade grows communities: new businesses fill needs, skills develop, savings accumulate, trust deepens. This is organic, bottom-up growth — not planned by a committee, but emerging from real people\'s choices. The key ingredient? Sound money that nobody can cheat.',
  },
  {
    number: 12,
    title: 'The Problem With Today\'s Money',
    body: 'Fiat currency (like the U.S. dollar) can be printed endlessly by governments. When they do, every dollar you hold loses value — that\'s inflation. A 1970 dollar buys what $8 does today. People closest to new money (banks, governments) benefit first. By the time it reaches artists and everyday people, prices have already risen.',
  },
  {
    number: 13,
    title: 'Enter Bitcoin',
    body: 'Created in 2009 by Satoshi Nakamoto, Bitcoin is digital money that runs on a worldwide network of computers — no single person or company controls it. Every transaction is recorded on a public ledger called the blockchain. Think of it like a global notebook everyone can read but nobody can erase.',
  },
  {
    number: 14,
    title: 'Why Bitcoin Is Special',
    body: 'Durable (digital — can\'t rust), Portable (send anywhere in minutes), Divisible (1 BTC = 100,000,000 satoshis), Fungible (1 BTC = 1 BTC), Scarce (only 21 million will ever exist), Recognizable (blockchain verifies every coin). Bitcoin is the first money in history that is both digital AND truly scarce.',
  },
  {
    number: 15,
    title: 'Bitcoin\'s Technology: Driving Innovation',
    body: 'The Blockchain: a shared record book across thousands of computers, updated every 10 minutes. Decentralization: no single point of failure — running 24/7 since 2009. Open Source: anyone can read the code. Lightning Network: fast, cheap everyday payments — tip an artist in sats instantly.',
  },
  {
    number: 16,
    title: 'Bitcoin and Human Action: The Next Level',
    body: 'True Ownership (no bank can freeze your money), Global Access (anyone with a phone can use it), Savings That Hold Value (21 million cap means no inflation), Permissionless Trade (no bank account or credit check needed), Transparent and Verifiable (trust is built into the math).',
  },
  {
    number: 17,
    title: 'Bitcoin and the Circular Economy',
    body: 'Artists get paid in sats from anywhere — no bank fees. Bakers accept sats with no credit card company taking 3%. Carpenters save in Bitcoin and watch purchasing power grow. The whole community trades on a level playing field. Sound money aligns incentives: hard work is rewarded, savings are respected, creativity has value.',
  },
  {
    number: 18,
    title: 'Economizing at the Next Level',
    body: 'Micropayments (pay fractions of a penny for creative work), Programmable Money (automatic payments, time-locked savings), Borderless Commerce (sell to anyone, anywhere), Instant Settlement (value moves at internet speed). Better economizing means more productive human action and better quality of life for all.',
  },
  {
    number: 19,
    title: 'Connecting the Dots',
    body: 'Barter → Money emerges naturally → Sound money enables human action → Free markets coordinate trade → Circular economies build communities → Fiat money broke the rules → Bitcoin restores sound money → Human action reaches the next level. The story of money is the story of human cooperation. Bitcoin is the next chapter.',
  },
  {
    number: 20,
    title: 'What You Can Do Today',
    body: 'Learn more at bitcoinforthearts.org/education. Download a simple wallet (Muun or Phoenix). Earn your first sats. Support local businesses and artists who accept Bitcoin. Keep asking questions — the best money is the money you understand.',
  },
];

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

          {/* ── 1. What Is Money? (newest) ──────────────────────────── */}
          <section className="mt-10">
            <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
              New — Webinar
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              What Is Money? The Origins of Money, Human Action, and Why Bitcoin&nbsp;Matters.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              A beginner-friendly journey through the origins of money &mdash; how barter
              gave way to sound money, why human action depends on the ability to
              economize, what makes free markets and circular economies thrive, and how
              Bitcoin carries the story forward. Written so a fifth grader can follow along.
            </p>

            {/* ── slide-by-slide preview ──────────────────────────────── */}
            <div className="mt-6 space-y-4">
              {whatIsMoneySlides.map((slide) => (
                <details
                  key={slide.number}
                  className="group rounded-2xl border border-border bg-surface/60 transition-shadow hover:shadow-sm"
                >
                  <summary className="flex cursor-pointer items-start gap-4 p-5 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                      {slide.number}
                    </span>
                    <span className="pt-0.5">{slide.title}</span>
                    <span className="ml-auto text-muted transition-transform group-open:rotate-180">
                      &#9662;
                    </span>
                  </summary>
                  <div className="px-5 pb-5 pl-16 text-sm leading-relaxed text-muted">
                    {slide.body}
                  </div>
                </details>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="/resources/webinars/what-is-money-gamma-prompt.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
              >
                Download Gamma AI prompt
              </a>
              <Link
                href="/education/open"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-2 text-sm font-semibold transition-colors hover:bg-surface"
              >
                Open education materials (CC BY 4.0)
              </Link>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-background p-4 text-xs leading-relaxed text-muted">
              <span className="font-semibold text-foreground">How to use the Gamma prompt:</span>{' '}
              Open the prompt file above, copy its entire contents, then paste into{' '}
              <a
                href="https://gamma.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-4"
              >
                gamma.app
              </a>{' '}
              &rarr; &ldquo;Create new &rarr; Paste in text&rdquo; to generate the
              full presentation automatically.
            </div>
          </section>

          {/* ── 2. Bitcoin for Artists: Unlocking New Creative Freedom ─ */}
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

          {/* ── 3. Bitcoin in Practice for Artists ─────────────────── */}
          <section className="mt-14">
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
                  priority={false}
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
              </div>
              <div className="p-6 sm:p-8">
                <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                  PDF Webinar
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
          </section>

          {/* ── License notice (applies to all webinars) ───────────── */}
          <div className="mt-8 rounded-2xl border border-border bg-surface/60 p-5 text-sm text-muted">
            <div className="font-semibold text-foreground">License</div>
            <div className="mt-2">
              All webinars are published under{' '}
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

          <div className="mt-10">
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
