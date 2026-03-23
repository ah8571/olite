import type { Metadata } from "next";
import Link from "next/link";

import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://olite.dev"),
  title: "Olite",
  description:
    "Website compliance scanning for accessibility, privacy, communication consent, and basic security.",
  openGraph: {
    title: "Olite",
    description:
      "Lightweight website compliance scanning with free public tools and a local-first roadmap.",
    url: "https://olite.dev",
    siteName: "Olite"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <div className="container site-header-inner">
              <Link className="brand" href="/">
                <span className="brand-mark">O</span>
                <span>Olite</span>
              </Link>
              <nav className="nav-links" aria-label="Primary">
                <Link className="nav-link" href="/">
                  Product
                </Link>
                <Link className="nav-link" href="/tools/accessibility">
                  Accessibility Audit
                </Link>
                <Link className="nav-link" href="/tools/privacy">
                  Privacy Scanner
                </Link>
                <Link className="nav-link" href="/tools/consent">
                  Consent Scanner
                </Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="site-footer">
            <div className="container footer-grid">
              <div>
                <Link className="brand" href="/">
                  <span className="brand-mark">O</span>
                  <span>Olite</span>
                </Link>
                <p className="muted">
                  Lightweight website compliance scanning focused on accessibility, privacy, communication
                  consent, and basic security.
                </p>
              </div>
              <div>
                <h3 className="footer-heading">Free Tools</h3>
                <div className="footer-tools">
                  <Link className="footer-link" href="/tools/accessibility">
                    Accessibility Audit
                  </Link>
                  <Link className="footer-link" href="/tools/privacy">
                    Privacy Scanner
                  </Link>
                  <Link className="footer-link" href="/tools/consent">
                    Consent Scanner
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}