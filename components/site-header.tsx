import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link className="brand" href="/">
          <span aria-hidden="true" className="brand-mark">
            <span className="brand-mark-outer">O</span>
            <span className="brand-mark-inner">o</span>
          </span>
          <span>Olite</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link className="nav-link" href="/">
            Product
          </Link>
          <Link className="nav-link" href="/#download">
            Download
          </Link>
          <Link className="nav-link" href="/pricing">
            Pricing
          </Link>
          <Link className="nav-link" href="/tools/accessibility">
            Accessibility Scanner
          </Link>
          <Link className="nav-link" href="/tools/privacy">
            Privacy Checker
          </Link>
          <Link className="nav-link" href="/blog">
            Blog
          </Link>
        </nav>
      </div>
    </header>
  );
}