import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of use',
  description: 'Terms of use for bitcoinforthearts.org.',
};

export default function TermsOfUsePage() {
  const ein = process.env.NEXT_PUBLIC_BFTA_EIN?.trim();

  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Terms of use
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            These Terms of Use (“Terms”) govern your access to and use of{' '}
            <span className="font-semibold text-foreground">bitcoinforthearts.org</span>{' '}
            (the “Site”), operated by Bitcoin for the Arts, Inc. (“BFTA,” “we,” “us,”
            or “our”). By accessing or using the Site, you agree to these Terms. If
            you do not agree, do not use the Site.
          </p>

          <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
            <p>
              <strong>Effective date:</strong> January 29, 2026
              <br />
              <strong>Last updated:</strong> January 30, 2026
            </p>

            <p>
              Please also review our{' '}
              <Link href="/privacy-policy">Privacy Policy</Link>.
            </p>

            <h2>1. Eligibility</h2>
            <p>
              You must be at least 13 years old to use the Site. The Site is not
              directed to children under 13.
            </p>

            <h2>2. Using the site / submissions</h2>
            <p>
              Some features require you to submit information (for example: grant
              applications, volunteer signups, workshop interest, feedback, or board
              nominations). You agree that the information you submit will be
              accurate to the best of your knowledge and that you will not submit
              content you do not have the right to share.
            </p>

            <h2>3. Intellectual property</h2>
            <p>
              The Site and its content (including text, graphics, logos, images, and
              videos) are owned by BFTA or its licensors and are protected by
              intellectual property laws. Subject to these Terms, you may access and
              use the Site for personal, non-commercial purposes.
            </p>
            <p>
              You may not copy, reproduce, distribute, publicly display, create
              derivative works from, or otherwise exploit the Site content without
              our prior written permission, except where permitted by law.
            </p>
            <p>
              Exception: designated open education materials (including content linked
              from <Link href="/education/open">/education/open</Link> and files in{' '}
              <code>/resources/education/</code>) are licensed under Creative Commons
              Attribution 4.0 International (CC BY 4.0), unless otherwise noted. Those
              materials are governed by their stated license terms.
            </p>

            <h2>4. User content</h2>
            <p>
              If you submit content through the Site (for example, an application,
              nomination, or feedback), you retain ownership of your content. You
              grant BFTA a non-exclusive, royalty-free, worldwide license to use,
              reproduce, and display that content as reasonably necessary to operate
              our programs, administer submissions, and comply with legal
              obligations.
            </p>
            <p>
              If we want to use your submission publicly (for example, featuring a
              story or showcasing work), we will seek permission where appropriate.
            </p>

            <h2>5. Prohibited conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Site for unlawful purposes or to violate any law.</li>
              <li>Submit false or misleading information.</li>
              <li>
                Attempt to interfere with the Site’s operation (for example, through
                hacking, malware, denial of service, or scraping).
              </li>
              <li>Harvest data from the Site or spam users or forms.</li>
              <li>Infringe the rights of others, including intellectual property.</li>
              <li>Submit harmful, abusive, or harassing content.</li>
            </ul>

            <h2>6. Donations and grants</h2>
            <p>
              Donations may be processed through third-party providers (for example,
              Stripe and/or BTCPay Server). Any payment processing is subject to the
              third party’s terms.
            </p>
            <p>
              Bitcoin transactions are irreversible and may be subject to volatility
              risk. You are responsible for confirming donation amounts and wallet
              addresses before sending.
            </p>
            <p>
              Grant applications and awards are governed by our published guidelines
              and any additional terms we provide to applicants and recipients.
            </p>
            <p>
              BFTA is a 501(c)(3) tax-exempt organization. If configured, our EIN is:{' '}
              <strong>{ein ?? 'available upon request'}</strong>. Donations may be
              tax-deductible to the extent allowed by law.
            </p>

            <h2>7. Third-party links and services</h2>
            <p>
              The Site may contain links to third-party websites or services. We do
              not control and are not responsible for third-party content, policies,
              or practices. Your use of third-party services is at your own risk.
            </p>

            <h2>8. Disclaimers</h2>
            <p>
              The Site and Services are provided on an “as is” and “as available”
              basis. To the extent permitted by law, we disclaim all warranties,
              express or implied, including merchantability, fitness for a particular
              purpose, and non-infringement.
            </p>

            <h2>9. Limitation of liability</h2>
            <p>
              To the extent permitted by law, BFTA will not be liable for any
              indirect, incidental, consequential, special, or punitive damages, or
              for any loss of profits, revenue, data, or goodwill arising out of or
              related to your use of the Site or Services.
            </p>
            <p>
              To the extent permitted by law, BFTA’s total liability for any claim
              related to the Site will not exceed the greater of \(100\) USD or the
              amount you paid to BFTA through the Site in the 12 months prior to the
              event giving rise to the claim.
            </p>

            <h2>10. Indemnification</h2>
            <p>
              To the extent permitted by law, you agree to indemnify and hold
              harmless BFTA and its officers, directors, employees, and volunteers
              from claims, liabilities, damages, losses, and expenses (including
              reasonable attorneys’ fees) arising from your violation of these Terms
              or misuse of the Site.
            </p>

            <h2>11. Governing law and venue</h2>
            <p>
              These Terms are governed by the laws of the State of New York, without
              regard to conflict of law principles. You agree that any dispute arising
              out of or relating to these Terms or the Site will be brought in the
              state or federal courts located in New York County, New York, and you
              consent to personal jurisdiction there.
            </p>

            <h2>12. Miscellaneous</h2>
            <p>
              If any provision of these Terms is found unenforceable, the remaining
              provisions will remain in effect. Our failure to enforce any provision
              is not a waiver of our right to do so later.
            </p>

            <h2>Contact</h2>
            <p>
              General questions: <a href="mailto:hello@bitcoinforthearts.org">hello@bitcoinforthearts.org</a>
              <br />
              Privacy requests: <a href="mailto:privacy@bitcoinforthearts.org">privacy@bitcoinforthearts.org</a>
            </p>
            <p>
              Bitcoin for the Arts, Inc.
              <br />
              27 W 60th St. P.O. Box 20069
              <br />
              New York, NY 10023
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

