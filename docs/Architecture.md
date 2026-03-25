# Olite Architecture Notes

## Table Of Contents

- [Architecture Goal](#architecture-goal)
- [High-Level Shape](#high-level-shape)
- [Shared Engine Product Structure](#shared-engine-product-structure)
- [Recommended Execution Model](#recommended-execution-model)
- [Download And Distribution Model](#download-and-distribution-model)
- [Suggested Data Flow](#suggested-data-flow)
- [Scan Modes](#scan-modes)
- [Access Levels](#access-levels)

## Architecture Goal

Design Olite so the core scan engine can power:

- the free public website scan
- a local CLI
- a future desktop app
- optional lightweight cloud reporting later

The most important architectural principle is that robust scanning should run locally whenever possible.

## High-Level Shape

The product can be split into five main parts:

At the repository and product level, the cleanest long-term structure is:

- web app for marketing, free tools, docs, and downloads
- shared scanner core for crawling, rule evaluation, and normalized findings
- CLI wrapper around the shared core
- desktop app built on the same shared core

That keeps the real scanner as one engine exposed through multiple interfaces rather than rebuilding scan logic separately for web, CLI, and desktop.

### 1. Crawl Engine

Responsible for:

- starting from a URL
- following internal links
- enforcing page and depth limits
- collecting page responses and rendered output

This should support:

- public crawls first
- authenticated session crawling later
- browser-rendered page analysis

### 2. Render And Capture Layer

Responsible for:

- loading pages in a headless browser
- waiting for basic render completion
- extracting DOM content
- collecting scripts, forms, links, headers, and metadata
- capturing signals needed by rules

This is where JavaScript-heavy sites become more analyzable than with simple HTML fetches alone.

### 3. Rule Engine

Responsible for:

- taking normalized page data as input
- running compliance checks by category
- producing findings with severity, message, evidence, and suggested fixes

Initial rule groups:

- accessibility
- privacy and cookie consent
- communication consent
- basic web security

Later rule groups:

- codebase-aware rules
- authenticated-flow rules
- AI compliance readiness checks

Accessibility-specific rule execution should be organized into an automation-first stack:

- automated semantic checks
- automated interaction checks
- axe-style rules layered into the same reporting model

In practical terms, the strongest first implementation stack is:

- static and DOM checks
- Playwright keyboard-flow checks
- axe-style rules

### 4. Reporting Layer

Responsible for:

- site-level summaries
- page-level findings
- issue grouping
- exportable reports
- future trend/history views

This layer should be usable by both the CLI and future desktop app.

### 5. Transparency And Guidance Layer

Responsible for:

- communicating scan coverage
- recording crawl failures and bottlenecks
- identifying confidence level and uncertainty
- explaining what access is missing
- asking the user for help when broader access is needed

This layer is important because Olite operates in a compliance-sensitive area where false confidence can be risky.

### 6. Interfaces

The same underlying engine should support multiple interfaces.

#### Web Tool

- limited public scans
- strict rate limits
- headline results only

#### CLI

- likely first paid product
- full local scans
- configurable crawl settings
- exports and automation
- URL, path, or config-driven execution
- terminal summaries plus JSON and HTML-style report output

#### Desktop App

- future UX layer built on the same engine
- guided setup and issue review
- simpler experience for non-technical users
- local project history, diffs, exports, and saved scan settings

## Shared Engine Product Structure

The scanner should be built once and then exposed through the CLI and desktop app.

### Scanner Core

Responsible for:

- fetching pages
- crawling sites
- running Playwright when needed
- applying rules
- producing normalized findings

This should stay independent from the UI layers so the same scan engine can power:

- the limited hosted free tools
- the downloadable CLI
- the future desktop app

### CLI Layer

Responsible for:

- taking a URL, local path, or config file
- invoking the shared core
- rendering terminal summaries
- exporting JSON and later richer report formats

The CLI is the cleanest first downloadable product because it proves the local-first engine without needing a second UI stack immediately.

### Desktop Layer

Responsible for:

- providing a GUI on top of the same scan engine
- storing projects locally
- showing findings, history, diffs, and exports
- guiding non-technical users through scan setup and interpretation

The desktop app should also become the main surface for staged accessibility automation.

The first concrete desktop accessibility automation plan should be:

1. run automated semantic checks against the rendered page
2. run axe-style rules against the same page state
3. run Playwright-backed keyboard-flow checks for the most important interaction patterns
4. report all findings in one normalized issue model instead of splitting them by tool internals

The first Playwright-backed interaction checks should focus on:

- whether a page can be tabbed through sensibly
- whether focus is visible and moves in a sensible order
- whether dialogs, menus, and popovers trap and return focus correctly
- whether important controls are reachable and operable without a mouse
- whether validation states and dynamic updates appear after interaction in ways the DOM exposes cleanly

Important scope note:

- the first desktop MVP should stay automation oriented
- manual assistive-technology verification should not be a dependency for the first installable product
- if Olite later offers higher-touch enterprise services, those should sit on top of the automated scan engine rather than inside the baseline desktop workflow

## Recommended Execution Model

### Local First

Paid and deeper scans should run on the user's machine.

Benefits:

- lower infrastructure costs
- better privacy posture
- easier scaling
- better fit for larger crawls and rendered page analysis
- avoids turning the product into a SaaS platform before the local scanner is mature

In practical terms, the hosted site should mainly be:

- marketing
- docs
- lightweight public tools
- download and release distribution

### Lightweight Cloud Optionality

If cloud features are added later, they should be lightweight.

Good cloud candidates:

- account management
- billing
- optional report sync
- saved scan history
- team collaboration
- release metadata and update checks

Poor early cloud candidates:

- large-scale hosted crawling
- deep authenticated scan orchestration
- high-volume browser automation for all users
- cloud-first storage of scan data by default

## Download And Distribution Model

If the goal is to minimize hosting, the main product should be distributed as downloadable software rather than operated as a hosted scan service.

### CLI Distribution

Practical options include:

- npm package distribution
- standalone binaries via GitHub Releases
- package manager distribution later through Homebrew, Scoop, or Winget

GitHub Releases is sufficient early on if the goal is to avoid building custom download infrastructure.

### Desktop Distribution

The two serious desktop shell choices are Electron and Tauri.

The pragmatic recommendation at this stage is to start with Electron.

Reasons:

- the current stack is already TypeScript and Node friendly
- Playwright and filesystem access fit naturally
- packaging and installer tooling are mature
- updates and cross-platform build workflows are well understood

Tauri may become attractive later if bundle size or runtime efficiency becomes a more important concern, but Electron is the faster path to a coherent first desktop product.

## Suggested Data Flow

For a local scan, the flow can look like this:

1. user provides a URL
2. optional pre-scan qualification captures provider and access context
3. crawler discovers in-scope pages
4. render layer loads each page
5. normalized signals are extracted
6. rule engine evaluates findings
7. transparency layer records limitations and needed user assistance
8. reporting layer produces summaries and exports

For the free web tool, the same logic can be used with tighter limits and smaller output.

## Scan Modes

Olite should treat different kinds of scanning as separate but related modes rather than forcing everything through one engine path.

### 1. Runtime Scan

Best for:

- public websites
- rendered JavaScript experiences
- cookie banners and tracking behavior
- live headers, forms, scripts, and visible page output

Typical implementation layers:

- HTTP fetch for raw responses
- HTML parsing for lightweight signal extraction
- Playwright for rendered pages and browser-driven checks

For accessibility-specific runtime checks, this is also the natural place to stage:

- keyboard navigation checks
- focus behavior checks
- modal and menu interaction checks
- dynamic content behavior checks

This is the layer where the desktop app can move beyond shallow page inspection and into repeatable staged automation across real user flows.

This is the right mode when the product needs to understand what a user or browser actually experiences.

### 2. Source Scan

Best for:

- local repositories
- template and component inspection
- config analysis
- finding issues that may not be visible from public crawling alone

Typical implementation layers:

- filesystem traversal
- TypeScript or JavaScript AST analysis
- HTML and template parsing
- CSS and config-file inspection

This mode should be responsible for code-aware checks rather than trying to force source analysis into browser automation.

### 3. Hybrid Scan

Best for:

- teams that can provide both source access and a running site
- comparing configured intent against runtime behavior
- correlating implementation risk with what actually renders in production or staging

The hybrid mode is where the product becomes strongest because it can combine:

- code-level evidence
- rendered-page evidence
- configuration evidence

Examples of hybrid value:

- analytics appears in source before a visible consent gate is confirmed at runtime
- accessibility issues are suggested by component patterns and then confirmed in rendered output
- security or privacy configuration can be compared with live response behavior

Architecturally, these modes should share the same reporting model and rule vocabulary even if they use different collectors underneath.

## Access Levels

The architecture should keep different access models separate.

### Public Access

- no credentials
- crawl only public pages
- best for the first version

### Codebase Access

- local repository available
- enables deeper static or code-aware checks later
- likely CLI-only at first
- should remain separate from runtime crawling concerns

### Authenticated Access

- credentials, cookies, or user-assisted login available
- useful for protected flows later
- should be isolated from the public crawl implementation

## Provider And Access Detection

The architecture should support lightweight environment detection.

Useful signals include:

- likely website platform or builder
- presence of protected areas
- evidence of bot protection or rate limiting
- likely need for JavaScript rendering
- whether a crawl appears incomplete

This can help Olite set expectations and ask better follow-up questions.

## User Assistance Model

When the scan hits a limitation, Olite should be able to request user help rather than failing silently.

Examples of user assistance:

- confirm website platform
- provide source code access later
- provide credentials or a saved session later
- approve a deeper local scan
- confirm whether a protected area matters for the audit goal

This should be designed as guided product behavior, not just error text.

## Why Not Start With A Browser Extension

A browser extension is not the best architectural center.

Reasons:

- weaker control over full crawl workflows
- more browser-specific constraints
- harder to support broader automation cleanly
- less reusable as a core engine for CLI and desktop

A local browser automation engine is a better foundation because it can power both CLI and desktop workflows.

## Local Data And Storage Model

The desktop product should default to local storage rather than backend-hosted project storage.

Local data should include:

- project definitions
- scan histories
- rule configuration
- exported reports and related attachments

Recommended storage split:

- SQLite for structured findings, runs, and history
- local filesystem for exports and report artifacts
- JSON or YAML for project settings and portable config

This keeps the privacy posture cleaner and avoids introducing backend storage requirements before they are necessary.

## Licensing And Paid Access Without A Custom Backend

The easiest way to accidentally reintroduce hosting is through accounts, licensing, and purchase flows.

To stay lean, use a third-party commerce or licensing provider such as:

- Lemon Squeezy
- Gumroad
- Paddle

Practical licensing models include:

- simple downloadable purchase with provider-managed or manual license delivery
- signed license key verification with optional periodic checks
- strict offline-first signed license files with no mandatory online verification

If minimal hosting is the goal, the simplest or most offline-friendly approach is preferable even if enforcement is less strict.

## Early Technical Priorities

### Priority 1

- same-domain URL crawl
- page limits
- rendered page analysis
- basic rule framework

### Priority 2

- better crawling controls
- exports
- cleaner evidence capture
- stronger consent and script detection
- platform detection and limitation reporting
- scan coverage and confidence reporting

### Priority 3

- authenticated session support
- codebase-aware rules
- team workflows
- optional cloud history
- guided user assistance for blocked or partial scans

## What To Avoid Early

Do not introduce the following too early:

- user accounts
- cloud project sync
- hosted scan queues
- team collaboration backend
- browser-based authenticated crawling in the cloud

Those choices would push Olite toward a SaaS architecture before the local-first scanner is proven.

## Architecture Risks

### Risk 1: Overbuilding Too Early

Trying to support public crawl, codebase scanning, authenticated flows, desktop UX, and hosted cloud orchestration all at once would slow the project down significantly.

### Risk 2: Tight Coupling Between UI And Engine

The scan engine should stay separate from the CLI and future desktop interface so the product can evolve without reworking the core scanner.

### Risk 3: Hosted Cost Creep

If too much scanning moves into the cloud, the economics of the low-cost pricing model become less attractive.

## Architecture Recommendation

Build one shared local scan engine first.

Then layer on top of it in this order:

- extract the current scan logic into a reusable scanner core
- replace lightweight fetch-only checks with a stronger rule engine over time
- keep the website focused on marketing, docs, downloads, and free top-of-funnel tools
- ship the CLI first as the first serious downloadable product
- build the desktop app on top of the same core after the engine and reports are working well
- add authenticated access and codebase-aware depth later
- add optional lightweight cloud features only after the local product is clearly valuable

## Current Stack Recommendation

The current recommended implementation stack is:

- TypeScript for the main codebase
- Node.js for the runtime
- Playwright for browser-rendered crawling
- Electron as the most pragmatic initial desktop shell

Why this fits the current product stage:

- the MVP is crawl-first rather than code-analysis-first
- browser rendering is central to the scan engine
- the same codebase can power the CLI and later a desktop app
- this keeps founder speed and product iteration high
- Electron reduces packaging and integration friction compared with introducing another stack too early

If the product later expands into much heavier codebase analysis or hits real performance bottlenecks, a hybrid approach can be considered. See the implementation strategy section in [Development_roadmap.md](Development_roadmap.md).