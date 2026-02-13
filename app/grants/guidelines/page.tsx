import type { Metadata } from 'next';
import Link from 'next/link';
import PrintSavePdfButton from '@/components/PrintSavePdfButton';
import MobileCarousel from '@/components/MobileCarousel';

export const metadata: Metadata = {
  title: 'Grant Guidelines',
  description:
    'Detailed guidelines for applying to Bitcoin For The Arts (BFTA) grants: eligibility, what to submit, do’s and don’ts, and review rubric.',
};

const VERSION = '1.2';
const EFFECTIVE_DATE = 'February 12, 2026';
const TOC_ITEMS = [
  { href: '#program', label: '1. Program Description' },
  { href: '#eligibility', label: '2. Eligibility Criteria' },
  { href: '#requirements', label: '3. Application Requirements' },
  { href: '#tips', label: '4. Do’s and Don’ts' },
  { href: '#rubric', label: '5. Review Criteria' },
  { href: '#award', label: '6. Award Information' },
  { href: '#reporting', label: '7. Post-Award Reporting' },
  { href: '#legal', label: '8. Legal Assurances' },
  { href: '#faqs', label: '9. FAQs' },
] as const;

function TocLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold transition-colors hover:bg-surface"
    >
      {label}
    </a>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 rounded-2xl border border-border bg-background p-6">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

function Callout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-accent/40 bg-surface p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}

