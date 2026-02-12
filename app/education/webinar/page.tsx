import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Webinars — Bitcoin for the Arts',
  description:
    'Creator-focused webinars on why Bitcoin matters for artists: practical custody, getting paid globally, and building long-term sovereignty.',
};

/* ── External URLs ───────────────────────────────────────────────── */
const gammaUrl = 'https://copy-of-bitcoin-for-arti-1sbvsbl.gamma.site/';
const pdfUrl =
  'https://drive.google.com/file/d/1n9EyXi933K5KIe8ljPgEb5KQJdNGMZYp/view?usp=drive_link';
const whatIsMoneyUrl =
  'https://docs.google.com/presentation/d/1nfV8JfONmbHYRAw7Few7mPdMacszO3emAH-t8dtTQos/edit?usp=sharing';
const protectingBtcUrl =
  'https://docs.google.com/presentation/d/1Z64VaEpCIAHsXjPfn2zArpnqPwNj-zZTaQkivRefw8Y/edit?usp=sharing';

/* ── Webinar data (newest first) ─────────────────────────────────── */
interface Webinar {
  title: string;
  href: string;
  image: string;
  alt: string;
  badge: string;
  description: string;
  cta: string;
}

const webinars: Webinar[] = [
  {
    title: 'Protecting Your Bitcoin: Security & Self-Custody Deep Dive',
    href: protectingBtcUrl,
    image: '/1_Protecting-Your-Bitcoin-Security-and-Self-Custody-Deep-Dive.png',
    alt: 'Protecting Your Bitcoin: Security and Self-Custody Deep Dive — webinar cover',
    badge: 'New — Webinar',
    description:
      'A deep dive into protecting your Bitcoin — covering wallet architecture, self-custody best practices, multi-sig setups, seed-phrase security, and the practical steps every artist needs to safeguard their stack for the long term.',
    cta: 'View presentation',
  },
  {
    title: 'What Is Money?',
    href: whatIsMoneyUrl,
    image: '/1_What-Is-Money.png',
    alt: 'What Is Money? — webinar cover',
    badge: 'Webinar',
    description:
      'A beginner-friendly journey through the origins of money\u00a0— how barter gave way to sound money, why human action depends on the ability to economize, what makes free markets and circular economies thrive, and how Bitcoin carries the story forward.',
    cta: 'View presentation',
  },
  {
    title: 'Bitcoin in Practice for Artists',
    href: pdfUrl,
    image: '/1_Bitcoin-in-Practice-for-Artists.png',
    alt: 'Bitcoin in Practice for Artists — webinar cover',
    badge: 'PDF Webinar',
    description:
      'A hands-on guide for artists ready to put Bitcoin to work\u00a0— covering real-world custody setups, accepting payments, pricing strategies, and the practical steps between \u201cI\u2019ve heard of Bitcoin\u201d and \u201cI\u2019m using it every day.\u201d',
    cta: 'View PDF presentation',
  },
  {
    title: 'Bitcoin for Artists: Unlocking New Creative Freedom',
    href: gammaUrl,
    image: '/feb-8-webinar.png',
    alt: 'Bitcoin for Artists: Unlocking New Creative Freedom — webinar cover',
    badge: 'Webinar',
    description:
      'The original webinar that started it all\u00a0— an interactive overview of why Bitcoin matters for creators, how to take custody of your sats, and the path toward financial sovereignty as an artist.',
    cta: 'View presentation',
  },
];

/* ── Shared card component ───────────────────────────────────────── */
function WebinarCard({
  webinar,
  priority = false,
  size = 'default',
}: {
  webinar: Webinar;
  priority?: boolean;
  size?: 'featured' | 'default';
}) {
  const isFeatured = size === 'featured';

  return (
    <a
      href={webinar.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full overflow-hidden rounded-3xl border border-border bg-surface/80 shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={webinar.image}
          alt={webinar.alt}
          fill
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes={
            isFeatured
              ? '(max-width: 768px) 100vw, 1152px'
              : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 560px'
          }
        />
      </div>
      <div className={isFeatured ? 'p-6 sm:p-8' : 'p-5 sm:p-6'}>
        <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
          {webinar.badge}
        </div>
        <h2
          className={
            isFeatured
              ? 'mt-3 text-2xl font-semibold tracking-tight sm:text-3xl'
              : 'mt-3 text-xl font-semibold tracking-tight sm:text-2xl'
          }
        >
          {webinar.title}
        </h2>
        <p
          className={
            isFeatured
              ? 'mt-3 text-sm leading-relaxed text-muted sm:text-base'
              : 'mt-2 text-sm leading-relaxed text-muted line-clamp-3'
          }
        >
          {webinar.description}
        </p>
        <div
          className={`${
            isFeatured ? 'mt-5' : 'mt-4'
          } inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-6 py-2 text-sm font-semibold text-white transition-colors group-hover:opacity-90`}
        >
          {webinar.cta} &rarr;
        </div>
      </div>
    </a>
  );
}

/* ── Page ─────────────────────────────────────────────────────────── */
export default function EducationWebinarPage() {
  const [featured, ...rest] = webinars;

  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="max-w-4xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Education &bull; Webinars
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Bitcoin Webinars for Artists.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Practical, creator-focused presentations on Bitcoin: custody, getting
            paid, pricing in sats, and building long-term sovereignty. All materials
            are published under our open license (CC&nbsp;BY&nbsp;4.0).
          </p>
        </div>

        {/* ── Featured (newest) webinar ───────────────────────────── */}
        <section className="mt-10">
          <WebinarCard webinar={featured} priority size="featured" />
        </section>

        {/* ── Remaining webinars — responsive grid ────────────────── */}
        <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((w) => (
            <WebinarCard key={w.title} webinar={w} />
          ))}
        </section>

        {/* ── Open-education CTA ──────────────────────────────────── */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/education/open"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-2 text-sm font-semibold transition-colors hover:bg-surface"
          >
            Open education materials (CC BY 4.0)
          </Link>
        </div>

        {/* ── License notice ──────────────────────────────────────── */}
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
    </main>
  );
}
