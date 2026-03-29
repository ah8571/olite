import type { Metadata } from "next";
import Link from "next/link";

import { PricingSection } from "@/app/components/pricing-section";
import { getCommerceConfig } from "@/lib/commerce";
import { toolConfig, toolOrder } from "@/lib/scanner-config";

export const metadata: Metadata = {
  title: "Accessibility and Privacy Website Scanner",
  description:
    "Run free accessibility and privacy checks for public webpages to catch visible WCAG, policy, cookie, and tracking issues before deeper review.",
  openGraph: {
    title: "Accessibility and Privacy Website Scanner | Olite",
    description:
      "Run free accessibility and privacy checks for public webpages to catch visible issues before moving into a deeper review.",
    url: "https://olite.dev"
  }
};

export default function HomePage() {
  const commerce = getCommerceConfig();
  const downloadTitle = commerce.hasDesktopDownload
    ? "Desktop beta downloads are live."
    : commerce.hasCheckout
      ? "Checkout is ready. Desktop delivery can start from the release flow."
      : "Use the free scans first. The desktop app is not available yet.";
  const downloadCopy = commerce.hasDesktopDownload
    ? "The first local desktop build can now be offered as a beta download while the deeper workflow keeps evolving."
    : commerce.hasCheckout
      ? "The hosted tools still make the product easy to try first, and the paid desktop path can now be routed through checkout while downloads stay tied to releases."
      : "The hosted tools are for quick testing and are capped at 2 free scans per day. The desktop app is still in development and there is not a public download available yet.";

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Open source, local-first verification</p>
            <h1 className="display">Verification scans for accessibility and privacy.</h1>
            <p className="lede">
              Olite is an open source scanner for teams that want a practical first pass on whether public
              pages appear to implement core accessibility and privacy signals correctly. Start with a free
              scan, inspect the findings, and then move into deeper local verification when needed.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/tools/accessibility">
                Try accessibility scanner
              </Link>
              <Link className="button-secondary" href="/tools/privacy">
                Try privacy scanner
              </Link>
              <Link className="button-secondary" href="https://github.com/ah8571/olite">
                View on GitHub
              </Link>
            </div>
          </div>
          <aside className="section-panel hero-aside-panel">
            <p className="kicker">Why Teams Use It</p>
            <h2>Open source and inspectable from day one.</h2>
            <ul className="bullet-list">
              <li>Free hosted scans for a quick first pass</li>
              <li>Local-first desktop workflow for broader crawls and exports</li>
              <li>Open source codebase so the rule set and roadmap stay inspectable</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="page-section" id="product-shape">
        <div className="container split-grid">
          <div>
            <p className="kicker">What Olite Is For</p>
            <h2 className="section-title">An open source verification layer for websites.</h2>
            <p className="section-copy">
              Olite is built to answer a straightforward question: does this site appear to have the basics in
              place, or are there obvious accessibility and privacy gaps that need attention? The hosted tools
              stay lightweight on purpose, while the desktop path stays local-first and inspectable.
            </p>
            <p className="section-copy">
              The open source direction matters because teams can inspect how checks are written, understand the
              product limits, and adapt the workflow without treating the scanner like a black box.
            </p>
          </div>
          <div className="cards-grid">
            <article className="feature-card">
              <p className="kicker">Before Launch</p>
              <h3>Spot visible risks early</h3>
              <p className="muted">Catch obvious issues before a release, redesign, or client handoff.</p>
            </article>
            <article className="feature-card">
              <p className="kicker">For Client Work</p>
              <h3>Use it in reviews and audits</h3>
              <p className="muted">Run a quick page check and start a concrete remediation conversation.</p>
            </article>
            <article className="feature-card">
              <p className="kicker">For Product Teams</p>
              <h3>Focus engineering attention</h3>
              <p className="muted">Translate vague compliance concerns into an actual list of things to inspect.</p>
            </article>
            <article className="feature-card">
              <p className="kicker">Open Source</p>
              <h3>Inspect the rules and evolve them</h3>
              <p className="muted">Keep the scanner auditable and adaptable instead of hiding the rule logic behind a closed product.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <p className="kicker">Free Tools</p>
          <h2 className="section-title">Two free scanners to test site. Then download the app.</h2>
          <p className="section-copy">
            Use the hosted tools for a quick first pass. You get 2 free scans per day here. If you need
            more coverage, broader crawls, or repeatable scans, move into the desktop app.
          </p>
          <p className="section-copy">
            These are lightweight automated checks for obvious issues, not a complete audit. Olite can
            automate many strong semantic and interaction signals, but important journeys may still need
            deeper manual accessibility, legal, or compliance review.
          </p>
          <div className="cards-grid two-up">
            {toolOrder.map((tool) => (
              <article className="tool-card" key={tool}>
                <p className="kicker">Free Tool</p>
                <h3>{toolConfig[tool].title}</h3>
                <p className="muted">{toolConfig[tool].description}</p>
                <ul className="mini-list spaced-list">
                  {toolConfig[tool].sampleChecks.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="tool-actions">
                  <Link className="button-secondary" href={`/tools/${toolConfig[tool].slug}`}>
                    Open tool
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container split-grid">
          <div className="section-panel">
            <p className="kicker">Accessibility Coverage</p>
            <h2>What the free accessibility scanner looks for</h2>
            <ul className="bullet-list">
              <li>Missing alt text on images</li>
              <li>Unlabeled form controls and weak page language signals</li>
              <li>Fast public-page checks for obvious issues before a fuller audit</li>
            </ul>
          </div>
          <div className="section-panel">
            <p className="kicker">Privacy Coverage</p>
            <h2>What the free privacy checker looks for</h2>
            <ul className="bullet-list">
              <li>Privacy or cookie policy link visibility and public rights-request cues</li>
              <li>Cookie wording for EU-inclusive reviews and softer rights-based signals for US-only reviews</li>
              <li>Tracking signals, opt-out cues, and baseline header presence before deeper review</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container split-grid">
          <div>
            <p className="kicker">Open Source</p>
            <h2 className="section-title">Not a black-box compliance product.</h2>
            <p className="section-copy">
              Olite is being built in the open so teams can see what the scanner actually checks, where the
              limits are, and how the product is evolving from markup checks into deeper rendered verification.
            </p>
          </div>
          <div className="section-panel">
            <p className="kicker">Why It Matters</p>
            <ul className="bullet-list">
              <li>Inspectable scanner logic and shared issue model</li>
              <li>Clearer disclosure about what is automated today versus later</li>
              <li>Natural path for contributors, agencies, and internal teams to extend the workflow</li>
            </ul>
            <div className="hero-actions compact">
              <Link className="button-secondary" href="https://github.com/ah8571/olite">
                Browse repository
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PricingSection commerce={commerce} />

      <section className="page-section" id="download">
        <div className="container split-grid">
          <div>
            <p className="kicker">Download</p>
            <h2 className="section-title">{downloadTitle}</h2>
            <p className="section-copy">{downloadCopy}</p>
            <div className="hero-actions">
              <Link className="button" href={commerce.desktopDownloadUrl}>
                {commerce.hasDesktopDownload ? "Download latest desktop build" : "Open release page"}
              </Link>
              <Link className="button-secondary" href={commerce.monthlyCheckoutUrl ?? commerce.desktopWaitlistUrl}>
                {commerce.monthlyCheckoutUrl ? "Buy monthly access" : "Join desktop beta list"}
              </Link>
              {commerce.yearlyCheckoutUrl ? (
                <Link className="button-secondary" href={commerce.yearlyCheckoutUrl}>
                  Buy annual access
                </Link>
              ) : null}
            </div>
          </div>
          <div className="section-panel">
            <p className="kicker">Current Status</p>
            <h2>What to expect from the first desktop MVP</h2>
            <ul className="bullet-list">
              <li>{commerce.hasDesktopDownload ? "Desktop beta can be shared as a downloadable build" : "Desktop app remains in active MVP development"}</li>
              <li>Step beyond the 2 free hosted scans per day</li>
              <li>Local crawl of a simple public website starting from one URL</li>
              <li>Grouped findings for accessibility, privacy, consent, and basic security signals</li>
              <li>Open source foundation with auditable scanner logic</li>
              <li>Exportable results for early remediation and client review workflows</li>
            </ul>
            <p className="section-copy">
              Start with the hosted scanners to test the site today. Then move into the local workflow when
              you need repeatable scans, exportable reports, and a broader crawl.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}