import type { Metadata } from "next";
import Link from "next/link";

import { blogPages } from "@/lib/blog-pages";

export const metadata: Metadata = {
  title: "Blog | Olite",
  description:
    "Olite blog pages covering competitor reviews, comparison articles, and best-of guides for accessibility and privacy tooling."
};

export default function BlogIndexPage() {
  const groups = {
    review: blogPages.filter((page) => page.category === "review"),
    comparison: blogPages.filter((page) => page.category === "comparison"),
    "best-of": blogPages.filter((page) => page.category === "best-of")
  };

  return (
    <>
      <section className="tool-page-hero">
        <div className="container split-grid tool-hero-grid">
          <div>
            <p className="eyebrow">Blog</p>
            <h1 className="tool-title">Comparison pages, reviews, and category guides for early SEO.</h1>
            <p className="tool-copy">
              These pages should help visitors make a real tool choice while also building search coverage
              around accessibility and privacy categories Olite wants to own over time.
            </p>
          </div>
          <aside className="section-panel">
            <p className="kicker">Content Shape</p>
            <h2>Flat blog routes, shared components, explicit authored pages</h2>
            <p className="section-copy">
              The goal is not a generic content template factory. The goal is reusable article UI with pages
              written intentionally and published under a clear blog structure.
            </p>
          </aside>
        </div>
      </section>

      {Object.entries(groups).map(([group, entries]) => (
        <section className="page-section" key={group}>
          <div className="container">
            <p className="kicker">{group === "best-of" ? "Best-Of" : group === "comparison" ? "Comparison" : "Review"}</p>
            <div className="cards-grid two-up">
              {entries.map((entry) => (
                <article className="feature-card" key={entry.href}>
                  <h2>{entry.title}</h2>
                  <p className="muted">{entry.description}</p>
                  <div className="tool-actions">
                    <Link className="button-secondary" href={entry.href}>
                      Open article
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}