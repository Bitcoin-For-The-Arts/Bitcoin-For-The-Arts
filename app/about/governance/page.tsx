import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Governance',
  description:
    'Governing documents for Bitcoin For The Arts (BFTA): bylaws, conflict of interest policy, endowment management, and curatorial manifesto.',
};

const DOCS = [
  {
    title: 'Bylaws (PDF)',
    description: 'Board structure, voting, officer roles, and organizational rules.',
    href: '/resources/governance/bylaws.pdf',
  },
  {
    title: 'Conflict of Interest Policy (PDF)',
    description: 'Disclosures, recusals, and integrity safeguards for decision-making.',
    href: '/resources/governance/conflict-of-interest-policy.pdf',
  },
  {
    title: 'Endowment / Reserve Management (PDF)',
    description: 'How BFTA manages reserves with transparency and long-term stewardship.',
    href: '/resources/governance/endowment-management.pdf',
  },
  {
    title: 'Curatorial Manifesto (PDF)',
    description: 'Our curatorial principles for sovereign art in the Bitcoin era.',
    href: '/resources/governance/curatorial-manifesto.pdf',
  },
] as const;

function DocCard(props: { title: string; description: string; href: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">Governance document</div>
      <div className="mt-3 text-lg font-semibold tracking-tight">{props.title}</div>
      <div className="mt-2 text-sm leading-relaxed text-muted">{props.description}</div>
      <div className="mt-5">
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          View / Download PDF
        </a>
      </div>
      <div className="mt-2 text-xs text-muted">
        If a link opens a 404, the PDF is still being uploaded or renamed.
      </div>
    </div>
  );
}

export default function GovernancePage() {
  return (
    <main className="bg-background relative overflow-hidden min-h-screen">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/about-background.jpg"
          alt=""
          fill
          priority={false}
          className="object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-background/65" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-5xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">Governance</span>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-surface/80 p-8 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Governance</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Transparency-first governance.</h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
              These documents define how BFTA is structured, how conflicts are handled, how we steward reserves, and how we
              think about curating sovereign art in the Bitcoin era.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {DOCS.map((d) => (
                <DocCard key={d.href} title={d.title} description={d.description} href={d.href} />
              ))}
            </div>

            <div className="mt-6 text-sm text-muted">
              Prefer to ask questions? Email{' '}
              <a
                className="font-semibold underline underline-offset-4"
                href="mailto:hello@bitcoinforthearts.org?subject=Governance%20question"
              >
                hello@bitcoinforthearts.org
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

