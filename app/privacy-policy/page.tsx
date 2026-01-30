import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'Privacy policy for bitcoinforthearts.org.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Privacy policy
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            This Privacy Policy explains how Bitcoin for the Arts, Inc. (“BFTA,”
            “we,” “us,” or “our”) collects, uses, and shares information when you
            visit <span className="font-semibold text-foreground">bitcoinforthearts.org</span> or
            use our services (including grants, workshops, donations, and contact
            forms).
          </p>

          <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
            <p>
              <strong>Effective date:</strong> January 29, 2026
              <br />
              <strong>Last updated:</strong> January 29, 2026
            </p>

            <h2>Summary</h2>
            <ul>
              <li>
                We collect information you provide through our forms (for example:
                grant applications, volunteer signups, workshop interest, feedback,
                and governance nominations).
              </li>
              <li>
                We use privacy-friendly analytics (Vercel Analytics / Speed Insights)
                to understand website usage and improve performance.
              </li>
              <li>
                We use Cloudflare Turnstile (when enabled) to protect forms from spam/abuse.
              </li>
              <li>
                Donations are processed through third parties (such as Stripe and/or
                BTCPay Server). We do not store full payment card numbers.
              </li>
              <li>We do not sell your personal information.</li>
            </ul>

            <h2>1. Information we collect</h2>
            <h3>Information you provide</h3>
            <p>
              When you submit a form, contact us, apply for a grant, volunteer, or
              register interest in programming, you may provide information such as:
            </p>
            <ul>
              <li>Name, email address, and optional phone number.</li>
              <li>
                Application details (for example: project descriptions, budgets,
                portfolio links, and uploaded PDFs).
              </li>
              <li>
                Bitcoin wallet addresses (for example: for grant disbursements).
              </li>
              <li>
                Donation-related information you provide (for example: email for receipts),
                depending on the donation method you choose.
              </li>
            </ul>

            <h3>Information collected automatically</h3>
            <p>
              When you visit the site, we (and our service providers) may collect
              limited technical information such as IP address, device/browser
              information, and basic usage data (for example: pages visited and performance metrics).
            </p>

            <h3>Local storage (your browser)</h3>
            <p>
              Some pages may store limited information locally in your browser (for
              example, saving a draft of a grant application). This information is
              stored on your device and is not uploaded until you submit the form.
            </p>

            <h3>Donations and on-chain activity</h3>
            <p>
              Bitcoin transactions are public by nature. If you donate using Bitcoin
              (or receive a BTC grant), the wallet address and transaction details
              may be visible on public block explorers. We do not control third-party
              block explorers.
            </p>

            <h3>Sensitive information</h3>
            <p>
              Please do not submit sensitive personal information (for example: government IDs,
              health information) through our forms unless it is necessary for your request.
              If you voluntarily include sensitive details in open-text fields, we will treat
              that information as part of your submission.
            </p>

            <h2>2. How we use your information</h2>
            <ul>
              <li>
                <strong>Operate our programs:</strong> process grant applications,
                workshop interest, volunteer signups, governance nominations, and feedback.
              </li>
              <li>
                <strong>Communicate with you:</strong> respond to messages and send
                confirmations or updates (where configured).
              </li>
              <li>
                <strong>Operate and improve the site:</strong> diagnose errors,
                improve user experience, and monitor performance.
              </li>
              <li>
                <strong>Security and abuse prevention:</strong> rate limiting, spam
                prevention, and protection against fraud/abuse.
              </li>
              <li>
                <strong>Compliance:</strong> comply with applicable laws and
                recordkeeping requirements.
              </li>
            </ul>

            <h2>3. How we share information</h2>
            <p>
              We may share information with service providers only as needed to
              operate the website and our programs, and only under appropriate
              safeguards. We may also disclose information if required by law or
              to protect rights, safety, and security.
            </p>

            <p>
              <strong>We do not sell your personal information.</strong>
            </p>

            <h3>Service providers we may use</h3>
            <ul>
              <li>
                <strong>Vercel</strong> (hosting) and <strong>Vercel Analytics / Speed Insights</strong> (site analytics and performance).
              </li>
              <li>
                <strong>MongoDB</strong> (database storage for program submissions; uploaded PDFs may be stored in database file storage).
              </li>
              <li>
                <strong>Cloudflare Turnstile</strong> (anti-spam protection for forms, when enabled).
              </li>
              <li>
                <strong>Resend</strong> and/or <strong>SMTP email providers</strong> (sending program notifications and confirmations, when configured).
              </li>
              <li>
                <strong>Stripe</strong> (card payments) and/or <strong>BTCPay Server</strong> (Bitcoin payments), depending on donation method.
              </li>
            </ul>

            <h2>4. Security</h2>
            <p>
              We use reasonable administrative, technical, and organizational measures
              designed to protect information. However, no method of transmission or
              storage is 100% secure.
            </p>

            <h2>5. Data retention</h2>
            <p>
              We retain information for as long as needed to operate our programs,
              maintain records, comply with legal obligations, resolve disputes, and
              enforce agreements. Retention periods may vary by record type.
            </p>

            <h2>6. Your rights and choices</h2>
            <ul>
              <li>
                <strong>Access / correction / deletion:</strong> You can request access to, correction of,
                or deletion of your information by contacting us.
              </li>
              <li>
                <strong>Email preferences:</strong> If we send updates, you can opt out using unsubscribe
                links (when provided) or by contacting us.
              </li>
              <li>
                <strong>Cookies & local storage:</strong> You can control cookies through your browser settings.
                Note that some features (for example, saving drafts locally) may not work without local storage.
              </li>
            </ul>

            <h2>7. Children’s privacy</h2>
            <p>
              Our website is not directed to children under 13, and we do not knowingly
              collect personal information from children under 13.
            </p>

            <h2>8. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. The version posted here is
              the current one.
            </p>

            <h2>9. Contact us</h2>
            <p>
              Questions or requests can be sent to{' '}
              <a href="mailto:hello@bitcoinforthearts.org">hello@bitcoinforthearts.org</a>.
            </p>

            <hr />

            <p>
              <strong>Download PDF:</strong>{' '}
              <a href="/privacy-policy.pdf" target="_blank" rel="noopener noreferrer">
                Privacy Policy (PDF)
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

