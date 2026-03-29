# What Olite Checks

## Purpose

This document is the public-facing issue catalog for Olite.

It exists to:

- explain what Olite is actually isolating in scans today
- give users a plain-language inventory of current review coverage
- provide a starting list for future blog articles, landing pages, and documentation

This is not a guarantee that Olite catches every issue on a site. It is a running description of the observable signals the current product is designed to surface.

## Product Framing

Olite is a lightweight verification scanner for public websites.

Today, the product focuses on:

- accessibility issues that can be observed from markup or light rendered checks
- privacy and consent signals that can be observed from public-page content and visible controls
- a small set of basic security findings tied to headers, transport, and form behavior

The hosted scanner is intentionally lightweight. The desktop app adds stronger rendered checks and is the path for broader local workflows over time.

## Current Review Layers

Olite currently groups findings into four layers:

- accessibility
- privacy
- consent
- security

## Accessibility Issues Currently Surfaced

### Static markup and semantics

- Missing page title
- Missing html lang attribute
- Missing main landmark
- Multiple h1 headings detected
- Images missing alt text
- Placeholder-only form fields
- Inputs missing visible or programmatic labels
- Weak heading structure signals
- Buttons without accessible names
- Links without accessible names
- Potential focus order override from positive tabindex
- Iframes missing title attributes

### Rendered accessibility checks in desktop reviews

- Focusable elements hidden from view after render
- Rendered skip link target missing
- Skip link did not change focus or route after activation
- Keyboard tab progression could not be established after render
- Keyboard focus appears stalled during early tab progression

### Why these matter

These checks focus on issues that often block real users quickly:

- weak document structure
- missing labels or names on interactive controls
- broken keyboard movement
- missing non-text alternatives

They are also good candidates for concrete evidence such as selectors, snippets, and page-level locations.

## Privacy Issues Currently Surfaced

- Privacy policy link could not be verified
- Tracking signals without visible cookie wording
- Cookie banner without obvious reject or manage controls
- No obvious privacy rights request path detected
- No obvious sale or sharing opt-out path detected
- Limited visible US privacy rights cues
- No visible Global Privacy Control cue detected
- No obvious privacy or cookie policy links detected
- Email capture without visible privacy cues

### Why these matter

These checks are aimed at public-facing transparency and rights signals, not formal legal conclusions.

They help isolate whether a site appears to expose:

- a reachable privacy policy
- visible cookie and consent messaging
- rights-request pathways
- opt-out cues for US privacy expectations
- basic privacy context around email capture

## Consent Issues Currently Surfaced

- Email capture without visible consent signals

### Why this matters

This is a narrow but practical early consent check. It helps identify forms that collect email addresses without obvious adjacent opt-in language or meaningful consent cues.

## Security Issues Currently Surfaced

- Limited security header coverage
- Page is not served over HTTPS
- Forms submit to insecure HTTP targets

### Why these matter

These are not full security-audit findings. They are lightweight baseline issues that can still reveal obvious weaknesses in public-facing delivery and form handling.

## How Olite Isolates These Issues

Olite currently uses a practical verification ladder:

- static DOM review for markup and semantics
- visible public-page review for privacy and consent cues
- lightweight rendered browser checks in the desktop app for keyboard and skip-link behavior
- same-domain crawl support in local workflows for broader review over time

## Limits

Olite does not currently claim to fully automate:

- legal compliance determinations
- full WCAG conformance reviews
- authenticated product flows
- deep network-level consent verification in the hosted scanner
- cloud dashboards or historical project storage

That boundary is intentional. The goal is to isolate concrete, reviewable issues and give teams a fast first pass they can act on.

## Article Seeds

This catalog also creates a clean backlog for public writing. Strong early article candidates include:

- what Olite means by missing privacy-policy verification
- why placeholder-only fields remain a real accessibility issue
- why skip links still fail on modern websites
- what visible US privacy rights cues look like in practice
- why GPC messaging matters when tracking is present
- what limited security headers do and do not mean