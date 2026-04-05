"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { href: "/", label: "Product" },
  { href: "/tools/cookie-scanner", label: "Cookie Scanner" },
  { href: "/#download", label: "Download" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" }
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navContainerRef = useRef<HTMLDivElement | null>(null);

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!navContainerRef.current) {
        return;
      }

      const target = event.target;

      if (target instanceof Node && !navContainerRef.current.contains(target)) {
        closeMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link className="brand" href="/">
          <span aria-hidden="true" className="brand-mark">
            <span className="brand-mark-outer">O</span>
            <span className="brand-mark-inner" />
          </span>
          <span>Olite</span>
        </Link>
        <div className="site-header-nav" ref={navContainerRef}>
          <button
            aria-controls="primary-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="nav-toggle"
            onClick={() => setIsMenuOpen((open) => !open)}
            type="button"
          >
            <span className="nav-toggle-line" />
            <span className="nav-toggle-line" />
            <span className="nav-toggle-line" />
          </button>
          <nav
            aria-label="Primary"
            className={`nav-links${isMenuOpen ? " is-open" : ""}`}
            id="primary-navigation"
          >
            {navItems.map((item) => (
              <Link className="nav-link" href={item.href} key={item.href} onClick={closeMenu}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}