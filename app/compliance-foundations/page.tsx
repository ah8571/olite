import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Compliance Foundations",
  description:
    "A running reference for the accessibility, privacy, consent, and security foundations Olite is building into its scanner workflow."
};

export default function ComplianceFoundationsPage() {
  return (
    <section className="page-section">
      <div className="container blog-content">
        <div className="section-panel">
          <p className="kicker">Compliance Foundations</p>
          <h1 className="section-title">The running list behind what Olite is checking.</h1>
          <p className="section-copy">
            Olite is not trying to flatten compliance into one vague score. The scanner is built around
            observable foundations across accessibility, privacy, consent, and basic security.
          </p>
          <p className="section-copy">
            This page is the public summary. The fuller internal working document stays in
            <Link className="footer-link" href="https://github.com/ah8571/olite/blob/main/docs/Compliance_foundations.md"> the repository docs</Link>.
          </p>
        </div>

        <div className="section-panel">
          <p className="kicker">Accessibility</p>
          <h2>Foundations Olite can verify well</h2>
          <ul className="bullet-list">
            <li>Page title and html language signals</li>
            <li>Main landmark and heading structure warnings</li>
            <li>Alt text coverage, labels, and accessible names</li>
            <li>Placeholder-only fields, iframe titles, and positive tabindex warnings</li>
            <li>Rendered checks such as hidden focusables, skip-link failures, and early keyboard progression</li>
          </ul>
          <div className="hero-actions compact">
            <Link className="button-secondary" href="/tools/accessibility">
              Accessibility landing page
            </Link>
          </div>
        </div>

        <div className="section-panel">
          <p className="kicker">Privacy</p>
          <h2>Foundations Olite is using for public-page review</h2>
          <ul className="bullet-list">
            <li>Privacy-policy visibility and destination verification</li>
            <li>Cookie wording and reject or manage controls for EU-inclusive reviews</li>
            <li>Rights-request paths, opt-out cues, and GPC visibility for US-only reviews</li>
            <li>Tracking detections, email capture transparency, and baseline security headers</li>
            <li>A path toward deeper runtime consent and browser-signal verification in desktop workflows</li>
          </ul>
          <div className="hero-actions compact">
            <Link className="button-secondary" href="/tools/privacy">
              Privacy landing page
            </Link>
          </div>
        </div>

        <div className="section-panel">
          <p className="kicker">Method</p>
          <h2>How the product is separating strong checks from softer guidance</h2>
          <ul className="bullet-list">
            <li>Static DOM checks for markup and semantics</li>
            <li>Rendered checks for post-hydration state and interaction behavior</li>
            <li>Network and browser checks later for stronger privacy verification</li>
            <li>Clear limitation messaging when a rule is advisory or partial</li>
          </ul>
          <div className="hero-actions compact">
            <Link className="button-secondary" href="/what-olite-checks">
              View the public issue catalog
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}