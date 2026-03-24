import type { Metadata } from "next";
import Link from "next/link";

import { BlogArticleHero } from "@/components/blog-article-hero";
import { BlogToc } from "@/components/blog-toc";

export const metadata: Metadata = {
  title: "Best Accessibility Tools For Websites | Olite",
  description:
    "A practical guide to accessibility tools for websites, including lightweight scanners, developer tools, and broader platform options."
};

const toc = [
  { id: "overview", label: "Overview" },
  { id: "tool-list", label: "Tool List" },
  { id: "how-to-pick", label: "How To Pick" }
];

export default function BestAccessibilityToolsPage() {
  return (
    <>
      <BlogArticleHero
        eyebrow="Best-Of Guide"
        title="Best Accessibility Tools For Websites"
        description="The best accessibility tool depends on whether you need a quick public-page scan, a developer workflow, or a broader governance platform."
        noteTitle="Start with the job, not the brand list"
        note="Most teams should not jump straight to the heaviest platform. The better question is whether they need a first-pass scanner, a developer tool, or ongoing governance."
      />

      <section className="page-section">
        <div className="container blog-layout">
          <BlogToc items={toc} />
          <div className="blog-content">
            <section className="section-panel" id="overview">
              <p className="kicker">Overview</p>
              <p className="section-copy">
                Accessibility tooling spans several categories. Some tools are better for quick page-level
                checks. Some fit engineering workflows. Others are broader governance platforms. Buyers usually
                make better choices when they identify that category first.
              </p>
            </section>

            <section className="section-panel" id="tool-list">
              <p className="kicker">Tool List</p>
              <div className="cards-grid two-up">
                {[
                  ["Olite", "Lightweight public-page accessibility and privacy signal scanning with a local-first product direction."],
                  ["axe DevTools", "Developer-oriented accessibility tooling with strong recognition in engineering workflows."],
                  ["WAVE", "Well-known accessibility evaluation tooling for page-level inspection and education."],
                  ["Siteimprove", "Broader website-governance and accessibility platform posture."],
                  ["AudioEye", "Accessibility-focused platform with monitoring and remediation-oriented positioning."]
                ].map(([name, summary]) => (
                  <article className="feature-card" key={name}>
                    <h3>{name}</h3>
                    <p className="muted">{summary}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="section-panel" id="how-to-pick">
              <p className="kicker">How To Pick</p>
              <ul className="bullet-list">
                <li>Choose a lightweight scanner first if you need quick signal and triage</li>
                <li>Choose developer tooling if the team wants checks close to engineering and QA workflows</li>
                <li>Choose a governance platform if reporting and oversight are already central requirements</li>
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