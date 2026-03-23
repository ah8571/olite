# Olite Architecture Notes

## Architecture Goal

Design Olite so the core scan engine can power:

- the free public website scan
- a local CLI
- a future desktop app
- optional lightweight cloud reporting later

The most important architectural principle is that robust scanning should run locally whenever possible.

## High-Level Shape

The product can be split into five main parts:

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

#### Desktop App

- future UX layer built on the same engine
- guided setup and issue review
- simpler experience for non-technical users

## Recommended Execution Model

### Local First

Paid and deeper scans should run on the user's machine.

Benefits:

- lower infrastructure costs
- better privacy posture
- easier scaling
- better fit for larger crawls and rendered page analysis

### Lightweight Cloud Optionality

If cloud features are added later, they should be lightweight.

Good cloud candidates:

- account management
- billing
- optional report sync
- saved scan history
- team collaboration

Poor early cloud candidates:

- large-scale hosted crawling
- deep authenticated scan orchestration
- high-volume browser automation for all users

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

- public crawl workflow
- CLI interface
- better reporting and exports
- transparency, coverage, and limitation messaging
- authenticated access later
- desktop app later
- optional lightweight cloud features after the local product is working well

## Current Stack Recommendation

The current recommended implementation stack is:

- TypeScript for the main codebase
- Node.js for the runtime
- Playwright for browser-rendered crawling

Why this fits the current product stage:

- the MVP is crawl-first rather than code-analysis-first
- browser rendering is central to the scan engine
- the same codebase can power the CLI and later a desktop app
- this keeps founder speed and product iteration high

If the product later expands into much heavier codebase analysis or hits real performance bottlenecks, a hybrid approach can be considered. See the tech stack section in [Product_patterns.md](Product_patterns.md).