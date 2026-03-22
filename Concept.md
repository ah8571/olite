# Olite Concept

## Working Summary

Olite is a lightweight compliance scanner for websites.

The initial focus is public website crawling and analysis for compliance issues that can be detected automatically, especially:

- accessibility issues
- privacy and cookie consent issues
- basic web security and configuration issues
- communication consent issues tied to forms and user communications

The product should feel practical, fast, and lightweight rather than enterprise-heavy.

## Core Positioning

Olite helps teams identify obvious compliance risks on websites before those risks become legal, accessibility, trust, or conversion problems.

Core positioning ideas:

- local-first scanning
- public website crawling first
- no source code uploaded by default
- useful for both developers and non-technical operators
- focused on practical findings, not vague legal language

Proposed product line:

- Website experience: limited public webpage scans for quick evaluation
- Desktop app: more robust scans for less technical users
- CLI: deeper scans and workflow integration for developers

Suggested message:

Olite crawls your public website and identifies observable accessibility, privacy, communication consent, and security issues. Deeper analysis can run locally when broader access is available.

## Product Vision

The long-term vision is to become a lightweight compliance layer for websites first, then web and mobile apps over time.

That does not mean covering every compliance category immediately. The first version should focus on issues that are:

- common
- high risk
- detectable by software
- relevant to websites and web applications
- useful to developers, agencies, and site owners

Olite should help users answer a simple question:

What obvious compliance problems exist on this website right now?

## Narrowed MVP Scope

The MVP should stay focused on website compliance checks that can be identified from public crawling and analysis.

Included for MVP:

- Accessibility
- Privacy and cookie consent
- Basic web security
- Communication consent around forms and communication capture

Excluded:

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
- web and mobile app scanning beyond websites

## Target Users

Primary target users:

- small and mid-sized companies with websites
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

crawl a website, detect obvious problems, explain what they mean, and show what to fix next.

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

### 4. Communication Consent

Initial checks:

- email capture forms detected
- consent checkbox present or absent
- unsubscribe or consent-related policy links where detectable
- SMS and TCPA-related consent risks as a future extension

## Product Experience Model

### Public Website Experience

One strong acquisition model is a limited free scanner on the website.

Example model:

- users can scan a small number of public webpages per day
- the results show headline issues and a limited summary
- deeper scans require the desktop app or CLI

Operational note:

- rate limits should likely be enforced by IP for the public tool
- the public tool should stay intentionally narrow to avoid becoming a high-cost hosted crawler

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

Technical note:

- a browser-based crawler does not require a browser extension
- the same local browser automation engine could later power either a desktop app or the CLI

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

- future codebase-aware checks when source access exists
- future authenticated scanning when credentials or session access are available

## Access Model And Limitations

Olite should be explicit about what each type of access allows.

### Public Crawl

- can inspect publicly reachable pages
- can analyze rendered page output, scripts, forms, and headers
- works well for many websites, including builder-based sites
- cannot inspect backend code or protected flows

### Codebase Access

- enables deeper analysis beyond what is visible publicly
- should be positioned as a later CLI-focused capability
- is useful when developers have direct access to the source

### Authenticated Access

- would be needed for member areas, dashboards, checkout flows, and account-only paths
- should be treated as roadmap work, not MVP

### Website Builder Reality

- Shopify, Wix, Squarespace, Webflow, and similar platforms can still be scanned through public crawling
- however, some platform-specific issues may be hard to assess without theme, app, or administrative access
- Olite should document these limitations clearly

## Product Decisions

The following decisions are the current working direction for the MVP.

### Initial Promise

- start with website scanning only
- position web app and mobile app scanning as roadmap items

### Primary Wedge

- accessibility and privacy are the main wedge
- communication consent is part of the initial promise
- basic security is included as a secondary feature set

### Early Customer Profile

- developers, agencies, and business owners are all relevant early users
- messaging may need separate landing pages for each audience
- the product itself should remain simple enough for non-technical users while still being useful to developers

### Free Tool Model

- the free web scanner should use a public URL only
- it should be rate-limited, likely by IP, to a small number of scans per day
- it should show major issues and useful pointers rather than a full audit
- it should direct users toward the CLI or later desktop app for deeper analysis

### First Paid Product Direction

- the first paid product should likely be built around the CLI
- this fits the goal of keeping robust scanning local-first and inexpensive to operate
- a future desktop app can be built on top of the same scan engine once the core crawler is solid
- codebase scanning and authenticated sessions should be part of the later roadmap

## Go-To-Market Direction

- use the free website scanner as top-of-funnel acquisition
- market the CLI to developers and technical agencies
- test messaging on X and other developer channels
- create landing pages around high-risk website categories and common compliance pain points

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

## Examples to Learn

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

## Roadmap Direction

- start with publicly crawlable websites
- later add codebase scanning when the source is available
- later add authenticated session support for protected flows
- later expand into broader rendering and app-specific analysis

## Future AI Compliance

AI compliance is a credible future expansion area for Olite, especially as EU and other regulatory frameworks mature.

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

Olite is a lightweight website compliance scanner focused on accessibility, privacy, communication consent, and basic security. It starts with public website crawling and analysis, then expands later into codebase-aware and authenticated scanning where broader access is available.