import type { Metadata } from "next";

import "@/app/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://olite.dev"),
  title: "Olite",
  description:
    "Accessibility and privacy standards scanning for public websites, with free tools and a local-first roadmap.",
  openGraph: {
    title: "Olite",
    description:
      "Free accessibility and privacy standards checks for public websites, with deeper local-first workflows planned later.",
    url: "https://olite.dev",
    siteName: "Olite"
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