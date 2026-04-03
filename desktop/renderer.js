const form = document.getElementById("scan-form");
const status = document.getElementById("status");
const submitButton = document.getElementById("submit-button");
const summaryPanel = document.getElementById("summary-panel");
const issueRowsPanel = document.getElementById("issue-rows-panel");
const pagesPanel = document.getElementById("pages-panel");
const recentScansPanel = document.getElementById("recent-scans");
const urlInput = document.getElementById("url");
const reviewScopeInput = document.getElementById("reviewScope");
const privacyRegionInput = document.getElementById("privacyRegion");
const browserAuditInput = document.getElementById("browserAudit");
const clearResultsButton = document.getElementById("clear-results-button");
const scannerView = document.getElementById("scanner-view");
const historyView = document.getElementById("history-view");
const navScannerButton = document.getElementById("nav-scanner-button");
const navHistoryButton = document.getElementById("nav-history-button");

let lastResult = null;
let scanHistory = [];
let activeView = "scanner";

const VIEW_HASHES = {
  scanner: "#/scanner",
  history: "#/saved-scans"
};

const SEVERITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatRanAt(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function normalizeUrlValue(value) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    throw new Error("Enter a website URL first.");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withProtocol).toString();
}

function normalizeScope(value) {
  return value === "single" ? "single" : "single";
}

function applyScopeUI(scope) {
  reviewScopeInput.value = normalizeScope(scope);
  urlInput.placeholder = "https://example.com";
  status.textContent = "Enter one page URL to run the free desktop review. Broader crawl depth will return with paid activation.";
}

function reviewModeLabel(scope, maxPages, isCapped = true) {
  if (scope === "sitemap" || maxPages > 1) {
    return isCapped ? `Legacy full site review capped at ${maxPages} page${maxPages === 1 ? "" : "s"}` : "Legacy full site review";
  }

  return "Single URL check";
}

function summaryModeLabel(result) {
  if (result.sitemapUrl || result.pageLimit > 1 || result.scannedPages > 1) {
    return reviewModeLabel("sitemap", result.pageLimit, result.pageLimit < 100);
  }

  return reviewModeLabel("single", 1, true);
}

function privacyRegionLabel(value) {
  return value === "us" ? "US users only" : "Including EU users";
}

function buildScanRequest(inputUrl, scope, maxPages) {
  const normalizedInput = normalizeUrlValue(inputUrl);

  return {
    normalizedInput,
    reviewMode: "single",
    startUrl: normalizedInput,
    sitemapUrl: "",
    maxPages: 1
  };
}

function normalizeViewFromHash(hash) {
  return hash === VIEW_HASHES.history ? "history" : "scanner";
}

function setActiveView(view) {
  activeView = view === "history" ? "history" : "scanner";

  const showingHistory = activeView === "history";

  scannerView.classList.toggle("hidden", showingHistory);
  historyView.classList.toggle("hidden", !showingHistory);
  navScannerButton.classList.toggle("is-active", !showingHistory);
  if (showingHistory) {
    navScannerButton.removeAttribute("aria-current");
  } else {
    navScannerButton.setAttribute("aria-current", "page");
  }
  navHistoryButton.classList.toggle("is-active", showingHistory);
  if (showingHistory) {
    navHistoryButton.setAttribute("aria-current", "page");
  } else {
    navHistoryButton.removeAttribute("aria-current");
  }
}

function navigateToView(view) {
  const targetHash = view === "history" ? VIEW_HASHES.history : VIEW_HASHES.scanner;

  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
    return;
  }

  setActiveView(view);
}

function resetResults() {
  lastResult = null;
  summaryPanel.className = "panel result-panel empty-state";
  summaryPanel.innerHTML = `
    <p class="kicker">Crawl Overview</p>
    <h2>Your scan overview will appear here.</h2>
    <p class="lede">After the crawl finishes, the issue table will show which pages have problems, how severe they are, and where they were found.</p>
  `;
  issueRowsPanel.className = "panel result-panel hidden";
  issueRowsPanel.innerHTML = "";
  pagesPanel.className = "panel result-panel hidden";
  pagesPanel.innerHTML = "";
}

