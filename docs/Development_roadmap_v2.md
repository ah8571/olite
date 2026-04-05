# Olite Development Roadmap v2

Derived from `docs/Development_roadmap.md`.

This version keeps the original roadmap intact but breaks the work into a checklist that can be worked through in priority order. The intent is to reduce duplication, preserve smaller ideas, and make progress easier to track.

## How To Use This Version

- Use this as the operational roadmap.
- Keep the original roadmap as the higher-context strategy document.
- Check items off only when the behavior is shipped or clearly completed, not just discussed.
- Add short notes under an item when scope changes, blockers appear, or a decision is made.

## Current Baseline Already In Place

- [x] Hosted public tools exist for accessibility and privacy checks.
- [x] The project has a shared TypeScript scan engine used across surfaces.
- [x] The desktop app can run a single-page local review.
- [x] The desktop app already stores local scan history and exports JSON and CSV.
- [x] The desktop app already includes a first rendered accessibility pass.
- [x] The desktop app already includes a first runtime browser audit for tracker requests and cookie signals on one public page.

## Priority 0: Lock The Product Boundary And Trust Model

- [ ] Freeze the version 0.1 product promise in one concise statement.
  - Note: public website scanning is still the MVP.
  - Note: codebase analysis and authenticated scans remain later phases.

- [ ] Standardize the product boundary across web, desktop, docs, and messaging.
  - Note: clarify what is hosted-safe versus local-only.
  - Note: make sure the product does not imply full compliance review.

- [ ] Make scan coverage and limitations explicit in every result surface.
  - Note: always state what was scanned.
  - Note: always state what was not scanned.
  - Note: always state what was only partially analyzed.

- [ ] Add confidence language to findings.
  - Note: distinguish verified failures from heuristics.
  - Note: separate high-confidence findings from advisory guidance.

- [ ] Build consistent bottleneck messaging.
  - Note: handle robots blocks, auth walls, bot protection, render failures, and page caps.
  - Note: prefer honest messages over silent failure or implied certainty.

- [ ] Define which findings are advisories versus default failures.
  - Note: missing skip links should usually be advisory.
  - Note: present-but-broken skip links should be treated as stronger runtime failures.

## Priority 1: Strengthen The Core Local Scanner

- [ ] Establish an internal testing workflow for the scanner.
  - Note: add unit tests for pure rule logic.
  - Note: add browser-backed fixture tests for runtime behavior.
  - Note: use local example pages or controlled fixtures for edge cases before relying on public websites.
  - Note: initial fixture-backed runtime accessibility and privacy tests now exist, but broader rule and engine coverage still needs to be added.

- [ ] Decide the exact local-first path for deeper scans.
  - Note: hosted tools stay intentionally narrow.
  - Note: desktop and CLI should be the main deeper-scan surfaces.

- [ ] Restore or complete bounded same-domain crawling for deeper local usage.
  - Note: page caps and depth limits should stay explicit.
  - Note: crawl limits should protect performance and clarity.

- [ ] Make crawl configuration first-class for local runs.
  - Note: start URL.
  - Note: page cap.
  - Note: same-origin behavior.
  - Note: privacy expectations by region.

- [ ] Build a more structured rule execution pipeline.
  - Note: preserve one normalized issue model across all checks.
  - Note: keep static, rendered, and runtime checks composable.

- [ ] Add performance-focused engine improvements.
  - Note: worker-based concurrency.
  - Note: crawl queues and smarter scheduling.
  - Note: caching repeated assets or normalized signals.
  - Note: profiling and hotspot optimization.

## Priority 2: Deepen Accessibility Automation

- [ ] Keep the current semantic checks and formalize them as the stable base layer.
  - Note: this section should continue absorbing accessibility gaps identified from Compliance_foundations.md.

