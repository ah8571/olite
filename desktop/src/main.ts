import path from "node:path";
import { writeFile } from "node:fs/promises";

import { app, BrowserWindow, dialog, ipcMain } from "electron";

import { scanPublicSite } from "../../lib/scanner-core";
import type { SiteScanResult } from "../../lib/scanner-core";

const HISTORY_FILE_NAME = "scan-history.json";
const MAX_STORED_SCANS = 12;
const isDevelopment = !app.isPackaged;

type StoredScanHistoryItem = {
  url: string;
  host: string;
  maxPages: number;
  sitemapUrl?: string;
  score: number;
  summary: string;
  ranAt: string;
  result: SiteScanResult;
};

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

ipcMain.handle("scanner:run-site-scan", async (_event, payload: { url: string; maxPages: number; sitemapUrl?: string }) => {
  return scanPublicSite({
    startUrl: payload.url,
    sitemapUrl: payload.sitemapUrl,
    maxPages: payload.maxPages,
    sameOriginOnly: true
  });
});

ipcMain.handle("scanner:get-scan-history", async () => {
  return readStoredScanHistory();
});

ipcMain.handle("scanner:store-scan-result", async (_event, payload: StoredScanHistoryItem) => {
  const history = await readStoredScanHistory();
  const deduped = history.filter(
    (item) =>
      item.result.normalizedUrl !== payload.result.normalizedUrl ||
      item.maxPages !== payload.maxPages ||
      (item.sitemapUrl ?? "") !== (payload.sitemapUrl ?? "")
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