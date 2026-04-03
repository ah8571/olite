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

## Automation Scope And Limits

Olite should be framed as an automation-oriented verification product.

That means the product can automate more than a shallow website lint pass, but it should still avoid claiming
that automated checks fully replace broader accessibility, privacy, or legal review.

The practical posture is:

- focus the app on lightweight automation first
- automate high-confidence semantic, interaction, and browser-observable checks
- avoid claiming that a passing result means a site is fully compliant
- treat deeper manual verification as outside the first product scope, even if it may become an enterprise service later

## Verification Methods

Olite should define each rule not only by what it checks, but also by how the product can actually verify it.

The most useful verification ladder is:

- static DOM verification for high-confidence markup and semantics issues
- rendered browser verification for interaction, focus, visibility, and consent-state behavior
- network verification for tracker and pre-consent request behavior
- multi-page crawl verification for recurring template and footer or policy coverage issues
- source-aware verification later in the CLI for template-level and component-level enforcement

### 1. Static DOM Verification

Best for:

- page title presence
- `html lang`
- missing `main` landmark
- heading outline warnings such as missing or multiple `h1` elements
- images missing `alt`
- unlabeled controls
- placeholder-only form patterns
- links or buttons missing accessible names
- iframe title coverage
- policy-link and cookie-wording visibility signals
- insecure form action markup

Why it works:

- these checks are observable directly from markup
- they are relatively stable across hosted, desktop, and CLI scans
- they can produce concrete evidence like selectors, snippets, and affected elements

### 2. Rendered Browser Verification

Best for:

- focus visibility
- focus order
- skip-link behavior once activated
- dialog and menu focus management
- cookie-banner interaction outcomes
- rendered text contrast and UI contrast
- client-rendered policy banners or consent controls that do not exist in initial HTML

Why it works:

- many modern sites hide important compliance behavior behind hydration or JavaScript
- desktop and future browser automation are much better suited than the hosted scanner for these checks

### 3. Network Verification

Best for:

- analytics firing before consent
- marketing pixels firing before consent
- third-party requests on first load
- banner state ignored after reject or manage interactions

Why it works:

- privacy compliance often depends on runtime behavior, not just visible wording
- network evidence is one of the strongest ways to support privacy findings without making legal claims

### 4. Multi-Page Crawl Verification

Best for:

- footer policy coverage across templates
- repeated missing landmarks or heading issues
- form transparency consistency across marketing pages
- whether privacy and cookie controls appear only on some routes

Why it works:

- many compliance failures are template-level or route-level, not isolated to a single page
- this is where the desktop app provides stronger value than the hosted free tool

### 5. Source-Aware Verification

Best for later CLI phases:

- component libraries that emit unlabeled controls
- missing policy links in shared templates
- consent platform configuration and environment drift
- CI gating on critical accessibility and privacy regressions

Why it works:

- it catches regressions before deployment
- it complements browser verification rather than replacing it

### Evidence Standards For Rules

Each automated rule should try to return:

- a plain-language issue title
- a concrete implementation detail explaining what was observed
- a location summary that helps the user find the problem quickly
- one or more evidence snippets, selectors, or header or network references where available
- a limitation note when the finding is advisory or partial rather than definitive

That keeps the product focused on observable compliance signals instead of overclaiming certainty.

### What Can Be Automated Well

#### 1. DOM And Semantics Checks

High-value automated checks include:

- missing labels
- missing alt text
- missing headings
- weak or missing landmark structure
- missing page titles
- inaccessible names on links and buttons

#### 2. Keyboard Interaction Checks

High-value automated checks include:

- whether a page can be tabbed through sensibly
- whether focus is visible
- whether focus order is sensible
- whether dialogs, menus, and popovers trap and return focus correctly
- whether important controls are reachable without a mouse

#### 3. Browser-Driven Flow Checks

High-value automated checks include:

- multi-page or staged flows executed with Playwright or an equivalent browser harness
- opening a modal, submitting a form, or triggering validation and then inspecting focus movement
- checking whether dynamic content updates appear in ways assistive technologies can consume

#### 4. Rules-Engine Checks

High-value automated checks include:

- axe-core style checks
- custom rules layered on top for Olite-specific behavior and messaging

### Assistive Technology Reference Targets

Olite should keep a practical list of assistive technology reference targets in mind, even if the first product
does not automate those tools directly.

Important reference platforms:

- NVDA
- JAWS
- VoiceOver
- TalkBack

Practical note:

- first product versions should primarily model support indirectly through semantic checks, keyboard-flow checks, and browser-driven staged checks
- direct orchestration of assistive technologies themselves should be treated as later research work rather than an MVP dependency

### Assistive Technology Approximation And Manual Review Boundaries

Olite can get meaningfully closer to the experience of a screen reader without claiming to run NVDA, JAWS,
VoiceOver, or TalkBack directly.

The right framing is to break the experience into parts that can be approximated with browser automation and to
name the parts that still require manual review.

#### 1. Accessibility Tree Exposure

High-value automated checks include:

- whether the browser accessibility tree still exposes the page's main landmark
- whether primary headings remain present in the accessibility tree after hydration
- whether obvious interactive controls keep a role and accessible name in the tree

Why it matters:

- many assistive technologies navigate what the browser exposes, not just what the visual DOM appears to show
- this catches regressions where the page looks correct visually but key structure disappears from assistive technology navigation

#### 2. Navigation Surfaces Assistive Technologies Rely On

High-value automated checks include:

- landmark availability and duplication
- heading availability and hierarchy
- skip-link presence and activation behavior
- form-group and required-state announcement cues

Why it matters:

- these are the fast navigation surfaces many screen-reader and switch users depend on to move through a page

#### 3. Dynamic Announcement Risk

High-value automated checks include:

- whether dialogs, validation errors, or client-rendered status changes move focus predictably
- whether live-region style announcements appear to have an accessible target when the UI updates
- whether hydration removes or replaces previously exposed semantic structure

Why it matters:

- many real accessibility failures happen after interaction rather than in initial markup

#### 4. Manual Review Boundaries

Olite should be explicit that some questions still require human assistive-technology review.

Examples include:

- whether a screen reader announces content in an intuitive or low-friction order
- whether link wording, control naming, and instructions feel understandable in context
- whether complex widgets are pleasant and efficient to use with a real assistive technology stack
- whether virtual cursor behavior, rotor behavior, browse mode, or verbosity settings create practical friction

Product rule:

- automated findings in this area should be described as accessibility-tree or assistive-technology approximation issues
- Olite should avoid claiming that these checks replace real screen-reader testing

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