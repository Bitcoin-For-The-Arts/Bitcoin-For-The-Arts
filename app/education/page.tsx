import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Education',
  description:
    'Free education webinars for artists — learn Bitcoin wallets, self-custody, Lightning payments, grants, and more.',
};

const webinars = [
  {
    title: 'Bitcoin in Practice for Artists',
    date: '2026-02-10',
    description:
      'Hands-on session: set up a wallet, accept Bitcoin for your art, Lightning payments, apply for a micro-grant, and security best practices.',
    topics: [
      'Setting up your first Bitcoin wallet',
      'Self-custody for creative independence',
      'Three ways to accept Bitcoin for your art',
      'The Lightning Network & instant payments',
      'Building a Bitcoin patron community',
      'Tax basics for artists receiving Bitcoin',
      'How to apply for a BFTA micro-grant ($500–$2,000)',
      'Security best practices',
    ],
    imageSrc: '/1_Bitcoin-in-Practice-for-Artists.png',
    imageAlt:
      'Bitcoin in Practice for Artists — Education Webinar 2 cover image.',
    pdfUrl:
      'https://drive.google.com/file/d/1n9EyXi933K5KIe8ljPgEb5KQJdNGMZYp/view?usp=drive_link',
    featured: true,
  },
  {
    title: 'Introduction to Bitcoin For The Arts',
    date: '2026-02-08',
    description:
      'Our inaugural webinar: why Bitcoin matters for artists, the economic case for arts funding, and how BFTA supports sovereign creators.',
    topics: [
      'What is Bitcoin For The Arts?',
      'Why Bitcoin for artists',
      'Arts & the U.S. economy ($1.17T GDP)',
      'The 55/30/10/5 allocation model',
      'Getting started with Bitcoin',
    ],
    imageSrc: null,
    imageAlt: '',
    pdfUrl:
      'https://drive.google.com/file/d/1A4gJjhNLXRXnwdjtPpL8sX1Yf-zQmtUu/view?usp=drive_link',
    featured: false,
  },
] as const;

export default function EducationPage() {
  const featured = webinars.find((w) => w.featured);
  const past = webinars.filter((w) => !w.featured);

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-14">
        {/* Page header */}
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Education
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Free webinars for artists learning Bitcoin.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Practical, no-jargon sessions designed for working creators. Learn
            how to receive Bitcoin, protect your earnings, and build a sovereign
            creative life.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/education/webinar"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 border border-accent/60"
            >
              Study the webinars
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              Fund education
            </Link>
          </div>
        </div>

        {/* Featured / Latest webinar hero card */}
        {featured ? (
          <section className="mt-12">
            <a
              href={featured.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
            >
              {featured.imageSrc ? (
                <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
                  <Image
                    src={featured.imageSrc}
                    alt={featured.imageAlt}
                    fill
                    priority
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 1152px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <div className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      Latest Webinar
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
                      {featured.title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
                      {featured.description}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors group-hover:bg-white/30">
                      View PDF
                      <span aria-hidden="true">&rarr;</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 sm:p-8">
                  <div className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Latest Webinar
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                    {featured.description}
                  </p>
                </div>
              )}
            </a>

            {/* Topics list below the hero */}
            <div className="mt-6 rounded-2xl border border-border bg-background p-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                What you&apos;ll learn
              </div>
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {featured.topics.map((topic) => (
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
              <div className="mt-6">
                <a
                  href={featured.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 border border-accent/60"
                >
                  Download the PDF
                </a>
              </div>
            </div>
          </section>
        ) : null}

        {/* Past webinars */}
        {past.length > 0 ? (
          <section className="mt-14">
            <h2 className="text-2xl font-semibold tracking-tight">
              Past Webinars
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {past.map((w) => (
                <a
                  key={w.date}
                  href={w.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-md"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {w.date}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight group-hover:text-accent transition-colors">
                    {w.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {w.description}
                  </p>
                  <div className="mt-4 text-sm font-semibold text-accent">
                    View PDF &rarr;
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {/* Education repo callout */}
        <section className="mt-14 rounded-2xl border border-border bg-surface p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h2 className="text-xl font-semibold tracking-tight">
                Open Education Materials
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                All webinar materials are published under CC BY 4.0 in our
                public education repository. Free to share, remix, and build on.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <a
                href="https://github.com/Bitcoin-For-The-Arts/education"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-surface"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-14 rounded-2xl border border-border bg-background p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h2 className="text-xl font-semibold tracking-tight">
                Want to attend the next webinar?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Follow us on X for announcements, or reach out to get on the
                invite list.
              </p>
            </div>
            <div className="md:col-span-4 flex flex-col gap-3 sm:flex-row md:justify-end">
              <a
                href="https://x.com/Bitcoinfta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
              >
                Follow on X
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-6 py-3 text-sm font-semibold transition-colors hover:opacity-90"
              >
                Contact us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
