import type { Metadata } from "next";
import Link from "next/link";

import { BlogArticleHero } from "@/components/blog-article-hero";
import { BlogToc } from "@/components/blog-toc";

export const metadata: Metadata = {
  title: "Best Privacy Compliance Tools For Websites",
  description:
    "A practical guide to privacy compliance tools for websites, including cookie-consent products, policy tools, and lighter privacy signal scanners."
};

const toc = [
  { id: "overview", label: "Overview" },
  { id: "tool-list", label: "Tool List" },
  { id: "how-to-pick", label: "How To Pick" }
];

export default function BestPrivacyComplianceToolsPage() {
  return (
    <>
      <BlogArticleHero
        eyebrow="Best-Of Guide"
        title="Best Privacy Compliance Tools For Websites"
        description="Privacy tooling varies a lot. Some products are built around cookie consent. Others are better for policy generation or broader website scanning."
        noteTitle="Use category clarity first"
        note="A consent-management product does not solve every privacy problem. A first-pass scanner helps teams see visible issues before deciding how much tooling they really need."
      />

      <section className="page-section">
        <div className="container blog-layout">
          <BlogToc items={toc} />
          <div className="blog-content">
            <section className="section-panel" id="overview">
              <p className="kicker">Overview</p>
              <p className="section-copy">
                The useful starting question is not which privacy product is most famous. It is whether the
                team needs cookie-consent tooling, policy generation, broader governance, or a quick website
                standards check to identify visible issues first.
              </p>
            </section>

            <section className="section-panel" id="tool-list">
              <p className="kicker">Tool List</p>
              <div className="cards-grid two-up">
                {[
                  ["Olite", "Lightweight privacy standards checks paired with accessibility scanning and a local-first roadmap."],
                  ["Cookiebot", "Cookie-consent and privacy-focused workflow tooling."],
                  ["OneTrust", "Well-known privacy and governance platform with broader enterprise positioning."],
                  ["Termly", "Privacy-policy and consent-oriented product for simpler website compliance tasks."],
                  ["iubenda", "Privacy-policy and consent product with a recognizable category position."]
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
                <li>Choose a consent product if consent implementation is already the immediate problem</li>
                <li>Choose a broader governance platform if privacy oversight is already formalized across the organization</li>
                <li>Choose a first-pass scanner if you need to see visible privacy signals before selecting a heavier system</li>
              </ul>
              <div className="hero-actions compact">
                <Link className="button" href="/tools/privacy">
                  Try privacy checker
                </Link>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}