- [ ] Add assistive-technology approximation checks and explicit manual-review boundaries.
  - Goal: reach a high-confidence browser-based approximation of the structural and interaction issues a screen-reader user is likely to encounter, without claiming direct NVDA, JAWS, VoiceOver, or TalkBack execution.
  - Done so far:
    - [x] Define the product boundary and manual-review posture.
      - Note: the product now explicitly frames these as assistive-technology approximation findings rather than real screen-reader runs.
      - Note: documented in Compliance_foundations.md.
    - [x] Verify primary structure survives into the browser accessibility tree.
      - Note: current validated slice checks whether rendered main-landmark and primary-heading cues remain exposed in the ARIA snapshot.
      - Note: covered by rendered-accessibility fixture tests.
    - [x] Preserve prerequisite signals this layer depends on.
      - Note: hydration-regression checks, keyboard-flow checks, skip-link activation checks, form-structure checks, and structural-semantics checks are already implemented and tested.
      - Note: these are not sufficient on their own, but they materially improve confidence in later AT approximation findings.
  - Still needed for higher confidence:
    - [ ] Expand accessibility-tree verification beyond main and heading exposure.
      - Note: verify landmark coverage and duplication in the tree, not just in the DOM.
      - Note: verify that key controls retain usable role, name, and state exposure after render and hydration.
    - [x] Add accessible-name quality checks for critical controls in the browser context.
      - Note: current validated slice checks missing post-render names and weak generic names for visible buttons, links, and form controls.
      - Note: initial coverage is strongest for common visible controls; pattern-specific checks for dialogs and consent triggers can still deepen this later.
    - [ ] Add browser-driven dynamic announcement risk checks.
      - Note: first validated slice now checks submit-driven validation feedback for focus movement and readable alert, status, or aria-live exposure.
      - Note: status-message updates outside forms, async content refreshes, and modal open-close cycles still need dedicated coverage before this subitem can be checked off.
      - Note: this is important because many practical screen-reader failures occur after interaction rather than on initial load.
    - [ ] Add interactive-pattern AT approximation checks.
      - Note: validated slices now check explicit dialog triggers for focus entry and focus return, explicit disclosure triggers for open-state exposure after activation, and explicit tab triggers for selected-state plus controlled-panel exposure after activation.
      - Note: tabs, popovers, menus with richer focus management, and stronger dialog containment checks still need dedicated coverage before this subitem can be checked off.
    - [ ] Add staged navigation checks that better approximate screen-reader wayfinding.
      - Note: landmark traversal, heading traversal, repeated-region noise, and route-to-route consistency should be sampled across multiple same-origin pages where justified.
    - [ ] Add issue messaging that separates confidence levels inside this layer.
      - Note: JSON and CSV exports now include suggested-fix guidance plus machine-readable issue family, verification method, confidence level, and manual-review flags, so downstream chat-agent workflows do not need to infer those from titles alone.
      - Note: examples: likely AT-structure failure, likely AT-naming failure, likely post-interaction announcement risk, manual review recommended.
    - [ ] Build a stronger fixture matrix for AT approximation coverage.
      - Note: each new slice should ship with both failing and healthy fixtures so confidence stays tied to repeatable tests.
  - Exit criteria for checking this item off:
    - landmark and heading exposure are verified in the accessibility tree
    - critical control naming and role exposure are checked after render
    - key interaction patterns are sampled for focus and announcement risk
    - multi-step and post-hydration failures have representative fixture coverage
    - reporting still states that this is a high-confidence approximation layer, not a replacement for real assistive-technology testing

- [x] Integrate axe-style rules into the desktop scan pipeline.
  - Note: keep results merged into the same reporting model.

- [ ] Review the axe-core repo as a product-engineering precedent and summarize the most useful patterns for Olite.
  - Note: study rule structure, metadata design, result typing, standards mapping, fixture strategy, release cadence, and limitation messaging.
  - Note: focus on what should influence Olite's product and rule architecture, not just what could be copied technically.

