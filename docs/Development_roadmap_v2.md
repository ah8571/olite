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

- [x] Integrate axe-style rules into the desktop scan pipeline.
  - Note: keep results merged into the same reporting model.

- [x] Consolidate browser-driven accessibility checks around a durable browser harness.
  - Note: Playwright is the preferred long-term foundation.
  - Note: move the existing hidden Electron window checks into the Playwright path so privacy and accessibility runtime checks share one browser engine.

- [ ] Verify rendered DOM state after hydration.

- [ ] Expand keyboard-flow checks.
  - Note: page-level tab order sanity.
  - Note: visible focus and focus progression.
  - Note: reachability of interactive controls without a mouse.
  - Note: early tab progression exists today, but it should be treated as the beginning of a fuller keyboard model rather than the finished implementation.

- [ ] Add stronger basic interaction checks for links, buttons, and controls.
  - Note: vague repeated link text.
  - Note: empty links.
  - Note: empty buttons.
  - Note: non-interactive elements acting like controls without role and keyboard support.

- [ ] Add stronger form-structure checks.
  - Note: required inputs without clear indication.
  - Note: grouped controls without clear legends.

- [ ] Expand interactive pattern verification.
  - Note: menu behavior.
  - Note: modal behavior.
  - Note: popover and disclosure behavior.
  - Note: form validation and focus recovery.
  - Note: dynamic content updates should be checked in a real browser flow because React or other frontend state changes may alter the page after interaction.

- [ ] Keep skip-link checks nuanced.
  - Note: verify target presence when a skip link exists.
  - Note: verify focus or route changes on activation.

- [ ] Add stronger structural-semantics checks.
  - Note: tables missing clear headers where tabular structure is obvious.
  - Note: malformed list structures.
  - Note: duplicated or weak landmark structure beyond the current basics.

- [ ] Add rendered visual checks where browser inspection is required.
  - Note: rendered text contrast.
  - Note: UI control contrast.

- [ ] Widen from single-page accessibility checks into staged multi-step flows where justified.

## Priority 3: Deepen Privacy And Cookie Auditing

- [ ] Strengthen detection of tracking and likely cookie-setting technologies.

- [ ] Strengthen detection of consent UI and visible control types.
  - Note: accept.
  - Note: reject.
  - Note: manage preferences.

- [ ] Verify privacy-policy and cookie-policy reachability.
  - Note: detect visible links or buttons.
  - Note: verify destination pages are reachable.
  - Note: later verify destination content quality, not just URL reachability.

- [ ] Expand runtime pre-consent verification.
  - Note: detect tracker requests before consent.
  - Note: detect tracking cookies before consent.

- [ ] Expand runtime post-interaction verification.
  - Note: reject interaction should be tested explicitly.
  - Note: accept interaction should be tested explicitly.
  - Note: manage-preferences behavior should be tested where visible.

- [ ] Capture evidence showing whether the consent layer is meaningful or merely decorative.

- [x] Add Global Privacy Control checks as runtime behavior, not just text detection.
  - Note: compare request and cookie behavior with and without the browser privacy signal.

- [x] Add route-by-route privacy verification for sites where tracker behavior changes beyond the landing page.
  - Note: follow a few same-origin routes so consent state can be checked beyond the landing page.

- [ ] Keep the cookie-audit wedge clear.
  - Note: near-term opportunity is auditing cookie compliance behavior.
  - Note: do not jump straight into building a hosted consent widget.

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