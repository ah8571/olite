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

### 5. Interfaces

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
2. crawler discovers in-scope pages
3. render layer loads each page
4. normalized signals are extracted
5. rule engine evaluates findings
6. reporting layer produces summaries and exports

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

### Priority 3

- authenticated session support
- codebase-aware rules
- team workflows
- optional cloud history

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
- authenticated access later
- desktop app later
- optional lightweight cloud features after the local product is working well