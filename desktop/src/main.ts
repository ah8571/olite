import path from "node:path";
import { writeFile } from "node:fs/promises";

import { app, BrowserWindow, dialog, ipcMain } from "electron";

import { scanPublicSite } from "../../lib/scanner-core";

function createWindow() {
  const window = new BrowserWindow({
    width: 1260,
    height: 860,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: "#f7f2e8",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  void window.loadFile(path.resolve(__dirname, "../../../index.html"));
}

ipcMain.handle("scanner:run-site-scan", async (_event, payload: { url: string; maxPages: number }) => {
  return scanPublicSite({
    startUrl: payload.url,
    maxPages: payload.maxPages,
    sameOriginOnly: true
  });
});

ipcMain.handle(
  "scanner:save-report",
  async (_event, payload: { suggestedName: string; content: string }) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: "Save Olite scan report",
      defaultPath: payload.suggestedName,
      filters: [{ name: "JSON report", extensions: ["json"] }]
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