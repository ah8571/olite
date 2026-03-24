import type { Metadata } from "next";

import { ToolPage } from "@/components/tool-page";

export const metadata: Metadata = {
  title: "Free Privacy Standards Checker | Olite",
  description:
    "Run a free GDPR-facing privacy standards check for policy links, cookie wording, tracking signals, and baseline security headers.",
  openGraph: {
    title: "Free Privacy Standards Checker | Olite",
    description:
      "Check a public page for privacy-facing signals like policy visibility, cookie wording, tracking scripts, and basic headers.",
    url: "https://olite.dev/tools/privacy"
  }
};

export default function PrivacyToolPage() {
  return <ToolPage tool="privacy" />;
}