- [ ] Draft a concrete compliance checklist for using `axe-core` as a dependency versus copying `axe-core` source.
  - Note: dependency use, copied-source use, modified-source use, attribution, notice preservation, third-party license tracking, and source-availability obligations should be separated clearly.
  - Note: the goal is operational clarity before any code reuse decision is made.

- [ ] Identify which parts of `axe-core` are most worth learning from without reusing code directly.
  - Note: likely areas include rule taxonomy, incomplete and manual-review boundaries, fixture coverage, browser limitations, and standards-tagging patterns.
  - Note: prefer learning from architecture and product discipline before considering source reuse.

- [x] Consolidate browser-driven accessibility checks around a durable browser harness.
  - Note: Playwright is the preferred long-term foundation.
  - Note: move the existing hidden Electron window checks into the Playwright path so privacy and accessibility runtime checks share one browser engine.

- [x] Verify rendered DOM state after hydration.

- [x] Expand keyboard-flow checks.
  - Note: page-level tab order sanity.
  - Note: visible focus and focus progression.
  - Note: reachability of interactive controls without a mouse.
  - Note: early tab progression exists today, but it should be treated as the beginning of a fuller keyboard model rather than the finished implementation.

- [x] Add stronger basic interaction checks for links, buttons, and controls.
  - Note: vague repeated link text.
  - Note: empty links.
  - Note: empty buttons.
  - Note: non-interactive elements acting like controls without role and keyboard support.

- [x] Add stronger form-structure checks.
  - Note: required inputs without clear indication.
  - Note: grouped controls without clear legends.

- [ ] Expand interactive pattern verification.
  - Note: menu behavior.
  - Note: modal behavior.
  - Note: popover and disclosure behavior.
  - Note: form validation and focus recovery.
  - Note: dynamic content updates should be checked in a real browser flow because React or other frontend state changes may alter the page after interaction.

- [x] Keep skip-link checks nuanced.
  - Note: verify target presence when a skip link exists.
  - Note: verify focus or route changes on activation.

- [x] Add stronger structural-semantics checks.
  - Note: tables missing clear headers where tabular structure is obvious.
  - Note: malformed list structures.
  - Note: duplicated or weak landmark structure beyond the current basics.

- [ ] Add rendered visual checks where browser inspection is required.
  - Note: rendered text contrast.
  - Note: UI control contrast.

- [ ] Widen from single-page accessibility checks into staged multi-step flows where justified.

## Priority 3: Deepen Privacy And Cookie Auditing

- [ ] Keep this section as the single source of truth for the cookie scanner MVP.
  - Note: do not maintain a separate cookie-scanner checklist doc.
  - Note: each item should record current functionality, expected tests, and progress notes here.
  - Note: do not check a cookie-scanner subitem off unless the behavior is implemented and covered by a relevant test or fixture path.

- [ ] Keep the implementation and test map current for future agents.
  - Functionality locations today:
    - `lib/scanner-core.ts` for public-page privacy cues, policy-link heuristics, cookie wording, tracker presence signals, and GPC text cues.
    - `desktop/src/runtime-privacy-audit.ts` for Playwright-backed consent interaction, tracker-request sampling, cookie sampling, route sampling, and GPC runtime comparison.
    - `desktop/src/main.ts`, `desktop/index.html`, and `desktop/renderer.js` for the desktop scan wiring and result presentation.
    - `lib/issue-guidance.ts` for privacy issue guidance text.
    - `app/tools/cookie-scanner/page.tsx` for the hosted cookie-scanner landing page that currently reuses the privacy scan logic with cookie-focused copy.
    - `app/components/scanner-form.tsx` for hosted cookie result badges and cookie-scanner page label overrides.
  - Test locations today:
    - `tests/scanner-core.test.ts` for static and heuristic scanner coverage.
    - `tests/runtime-privacy-audit.test.ts` for Playwright-backed privacy runtime fixtures.
  - Supporting product docs today:
    - `desktop/README.md`
    - `docs/Compliance_foundations.md`

