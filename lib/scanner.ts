import type { ToolType } from "./scanner-config";

import { runHostedToolScan, type HostedToolScanResult } from "./scanner-core";

export type ScanResult = HostedToolScanResult;

export async function runBasicScan(tool: ToolType, rawUrl: string): Promise<ScanResult> {
  return runHostedToolScan(tool, rawUrl);
}