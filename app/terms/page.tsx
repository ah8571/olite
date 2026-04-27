import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and Conditions for Planting Moon LLC DBA Olite."
};

export default function TermsPage() {
  return (
    <section className="page-section">
      <div className="container section-panel">
        <p className="kicker">Terms and Conditions</p>
        <h1 className="section-title">Terms and Conditions for Olite</h1>
        <p className="section-copy">Effective date: April 27, 2026</p>
        <p className="section-copy">
          These terms govern use of the Olite website, hosted tools, desktop application, documentation, and related
          services offered by Planting Moon LLC DBA Olite, 5830 E 2nd St, Ste 7000 #35119, Casper, Wyoming 82609 US.
        </p>

        <h2>Acceptance of These Terms</h2>
        <p className="section-copy">
          By accessing or using the Olite website, hosted tools, desktop application, checkout flows, or related
          materials, you agree to these terms. If you do not agree, do not use the service.
        </p>

        <h2>Use of the Service</h2>
        <p className="section-copy">
          You may use Olite to review public websites, operate the hosted tools, download available releases, and use the
          desktop application in accordance with applicable law and these terms. You are responsible for the URLs, systems,
          and workflows you choose to scan.
        </p>

        <h2>Intellectual Property</h2>
        <p className="section-copy">
          Olite, including its website content, branding, logos, software, documentation, and related materials, is owned
          by Planting Moon LLC or its licensors and is protected by applicable intellectual property laws. Except where
          open source license terms expressly allow otherwise, you may not copy, modify, distribute, sell, or exploit
          those materials without permission.
        </p>

        <h2>No Legal Advice or Certification</h2>
        <p className="section-copy">
          Olite provides automation-oriented verification and issue reporting. It does not provide legal advice, formal
          accessibility certification, or a guarantee that a website is fully compliant with any law or standard.
        </p>

        <h2>Open Source and Releases</h2>
        <p className="section-copy">
          Portions of Olite are provided as open source software and may be governed by the license terms included in the
          repository. Hosted services, paid access, releases, and support may also be subject to additional operational or
          commercial terms.
        </p>

        <h2>Availability</h2>
        <p className="section-copy">
          We may change, suspend, or discontinue any part of the website, hosted tools, or desktop distribution flow at any
          time. We may also apply rate limits, access limits, or other controls to protect the service.
        </p>

        <h2>Refunds and Cancellations</h2>
        <p className="section-copy">
          Paid subscriptions or other paid access to Olite may be billed through Paddle or another authorized payment
          provider acting as merchant of record. Subscription cancellations take effect at the end of the current billing
          period to prevent future renewals. Refunds, withdrawals, and other buyer rights for Paddle-processed purchases
          are governed by Paddle&apos;s published buyer terms and refund policy.
        </p>
        <p className="section-copy">
          Paddle&apos;s public policy states that, unless required by applicable law, transactions are generally
          non-refundable, while also preserving statutory withdrawal and consumer rights where they apply. For Paddle
          purchases, review the <a className="footer-link" href="https://www.paddle.com/legal/buyer-terms">Paddle Buyer Terms</a>
          {" "}and <a className="footer-link" href="https://www.paddle.com/legal/refund-policy">Paddle Refund Policy</a> for the
          governing billing, cancellation, withdrawal, and refund rules.
        </p>

        <h2>Acceptable Use</h2>
        <p className="section-copy">
          You agree not to misuse the service, interfere with its operation, attempt unauthorized access, or use it in a
          way that violates law or third-party rights.
        </p>

        <h2>Termination or Suspension</h2>
        <p className="section-copy">
          We may suspend or terminate access to some or all of the service if we reasonably believe you have violated
          these terms, misused the platform, created security or abuse risk, or used the service unlawfully.
        </p>

        <h2>Third-Party Services and Links</h2>
        <p className="section-copy">
          The website or service may link to third-party websites, software, repositories, payment providers, or other
          services. We are not responsible for the content, policies, or practices of those third parties, and your use
          of them may be governed by their own terms and policies.
        </p>

        <h2>Changes to These Terms</h2>
        <p className="section-copy">
          We may update these terms from time to time. When we do, we will update the effective date on this page and may
          provide additional notice when appropriate. Continued use of the service after an update takes effect means you
          accept the revised terms.
        </p>

        <h2>Disclaimer of Warranties</h2>
        <p className="section-copy">
          Olite is provided on an as-is and as-available basis to the maximum extent permitted by law. We do not guarantee
          uninterrupted operation, complete accuracy, or that findings will identify every issue on a website.
        </p>

        <h2>Limitation of Liability</h2>
        <p className="section-copy">
          To the maximum extent permitted by law, Planting Moon LLC DBA Olite will not be liable for indirect, incidental,
          special, consequential, or similar damages arising from use of the service.
        </p>

        <h2>Governing Law</h2>
        <p className="section-copy">
          These terms are governed by the laws applicable to Planting Moon LLC&apos;s principal place of business, except to
          the extent mandatory consumer protection law requires otherwise.
        </p>

        <h2>Contact</h2>
        <p className="section-copy">
          For questions about these terms, contact hello@olite.dev or write to Planting Moon LLC, 5830 E 2nd St, Ste
          7000 #35119, Casper, Wyoming 82609 US. You can also review our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </section>
  );
}