- [ ] Freeze the cookie-scanner MVP contract early.
  - [x] Keep the wedge audit-first, not consent-widget-first.
    - Note: preserve the product boundary that cookie auditing is the early wedge.
    - Note: an internal cookie component for `olite.dev` is still allowed as a self-use compliance and reference implementation; that is different from turning Olite into a hosted CMP product.
  - [x] Anchor the privacy logic to GDPR transparency plus ePrivacy and PECR-style cookie behavior.
    - Note: foundation is documented in `docs/Compliance_foundations.md`.
  - [ ] Freeze the first supported scan target shape.
    - Note: likely one public landing page plus a few same-origin routes.
  - [ ] Freeze the MVP output level.
    - Note: issue list plus evidence, not legal pass-fail claims.
  - [ ] Freeze the MVP success bar.
    - Note: useful on common CMP and tracker setups, explicit about limitations.
  - [ ] Freeze the runtime limits.
    - Note: page cap, route cap, timeout budget, and safe interaction budget should be explicit.

- [ ] Define the scan flow end to end.
  - [ ] Normalize the input URL and follow safe redirects.
  - [ ] Load the page in a real browser context.
  - [ ] Wait for a stable initial state without hanging indefinitely.
  - [ ] Capture the initial DOM, visible consent and policy cues, and page metadata.
  - [ ] Capture the initial request log and cookie jar before any consent action.
  - [ ] Optionally follow a short same-origin route set after the first page completes.
  - Location:
    - `desktop/src/runtime-privacy-audit.ts`
  - Tests:
    - extend `tests/runtime-privacy-audit.test.ts` with fixtures for redirects, delayed rendering, and route-capped sampling.

- [ ] Deepen visible consent and policy signal detection.
  - [x] Detect likely consent UI on the page.
    - Note: current visible-control heuristics are present in `lib/scanner-core.ts` and runtime consent control discovery is present in `desktop/src/runtime-privacy-audit.ts`.
    - Tests: existing baseline coverage lives in `tests/runtime-privacy-audit.test.ts`.
  - [x] Detect common visible control types.
    - Note: accept, reject, and manage-preferences signals already exist.
    - Tests: `tests/runtime-privacy-audit.test.ts` already covers accept-only versus full-controls fixtures.
  - [x] Detect cookie-policy-specific links separately from broader privacy links in the hosted scan.
    - Note: the hosted scan now records `cookiePolicyLinkCount` separately from the broader `policyLinkCount` so a cookie page can be surfaced even when a general privacy page already exists.
    - Location: `lib/scanner-core.ts`
    - Tests: `tests/scanner-core.test.ts`
  - [x] Surface cookie-banner, reject, and manage-preferences metadata in hosted results.
    - Note: hosted results now expose `cookieBannerSignalPresent`, `cookieRejectControlPresent`, and `cookieManageControlPresent` so the cookie-scanner landing page can show cookie-specific badges.
    - Location: `lib/scanner-core.ts`, `app/components/scanner-form.tsx`
    - Tests: `tests/scanner-core.test.ts`
  - [ ] Improve banner and modal detection across more CMP patterns.
  - [ ] Detect whether the consent UI is banner, modal, drawer, popover, or inline block.
  - [ ] Add a dark-pattern review layer for cookie UI.
    - Note: use complaint and enforcement themes from groups such as noyb as product input even when every pattern is not yet encoded as a hard scanner rule.
    - Note: this should improve user feedback, remediation advice, and finding taxonomy, not just produce stronger legal claims.
    - High-value pattern candidates:
      - accept-only first layer
      - reject or manage path hidden behind extra clicks
      - asymmetric button emphasis or misleading visual hierarchy
      - preselected optional choices
      - weak distinction between essential and non-essential categories
      - hard-to-find withdrawal or reopen-preferences path
      - manipulative or confusing consent wording
    - Sub-checks to start assessing:
      - [ ] whether reject is visible on the first layer, not only after opening preferences
      - [ ] whether manage-preferences is visible on the first layer when granular categories exist
      - [x] whether reject requires more clicks than accept
        - Note: current runtime audit can flag a reject option that only appears after opening settings first.
        - Location: `desktop/src/runtime-privacy-audit.ts`
        - Tests: `tests/runtime-privacy-audit.test.ts`
      - [ ] whether accept appears visually dominant through stronger color, contrast, size, or placement
      - [ ] whether reject or manage controls appear visually muted or easy to miss
      - [ ] whether optional categories appear preselected by default
      - [ ] whether essential-only versus optional categories are explained clearly enough to separate necessary from analytics or marketing
      - [ ] whether a persistent reopen, withdrawal, or privacy-choices path remains available after the initial banner closes
      - [ ] whether banner wording uses confusing "okay"-style framing without a comparably clear refusal path
      - [ ] whether these findings should be static advisories, rendered checks, or runtime interaction checks
  - [ ] Detect privacy-policy links.
  - [ ] Detect cookie-policy links.
  - [ ] Verify privacy-policy and cookie-policy reachability.
    - Note: detect visible links or buttons first, then verify destination reachability, and only later score destination quality.
  - [ ] Record where policy links were found.
    - Note: footer, header, banner, or settings dialog.
  - Location:
    - `lib/scanner-core.ts`
    - `desktop/src/runtime-privacy-audit.ts`
  - Tests:
    - extend `tests/scanner-core.test.ts` with privacy-link fixtures.
    - extend `tests/runtime-privacy-audit.test.ts` with CMP-style rendered consent fixtures.
    - add future rendered fixtures for dark-pattern cases where hierarchy, extra-click friction, or withdrawal behavior matters.

