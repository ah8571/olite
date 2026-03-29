import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and Conditions for Nudadequa LLC DBA Olite."
};

export default function TermsPage() {
  return (
    <section className="page-section">
      <div className="container section-panel">
        <p className="kicker">Terms and Conditions</p>
        <h1 className="section-title">Terms and Conditions for Nudadequa LLC DBA Olite</h1>
        <p className="section-copy">Effective date: March 29, 2026</p>
        <p className="section-copy">
          These terms govern use of the Olite website, hosted tools, desktop application, documentation, and related
          services offered by Nudadequa LLC DBA Olite.
        </p>

        <h2>Use of the Service</h2>
        <p className="section-copy">
          You may use Olite to review public websites, operate the hosted tools, download available releases, and use the
          desktop application in accordance with applicable law and these terms. You are responsible for the URLs, systems,
          and workflows you choose to scan.
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

        <h2>Acceptable Use</h2>
        <p className="section-copy">
          You agree not to misuse the service, interfere with its operation, attempt unauthorized access, or use it in a
          way that violates law or third-party rights.
        </p>

        <h2>Disclaimer of Warranties</h2>
        <p className="section-copy">
          Olite is provided on an as-is and as-available basis to the maximum extent permitted by law. We do not guarantee
          uninterrupted operation, complete accuracy, or that findings will identify every issue on a website.
        </p>

        <h2>Limitation of Liability</h2>
        <p className="section-copy">
          To the maximum extent permitted by law, Nudadequa LLC DBA Olite will not be liable for indirect, incidental,
          special, consequential, or similar damages arising from use of the service.
        </p>

        <h2>Contact</h2>
        <p className="section-copy">For questions about these terms, contact hello@olite.dev.</p>
      </div>
    </section>
  );
}