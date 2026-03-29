# Olite Development Roadmap

## Table Of Contents

- [Current Direction](#current-direction)
- [Core Recommendation](#core-recommendation)
- [Version 0.1 Goal](#version-01-goal)
- [Core Product Promise](#core-product-promise)
- [Why This Direction](#why-this-direction)
- [Transparency And User Communication](#transparency-and-user-communication)
- [Pre-Scan Qualification](#pre-scan-qualification)
- [Version 0.1 Scope](#version-01-scope)
- [Scan Modes](#scan-modes)
- [Authenticated Sessions](#authenticated-sessions)
- [Technical Direction](#technical-direction)
- [Implementation Strategy](#implementation-strategy)
- [Pattern Library And Rule Design](#pattern-library-and-rule-design)
- [Longer-Term Product Expansion](#longer-term-product-expansion)

# To do's
## Unshared login credentials
- connect billing 
- develop system that two people can share the same login

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

For accessibility specifically, the first app versions should stay automation oriented.

The working product stack should be:

- automated semantic checks
- automated interaction checks
- axe-style rules integrated into the same result model

In practical technical terms, that means:

- static and DOM checks
- Playwright keyboard-flow checks
- axe-style rules

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
- keyboard and focus issues where they can be verified from automated browser-driven checks

The first concrete Playwright-backed interaction checks should target:

- page-level tab order sanity
- visible focus and focus progression
- menu, modal, and popover focus behavior
- reachability of interactive controls without a mouse
- form validation and post-interaction focus recovery

Important nuance:

- a missing skip link should usually be treated as an advisory accessibility consideration rather than a default hard failure
- if a skip link is present, its target and activation behavior should be verified as a stronger runtime check
- Olite should separate nice-to-have guidance from verified implementation failures in the report model over time

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

For accessibility, the medium-term goal should be to move beyond markup-only checks into staged automation that can verify:

- keyboard traversal
- focus visibility and order
- modal and popover behavior
- dynamic form validation and focus recovery

That staged automation should be treated as the concrete desktop accessibility automation plan for the next product phase.

The intended sequence is:

1. keep the current semantic checks
2. add axe-style rules into the desktop scan pipeline
3. add Playwright-backed keyboard-flow checks for important patterns
4. widen from single-page checks into staged multi-step flows where the site structure justifies it

The concrete bridge from HTML checks into more real-life automation should be:

1. verify rendered DOM state after hydration
2. sample first keyboard tab steps and focus progression
3. verify skip-link targets and activation when skip links exist
4. verify menu, modal, and disclosure behavior after interaction
5. verify consent and privacy behavior after runtime state changes

That sequence matters because many important failures do not exist in the raw HTML. They only appear once the page renders, scripts hydrate, and keyboard interaction begins.

This should still be kept lightweight by:

- limiting crawl depth
- limiting total pages scanned
- keeping scans local for paid or deeper usage

## Implementation Strategy

### Why Not Start With OCaml, Go, Or Rust

Those languages can be excellent for performance-sensitive tooling, but they are not the best default starting point for Olite right now.

Reasons:

- the MVP problem is rendered website crawling, not compiler-style code analysis
- founder speed and learning velocity matter
- Playwright and browser automation are especially ergonomic in TypeScript
- it is better to optimize after real bottlenecks appear than to overengineer too early

### Implementation Profiles Over Time

Olite can evolve in phases rather than trying to pick one forever stack on day one.

#### Profile 1: Crawl-First Product

This is the current recommended implementation profile.

Stack:

- TypeScript
- Node.js
- Playwright

Best for:

- public website crawling
- rendered DOM inspection
- cookie banner detection
- accessibility checks
- privacy and consent signals
- the first desktop accessibility automation workflows
- local CLI delivery
- future desktop reuse

Main advantage:

- fastest path to a real product

Main limitation:

- not the ideal long-term engine if Olite later becomes heavily codebase-analysis-driven at very large scale

#### Profile 2: Optimized TypeScript Engine

## Longer-Term Product Expansion

Olite should stay disciplined about product expansion.

The scanner, reporting flow, and entitlement path should stay primary until they are clearly useful and stable.

That said, there is a plausible longer-term path where Olite expands from a lightweight verification scanner into a broader website-compliance toolkit.

### Cookie Widget Or Consent Layer

This is explicitly not a version 0.1 goal and should not be treated as tonight's work.

Possible later direction:

- a lightweight hosted cookie or consent widget that customers can install on their public sites
- simple policy and consent configuration managed from Olite
- a small script served from Olite infrastructure
- a preference center or privacy choices surface later if the product proves useful

Why this is attractive:

- it could move Olite closer to a one-stop shop for practical compliance needs
- it creates a clearer remediation path after a scan surfaces privacy or consent issues
- it may make the product more valuable to small businesses that want both detection and a basic fix path

Why this should be treated carefully:

- the hard part is not raw hosting cost
- the hard part is implementation correctness, maintenance burden, and legal or reputational risk if the widget behaves incorrectly
- consent products create more ongoing compatibility and support responsibility than a read-only scanner

Practical product caution:

- a lightweight widget may be feasible at Olite's current pricing if the hosted surface stays narrow
- a full CMP-style product is substantially more complex and should not be treated as a small feature addition

### Likely Cost Shape

For a narrow widget MVP, infrastructure cost should usually be manageable if the product is designed well.

The likely hosted needs are:

- a small JavaScript asset delivered from a CDN
- lightweight per-site configuration storage
- limited API reads for configuration and consent-state logic
- optional write endpoints if consent choices or versioning need to be stored

At that level, a low-priced subscription can likely support hosting.

The bigger costs are more likely to be:

- engineering maintenance
- customer support
- legal review pressure
- compatibility work across many site setups
- confidence and trust costs if the widget breaks or behaves incorrectly

### Recommended Sequence

If Olite explores this area later, the safer sequence is:

1. keep the scanner and reporting workflow as the main product
2. strengthen remediation content and issue explainers
3. test demand for a small privacy or consent installable product
4. only then decide whether to build a narrow widget or a broader CMP-style system

### Expansion Principle

Olite should prefer connected products that reinforce the scanner instead of distracting from it.

The strongest expansion ideas are likely:

- issue explainers and remediation guidance
- templates and installable fixes for common public-web compliance gaps
- lightweight privacy and consent helpers
- team workflows later

A cookie widget can fit that direction, but only if it stays intentionally narrow at first.

This is the likely next step before any language rewrite.

Potential improvements:

- worker-based concurrency
- crawl queues and smarter scheduling
- caching repeated page assets or normalized signals
- more structured rule execution pipelines
- performance profiling and hotspot optimization

Best for:

- scaling the existing crawl-first product without changing the primary language

Main advantage:

- preserves product velocity while improving performance materially

#### Profile 3: Hybrid Engine

This becomes relevant only if Olite hits real performance bottlenecks or expands deeply into codebase analysis.

Possible shape:

- TypeScript remains the product shell and orchestration layer
- a faster subsystem is introduced for specific bottlenecks

Potential candidates:

- Go for high-performance CLI infrastructure, concurrency, and portable binaries
- Rust for specific parsing or performance-sensitive rule execution components

Best for:

- CPU-heavy workloads
- very large scans
- specialized parsers
- lower-level execution where Node becomes a real bottleneck

Main advantage:

- keeps the product approachable while moving only the expensive parts to a faster layer

Main limitation:

- adds complexity in build, packaging, and team knowledge requirements

#### Profile 4: Deep Codebase Analysis Product

This is much farther down the roadmap.

If Olite later becomes heavily focused on source-code-aware scanning, the product may justify a much more analysis-centric engine.

That could look more like:

- Go or Rust for a serious CLI-first scanning core
- or a mixed-language approach where browser crawling stays one subsystem and code analysis becomes another

This is the point where lessons from Semgrep become more technically relevant.

Main caution:

- this should only happen if the product truly needs it
- it should not be treated as an assumption for the first versions

### What To Watch Before Changing Languages

Olite should not move away from the initial TypeScript stack unless at least one of these becomes clearly true:

- crawl performance is a proven bottleneck
- memory usage becomes consistently problematic at realistic scan sizes
- packaging and distribution become meaningfully harder than expected
- codebase scanning becomes central to the product, not just a side feature
- a specific subsystem is clearly CPU-bound and worth rewriting

Until then, the better move is usually:

- profile the existing implementation
- optimize algorithms and scheduling
- improve crawl boundaries
- reduce unnecessary work

## Pattern Library And Rule Design

Olite should build a reusable interaction-pattern library alongside the rule engine.

The reason is straightforward:

- common compliance issues often appear as recurring UI patterns rather than isolated DOM mistakes
- product language gets much clearer when findings map to patterns like menus, dialogs, forms, and cookie banners
- automation quality improves when each pattern is split into static checks, runtime checks, advisory heuristics, and manual-review boundaries

The first pattern-library targets should be:

- mobile navigation and hamburger menus
- dialogs and modal overlays
- cookie banners and consent panels
- forms and validation flows
- accordions and disclosure widgets

For each pattern, Olite should track four buckets clearly:

- static checks that are safe from markup or response inspection alone
- runtime checks that require rendered interaction automation
- advisory considerations that may help users but should not be treated as default failures
- manual review boundaries where automated confidence stays limited

Examples:

- skip links may be advisory unless present and broken
- GPC handling is much stronger as a runtime behavior check than as a text-only page check
- privacy-policy detection should distinguish between visible text, actionable controls, reachable destinations, and meaningful destination content

That pattern library should inform:

- which checks are safe for the hosted tools
- which checks require desktop or CLI interaction automation
- how Olite groups findings in reports
- how the product explains confidence versus limitation

### Practical Takeaway

The right decision for Olite today is not to imitate Semgrep's OCaml core or Terraform's Go core too early.

The right decision is:

- build the first real scan engine in TypeScript
- keep the architecture modular
- profile real bottlenecks later
- only introduce a second language when there is a concrete reason to do so

### Current Working Recommendation

For the near and medium term:

- TypeScript should be the primary implementation language
- Playwright should be the browser-rendering and crawling foundation
- the CLI should be built on top of the same engine
- a future desktop app should reuse that local engine

For the long term:

- consider Go or Rust only for specific bottlenecks or deeper codebase-analysis needs
- do not rewrite the core prematurely

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