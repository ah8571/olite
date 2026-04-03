# Blog Articles

This file is the internal planning note for blog article development.

## Purpose

- Keep public utility pages focused on product coverage and limitations.
- Move article ideation, clustering, and writing conventions into docs instead of exposing backlog lists on utility pages.
- Track candidate topics that can become fuller SEO or education articles later.

## Current Article Conventions

- Prefer intentional authored pages over generic content generation.
- Use the shared blog article UI when possible:
  - `app/components/blog-article-hero.tsx`
  - `app/components/blog-toc.tsx`
- Keep article-wide styling in `app/globals.css` so the blog can standardize over time.
- Prefer a scannable structure with a hero, a table of contents when the article is longer, and section panels with clear headings.
- When making factual claims, cite sources inline in parentheses with the source name hyperlinked.
- Use internal links where they genuinely help navigation, but do not force every utility page to behave like a content hub.

## Current Public Hub Strategy

- `app/what-olite-checks/page.tsx` is the main public explainer hub for what the product checks.
- Deeper educational topics should usually live as blog articles rather than bloating the utility hub.
- Current supporting explainers include:
  - `/blog/what-is-at-approximation`
  - `/blog/what-is-global-privacy-control`
  - `/blog/cookie-audit`

## Candidate Article Topics

### Accessibility

- Why placeholder-only fields still create accessibility problems
- Why skip links break after render on modern websites
- Why accessible names disappear after hydration
- Why tab, dialog, and disclosure state bugs matter for screen readers
- What AT approximation can and cannot prove

### Privacy

- Why a privacy policy link can fail verification even when a footer link exists
- What visible US privacy rights cues look like
- Why GPC and browser-based opt-out language matter
- Why a cookie banner does not prove compliant tracker behavior
- What runtime privacy verification adds beyond public-page review

### Security And Method

- What baseline security-header coverage does and does not tell you
- Why lightweight website scanners should separate strong findings from softer guidance
- Why public-page scanning is useful before deeper authenticated review
- How to read evidence-based scan output without treating it as certification

## Near-Term Writing Priorities

- Prioritize topics that explain checks already present in the product.
- Prefer articles that strengthen the accessibility and privacy clusters around current tool pages.
- Use new articles to support product understanding first, then SEO breadth second.