import type { Metadata } from "next";
import Link from "next/link";

import { BlogArticleHero } from "@/components/blog-article-hero";
import { BlogToc } from "@/components/blog-toc";
import { ComparisonTable } from "@/components/comparison-table";

export const metadata: Metadata = {
  title: "Cookiebot vs Olite",
  description:
    "Compare Cookiebot and Olite for privacy standards checks, cookie-consent workflows, and broader website accessibility plus privacy positioning."
};

const toc = [
  { id: "overview", label: "Overview" },
  { id: "comparison-matrix", label: "Comparison Matrix" },
  { id: "choose-olite", label: "Choose Olite If" },
  { id: "choose-cookiebot", label: "Choose Cookiebot If" }
];

const rows = [
  {
    topic: "Core focus",
    olite: "Website signal scanning across accessibility and privacy standards.",
    alternative: "Cookie-consent and privacy-specific workflow focus."
  },
  {
    topic: "Best fit",
    olite: "Teams wanting a broader first-pass website review.",
    alternative: "Teams that know cookie consent is the central implementation need."
  },
  {
    topic: "Product entry",
    olite: "Free public-page checks intended for easy discovery and triage.",
    alternative: "More focused privacy-tool posture around consent management."
  },
  {
    topic: "Future direction",
    olite: "Local-first CLI and desktop scanner for deeper workflows.",
    alternative: "Privacy workflow specialization rather than a broader website scan engine."
  }
];

export default function CookiebotVsOlitePage() {
  return (
    <>
      <BlogArticleHero
        eyebrow="Comparison"
        title="Cookiebot vs Olite"
        description="This comparison matters when a team is deciding between a privacy-specific consent product and a broader first-pass scanner that includes privacy and accessibility signals together."
        noteTitle="Start with the actual problem"
        note="If consent management is already the center of the project, Cookiebot may fit better. If the team needs a broader first pass across visible privacy standards, Olite has a clearer wedge."
      />

      <section className="page-section">
        <div className="container blog-layout">
          <BlogToc items={toc} />
          <div className="blog-content">
            <section className="section-panel" id="overview">
              <p className="kicker">Overview</p>
              <p className="section-copy">
                The key difference is that Cookiebot is closer to a privacy-specific consent workflow,
                whereas Olite is being positioned as a lighter scanner that starts with public accessibility
                and privacy standards signals together.
              </p>
            </section>

            <section className="section-panel" id="comparison-matrix">
              <p className="kicker">Comparison Matrix</p>
              <h2>Where the product directions diverge</h2>
              <ComparisonTable rows={rows} />
            </section>

            <section className="section-panel" id="choose-olite">
              <p className="kicker">Choose Olite If</p>
              <ul className="bullet-list">
                <li>You want a lighter first pass before picking a heavier privacy product</li>
                <li>You care about privacy standards and accessibility in the same product conversation</li>
                <li>You want a downloadable scanner direction later</li>
              </ul>
            </section>

            <section className="section-panel" id="choose-cookiebot">
              <p className="kicker">Choose Cookiebot If</p>
              <ul className="bullet-list">
                <li>You primarily need cookie-consent tooling and related privacy implementation support</li>
                <li>You already know the consent-management layer is the buying decision</li>
                <li>You do not need the broader scanner direction Olite is aiming toward</li>
              </ul>
              <div className="hero-actions compact">
                <Link className="button" href="/tools/privacy">
                  Try Olite's privacy checker
                </Link>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}