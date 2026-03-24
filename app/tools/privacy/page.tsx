import type { Metadata } from "next";

import { ToolPage } from "@/components/tool-page";

export const metadata: Metadata = {
  title: "Free Privacy Checker",
  description:
    "Run a free GDPR-facing privacy standards check for policy links, cookie controls, tracking signals, email capture transparency, and baseline security headers.",
  openGraph: {
    title: "Free Privacy Checker | Olite",
    description:
      "Check a public page for privacy-facing signals like policy visibility, cookie controls, tracking scripts, email capture cues, and basic headers.",
    url: "https://olite.dev/tools/privacy"
  }
};

export default function PrivacyToolPage() {
  return <ToolPage tool="privacy" />;
}