import type { ToolType } from "../scanner-config";

export type ScanSeverity = "low" | "medium" | "high";
export type ComplianceLayer = "accessibility" | "privacy" | "consent" | "security";
export type PrivacyRegion = "us" | "eu";

export type ScanIssueEvidence = {
  selector: string;
  snippet: string;
  note?: string;
};

export type ScanIssue = {
  layer: ComplianceLayer;
  pageUrl: string;
  title: string;
  detail: string;
  severity: ScanSeverity;
  locationSummary?: string;
  evidence?: ScanIssueEvidence[];
};

export type PageScanMetadata = {
  privacyRegion: PrivacyRegion;
  htmlLangPresent: boolean;
  imageCount: number;
  formCount: number;
  emailFieldCount: number;
  checkboxCount: number;
  placeholderOnlyFieldCount: number;
  policyLinkCount: number;
  privacyRightsLinkCount: number;
  doNotSellLinkCount: number;
  accessRequestSignalPresent: boolean;
  correctionRequestSignalPresent: boolean;
  deletionRequestSignalPresent: boolean;
  gpcSignalPresent: boolean;
  trackingSignals: string[];
  securityHeadersPresent: string[];
  h1Count: number;
  headingCount: number;
  mainLandmarkCount: number;
  skipLinkCount: number;
  positiveTabindexCount: number;
  insecureFormActionCount: number;
};

export type PageScanResult = {
  url: string;
  normalizedUrl: string;
  title: string;
  score: number;
  summary: string;
  issues: ScanIssue[];
  limitationNotes: string[];
  metadata: PageScanMetadata;
};

export type SiteScanResult = {
  startUrl: string;
  normalizedUrl: string;
  sitemapUrl?: string;
  score: number;
  summary: string;
  scannedPages: number;
  discoveredPages: number;
  pageLimit: number;
  pages: PageScanResult[];
  issuesByLayer: Record<ComplianceLayer, ScanIssue[]>;
  limitationNotes: string[];
};

export type AnalyzedPage = PageScanResult & {
  internalLinks: string[];
};

export type SiteScanOptions = {
  startUrl: string;
  sitemapUrl?: string;
  maxPages?: number;
  sameOriginOnly?: boolean;
  privacyRegion?: PrivacyRegion;
};

export type SinglePageMode = "hosted" | "local";

export type HostedToolScanResult = {
  tool: ToolType;
  url: string;
  normalizedUrl: string;
  title: string;
  score: number;
  summary: string;
  issues: Array<{
    layer: ComplianceLayer;
    title: string;
    detail: string;
    severity: ScanSeverity;
    locationSummary?: string;
    evidence?: ScanIssueEvidence[];
  }>;
  limitationNotes: string[];
  metadata: PageScanMetadata;
};