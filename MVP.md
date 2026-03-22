# Olite MVP Spec

## Version 0.1 Goal

Build a lightweight compliance scanner that starts from a public website URL, crawls publicly accessible pages, and identifies practical accessibility, privacy, communication consent, and basic security issues.

The first version should be useful without requiring source code access.

## Core Product Promise

Olite crawls publicly accessible website pages and identifies observable compliance signals.

Deeper analysis may be possible later when:

- the codebase is available
- authenticated sessions are available
- browser rendering and interaction workflows are expanded

## Why This MVP Direction

This approach makes the product usable for:

- Shopify sites
- website-builder platforms
- agency audits
- business owners without code access
- developers doing quick public checks

It also supports the planned free website scanner and keeps the first product easier to try.

## Version 0.1 Scope

### Input

- a public website URL

### Scan Behavior

- crawl pages on the same domain
- follow internal links up to a configurable limit
- inspect publicly reachable pages only
- collect page-level findings and a site-level summary

### Core Checks

#### Accessibility

- missing alt text
- missing form labels
- obvious heading structure issues
- color contrast issues where supported by the scan engine
- obvious WCAG-related issues from established tooling

#### Privacy and Cookie Consent

- tracking scripts detected
- cookie banner present or missing
- privacy policy page present or missing
- possible pre-consent tracking signals where observable

#### Communication Consent

- email capture forms detected
- consent checkbox present or absent
- obvious consent-related wording or policy-link signals where detectable

#### Basic Web Security

- HTTPS usage
- missing security headers
- basic public-facing configuration checks

## Scan Modes

### Mode 1: Public Crawl

This is the MVP mode.

- starts from a URL
- crawls publicly accessible pages
- analyzes rendered page output and response metadata
- does not require source code access

### Mode 2: Codebase Analysis

Roadmap only.

- available when a user has the codebase
- useful for deeper checks not visible from the public website alone
- likely best suited to the CLI

### Mode 3: Authenticated or Credentialed Crawl

Roadmap only.

- available when a user can provide credentials or session access
- useful for dashboards, account areas, and protected flows
- should only be added after the public crawl workflow is stable

## Technical Direction

The crawler should be browser-based rather than raw-HTML-only.

That does not require a browser extension.

A browser-based crawler can still run as:

- a CLI using a headless browser
- a desktop app using the same local scan engine

Why browser-based is important:

- many modern sites rely on JavaScript rendering
- cookie banners often appear after scripts load
- some accessibility and consent issues are only visible in rendered UI

This should still be kept lightweight by:

- limiting crawl depth
- limiting total pages scanned
- keeping scans local for paid or deeper usage

## Public Tool Limits

To keep infrastructure costs under control, the free website scanner should be intentionally narrow.

Suggested limits:

- rate limit by IP
- scan only a small number of pages per day
- show headline findings, not a full deep audit
- prompt users toward the CLI for deeper crawling

## Outputs

The MVP should produce:

- overall scan summary
- findings by category
- affected page URLs
- severity or priority level
- simple explanations of why an issue matters
- suggested next steps

## Important Limitations

The MVP must clearly explain what it cannot fully verify.

### Public Website Limitations

- public crawling cannot inspect backend logic
- public crawling cannot verify private workflows without access
- public crawling may miss issues that only appear after complex interaction
- public crawling cannot fully assess protected dashboards without credentials

### Website Builder Limitations

- platforms like Shopify, Webflow, Wix, and Squarespace can still be scanned publicly
- however, deeper checks may be limited when source code or template access is not available
- some fixes may require platform-specific theme or app access

### Authenticated Flow Limitations

- account areas, checkout steps, and member-only pages may require credentials or saved sessions
- this should be documented as a later capability rather than an MVP promise

## Suggested User Messaging

Olite checks publicly observable compliance signals from a website crawl. Deeper analysis may be possible later when the codebase or authenticated access is available.

## Suggested Build Order

### Phase 1

- URL input
- same-domain crawl
- limited page cap
- accessibility, privacy, communication consent, and basic security checks
- summary report

### Phase 2

- stronger rendered-page analysis
- better consent-flow detection
- exports
- more refined issue explanations

### Phase 3

- local CLI for deeper crawls
- codebase-aware checks when source is available
- authenticated session support
- web and mobile app scanning roadmap

## Non-Goals for Version 0.1

- full legal compliance certification
- backend code auditing for every site
- authenticated dashboard crawling
- mobile app scanning
- enterprise hosted scan infrastructure