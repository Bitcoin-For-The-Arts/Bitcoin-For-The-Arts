import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sovereign Artist Residency Proposal',
  description:
    'Draft proposal for a funding-dependent Sovereign Artist Residency Program by Bitcoin For The Arts, Inc.',
};

const objectives = [
  {
    title: 'Foster sovereignty in artistic practice',
    description:
      'Support artists creating work around themes like uncensorable expression, decentralization, and financial independence.',
  },
  {
    title: 'Build community and measurable impact',
    description:
      'Connect residents with BFTA contributors, Sovereign Circle members, and partner organizations for feedback and collaboration.',
  },
  {
    title: 'Expand practical Bitcoin literacy',
    description:
      'Provide beginner-friendly education on self-custody, Lightning, and BTC-native creative workflows.',
  },
  {
    title: 'Increase visibility for artists and mission',
    description:
      'Produce high-quality public outputs (performances, installations, publications, or digital releases) showcased through BFTA channels.',
  },
  {
    title: 'Strengthen long-term sustainability',
    description:
      'Use residency content and reporting to attract new members, donors, and strategic partners over time.',
  },
] as const;

const activityHighlights = [
  '70% self-directed creative time for focused production.',
  'Bitcoin workshops (wallet setup, security, self-custody, Lightning tools).',
  'Quarterly virtual hangouts with Sovereign Circle members.',
  'Optional audience feedback touchpoints during development.',
  'Public culmination: presentation, performance, exhibition, or online release.',
] as const;

const applicationRequirements = [
  'Project proposal (500-1,000 words) outlining concept, Bitcoin/sovereignty relevance, and intended outcomes.',
  'Portfolio with 5-10 representative work samples.',
  'Bio/CV and references.',
  'Commitment to receive support in BTC and participate in educational sessions.',
] as const;

const selectionProcess = [
  'Open call on bitcoinforthearts.org plus partner outreach.',
  'Quarterly review cycle with board review and community input from Sovereign Circle members.',
  'Selection based on artistic merit, mission alignment, feasibility, and public impact.',
  'Notifications targeted within four weeks of each review deadline.',
] as const;

const residentBenefits = [
  {
    label: 'Funding',
    detail:
      '$1,000-$5,000 stipend in BTC (pilot range), paired with onboarding for secure self-custody.',
  },
  {
    label: 'Resources',
    detail:
      'Access to BFTA education materials, practical tools, and support for Bitcoin-native publishing and fundraising.',
  },
  {
    label: 'Community',
    detail:
      'Mentorship from BFTA collaborators and integration into a Sovereign Circle feedback loop.',
  },
  {
    label: 'Visibility',
    detail:
      'Feature placement in newsletters, showcases, and public transparency reporting.',
  },
  {
    label: 'Long-term recognition',
    detail:
      'Archival recognition for completed cohorts in annual reporting and public program history.',
  },
] as const;

const budgetRows = [
  {
    category: 'Resident stipends (direct artist support)',
    amount: '$9,000',
    allocation: '55%',
  },
  {
    category: 'Workshops and public program costs',
    amount: '$3,000',
    allocation: '30%',
  },
  {
    category: 'Workspace and housing logistics',
    amount: '$2,000',
    allocation: '10%',
  },
  {
    category: 'Endowment/reserve contribution',
    amount: '$500',
    allocation: '5%',
  },
] as const;

const implementationNotes = [
  'Publish in the Transparency section as a draft vision and funding invitation.',
  'Link from Programming with clear wording: "proposed, not yet launched."',
  'Keep version/date visible and update openly when assumptions change.',
  'Track traffic, donation conversions, and community engagement to measure demand.',
  'Review public disclosures against nonprofit guidance before each major revision.',
] as const;

