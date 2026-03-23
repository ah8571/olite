import Link from "next/link";

import { toolConfig, toolOrder } from "@/lib/scanner-config";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Public website crawling first</p>
            <h1 className="display">Website compliance scanning without enterprise drag.</h1>
            <p className="lede">
              Olite is a lightweight website compliance scanner focused on accessibility, privacy,
              communication consent, and basic security. Start with free public-page tools, then move into
              deeper local scans and CLI workflows later.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/tools/accessibility">
                Try free tools
              </Link>
              <Link className="button-secondary" href="#product-shape">
                See product shape
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <p className="kicker">Tonight-Friendly Launch Shape</p>
            <h2>Use Vercel for the frontend and keep the hosted scans intentionally light.</h2>
            <ul className="bullet-list">
              <li>Marketing site and free tools can deploy cheaply on Vercel</li>
              <li>Free scans should inspect one public page and return lightweight signals</li>
              <li>Heavier rendered crawling and Playwright-based automation should stay local or move later</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="page-section" id="product-shape">
        <div className="container split-grid">
          <div>
            <p className="kicker">Product Shape</p>
            <h2 className="section-title">One site, three free entry points, deeper local analysis later.</h2>
            <p className="section-copy">
              The public site should act as the top of funnel: users can try a free tool for a single page,
              understand the major risk areas, and then move into a later local scanner or CLI for deeper
              crawling.
            </p>
          </div>
          <div className="cards-grid">
            <article className="feature-card">
              <p className="kicker">Marketing</p>
              <h3>Product landing page</h3>
              <p className="muted">Explain the compliance surface clearly and keep the value proposition simple.</p>
            </article>
            <article className="feature-card">
              <p className="kicker">Free Tools</p>
              <h3>Single-page hosted scanners</h3>
              <p className="muted">Accessibility, privacy, and consent tools for quick public-page checks.</p>
            </article>
            <article className="feature-card">
              <p className="kicker">Later</p>
              <h3>Local scanner and CLI</h3>
              <p className="muted">Keep heavier Playwright crawling and broader scans out of the cheap hosted path.</p>
            </article>
            <article className="feature-card">
              <p className="kicker">SEO</p>
              <h3>Sitemap-ready structure</h3>
              <p className="muted">A clean nav, footer tool links, and route-level pages are ready for indexing.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <p className="kicker">Free Tools</p>
          <h2 className="section-title">Launch with focused entry points.</h2>
          <div className="cards-grid three">
            {toolOrder.map((tool) => (
              <article className="tool-card" key={tool}>
                <p className="kicker">Free Tool</p>
                <h3>{toolConfig[tool].title}</h3>
                <p className="muted">{toolConfig[tool].description}</p>
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
            <p className="kicker">Hosted Scan Boundaries</p>
            <h2>What Vercel is good for</h2>
            <ul className="bullet-list">
              <li>Landing pages and SEO-focused product pages</li>
              <li>Lightweight server-side form handling</li>
              <li>Single-page fetch-and-parse scans for public HTML and headers</li>
            </ul>
          </div>
          <div className="section-panel">
            <p className="kicker">Keep Out Of The Hosted Path</p>
            <h2>What should stay local later</h2>
            <ul className="bullet-list">
              <li>Large multi-page crawls</li>
              <li>Authenticated navigation flows</li>
              <li>Heavy Playwright automation</li>
              <li>Source-code-aware analysis</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}