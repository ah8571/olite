import type { Metadata } from "next";
import Link from "next/link";

import { BlogArticleHero } from "@/components/blog-article-hero";
import { BlogToc } from "@/components/blog-toc";

export const metadata: Metadata = {
  title: "Review of Cookiebot | Olite",
  description:
    "A practical review of Cookiebot for teams evaluating cookie-consent tooling versus a lighter privacy standards checker like Olite."
};

const toc = [
  { id: "overview", label: "Overview" },
  { id: "where-it-looks-strong", label: "Where It Looks Strong" },
  { id: "where-it-feels-narrower", label: "Where It Feels Narrower" },
  { id: "where-olite-differs", label: "Where Olite Differs" }
];

export default function ReviewOfCookiebotPage() {
  return (
    <>
      <BlogArticleHero
        eyebrow="Competitor Review"
        title="Review of Cookiebot"
        description="Cookiebot is most relevant when cookie consent is already the center of the implementation problem. That is narrower than Olite's scanner-first privacy standards position."
        noteTitle="Use this as a category-clarity page"
        note="The decision here is often less about which vendor is better and more about whether the buyer needs a consent-management product or a broader first-pass scanner."
      />

      <section className="page-section">
        <div className="container blog-layout">
          <BlogToc items={toc} />
          <div className="blog-content">
            <section className="section-panel" id="overview">
              <p className="kicker">Overview</p>
              <h2>Cookiebot is a privacy-specific workflow, not a general website signal scanner.</h2>
              <p className="section-copy">
                Cookiebot appears strongest when a team already knows cookie consent and related privacy
                controls are the immediate priority. Olite is being shaped more as an early scanner for visible
                privacy standards signals rather than as a dedicated consent-management platform.
              </p>
            </section>

            <section className="section-panel" id="where-it-looks-strong">
              <p className="kicker">Where It Looks Strong</p>
              <ul className="bullet-list">
                <li>Clear category fit around cookie consent and privacy controls</li>
                <li>More specialized than a general website signal checker</li>
                <li>Good match when the central need is consent implementation</li>
              </ul>
            </section>

            <section className="section-panel" id="where-it-feels-narrower">
              <p className="kicker">Where It Feels Narrower</p>
              <ul className="bullet-list">
                <li>Narrower than a combined accessibility and privacy scanner direction</li>
                <li>Less useful if the user wants one entry point across several visible compliance surfaces</li>
                <li>Not aligned with a broader local-first scan engine model</li>
              </ul>
            </section>

            <section className="section-panel" id="where-olite-differs">
              <p className="kicker">Where Olite Differs</p>
              <ul className="bullet-list">
                <li>Olite can act as a simpler first-pass privacy checker instead of only a consent-management layer</li>
                <li>Olite can pair privacy and accessibility in the same product story</li>
                <li>The free privacy tool gives a cleaner prospecting and discovery wedge</li>
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