- [ ] Deepen tracker and cookie evidence.
  - [x] Expand runtime pre-consent verification.
    - Note: current validated slice detects tracker requests before consent.
    - Note: current validated slice detects tracking-cookie signals before consent.
    - Location: `desktop/src/runtime-privacy-audit.ts`
    - Tests: `tests/runtime-privacy-audit.test.ts` includes pre-consent tracking fixtures.
  - [ ] Strengthen detection of tracking and likely cookie-setting technologies.
  - [ ] Expand the known tracker-domain and script heuristics.
  - [ ] Separate likely analytics, marketing, session replay, and essential service signals.
  - [ ] Record first-party versus third-party cookie context where possible.
  - [ ] Record which requests appear to set or depend on identifiers.
  - [ ] Distinguish strong evidence from weak heuristics.
  - Location:
    - `lib/scanner-core.ts`
    - `desktop/src/runtime-privacy-audit.ts`
  - Tests:
    - extend `tests/scanner-core.test.ts` with tracker-heuristic fixtures.
    - extend `tests/runtime-privacy-audit.test.ts` with mixed tracker and cookie fixtures.

- [ ] Expand consent interaction verification.
  - [x] Support a first detected accept or reject interaction path.
    - Note: current runtime audit samples one consent interaction when a safe target is found.
    - Location: `desktop/src/runtime-privacy-audit.ts`
    - Tests: `tests/runtime-privacy-audit.test.ts`
  - [ ] Test reject explicitly when both accept and reject are visible.
  - [ ] Test accept explicitly when both accept and reject are visible.
  - [ ] Test manage-preferences behavior where a settings path is visible.
  - [ ] Compare request and cookie behavior before and after each interaction.
  - [ ] Detect when the consent layer is meaningful or merely decorative.
  - [x] Detect whether consent state persists on reload.
    - Note: current runtime audit reloads the page after a reject interaction and can flag trackers or cookies that return.
    - Location: `desktop/src/runtime-privacy-audit.ts`
    - Tests: `tests/runtime-privacy-audit.test.ts`
  - [ ] Detect whether changing or withdrawing consent later is as easy as giving it.
    - Note: a visible reopen-preferences or withdrawal path should become a meaningful later check.
  - [x] Add route-by-route privacy verification for sites where tracker behavior changes beyond the landing page.
    - Note: current runtime audit samples a few same-origin routes and can flag post-reject tracker persistence.
    - Location: `desktop/src/runtime-privacy-audit.ts`
    - Tests: `tests/runtime-privacy-audit.test.ts` covers same-origin route sampling and reject persistence.
  - Location:
    - `desktop/src/runtime-privacy-audit.ts`
  - Tests:
    - extend `tests/runtime-privacy-audit.test.ts` with explicit accept, reject, manage-preferences, reload-persistence, and decorative-banner fixtures.
    - add future fixtures where a site exposes accept immediately but hides rejection or withdrawal behind extra friction.

