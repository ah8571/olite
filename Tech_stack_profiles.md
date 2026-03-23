# Olite Tech Stack Profiles

## Purpose

This document explains the current stack recommendation for Olite and records possible future implementation profiles if the product grows and needs more horsepower.

It is meant to keep language decisions pragmatic rather than ideological.

## Quick Clarification: OCaml Is Not YAML

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

## Current Recommendation For Olite

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

## Why Not Start With OCaml, Go, Or Rust

Those languages can be excellent for performance-sensitive tooling, but they are not the best default starting point for Olite right now.

Reasons:

- the MVP problem is rendered website crawling, not compiler-style code analysis
- founder speed and learning velocity matter
- Playwright and browser automation are especially ergonomic in TypeScript
- it is better to optimize after real bottlenecks appear than to overengineer too early

## Implementation Profiles Over Time

Olite can evolve in phases rather than trying to pick one forever stack on day one.

### Profile 1: Crawl-First Product

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

### Profile 2: Optimized TypeScript Engine

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

### Profile 3: Hybrid Engine

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

### Profile 4: Deep Codebase Analysis Product

This is much farther down the roadmap.

If Olite later becomes heavily focused on source-code-aware scanning, the product may justify a much more analysis-centric engine.

That could look more like:

- Go or Rust for a serious CLI-first scanning core
- or a mixed-language approach where browser crawling stays one subsystem and code analysis becomes another

This is the point where lessons from Semgrep become more technically relevant.

Main caution:

- this should only happen if the product truly needs it
- it should not be treated as an assumption for the first versions

## What To Watch Before Changing Languages

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

## Practical Takeaway

The right decision for Olite today is not to imitate Semgrep's OCaml core or Terraform's Go core too early.

The right decision is:

- build the first real scan engine in TypeScript
- keep the architecture modular
- profile real bottlenecks later
- only introduce a second language when there is a concrete reason to do so

## Current Working Recommendation

For the near and medium term:

- TypeScript should be the primary implementation language
- Playwright should be the browser-rendering and crawling foundation
- the CLI should be built on top of the same engine
- a future desktop app should reuse that local engine

For the long term:

- consider Go or Rust only for specific bottlenecks or deeper codebase-analysis needs
- do not rewrite the core prematurely