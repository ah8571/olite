"use client";

import { useState } from "react";

import { getIssueSuggestedFix } from "@/lib/issue-guidance";
import { toolConfig, type ToolType } from "@/lib/scanner-config";

type Severity = "low" | "medium" | "high";
type PrivacyRegion = "us" | "eu";

type ScanResponse = {
  tool: ToolType;
  normalizedUrl: string;
  title: string;
  score: number;
  summary: string;
  issues: Array<{
    layer: ToolType | "consent" | "security";
    title: string;
    detail: string;
    severity: Severity;
    suggestedFix?: string;
    locationSummary?: string;
    evidence?: Array<{
      selector: string;
      snippet: string;
      note?: string;
    }>;
  }>;
  limitationNotes: string[];
  metadata: {
    privacyRegion: PrivacyRegion;
    htmlLangPresent: boolean;
    trackingSignals: string[];
    securityHeadersPresent: string[];
    imageCount: number;
    formCount: number;
    emailFieldCount: number;
    checkboxCount: number;
    policyLinkCount: number;
    privacyRightsLinkCount: number;
    doNotSellLinkCount: number;
    accessRequestSignalPresent: boolean;
    correctionRequestSignalPresent: boolean;
    deletionRequestSignalPresent: boolean;
    gpcSignalPresent: boolean;
  };
};

