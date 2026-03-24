import Link from "next/link";

import { blogPages } from "@/lib/blog-pages";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="brand" href="/">
            <span className="brand-mark">O</span>
            <span>Olite</span>
          </Link>
          <p className="muted">
            A lightweight verification scanner for accessibility and privacy signals on public websites.
          </p>
        </div>
        <div>
          <h3 className="footer-heading">Explore</h3>
          <div className="footer-tools">
            <Link className="footer-link" href="/pricing">
              Pricing
            </Link>
            <Link className="footer-link" href="/tools/accessibility">
              Accessibility Scanner
            </Link>
            <Link className="footer-link" href="/tools/privacy">
              Privacy Checker
            </Link>
            <Link className="footer-link" href="/blog">
              Blog
            </Link>
            {blogPages.slice(0, 2).map((page) => (
              <Link className="footer-link" href={page.href} key={page.href}>
                {page.shortTitle}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}