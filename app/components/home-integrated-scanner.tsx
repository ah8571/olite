"use client";

import Link from "next/link";
import { useState } from "react";

import { getIssueSuggestedFix } from "@/lib/issue-guidance";
import { toolConfig, toolOrder, type ToolType } from "@/lib/scanner-config";

type Severity = "low" | "medium" | "high";
type PrivacyRegion = "us" | "eu";
type IssueLayer = "accessibility" | "privacy" | "consent" | "security";

type ScanIssue = {
  layer: IssueLayer;
  title: string;
  detail: string;
  severity: Severity;
  suggestedFix?: string;
  locationSummary?: string;
};

type HostedScanResponse = {
  tool: ToolType;
  normalizedUrl: string;
  title: string;
  score: number;
  summary: string;
  issues: ScanIssue[];
  limitationNotes: string[];
  metadata: {
    privacyRegion: PrivacyRegion;
    trackingSignals: string[];
    securityHeadersPresent: string[];
  };
};

type HomepageScanResponse = {
  normalizedUrl: string;
  title: string;
  privacyRegion: PrivacyRegion;
  totalIssues: number;
  scans: Record<ToolType, HostedScanResponse>;
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

function severityLabel(severity: Severity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function issueLayerLabel(layer: IssueLayer): string {
  return layer.charAt(0).toUpperCase() + layer.slice(1);
}

function issueRemediation(tool: ToolType, title: string): string {
  return getIssueSuggestedFix(tool === "accessibility" ? "accessibility" : "privacy", title);
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

const severityRank: Record<Severity, number> = {
  high: 0,
  medium: 1,
  low: 2
};

export function HomeIntegratedScanner() {
  const [url, setUrl] = useState("");
  const [privacyRegion, setPrivacyRegion] = useState<PrivacyRegion>("eu");
  const [result, setResult] = useState<HomepageScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const combinedIssues = result
    ? toolOrder
        .flatMap((tool) => result.scans[tool].issues.map((issue) => ({ tool, issue })))
        .sort((left, right) => {
          const severityDifference = severityRank[left.issue.severity] - severityRank[right.issue.severity];

          if (severityDifference !== 0) {
            return severityDifference;
          }

          return left.tool.localeCompare(right.tool) || left.issue.title.localeCompare(right.issue.title);
        })
    : [];

  const trackingSignals = result
    ? Array.from(new Set(toolOrder.flatMap((tool) => result.scans[tool].metadata.trackingSignals)))
    : [];

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
        body: JSON.stringify({ mode: "integrated", url: normalizedUrl, privacyRegion })
      });
      const payload = (await response.json()) as HomepageScanResponse & { error?: string };

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

  function exportJson() {
    if (!result) {
      return;
    }

    const host = new URL(result.normalizedUrl).hostname.replace(/[^a-z0-9-]+/gi, "-");
    downloadFile(`olite-homepage-scan-${host}.json`, JSON.stringify(result, null, 2), "application/json");
  }

  return (
    <section className="page-section" id="scanner">
      <div className="container">
        <div className="scanner-home-head">
          <div>
            <p className="kicker">Try It Here</p>
            <h2 className="section-title">Run one homepage scan across accessibility, cookies, and privacy.</h2>
            <p className="section-copy">
              The homepage scanner now runs the hosted accessibility, cookie, and privacy checks together so people can see the full shape of the product in one pass.
            </p>
            <p className="section-copy">
              Dedicated tool pages still exist for focused landing pages and category-specific copy, but the homepage is now the integrated first look.
            </p>
          </div>
          <div className="cards-grid">
            {toolOrder.map((tool) => (
              <article className="feature-card" key={tool}>
                <p className="kicker">{toolConfig[tool].title}</p>
                <h3>{toolConfig[tool].sampleChecks[0]}</h3>
                <p className="muted">{toolConfig[tool].sampleChecks.slice(1, 3).join(" • ")}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="split-grid">
          <section className="scanner-panel">
            <p className="kicker">Free Website Scanner</p>
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
                <button className="button-secondary" type="button" onClick={() => setUrl("https://www.mozilla.org/")}>
                  Use example URL
                </button>
              </div>
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
                      Global Privacy Control is a browser signal that can indicate a user wants an applicable sale or sharing opt-out honored. Olite uses the homepage scan to look for visible public cues, while the desktop workflow is where deeper behavior checks belong.
                    </p>
                    <a className="footer-link info-link" href="/blog/what-is-global-privacy-control">
                      Read: What is Global Privacy Control?
                    </a>
                  </div>
                </details>
              </div>
              <p className="form-note">
                Enter a public page to run the three hosted categories together. This integrated homepage pass is capped at 2 free scans per day, counts as one scan request, and is meant to show how Olite surfaces accessibility, cookie, and privacy signals side by side.
              </p>
              <div className="inline-row">
                <span className="limit-badge">2 free scans/day</span>
                <button className="button" type="submit" disabled={pending}>
                  {pending ? "Scanning..." : "Run full homepage scan"}
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
                    <p className="kicker">Combined Overview</p>
                    <h3>
                      {result.totalIssues > 0
                        ? `${result.totalIssues} issues surfaced across the homepage first pass`
                        : "No obvious issues surfaced across the homepage first pass"}
                    </h3>
                    <p className="muted">Start URL: {result.normalizedUrl}</p>
                  </div>
                  <div className="score-pill">Categories: 3</div>
                </div>

                <div className="badge-row hosted-summary-stats">
                  <span className="badge">Page title: {result.title}</span>
                  <span className="badge">Privacy expectations: {result.privacyRegion === "us" ? "US users only" : "Including EU users"}</span>
                  <span className="badge">Issues: {result.totalIssues}</span>
                </div>

                <div className="inline-row hosted-actions">
                  <button className="button-secondary" type="button" onClick={exportJson}>
                    Download JSON
                  </button>
                </div>

                <div className="cards-grid">
                  {toolOrder.map((tool) => {
                    const scan = result.scans[tool];

                    return (
                      <article className="feature-card" key={tool}>
                        <p className="kicker">{toolConfig[tool].title}</p>
                        <h3>{scan.score}/100</h3>
                        <p className="muted">{scan.summary}</p>
                        <p className="muted">Issues: {scan.issues.length}</p>
                        <div className="hero-actions compact">
                          <Link className="button-secondary" href={`/tools/${toolConfig[tool].slug}`}>
                            Open dedicated page
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <h4>Combined issue list</h4>
                {combinedIssues.length > 0 ? (
                  <div className="table-wrap hosted-table-wrap">
                    <table className="issue-table hosted-issue-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Severity</th>
                          <th>Problem</th>
                          <th>Layer</th>
                          <th>Where</th>
                        </tr>
                      </thead>
                      <tbody>
                        {combinedIssues.map(({ tool, issue }) => (
                          <tr key={`${tool}-${issue.title}-${issue.detail}`}>
                            <td>{toolConfig[tool].title}</td>
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
                              <span className="table-layer">{issueLayerLabel(issue.layer)}</span>
                            </td>
                            <td>
                              <div className="table-location">{issue.locationSummary ?? "-"}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="muted">No obvious issues surfaced in this lightweight combined result.</p>
                )}

                <h4>Per-category limitations</h4>
                {toolOrder.map((tool) => (
                  <details className="issue-evidence-details table-evidence-details" key={tool}>
                    <summary className="issue-evidence-summary table-evidence-summary">{toolConfig[tool].title} limitations</summary>
                    <ul className="result-list">
                      {result.scans[tool].limitationNotes.map((note) => (
                        <li key={`${tool}-${note}`}>{note}</li>
                      ))}
                    </ul>
                  </details>
                ))}

                {trackingSignals.length > 0 ? (
                  <>
                    <h4>Tracking signals seen</h4>
                    <ul className="result-list">
                      {trackingSignals.map((signal) => (
                        <li key={signal}>{signal}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </>
            ) : (
              <div className="empty-state">
                <p className="kicker">Result Panel</p>
                <h3>Run a first-pass website scan</h3>
                <p className="tool-copy">
                  This homepage scan runs the hosted accessibility, cookie, and privacy categories together. You will get a combined summary plus category-by-category results for the URL you submit.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}