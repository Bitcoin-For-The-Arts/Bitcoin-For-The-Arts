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
            use our services (including grants, workshops, webinars, education
            content, donations, and contact forms).
          </p>

          <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
            <p>
              <strong>Effective date:</strong> January 29, 2026
              <br />
              <strong>Last updated:</strong> February 12, 2026
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

            <h3>Cookies and similar technologies</h3>
            <p>
              We and our service providers may use cookies or similar technologies (for example, local storage)
              to operate the site and improve performance. Your browser may allow you to manage cookies and
              local storage settings. If you disable certain storage mechanisms, parts of the site may not function
              as intended (for example, saving a local draft).
            </p>

            <h4>Cookie preferences</h4>
            <p>
              You can control cookie and storage behavior at any time through your browser settings. Common options include:
            </p>
            <ul>
              <li>
                <strong>Clear site data:</strong> remove stored cookies and local storage for <span className="font-semibold">bitcoinforthearts.org</span>.
              </li>
              <li>
                <strong>Block cookies:</strong> block all cookies, or block third-party cookies (if enabled).
              </li>
              <li>
                <strong>Private browsing:</strong> limit storage by using private/incognito mode.
              </li>
            </ul>
            <p>
              If your browser supports <strong>Global Privacy Control (GPC)</strong> or “Do Not Track,” you can enable it in your browser.
              While not all systems interpret these signals the same way, we use them as a preference signal and do not use data for
              cross-context behavioral advertising.
            </p>

            <h3>Analytics</h3>
            <p>
              We use Vercel Analytics and Vercel Speed Insights to understand website usage and performance. These tools
              are intended to be privacy-friendly and focused on aggregated measurement rather than cross-site advertising.
              If you prefer, you can limit analytics by using browser controls that restrict cookies and site storage.
            </p>

            <h3>Local storage (your browser)</h3>
            <p>
              Some pages may store limited information locally in your browser (for
              example, saving a draft of a grant application). This information is
              stored on your device and is not uploaded until you submit the form.
            </p>

            <h3>Education content and third-party platforms</h3>
            <p>
              Our webinar and education pages link to presentations hosted on third-party
              platforms (for example, Google Slides and Gamma). When you click a webinar link,
              you leave our site. We do not collect any additional personal information through
              these links. The third-party platform&rsquo;s privacy policy governs your use of
              their service. All BFTA education materials are published under Creative Commons
              Attribution 4.0 International (CC&nbsp;BY&nbsp;4.0) unless otherwise noted.
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

            <h2>3. Legal bases for processing (EEA/UK users)</h2>
            <p>
              If you are located in the European Economic Area (EEA) or the United Kingdom, we process personal
              information only when we have a valid legal basis under applicable law. Depending on the context,
              these legal bases may include:
            </p>
            <ul>
              <li>
                <strong>Consent:</strong> when you choose to provide information to us or opt into certain communications.
              </li>
              <li>
                <strong>Contract:</strong> to provide services you request (for example, processing program participation).
              </li>
              <li>
                <strong>Legitimate interests:</strong> to operate, secure, and improve our website and services (for example, preventing fraud/abuse).
              </li>
              <li>
                <strong>Legal obligations:</strong> to comply with applicable laws and recordkeeping requirements.
              </li>
            </ul>

            <h2>4. How we share information</h2>
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
                <strong>Vercel</strong> (hosting and infrastructure) and{' '}
                <strong>Vercel Analytics / Speed Insights</strong> (website usage and performance measurement).{' '}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vercel privacy policy
                </a>
                .
              </li>
              <li>
                <strong>MongoDB</strong> (database storage for program submissions and operational records; uploaded PDFs may be stored in database file storage).{' '}
                <a
                  href="https://www.mongodb.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  MongoDB privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Cloudflare</strong> (Turnstile anti-spam protection for forms, when enabled).{' '}
                <a
                  href="https://www.cloudflare.com/privacypolicy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cloudflare privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Resend</strong> (email delivery, when configured).{' '}
                <a
                  href="https://resend.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Resend privacy policy
                </a>
                .
              </li>
              <li>
                <strong>SMTP email providers</strong> (sending program notifications and confirmations, when configured; for example, Zoho Mail).{' '}
                <a
                  href="https://www.zoho.com/privacy.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Zoho privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Stripe</strong> (card payments and subscription management).{' '}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stripe privacy policy
                </a>
                .
              </li>
              <li>
                <strong>BTCPay Server</strong> (Bitcoin payment processing, depending on donation method). If we operate our own BTCPay Server instance,
                it processes invoice and payment details to complete your donation. If a third party operates the BTCPay Server instance, their privacy policy
                may also apply.
              </li>
              <li>
                <strong>Google</strong> (education content hosting). Some webinar presentations are hosted on Google Slides / Google Docs. When you open
                a webinar link, you leave our site and interact with Google&rsquo;s services. We do not control data Google collects on its platforms.{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Gamma</strong> (presentation hosting). Some education content may be hosted on Gamma. When you open
                a Gamma-hosted presentation, you leave our site and interact with Gamma&rsquo;s services.{' '}
                <a
                  href="https://gamma.app/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Gamma privacy policy
                </a>
                .
              </li>
            </ul>

            <h2>5. Security</h2>
            <p>
              We use reasonable administrative, technical, and organizational measures
              designed to protect information. However, no method of transmission or
              storage is 100% secure.
            </p>

            <h2>6. Data retention</h2>
            <p>
              We retain information for as long as needed to operate our programs, comply with legal obligations,
              resolve disputes, and enforce agreements. Retention may vary by record type. As a US nonprofit based in
              New York, we generally follow recordkeeping practices appropriate for program administration and compliance.
            </p>

            <p>
              Our current retention targets are:
            </p>
            <ul>
              <li>
                <strong>Grant applications and related records:</strong> generally retained for up to 7 years, then deleted.
              </li>
              <li>
                <strong>Contact submissions and program inquiries:</strong> retained until no longer needed for the purpose
                of the communication, or until you request deletion (subject to legal exceptions).
              </li>
              <li>
                <strong>Operational/security logs (where maintained):</strong> generally retained for up to 1 year.
              </li>
            </ul>

            <p>
              Deletion may occur on a rolling basis (for example, periodic reviews) and may be delayed where needed for
              legal, security, or operational reasons (for example, fraud prevention, dispute resolution, or audit requirements).
            </p>

            <h2>7. Your rights and choices</h2>
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

            <h2>8. Submitting privacy requests (DSAR process)</h2>
            <p>
              To submit a privacy request, email{' '}
              <a href="mailto:privacy@bitcoinforthearts.org">privacy@bitcoinforthearts.org</a>. To protect your privacy,
              we may need to verify your identity (for example, by confirming details related to your submission).
            </p>
            <p>
              We generally respond within the timelines required by applicable law. For example, for certain US state
              privacy requests, we aim to respond within <strong>45 days</strong> (and may extend where permitted).
            </p>

            <h2>9. Additional disclosures for California residents (CCPA/CPRA)</h2>
            <p>
              This section provides additional information for California residents about how we collect, use, and disclose
              personal information, as required by the California Consumer Privacy Act (CCPA) as amended by the CPRA.
            </p>

            <h3>Categories of personal information we collect</h3>
            <p>
              In the last 12 months, we may have collected the following categories of personal information (depending on how you use the site):
            </p>
            <ul>
              <li>
                <strong>Identifiers</strong> (for example: name, email address, IP address).
              </li>
              <li>
                <strong>Internet or other electronic network activity information</strong> (for example: interactions with pages and performance metrics).
              </li>
              <li>
                <strong>Professional or other information you provide</strong> (for example: portfolio links, project details, application materials).
              </li>
              <li>
                <strong>Donation/payment-related information</strong> (processed by third parties; we may receive limited records such as donation status or transaction identifiers).
              </li>
            </ul>

            <h3>Sources, purposes, and disclosures</h3>
            <p>
              We collect personal information from (a) you, (b) your browser/device automatically, and (c) service providers that help deliver payments or site functionality.
              We use and disclose personal information for the business and commercial purposes described above in this policy (program operations, communications, security,
              analytics/performance, and compliance).
            </p>

            <h3>Sensitive personal information</h3>
            <p>
              We do not intentionally collect “sensitive personal information” as defined by the CPRA. If you include sensitive information in open-text fields,
              we will treat it as part of your submission.
            </p>

            <h3>Sale and sharing</h3>
            <p>
              We do not sell personal information. We also do not “share” personal information for cross-context behavioral advertising.
            </p>

            <h3>Your California privacy rights</h3>
            <p>
              Subject to certain exceptions, you may have the right to request: (a) access to personal information we collected about you, (b) deletion,
              (c) correction, and (d) information about our collection, use, and disclosure practices. We will not discriminate against you for exercising your rights.
              You (or an authorized agent) can submit requests by emailing{' '}
              <a href="mailto:privacy@bitcoinforthearts.org">privacy@bitcoinforthearts.org</a>.
            </p>

            <h2>10. International data transfers</h2>
            <p>
              We are based in the United States, and our service providers may process information in the United States and other countries. If you access the site from
              outside the United States, you understand that your information may be transferred to, stored, and processed in jurisdictions that may have different
              data protection laws than your home jurisdiction.
            </p>

            <h2>11. Children’s privacy</h2>
            <p>
              Our website is not directed to children under 13, and we do not knowingly
              collect personal information from children under 13.
            </p>

            <h2>12. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. The version posted here is
              the current one.
            </p>

            <h2>13. Contact us</h2>
            <p>
              General questions can be sent to{' '}
              <a href="mailto:hello@bitcoinforthearts.org">hello@bitcoinforthearts.org</a>. Privacy requests should be sent to{' '}
              <a href="mailto:privacy@bitcoinforthearts.org">privacy@bitcoinforthearts.org</a>.
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

