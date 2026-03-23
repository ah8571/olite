export type ToolType = "accessibility" | "privacy" | "consent";

export const toolConfig: Record<
  ToolType,
  {
    title: string;
    description: string;
    slug: string;
    sampleChecks: string[];
  }
> = {
  accessibility: {
    title: "Free Accessibility Audit Scanner",
    description:
      "Run a lightweight public-page accessibility audit to surface visible issues like missing alt text, missing labels, and weak page semantics.",
    slug: "accessibility",
    sampleChecks: [
      "Images missing alt text",
      "Form inputs without labels",
      "Missing html lang attribute",
      "Weak heading structure signals"
    ]
  },
  privacy: {
    title: "Free Privacy Compliance Scanner",
    description:
      "Check a public page for privacy-facing signals like policy links, cookie wording, tracking scripts, and common security headers.",
    slug: "privacy",
    sampleChecks: [
      "Privacy policy link detection",
      "Cookie banner wording detection",
      "Google and Meta tracking scripts",
      "Basic security header review"
    ]
  },
  consent: {
    title: "Free Consent Scanner",
    description:
      "Inspect visible forms and communication flows for consent-related signals like checkboxes, email capture patterns, and disclosure wording.",
    slug: "consent",
    sampleChecks: [
      "Email form detection",
      "Consent checkbox presence",
      "Opt-in wording signals",
      "Policy-link detection near forms"
    ]
  }
};

export const toolOrder: ToolType[] = ["accessibility", "privacy", "consent"];