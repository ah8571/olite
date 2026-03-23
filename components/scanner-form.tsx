"use client";

import { useState } from "react";

import type { ToolType } from "@/lib/scanner-config";

type ScanResponse = {
  tool: ToolType;
  normalizedUrl: string;
  title: string;
  score: number;
  summary: string;
  issues: Array<{
    title: string;
    detail: string;
    severity: "low" | "medium" | "high";
  }>;
  limitationNotes: string[];
  metadata: {
    trackingSignals: string[];
    securityHeadersPresent: string[];
    imageCount: number;
    formCount: number;
    emailFieldCount: number;
    checkboxCount: number;
  };
};

export function ScannerForm({ tool }: { tool: ToolType }) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ tool, url })
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
        <p className="kicker">Free Public Scan</p>
        <form className="scanner-form" onSubmit={onSubmit}>
          <label className="label">
            Website URL
            <input
              className="input"
              type="url"
              inputMode="url"
              placeholder="https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
            />
          </label>
          <p className="form-note">
            This hosted scan checks a single public page and returns lightweight signals. Broader crawls,
            rendered navigation states, and authenticated areas belong in the later local scanner and CLI.
          </p>
          <div className="inline-row">
            <button className="button" type="submit" disabled={pending}>
              {pending ? "Scanning..." : "Run free scan"}
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
              <div className="score-pill">Score {result.score}/100</div>
            </div>
            <p className="tool-copy">{result.summary}</p>
            <div className="badge-row">
              <span className="badge">Images: {result.metadata.imageCount}</span>
              <span className="badge">Forms: {result.metadata.formCount}</span>
              <span className="badge">Email fields: {result.metadata.emailFieldCount}</span>
              <span className="badge">Checkboxes: {result.metadata.checkboxCount}</span>
            </div>
            <h4>Issues</h4>
            {result.issues.length > 0 ? (
              <ul className="result-list">
                {result.issues.map((issue) => (
                  <li key={`${issue.title}-${issue.detail}`}>
                    <strong>{issue.title}</strong>: {issue.detail} ({issue.severity})
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
            <h3>Run a quick public scan</h3>
            <p className="tool-copy">
              This panel will show a lightweight summary, issues, and limitations for the page you submit.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}