- [ ] Define and stabilize the first cookie-scanner findings.
  - [ ] Freeze the first finding list.
    - Note: likely findings include tracking before consent, tracking cookies before consent, missing visible reject path, missing manage-preferences path, missing privacy policy link, missing cookie policy link where tracking is present, and decorative consent behavior.
  - [x] Add the first hosted cookie-policy finding.
    - Note: the hosted scan now flags `No obvious cookie policy link detected` when tracking signals appear without an obvious cookie-policy path.
    - Location: `lib/scanner-core.ts`, `lib/issue-guidance.ts`
    - Tests: `tests/scanner-core.test.ts`
  - [ ] Define confidence levels for each finding.
  - [ ] Mark which findings require manual review.
  - [ ] Keep wording evidence-based and avoid legal overclaiming.
  - [ ] Ensure issue guidance stays aligned with the finding set.
  - [ ] Add a softer advisory layer for likely cookie dark patterns.
    - Note: examples may include accept-only design, hidden reject path, hidden withdrawal path, or manipulative consent friction.
    - Note: these should initially use careful wording until the scanner has stronger rendered and interaction evidence.
  - Location:
    - `desktop/src/runtime-privacy-audit.ts`
    - `lib/scanner-core.ts`
    - `lib/issue-guidance.ts`
  - Tests:
    - add or update fixture assertions in `tests/runtime-privacy-audit.test.ts` and `tests/scanner-core.test.ts` whenever a finding title or threshold changes.

- [ ] Improve evidence capture and reporting.
  - [ ] Store the relevant requests behind each finding.
  - [ ] Store the relevant cookies behind each finding.
  - [ ] Store the consent-control text used for interactions.
  - [ ] Capture screenshots for initial and post-interaction states.
  - [ ] Attach page URL and route context to each finding.
  - [ ] Add suggested next-step guidance for each finding.
  - [ ] Ensure exports carry machine-readable issue family, method, confidence, and manual-review flags.
  - Location:
    - `desktop/src/runtime-privacy-audit.ts`
    - `desktop/renderer.js`
    - `lib/issue-guidance.ts`
  - Tests:
    - extend `tests/runtime-privacy-audit.test.ts` to assert evidence payload shape.
    - extend export coverage where export tests are added later.

- [ ] Keep GPC runtime checks as a test-backed slice, not just a wording heuristic.
  - [x] Add Global Privacy Control checks as runtime behavior, not just text detection.
    - Note: current runtime comparison simulates `Sec-GPC: 1` and compares request and cookie behavior.
    - Location: `desktop/src/runtime-privacy-audit.ts`
    - Tests: `tests/runtime-privacy-audit.test.ts` includes GPC honor versus ignore fixtures.
  - [ ] Clarify whether GPC remains in the cookie-scanner MVP or is framed as an advanced privacy mode.
  - [ ] Keep the public-page GPC wording cue distinct from the deeper runtime behavior check.
    - Location: `lib/scanner-core.ts`
    - Tests: extend `tests/scanner-core.test.ts` if the visible GPC wording heuristic changes.

