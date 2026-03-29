import Link from "next/link";

import { blogPages } from "@/lib/blog-pages";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand-column">
          <Link className="brand" href="/">
            <span aria-hidden="true" className="brand-mark">
              <span className="brand-mark-outer">O</span>
              <span className="brand-mark-inner" />
            </span>
            <span>Olite</span>
          </Link>
          <p className="muted">
            A lightweight verification scanner for accessibility and privacy signals on public websites.
          </p>
          <div className="footer-disclosure">
            <p className="kicker footer-heading-kicker">Disclosure</p>
            <p className="footer-disclosure-title">Automation-oriented verification for public websites.</p>
            <p className="muted footer-disclosure-copy">
              Starts from one public URL and can discover same-domain pages automatically in the desktop app. Current checks focus on markup, public-page signals, and lightweight crawl evidence. Authenticated flows, richer JavaScript interaction automation, network-level consent verification, and source-aware rules are not fully covered in this first pass.
            </p>
          </div>
        </div>
        <div className="footer-column">
          <h3 className="footer-heading">Product</h3>
          <div className="footer-link-list">
            <Link className="footer-link" href="/pricing">
              Pricing
            </Link>
            <Link className="footer-link" href="/tools/accessibility">
              Free Accessibility Scanner
            </Link>
            <Link className="footer-link" href="/tools/privacy">
              Free Privacy Checker
            </Link>
            <Link className="footer-link" href="https://github.com/ah8571/olite">
              Open source on GitHub
            </Link>
          </div>
        </div>
        <div className="footer-column">
          <h3 className="footer-heading">Resources</h3>
          <div className="footer-link-list">
            <Link className="footer-link" href="/blog">
              Blog
            </Link>
            {blogPages.map((page) => (
              <Link className="footer-link" href={page.href} key={page.href}>
                {page.shortTitle}
              </Link>
            ))}
          </div>
        </div>
        <div className="footer-column">
          <h3 className="footer-heading">Support</h3>
          <div className="footer-link-list">
            <Link className="footer-link" href="https://github.com/ah8571/olite#readme">
              Documentation
            </Link>
            <Link className="footer-link" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="footer-link" href="/terms">
              Terms and Conditions
            </Link>
            <Link className="footer-link" href="mailto:hello@olite.dev?subject=Olite%20support">
              hello@olite.dev
            </Link>
            <Link className="footer-link" href="https://github.com/ah8571/olite/issues">
              GitHub issues
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}