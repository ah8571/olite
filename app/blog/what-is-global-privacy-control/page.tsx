import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What Is Global Privacy Control?",
  description:
    "A practical explanation of Global Privacy Control, how privacy-oriented browsers use it, and why website teams may need to honor it."
};

export default function WhatIsGlobalPrivacyControlPage() {
  return (
    <section className="page-section">
      <div className="container section-panel blog-content">
        <p className="kicker">Guide</p>
        <h1 className="section-title">What Is Global Privacy Control?</h1>
        <p className="section-copy">
          Global Privacy Control, usually shortened to GPC, is a browser-based privacy preference that can tell a website the user wants an applicable sale or sharing opt-out honored. A common signal looks like <strong>Sec-GPC: 1</strong> in the request (<a href="https://globalprivacycontrol.org/" target="_blank" rel="noreferrer">Global Privacy Control</a>, <a href="https://w3c.github.io/gpc/" target="_blank" rel="noreferrer">W3C GPC Spec</a>).
        </p>

        <h2>What It Means In Practice</h2>
        <p className="section-copy">
          GPC is not just a browser blocking trackers locally. It can also be a message from the browser to the website saying the user has expressed a privacy preference. A website team may need site-side logic to notice that signal and change behavior where the law requires it (<a href="https://globalprivacycontrol.org/" target="_blank" rel="noreferrer">Global Privacy Control</a>).
        </p>

        <h2>Why It Matters For US Privacy Reviews</h2>
        <p className="section-copy">
          In California-style privacy regimes, opt-out preference signals can matter when a business is engaged in sale, sharing, or targeted-advertising behavior that falls under the relevant rules. That means a US-facing site with tracking still may need to think about GPC handling, not just privacy notices and deletion forms (<a href="https://globalprivacycontrol.org/" target="_blank" rel="noreferrer">Global Privacy Control</a>, <a href="https://blog.mozilla.org/netpolicy/2021/10/28/implementing-global-privacy-control/" target="_blank" rel="noreferrer">Mozilla</a>).
        </p>

        <h2>Browser Examples</h2>
        <p className="section-copy">
          Privacy-oriented browsers or tools such as Brave, DuckDuckGo&apos;s browser, and Firefox can expose GPC-style behavior. The exact implementation can vary, but the core idea is the same: the user&apos;s browser communicates a privacy preference rather than relying only on a footer link click (<a href="https://brave.com/web-standards-at-brave/4-global-privacy-control/" target="_blank" rel="noreferrer">Brave</a>, <a href="https://duckduckgo.com/duckduckgo-help-pages/privacy/web-tracking-protections/global-privacy-control-gpc/" target="_blank" rel="noreferrer">DuckDuckGo</a>, <a href="https://blog.mozilla.org/netpolicy/2021/10/28/implementing-global-privacy-control/" target="_blank" rel="noreferrer">Mozilla</a>).
        </p>

        <h2>What Olite Looks For Today</h2>
        <p className="section-copy">
          Today Olite treats GPC mostly as a public signal question. For US-only privacy reviews, the scanner can flag when tracking is present but there is no visible cue that browser-based privacy preference signals or GPC handling are recognized.
        </p>

        <h2>What A Stronger Check Looks Like Later</h2>
        <p className="section-copy">
          The deeper desktop check is not just reading text. It is comparing runtime behavior. That means asking whether trackers, cookies, consent state, or opt-out state actually change when a browser privacy preference is present.
        </p>

        <ul className="bullet-list">
          <li>Do trackers still load the same way?</li>
          <li>Does the site change opt-out state or privacy center state?</li>
          <li>Are cookies or requests reduced?</li>
          <li>Does the UI acknowledge the browser signal?</li>
        </ul>

        <p className="section-copy">
          That is the difference between a public notice check and a real runtime privacy-behavior check.
        </p>

        <div className="hero-actions compact">
          <Link className="button-secondary" href="/tools/privacy">
            Try privacy checker
          </Link>
          <Link className="button-secondary" href="/blog">
            Browse blog
          </Link>
        </div>
      </div>
    </section>
  );
}