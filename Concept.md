# Olite Concept

## Working Summary

Olite is a lightweight compliance scanner for websites and web apps.

The initial focus is developer-related compliance issues that can be detected automatically, especially:

- accessibility issues
- privacy and cookie consent issues
- basic web security and configuration issues
- marketing consent issues tied to forms and user communications

The product should feel practical, fast, and lightweight rather than enterprise-heavy.

## Core Positioning

Olite helps teams identify obvious compliance risks on websites and web apps before those risks become legal, accessibility, trust, or conversion problems.

Core positioning ideas:

- local-first scanning
- no source code uploaded by default
- useful for both developers and non-technical operators
- focused on practical findings, not vague legal language

Proposed product line:

- Website experience: limited public webpage scans for quick evaluation
- Desktop app: more robust scans for less technical users
- CLI: deeper scans and workflow integration for developers

Suggested message:

Olite scans your website or app for accessibility, privacy, consent, and security issues. Scans can run locally, and source code is not uploaded.

## Product Vision

The long-term vision is to become a lightweight compliance layer for websites and apps.

That does not mean covering every compliance category immediately. The first version should focus on issues that are:

- common
- high risk
- detectable by software
- relevant to websites and web applications
- useful to developers, agencies, and site owners

Olite should help users answer a simple question:

What obvious compliance problems exist on this website or app right now?

## Narrowed MVP Scope

The MVP should stay focused on website and web app compliance checks that are developer-adjacent.

Included for MVP:

- Accessibility
- Privacy and cookie consent
- Basic web security
- Marketing consent around forms and communication capture

Excluded from MVP for now:

- HR compliance
- payroll or labor compliance
- general employment policies
- broad corporate governance workflows
- deep legal review that requires a lawyer or auditor
- full certification workflows such as complete SOC 2 management

Possible future areas, but not MVP:

- payment compliance and PCI-related checks
- industry-specific healthcare and education compliance layers
- AI compliance and AI regulation readiness checks
- affiliate disclosure and copyright checks
- cloud infrastructure and data residency reporting

## Target Users

Primary target users:

- small and mid-sized companies with websites or web apps
- developers maintaining web properties
- agencies responsible for client websites
- startup teams without dedicated compliance staff

Secondary target users:

- operations or marketing teams who want a simple scan report
- founders evaluating risk before talking to legal or accessibility consultants

## Likely High-Need Segments

The strongest early segments are websites with frequent compliance exposure and lots of public-facing user flows.

- E-commerce sites
- Restaurants and hospitality websites
- Real estate websites
- Healthcare provider websites
- Universities and education platforms
- Financial and fintech websites
- Government or municipal sites
- Travel and booking sites
- Large SaaS dashboards
- Online marketplaces

## MVP Problem Statement

Many teams do not know they have compliance-related website issues until:

- they receive a complaint
- they get legal pressure
- accessibility users encounter blockers
- privacy practices are questioned
- a customer or auditor flags obvious gaps

Existing solutions can be expensive, enterprise-focused, or too broad.

Olite should offer a simpler first step:

scan a website or app, detect obvious problems, explain what they mean, and show what to fix next.

## MVP Feature Areas

### 1. Accessibility

Initial checks:

- missing alt text
- missing form labels
- color contrast issues
- keyboard navigation issues where detectable
- obvious WCAG-related issues from established tools

Possible engines to evaluate:

- axe-core
- Pa11y
- Lighthouse

### 2. Privacy and Cookie Consent

Initial checks:

- tracking scripts detected
- cookie banner detected or missing
- privacy policy detected or missing
- common analytics or advertising scripts present
- possible tracking before consent

Example signals:

- Google tracking tags
- Meta or Facebook tracking tags
- cookie-setting behavior before user consent

### 3. Basic Web Security

Initial checks:

- HTTPS enforcement
- missing security headers
- basic configuration issues relevant to public web apps
- lightweight OWASP-aligned misconfiguration checks

Important note:

This should be framed as basic web security posture checks, not full security auditing.

### 4. Marketing Consent

Initial checks:

- email capture forms detected
- consent checkbox present or absent
- unsubscribe or consent-related policy links where detectable
- SMS consent risks as a future extension

## Product Experience Model

### Public Website Experience

One strong acquisition model is a limited free scanner on the website.

Example model:

- users can scan a small number of public webpages per day
- the results show headline issues and a limited summary
- deeper scans require the desktop app or CLI

Why this works:

- easy top-of-funnel acquisition
- fast way to demonstrate value
- users do not need installation to try the product
- creates a natural upgrade path into deeper scanning

### Desktop App

The desktop app is likely best for:

- non-technical users
- agencies running scans for clients
- users who want guided scans and readable reports

The desktop app can emphasize:

- scan setup
- guided issue review
- reports and exports
- local scanning trust

### CLI

The CLI is likely best for:

- developers
- technical founders
- agencies with engineering workflows
- CI or local development checks in the future

The CLI can emphasize:

- local scans
- deeper crawl control
- automation
- team workflows later on

## Product Principles

- Keep the first product narrow and understandable.
- Focus on issues that are machine-detectable.
- Avoid pretending to replace lawyers, auditors, or accessibility experts.
- Present findings in plain language with actionable next steps.
- Build trust through local-first scanning and minimal data transfer.

## Competitive Direction

Reference points mentioned in early notes:

- AccessiBe in accessibility-related positioning
- Vanta and Drata in compliance workflow positioning
- Semgrep, Sentry, and Terraform as examples of products that started with strong technical tooling and expanded outward

Olite should likely position closer to:

- practical scanner first
- platform second

rather than trying to look like a full enterprise compliance suite too early.

## What Olite Is Not

To keep positioning clear, Olite is not initially:

- a law firm
- a formal auditor
- a full SOC 2 management platform
- a general HR compliance platform
- a complete enterprise GRC system

## Open Questions

- Should the initial promise be website scanning only, or website plus web app scanning?
- Should accessibility and privacy be the main wedge, with security as a secondary feature?
- Will the first customer be developers, agencies, or business owners?
- How much of the scan should work from a public URL alone versus local code or authenticated app access?
- What should the free website scan show before asking users to install the desktop app or CLI?
- Is the first paid product the desktop app, the CLI, or cloud reporting tied to both?

## Future Expansion: AI Compliance

AI compliance is a credible future expansion area for Olite, especially as EU and other regulatory frameworks mature.

This should not be part of the initial MVP, but it is worth keeping in view as a later module or product area.

Potential future checks could include:

- AI use disclosure and transparency signals
- labeling of AI-generated content where relevant
- visible human review or escalation paths in product flows
- policy and documentation signals related to AI governance
- privacy and retention concerns around AI inputs and outputs

Important note:

Olite could likely support AI compliance readiness checks, but it should not claim to provide complete legal or regulatory certification for AI systems.

## Recommended MVP Framing

If we want the concept to stay sharp, this is the cleanest current framing:

Olite is a lightweight website compliance scanner focused on accessibility, privacy, consent, and basic security. Users can try a limited public scan on the web, then use the desktop app or CLI for deeper local-first analysis.