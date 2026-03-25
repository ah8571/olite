const form = document.getElementById("scan-form");
const status = document.getElementById("status");
const submitButton = document.getElementById("submit-button");
const summaryPanel = document.getElementById("summary-panel");
const layerPanel = document.getElementById("layer-panel");
const pagesPanel = document.getElementById("pages-panel");
const recentScansPanel = document.getElementById("recent-scans");
const urlInput = document.getElementById("url");
const maxPagesInput = document.getElementById("maxPages");

let lastResult = null;
let scanHistory = [];

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
  maxPagesInput.value = String(maxPages);
  renderSummary(result);
  renderLayers(result);
  renderPages(result);
}

async function storeCompletedScan(result, maxPages) {
  const nextHistory = await window.oliteDesktop.storeScanResult({
    url: result.normalizedUrl,
    host: new URL(result.normalizedUrl).hostname,
    maxPages,
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

function severityLabel(severity) {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function renderSummary(result) {
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
    </div>
    <div class="actions">
      <button id="export-button" class="button secondary-button" type="button">Export JSON report</button>
    </div>
    <div class="issue-list">
      ${result.limitationNotes.map((note) => `<div class="issue-card"><p class="issue-copy">${escapeHtml(note)}</p></div>`).join("")}
    </div>
  `;

  document.getElementById("export-button")?.addEventListener("click", exportReport);
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
  const url = String(formData.get("url") ?? "").trim();
  const maxPages = Number(formData.get("maxPages") ?? 10);

  status.textContent = "Scanning...";
  submitButton.disabled = true;

  try {
    const result = await window.oliteDesktop.scanSite({ url, maxPages });
    loadResultIntoPanels(result, maxPages);
    await storeCompletedScan(result, maxPages);
    status.textContent = "Scan complete.";
  } catch (error) {
    const message = error instanceof Error ? error.message : "The scan could not be completed.";
    status.textContent = message;
  } finally {
    submitButton.disabled = false;
  }
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
    status.textContent = `Loaded saved report for ${item.url}.`;
    return;
  }

  urlInput.value = item.url;
  maxPagesInput.value = String(item.maxPages);
  status.textContent = `Loaded ${item.url}. Run the scan to refresh the result.`;
});

void initializeScanHistory();