export default function GrantGuidelinesPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-5xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <Link href="/grants" className="hover:underline">
              Grants
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">Guidelines</span>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-surface/80 p-8 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  BFTA Grant Guidelines
                </h1>
                  <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Version {VERSION} • Effective {EFFECTIVE_DATE}
                  </div>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
                  This document provides detailed guidelines for applying to BFTA’s Bitcoin-native micro-grant program.
                  It expands beyond the online application form to include eligibility details, do’s and don’ts,
                  evaluation rubrics, and more. Applications are reviewed quarterly, with processing beginning in Q3
                  2026. Grants are disbursed in Bitcoin (BTC).
                </p>
              </div>

              <div className="flex flex-col gap-2 print:hidden">
                <Link
                  href="/grants/apply"
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 border border-accent/60"
                >
                  Apply online
                </Link>
                <PrintSavePdfButton />
                <div className="text-xs text-muted">
                  Prefer a PDF? Use print → “Save as PDF”. We keep the website version as the source of truth.
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-7 space-y-3">
                <Callout title="Key points (read this first)">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-semibold text-foreground">Applicants:</span> open worldwide.
                    </li>
                    <li>
                      <span className="font-semibold text-foreground">Projects:</span> funded activities must be{' '}
                      <span className="font-semibold text-foreground">US-based</span> (performed in the United States).
                    </li>
                    <li>
                      <span className="font-semibold text-foreground">Paid in Bitcoin:</span> grants are disbursed in BTC.
                    </li>
                    <li>
                      <span className="font-semibold text-foreground">Reviewed quarterly:</span> processing begins{' '}
                      <span className="font-semibold text-foreground">Q3 2026</span>.
                    </li>
                    <li>
                      <span className="font-semibold text-foreground">Transparency:</span> post-award reporting is required.
                    </li>
                  </ul>
                </Callout>
              </div>
              <div className="md:col-span-5 space-y-3">
                <Callout title="Questions">
                  Email{' '}
                  <a
                    href="mailto:grants@bitcoinforthearts.org"
                    className="font-semibold underline underline-offset-4"
                  >
                    grants@bitcoinforthearts.org
                  </a>{' '}
                  or use our{' '}
                  <Link href="/contact" className="font-semibold underline underline-offset-4">
                    contact form
                  </Link>
                  .
                </Callout>
                <Callout title="Grant terms">
                  The guidelines explain how to apply; the legal agreement lives in the Grant Terms & Conditions.
                  <div className="mt-3">
                    <a
                      href="/resources/grants/grant-terms.pdf?v=20260109"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-2 text-sm font-semibold transition-colors hover:bg-surface"
                    >
                      View Grant Terms & Conditions (PDF)
                    </a>
                  </div>
                </Callout>
              </div>
            </div>

            <div className="mt-6 print:hidden">
              {/* Mobile: carousel for clean uniform layout */}
              <div className="md:hidden -mx-6 px-6">
                <MobileCarousel
                  ariaLabel="Grant guidelines table of contents"
                  showDots={false}
                  showArrows
                  className="px-14 scroll-px-14"
                >
                  {TOC_ITEMS.map((it) => (
                    <div
                      key={it.href}
                      data-carousel-item="true"
                      className="snap-start shrink-0 w-[82%] pr-4"
                    >
                      <TocLink href={it.href} label={it.label} />
                    </div>
                  ))}
                </MobileCarousel>
              </div>

              {/* Desktop/tablet: tidy wrap */}
              <div className="hidden md:flex flex-wrap gap-2">
                {TOC_ITEMS.map((it) => (
                  <TocLink key={it.href} href={it.href} label={it.label} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6">
            <Section id="program" title="1. Program Description">
              <p>
                Bitcoin For The Arts (BFTA) funds sovereign art with Bitcoin-native micro-grants, supporting
                artists with low time preference through censorship-resistant innovation, no gatekeepers,
                and radical transparency.
              </p>
              <p>
                We prioritize artists whose work resonates with Bitcoin&rsquo;s core ethos: decentralization,
                low time preference, preservation of energy&mdash;especially creative energy&mdash;and
                individual sovereignty. If your project explores themes like financial freedom, censorship
                resistance, community resilience, or the transformative power of sound money, we want to
                hear from you.
              </p>
              <p>
                <span className="font-semibold text-foreground">Not yet fully aligned with Bitcoin?</span>{' '}
                That&rsquo;s okay. If your art speaks to these principles but you haven&rsquo;t yet taken
                the time to study Bitcoin, let Bitcoin for the Arts lead the way. Our{' '}
                <Link href="/education/webinar" className="font-semibold underline underline-offset-4">
                  free education program
                </Link>{' '}
                is designed to meet artists where they are and guide them toward sound living
                and creative sovereignty.
              </p>
              <p>
                Projects can span disciplines such as visual arts, music, literature, performing arts,
                film/video, digital/media art, or interdisciplinary work. Examples include:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Digital art exploring Bitcoin’s philosophy and sound money principles.</li>
                <li>Performances or installations highlighting censorship resistance.</li>
                <li>Educational content or tools promoting Bitcoin adoption in creative communities.</li>
              </ul>
              <p>
                Grants are micro-sized (typically 0.01–0.5 BTC, based on market value at disbursement) and disbursed in
                BTC to promote Bitcoin adoption. We prioritize projects with potential for long-term impact, transparency
                in execution, and alignment with our reserve model.
              </p>
              <Callout title="Reserve model">
                Our sustainable model targets: <span className="font-semibold text-foreground">55% grants</span>,{' '}
                <span className="font-semibold text-foreground">30% programs</span>,{' '}
                <span className="font-semibold text-foreground">10% operations</span>,{' '}
                <span className="font-semibold text-foreground">5% HODL vault</span>.
              </Callout>
            </Section>

            <Section id="eligibility" title="2. Eligibility Criteria">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Be individual artists, collectives, or organizations (no formal nonprofit status required, but must
                  demonstrate artistic legitimacy via portfolio or prior work).
                </li>
                <li>
                  Commit to projects aligned with Bitcoin themes (e.g., sovereignty, censorship resistance, innovation
                  without gatekeepers).
                </li>
                <li>Provide a valid Bitcoin wallet address for disbursement (Lightning Network preferred for efficiency).</li>
                <li>Agree to post-grant reporting for radical transparency.</li>
                <li>
                  Have a track record of artistic work (at least one prior project or portfolio sample). Emerging and
                  aspiring artists without extensive experience may also apply on a case-by-case basis; applications
                  will be evaluated based on demonstrated passion, potential, and alignment with our mission to ensure
                  inclusivity across all levels of artistic development.
                </li>
              </ul>

              <Callout title="Geographic policy">
                <div className="space-y-3">
                  <p>
                    <span className="font-semibold text-foreground">Artists/Applicants:</span> open worldwide—no
                    geographic restrictions. Artists from any country may apply.
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Projects:</span> all funded projects must be US-based.
                    This means the primary activities, execution, deliverables, performances, exhibitions, releases, or
                    impact must take place within the United States (including the 50 states, District of Columbia, or
                    U.S. jurisdictions).
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>A global artist creating artwork/installation that premieres in NYC.</li>
                    <li>A digital project hosted on US servers with US-focused community engagement.</li>
                    <li>A performance tour in US cities.</li>
                  </ul>
                  <p>
                    <span className="font-semibold text-foreground">Rationale:</span> this ensures compliance with U.S.
                    regulations, simplifies tax and reporting (e.g., potential 1099 forms), and focuses impact on the
                    American arts ecosystem during our launch phase.
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Proof:</span> applicants must describe in the
                    application how the project is US-based (e.g., location of key activities, audience, or outputs). We
                    may request additional details during review.
                  </p>
                </div>
              </Callout>

              <Callout title="Ineligible">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Projects primarily taking place outside the US (even if applicant is US-based).</li>
                  <li>
                    Projects promoting illegal activities, hate speech, or non-Bitcoin digital assets
                    (altcoins, tokens, etc.).
                  </li>
                  <li>Applicants under 18 (or local age of majority).</li>
                  <li>Organizations or individuals with a history of fraud or non-compliance in prior grants.</li>
                  <li>Commercial ventures without an artistic focus (e.g., pure product development).</li>
                </ul>
              </Callout>

              <p>
                Multiple applications are allowed for distinct projects, but limited to one award per quarter per
                applicant.
              </p>
              <p className="text-xs text-muted">
                Note on future expansion: as BFTA grows, we plan to evolve this policy (potentially allowing fully
                international projects). Check the website for updates.
              </p>
            </Section>

            <Section id="requirements" title="3. Application Requirements and What to Submit">
              <p>
                Applications are submitted via our online multi-step form (6 steps). Drafts save locally; reattach PDFs
                before submission.
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Callout title="Step 1 — Applicant Information">
                  Name/alias, email, Bitcoin wallet, location/country (applicant), artistic disciplines (select at least
                  one), short bio, portfolio links.
                </Callout>
                <Callout title="Step 2 — Project Description">
                  Title, summary (200–500 words), Bitcoin alignment, timeline/milestones, and clear explanation of how the
                  project is US-based (required for eligibility).
                </Callout>
                <Callout title="Step 3 — Funding & Budget">
                  Requested amount (BTC), detailed breakdown, and other funding sources.
                </Callout>
                <Callout title="Step 4 — Background & Evaluation">
                  Previous work links and expected impact/goals.
                </Callout>
                <Callout title="Step 5 — Oversight & Reporting">
                  Commitment to post-grant reporting (explain how you’ll share updates transparently, e.g., via X or
                  blog).
                </Callout>
                <Callout title="Step 6 — Attachments">
                  Portfolio samples and PDFs (e.g., resumes, mockups; max 5 files, 10MB total).
                </Callout>
              </div>

              <p>
                All submissions must be original; plagiarism results in disqualification. No cost share/match required,
                but leveraging other funds strengthens applications.
              </p>
            </Section>

            <Section id="tips" title="4. Do’s and Don’ts: Tips for Successful Applications">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Callout title="Do">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Align your project explicitly with Bitcoin principles (e.g., explain how it promotes decentralization).</li>
                    <li>Clearly describe how the project is US-based (e.g., location of key activities, audience, or outputs).</li>
                    <li>Provide clear, measurable milestones (e.g., “Complete artwork by Q4 2026 and release as open-source”).</li>
                    <li>Demonstrate low time preference (e.g., focus on long-term cultural impact over quick trends).</li>
                    <li>Use attachments to showcase prior work—high-quality samples boost scores.</li>
                    <li>Commit to radical transparency in reporting (e.g., public X threads on progress).</li>
                    <li>Test your Bitcoin wallet and understand BTC volatility before applying.</li>
                  </ul>
                </Callout>
                <Callout title="Don’t">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Submit vague descriptions (e.g., avoid “I’ll make cool Bitcoin art”—be specific).</li>
                    <li>Request funds for non-project expenses (e.g., general living costs, unrelated hardware).</li>
                    <li>Ignore the form’s required fields or fail to explain US-based project elements—incomplete applications are rejected.</li>
                    <li>Promote scams, rug pulls, or non-Bitcoin assets (e.g., no altcoin-focused projects).</li>
                    <li>Apply without a portfolio—evidence of past work is crucial.</li>
                    <li>Forget to reattach files when resuming drafts.</li>
                    <li>Underestimate BTC risks—applicants assume volatility responsibility.</li>
                  </ul>
                </Callout>
              </div>
              <p>Tip: review successful past grants (if available on our site) and attend any webinars for guidance.</p>
            </Section>

            <Section id="rubric" title="5. Review Criteria and Evaluation Rubric">
              <p>
                Applications are reviewed quarterly by a panel of Bitcoin and arts experts. We use a rubric scoring 1–5
                (1 = poor, 5 = excellent) across categories, with a total possible score of 30. Minimum for
                consideration: 20.
              </p>
              <div className="overflow-auto rounded-2xl border border-border bg-surface p-4">
                <table className="min-w-[900px] w-full text-left text-sm">
                  <thead className="text-xs font-semibold uppercase tracking-wide text-muted">
                    <tr>
                      <th className="py-2 pr-4">Category</th>
                      <th className="py-2 pr-4">Weight</th>
                      <th className="py-2 pr-4">Description</th>
                      <th className="py-2 pr-4">Rubric examples</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-muted">
                    <tr className="border-t border-border">
                      <td className="py-3 pr-4 font-semibold text-foreground">Bitcoin Alignment</td>
                      <td className="py-3 pr-4">20%</td>
                      <td className="py-3 pr-4">
                        How well the project embodies BFTA’s mission (censorship resistance, sovereignty, transparency).
                      </td>
                      <td className="py-3 pr-4">
                        5: Deep integration (e.g., uses Bitcoin tech in art); 3: Loose connection; 1: No alignment.
                      </td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="py-3 pr-4 font-semibold text-foreground">Artistic Excellence</td>
                      <td className="py-3 pr-4">20%</td>
                      <td className="py-3 pr-4">Quality of concept, innovation, and feasibility based on portfolio.</td>
                      <td className="py-3 pr-4">
                        5: Original, high-impact idea with strong samples; 3: Solid but unoriginal; 1: Weak or unclear.
                      </td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="py-3 pr-4 font-semibold text-foreground">Impact Potential</td>
                      <td className="py-3 pr-4">15%</td>
                      <td className="py-3 pr-4">
                        Potential for long-term cultural/economic benefits in the Bitcoin/arts ecosystem.
                      </td>
                      <td className="py-3 pr-4">
                        5: Measurable outcomes (e.g., community engagement metrics); 3: Some potential; 1: Minimal.
                      </td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="py-3 pr-4 font-semibold text-foreground">Budget & Timeline</td>
                      <td className="py-3 pr-4">15%</td>
                      <td className="py-3 pr-4">Realism of funding request and milestones.</td>
                      <td className="py-3 pr-4">5: Detailed, efficient breakdown; 3: Basic plan; 1: Unrealistic or vague.</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="py-3 pr-4 font-semibold text-foreground">Transparency Commitment</td>
                      <td className="py-3 pr-4">15%</td>
                      <td className="py-3 pr-4">Strength of post-grant reporting plan.</td>
                      <td className="py-3 pr-4">
                        5: Public, detailed updates (e.g., on-chain proofs); 3: Basic report; 1: No plan.
                      </td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="py-3 pr-4 font-semibold text-foreground">Overall Feasibility</td>
                      <td className="py-3 pr-4">15%</td>
                      <td className="py-3 pr-4">Applicant’s background and resources.</td>
                      <td className="py-3 pr-4">5: Proven track record; 3: Emerging artist; 1: No evidence.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                Panel discussions reconcile scores; top-scoring projects are funded based on available reserves.
                Feedback is provided upon request post-review.
              </p>
            </Section>

            <Section id="award" title="6. Award Information">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-semibold text-foreground">Grant Amounts:</span> $500–$25,000 in BTC per project.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Number of Awards:</span> variable, based on quarterly
                  reserves (target: 10–20 per quarter).
                </li>
                <li>
                  <span className="font-semibold text-foreground">Disbursement:</span> in BTC to the provided wallet; no
                  fiat options.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Period of Performance:</span> up to 12 months from award
                  date.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Notifications:</span> within 4 weeks of the quarterly
                  deadline.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Risks:</span> BTC value fluctuations are the
                  recipient’s responsibility; no adjustments for market changes.
                </li>
              </ul>
            </Section>

            <Section id="reporting" title="7. Post-Award Reporting Requirements">
              <ul className="list-disc pl-5 space-y-2">
                <li>Interim updates (e.g., quarterly X posts or blog entries on progress).</li>
                <li>
                  Final report within 90 days of project end: summary of outcomes, budget usage, impact metrics, and
                  public artifacts (e.g., artwork links).
                </li>
              </ul>
              <p>
                Maintain records for 3 years; available for BFTA audit. Failure to report may disqualify you from future
                grants. Emphasize radical transparency—share failures and lessons learned.
              </p>
            </Section>

            <Section id="legal" title="8. Legal Assurances">
              <p>By applying, you certify:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Compliance with applicable laws (e.g., AML, IP rights, and U.S. federal/state laws relevant to US-based projects).</li>
                <li>No discrimination in project execution.</li>
                <li>Funds used solely for the described project.</li>
                <li>Responsibility for BTC tax implications.</li>
                <li>Ownership of IP; no infringement.</li>
                <li>Ethical standards and record-keeping.</li>
              </ul>
              <p>Non-compliance may result in grant termination/repayment. See full assurances in the application form.</p>
            </Section>

            <Section id="faqs" title="9. Frequently Asked Questions (FAQs)">
              <Link
                href="/grants/faq"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-2 text-sm font-semibold transition-colors hover:opacity-90"
              >
                Go to Grants FAQ
              </Link>
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}

