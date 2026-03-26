const form = document.getElementById("scan-form");
const status = document.getElementById("status");
const submitButton = document.getElementById("submit-button");
const summaryPanel = document.getElementById("summary-panel");
const layerPanel = document.getElementById("layer-panel");
const issueRowsPanel = document.getElementById("issue-rows-panel");
const pagesPanel = document.getElementById("pages-panel");
const recentScansPanel = document.getElementById("recent-scans");
const savedTargetsPanel = document.getElementById("saved-targets");
const urlInput = document.getElementById("url");
const sitemapUrlInput = document.getElementById("sitemapUrl");
const maxPagesInput = document.getElementById("maxPages");
const saveTargetButton = document.getElementById("save-target-button");
const clearResultsButton = document.getElementById("clear-results-button");

const TARGET_STORAGE_KEY = "olite-desktop-saved-targets";

let lastResult = null;
let scanHistory = [];
let savedTargets = [];

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

function loadSavedTargets() {
  try {
    const raw = window.localStorage.getItem(TARGET_STORAGE_KEY);

    if (!raw) {
      savedTargets = [];
      return;
    }

    const parsed = JSON.parse(raw);
    savedTargets = Array.isArray(parsed) ? parsed : [];
  } catch {
    savedTargets = [];
  }
}

function persistSavedTargets() {
  window.localStorage.setItem(TARGET_STORAGE_KEY, JSON.stringify(savedTargets));
}

function renderSavedTargets() {
  if (savedTargets.length === 0) {
    savedTargetsPanel.className = "recent-list empty-list";
    savedTargetsPanel.innerHTML = '<p class="form-note">Saved test targets will appear here after you add one from the scan form.</p>';
    return;
  }

  savedTargetsPanel.className = "recent-list";
  savedTargetsPanel.innerHTML = savedTargets
    .map(
      (item, index) => `
        <article class="recent-item">
          <div>
            <strong>${escapeHtml(item.host)}</strong>
            <p class="muted-text">${escapeHtml(item.url)}</p>
            ${item.sitemapUrl ? `<p class="muted-text">Sitemap ${escapeHtml(item.sitemapUrl)}</p>` : ""}
            <p class="muted-text">Default page limit ${escapeHtml(item.maxPages)}</p>
          </div>
          <div class="recent-actions">
            <button class="recent-button" type="button" data-target-load="${index}">Load</button>
            <button class="recent-button" type="button" data-target-run="${index}">Scan now</button>
            <button class="recent-button" type="button" data-target-remove="${index}">Remove</button>
          </div>
        </article>
      `
    )
    .join("");
}

function resetResults() {
  lastResult = null;
  summaryPanel.className = "panel result-panel empty-state";
  summaryPanel.innerHTML = `
    <p class="kicker">Summary</p>
    <h2>Your scan summary will appear here.</h2>
    <p class="lede">After the crawl finishes, you will see total pages scanned, grouped issues by layer, and per-page findings.</p>
  `;
  layerPanel.className = "panel result-panel hidden";
  layerPanel.innerHTML = "";
  issueRowsPanel.className = "panel result-panel hidden";
  issueRowsPanel.innerHTML = "";
  pagesPanel.className = "panel result-panel hidden";
  pagesPanel.innerHTML = "";
}

async function runScan(url, maxPages, sitemapUrl = "") {
  status.textContent = "Scanning...";
  submitButton.disabled = true;

  try {
    const result = await window.oliteDesktop.scanSite({ url, maxPages, sitemapUrl: sitemapUrl || undefined });
    loadResultIntoPanels(result, maxPages);
    await storeCompletedScan(result, maxPages, sitemapUrl || undefined);
    status.textContent = "Scan complete.";
  } catch (error) {
    const message = error instanceof Error ? error.message : "The scan could not be completed.";
    status.textContent = message;
  } finally {
    submitButton.disabled = false;
  }
}

