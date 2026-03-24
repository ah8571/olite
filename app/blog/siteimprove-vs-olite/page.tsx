import type { Metadata } from "next";
import Link from "next/link";

import { BlogArticleHero } from "@/components/blog-article-hero";
import { BlogToc } from "@/components/blog-toc";
import { ComparisonTable } from "@/components/comparison-table";

export const metadata: Metadata = {
  title: "Siteimprove vs Olite | Olite",
  description:
    "Compare Siteimprove and Olite for accessibility and website compliance workflows, from enterprise governance to lighter local-first scanning."
};

const toc = [
  { id: "overview", label: "Overview" },
  { id: "comparison-matrix", label: "Comparison Matrix" },
  { id: "choose-olite", label: "Choose Olite If" },
  { id: "choose-siteimprove", label: "Choose Siteimprove If" }
];

const rows = [
  {
    topic: "Product shape",
    olite: "Lightweight scanner with free public-page tools and a planned local-first CLI and desktop path.",
    alternative: "Broader website-governance and accessibility platform approach."
  },
  {
    topic: "Best fit",
    olite: "Agencies, lean product teams, and operators who want a fast first pass.",
    alternative: "Larger organizations that want broader reporting and governance workflows."
  },
  {
    topic: "Accessibility workflow",
    olite: "Simple signal-oriented scanning and clearer early triage.",
    alternative: "More established platform posture for ongoing accessibility oversight."
  },
  {
    topic: "Operating model",
    olite: "Intended to stay local-first for deeper scans.",
    alternative: "Heavier platform-style operating model."
  }
];

export default function SiteimproveVsOlitePage() {
  return (
    <>
      <BlogArticleHero
        eyebrow="Comparison"
        title="Siteimprove vs Olite"
        description="This is mostly a question of product shape. Siteimprove appears better matched to broader governance programs, while Olite is being shaped as a lighter scanner-first entry point."
        noteTitle="Match the tool to the job"
        note="The right answer depends on whether the team needs a governance platform now or a simpler first-pass scanner with a local-first product direction."
      />

      <section className="page-section">
        <div className="container blog-layout">
          <BlogToc items={toc} />
          <div className="blog-content">
            <section className="section-panel" id="overview">
              <p className="kicker">Overview</p>
              <p className="section-copy">
                Teams comparing Siteimprove and Olite are usually not making a like-for-like choice. One tool
                appears better suited to broader governance, oversight, and reporting. The other is being
                positioned as a lighter way to get real accessibility and privacy signals quickly.
              </p>
            </section>

            <section className="section-panel" id="comparison-matrix">
              <p className="kicker">Comparison Matrix</p>
              <h2>Where the product shapes differ</h2>
              <ComparisonTable rows={rows} />
            </section>

            <section className="section-panel" id="choose-olite">
              <p className="kicker">Choose Olite If</p>
              <ul className="bullet-list">
                <li>You want a lighter starting point instead of a broad governance platform</li>
                <li>You want accessibility and privacy standards checks in the same product narrative</li>
                <li>You care about a local-first CLI and desktop direction later</li>
              </ul>
            </section>

            <section className="section-panel" id="choose-siteimprove">
              <p className="kicker">Choose Siteimprove If</p>
              <ul className="bullet-list">
                <li>You need broader governance or enterprise-style reporting posture now</li>
                <li>You are buying for a larger organization with more formal oversight needs</li>
                <li>You want a more established platform category today</li>
              </ul>
              <div className="hero-actions compact">
                <Link className="button" href="/tools/accessibility">
                  Try Olite first
                </Link>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}