async function runScan(inputUrl, scope, maxPages, privacyRegion, browserAuditEnabled) {
  status.textContent = "Scanning...";
  submitButton.disabled = true;
  navigateToView("scanner");

  try {
    const request = buildScanRequest(inputUrl, scope, maxPages);
    const result = await window.oliteDesktop.runScan({
      url: request.startUrl,
      reviewMode: request.reviewMode,
      sitemapUrl: request.sitemapUrl || undefined,
      maxPages: request.maxPages,
      privacyRegion,
      browserAudit: browserAuditEnabled
    });
    loadResultIntoPanels(result, request.maxPages);
    await storeCompletedScan(
      result,
      request.normalizedInput,
      normalizeScope(scope),
      request.maxPages,
      true,
      privacyRegion,
      browserAuditEnabled
    );
    status.textContent = "Scan complete.";
  } catch (error) {
    const message = error instanceof Error ? error.message : "The scan could not be completed.";
    status.textContent = message;
  } finally {
    submitButton.disabled = false;
  }
}

function renderRecentScans() {
  const recent = scanHistory;

  if (recent.length === 0) {
    recentScansPanel.className = "recent-list empty-list";
    recentScansPanel.innerHTML = '<p class="form-note">Your saved desktop reports will appear here after you complete a scan.</p>';
    return;
  }

  recentScansPanel.className = "recent-list";
  recentScansPanel.innerHTML = recent
    .map(
      (item, index) => `
        <article class="recent-item recent-item-compact">
          <div class="recent-main">
            <strong>${escapeHtml(item.host)}</strong>
            <span class="recent-divider">•</span>
            <span class="muted-text">${escapeHtml(item.url)}</span>
            <span class="recent-divider">•</span>
            <span class="muted-text">Saved ${escapeHtml(formatRanAt(item.ranAt))}</span>
          </div>
          <div class="recent-meta recent-meta-compact">
            <span class="stat-pill">Score: ${escapeHtml(item.score)}</span>
            <span class="stat-pill">${escapeHtml(reviewModeLabel(item.reviewScope ?? (item.result?.sitemapUrl ? "sitemap" : "single"), item.maxPages, item.isCapped !== false))}</span>
            <span class="stat-pill">${escapeHtml(privacyRegionLabel(item.privacyRegion ?? item.result?.pages?.[0]?.metadata?.privacyRegion))}</span>
            <span class="stat-pill">Browser audit: ${escapeHtml(item.browserAuditEnabled === false ? "off" : "on")}</span>
          </div>
          <div class="recent-actions">
            <button class="recent-button" type="button" data-history-view="${index}">Open report</button>
            <button class="recent-button" type="button" data-history-run="${index}">Run again</button>
          </div>
        </article>
      `
    )
    .join("");
}

function loadResultIntoPanels(result, maxPages) {
  lastResult = result;
  urlInput.value = result.sitemapUrl ?? result.normalizedUrl;
  renderSummary(result);
  renderIssueRows(result);
  pagesPanel.className = "panel result-panel hidden";
  pagesPanel.innerHTML = "";
}

async function storeCompletedScan(result, originalInput, reviewScope, maxPages, isCapped, privacyRegion, browserAuditEnabled) {
  const nextHistory = await window.oliteDesktop.storeScanResult({
    url: originalInput,
    host: new URL(originalInput).hostname,
    reviewScope,
    maxPages,
    isCapped,
    privacyRegion,
    browserAuditEnabled,
    score: result.score,
    summary: result.summary,
    ranAt: new Date().toISOString(),
    result
  });

  scanHistory = Array.isArray(nextHistory) ? nextHistory : [];
  renderRecentScans();
}

