import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Nudadequa LLC DBA Olite."
};

export default function PrivacyPolicyPage() {
  return (
    <section className="page-section">
      <div className="container section-panel">
        <p className="kicker">Privacy Policy</p>
        <h1 className="section-title">Privacy Policy for Nudadequa LLC DBA Olite</h1>
        <p className="section-copy">Effective date: March 29, 2026</p>
        <p className="section-copy">
          Nudadequa LLC, doing business as Olite, provides hosted website scanning tools, a local-first desktop
          application, documentation, and related support. This page explains the basic categories of information we
          collect and how we use them.
        </p>

        <h2>Information We Collect</h2>
        <p className="section-copy">
          We may collect website URLs submitted into hosted tools, basic request metadata needed to operate and rate-limit
          the service, messages you send to our support address, and transaction or download details provided through our
          commerce or release workflows.
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

        <h2>Sharing</h2>
        <p className="section-copy">
          We may share information with service providers that support hosting, payments, releases, email, or support.
          We do not sell personal information in the ordinary sense described by this basic notice.
        </p>

        <h2>Retention</h2>
        <p className="section-copy">
          We retain information for as long as reasonably necessary to operate the service, maintain records, resolve
          disputes, comply with law, and improve the product.
        </p>

        <h2>Your Requests</h2>
        <p className="section-copy">
          To ask about access, correction, deletion, or other privacy-related requests, contact hello@olite.dev. We may
          need to verify your request before completing it.
        </p>

        <h2>Contact</h2>
        <p className="section-copy">For privacy questions, contact hello@olite.dev.</p>
      </div>
    </section>
  );
}