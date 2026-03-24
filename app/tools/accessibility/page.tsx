import type { Metadata } from "next";

import { ToolPage } from "@/components/tool-page";

export const metadata: Metadata = {
  title: "Free Accessibility Scanner",
  description:
    "Run a free public-page accessibility scan for missing alt text, labels, page titles, accessible names, iframe titles, and other visible WCAG warning signs.",
  openGraph: {
    title: "Free Accessibility Scanner | Olite",
    description:
      "Check a public page for visible accessibility warning signs like missing labels, empty controls, and missing titles before moving into a fuller audit.",
    url: "https://olite.dev/tools/accessibility"
  }
};

export default function AccessibilityToolPage() {
  return <ToolPage tool="accessibility" />;
}