async function initializeScanHistory() {
  try {
    const history = await window.oliteDesktop.getScanHistory();
    scanHistory = Array.isArray(history) ? history : [];
  } catch {
    scanHistory = [];
  }

  renderRecentScans();
}

async function exportReport() {
  if (!lastResult) {
    return;
  }

  try {
    const host = new URL(lastResult.normalizedUrl).hostname.replace(/[^a-z0-9-]+/gi, "-");
    const datePart = new Date().toISOString().slice(0, 10);
    const response = await window.oliteDesktop.saveReport({
      suggestedName: `olite-scan-${host}-${datePart}.json`,
      content: JSON.stringify(lastResult, null, 2)
    });

    status.textContent = response.saved ? `Report saved to ${response.filePath}` : "Save cancelled.";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save the report.";
    status.textContent = message;
  }
}

function escapeCsv(value) {
  const normalized = String(value ?? "");
  return /[",\n]/.test(normalized) ? `"${normalized.replaceAll('"', '""')}"` : normalized;
}

function buildIssueCsv(result) {
  const rowsData = flattenIssueRows(result);
  const rows = [
    [
      "page_url",
      "page_title",
      "layer",
      "severity",
      "issue_title",
      "issue_detail",
      "issue_family",
      "verification_method",
      "confidence_level",
      "manual_review_recommended",
      "suggested_fix",
      "location_summary",
      "selector",
      "snippet",
      "note"
    ]
  ];

  for (const row of rowsData) {
    rows.push([
      row.pageUrl,
      row.pageTitle,
      row.layer,
      row.severity,
      row.issueTitle,
      row.issueDetail,
      row.issueFamily,
      row.verificationMethod,
      row.confidenceLevel,
      row.manualReviewRecommended,
      row.suggestedFix,
      row.locationSummary,
      row.selector,
      row.snippet,
      row.note
    ]);
  }

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

function flattenIssueRows(result) {
  return result.pages.flatMap((page) =>
    page.issues.flatMap((issue) => {
      const evidence = Array.isArray(issue.evidence) && issue.evidence.length > 0 ? issue.evidence : [null];

      return evidence.map((item) => ({
        pageUrl: page.normalizedUrl,
        pageTitle: page.title,
        layer: issue.layer,
        severity: issue.severity,
        issueTitle: issue.title,
        issueDetail: issue.detail,
        issueFamily: issue.issueFamily ?? "",
        verificationMethod: issue.verificationMethod ?? "",
        confidenceLevel: issue.confidenceLevel ?? "",
        manualReviewRecommended: typeof issue.manualReviewRecommended === "boolean" ? String(issue.manualReviewRecommended) : "",
        suggestedFix: issue.suggestedFix ?? "",
        locationSummary: issue.locationSummary ?? "",
        selector: item?.selector ?? "",
        snippet: item?.snippet ?? "",
        note: item?.note ?? ""
      }));
    })
  );
}

function buildIssueTableRows(result) {
  return result.pages.flatMap((page) =>
    page.issues.map((issue) => ({
      pageUrl: page.normalizedUrl,
      pageTitle: page.title,
      layer: issue.layer,
      severity: issue.severity,
      issueTitle: issue.title,
      issueDetail: issue.detail,
      issueFamily: issue.issueFamily ?? "",
      verificationMethod: issue.verificationMethod ?? "",
      confidenceLevel: issue.confidenceLevel ?? "",
      manualReviewRecommended: typeof issue.manualReviewRecommended === "boolean" ? String(issue.manualReviewRecommended) : "",
      suggestedFix: issue.suggestedFix ?? "",
      locationSummary: issue.locationSummary ?? "",
      evidence: Array.isArray(issue.evidence) ? issue.evidence : []
    }))
  );
}

function sortIssueRows(rows) {
  return [...rows].sort((left, right) => {
    const severityDelta = (SEVERITY_ORDER[left.severity] ?? 99) - (SEVERITY_ORDER[right.severity] ?? 99);

    if (severityDelta !== 0) {
      return severityDelta;
    }

    const pageDelta = left.pageUrl.localeCompare(right.pageUrl);

    if (pageDelta !== 0) {
      return pageDelta;
    }

    return left.issueTitle.localeCompare(right.issueTitle);
  });
}

function buildIssueSummary(rows) {
  const counts = rows.reduce(
    (accumulator, row) => {
      accumulator[row.severity] += 1;
      return accumulator;
    },
    { high: 0, medium: 0, low: 0 }
  );

  return [
    `<span class="stat-pill severity-pill high">High: ${escapeHtml(counts.high)}</span>`,
    `<span class="stat-pill severity-pill medium">Medium: ${escapeHtml(counts.medium)}</span>`,
    `<span class="stat-pill severity-pill low">Low: ${escapeHtml(counts.low)}</span>`
  ].join("");
}

function renderEvidenceColumn(evidence) {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    return '<div class="table-mono">-</div>';
  }

  const preview = evidence[0];
  const previewLines = [
    preview?.selector ? `<div><strong>Selector:</strong> ${escapeHtml(preview.selector)}</div>` : "",
    preview?.snippet ? `<div><strong>Snippet:</strong> ${escapeHtml(preview.snippet)}</div>` : "",
    preview?.note ? `<div><strong>Note:</strong> ${escapeHtml(preview.note)}</div>` : ""
  ]
    .filter(Boolean)
    .join("");

  return `
    <div class="table-evidence-preview">${previewLines || "<div>-</div>"}</div>
    ${
      evidence.length > 1 || (preview?.snippet && preview.snippet.length > 120) || preview?.note
        ? `
          <details class="table-evidence-details">
            <summary class="table-evidence-summary">More evidence (${escapeHtml(evidence.length)})</summary>
            <div class="table-evidence-list">
              ${evidence
                .map(
                  (item) => `
                    <div class="table-evidence-card">
                      ${item.selector ? `<div class="table-evidence-line"><strong>Selector:</strong> ${escapeHtml(item.selector)}</div>` : ""}
                      ${item.snippet ? `<div class="table-evidence-line"><strong>Snippet:</strong> ${escapeHtml(item.snippet)}</div>` : ""}
                      ${item.note ? `<div class="table-evidence-line"><strong>Note:</strong> ${escapeHtml(item.note)}</div>` : ""}
                    </div>
                  `
                )
                .join("")}
            </div>
          </details>
        `
        : ""
    }
  `;
}

async function exportIssueCsv() {
  if (!lastResult) {
    return;
  }

  try {
    const host = new URL(lastResult.normalizedUrl).hostname.replace(/[^a-z0-9-]+/gi, "-");
    const datePart = new Date().toISOString().slice(0, 10);
    const response = await window.oliteDesktop.saveReport({
      suggestedName: `olite-issues-${host}-${datePart}.csv`,
      content: buildIssueCsv(lastResult)
    });

    status.textContent = response.saved ? `Issue CSV saved to ${response.filePath}` : "Save cancelled.";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save the issue CSV.";
    status.textContent = message;
  }
}

function severityLabel(severity) {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function runtimeAuditSummary(runtimeAudit) {
  if (!runtimeAudit || runtimeAudit.ran !== true) {
    return '<span class="stat-pill">Browser audit: not run</span>';
  }

  const gpcSummary = runtimeAudit.gpcComparison?.simulated
    ? `<span class="stat-pill">GPC comparison: ${escapeHtml(runtimeAudit.gpcComparison.behaviorChanged ? "changed" : "unchanged")}</span>`
    : "";

  return [
    '<span class="stat-pill">Browser audit: on</span>',
    `<span class="stat-pill">Sampled URLs: ${escapeHtml(runtimeAudit.sampledUrls?.length ?? 1)}</span>`,
    `<span class="stat-pill">Initial tracker requests: ${escapeHtml(runtimeAudit.initialTrackerRequestCount)}</span>`,
    `<span class="stat-pill">Initial tracker cookies: ${escapeHtml(runtimeAudit.initialTrackerCookieCount)}</span>`,
    `<span class="stat-pill">Interaction: ${escapeHtml(runtimeAudit.interactionAttempted)}</span>`,
    `<span class="stat-pill">Post-interaction requests: ${escapeHtml(runtimeAudit.postInteractionTrackerRequestCount)}</span>`,
    `<span class="stat-pill">Post-interaction cookies: ${escapeHtml(runtimeAudit.postInteractionTrackerCookieCount)}</span>`,
    gpcSummary
  ].join("");
}

function runtimeAuditDetails(runtimeAudit) {
  if (!runtimeAudit || runtimeAudit.ran !== true) {
    return "";
  }

  const controls = Array.isArray(runtimeAudit.consentControls)
    ? runtimeAudit.consentControls.map((entry) => `${entry.kind}: ${entry.label}`).join(" | ")
    : "";
  const sampledUrls = Array.isArray(runtimeAudit.sampledUrls) ? runtimeAudit.sampledUrls.join(" | ") : "";
  const gpcDetails = runtimeAudit.gpcComparison?.simulated
    ? `<p class="form-note">GPC comparison: baseline requests/cookies ${escapeHtml(runtimeAudit.gpcComparison.baselineTrackerRequestCount)}/${escapeHtml(runtimeAudit.gpcComparison.baselineTrackerCookieCount)}; with GPC ${escapeHtml(runtimeAudit.gpcComparison.gpcTrackerRequestCount)}/${escapeHtml(runtimeAudit.gpcComparison.gpcTrackerCookieCount)}.</p>`
    : "";

  return `
    <div class="summary-section">
      <h3>Runtime browser audit</h3>
      <p class="form-note">Observed request and cookie signals before any consent click and immediately after one detected consent interaction.</p>
      <div class="summary-stats">
        ${runtimeAuditSummary(runtimeAudit)}
      </div>
      ${sampledUrls ? `<p class="form-note">Sampled URLs: ${escapeHtml(sampledUrls)}</p>` : ""}
      ${controls ? `<p class="form-note">Detected consent controls: ${escapeHtml(controls)}</p>` : '<p class="form-note">No obvious consent controls were detected during the runtime browser audit.</p>'}
      ${gpcDetails}
    </div>
  `;
}

function renderSummary(result) {
  const scannedUrls = result.pages.map((page) => page.normalizedUrl);
  const rows = sortIssueRows(flattenIssueRows(result));
  const runtimeAudit = result.pages?.[0]?.metadata?.runtimeAudit;
  const layerCounts = Object.entries(result.issuesByLayer)
    .filter(([, issues]) => Array.isArray(issues) && issues.length > 0)
    .map(([layer, issues]) => `<span class="stat-pill layer-pill">${escapeHtml(layer)}: ${escapeHtml(issues.length)}</span>`)
    .join("");

  summaryPanel.classList.remove("empty-state");
  summaryPanel.innerHTML = `
    <div class="summary-head">
      <div>
        <p class="kicker">Crawl Overview</p>
        <h2>${escapeHtml(result.summary)}</h2>
        <p class="lede">Start URL: ${escapeHtml(result.normalizedUrl)}</p>
      </div>
      <div class="summary-score">Score ${escapeHtml(result.score)}/100</div>
    </div>
    <div class="summary-stats">
      <span class="stat-pill">Scanned pages: ${escapeHtml(result.scannedPages)}</span>
      <span class="stat-pill">Discovered pages: ${escapeHtml(result.discoveredPages)}</span>
      <span class="stat-pill">Review: ${escapeHtml(summaryModeLabel(result))}</span>
      <span class="stat-pill">Privacy expectations: ${escapeHtml(privacyRegionLabel(result.pages?.[0]?.metadata?.privacyRegion))}</span>
      ${runtimeAuditSummary(runtimeAudit)}
      ${result.sitemapUrl ? `<span class="stat-pill">Legacy sitemap-seeded result</span>` : ""}
      ${rows.length > 0 ? buildIssueSummary(rows) : '<span class="stat-pill">No issues surfaced</span>'}
      ${layerCounts}
    </div>
    <div class="summary-section">
      <h3>Scanned URLs</h3>
      <div class="summary-url-list">
        ${scannedUrls
          .map(
            (pageUrl) => `
              <div class="summary-url-item">
                <span>${escapeHtml(pageUrl)}</span>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
      ${runtimeAuditDetails(runtimeAudit)}
    <div class="actions">
      <button id="export-json-button" class="button secondary-button" type="button">Export JSON report</button>
      <button id="export-csv-button" class="button secondary-button" type="button">Export CSV issue list</button>
    </div>
  `;

  document.getElementById("export-json-button")?.addEventListener("click", exportReport);
  document.getElementById("export-csv-button")?.addEventListener("click", exportIssueCsv);
}

function renderIssueRows(result) {
  const rows = sortIssueRows(buildIssueTableRows(result));

  issueRowsPanel.classList.remove("hidden");
  issueRowsPanel.innerHTML = `
    <p class="kicker">Issues Found</p>
    <h2>Issue list</h2>
    <p class="form-note">This is the main crawler-style view: what the problem is, what to do next, where it appears, and the supporting selector, snippet, and note details.</p>
    ${
      rows.length === 0
        ? '<div class="issue-card"><p class="issue-copy">No issue rows to display for this scan.</p></div>'
        : `
          <div class="table-wrap">
            <table class="issue-table">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Problem</th>
                  <th>Where</th>
                  <th>Page</th>
                  <th>Layer</th>
                  <th>Selector</th>
                </tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (row) => `
                      <tr>
                        <td><span class="severity-badge severity-${escapeHtml(row.severity)}">${escapeHtml(severityLabel(row.severity))}</span></td>
                        <td>
                          <strong class="table-problem">${escapeHtml(row.issueTitle)}</strong>
                          <div class="table-subtext">${escapeHtml(row.issueDetail)}</div>
                          ${row.suggestedFix ? `<div class="issue-remediation hosted-remediation"><strong>What to do:</strong> ${escapeHtml(row.suggestedFix)}</div>` : ""}
                        </td>
                        <td>
                          <div class="table-location">${escapeHtml(row.locationSummary || "-")}</div>
                        </td>
                        <td>
                          <strong>${escapeHtml(row.pageTitle)}</strong>
                          <div class="table-subtext">${escapeHtml(row.pageUrl)}</div>
                        </td>
                        <td><span class="table-layer">${escapeHtml(row.layer)}</span></td>
                        <td>${renderEvidenceColumn(row.evidence)}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
    }
  `;
}

function renderPages(result) {
  pagesPanel.classList.remove("hidden");
  pagesPanel.innerHTML = `
    <p class="kicker">Page Detail</p>
    <h2>Expanded findings by page</h2>
    <div class="page-grid">
      ${result.pages
        .map(
          (page) => `
            <article class="page-card">
              <div class="summary-head">
                <div>
                  <h3>${escapeHtml(page.title)}</h3>
                  <p class="muted-text">${escapeHtml(page.normalizedUrl)}</p>
                </div>
                <div class="summary-score">${escapeHtml(page.score)}/100</div>
              </div>
              <p class="page-copy">${escapeHtml(page.summary)}</p>
              <div class="summary-stats">
                <span class="stat-pill">Images: ${escapeHtml(page.metadata.imageCount)}</span>
                <span class="stat-pill">Forms: ${escapeHtml(page.metadata.formCount)}</span>
                <span class="stat-pill">Policy links: ${escapeHtml(page.metadata.policyLinkCount)}</span>
                <span class="stat-pill">Tracking signals: ${escapeHtml(page.metadata.trackingSignals.length)}</span>
              </div>
              <div class="issue-list">
                ${
                  page.issues.length === 0
                    ? `<div class="issue-card"><p class="issue-copy">No obvious issues surfaced on this page.</p></div>`
                    : page.issues
                        .map(
                          (issue) => `
                            <div class="issue-card">
                              <div class="issue-head">
                                <strong>${escapeHtml(issue.title)}</strong>
                                <span class="severity-badge severity-${escapeHtml(issue.severity)}">${escapeHtml(severityLabel(issue.severity))}</span>
                              </div>
                              <p class="issue-copy">${escapeHtml(issue.detail)}</p>
                              ${issue.suggestedFix ? `<p class="issue-location"><strong>What to do:</strong> ${escapeHtml(issue.suggestedFix)}</p>` : ""}
                              ${issue.locationSummary ? `<p class="issue-location"><strong>Location summary:</strong> ${escapeHtml(issue.locationSummary)}</p>` : ""}
                              ${
                                Array.isArray(issue.evidence) && issue.evidence.length > 0
                                  ? `
                                    <div class="evidence-list">
                                      ${issue.evidence
                                        .map(
                                          (item) => `
                                            <div class="evidence-card">
                                              <p class="evidence-line"><strong>Selector:</strong> ${escapeHtml(item.selector)}</p>
                                              <p class="evidence-line"><strong>Snippet:</strong> ${escapeHtml(item.snippet)}</p>
                                              ${item.note ? `<p class="evidence-line"><strong>Note:</strong> ${escapeHtml(item.note)}</p>` : ""}
                                            </div>
                                          `
                                        )
                                        .join("")}
                                    </div>
                                  `
                                  : ""
                              }
                            </div>
                          `
                        )
                        .join("")
                }
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const url = normalizeUrlValue(formData.get("url"));
  const reviewScope = String(formData.get("reviewScope") ?? "single");
  const privacyRegion = String(formData.get("privacyRegion") ?? "eu");
  const browserAuditEnabled = browserAuditInput?.checked !== false;
  const maxPages = 1;
  urlInput.value = url;
  await runScan(url, reviewScope, maxPages, privacyRegion === "us" ? "us" : "eu", browserAuditEnabled);
});

clearResultsButton.addEventListener("click", () => {
  resetResults();
  status.textContent = "Cleared the current results. Load a saved target or run a new scan.";
});

recentScansPanel.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const viewIndex = target.getAttribute("data-history-view");
  const runIndex = target.getAttribute("data-history-run");

  const index = viewIndex ?? runIndex;
  const item = index === null ? null : scanHistory[Number(index)];

  if (!item) {
    return;
  }

  if (viewIndex !== null) {
    loadResultIntoPanels(item.result, item.maxPages);
    navigateToView("scanner");
    status.textContent = `Loaded saved report for ${item.url}.`;
    return;
  }

  urlInput.value = item.url;
  privacyRegionInput.value = item.privacyRegion === "us" ? "us" : "eu";
  browserAuditInput.checked = item.browserAuditEnabled !== false;
  applyScopeUI("single");
  navigateToView("scanner");
  status.textContent = `Loaded ${item.url}. Run the scan to refresh this target as a single-page review.`;
});

window.addEventListener("hashchange", () => {
  setActiveView(normalizeViewFromHash(window.location.hash));
});

resetResults();
applyScopeUI("single");
setActiveView(normalizeViewFromHash(window.location.hash || VIEW_HASHES.scanner));

if (!window.location.hash) {
  window.location.hash = VIEW_HASHES.scanner;
}

void initializeScanHistory();