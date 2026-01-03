import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import MobileCarousel from '@/components/MobileCarousel';

export const metadata: Metadata = {
  title: 'Grants',
  description:
    'Bitcoin micro-grants for sovereign creators across disciplines. Learn how to apply and what we fund.',
};

export default function GrantsPage() {
  const infoCards = [
    {
      title: 'What We Fund',
      items: [
        'Creation costs (materials, studio time, rehearsal space)',
        'Production costs (recording, staging, print, fabrication)',
        'Travel tied to a specific project or performance',
        'Artist-led community programming',
      ],
      imageSrc: '/paintbrush kids.jpg',
      imageAlt: 'Kids holding paintbrushes, representing creative work.',
      surface: 'bg-background',
    },
    {
      title: 'Who Can Apply',
      items: [
        'Independent artists and small collectives',
        'Any discipline: visual arts, theater, dance, music, writing, storytelling, film',
        'Working on a specific project with clear next steps',
        'Open to all geographies (subject to program capacity)',
      ],
      imageSrc: '/artfest.jpg',
      imageAlt: 'An art festival scene, representing community arts.',
      surface: 'bg-background',
    },
    {
      title: 'What To Send',
      items: [
        'Your name + links (website, portfolio, socials)',
        'Project description (what, why, and timeline)',
        'Budget + requested amount',
        'A Bitcoin address to receive funds',
      ],
      imageSrc: '/event-background.jpg',
      imageAlt: 'An event scene, representing grants and community support.',
      surface: 'bg-background',
    },
  ] as const;

  return (
    <main className="bg-background relative overflow-hidden min-h-screen">
      {/* Background image (same treatment as Artists / Get Involved) */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/grants-background.jpg"
          alt=""
          fill
          priority={false}
          className="object-cover object-center opacity-50"
        />
        <div className="absolute inset-0 bg-background/60" />
      </div>

      <div className="relative mx-auto max-w-6xl px-8 py-14 sm:px-6">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Bitcoin Micro-Grants
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Grants for working artists — paid in Bitcoin.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            We support sovereign creators across visual arts, theater, dance, music,
            writing, storytelling, and film. Grants are designed to be small, fast,
            and impactful — helping you keep creating.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:grants@bitcoinforthearts.org?subject=Grant%20application"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              Apply via email
            </a>
            <Link
              href="/donate"
              className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              Fund a grant
            </Link>
          </div>
        </div>

        {/* Swipeable carousel (mobile + desktop) */}
        <div className="mt-12 -mx-8 px-8">
          <MobileCarousel ariaLabel="Grant program details">
            {infoCards.map((card) => (
              <div
                key={card.title}
                data-carousel-item="true"
                className="snap-start shrink-0 w-[92%] sm:w-[70%] lg:w-[32%] rounded-2xl border border-border bg-surface/80 overflow-hidden"
              >
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={card.imageSrc}
                    alt={card.imageAlt}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 70vw, 32vw"
                  />
                  <div className="absolute inset-0 bg-black/25" />
                </div>
                <div className="p-6">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {card.title}
                  </div>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
                    {card.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </MobileCarousel>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-surface p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h2 className="text-xl font-semibold tracking-tight">
                Transparent By Default
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Our goal is radical clarity: how funds are allocated, how grants are
                paid, and how reserves are maintained over time.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <a
                href="https://github.com/Bitcoin-For-The-Arts/bitcoinforthearts-treasury"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-surface"
              >
                View treasury
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