- [ ] Build the cookie-scanner validation matrix alongside the implementation.
  - [ ] Maintain a small internal site list for manual validation.
    - Note: no banner but tracking present, accept-only banner, accept plus reject banner, settings flow, low-script site, route-specific tracker changes.
  - [ ] Save stable fixtures where practical so regressions can be tested locally.
  - [ ] Add fixture-backed tests for tracker detection.
  - [ ] Add fixture-backed tests for consent-control detection.
  - [ ] Add fixture-backed tests for pre- versus post-consent comparisons.
  - [ ] Add a few live smoke-test targets for occasional manual verification.
  - Tests:
    - `tests/runtime-privacy-audit.test.ts`
    - `tests/scanner-core.test.ts`

- [ ] Keep the cookie-audit wedge clear.
  - Note: near-term opportunity is auditing cookie-compliance behavior.
  - Note: do not jump straight into building a hosted consent widget.
  - Note: building a consent component for Olite's own site is still useful as an internal compliance measure and reference implementation, but it should not automatically expand the product promise.
  - Note: revisit a hosted consent layer only after the audit-first scanner proves useful.
  - Progress: a first hosted cookie-scanner landing page now exists at `/tools/cookie-scanner`, but it still intentionally rides on the broader privacy engine rather than pretending runtime consent enforcement is solved.

- [ ] Maintain a cookie dark-pattern research thread.
  - Note: track groups and enforcement themes such as noyb's cookie-banner complaints as recurring input for scanner and remediation design.
  - Note: not every research theme should become a hard rule immediately; some should first land as softer advisory feedback until the evidence model is stronger.

- [ ] Build an internal cookie consent component for `olite.dev` as a reference implementation.
  - Goal: make Olite's own site handle cookies more cleanly while creating a practical reference pattern for future product thinking.
  - Scope boundary:
    - this is for Olite's own site first
    - this is not yet a reusable hosted CMP product for customer sites
  - [ ] Inventory which cookies, storage keys, and third-party scripts Olite actually uses today.
    - Note: separate essential from analytics, marketing, and future optional categories.
  - [ ] Define the first consent model for Olite.
    - Note: likely categories are essential plus optional analytics.
    - Note: decide default behavior before consent for non-essential scripts.
  - [ ] Build the first reusable cookie banner and preferences component.
    - Note: include accept, reject, and manage-preferences flows.
    - Note: include a persistent way to reopen preferences later.
  - [ ] Wire consent state into script loading for Olite's own site.
    - Note: non-essential scripts should not load before consent when they are in scope.
  - [ ] Add a visible cookie-policy and preferences path in the footer or equivalent global UI.
  - [ ] Document the component as a reference implementation.
    - Note: record what the component does well, where it is intentionally narrow, and what would need to change before treating it as a reusable product surface.
  - Location:
    - likely `app/layout.tsx`
    - likely a new component under `app/components/`
    - likely a small consent config or helper under `lib/`
  - Tests:
    - add component-level tests for banner and preferences state transitions
    - add browser-backed tests for accept, reject, reopen-preferences, and no-non-essential-script-before-consent behavior
    - add at least one verification note in this roadmap pointing to the exact test file once implemented

## Priority 4: Add Pre-Scan Qualification And Platform Awareness

- [ ] Add a lightweight pre-scan qualification flow.
  - Note: this should not become an enterprise questionnaire.

- [ ] Collect minimal context before or during a scan.
  - Note: provider or platform when known, such as Shopify, Webflow, WordPress, Wix, or custom.
  - Note: whether source access exists.
  - Note: whether admin or theme access exists.
  - Note: whether protected areas matter.
  - Note: whether credentials or saved sessions may be available later.

- [ ] Use qualification answers to improve limitation messaging and next-step guidance.

## Priority 5: Improve Outputs And Report Structure

- [ ] Standardize the MVP output contract.
  - Note: overall summary.
  - Note: findings by category.
  - Note: affected pages.
  - Note: severity or priority.
  - Note: plain-language explanation.
  - Note: suggested next steps.
  - Note: coverage and limitations.