function buildHostedIssueCsv(result: ScanResponse): string {
  const rows = [
    ["layer", "severity", "issue_title", "issue_detail", "suggested_fix", "location_summary", "selector", "snippet", "note", "page_url"]
  ];

  for (const issue of result.issues) {
    const evidence = issue.evidence && issue.evidence.length > 0 ? issue.evidence : [{ selector: "", snippet: "", note: "" }];

    for (const item of evidence) {
      rows.push([
        issue.layer,
        issue.severity,
        issue.title,
        issue.detail,
        issue.suggestedFix ?? getIssueSuggestedFix(issue.layer, issue.title),
        issue.locationSummary ?? "",
        item.selector,
        item.snippet,
        item.note ?? "",
        result.normalizedUrl
      ]);
    }
  }

  return rows
    .map((row) =>
      row
        .map((value) => {
          const normalized = String(value ?? "");
          return /[",\n]/.test(normalized) ? `"${normalized.replaceAll('"', '""')}"` : normalized;
        })
        .join(",")
    )
    .join("\n");
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

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
  return getIssueSuggestedFix(tool === "privacy" ? "privacy" : "accessibility", title);
}

function severityLabel(severity: Severity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function issueLayerLabel(layer: ScanResponse["issues"][number]["layer"]): string {
  return layer.charAt(0).toUpperCase() + layer.slice(1);
}

export function ScannerForm({ tool }: { tool: ToolType }) {
  const config = toolConfig[tool];
  const [url, setUrl] = useState("");
  const [privacyRegion, setPrivacyRegion] = useState<PrivacyRegion>("eu");
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
          `Privacy expectations: ${result?.metadata.privacyRegion === "us" ? "US users only" : "Including EU users"}`,
          `Policy links: ${result?.metadata.policyLinkCount ?? 0}`,
          `Rights paths: ${result?.metadata.privacyRightsLinkCount ?? 0}`,
          `Opt-out cues: ${result?.metadata.doNotSellLinkCount ?? 0}`,
          `Rights wording: ${[
            result?.metadata.accessRequestSignalPresent ? "access" : null,
            result?.metadata.correctionRequestSignalPresent ? "correction" : null,
            result?.metadata.deletionRequestSignalPresent ? "deletion" : null
          ]
            .filter(Boolean)
            .join("/") || "limited"}`,
          `GPC cue: ${result?.metadata.gpcSignalPresent ? "present" : "missing"}`,
          `Tracking signals: ${result?.metadata.trackingSignals.length ?? 0}`,
          `Security headers: ${result?.metadata.securityHeadersPresent.length ?? 0}`
        ];

  const issueCount = result?.issues.length ?? 0;

  function exportJson() {
    if (!result) {
      return;
    }

    const host = new URL(result.normalizedUrl).hostname.replace(/[^a-z0-9-]+/gi, "-");
    downloadFile(`olite-${tool}-${host}.json`, JSON.stringify(result, null, 2), "application/json");
  }

  function exportCsv() {
    if (!result) {
      return;
    }

    const host = new URL(result.normalizedUrl).hostname.replace(/[^a-z0-9-]+/gi, "-");
    downloadFile(`olite-${tool}-${host}.csv`, buildHostedIssueCsv(result), "text/csv;charset=utf-8");
  }

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
        body: JSON.stringify({ tool, url: normalizedUrl, privacyRegion: tool === "privacy" ? privacyRegion : undefined })
      });

      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Free checks used for today. Try again tomorrow or download the desktop app.");
        }

        throw new Error(payload.error ?? "The scan could not be completed.");
      }

      setResult(payload);
    } catch (scanError) {
      setResult(null);
      const message =
        scanError instanceof Error
          ? scanError.message === "Failed to fetch" || scanError.message === "fetch failed"
            ? "The scan could not be completed. If you already used today's free checks, try again tomorrow or download the desktop app."
            : scanError.message
          : "The scan could not be completed.";

      setError(message);
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
          {tool === "privacy" ? (
            <div className="privacy-settings-block">
              <label className="label">
                Privacy expectations
                <select className="select" value={privacyRegion} onChange={(event) => setPrivacyRegion(event.target.value as PrivacyRegion)}>
                  <option value="eu">Including EU users</option>
                  <option value="us">US users only</option>
                </select>
              </label>
              <details className="info-disclosure">
                <summary className="info-trigger" aria-label="More information about Global Privacy Control">
                  <span className="info-icon" aria-hidden="true">i</span>
                  <span>Why GPC matters</span>
                </summary>
                <div className="info-panel">
                  <p className="form-note">
                    Global Privacy Control is a browser-based privacy preference, commonly sent as <strong>Sec-GPC: 1</strong>, that can tell a site the user wants an applicable sale or sharing opt-out honored. In the US this is especially relevant in California-style privacy regimes where browser preference signals can matter for opt-out handling.
                  </p>
                  <p className="form-note">
                    Some privacy-oriented browsers and extensions can send this signal. Olite currently flags missing visible GPC handling cues for US-only reviews as a public rights signal, and the deeper desktop roadmap is to test whether site behavior actually changes when that preference is present.
                  </p>
                  <a className="footer-link info-link" href="/blog/what-is-global-privacy-control">
                    Read: What is Global Privacy Control?
                  </a>
                </div>
              </details>
            </div>
          ) : null}
          <p className="form-note">
            {tool === "accessibility"
              ? "Enter a public page to check for visible accessibility warning signs. You can use a full URL or just a domain. This hosted pass is intentionally lightweight, capped at 2 free scans per day, and does not replace manual WCAG testing."
              : tool === "privacy"
                ? "Enter a public page to check for policy visibility, rights-request paths, tracking signals, and baseline privacy-facing signals. Choose whether to evaluate only US-facing privacy expectations or to include EU-style consent expectations as well. This hosted pass is capped at 2 free scans per day. This is not legal advice."
                : "Enter a public page to check for visible form and opt-in signals. Deeper flow validation belongs in a broader review."}
          </p>
          <div className="inline-row">
            <span className="limit-badge">2 free scans/day</span>
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
            <div className="result-header hosted-summary-head">
              <div>
                <p className="kicker">Crawl Overview</p>
                <h3>{result.summary}</h3>
                <p className="muted">Start URL: {result.normalizedUrl}</p>
              </div>
              <div className="score-pill">
                {config.scoreLabel}: {result.score}/100
              </div>
            </div>
            <div className="badge-row hosted-summary-stats">
              <span className="badge">Page title: {result.title}</span>
              <span className="badge">Issues: {issueCount}</span>
              {resultBadges.map((item) => (
                <span className="badge" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <div className="inline-row hosted-actions">
              <button className="button-secondary" type="button" onClick={exportJson}>
                Download JSON
              </button>
              <button className="button-secondary" type="button" onClick={exportCsv}>
                Download CSV
              </button>
            </div>
            <h4>Issue list</h4>
            {result.issues.length > 0 ? (
              <div className="table-wrap hosted-table-wrap">
                <table className="issue-table hosted-issue-table">
                  <thead>
                    <tr>
                      <th>Severity</th>
                      <th>Problem</th>
                      <th>Where</th>
                      <th>Layer</th>
                      <th>Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                {result.issues.map((issue) => (
                  <tr key={`${issue.title}-${issue.detail}`}>
                    <td>
                      <span className={`severity-badge severity-${issue.severity}`}>
                        {severityLabel(issue.severity)}
                      </span>
                    </td>
                    <td>
                      <strong className="table-problem">{issue.title}</strong>
                      <div className="table-subtext">{issue.detail}</div>
                      <div className="issue-remediation hosted-remediation">
                        <strong>What to do:</strong> {issue.suggestedFix ?? issueRemediation(tool, issue.title)}
                      </div>
                    </td>
                    <td>
                      <div className="table-location">{issue.locationSummary ?? "-"}</div>
                    </td>
                    <td>
                      <span className="table-layer">{issueLayerLabel(issue.layer)}</span>
                    </td>
                    <td>
                      {issue.evidence && issue.evidence.length > 0 ? (
                        <>
                          <div className="table-evidence-preview">
                            {issue.evidence[0]?.selector ? <div><strong>Selector:</strong> {issue.evidence[0].selector}</div> : null}
                            {issue.evidence[0]?.snippet ? <div><strong>Snippet:</strong> {issue.evidence[0].snippet}</div> : null}
                            {issue.evidence[0]?.note ? <div><strong>Note:</strong> {issue.evidence[0].note}</div> : null}
                          </div>
                          {issue.evidence.length > 1 || issue.evidence[0]?.note ? (
                            <details className="issue-evidence-details table-evidence-details">
                              <summary className="issue-evidence-summary table-evidence-summary">More evidence ({issue.evidence.length})</summary>
                              <div className="issue-evidence-list table-evidence-list">
                                {issue.evidence.map((item) => (
                                  <div className="issue-evidence-card table-evidence-card" key={`${item.selector}-${item.snippet}`}>
                                    <p className="issue-evidence-line table-evidence-line"><strong>Selector:</strong> {item.selector}</p>
                                    <p className="issue-evidence-line table-evidence-line"><strong>Snippet:</strong> {item.snippet}</p>
                                    {item.note ? <p className="issue-evidence-line table-evidence-line"><strong>Note:</strong> {item.note}</p> : null}
                                  </div>
                                ))}
                              </div>
                            </details>
                          ) : null}
                        </>
                      ) : (
                        <div className="table-mono">-</div>
                      )}
                    </td>
                  </tr>
                ))}
                  </tbody>
                </table>
              </div>
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