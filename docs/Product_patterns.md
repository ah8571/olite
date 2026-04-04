# Product Case Study Profiles

## Table Of Contents

- [Purpose](#purpose)
- [Semgrep](#semgrep)
- [SonarQube](#sonarqube)
- [Snyk Code](#snyk-code)
- [Sentry](#sentry)
- [Terraform](#terraform)
- [PostHog](#posthog)
- [Resend](#resend)
- [Lighthouse](#lighthouse)
- [Shared Patterns](#shared-patterns)

## Purpose

Minimal internal case study profiles for related SaaS developer tools.

The goal is to keep a concise reference for:

- product shape
- core workflow model
- major languages used
- what may be relevant to Olite

## Semgrep

### Product Profile

- code scanning and AppSec platform
- strong CLI and developer workflow orientation
- rules-driven analysis with an emphasis on signal quality
- expands into CI, IDE, PR, and platform workflows

### Languages Used

- Python for CLI and orchestration
- OCaml for the performance-sensitive analysis core
- YAML for rule definitions and configuration

### Relevant Takeaways For Olite

- strong technical core first
- high-signal findings matter more than volume
- rules can become a major product asset over time
- source-code-first model is not Olite's starting point

## SonarQube

### Product Profile

- code quality and security verification platform
- strong CI, pull request, and policy-gate workflow model
- spans developer feedback, organizational standards, and enterprise reporting
- broader than a single scanner because it expands into governance and compliance enforcement

### Languages Used

- Java in much of the platform and analysis ecosystem
- JavaScript and TypeScript across web surfaces and integrations
- multi-language analyzer model across a large supported language set

### Relevant Takeaways For Olite

- quality gates are a strong pattern once scan trust is high
- reports can serve both practitioners and management without becoming separate products
- policy and standards enforcement can be a later expansion layer after the scanner is mature
- enterprise reporting is useful to study even if Olite stays lighter and more focused

## Snyk Code

### Product Profile

- developer-first SAST product with strong IDE, PR, and CI presence
- emphasizes fast results, prioritization, and guided or automatic remediation
- built to fit inside existing developer workflows instead of creating a separate review ritual
- part of a broader security platform, but its code product stays tightly tied to time-to-fix

### Languages Used

- broad polyglot product stack typical of developer security platforms
- strong integration story across IDEs, SCM platforms, and CI systems
- machine-learning and analysis infrastructure behind prioritization and fixes

### Relevant Takeaways For Olite

- speed-to-understanding matters as much as detection breadth
- in-workflow remediation language is valuable when findings are actionable
- prioritization is part of the product, not just a reporting detail
- a scanner feels more useful when it helps users decide what to fix first

## Sentry

### Product Profile

- developer-first monitoring and debugging platform
- simple setup and strong onboarding messaging
- context-rich product model across errors, logs, traces, and replay
- broad hosted platform built around observability and debugging workflows

### Languages Used

- Python and Django for the main backend
- React and TypeScript for the frontend
- many separate SDKs across multiple languages

### Relevant Takeaways For Olite

- issue to context to next step is a strong pattern
- clear setup matters
- richer context can be more valuable than raw issue count
- hosted telemetry-heavy architecture is not Olite's target model

## Terraform

### Product Profile

- CLI-centered infrastructure tool
- strong documentation and tutorial culture
- clear progression from local CLI to collaborative cloud workflows
- extensible architecture through providers and plugins

### Languages Used

- Go for Terraform core and CLI
- HCL as the infrastructure language it operates on
- gRPC and plugin protocols for providers

### Relevant Takeaways For Olite

- CLI-first can scale well
- strong docs and maturity phases are useful patterns
- plugin thinking may become relevant later
- declared infrastructure is cleaner than live website crawling, so Olite needs stronger limitation messaging

## PostHog

### Product Profile

- product analytics platform with a strong developer-first posture
- supports multiple usage modes including hosted and self-hosted paths
- expands from one core workflow into a broader product suite over time
- strong free tier and usage-based expansion logic

### Languages Used

- TypeScript and JavaScript across product surfaces
- Python in backend and data workflows
- a broader polyglot stack typical of analytics infrastructure

### Relevant Takeaways For Olite

- a free tier can work well when it is tied to clear usage boundaries
- multiple usage modes can expand adoption if the product shape remains understandable
- self-serve onboarding and strong docs matter when the product has technical depth
- local-first or downloadable paths can coexist with lightweight hosted surfaces

## Resend

### Product Profile

- developer-first email delivery product
- clean API-first and documentation-first experience
- simple product framing with a usage-based free tier and expansion path
- strong emphasis on onboarding clarity and fast time to value

### Languages Used

- TypeScript and modern web tooling on the user-facing side
- backend infrastructure built around email delivery services and APIs

### Relevant Takeaways For Olite

- crisp messaging can make a technical product feel much easier to adopt
- a generous free tier works best when usage thresholds are simple to understand
- polished developer experience can be part of the product moat
- the product can stay narrow and still be compelling if the workflow is clear

## Lighthouse

### Product Profile

- open-source auditing tool for web-page quality
- strong multi-surface workflow through Chrome DevTools, CLI, Node usage, and CI
- opinionated report model across performance, accessibility, SEO, and best practices
- useful as both a learning tool and an automation building block

### Languages Used

- JavaScript and Node.js for the core toolchain
- Chrome and DevTools integration for the browser workflow
- JSON output and config-driven automation around CI usage

### Relevant Takeaways For Olite

- one analysis engine can support browser, CLI, and CI-style entry points
- good reports teach users why a finding matters, not just that it failed
- extension and DevTools-style accessibility can help with learning and onboarding
- CI and regression workflows become more compelling after the core scanner is stable
- category-based audits can coexist with extensibility through plugins and stack-aware advice

## Shared Patterns

Across all seven case studies:

- start with a strong technical core
- deliver clear value quickly
- fit into existing practitioner workflows
- provide context, not just alerts
- expand into platform features after the core product works
- teach users through strong documentation and onboarding



