export type BlogPage = {
  href: string;
  shortTitle: string;
  title: string;
  description: string;
  category: "review" | "comparison" | "best-of" | "guide";
};

export const blogPages: BlogPage[] = [
  {
    href: "/blog/review-of-siteimprove",
    shortTitle: "Review of Siteimprove",
    title: "Review of Siteimprove",
    description:
      "A practical look at where Siteimprove appears strong, where it feels heavier, and how Olite can position against it.",
    category: "review"
  },
  {
    href: "/blog/review-of-cookiebot",
    shortTitle: "Review of Cookiebot",
    title: "Review of Cookiebot",
    description:
      "A practical look at Cookiebot as a privacy and cookie-consent tool and where Olite differs.",
    category: "review"
  },
  {
    href: "/blog/siteimprove-vs-olite",
    shortTitle: "Siteimprove vs Olite",
    title: "Siteimprove vs Olite",
    description:
      "A decision page comparing broader governance tooling with Olite's lighter accessibility and privacy scanning direction.",
    category: "comparison"
  },
  {
    href: "/blog/cookiebot-vs-olite",
    shortTitle: "Cookiebot vs Olite",
    title: "Cookiebot vs Olite",
    description:
      "A decision page comparing cookie-consent tooling with Olite's broader privacy standards entry point.",
    category: "comparison"
  },
  {
    href: "/blog/best-accessibility-tools",
    shortTitle: "Best Accessibility Tools",
    title: "Best Accessibility Tools For Websites",
    description:
      "A practical guide to picking an accessibility tool based on whether you need quick scans, developer checks, or governance.",
    category: "best-of"
  },
  {
    href: "/blog/best-privacy-compliance-tools",
    shortTitle: "Best Privacy Tools",
    title: "Best Privacy Compliance Tools For Websites",
    description:
      "A practical guide to privacy tooling for websites, from cookie-consent products to lighter signal scanners.",
    category: "best-of"
  },
  {
    href: "/blog/what-is-global-privacy-control",
    shortTitle: "What Is GPC?",
    title: "What Is Global Privacy Control?",
    description:
      "A practical explanation of Global Privacy Control, how privacy-oriented browsers send it, and why website teams may need to respond.",
    category: "guide"
  },
  {
    href: "/blog/cookie-audit",
    shortTitle: "Cookie Audit Tool",
    title: "Cookie Audit Tool",
    description:
      "A practical framing page for Olite's cookie-audit direction: what can be verified now, what runtime consent checks add, and why audit-first matters.",
    category: "guide"
  },
  {
    href: "/blog/what-is-at-approximation",
    shortTitle: "What Is AT Approximation?",
    title: "What Is AT Approximation In Accessibility Testing?",
    description:
      "A practical explanation of assistive-technology approximation, how it relates to screen readers, and where automation stops.",
    category: "guide"
  }
];