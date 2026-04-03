import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Audit Tool",
  description:
    "A public overview of Olite's cookie audit direction: banner detection, policy visibility, tracking signals, and later runtime consent verification.",
  openGraph: {
    title: "Cookie Audit Tool | Olite",
    description:
      "Explore Olite's cookie audit direction for public-page cookie signals, consent controls, and future runtime verification.",
    url: "https://olite.dev/blog/cookie-audit"
  }
};

const currentChecks = [
  "Tracking signals and likely cookie-setting technologies detected on the page",
  "Cookie banner or cookie wording presence",
  "Visible reject-all or manage-preferences controls where wording is present",
  "Privacy policy and cookie policy visibility",
  "Email capture with weak privacy or consent cues"
];

const nextChecks = [
  "Whether trackers appear to fire before consent is granted",
  "Whether reject or manage actions visibly change runtime behavior",
  "Whether consent choices persist correctly across refreshes and routes",
  "Whether GPC or browser-based opt-out cues align with page behavior",
  "Whether common CMS or plugin cookie widgets appear misconfigured"
];

export default function CookieAuditPage() {
  return (
    <>
      <section className="page-section">
        <div className="container split-grid">
          <div>
            <p className="kicker">Cookie Audit Tool</p>
            <h1 className="section-title">A practical path into cookie and consent verification.</h1>
            <p className="section-copy">
              The page is making one main argument: the real opportunity is not merely detecting that a
              cookie banner exists, but helping teams verify whether the visible cookie controls, privacy
              links, and tracking behavior appear to line up in a way that respects user choice.
            </p>
            <p className="section-copy">
              It positions Olite as audit-first. In other words: start by verifying what is observable on a
              real site, then expand into deeper runtime consent checks later rather than pretending to be a
              full consent-management platform on day one.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/#scanner">
                Try the homepage scanner
              </Link>
              <Link className="button-secondary" href="/tools/privacy">
                Open the privacy checker
              </Link>
            </div>
          </div>
          <div className="section-panel">
            <p className="kicker">Why This Matters</p>
            <h2>People often do not know whether the cookie setup is actually working.</h2>
            <ul className="bullet-list">
              <li>Prebuilt sites often layer multiple plugins, tags, and consent tools together</li>
              <li>A visible banner does not prove that tracking is properly restrained</li>
              <li>Teams need something between vague legal advice and a full enterprise CMP</li>
              <li>Audit-first positioning is a stronger early wedge than trying to replace Cookiebot immediately</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container split-grid">
          <div className="section-panel">
            <p className="kicker">What Olite Can Isolate Now</p>
            <h2>Current cookie and privacy audit signals</h2>
            <ul className="bullet-list">
              {currentChecks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="section-copy">
              This section says the current product can already inspect the visible layer of cookie and
              privacy behavior: controls, wording, policy visibility, and obvious tracking signals.
            </p>
          </div>
          <div className="section-panel">
            <p className="kicker">What Runtime Checks Could Add</p>
            <h2>The next step is verifying behavior, not just presence.</h2>
            <ul className="bullet-list">
              {nextChecks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="section-copy">
              This section is the bridge to the future roadmap: once the page hydrates and a user interacts
              with consent controls, Olite should verify whether the widget actually changes tracking logic
              in a meaningful way.
            </p>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container split-grid">
          <div className="section-panel">
            <p className="kicker">Positioning</p>
            <h2>Audit first. Widget later, only if the demand is real.</h2>
            <p className="section-copy">
              The final section makes the strategic point: Olite can own a niche around cookie auditing and
              runtime consent verification before deciding whether to become a full widget or CMP provider.
            </p>
            <ul className="bullet-list">
              <li>Lower implementation risk than building a cookie widget immediately</li>
              <li>Fits the existing scanner and evidence model</li>
              <li>Creates strong content and landing-page topics around cookie compliance</li>
              <li>Gives a credible bridge into later remediation products if users ask for them</li>
            </ul>
          </div>
          <div className="section-panel">
            <p className="kicker">Related Pages</p>
            <h2>Where this fits in the broader product</h2>
            <ul className="bullet-list">
              <li><Link href="/what-olite-checks">What Olite Checks</Link></li>
              <li><Link href="/blog/what-is-global-privacy-control">What Is Global Privacy Control?</Link></li>
              <li><Link href="/tools/privacy">Free Privacy Checker</Link></li>
            </ul>
            <p className="section-copy">
              So the page is not claiming that full runtime cookie verification is finished. It is explaining
              why that direction makes sense and what the first meaningful audit steps look like.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}