- [ ] Group findings more clearly by pattern, category, page, and confidence.

- [ ] Add better issue explanations for both technical and non-technical users.

- [ ] Prompt users for help only when broader access would materially improve the scan.

- [ ] Make real-time scan communication stronger.
  - Note: explain crawl bottlenecks as they happen.
  - Note: explain what user action would improve confidence.

## Priority 6: Build The Pattern Library Alongside The Rule Engine

- [ ] Create a reusable interaction-pattern library.

- [ ] Start with the highest-value patterns.
  - Note: mobile navigation and hamburger menus.
  - Note: dialogs and modal overlays.
  - Note: cookie banners and consent panels.
  - Note: forms and validation flows.
  - Note: accordions and disclosure widgets.

- [ ] For each pattern, track four buckets explicitly.
  - Note: static checks.
  - Note: runtime checks.
  - Note: advisory considerations.
  - Note: manual review boundaries.

- [ ] Use the pattern library to decide what belongs in hosted tools versus desktop or CLI.

## Priority 7: Productization, Billing, And Access Control

- [ ] Connect billing cleanly to the local-first product path.

- [ ] Define entitlement boundaries for free hosted use versus paid local or deeper scans.

- [ ] Implement a practical anti-sharing approach for paid access.
  - Note: preserve the original concern about preventing two people from sharing the same login.
  - Note: this should follow product activation and entitlement design, not precede it.

- [ ] Keep hosted usage intentionally narrow.
  - Note: rate limit by IP.
  - Note: limit pages or scans per day.
  - Note: show headline findings rather than full deep audits.
  - Note: push deeper usage toward local tooling.

## Priority 8: CLI, Codebase Analysis, And Authenticated Crawls

- [ ] Build the CLI on top of the same scan engine.

- [ ] Add codebase analysis mode when source access is available.
  - Note: reserve this for deeper checks not visible from the public site.

- [ ] Add authenticated-scan intake and expectations.
  - Note: document that login flows vary heavily.
  - Note: document MFA, CAPTCHA, and anti-bot limitations.

- [ ] Add guided local browser automation for protected flows.

- [ ] Add saved authenticated session support.

- [ ] Add more automated protected-flow crawling once login patterns become reliable enough.

## Priority 9: Explicitly Parked Or Longer-Term Items

- [ ] Revisit a hosted cookie widget or consent layer only after the audit-first wedge proves useful.
  - Note: this is explicitly not a version 0.1 goal.

- [ ] Revisit broader cloud-hosted infrastructure only if the product direction justifies it.
  - Note: likely costs are engineering maintenance, support, legal pressure, compatibility work, and trust risk.

- [ ] Consider web and mobile app scanning later.

- [ ] Consider Go or Rust only if clear bottlenecks or deeper code-analysis needs justify it.
  - Note: do not rewrite the core prematurely.

## Short Recommended Work Sequence

- [ ] Finish product-boundary and trust-model decisions.
- [ ] Establish internal tests and fixture-based browser verification.
- [ ] Strengthen the core local crawler and rule pipeline.
- [ ] Add axe-style accessibility rules and deepen browser-based accessibility checks.
- [ ] Deepen runtime cookie and privacy verification beyond the first browser audit slice.
- [ ] Add lightweight pre-scan qualification and stronger limitation messaging.
- [ ] Improve reporting, grouping, and confidence language.
- [ ] Build the CLI and then move into codebase-aware and authenticated workflows.

## Original Nuances Worth Preserving

- [ ] Preserve the principle that Olite should never quietly fail or overstate certainty.
- [ ] Preserve the distinction between publicly observable behavior and full compliance.
- [ ] Preserve the local-first path for deeper scanning.
- [ ] Preserve the idea that browser-rendered checks matter because raw HTML is often not enough.
- [ ] Preserve the idea that cookie auditing is a better early wedge than building a consent widget immediately.
- [ ] Preserve the idea that the pattern library should shape both rules and reporting.