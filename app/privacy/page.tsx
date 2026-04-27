import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Planting Moon LLC DBA Olite."
};

export default function PrivacyPolicyPage() {
  return (
    <section className="page-section">
      <div className="container section-panel">
        <p className="kicker">Privacy Policy</p>
        <h1 className="section-title">Privacy Policy for Olite</h1>
        <p className="section-copy">Effective date: April 27, 2026</p>
        <p className="section-copy">
          Planting Moon LLC, doing business as Olite, provides hosted website scanning tools, a local-first desktop
          application, documentation, and related support. This page explains the basic categories of information we
          collect and how we use them.
        </p>

        <h2>Information We Collect</h2>
        <p className="section-copy">
          We may collect website URLs submitted into hosted tools, contact details such as name or email address when you
          contact us, basic request metadata needed to operate and rate-limit the service, device and browser information,
          IP address, messages you send to our support address, and transaction or download details provided through our
          commerce, billing, or release workflows.
        </p>

        <h2>How Information Is Collected</h2>
        <p className="section-copy">
          We collect information directly from you when you submit a URL, contact us, join a waitlist, download a build,
          or complete a checkout flow. We may also collect information automatically through server logs, security and
          abuse-prevention tooling, cookies, and similar technologies used to operate the site.
        </p>

        <h2>How We Use Information</h2>
        <p className="section-copy">
          We use information to operate the hosted scanners, prevent abuse, respond to support requests, improve the
          product, and deliver or administer access to desktop builds or paid plans.
        </p>

        <h2>Hosted Scans and Local Desktop Use</h2>
        <p className="section-copy">
          Hosted scans send the submitted public URL to our service for processing. The desktop app is intended as a
          local-first workflow, and scan results stored through the desktop experience are saved on the user&apos;s device
          unless the user separately shares them.
        </p>

        <h2>Cookies and Analytics</h2>
        <p className="section-copy">
          We may use basic cookies or similar technologies required to operate the website and understand product usage.
          If we introduce additional analytics or advertising technologies, we will update this notice and any related
          consent mechanisms as needed.
        </p>

        <h2>Choices, Opt-Outs, and Privacy Signals</h2>
        <p className="section-copy">
          You may limit cookies through your browser settings and may opt out of non-essential marketing communications by
          using the unsubscribe method included in the message or by contacting us. Where applicable, we may also review
          browser-based privacy signals such as Global Privacy Control as part of our compliance workflow.
        </p>

        <h2>Sharing</h2>
        <p className="section-copy">
          We may share information with service providers that support hosting, payments, releases, email, support, and
          related operations. For example, payments and subscription billing may be processed through Paddle or another
          authorized provider. We do not sell personal information in the ordinary sense described by this basic notice.
        </p>

        <h2>Retention</h2>
        <p className="section-copy">
          We retain information for as long as reasonably necessary to operate the service, maintain records, resolve
          disputes, comply with law, and improve the product.
        </p>

        <h2>Security</h2>
        <p className="section-copy">
          We use reasonable administrative, technical, and organizational measures to protect information we handle.
          No method of transmission or storage is guaranteed to be perfectly secure, so we cannot promise absolute
          security.
        </p>

        <h2>International Use</h2>
        <p className="section-copy">
          Olite is offered online and may be accessed from multiple jurisdictions. Depending on where you are located,
          your information may be processed in countries other than your own, subject to applicable law.
        </p>

        <h2>Your Requests</h2>
        <p className="section-copy">
          To ask about access, correction, deletion, or other privacy-related requests, contact hello@olite.dev. We may
          need to verify your request before completing it.
        </p>

        <h2>Children&apos;s Privacy</h2>
        <p className="section-copy">
          Olite is not directed to children under 13, and we do not knowingly collect personal information from children
          under 13 through the website or hosted tools.
        </p>

        <h2>Policy Updates</h2>
        <p className="section-copy">
          We may update this Privacy Policy from time to time. When we do, we will update the effective date on this page
          and may provide additional notice when required or appropriate.
        </p>

        <h2>Contact</h2>
        <p className="section-copy">
          For privacy questions, contact hello@olite.dev. You can also review our <Link href="/terms">Terms and Conditions</Link>.
        </p>
      </div>
    </section>
  );
}