import type { Metadata } from "next";
import { ToolPage } from "@/components/tool-page";

export const metadata: Metadata = {
  title: "Free Cookie Scanner",
  description:
    "Scan a public page for cookie-policy visibility, banner cues, reject and manage controls, and obvious tracking signals before deeper consent verification.",
  openGraph: {
    title: "Free Cookie Scanner | Olite",
    description:
      "Check a public page for cookie-policy links, cookie-banner controls, and obvious tracking signals with Olite's first cookie-audit prototype.",
    url: "https://olite.dev/tools/cookie-scanner"
  }
};

export default function CookieScannerPage() {
  return <ToolPage tool="cookie" />;
}