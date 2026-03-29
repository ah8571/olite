import type { Metadata } from "next";
import Link from "next/link";

const accessibilityIssues = [
  "Missing page title",
  "Missing html lang attribute",
  "Missing main landmark",
  "Multiple h1 headings detected",
  "Images missing alt text",
  "Placeholder-only form fields",
  "Inputs missing visible or programmatic labels",
  "Weak heading structure signals",
  "Buttons without accessible names",
  "Links without accessible names",
  "Potential focus order override from positive tabindex",
  "Iframes missing title attributes"
];

const renderedAccessibilityIssues = [
  "Focusable elements hidden from view after render",
  "Rendered skip link target missing",
  "Skip link did not change focus or route after activation",
  "Keyboard tab progression could not be established after render",
  "Keyboard focus appears stalled during early tab progression"
];

const privacyIssues = [
  "Privacy policy link could not be verified",
  "Tracking signals without visible cookie wording",
  "Cookie banner without obvious reject or manage controls",
  "No obvious privacy rights request path detected",
  "No obvious sale or sharing opt-out path detected",
  "Limited visible US privacy rights cues",
  "No visible Global Privacy Control cue detected",
  "No obvious privacy or cookie policy links detected",
  "Email capture without visible privacy cues"
];

const consentIssues = ["Email capture without visible consent signals"];

const securityIssues = [
  "Limited security header coverage",
  "Page is not served over HTTPS",
  "Forms submit to insecure HTTP targets"
];

export const metadata: Metadata = {
  title: "What Olite Checks",
  description:
    "A public list of the accessibility, privacy, consent, and security issues Olite currently isolates in website reviews."
};

function IssueSection({
  kicker,
  title,
  intro,
  issues
}: {
  kicker: string;
  title: string;
  intro: string;
  issues: string[];
}) {
  return (
    <div className="section-panel">
      <p className="kicker">{kicker}</p>
      <h2>{title}</h2>
      <p className="section-copy">{intro}</p>
      <ul className="bullet-list">
        {issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
    </div>
  );
}

export default function WhatOliteChecksPage() {
  return (
    <section className="page-section">
      <div className="container blog-content">
        <div className="section-panel">
          <p className="kicker">What Olite Checks</p>
          <h1 className="section-title">The public list of issues Olite is isolating today.</h1>
          <p className="section-copy">
            Olite is a lightweight verification scanner for public websites. It is designed to isolate
            concrete accessibility, privacy, consent, and basic security issues that teams can review and
            act on quickly.
          </p>
          <p className="section-copy">
            This page is the public issue catalog. It is meant to show what the product actually surfaces
            today, and it also gives us a clear starting point for future explainers and blog articles.
          </p>
          <p className="section-copy">
            The fuller internal framing lives in the repository docs:
            <Link className="footer-link" href="https://github.com/ah8571/olite/blob/main/docs/What_olite_checks.md"> issue catalog</Link>
            and
            <Link className="footer-link" href="https://github.com/ah8571/olite/blob/main/docs/Compliance_foundations.md"> compliance foundations</Link>.
          </p>
        </div>

        <div className="section-panel">
          <p className="kicker">Method</p>
          <h2>How Olite isolates issues</h2>
          <ul className="bullet-list">
            <li>Static DOM review for markup, labels, titles, and semantics</li>
            <li>Visible public-page review for privacy, policy, and consent cues</li>
            <li>Rendered browser checks in desktop reviews for keyboard and skip-link behavior</li>
            <li>Lightweight evidence such as selectors, snippets, and page-level location summaries</li>
          </ul>
          <p className="section-copy">
            This is an automation-oriented review workflow, not legal advice, not certification, and not a
            guarantee that every issue on a site has been found.
          </p>
        </div>

        <IssueSection
          kicker="Accessibility"
          title="Current static accessibility issues"
          intro="These are the current accessibility issues Olite can isolate directly from markup and document structure."
          issues={accessibilityIssues}
        />

        <IssueSection
          kicker="Rendered Accessibility"
          title="Current desktop-only rendered checks"
          intro="These checks currently come from the local desktop workflow, where Olite can inspect the page after render and sample early keyboard movement."
          issues={renderedAccessibilityIssues}
        />

        <IssueSection
          kicker="Privacy"
          title="Current public-page privacy issues"
          intro="These issues focus on visible policy, rights, opt-out, cookie, and tracking signals that can be observed from a public page."
          issues={privacyIssues}
        />

        <IssueSection
          kicker="Consent"
          title="Current consent issue"
          intro="Consent coverage is intentionally narrow in the current product and focuses on visible email capture cues."
          issues={consentIssues}
        />

        <IssueSection
          kicker="Security"
          title="Current baseline security issues"
          intro="These are lightweight public-web checks, not a full security audit. They are included because they often reveal obvious weaknesses quickly."
          issues={securityIssues}
        />

        <div className="section-panel">
          <p className="kicker">Article Backlog</p>
          <h2>Natural explainers we can build from this list</h2>
          <ul className="bullet-list">
            <li>Why a privacy policy link can fail verification even when a footer link exists</li>
            <li>Why placeholder-only fields still create accessibility problems</li>
            <li>Why skip links break after render on modern websites</li>
            <li>What visible US privacy rights cues look like</li>
            <li>Why GPC and browser-based opt-out language matter</li>
            <li>What baseline security-header coverage does and does not tell you</li>
          </ul>
        </div>
      </div>
    </section>
  );
}