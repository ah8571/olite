import type { ToolType } from "../scanner-config";

export type ScanSeverity = "low" | "medium" | "high";
export type ComplianceLayer = "accessibility" | "privacy" | "consent" | "security";
export type PrivacyRegion = "us" | "eu";

export type ScanIssueEvidence = {
  selector: string;
  snippet: string;
  note?: string;
};

export type IssueConfidenceLevel = "high" | "medium" | "low";
export type IssueVerificationMethod =
  | "static-dom"
  | "rendered-browser"
  | "accessibility-tree"
  | "interaction-flow"
  | "network-runtime";

export type RuntimeAuditPhase = "before-interaction" | "after-reject" | "after-accept";
export type RuntimeAuditInteraction = "none" | "reject" | "accept" | "failed";

export type RuntimeAuditTrackerRequest = {
  label: string;
  url: string;
  resourceType: string;
  phase: RuntimeAuditPhase;
};

export type RuntimeAuditCookie = {
  label: string;
  name: string;
  domain: string;
  path: string;
  phase: RuntimeAuditPhase;
};

export type RuntimeAuditControl = {
  kind: "accept" | "reject" | "manage";
  label: string;
  selector: string;
};

export type RuntimeAuditGpcComparison = {
  simulated: boolean;
  baselineTrackerRequestCount: number;
  baselineTrackerCookieCount: number;
  gpcTrackerRequestCount: number;
  gpcTrackerCookieCount: number;
  behaviorChanged: boolean;
};

export type PageRuntimeAudit = {
  ran: boolean;
  consentControls: RuntimeAuditControl[];
  interactionAttempted: RuntimeAuditInteraction;
  sampledUrls: string[];
  gpcComparison?: RuntimeAuditGpcComparison;
  trackerRequests: RuntimeAuditTrackerRequest[];
  trackerCookies: RuntimeAuditCookie[];
  initialTrackerRequestCount: number;
  initialTrackerCookieCount: number;
  postInteractionTrackerRequestCount: number;
  postInteractionTrackerCookieCount: number;
};

export type ScanIssue = {
  layer: ComplianceLayer;
  pageUrl: string;
  title: string;
  detail: string;
  severity: ScanSeverity;
  suggestedFix?: string;
  issueFamily?: string;
  verificationMethod?: IssueVerificationMethod;
  confidenceLevel?: IssueConfidenceLevel;
  manualReviewRecommended?: boolean;
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
  runtimeAudit?: PageRuntimeAudit;
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
    suggestedFix?: string;
    issueFamily?: string;
    verificationMethod?: IssueVerificationMethod;
    confidenceLevel?: IssueConfidenceLevel;
    manualReviewRecommended?: boolean;
    locationSummary?: string;
    evidence?: ScanIssueEvidence[];
  }>;
  limitationNotes: string[];
  metadata: PageScanMetadata;
};