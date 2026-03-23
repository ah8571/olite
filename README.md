# Olite

Olite is a lightweight website compliance scanner focused on accessibility, privacy, communication consent, and basic security. It starts with public website crawling and analysis, then expands later into codebase-aware and authenticated scanning where broader access is available.

The goal is to help teams identify practical, machine-detectable compliance issues before they become legal, accessibility, trust, or conversion problems.

## Why Olite

Many teams do not know they have obvious compliance-related website issues until:

- a customer reports a problem
- an accessibility blocker is discovered
- privacy practices are questioned
- legal risk starts to appear
- a client or auditor flags a gap

Existing tools can be expensive, broad, or designed for large enterprises. Olite is intended to be a simpler first step: crawl a website, surface obvious issues, and point users toward what to fix next.

## Core Principles

- Practical rather than enterprise-heavy
- Local-first where possible
- No source code uploaded by default
- Focused on actionable findings
- Clear enough for developers, agencies, and non-technical operators

## Planned Product Shape

Olite is currently planned around three experiences:

### 1. Public Website Scanner

A limited scan available from the web for a small number of public pages per day.

This is intended to let users quickly evaluate a site and see headline issues before installing anything.

The first product direction is based on public website crawling and analysis rather than requiring source code access.

### 2. Desktop App

A future guided experience for users who want deeper scans, readable reports, and a visual workflow.

### 3. CLI

The likely first paid product: a command-line scanner for developers who want local analysis, repeatable scans, and future workflow integration.

## Planned MVP Scope

The MVP is intentionally narrow. The focus is on developer-adjacent website compliance checks that can be detected automatically.

The first version is centered on publicly crawlable websites. Deeper codebase-aware and authenticated scanning are later roadmap items.

### Accessibility

- missing alt text
- missing form labels
- color contrast issues
- other obvious WCAG-related issues where detectable

### Privacy and Cookie Consent

- tracking scripts detected
- cookie banner detected or missing
- privacy policy detected or missing
- possible tracking before consent

### Basic Web Security

- HTTPS enforcement
- missing security headers
- basic public web configuration checks

### Communication Consent

- email capture forms detected
- consent checkbox present or absent
- basic consent-related signals where detectable

## What Olite Is Not

Olite is not initially intended to be:

- a law firm
- a formal auditor
- a complete SOC 2 management platform
- a full enterprise GRC suite
- a general HR compliance platform

## Future Direction

One possible future expansion area for Olite is AI compliance readiness.

As frameworks such as the EU AI Act develop, there may be room for machine-detectable checks around areas like transparency, disclosure, governance signals, and privacy-related implementation issues.

This is not part of the initial MVP, but it is a meaningful area the project may explore later.

Web and mobile app scanning may also be explored later, after the website-focused scanner is established.

## Current Status

Olite is in the early concept and planning stage.

This repository currently serves as the project home while the product scope, MVP, and implementation approach are being defined.

## Repository Docs

- [Concept.md](Concept.md) contains the current structured concept and MVP framing.
- [Development_roadmap.md](Development_roadmap.md) captures the URL-crawling-first roadmap and later scanning phases.
- [Architecture.md](Architecture.md) sketches the shared local scan engine, crawler, rule system, interfaces, and lightweight cloud model.
- [Product_patterns.md](Product_patterns.md) captures concise case study profiles for Semgrep, Sentry, and Terraform.
- [Pricing.md](Pricing.md) captures early pricing model thoughts and tradeoffs.

## License

This project is licensed under the GPL-3.0 license.

In general, that means people can use, study, modify, and redistribute the software, but redistributed derivative versions must remain open under the same license terms.

## Disclaimer

Olite is intended to help identify practical compliance risks and implementation issues. It is not legal advice, and it is not a substitute for a lawyer, auditor, or qualified compliance expert.

## AI Disclosure

This README was drafted with AI assistance and reviewed for project use.
