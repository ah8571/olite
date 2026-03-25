# Olite Interaction Pattern Library

## Table Of Contents

- [Purpose](#purpose)
- [How To Use This Document](#how-to-use-this-document)
- [Automation Classification](#automation-classification)
- [Pattern Review Template](#pattern-review-template)
- [Initial Pattern Set](#initial-pattern-set)
- [Mobile Navigation And Hamburger Menus](#mobile-navigation-and-hamburger-menus)
- [Dialogs And Modal Overlays](#dialogs-and-modal-overlays)
- [Cookie Banners And Consent Panels](#cookie-banners-and-consent-panels)
- [Forms And Validation Flows](#forms-and-validation-flows)
- [Accordions And Disclosure Widgets](#accordions-and-disclosure-widgets)
- [Tabs And Segmented Panels](#tabs-and-segmented-panels)
- [Carousels And Sliders](#carousels-and-sliders)
- [Search Overlays And Command Surfaces](#search-overlays-and-command-surfaces)
- [What Olite Should Automate First](#what-olite-should-automate-first)

## Purpose

This document defines a practical pattern library for Olite's automation-oriented review model.

The goal is to break recurring website interface patterns into:

- expected user behavior
- accessibility and privacy best practices
- high-confidence automated checks
- lower-confidence automated heuristics
- checks that still require human review

This should help Olite avoid vague claims like "the site is accessible" and instead evaluate concrete interaction patterns with clearer evidence.

## How To Use This Document

Olite should use this document as a rule-design and review rubric.

For each pattern:

- define the user goal
- define the expected accessible behavior
- define what the DOM alone can verify
- define what browser-driven interaction can verify
- define what still needs human judgment

This pattern-by-pattern method should drive:

- hosted scanner rule selection
- desktop automation priorities
- CLI rule expansion
- future report grouping and issue explanations

## Automation Classification

Each pattern should be classified into one or more of these buckets.

### A. High-Confidence Static Checks

Checks that can be verified from markup, DOM structure, attributes, or obvious semantics.

Examples:

- button versus non-button trigger
- missing accessible name
- missing `aria-expanded` on a collapsible trigger where that pattern is clear
- empty links or buttons

### B. High-Confidence Runtime Checks

Checks that can be verified by rendering the page and interacting with it in a browser harness.

Examples:

- whether focus moves into an opened dialog
- whether menu items become reachable after activation
- whether focus returns to the trigger after closing
- whether validation errors are exposed after submission

### C. Advisory Heuristics

Checks that may be useful but should be framed as lower-confidence.

Examples:

- likely decorative versus informative icon-only controls
- likely weak menu labeling
- likely confusing grouping of links inside a mobile drawer

### D. Human Review Required

Checks that still need manual review or assistive-technology verification.

Examples:

- whether menu wording is actually understandable
- whether a dynamic announcement is useful rather than merely present
- whether a flow feels predictable in VoiceOver or TalkBack across the full experience

## Pattern Review Template

Each pattern should eventually follow the same structure.

### User Goal

What the user is trying to do.

### Good Implementation Signals

What a solid implementation usually includes.

### Common Failure Modes

What commonly goes wrong.

### Static Checks

What Olite can verify from markup or DOM alone.

### Runtime Checks

What Olite can verify with Playwright-backed interaction.

### Manual Review Notes

What should remain advisory or manual.

## Initial Pattern Set

Olite should start with a small but high-value pattern library.

Recommended first set:

- mobile navigation and hamburger menus
- dialogs and modal overlays
- cookie banners and consent panels
- forms and validation flows
- accordions and disclosure widgets
- tabs and segmented panels
- carousels and sliders
- search overlays and command surfaces

These patterns are common, user-facing, and often tied to real accessibility or privacy failures.

## Mobile Navigation And Hamburger Menus

### User Goal

Find site navigation, understand whether it is open or closed, and move through menu items predictably.

### Good Implementation Signals

- menu trigger is a real `button`
- trigger has a clear accessible name such as `Open navigation menu`
- trigger exposes open and closed state
- collapsed menu items are not reachable when the menu is closed
- opened menu items become reachable in a sensible order
- menu closes predictably on selection, dismissal, or escape routes

### Common Failure Modes

- icon trigger implemented on a `div` or `span`
- menu trigger has no accessible name
- menu visually opens but state is not exposed
- hidden links remain focusable while collapsed
- menu opens but screen-reader order becomes confusing
- close action is inconsistent or hard to find

### Static Checks

- trigger element is a `button`
- trigger has a non-empty accessible name
- trigger uses `aria-expanded` when it controls a collapsible menu
- collapsed menu uses hidden, inert, or equivalent non-interactive treatment
- menu links have accessible names

### Runtime Checks

- activating the trigger reveals menu items
- hidden links are not keyboard reachable before opening
- first menu item becomes reachable after opening
- dismiss action closes the menu and removes closed-state items from interaction
- focus returns to a sensible element after closing

### Manual Review Notes

- whether the label is understandable in context
- whether the reading order feels natural in VoiceOver or TalkBack
- whether the menu density is reasonable on a small screen

## Dialogs And Modal Overlays

### User Goal

Respond to a blocking prompt or complete a focused task without losing orientation.

### Good Implementation Signals

- dialog is clearly identified as a dialog
- focus moves into the dialog when it opens
- background content is not accidentally reachable while open
- dismiss controls are easy to find
- focus returns sensibly when the dialog closes

### Common Failure Modes

- focus remains behind the dialog
- dialog has no clear title or purpose
- escape or close controls do not work consistently
- screen-reader users can still navigate background controls while blocked visually

### Static Checks

- dialog container has appropriate semantics
- close button has an accessible name
- dialog title and description are programmatically associated where relevant

### Runtime Checks

- opening moves focus into the dialog
- tab order stays within the dialog when appropriate
- closing returns focus to the invoking control

### Manual Review Notes

- whether the dialog content order is understandable
- whether urgency and consequences are communicated clearly

## Cookie Banners And Consent Panels

### User Goal

Understand tracking choices and make a real consent decision without coercion.

### Good Implementation Signals

- banner appears when non-essential tracking is relevant
- accept and reject or equivalent controls are both present
- manage-preferences path is visible when granularity is offered
- consent choices are understandable and not buried

### Common Failure Modes

- accept-only banner
- reject path hidden or visually de-emphasized beyond reason
- trackers fire before consent despite a banner being shown
- banner disappears without preserving meaningful choice

### Static Checks

- accept control detected
- reject or manage control detected
- banner text contains consent or cookie language
- policy links are present

### Runtime Checks

- banner appears after page load where trackers are present
- banner controls are keyboard reachable
- non-essential network activity can be compared before and after consent actions

### Manual Review Notes

- whether wording is manipulative or confusing
- whether choice architecture feels fair

## Forms And Validation Flows

### User Goal

Enter information, understand requirements, correct errors, and submit successfully.

### Good Implementation Signals

- each control has a clear label
- required state is conveyed clearly
- errors are programmatically exposed and easy to find
- focus and reading order after validation are predictable

### Common Failure Modes

- placeholder-only labeling
- errors shown only by color
- failed submission gives no clear feedback
- focus stays in an unhelpful position after validation

### Static Checks

- inputs have labels
- grouped controls use legends when needed
- required fields expose required state
- error containers expose useful semantics where present

### Runtime Checks

- invalid submission reveals errors
- focus moves to a useful target after invalid submission
- error messaging is associated with the relevant field

### Manual Review Notes

- whether the instructions are understandable
- whether the error language is actionable rather than vague

## Accordions And Disclosure Widgets

### User Goal

Expand and collapse sections without losing context.

### Good Implementation Signals

- disclosure trigger is a button
- expanded and collapsed state is exposed
- hidden content is not reachable while collapsed

### Common Failure Modes

- clickable heading with no button semantics
- multiple sections open or close unpredictably
- collapsed content remains reachable

### Static Checks

- trigger semantics
- accessible name
- expanded state exposure

### Runtime Checks

- content visibility changes after activation
- closed sections are not keyboard reachable

### Manual Review Notes

- whether the section titles are descriptive enough

## Tabs And Segmented Panels

### User Goal

Move between grouped panels efficiently and understand the active section.

### Good Implementation Signals

- active tab is clearly identified
- tabs are operable by keyboard
- panel content updates predictably

### Common Failure Modes

- selected state not exposed
- inactive panels remain mixed into reading order
- tab list behaves like a set of generic links with no active-state semantics

### Static Checks

- tab and panel relationships are exposed where the pattern is explicit
- selected state exists

### Runtime Checks

- arrow-key or activation behavior works as expected for the chosen pattern
- panel change updates reachable content

### Manual Review Notes

- whether the distinction between tabs is understandable

## Carousels And Sliders

### User Goal

Review rotating or paged content without losing control.

### Good Implementation Signals

- previous and next controls are clear
- auto-rotation can be paused when present
- slide changes are understandable and not disorienting

### Common Failure Modes

- auto-rotation with no pause
- unlabeled controls
- hidden slides still exposed in confusing ways

### Static Checks

- previous and next controls have accessible names
- pause control exists when autoplay is present

### Runtime Checks

- controls change visible slide content
- autoplay pauses when the user interacts where expected

### Manual Review Notes

- whether motion is distracting or cognitively heavy

## Search Overlays And Command Surfaces

### User Goal

Open a search or command surface quickly, perform a query, and return to the page without losing context.

### Good Implementation Signals

- launcher control is labeled clearly
- focus moves to the search input when opened
- results update in a predictable way
- close behavior is obvious

### Common Failure Modes

- overlay opens but focus remains behind it
- search input lacks a label
- dismissal is possible only with precise visual interaction

### Static Checks

- launcher has accessible name
- search field has label or accessible name

### Runtime Checks

- opening moves focus to the input
- closing restores orientation sensibly
- results become reachable after query input

### Manual Review Notes

- whether result naming and grouping are understandable

## What Olite Should Automate First

The first pattern-library automation priorities should be the checks that are both common and defensible.

Recommended order:

1. hamburger menu trigger semantics and open-state behavior
2. modal focus-entry and focus-return behavior
3. cookie-banner accept and reject path detection
4. form labels, required-state cues, and invalid-submission handling
5. disclosure-widget trigger semantics and collapsed-state reachability

This keeps the first pattern-based automation tied to real website problems while avoiding weaker, overly interpretive checks too early.