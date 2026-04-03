import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("oliteDesktop", {
  runScan: (payload: {
    url: string;
    reviewMode: "single";
    maxPages?: number;
    sitemapUrl?: string;
    privacyRegion?: "us" | "eu";
    browserAudit?: boolean;
  }) =>
    ipcRenderer.invoke("scanner:run-scan", payload) as Promise<unknown>,
  saveReport: (payload: { suggestedName: string; content: string }) =>
    ipcRenderer.invoke("scanner:save-report", payload) as Promise<unknown>,
  getScanHistory: () => ipcRenderer.invoke("scanner:get-scan-history") as Promise<unknown>,
  storeScanResult: (payload: unknown) =>
    ipcRenderer.invoke("scanner:store-scan-result", payload) as Promise<unknown>
});