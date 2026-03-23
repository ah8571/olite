# Olite Development Roadmap

## Current Direction

Olite starts as a lightweight compliance scanner for publicly crawlable websites.

The early product direction is:

- public URL crawl as the MVP
- browser-rendered crawling as part of the architecture
- codebase scanning later when source access is available
- authenticated sessions later after the public crawler is stable

## Core Recommendation

The current recommended sequence is:

- Public URL crawl is the MVP.
- Browser-rendered crawling should be part of the architecture, even if the first release is narrow.
- Codebase scanning is a later CLI enhancement.
- Authenticated sessions are a later roadmap item after the public crawler is stable.

## Version 0.1 Goal

Build a lightweight compliance scanner that starts from a public website URL, crawls publicly accessible pages, and identifies practical accessibility, privacy, communication consent, and basic security issues.

The first version should be useful without requiring source code access.

## Core Product Promise

Olite crawls publicly accessible website pages and identifies observable compliance signals.

Deeper analysis may be possible later when:

- the codebase is available
- authenticated sessions are available
- browser rendering and interaction workflows are expanded

Olite should communicate clearly when a result is limited by access, rendering constraints, or incomplete scan coverage.

## Why This Direction

This approach makes the product usable for:

- Shopify sites
- website-builder platforms
- agency audits
- business owners without code access
- developers doing quick public checks

It also supports the planned free website scanner and keeps the first product easier to try.

## Transparency And User Communication

Trust is a core product requirement.

Olite should not quietly fail, overstate certainty, or hide scan gaps when access is limited.

The product should explicitly communicate:

- what was successfully crawled
- what could not be crawled
- what was only partially analyzed
- what kind of access would improve the scan
- which findings are high-confidence versus more tentative

This matters both for product trust and for reducing the risk of misleading users in a legally sensitive area.

## Pre-Scan Qualification

Before or during a scan, Olite should gather enough context to set expectations properly.

Potential inputs:

- website provider or platform if known, such as Shopify, Webflow, WordPress, Wix, or custom
- whether the user has source code access
- whether the user has administrative or theme access
- whether protected areas need to be scanned
- whether credentials or a saved session may be available later

This does not need to be a heavy enterprise questionnaire.

It can start as a simple guided intake that helps Olite explain likely limitations and next steps.

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

## Authenticated Sessions

Authenticated crawling does not need to stay manual forever.

Once credentials, session cookies, or a supported login flow are available, parts of the crawl can be automated.

Realistically, the progression is likely:

- manual public crawl first
- guided local browser automation later
- saved authenticated session support after that
- more automated protected-flow crawling once the login patterns are reliable enough

Important caution:

- login flows vary heavily across sites
- MFA, CAPTCHAs, and anti-bot protections make full automation harder
- some sites will always require partial manual setup or user-assisted session capture

Olite should explain this to users in plain language rather than treating authenticated crawl failures as silent technical problems.

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
- scan coverage and limitation notes
- explicit requests for user help when broader access is needed

## Important Limitations

The roadmap must clearly explain what cannot be fully verified.

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

## Real-Time Communication Requirements

When Olite encounters a crawl bottleneck, it should tell the user what happened and what to do next.

Examples:

- page blocked by robots, auth, or bot protection
- JavaScript rendering incomplete
- login required to continue
- provider-specific limitation detected
- page cap reached before full site coverage

The product should prefer honest messages such as:

- this area could not be scanned with public access
- this finding is limited to publicly observable behavior
- source access or authenticated access would improve confidence

It should avoid implying that a clean result means full compliance when the crawl was incomplete.

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
- platform-aware limitation messaging
- basic pre-scan qualification flow

### Phase 3

- local CLI for deeper crawls
- codebase-aware checks when source is available
- authenticated session support
- web and mobile app scanning roadmap
- richer real-time guidance when a scan needs user assistance

## Non-Goals for Version 0.1

- full legal compliance certification
- backend code auditing for every site
- authenticated dashboard crawling
- mobile app scanning
- enterprise hosted scan infrastructure