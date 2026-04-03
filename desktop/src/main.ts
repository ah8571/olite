import path from "node:path";
import { writeFile } from "node:fs/promises";

import { app, BrowserWindow, dialog, ipcMain } from "electron";

import { scanSinglePage } from "../../lib/scanner-core";
import type { PrivacyRegion, SiteScanResult } from "../../lib/scanner-core";
import { augmentSiteResultWithAxeAccessibility } from "./axe-accessibility";
import { augmentSiteResultWithRenderedAccessibility } from "./rendered-accessibility";
import { augmentSiteResultWithRuntimePrivacyAudit } from "./runtime-privacy-audit";

const HISTORY_FILE_NAME = "scan-history.json";
const MAX_STORED_SCANS = 12;
const isDevelopment = !app.isPackaged;

type ReviewMode = "single";
type StoredReviewMode = "single" | "focused" | "full";

type StoredScanHistoryItem = {
  url: string;
  host: string;
  maxPages: number;
  reviewMode?: StoredReviewMode;
  privacyRegion?: PrivacyRegion;
  browserAuditEnabled?: boolean;
  sitemapUrl?: string;
  score: number;
  summary: string;
  ranAt: string;
  result: SiteScanResult;
};

function buildSiteResultFromSinglePage(page: Awaited<ReturnType<typeof scanSinglePage>>, startUrl: string): SiteScanResult {
  const issuesByLayer = {
    accessibility: page.issues.filter((issue) => issue.layer === "accessibility"),
    privacy: page.issues.filter((issue) => issue.layer === "privacy"),
    consent: page.issues.filter((issue) => issue.layer === "consent"),
    security: page.issues.filter((issue) => issue.layer === "security")
  };

  return {
    startUrl,
    normalizedUrl: page.normalizedUrl,
    score: page.score,
    summary: page.summary,
    scannedPages: 1,
    discoveredPages: 1,
    pageLimit: 1,
    pages: [page],
    issuesByLayer,
    limitationNotes: page.limitationNotes
  };
}

function getHistoryFilePath() {
  return path.join(app.getPath("userData"), HISTORY_FILE_NAME);
}

async function readStoredScanHistory(): Promise<StoredScanHistoryItem[]> {
  try {
    const historyPath = getHistoryFilePath();
    const raw = await import("node:fs/promises").then(({ readFile }) => readFile(historyPath, "utf8"));
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as StoredScanHistoryItem[]) : [];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    return [];
  }
}

async function writeStoredScanHistory(items: StoredScanHistoryItem[]) {
  await writeFile(getHistoryFilePath(), JSON.stringify(items, null, 2), "utf8");
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 820,
    minHeight: 620,
    backgroundColor: "#f7f2e8",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  void window.loadFile(path.resolve(__dirname, "../../../index.html"));

  if (isDevelopment) {
    window.webContents.openDevTools({ mode: "detach" });
  }
}

ipcMain.handle(
  "scanner:run-scan",
  async (
    _event,
    payload: {
      url: string;
      reviewMode: ReviewMode;
      maxPages?: number;
      sitemapUrl?: string;
      privacyRegion?: PrivacyRegion;
      browserAudit?: boolean;
    }
  ) => {
    if (payload.reviewMode !== "single") {
      throw new Error("Broader crawl depth requires paid activation and is not available in this build.");
    }

    const page = await scanSinglePage(payload.url, "local", payload.privacyRegion);
    let result = buildSiteResultFromSinglePage(page, payload.url);
    result = await augmentSiteResultWithAxeAccessibility(result);
    result = await augmentSiteResultWithRenderedAccessibility(result);

    if (payload.browserAudit !== false) {
      result = await augmentSiteResultWithRuntimePrivacyAudit(result);
    } else {
      result = {
        ...result,
        limitationNotes: [
          ...result.limitationNotes,
          "Runtime browser audit was disabled for this desktop scan."
        ]
      };
    }

    return result;
  }
);

ipcMain.handle("scanner:get-scan-history", async () => {
  return readStoredScanHistory();
});

ipcMain.handle("scanner:store-scan-result", async (_event, payload: StoredScanHistoryItem) => {
  const history = await readStoredScanHistory();
  const deduped = history.filter(
    (item) =>
      item.result.normalizedUrl !== payload.result.normalizedUrl ||
      item.maxPages !== payload.maxPages ||
      (item.sitemapUrl ?? "") !== (payload.sitemapUrl ?? "") ||
      (item.privacyRegion ?? "eu") !== (payload.privacyRegion ?? "eu") ||
      (item.browserAuditEnabled ?? true) !== (payload.browserAuditEnabled ?? true)
  );

  const nextHistory = [payload, ...deduped].slice(0, MAX_STORED_SCANS);
  await writeStoredScanHistory(nextHistory);

  return nextHistory;
});

ipcMain.handle(
  "scanner:save-report",
  async (_event, payload: { suggestedName: string; content: string }) => {
    const isCsv = payload.suggestedName.toLowerCase().endsWith(".csv");
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: "Save Olite scan report",
      defaultPath: payload.suggestedName,
      filters: isCsv
        ? [{ name: "CSV report", extensions: ["csv"] }]
        : [{ name: "JSON report", extensions: ["json"] }]
    });

    if (canceled || !filePath) {
      return { saved: false };
    }

    await writeFile(filePath, payload.content, "utf8");

    return {
      saved: true,
      filePath
    };
  }
);

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});