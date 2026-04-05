export type ToolType = "accessibility" | "cookie" | "privacy";

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
      "Run a lightweight public-page accessibility scan to surface visible WCAG warning signs like missing alt text, missing labels, missing page titles, unlabeled controls, and missing iframe titles.",
    slug: "accessibility",
    eyebrow: "Free Accessibility Scanner",
    ctaLabel: "Run accessibility scan",
    scoreLabel: "Accessibility signal score",
    sampleChecks: [
      "Images missing alt text",
      "Form inputs without labels",
      "Buttons or links without accessible names",
      "Missing page title or iframe title"
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
  cookie: {
    title: "Free Cookie Scanner",
    description:
      "Check a public page for cookie-policy visibility, banner wording, reject and manage-preferences cues, obvious revisit-settings paths, and tracking signals that affect cookie compliance review.",
    slug: "cookie-scanner",
    eyebrow: "Free Cookie Scanner",
    ctaLabel: "Run cookie scan",
    scoreLabel: "Cookie audit score",
    sampleChecks: [
      "Cookie policy link detection",
      "Cookie banner control detection",
      "Tracking script detection",
      "Later cookie-settings path detection"
    ],
    bestFor: [
      "Teams checking whether a site looks accept-only before a deeper privacy review",
      "Agencies preparing fast cookie-consent findings for prospects or clients",
      "Founders who need a practical first pass on public cookie-policy and banner signals"
    ],
    resultGuidance: [
      "Treat this as a public-page cookie audit, not a full consent-platform verification.",
      "The strongest cookie findings still come from runtime browser checks in the desktop workflow.",
      "Use the result to tighten cookie-policy visibility, reject paths, and later preference access."
    ]
  },
  privacy: {
    title: "Free Privacy Checker",
    description:
      "Check a public page for GDPR and privacy-facing signals like policy links, cookie controls, tracking scripts, email capture transparency, and basic security headers.",
    slug: "privacy",
    eyebrow: "Free Privacy Checker",
    ctaLabel: "Run privacy check",
    scoreLabel: "Privacy standards score",
    sampleChecks: [
      "Privacy policy link detection",
      "Cookie banner control detection",
      "Modern tracking script detection",
      "Email capture without privacy cues"
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

export const toolOrder: ToolType[] = ["accessibility", "cookie", "privacy"];