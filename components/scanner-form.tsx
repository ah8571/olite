"use client";

import { useState } from "react";

import { toolConfig, type ToolType } from "@/lib/scanner-config";

type Severity = "low" | "medium" | "high";

type ScanResponse = {
  tool: ToolType;
  normalizedUrl: string;
  title: string;
  score: number;
  summary: string;
  issues: Array<{
    title: string;
    detail: string;
    severity: Severity;
  }>;
  limitationNotes: string[];
  metadata: {
    htmlLangPresent: boolean;
    trackingSignals: string[];
    securityHeadersPresent: string[];
    imageCount: number;
    formCount: number;
    emailFieldCount: number;
    checkboxCount: number;
    policyLinkCount: number;
  };
};

function normalizeSubmittedUrl(rawUrl: string): string {
  const value = rawUrl.trim();

  if (!value) {
    throw new Error("Enter a website URL to scan.");
  }

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const normalized = new URL(withProtocol);

    if (!normalized.hostname) {
      throw new Error("Enter a valid website URL.");
    }

    if (!["http:", "https:"].includes(normalized.protocol)) {
      throw new Error("Only http and https URLs are supported.");
    }

    return normalized.toString();
  } catch {
    throw new Error("Enter a valid website URL.");
  }
}

function issueRemediation(tool: ToolType, title: string): string {
  if (tool === "accessibility") {
    if (title === "Missing html lang attribute") {
      return "Add a valid language attribute to the html element so assistive technologies can interpret the page correctly.";
    }

    if (title === "Images missing alt text") {
      return "Review each flagged image and add meaningful alt text for informative images. Use empty alt text only for purely decorative images.";
    }

    if (title === "Inputs missing visible or programmatic labels") {
      return "Ensure each form control has a visible label, or a reliable programmatic label through aria-label or aria-labelledby when appropriate.";
    }
  }

  if (tool === "privacy") {
    if (title === "Tracking signals without visible cookie wording") {
      return "Review whether tracking loads before consent and make the cookie or consent message clearer on the page.";
    }

    if (title === "No obvious privacy or cookie policy links detected") {
      return "Add clearly visible privacy and cookie-policy links in the header, footer, or near form capture points.";
    }

    if (title === "Limited security header coverage") {
      return "Check server or CDN configuration for headers like content-security-policy, referrer-policy, and strict-transport-security.";
    }
  }

  return "Review this issue manually and confirm the page implementation matches your intended compliance behavior.";
}

function severityLabel(severity: Severity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

export function ScannerForm({ tool }: { tool: ToolType }) {
  const config = toolConfig[tool];
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const resultBadges =
    tool === "accessibility"
      ? [
          `Lang: ${result?.metadata.htmlLangPresent ? "present" : "missing"}`,
          `Images: ${result?.metadata.imageCount ?? 0}`,
          `Forms: ${result?.metadata.formCount ?? 0}`,
          `Email fields: ${result?.metadata.emailFieldCount ?? 0}`
        ]
      : [
          `Policy links: ${result?.metadata.policyLinkCount ?? 0}`,
          `Tracking signals: ${result?.metadata.trackingSignals.length ?? 0}`,
          `Security headers: ${result?.metadata.securityHeadersPresent.length ?? 0}`,
          `Forms: ${result?.metadata.formCount ?? 0}`
        ];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    let normalizedUrl = "";

    try {
      normalizedUrl = normalizeSubmittedUrl(url);
    } catch (validationError) {
      setResult(null);
      setError(validationError instanceof Error ? validationError.message : "Enter a valid website URL.");
      return;
    }

    setPending(true);
    setUrl(normalizedUrl);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ tool, url: normalizedUrl })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "The scan could not be completed.");
      }

      setResult(payload);
    } catch (scanError) {
      setResult(null);
      setError(scanError instanceof Error ? scanError.message : "The scan could not be completed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="split-grid">
      <section className="scanner-panel">
        <p className="kicker">{config.eyebrow}</p>
        <form className="scanner-form" onSubmit={onSubmit}>
          <label className="label">
            Website URL
            <input
              className="input"
              type="text"
              inputMode="url"
              placeholder="example.com or https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
            />
          </label>
          <div className="inline-row">
            <button
              className="button-secondary"
              type="button"
              onClick={() => setUrl(tool === "accessibility" ? "https://www.w3.org/WAI/" : "https://www.mozilla.org/")}
            >
              Use example URL
            </button>
          </div>
          <p className="form-note">
            {tool === "accessibility"
              ? "Enter a public page to check for visible accessibility warning signs. You can use a full URL or just a domain. This hosted pass is intentionally lightweight and does not replace manual WCAG testing."
              : tool === "privacy"
                ? "Enter a public page to check for policy visibility, cookie wording, tracking signals, and baseline privacy-facing signals. You can use a full URL or just a domain. This is not legal advice."
                : "Enter a public page to check for visible form and opt-in signals. Deeper flow validation belongs in a broader review."}
          </p>
          <div className="inline-row">
            <button className="button" type="submit" disabled={pending}>
              {pending ? "Scanning..." : config.ctaLabel}
            </button>
          </div>
          {error ? <p className="form-note">{error}</p> : null}
        </form>
      </section>
      <section className="result-panel">
        {result ? (
          <>
            <div className="result-header">
              <div>
                <p className="kicker">Result</p>
                <h3>{result.title}</h3>
                <p className="muted">{result.normalizedUrl}</p>
              </div>
              <div className="score-pill">
                {config.scoreLabel}: {result.score}/100
              </div>
            </div>
            <p className="tool-copy">{result.summary}</p>
            <div className="badge-row">
              {resultBadges.map((item) => (
                <span className="badge" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <h4>Issues</h4>
            {result.issues.length > 0 ? (
              <ul className="issue-list">
                {result.issues.map((issue) => (
                  <li className="issue-item" key={`${issue.title}-${issue.detail}`}>
                    <div className="issue-head">
                      <strong>{issue.title}</strong>
                      <span className={`severity-badge severity-${issue.severity}`}>
                        {severityLabel(issue.severity)}
                      </span>
                    </div>
                    <p className="muted issue-copy">{issue.detail}</p>
                    <p className="issue-remediation">
                      <strong>What to do:</strong> {issueRemediation(tool, issue.title)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No obvious issues surfaced in this lightweight result.</p>
            )}
            <h4>Limitations</h4>
            <ul className="result-list">
              {result.limitationNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            {tool === "privacy" ? <h4>Security Headers Seen</h4> : null}
            {tool === "privacy" ? (
              result.metadata.securityHeadersPresent.length > 0 ? (
                <ul className="result-list">
                  {result.metadata.securityHeadersPresent.map((header) => (
                    <li key={header}>{header}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No common security headers were detected in the page response.</p>
              )
            ) : null}
            {result.metadata.trackingSignals.length > 0 ? (
              <>
                <h4>Tracking Signals</h4>
                <ul className="result-list">
                  {result.metadata.trackingSignals.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </>
        ) : (
          <div className="empty-state">
            <p className="kicker">Result Panel</p>
            <h3>{tool === "accessibility" ? "Run a first-pass accessibility scan" : "Run a first-pass privacy check"}</h3>
            <p className="tool-copy">
              {tool === "accessibility"
                ? "You will get a lightweight summary of visible accessibility signals, surfaced issues, and scan limitations for the URL you submit."
                : tool === "privacy"
                  ? "You will get a lightweight summary of privacy-facing signals, surfaced issues, tracking detections, and scan limitations for the URL you submit."
                  : "This panel will show a lightweight summary, issues, and limitations for the page you submit."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}