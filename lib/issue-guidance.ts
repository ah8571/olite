import type { HostedToolScanResult, ScanIssue, SiteScanResult } from "./scan/types";

function fallbackSuggestedFix(): string {
  return "Review the affected element or behavior in context and adjust the markup or runtime implementation so the user flow stays understandable to browsers, assistive technologies, and keyboard users.";
}

export function getIssueSuggestedFix(layer: ScanIssue["layer"], title: string): string {
  if (layer === "accessibility") {
    if (title === "Missing page title") return "Add a concise, descriptive title element so browsers and assistive technologies can identify the page correctly.";
    if (title === "Missing html lang attribute") return "Add a valid language attribute to the html element so assistive technologies can interpret the page correctly.";
    if (title === "Images missing alt text") return "Review each flagged image and add meaningful alt text for informative images. Use empty alt text only for purely decorative images.";
    if (title === "Inputs missing visible or programmatic labels") return "Ensure each form control has a visible label, or a reliable programmatic label through aria-label or aria-labelledby when appropriate.";
    if (title === "Buttons without accessible names") return "Give each button a meaningful accessible name through visible text, aria-label, or another reliable naming pattern that matches the control's purpose.";
    if (title === "Links without accessible names") return "Make sure each link exposes a readable name through link text, linked image alt text, or an explicit aria-label when needed.";
    if (title === "Repeated vague link text may not describe destinations") return "Replace vague repeated link labels like 'Read more' with destination-specific text so each link still makes sense when read out of context.";
    if (title === "Non-interactive elements appear to act like controls") return "Use a native interactive element when possible. If a custom control is necessary, add the correct role, keyboard support, focusability, and accessible naming.";
    if (title === "Tables may be missing clear headers") return "Add th cells and appropriate scope or header associations when the content is genuinely tabular, or switch to simpler non-table markup if it is only visual layout.";
    if (title === "Malformed list structure detected") return "Make sure ul and ol elements contain li children directly so list navigation stays predictable for assistive technologies.";
    if (title === "Duplicate landmark structure detected") return "Reduce duplicate main, banner, or contentinfo landmarks unless multiple regions are genuinely necessary and clearly distinguished.";
    if (title === "Iframes missing title attributes") return "Add a short, descriptive title attribute to each iframe so users understand the embedded content before entering it.";
    if (title === "Potential focus order override from positive tabindex") return "Prefer the natural DOM tab order unless there is a strong reason to override it. Positive tabindex values often create fragile keyboard navigation.";
    if (title === "Focusable elements hidden from view after render") return "Prevent hidden or offscreen elements from remaining keyboard focusable, or keep them visibly available when they are intended to be interactive.";
    if (title === "Rendered skip link target missing") return "Ensure the skip link target exists after the page finishes rendering and hydration, and keep its target id stable across client-side updates.";
    if (title === "Skip link did not change focus or route after activation") return "Update the skip link so activation moves focus to the intended main-content target or changes the location as expected without being blocked by client-side handlers.";
    if (title === "Hydration appears to remove key semantic structure") return "Keep key landmarks, headings, and skip-link targets present after hydration so client-side rendering does not remove structure assistive technologies rely on.";
    if (title === "Accessibility tree may not expose the primary page structure") return "Review the browser accessibility tree after render and remove markup or ARIA patterns that suppress the main landmark or primary heading from assistive-technology navigation.";
    if (title === "Critical controls may lack accessible names after render") return "Keep visible links, buttons, and form controls programmatically named after render and hydration, using stable text, labels, aria-label, or aria-labelledby relationships.";
    if (title === "Critical controls may expose weak accessible names after render") return "Replace weak generic names like 'Read more' or 'Open' with action-specific names that still make sense when announced away from surrounding visual context.";
    if (title === "Validation feedback may not be announced clearly after interaction") return "When validation fails, move focus to the affected field or summary, and expose a readable alert, status, or aria-live announcement so the error is surfaced after interaction.";
    if (title === "Dialog interaction may not move and return focus predictably") return "When a dialog opens, move focus into it, and when it closes, return focus to the invoking control so keyboard and screen-reader users keep their place.";
    if (title === "Disclosure interaction may not expose state predictably") return "Keep disclosure triggers synchronized with the controlled region by updating aria-expanded and revealing the controlled content when the trigger is activated.";
    if (title === "Required form controls may lack a clear required indicator") return "Expose required state through visible label text or nearby guidance so users can tell which fields are mandatory before they submit the form.";
    if (title === "Grouped form controls missing a clear legend") return "Wrap related radio buttons or checkboxes in a fieldset with a readable legend so the group purpose is announced clearly.";
    if (title === "Keyboard tab progression could not be established after render") return "Review the first keyboard steps after load and make sure an obvious interactive control receives focus when a user starts tabbing through the page.";
    if (title === "Keyboard focus reached an offscreen or non-visible target") return "Keep focusable targets visible when reached by keyboard, or remove them from tab order until they are meant to be shown.";
    if (title === "Focused controls may lack a clear visible focus indicator") return "Add a strong visible focus style to interactive controls so keyboard users can see which element is currently focused.";
    if (title === "Keyboard focus appears stalled during early tab progression") return "Review whether focus is looping, being trapped, or repeatedly redirected during the first tab steps, and restore a predictable progression order.";
  }

  if (layer === "privacy" || layer === "consent" || layer === "security") {
    if (title === "Tracking signals without visible cookie wording") return "Review whether tracking loads before consent and make the cookie or consent message clearer on the page.";
    if (title === "No obvious privacy or cookie policy links detected") return "Add clearly visible privacy and cookie-policy links in the header, footer, or near form capture points.";
    if (title === "Cookie banner without obvious reject or manage controls") return "Add a clear reject-all option or a visible manage-preferences path so the banner does not read like accept-only consent.";
    if (title === "Email capture without visible privacy cues") return "Place a privacy link or clear notice near the email form so visitors can understand how their data will be used before submitting.";
    if (title === "Limited security header coverage") return "Check server or CDN configuration for headers like content-security-policy, referrer-policy, and strict-transport-security.";
    if (title === "No obvious privacy rights request path detected") return "Expose an obvious privacy-rights or data-request path so visitors can find deletion, access, correction, or consumer-rights workflows more easily.";
    if (title === "No obvious sale or sharing opt-out path detected") return "If sale or sharing rules may apply, expose a visible 'Do Not Sell or Share' or equivalent privacy-choices path.";
    if (title === "Limited visible US privacy rights cues") return "Make sure the public privacy flow clearly surfaces access, correction, and deletion request options instead of burying them in a general notice.";
    if (title === "No visible Global Privacy Control cue detected") return "If US opt-out workflows are relevant, clarify whether and how browser-based opt-out signals such as GPC are honored.";
    if (title === "Consent UI does not expose an obvious reject control") return "Add a visible reject-all or decline option alongside accept so the consent choice is real and not effectively accept-only.";
    if (title === "Consent UI does not expose an obvious manage-preferences control") return "Add a visible manage-preferences or settings path when consent choices are granular, so users can review and change categories.";
    if (title === "Tracking requests fired before consent interaction") return "Delay non-essential tracker requests until consent is granted, and verify that marketing or analytics libraries do not initialize on first load.";
    if (title === "Tracking cookies set before consent interaction") return "Block non-essential cookies until consent is granted and verify that third-party or analytics scripts are not setting them on initial load.";
    if (title === "Tracking requests continued after reject interaction") return "Make the reject path disable non-essential trackers immediately and confirm the page stops emitting those requests after the refusal is recorded.";
    if (title === "Tracking cookies persisted after reject interaction") return "Clear or avoid non-essential cookies after reject and confirm the consent choice is enforced across the current page state and nearby routes.";
    if (title === "Tracking behavior did not change when GPC was simulated") return "Review whether the site should honor Global Privacy Control and, if so, make tracker and cookie behavior change when the browser opt-out signal is present.";
  }

  return fallbackSuggestedFix();
}

function withSuggestedFix<T extends Pick<ScanIssue, "layer" | "title"> & { suggestedFix?: string }>(issue: T): T & { suggestedFix: string } {
  return {
    ...issue,
    suggestedFix: issue.suggestedFix || getIssueSuggestedFix(issue.layer, issue.title)
  };
}

export function applyIssueGuidanceToSiteResult(result: SiteScanResult): SiteScanResult {
  const pages = result.pages.map((page) => ({
    ...page,
    issues: page.issues.map((issue) => withSuggestedFix(issue))
  }));

  return {
    ...result,
    pages,
    issuesByLayer: {
      accessibility: pages.flatMap((page) => page.issues.filter((issue) => issue.layer === "accessibility")),
      privacy: pages.flatMap((page) => page.issues.filter((issue) => issue.layer === "privacy")),
      consent: pages.flatMap((page) => page.issues.filter((issue) => issue.layer === "consent")),
      security: pages.flatMap((page) => page.issues.filter((issue) => issue.layer === "security"))
    }
  };
}

export function applyIssueGuidanceToHostedToolResult(result: HostedToolScanResult): HostedToolScanResult {
  return {
    ...result,
    issues: result.issues.map((issue) => withSuggestedFix(issue))
  };
}