export default function SovereignArtistResidencyProposalPage() {
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
            Sovereign Artist Residency Program
          </h1>
          <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Bitcoin For The Arts, Inc. · February 2026 draft
          </p>

          <div className="mt-6 rounded-2xl border border-accent/40 bg-surface p-5">
            <p className="text-sm leading-relaxed text-muted">
              <span className="font-semibold text-foreground">Status:</span> This is
              a funding-dependent proposal and is not yet an active program.
              Residency applications are not open at this time. Draft subject to
              change as funding, partnerships, and operating assumptions evolve.
            </p>
          </div>

          <section className="mt-10 rounded-2xl border border-border bg-background p-6">
            <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              The Sovereign Artist Residency is a proposed flagship initiative to
              give artists dedicated time, space, and resources to create work
              connected to sovereignty, decentralization, and financial
              independence. The model aligns with BFTA&apos;s mission to support a
              self-sustaining renaissance in the arts through Bitcoin.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              If funded, the residency would run in hybrid form (virtual and
              in-person options in New York City), support interdisciplinary
              projects, and operate on a Bitcoin-only basis (no NFTs, ordinals, or
              altcoins). Selected artists would receive BTC support, practical
              onboarding on self-custody and Lightning, and opportunities to share
              work with BFTA&apos;s community.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Pilot timeline target: Fall 2026 start with a small cohort, then
              responsible scaling based on available funding and operational
              capacity.
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
                  Format
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Hybrid: virtual and in-person options in NYC through partner
                  studios, coworking spaces, and galleries.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Duration
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Virtual 4-8 weeks; in-person 2-4 weeks, with schedule flexibility
                  by discipline.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Capacity
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Pilot target: 2-3 residents per cohort to protect quality and
                  support depth.
                </p>
              </div>
            </div>

            <h3 className="mt-6 text-base font-semibold tracking-tight">
              Core activities
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {activityHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Eligibility and application process
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Intended applicant profile: U.S.-based artists across visual arts,
              music, theater, dance, writing, storytelling, and film. Prior Bitcoin
              expertise is not required. The program aims to prioritize diverse
              participation and underrepresented voices.
            </p>

            <h3 className="mt-5 text-base font-semibold tracking-tight">
              Application requirements
            </h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {applicationRequirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3 className="mt-5 text-base font-semibold tracking-tight">
              Proposed selection process
            </h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {selectionProcess.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-background p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Resident benefits (if funded)
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
              {residentBenefits.map((benefit) => (
                <li key={benefit.label}>
                  <span className="font-semibold text-foreground">
                    {benefit.label}:
                  </span>{' '}
                  {benefit.detail}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Funding and operating model
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Example per-cohort budget (3 residents), aligned with BFTA&apos;s
              55/30/10/5 allocation framework:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4 font-semibold text-foreground">
                      Category
                    </th>
                    <th className="py-2 pr-4 font-semibold text-foreground">
                      Amount
                    </th>
                    <th className="py-2 font-semibold text-foreground">
                      Allocation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {budgetRows.map((row) => (
                    <tr key={row.category} className="border-b border-border/70">
                      <td className="py-2 pr-4 text-muted">{row.category}</td>
                      <td className="py-2 pr-4 text-muted">{row.amount}</td>
                      <td className="py-2 text-muted">{row.allocation}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-2 pr-4 font-semibold text-foreground">
                      Total per cohort
                    </td>
                    <td className="py-2 pr-4 font-semibold text-foreground">
                      ~$14,500
                    </td>
                    <td className="py-2 text-muted">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Pilot planning range: approximately $20,000-$50,000 in year one
              (scope-adjusted cohorts and partnerships). A fully scaled four-cohort
              year at the model above is approximately $58,000.
            </p>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-background p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Integration, metrics, and risk management
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The residency is designed to integrate with BFTA&apos;s broader grants,
              education, and community ecosystem. Proposed success metrics include
              resident outputs, practical Bitcoin adoption by participants, audience
              reach, and donor/member growth attributable to program reporting.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Key risks include low applicant volume, inconsistent funding, and
              operational capacity constraints. Mitigations include pilot-first
              cohort sizing, partner venue collaboration, and transparent milestone
              reporting before expansion.
            </p>
          </section>

          <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Transparency publication notes
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              {implementationNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-accent/40 bg-background p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Help make this program possible
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              We welcome funding partners, venue collaborators, mentors, and program
              design feedback. If you want to help launch this residency, contact{' '}
              <a
                className="font-semibold underline underline-offset-4"
                href="mailto:hello@bitcoinforthearts.org?subject=Sovereign%20Artist%20Residency%20Proposal"
              >
                hello@bitcoinforthearts.org
              </a>
              .
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:hello@bitcoinforthearts.org?subject=Sovereign%20Artist%20Residency%20Proposal"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
              >
                Contact the team
              </a>
              <Link
                href="/programming"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-2 text-sm font-semibold transition-colors hover:bg-surface"
              >
                Back to Programming
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
