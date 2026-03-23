# Product Pattern Notes

## Purpose

These notes capture useful product and go-to-market patterns from Semgrep, Sentry, and Terraform that may be relevant to Olite.

The goal is not to copy these products directly. The goal is to learn from how they:

- start from a strong technical core
- stay useful to practitioners
- expand into broader workflows over time
- communicate clearly about what their product does well

## Semgrep

### What Stands Out

- strong emphasis on high-signal results
- clear developer workflow integration through CLI, CI, IDEs, and PR checks
- strong positioning around reducing false positives
- rules and remediation are a major part of product value
- expands from core scanning into broader platform capabilities

### Lessons For Olite

- high-signal findings should matter more than large issue counts
- false positives and low-confidence results will damage trust quickly
- rules should be one of the core product assets over time
- remediation guidance should be part of the product, not an afterthought
- working inside developer workflows matters once the CLI exists

### What Not To Copy Blindly

- Semgrep is source-code-first, while Olite starts public-crawl-first
- Olite should not overbuild enterprise workflow features too early

## Sentry

### What Stands Out

- very developer-first positioning
- simple setup messaging
- heavy emphasis on context, not just raw events
- connected signals across issues, traces, logs, and replays
- strong product story around helping users go from issue to fix quickly

### Lessons For Olite

- Olite should focus on issue to context to next step
- scan results should explain why something matters and what to do next
- setup should feel simple, especially for public scans and future local installs
- richer context can justify paid value more than raw scan volume alone
- platform expansion should deepen usefulness rather than just add feature sprawl

### What Not To Copy Blindly

- Sentry relies on ongoing telemetry and hosted context; Olite should stay much more local-first
- Olite should avoid cloud cost patterns that conflict with low pricing

## Terraform

### What Stands Out

- CLI-centered foundation
- strong documentation and tutorials
- clear progression from local tool to collaborative cloud product
- strong emphasis on workflows, best practices, and adoption phases

### Lessons For Olite

- a CLI-first approach is credible and scalable
- clear tutorials and step-by-step onboarding will matter a lot
- a lightweight local tool can become the foundation for broader collaboration later
- roadmap communication should be explicit about maturity phases

### What Not To Copy Blindly

- Terraform operates on declared infrastructure code, which is structurally cleaner than live website crawling
- Olite will need stronger messaging around crawl limitations and incomplete visibility than Terraform does

## Shared Patterns Across All Three

The most important common patterns are:

- start with a strong technical core
- deliver clear value quickly
- fit into existing practitioner workflows
- provide context, not just alerts
- expand into platform features after the core product works
- teach users through strong documentation and onboarding

## Recommendations For Olite

### 1. Build Around Signal Quality

Olite should prioritize:

- high-confidence findings
- clear evidence
- honest limitation reporting
- minimal false certainty

### 2. Make Guidance A Product Feature

Olite should help users understand:

- what was scanned
- what was missed
- why a finding matters
- what access would improve the audit
- what action to take next

### 3. Keep The Technical Core Reusable

The shared crawler, render layer, and rule engine should power:

- free public scans
- the CLI
- the future desktop app

### 4. Expand In Phases

The likely progression should be:

- public crawl
- local CLI
- stronger reporting and exports
- authenticated session support
- desktop app
- optional cloud collaboration later

### 5. Teach The User

Like Terraform especially, Olite will benefit from:

- strong docs
- clear terminology
- examples by website type
- explicit statements of limitations and supported access levels

## Bottom Line

The strongest shared lesson is that Olite should start with a focused technical core, communicate clearly, keep signal quality high, and expand into broader workflow features only after the scanner itself is trusted.

## Tech Stack Profiles

### Purpose

This section records the current stack recommendation for Olite and possible future implementation profiles if the product grows and needs more horsepower.

The goal is to keep language decisions pragmatic rather than ideological.

### Quick Clarification: OCaml Is Not YAML

OCaml is a programming language.

It is not YAML.

YAML is a human-readable data serialization format often used for:

- configuration files
- CI files
- rule definitions
- structured metadata

OCaml is a compiled functional programming language often used for:

- compilers
- static analysis tools
- parsers
- high-performance program analysis systems

Semgrep uses OCaml in its performance-sensitive analysis core because it is doing deep source-code parsing and semantic analysis.

That is very different from YAML, which might be used to define rules or config files around a scanner.

### Current Recommendation For Olite

The recommended starting stack for Olite is:

- TypeScript
- Node.js
- Playwright for browser-rendered crawling

Why this is the best current fit:

- Olite starts as a public website crawler, not a deep source-code analyzer
- browser automation is a central requirement
- TypeScript has a strong ecosystem for browser-based tooling
- the same codebase can support a CLI and later a desktop app
- this keeps the product understandable and buildable at the current stage

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
- local CLI delivery
- future desktop reuse

Main advantage:

- fastest path to a real product

Main limitation:

- not the ideal long-term engine if Olite later becomes heavily codebase-analysis-driven at very large scale

#### Profile 2: Optimized TypeScript Engine

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