function saveCurrentTarget() {
  try {
    const normalizedUrl = normalizeUrlValue(urlInput.value);
    const normalizedSitemapUrl = sitemapUrlInput.value.trim() ? normalizeUrlValue(sitemapUrlInput.value) : "";
    const maxPages = Number(maxPagesInput.value || 10);
    const host = new URL(normalizedUrl).hostname;

    savedTargets = [
      { url: normalizedUrl, host, maxPages, sitemapUrl: normalizedSitemapUrl },
      ...savedTargets.filter(
        (item) => item.url !== normalizedUrl || (item.sitemapUrl || "") !== normalizedSitemapUrl
      )
    ].slice(0, 12);

    persistSavedTargets();
    renderSavedTargets();
    urlInput.value = normalizedUrl;
    sitemapUrlInput.value = normalizedSitemapUrl;
    status.textContent = `Saved ${normalizedUrl} as a reusable test target.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "The target could not be saved.";
    status.textContent = message;
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
        <article class="recent-item">
          <div>
            <strong>${escapeHtml(item.host)}</strong>
            <p class="muted-text">${escapeHtml(item.url)}</p>
            <p class="muted-text">Saved ${escapeHtml(formatRanAt(item.ranAt))}</p>
          </div>
          <div class="recent-meta">
            <span class="stat-pill">Score: ${escapeHtml(item.score)}</span>
            <span class="stat-pill">Pages: ${escapeHtml(item.maxPages)}</span>
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
  urlInput.value = result.normalizedUrl;
  sitemapUrlInput.value = result.sitemapUrl ?? "";
  maxPagesInput.value = String(maxPages);
  renderSummary(result);
  renderLayers(result);
  renderIssueRows(result);
  renderPages(result);
}

async function storeCompletedScan(result, maxPages, sitemapUrl) {
  const nextHistory = await window.oliteDesktop.storeScanResult({
    url: result.normalizedUrl,
    host: new URL(result.normalizedUrl).hostname,
    maxPages,
    sitemapUrl,
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
        locationSummary: issue.locationSummary ?? "",
        selector: item?.selector ?? "",
        snippet: item?.snippet ?? "",
        note: item?.note ?? ""
      }));
    })
  );
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

function renderSummary(result) {
  const scannedUrls = result.pages.map((page) => page.normalizedUrl);

  summaryPanel.classList.remove("empty-state");
  summaryPanel.innerHTML = `
    <div class="summary-head">
      <div>
        <p class="kicker">Summary</p>
        <h2>${escapeHtml(result.summary)}</h2>
        <p class="lede">Start URL: ${escapeHtml(result.normalizedUrl)}</p>
      </div>
      <div class="summary-score">Score ${escapeHtml(result.score)}/100</div>
    </div>
    <div class="summary-stats">
      <span class="stat-pill">Scanned pages: ${escapeHtml(result.scannedPages)}</span>
      <span class="stat-pill">Discovered pages: ${escapeHtml(result.discoveredPages)}</span>
      <span class="stat-pill">Page limit: ${escapeHtml(result.pageLimit)}</span>
      ${result.sitemapUrl ? `<span class="stat-pill">Sitemap used</span>` : ""}
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
    <div class="actions">
      <button id="export-json-button" class="button secondary-button" type="button">Export JSON report</button>
      <button id="export-csv-button" class="button secondary-button" type="button">Export CSV issue list</button>
    </div>
    <div class="issue-list">
      ${result.limitationNotes.map((note) => `<div class="issue-card"><p class="issue-copy">${escapeHtml(note)}</p></div>`).join("")}
    </div>
  `;

  document.getElementById("export-json-button")?.addEventListener("click", exportReport);
  document.getElementById("export-csv-button")?.addEventListener("click", exportIssueCsv);
}

function renderIssueRows(result) {
  const rows = flattenIssueRows(result);

  issueRowsPanel.classList.remove("hidden");
  issueRowsPanel.innerHTML = `
    <p class="kicker">Issue Rows</p>
    <h2>Table view of the exportable issue list</h2>
    <p class="form-note">This mirrors the CSV structure so teams can review findings in-app before exporting.</p>
    ${
      rows.length === 0
        ? '<div class="issue-card"><p class="issue-copy">No issue rows to display for this scan.</p></div>'
        : `
          <div class="table-wrap">
            <table class="issue-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Layer</th>
                  <th>Severity</th>
                  <th>Issue</th>
                  <th>Location</th>
                  <th>Selector</th>
                </tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (row) => `
                      <tr>
                        <td>
                          <strong>${escapeHtml(row.pageTitle)}</strong>
                          <div class="table-subtext">${escapeHtml(row.pageUrl)}</div>
                        </td>
                        <td>${escapeHtml(row.layer)}</td>
                        <td><span class="severity-badge severity-${escapeHtml(row.severity)}">${escapeHtml(severityLabel(row.severity))}</span></td>
                        <td>
                          <strong>${escapeHtml(row.issueTitle)}</strong>
                          <div class="table-subtext">${escapeHtml(row.issueDetail)}</div>
                        </td>
                        <td>
                          <div>${escapeHtml(row.locationSummary || "-")}</div>
                          ${row.note ? `<div class="table-subtext">${escapeHtml(row.note)}</div>` : ""}
                        </td>
                        <td><div class="table-mono">${escapeHtml(row.selector || "-")}</div></td>
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

function renderLayers(result) {
  const layers = [
    ["accessibility", "Accessibility"],
    ["privacy", "Privacy"],
    ["consent", "Consent"],
    ["security", "Security"]
  ];

  layerPanel.classList.remove("hidden");
  layerPanel.innerHTML = `
    <p class="kicker">Compliance Layers</p>
    <h2>Grouped findings by layer</h2>
    <div class="layer-grid">
      ${layers
        .map(([key, label]) => {
          const issues = result.issuesByLayer[key] ?? [];

          return `
            <article class="layer-card">
              <div class="summary-head">
                <div>
                  <h3>${escapeHtml(label)}</h3>
                  <p class="layer-note">${escapeHtml(issues.length === 0 ? "No obvious issues surfaced in this layer." : `${issues.length} issue${issues.length === 1 ? "" : "s"} surfaced.`)}</p>
                </div>
                <div class="layer-score">${escapeHtml(issues.length)} issue${issues.length === 1 ? "" : "s"}</div>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderPages(result) {
  pagesPanel.classList.remove("hidden");
  pagesPanel.innerHTML = `
    <p class="kicker">Page Findings</p>
    <h2>What the crawl found page by page</h2>
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
  const sitemapUrl = String(formData.get("sitemapUrl") ?? "").trim();
  const maxPages = Number(formData.get("maxPages") ?? 10);
  urlInput.value = url;
  sitemapUrlInput.value = sitemapUrl ? normalizeUrlValue(sitemapUrl) : "";
  await runScan(url, maxPages, sitemapUrlInput.value);
});

saveTargetButton.addEventListener("click", saveCurrentTarget);

clearResultsButton.addEventListener("click", () => {
  resetResults();
  status.textContent = "Cleared the current results. Load a saved target or run a new scan.";
});

recentScansPanel.addEventListener("click", (event) => {
  sitemapUrlInput.value = item.result.sitemapUrl ?? item.sitemapUrl ?? "";
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
    status.textContent = `Loaded saved report for ${item.url}.`;
    return;
  }

  urlInput.value = item.url;
  maxPagesInput.value = String(item.maxPages);
  status.textContent = `Loaded ${item.url}. Run the scan to refresh the result.`;
});

savedTargetsPanel.addEventListener("click", async (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  const loadIndex = target.getAttribute("data-target-load");
  const runIndex = target.getAttribute("data-target-run");
  const removeIndex = target.getAttribute("data-target-remove");

  const indexValue = loadIndex ?? runIndex ?? removeIndex;
  const item = indexValue === null ? null : savedTargets[Number(indexValue)];

  if (!item) {
    return;
  }

  if (removeIndex !== null) {
    savedTargets = savedTargets.filter((_, index) => index !== Number(removeIndex));
    persistSavedTargets();
    renderSavedTargets();
    status.textContent = `Removed ${item.url} from saved test targets.`;
    return;
  }

  urlInput.value = item.url;
  sitemapUrlInput.value = item.sitemapUrl ?? "";
  maxPagesInput.value = String(item.maxPages);

  if (loadIndex !== null) {
    status.textContent = `Loaded ${item.url}. Run the scan when you want a fresh result.`;
    return;
  }

  await runScan(item.url, item.maxPages, item.sitemapUrl ?? "");
});

loadSavedTargets();
renderSavedTargets();
resetResults();
void initializeScanHistory();