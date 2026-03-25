import type { Metadata } from "next";

import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://olite.dev"),
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  },
  title: {
    default: "Accessibility and Privacy Website Scanner | Olite",
    template: "%s | Olite"
  },
  description:
    "Accessibility and privacy standards scanning for public websites, with free tools for quick verification and a local-first roadmap for deeper checks.",
  openGraph: {
    title: "Olite",
    description:
      "Free accessibility and privacy standards checks for public websites, with deeper local-first workflows planned later.",
    url: "https://olite.dev",
    siteName: "Olite",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}