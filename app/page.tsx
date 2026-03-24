import type { Metadata } from "next";
import Link from "next/link";

import { blogPages } from "@/lib/blog-pages";
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
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Verification scans for accessibility and privacy</p>
            <h1 className="display">Check whether your website is missing obvious accessibility and privacy essentials.</h1>
            <p className="lede">
              Olite helps teams verify whether public pages appear to implement core accessibility and
              privacy signals correctly. Start with a free scan, find the visible gaps, and decide what to
              fix next.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/tools/accessibility">
                Try accessibility scanner
              </Link>
              <Link className="button-secondary" href="/pricing">
                View pricing
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <p className="kicker">Start Here</p>
            <h2>Run a fast first-pass check before you spend time on the wrong problem.</h2>
            <ul className="bullet-list">
              <li>Scan one public URL for visible accessibility warnings</li>
              <li>Check a page for privacy links, cookie wording, tracking, and header signals</li>
              <li>Use the result to prioritize what needs a deeper manual review</li>
            </ul>
            <div className="hero-actions compact">
              <Link className="button-secondary" href="/tools/privacy">
                Open privacy checker
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section" id="product-shape">
        <div className="container split-grid">
          <div>
            <p className="kicker">What Olite Is For</p>
            <h2 className="section-title">A practical verification layer for websites.</h2>
            <p className="section-copy">
              Olite is built to answer a straightforward question: does this site appear to have the basics in
              place, or are there obvious accessibility and privacy gaps that need attention?
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
              <p className="kicker">Next Step</p>
              <h3>Move from signal to investigation</h3>
              <p className="muted">Use the first-pass scan to decide what needs deeper technical or legal review.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <p className="kicker">Free Tools</p>
          <h2 className="section-title">Two focused scanners. No bloated menu.</h2>
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
              <li>Fast public-page checks before a proper manual audit</li>
            </ul>
          </div>
          <div className="section-panel">
            <p className="kicker">Privacy Coverage</p>
            <h2>What the free privacy checker looks for</h2>
            <ul className="bullet-list">
              <li>Privacy or cookie policy link visibility</li>
              <li>Cookie wording, tracking signals, and baseline header presence</li>
              <li>Public GDPR-facing signals before a legal or technical review</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container split-grid">
          <div>
            <p className="kicker">Pricing</p>
            <h2 className="section-title">Start with free public-page checks.</h2>
            <p className="section-copy">
              The free tools are meant to make the product easy to try. If you need broader local scans,
              repeatable reports, or workflow support later, that can expand into paid plans.
            </p>
          </div>
          <div className="section-panel">
            <p className="kicker">Current Offer</p>
            <h2>Start free, then move deeper only if you need to.</h2>
            <ul className="bullet-list">
              <li>Free accessibility scanner for one public page at a time</li>
              <li>Free privacy standards checker for one public page at a time</li>
              <li>Planned paid path for local-first, repeatable scans and broader workflows</li>
            </ul>
            <div className="hero-actions compact">
              <Link className="button" href="/pricing">
                See pricing details
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section" id="download">
        <div className="container split-grid">
          <div>
            <p className="kicker">Download</p>
            <h2 className="section-title">Desktop app beta coming next.</h2>
            <p className="section-copy">
              The downloadable desktop app is the path to broader local-first scanning. The public beta is
              not ready to download yet, but this is where the desktop release will live once it is ready.
            </p>
            <div className="hero-actions">
              <Link
                className="button"
                href="mailto:hello@olite.dev?subject=Olite%20desktop%20beta%20interest"
              >
                Join desktop beta list
              </Link>
              <Link className="button-secondary" href="/pricing">
                See pricing and access
              </Link>
            </div>
          </div>
          <div className="section-panel">
            <p className="kicker">Current Status</p>
            <h2>What to expect from the first desktop MVP</h2>
            <ul className="bullet-list">
              <li>Local crawl of a simple public website starting from one URL</li>
              <li>Grouped findings for accessibility, privacy, consent, and basic security signals</li>
              <li>Exportable results for early remediation and client review workflows</li>
            </ul>
            <p className="section-copy">
              Until the packaged beta is available, the free hosted tools remain the best way to try Olite.
            </p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <p className="kicker">Guides And Comparisons</p>
          <h2 className="section-title">Read practical reviews and comparison guides.</h2>
          <div className="cards-grid three">
            {blogPages.map((entry) => (
              <article className="feature-card" key={entry.href}>
                <p className="kicker">Guide</p>
                <h3>{entry.title}</h3>
                <p className="muted">{entry.description}</p>
                <div className="tool-actions">
                  <Link className="button-secondary" href={entry.href}>
                    Open page
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="hero-actions compact">
            <Link className="button-secondary" href="/blog">
              Browse blog
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}