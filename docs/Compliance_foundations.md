# Compliance Foundations

## Purpose

This document defines the practical compliance foundation for Olite's:

- free hosted accessibility scanner
- free hosted privacy standards checker
- desktop app
- future CLI

The goal is not to turn Olite into a law firm or formal auditor. The goal is to anchor product checks to a small, defensible set of legal and technical standards that can drive rule design over time.

## Product Framing

Olite should treat this document as a rule-design foundation, not as marketing copy.

That means:

- use it to decide what categories belong in the product
- use it to prioritize which checks are worth implementing first
- use it to explain why a check exists
- avoid claiming that passing these checks means a site is fully compliant

## Core Principle

For the first versions of Olite, the strongest posture is:

- accessibility foundation anchored to WCAG 2.2 AA as the technical baseline
- privacy foundation anchored to GDPR transparency and consent expectations, plus cookie-consent rules from ePrivacy and PECR
- US privacy checks added where they can be verified from public website behavior, especially notice and opt-out signals

That gives the product one clean baseline for engineering while still leaving room for region-specific messaging later.

## Accessibility Foundation

### Primary Standards To Anchor To

#### WCAG 2.2 AA

This should be the main technical accessibility baseline for Olite.

Why:

- it is the most recognizable web accessibility standard
- it maps well to machine-detectable website checks
- it provides a stable technical language for issue design
- it is a useful shared baseline across the free tools, desktop app, and CLI

#### ADA Title III

For US-facing commercial websites, ADA pressure is one of the practical business drivers behind accessibility work.

Important note:

- ADA itself does not provide the detailed technical checklist
- in practice, WCAG is the more useful implementation baseline for scanner design

#### Section 508

This matters mainly for US public-sector and procurement contexts.

Practical product use:

- useful as supporting context for public-sector users
- not the primary rule-writing framework for the MVP

#### European Accessibility Act and EN 301 549

These matter for EU-facing accessibility requirements and public procurement contexts.

Practical product use:

- useful for later market expansion
- still best mapped back to WCAG-style technical checks for implementation

### Accessibility Rule Groups

Olite should organize accessibility checks into a few stable groups.

#### 1. Document And Language Basics

High-value checks:

- missing `html lang`
- missing page title
- multiple or missing `h1`
- obvious heading-level skips
- missing landmarks where the structure is very weak

Why these matter:

- they are foundational to screen-reader interpretation and page structure
- they are relatively high-confidence checks
- they work well in both hosted and local scans

#### 2. Non-Text Content

High-value checks:

- images missing `alt`
- decorative images using non-empty `alt` where they appear likely decorative
- linked images with weak or missing accessible names
- iframes missing titles

Why these matter:

- they are common and highly visible accessibility issues
- they are easy for users to understand and fix

#### 3. Forms And Inputs

High-value checks:

- inputs missing visible or programmatic labels
- placeholder-only form patterns
- buttons with no accessible name
- select, textarea, or checkbox controls missing labels
- required inputs with no clear indication in the UI
- error-prone form structure such as grouped controls without clear legends

Why these matter:

- forms create real user blockers
- they are strong candidates for early scanner value

#### 4. Links, Buttons, And Interactive Controls

High-value checks:

- vague link text like `click here` or `read more` when repeated without context
- empty links
- empty buttons
- interactive elements implemented on non-interactive tags without role and keyboard support
- duplicate adjacent links creating noisy navigation patterns

Why these matter:

- they are common in modern component-driven sites
- some are detectable from static markup alone

#### 5. Keyboard And Focus

Early checks:

- missing skip link on content-heavy sites
- focusable elements hidden from view
- positive `tabindex` usage
- modal or menu patterns that appear likely to trap or mismanage focus

Important note:

- many keyboard issues require runtime interaction and should be treated as desktop or CLI checks before they become hosted checks

#### 6. Media And Time-Based Content

Later checks:

- video without captions signal
- autoplay media without obvious controls
- audio or video embeds without transcript or caption clues

Important note:

- these are lower-confidence from public-page scanning alone and should usually be advisory in early versions

#### 7. Tables, Lists, And Structural Semantics

High-value checks:

- tables used without table headers where clearly tabular
- malformed list structures
- ARIA landmarks duplicated or missing in ways that weaken navigation
- misuse of structural roles

#### 8. Color And Visual Presentation

Later checks:

- low contrast text
- low contrast UI controls
- text rendered over backgrounds with poor contrast

Important note:

- these belong much more naturally in rendered desktop and CLI scanning than in the first hosted pass

### Accessibility MVP Priority Order

The first accessibility checks should likely be:

1. document language
2. title presence
3. heading structure
4. image alt coverage
5. form labels
6. button and link accessible names
7. iframe titles

That is a strong first rule set because it is understandable, useful, and mostly high confidence.

## Privacy Foundation

### Primary Standards To Anchor To

#### GDPR

GDPR should be the main privacy law foundation for Olite's public website privacy checks.

The most relevant parts for website scanning are not the entire regulation. They are the parts that surface in public website behavior.

Most relevant themes:

- transparency
- lawful basis clarity
- consent quality where consent is used
- privacy by design signals
- data collection notice quality

The most relevant practical articles for rule design are:

- Article 5: transparency, fairness, data minimization principles
- Article 6: lawful basis context
- Article 7: conditions for consent
- Articles 12 to 14: information and notice duties
- Article 25: data protection by design and by default

#### ePrivacy Directive and PECR-style Cookie Rules

For website behavior, cookie and tracker checks should be anchored more directly to ePrivacy and PECR-style expectations.

Why:

- consent for non-essential cookies is a website-implementation issue
- public pages often reveal whether tracking appears to load before consent
- these checks fit Olite's scanner model well

#### CCPA and CPRA

These matter for US-facing privacy expectations, especially notice and opt-out signaling.

Practical product use:

- include them in the privacy foundation
- focus early checks on public signals that can actually be observed
- avoid pretending the product can verify backend obligations from page markup alone

#### PECR and UK GDPR

These are useful for UK-facing privacy messaging and can usually share the same core implementation checks as GDPR plus cookie-consent scanning.

### Privacy Rule Groups

#### 1. Transparency And Policy Visibility

High-value checks:

- missing privacy policy link
- missing cookie policy link where tracking is present
- privacy link only exposed in a hard-to-find location
- no obvious data collection notice near lead forms
- missing contact or controller-style identity cues in the policy page or footer

Why these matter:

- public transparency is central to the website-facing part of privacy compliance
- these are strong candidates for the free privacy checker

#### 2. Consent And Cookie Controls

High-value checks:

- tracking signals present without visible cookie banner or consent wording
- cookie banner present but no obvious reject or manage-preferences path
- accept-only cookie UI patterns
- banner present but appears purely informational despite marketing or analytics trackers being loaded
- no obvious distinction between essential and non-essential cookies in the UI or linked policy

Important note:

- some of these checks require rendered-state and network-aware behavior to be credible
- the hosted checker can surface partial signals, but desktop and CLI should become the stronger implementation surface

#### 3. Pre-Consent Tracking Behavior

High-value checks for desktop and CLI:

- analytics requests firing before consent
- marketing pixels firing before consent
- third-party cookies set before consent
- consent state ignored on reload or route change

Why these matter:

- they are one of the clearest privacy-verification wedges for Olite
- they are difficult for site owners to verify manually across an entire site

#### 4. Forms And Data Capture Transparency

High-value checks:

- email capture with no privacy link nearby
- newsletter form with no consent wording where marketing use is implied
- checkbox present but no meaningful explanation of what is being consented to
- contact or demo forms collecting more information than appears necessary, flagged only as a softer advisory signal

Important note:

- lawful basis cannot always be inferred from markup alone
- the product should frame these as implementation and transparency concerns, not definitive legal violations

#### 5. Tracking And Third-Party Disclosure Signals

High-value checks:

- presence of Google Analytics, Google Tag Manager, Meta Pixel, LinkedIn Insight, Hotjar, and similar tools
- multiple advertising or session-replay tools present with no obvious privacy or cookie disclosure path
- privacy page missing despite clear third-party tracking signals

#### 6. User Rights And Notice Signals

Checks to add later:

- no obvious path for privacy requests or contact in the privacy notice
- no obvious `Do Not Sell or Share` style link for California-facing sites where ad-tech signals suggest it may be relevant
- no obvious retention or data-use explanation cues in the policy page

Important note:

- many of these are partial public signals only
- they should usually be framed as missing visible evidence rather than definitive non-compliance

#### 7. Security-Adjacent Privacy Signals

Supportive checks:

- HTTPS missing
- weak security-header coverage
- insecure form action targets

Why these belong here at all:

- they are not privacy compliance by themselves
- but they support a broader public trust and privacy posture review

### Privacy MVP Priority Order

The first privacy checks should likely be:

1. privacy policy link detection
2. cookie-banner or cookie-wording detection
3. tracker detection
4. tracker-without-visible-consent signal
5. email capture without nearby privacy or consent cues
6. weak header and HTTPS signals as supporting context

That produces a useful first privacy checker without pretending to verify everything a privacy program would require.

## Product Surface Matrix

## Free Hosted Tools

The hosted tools should focus on high-confidence, public-page checks.

Accessibility checks best suited to hosted:

- `html lang`
- title presence
- heading structure
- image `alt`
- form labels
- empty buttons or links
- iframe titles

Privacy checks best suited to hosted:

- privacy and cookie policy link detection
- cookie wording detection
- tracker presence detection
- email capture plus missing privacy cues
- HTTPS and header support signals

Avoid in hosted early on:

- full keyboard-flow analysis
- color contrast assertions across complex UI states
- runtime consent verification based on network behavior
- multi-page consent-flow reasoning

## Desktop App

The desktop app should extend the hosted checks into multi-page and rendered-state verification.

Accessibility checks best suited to desktop:

- color contrast
- focus order and focus visibility sampling
- modal, menu, and dialog checks
- template-level issue clustering across many pages

Privacy checks best suited to desktop:

- pre-consent network requests
- route-by-route cookie and tracker behavior
- banner interaction outcomes
- deeper site-wide policy visibility checks

## CLI

The CLI should become the strongest automation and verification surface.

CLI priorities:

- repeatable scans in CI or scheduled jobs
- codebase-aware checks later
- rule configuration and suppression
- JSON output for downstream workflows
- site-wide gating on critical issues

CLI-only or CLI-first later checks:

- component and template accessibility patterns in source
- consent platform configuration validation where code or config is available
- policy-link or form-notice enforcement in templates
- route- and environment-specific verification in staging or preview deployments

## Initial Regulation Set To Isolate

If Olite wants a short list of foundational frameworks to design around first, it should be this:

### Accessibility

- WCAG 2.2 AA as the primary technical foundation
- ADA as market context for US commercial websites
- Section 508 and EN 301 549 as secondary supporting frameworks

### Privacy

- GDPR as the main privacy-program foundation
- ePrivacy Directive and PECR-style cookie requirements for consent and tracker behavior
- CCPA and CPRA for US notice and opt-out visibility, where publicly observable

That is enough to guide the first real rule inventory without spreading the product too thin.

## Recommended Rule-Build Sequence

### Phase 1: Free Tool Foundation

- high-confidence public-page accessibility checks
- privacy policy and cookie notice checks
- tracker detection
- tracker-without-visible-consent signal
- form transparency checks

### Phase 2: Desktop Verification Layer

- rendered-state accessibility checks
- pre-consent network behavior
- multi-page crawl coverage
- repeated pattern clustering

### Phase 3: CLI And Source-Aware Rules

- repeatable automation
- codebase-aware accessibility checks
- codebase-aware consent and privacy checks
- CI gating and custom rule controls

## Important Cautions

- do not claim legal compliance certification
- do not imply that a clean scan means the site is fully compliant
- separate observable public signals from legal conclusions
- keep rule explanations tied to recognizable standards and practical implementation guidance

## Practical Takeaway

The cleanest foundation for Olite is:

- accessibility scanner built on WCAG 2.2 AA-style technical checks
- privacy scanner built on GDPR transparency and consent expectations plus ePrivacy and PECR cookie behavior
- US privacy signals layered in where public notice and opt-out cues can actually be observed

That gives the free tools a narrow and defensible wedge, the desktop app a clear next layer of verification, and the CLI a natural path toward deeper automation and source-aware checks.