import type { Metadata } from "next";
import Link from "next/link";

import { BlogArticleHero } from "@/components/blog-article-hero";
import { BlogToc } from "@/components/blog-toc";

export const metadata: Metadata = {
  title: "Review of Siteimprove",
  description:
    "A practical review of Siteimprove for teams comparing accessibility and website-governance tools against a lighter product like Olite."
};

const toc = [
  { id: "overview", label: "Overview" },
  { id: "where-it-looks-strong", label: "Where It Looks Strong" },
  { id: "where-it-feels-heavy", label: "Where It Feels Heavy" },
  { id: "where-olite-differs", label: "Where Olite Differs" }
];

export default function ReviewOfSiteimprovePage() {
  return (
    <>
      <BlogArticleHero
        eyebrow="Competitor Review"
        title="Review of Siteimprove"
        description="Siteimprove looks strongest when a team wants a broader website-governance and accessibility platform. That is not the same job as Olite's lighter scanner-first product direction."
        noteTitle="Use this as a buying-context page"
        note="The point is to explain fit and tradeoffs clearly, not to pretend every buyer wants the same level of platform weight."
      />

      <section className="page-section">
        <div className="container blog-layout">
          <BlogToc items={toc} />
          <div className="blog-content">
            <section className="section-panel" id="overview">
              <p className="kicker">Overview</p>
              <h2>Siteimprove appears to be a broader governance product, not a quick first-pass scanner.</h2>
              <p className="section-copy">
                Siteimprove makes the most sense for organizations that want structured reporting,
                cross-functional oversight, and a more established platform around website quality and
                accessibility. That can be a strong fit, but it is a different entry point from Olite's
                lighter accessibility and privacy standards scanner.
              </p>
            </section>

            <section className="section-panel" id="where-it-looks-strong">
              <p className="kicker">Where It Looks Strong</p>
              <ul className="bullet-list">
                <li>Broader website-governance posture than a simple scanner</li>
                <li>Likely stronger fit for larger organizations with ongoing reporting needs</li>
                <li>Recognizable product category for accessibility oversight and governance</li>
              </ul>
            </section>

            <section className="section-panel" id="where-it-feels-heavy">
              <p className="kicker">Where It Feels Heavy</p>
              <ul className="bullet-list">
                <li>May be more platform than smaller teams want early</li>
                <li>Heavier operating model than a quick scanner-first product</li>
                <li>Less aligned with a local-first CLI and desktop direction</li>
              </ul>
            </section>

            <section className="section-panel" id="where-olite-differs">
              <p className="kicker">Where Olite Differs</p>
              <ul className="bullet-list">
                <li>Olite should feel faster to try and easier to understand</li>
                <li>Olite can combine accessibility and privacy standards checks in one lighter product narrative</li>
                <li>Deeper scans can move into a local-first CLI and desktop model later</li>
              </ul>
              <div className="hero-actions compact">
                <Link className="button" href="/tools/accessibility">
                  Try accessibility scanner
                </Link>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}