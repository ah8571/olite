export type ToolType = "accessibility" | "privacy";

export const toolConfig: Record<
  ToolType,
  {
    title: string;
    description: string;
    slug: string;
    eyebrow: string;
    ctaLabel: string;
    scoreLabel: string;
    sampleChecks: string[];
    bestFor: string[];
    resultGuidance: string[];
  }
> = {
  accessibility: {
    title: "Free Accessibility Scanner",
    description:
      "Run a lightweight public-page accessibility scan to surface visible WCAG warning signs like missing alt text, missing labels, and missing document language.",
    slug: "accessibility",
    eyebrow: "Free Accessibility Scanner",
    ctaLabel: "Run accessibility scan",
    scoreLabel: "Accessibility signal score",
    sampleChecks: [
      "Images missing alt text",
      "Form inputs without labels",
      "Missing html lang attribute",
      "Weak heading structure signals"
    ],
    bestFor: [
      "Agencies reviewing client sites before handoff",
      "Teams checking obvious accessibility gaps before launch",
      "Founders who need a fast first pass before deeper WCAG testing"
    ],
    resultGuidance: [
      "Treat this as an early warning scan, not a full accessibility audit.",
      "Manual keyboard testing, contrast review, and screen reader checks are still required.",
      "Use the output to prioritize which templates or forms need deeper remediation."
    ]
  },
  privacy: {
    title: "Free Privacy Standards Checker",
    description:
      "Check a public page for GDPR and privacy-facing signals like policy links, cookie wording, tracking scripts, and basic security headers.",
    slug: "privacy",
    eyebrow: "Free Privacy Standards Checker",
    ctaLabel: "Run privacy check",
    scoreLabel: "Privacy standards score",
    sampleChecks: [
      "Privacy policy link detection",
      "Cookie banner wording detection",
      "Google and Meta tracking scripts",
      "Basic security header review"
    ],
    bestFor: [
      "Teams validating public GDPR-facing website signals",
      "Marketers checking if tracking appears before visible consent messaging",
      "Agencies preparing a quick privacy review for prospects or clients"
    ],
    resultGuidance: [
      "This is a public-page standards check, not legal advice and not a formal GDPR opinion.",
      "Cookie behavior inside JavaScript flows or consent platforms may need manual verification.",
      "Use the findings to tighten policy visibility, consent messaging, and tracking setup."
    ]
  }
};

export const toolOrder: ToolType[] = ["accessibility", "privacy"];