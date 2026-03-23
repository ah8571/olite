# Product Case Study Profiles

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

## Shared Patterns

Across all three case studies:

- start with a strong technical core
- deliver clear value quickly
- fit into existing practitioner workflows
- provide context, not just alerts
- expand into platform features after the core product works
- teach users through strong documentation and onboarding



