import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Empowering Creators Education Proposal',
  description:
    'Draft proposal for BFTA\'s funding-dependent Bitcoin Education Initiative for artists and partner organizations.',
};

const objectives = [
  {
    title: 'Educate for financial sovereignty',
    description:
      'Teach practical Bitcoin skills that help artists reduce payment friction, lower fees, and build long-term independence.',
  },
  {
    title: 'Expand reach through partnerships',
    description:
      'Collaborate with diverse organizations to deliver accessible education for emerging, underrepresented, and established creators.',
  },
  {
    title: 'Build peer support networks',
    description:
      'Create ongoing learning pathways that connect participants with BFTA community channels and Sovereign Circle touchpoints.',
  },
  {
    title: 'Amplify artist empowerment',
    description:
      'Publish reusable open resources and participant stories that demonstrate real-world Bitcoin applications in the arts.',
  },
  {
    title: 'Sustain mission growth',
    description:
      'Use feedback and reporting to improve BFTA\'s education platform and support donor, grant, and reserve growth over time.',
  },
] as const;

const deliveryHighlights = [
  'Year-round access to on-demand resources with quarterly live delivery.',
  '4-6 sessions per partner in pilot scope, with room to scale by funding.',
  'Virtual delivery via webinar tools plus optional in-person/hybrid workshops.',
  'Optional facilitator travel support in BTC for partner-hosted sessions.',
  'Participant showcases and testimonials as a final engagement layer.',
] as const;

const foundationsTrack = [
  'What Is Money',
  'Bitcoin for Artists: Unlocking New Creative Freedom',
  'Bitcoin in Practice for Artists',
  'Protecting Your Bitcoin: Security and Self-Custody Deep Dive',
] as const;

const deepDiveTrack = [
  'Sound Money and the Austrian School for Creators',
  'Bitcoin and the Creator Economy: monetization pathways',
  'Bitcoin and the Creator Economy: audience growth and community',
  'Bitcoin and the Creator Economy: practical tools and workflows',
] as const;

const partnerExamples = [
  'Theater unions: residual planning and payment flow resilience.',
  'Visual arts programs: fan funding and micropayments with Lightning.',
  'Community centers: beginner-friendly custody and security literacy.',
  'Universities and galleries: curricular modules and public programming tie-ins.',
] as const;

const partnerRequirements = [
  'Mission alignment around financial empowerment for artists or members.',
  'Commitment to promote sessions and provide post-session feedback.',
  'Agreement that participant education remains free to attend.',
] as const;

const partnerSelectionProcess = [
  'Open outreach via BFTA channels and direct partner invitations.',
  'Rolling partner applications describing audience needs and format preferences.',
  'Quarterly review for alignment, impact potential, and diversity goals.',
  'Notification target within four weeks and simple collaboration agreements.',
] as const;

const benefits = [
  {
    title: 'For artists and participants',
    description:
      'Free access to practical education, confidence with self-custody and low-fee payments, and clearer paths into BFTA grants and community.',
  },
  {
    title: 'For partner organizations',
    description:
      'Tailored co-branded education that strengthens member services and builds local sovereign artist networks.',
  },
  {
    title: 'For BFTA mission delivery',
    description:
      'Broader reach, stronger curriculum quality, and improved public transparency reporting through measurable outcomes.',
  },
] as const;

const budgetRows = [
  {
    category: 'Direct artist support (facilitators and educators in BTC)',
    percentage: '55%',
    amount: '$9,350',
  },
  {
    category: 'Program development and customization',
    percentage: '30%',
    amount: '$5,100',
  },
  {
    category: 'Outreach and operations logistics',
    percentage: '10%',
    amount: '$1,700',
  },
  {
    category: 'Endowment and long-term reserve',
    percentage: '5%',
    amount: '$850',
  },
] as const;

export default function BitcoinEducationInitiativeProposalPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <Link href="/transparency" className="hover:underline">
              Transparency
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">Program proposal</span>
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Empowering Creators: Pathways to Financial Sovereignty in the Arts
          </h1>
          <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Bitcoin Education Initiative - Proposal Draft - February 2026
          </p>

          <div className="mt-6 rounded-2xl border border-accent/40 bg-surface p-5">
            <p className="text-sm leading-relaxed text-muted">
              <span className="font-semibold text-foreground">Status:</span> This is
              a funding-dependent proposal and is not yet fully launched as a scaled
              partner program. Draft subject to change as funding, partnerships, and
              delivery assumptions evolve.
            </p>
          </div>

          <section className="mt-10 rounded-2xl border border-border bg-background p-6">
            <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              The Bitcoin Education Initiative is a proposed expansion of BFTA&apos;s
              education work to deliver free, practical Bitcoin learning for artists
              across diverse communities. The goal is to help creators address
              common financial challenges including irregular income, fee-heavy
              payment rails, and long-term savings instability.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              If funded, this initiative would partner with local and national arts
              institutions, unions, collectives, community centers, universities,
              and galleries. Delivery would remain Bitcoin-focused and mission
              aligned, without promoting NFTs, ordinals, or altcoins.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Proposed rollout: pilot with 4-6 partner organizations starting Fall
              2026, then scale toward 10-20 partners based on funding from
              memberships, grants, and sponsorships.
            </p>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-xl font-semibold tracking-tight">Objectives</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
              {objectives.map((objective) => (
                <li key={objective.title}>
                  <span className="font-semibold text-foreground">
                    {objective.title}:
                  </span>{' '}
                  {objective.description}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-background p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Proposed program structure
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Scope
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Year-round on-demand access plus quarterly live programming for
                  active partners.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Format
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Virtual-first webinars and Q&amp;A, with optional in-person or
                  hybrid delivery in NYC and partner-hosted venues.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Capacity
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Initial target of 50-100 participants per session, scaling with
                  funding and partner demand.
                </p>
              </div>
            </div>

            <h3 className="mt-6 text-base font-semibold tracking-tight">
              Delivery highlights
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {deliveryHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-xl font-semibold tracking-tight">Curriculum model</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Curriculum builds on BFTA&apos;s open-source materials and is adapted
              by partner context, audience baseline, and delivery mode.
            </p>

            <h3 className="mt-5 text-base font-semibold tracking-tight">
              Level 1 - Foundations
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {foundationsTrack.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>

            <h3 className="mt-5 text-base font-semibold tracking-tight">
              Level 2 - Deep dives
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {deepDiveTrack.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>

            <p className="mt-4 text-sm leading-relaxed text-muted">
              Supplementary slide decks, reference guides, and session materials
              are published in BFTA&apos;s education library.
            </p>

            <h3 className="mt-5 text-base font-semibold tracking-tight">
              Partner-specific examples
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {partnerExamples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-background p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Eligibility and partner selection
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Target partners include U.S.-based arts organizations of all sizes:
              community centers, unions, collectives, galleries, educational
              programs, and residency platforms. Priority is given to organizations
              serving underrepresented artists.
            </p>

            <h3 className="mt-5 text-base font-semibold tracking-tight">
              Partner requirements
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {partnerRequirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3 className="mt-5 text-base font-semibold tracking-tight">
              Selection process
            </h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {partnerSelectionProcess.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Benefits for participants and partners
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
              {benefits.map((benefit) => (
                <li key={benefit.title}>
                  <span className="font-semibold text-foreground">
                    {benefit.title}:
                  </span>{' '}
                  {benefit.description}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-background p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Funding and operational costs
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Baseline annual planning model (20-30 sessions across 4-6 partners),
              aligned to BFTA&apos;s 55/30/10/5 framework:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4 font-semibold text-foreground">
                      Category
                    </th>
                    <th className="py-2 pr-4 font-semibold text-foreground">
                      Allocation
                    </th>
                    <th className="py-2 font-semibold text-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetRows.map((row) => (
                    <tr key={row.category} className="border-b border-border/70">
                      <td className="py-2 pr-4 text-muted">{row.category}</td>
                      <td className="py-2 pr-4 text-muted">{row.percentage}</td>
                      <td className="py-2 text-muted">{row.amount}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-2 pr-4 font-semibold text-foreground">
                      Total annual baseline
                    </td>
                    <td className="py-2 pr-4 text-muted">100%</td>
                    <td className="py-2 font-semibold text-foreground">~$17,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Year one target range remains approximately $15,000-$30,000 depending
              on partner count, content customization depth, and co-funding support.
            </p>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Integration with mission and transparency
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              This initiative reinforces BFTA&apos;s grants pipeline by preparing
              artists to apply and execute more effectively, supports community
              growth through education pathways, and contributes to transparent
              reporting through measurable outcomes.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Proposed success metrics include participant feedback, practical
              Bitcoin adoption outcomes, partner retention, and growth in
              mission-aligned community participation. Risks such as low engagement
              are addressed through partner-led outreach and iterative curriculum
              updates.
            </p>
          </section>

          <section className="mt-8 rounded-2xl border border-accent/40 bg-background p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Call to action: Help us make this happen
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              This is our vision for the Bitcoin Education Initiative and what we
              aim to achieve with your help. Visit{' '}
              <Link
                href="/education"
                className="font-semibold underline underline-offset-4"
              >
                bitcoinforthearts.org/education
              </Link>{' '}
              to learn more or donate.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              For grant applications, this proposal details the program, costs, and
              impact. Contact us to discuss tailoring or collaboration.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Questions, ideas, or feedback:{' '}
              <a
                className="font-semibold underline underline-offset-4"
                href="mailto:programs@bitcoinforthearts.org?subject=Bitcoin%20Education%20Initiative%20Proposal"
              >
                programs@bitcoinforthearts.org
              </a>
              . Let&apos;s partner to empower artists everywhere.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:programs@bitcoinforthearts.org?subject=Bitcoin%20Education%20Initiative%20Proposal"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
              >
                Contact programs team
              </a>
              <Link
                href="/education"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-2 text-sm font-semibold transition-colors hover:bg-surface"
              >
                Back to Education
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
