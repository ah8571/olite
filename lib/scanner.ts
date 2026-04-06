import type { PrivacyRegion } from "./scan/types";
import { toolOrder, type ToolType } from "./scanner-config";

import { runHostedToolScan, type HostedToolScanResult } from "./scanner-core";

export type ScanResult = HostedToolScanResult;
export type HomepageScanResult = {
  normalizedUrl: string;
  title: string;
  privacyRegion: PrivacyRegion;
  totalIssues: number;
  scans: Record<ToolType, HostedToolScanResult>;
};

export async function runBasicScan(tool: ToolType, rawUrl: string, privacyRegion?: PrivacyRegion): Promise<ScanResult> {
  return runHostedToolScan(tool, rawUrl, privacyRegion);
}

export async function runHomepageScan(rawUrl: string, privacyRegion?: PrivacyRegion): Promise<HomepageScanResult> {
  const region = privacyRegion === "us" ? "us" : "eu";
  const scanEntries = await Promise.all(
    toolOrder.map(async (tool) => {
      const result = await runHostedToolScan(tool, rawUrl, tool === "accessibility" ? undefined : region);
      return [tool, result] as const;
    })
  );
  const scans = Object.fromEntries(scanEntries) as Record<ToolType, HostedToolScanResult>;
  const primaryResult = scans.accessibility;

  return {
    normalizedUrl: primaryResult.normalizedUrl,
    title: primaryResult.title,
    privacyRegion: region,
    totalIssues: toolOrder.reduce((count, tool) => count + scans[tool].issues.length, 0),
    scans
  };
}