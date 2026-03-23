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

