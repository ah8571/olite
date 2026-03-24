import * as cheerio from "cheerio";
import { Agent } from "undici";

import type { ToolType } from "./scanner-config";

export type ScanSeverity = "low" | "medium" | "high";
export type ComplianceLayer = "accessibility" | "privacy" | "consent" | "security";

export type ScanIssue = {
  layer: ComplianceLayer;
  pageUrl: string;
  title: string;
  detail: string;
  severity: ScanSeverity;
};

export type PageScanMetadata = {
  htmlLangPresent: boolean;
  imageCount: number;
  formCount: number;
  emailFieldCount: number;
  checkboxCount: number;
  policyLinkCount: number;
  trackingSignals: string[];
  securityHeadersPresent: string[];
  h1Count: number;
  headingCount: number;
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
  score: number;
  summary: string;
  scannedPages: number;
  discoveredPages: number;
  pageLimit: number;
  pages: PageScanResult[];
  issuesByLayer: Record<ComplianceLayer, ScanIssue[]>;
  limitationNotes: string[];
};

type AnalyzedPage = PageScanResult & {
  internalLinks: string[];
};

type SiteScanOptions = {
  startUrl: string;
  maxPages?: number;
  sameOriginOnly?: boolean;
};

type SinglePageMode = "hosted" | "local";

const TRACKING_PATTERNS = [
  { label: "Google Analytics", match: /(google-analytics|gtag\(|googletagmanager)/i },
  { label: "Meta Pixel", match: /(connect\.facebook\.net|fbq\()/i },
  { label: "LinkedIn Insight", match: /(snap\.licdn\.com)/i },
  { label: "Hotjar", match: /(static\.hotjar\.com|hj\()/i }
];

const SECURITY_HEADERS = [
  "strict-transport-security",
  "content-security-policy",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy"
];

const developmentInsecureDispatcher =
  process.env.NODE_ENV === "development" ? new Agent({ connect: { rejectUnauthorized: false } }) : null;

const TOOL_ISSUE_TITLES: Record<ToolType, string[]> = {
  accessibility: [
    "Missing html lang attribute",
    "Images missing alt text",
    "Inputs missing visible or programmatic labels",
    "Weak heading structure signals"
  ],
  privacy: [
    "Tracking signals without visible cookie wording",
    "No obvious privacy or cookie policy links detected",
    "Limited security header coverage"
  ]
};

function normalizeUrl(rawUrl: string): URL {
  const value = rawUrl.trim();
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const url = new URL(withProtocol);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }

  return url;
}

function clampScore(score: number): number {
  return Math.max(1, Math.min(100, Math.round(score)));
}

function scoreFromIssues(issues: Array<{ severity: ScanSeverity }>): number {
  let score = 100;

  for (const issue of issues) {
    score -= issue.severity === "high" ? 16 : issue.severity === "medium" ? 10 : 5;
  }

  return clampScore(score);
}

function normalizeLink(baseUrl: URL, href: string): string | null {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return null;
  }

  if (href.startsWith("javascript:")) {
    return null;
  }

  try {
    const resolved = new URL(href, baseUrl);
    resolved.hash = "";
    return resolved.toString();
  } catch {
    return null;
  }
}

async function fetchHtmlPage(url: URL) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  async function runFetch(allowInsecureTls: boolean) {
    return fetch(url.toString(), {
      headers: {
        "user-agent": "OliteScanBot/0.2 (+https://olite.dev)"
      },
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      ...(allowInsecureTls && developmentInsecureDispatcher
        ? { dispatcher: developmentInsecureDispatcher }
        : {})
    });
  }

  try {
    let response: Response;

    try {
      response = await runFetch(false);
    } catch (error) {
      const canRetryInsecurely =
        process.env.NODE_ENV === "development" &&
        developmentInsecureDispatcher !== null &&
        error instanceof TypeError &&
        error.cause instanceof Error &&
        "code" in error.cause &&
        error.cause.code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY";

      if (!canRetryInsecurely) {
        throw error;
      }

      response = await runFetch(true);
    }

    if (!response.ok) {
      throw new Error(`The target returned HTTP ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new Error("The target did not return an HTML page.");
    }

    return {
      response,
      html: await response.text()
    };
  } finally {
    clearTimeout(timeout);
  }
}

function analyzeHtmlPage(baseUrl: URL, responseUrl: string, html: string, headers: Headers): AnalyzedPage {
  const $ = cheerio.load(html);
  const title = $("title").first().text().trim() || baseUrl.hostname;
  const htmlLangPresent = Boolean($("html").attr("lang")?.trim());
  const imageCount = $("img").length;
  const missingAltCount = $("img")
    .filter((_, element) => $(element).attr("alt") === undefined)
    .length;
  const formCount = $("form").length;
  const unlabeledInputs = $("input, textarea, select")
    .filter((_, element) => {
      const id = $(element).attr("id");
      const ariaLabel = $(element).attr("aria-label");
      const ariaLabelledBy = $(element).attr("aria-labelledby");
      const wrappedByLabel = $(element).closest("label").length > 0;
      const linkedLabel = id ? $(`label[for="${id}"]`).length > 0 : false;

      return !wrappedByLabel && !linkedLabel && !ariaLabel && !ariaLabelledBy;
    })
    .length;
  const emailFieldCount = $("input[type='email']").length;
  const checkboxCount = $("input[type='checkbox']").length;
  const policyLinkCount = $("a")
    .filter((_, element) => /(privacy|cookie|terms)/i.test($(element).text()))
    .length;
  const cookieBannerSignal = /(cookie consent|accept cookies|cookie settings|privacy preferences)/i.test($.text());
  const consentSignal = /(subscribe|opt in|marketing consent|agree to receive|email updates)/i.test($.text());
  const trackingSignals = TRACKING_PATTERNS.filter((entry) => entry.match.test(html)).map((entry) => entry.label);
  const securityHeadersPresent = SECURITY_HEADERS.filter((header) => headers.has(header));
  const headings = $("h1, h2, h3, h4, h5, h6")
    .map((_, element) => Number(element.tagName.slice(1)))
    .get();
  const h1Count = headings.filter((level) => level === 1).length;
  const headingLevelSkip = headings.some((level, index) => index > 0 && level - headings[index - 1] > 1);
  const internalLinks = $("a[href]")
    .map((_, element) => normalizeLink(new URL(responseUrl), $(element).attr("href") ?? ""))
    .get()
    .filter((value): value is string => Boolean(value))
    .filter((value) => new URL(value).origin === new URL(responseUrl).origin);

  const issues: ScanIssue[] = [];

  if (!htmlLangPresent) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Missing html lang attribute",
      detail: "The page does not expose a language attribute on the html element.",
      severity: "medium"
    });
  }

  if (missingAltCount > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Images missing alt text",
      detail: `${missingAltCount} image${missingAltCount === 1 ? "" : "s"} appear to have no alt attribute.`,
      severity: missingAltCount > 4 ? "high" : "medium"
    });
  }

  if (unlabeledInputs > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Inputs missing visible or programmatic labels",
      detail: `${unlabeledInputs} form control${unlabeledInputs === 1 ? "" : "s"} may be unlabeled.`,
      severity: unlabeledInputs > 2 ? "high" : "medium"
    });
  }

  if (h1Count === 0 || headingLevelSkip) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Weak heading structure signals",
      detail:
        h1Count === 0
          ? "No h1 heading was detected on the page."
          : "Heading levels appear to skip in a way that may make the structure harder to follow.",
      severity: "low"
    });
  }

  if (!cookieBannerSignal && trackingSignals.length > 0) {
    issues.push({
      layer: "privacy",
      pageUrl: responseUrl,
      title: "Tracking signals without visible cookie wording",
      detail: `Detected ${trackingSignals.join(", ")} but could not find obvious cookie-banner wording on this page.`,
      severity: "medium"
    });
  }

  if (policyLinkCount === 0) {
    issues.push({
      layer: "privacy",
      pageUrl: responseUrl,
      title: "No obvious privacy or cookie policy links detected",
      detail: "This page did not expose a visible privacy, cookie, or terms link in its markup.",
      severity: "medium"
    });
  }

  if (emailFieldCount > 0 && checkboxCount === 0 && !consentSignal) {
    issues.push({
      layer: "consent",
      pageUrl: responseUrl,
      title: "Email capture without visible consent signals",
      detail: "An email field was found, but no checkbox or obvious consent wording was detected on the page.",
      severity: "medium"
    });
  }

  if (securityHeadersPresent.length < 2) {
    issues.push({
      layer: "security",
      pageUrl: responseUrl,
      title: "Limited security header coverage",
      detail: `Only ${securityHeadersPresent.length} of ${SECURITY_HEADERS.length} common security headers were detected.`,
      severity: "low"
    });
  }

  const score = scoreFromIssues(issues);
  const summary =
    issues.length === 0
      ? "No obvious issues were detected on this page in the current local analysis."
      : `${issues.length} issue${issues.length === 1 ? "" : "s"} surfaced on this page in the current local analysis.`;

  return {
    url: baseUrl.toString(),
    normalizedUrl: responseUrl,
    title,
    score,
    summary,
    issues,
    limitationNotes: [],
    metadata: {
      htmlLangPresent,
      imageCount,
      formCount,
      emailFieldCount,
      checkboxCount,
      policyLinkCount,
      trackingSignals,
      securityHeadersPresent,
      h1Count,
      headingCount: headings.length
    },
    internalLinks: Array.from(new Set(internalLinks))
  };
}

export async function scanSinglePage(rawUrl: string, mode: SinglePageMode = "local"): Promise<PageScanResult> {
  const url = normalizeUrl(rawUrl);
  const { response, html } = await fetchHtmlPage(url);
  const page = analyzeHtmlPage(url, response.url, html, response.headers);

  return {
    ...page,
    limitationNotes:
      mode === "hosted"
        ? [
            "This hosted scan only checks the single public page you entered.",
            "Authenticated flows, JavaScript-only states, and source-code-aware checks are not included in this free result."
          ]
        : ["This local page scan only evaluated the single page you entered."]
  };
}

async function analyzeFetchedPage(rawUrl: string, mode: SinglePageMode): Promise<AnalyzedPage> {
  const url = normalizeUrl(rawUrl);
  const { response, html } = await fetchHtmlPage(url);
  const page = analyzeHtmlPage(url, response.url, html, response.headers);

  return {
    ...page,
    limitationNotes:
      mode === "hosted"
        ? [
            "This hosted scan only checks the single public page you entered.",
            "Authenticated flows, JavaScript-only states, and source-code-aware checks are not included in this free result."
          ]
        : ["This local page scan only evaluated the single page you entered."]
  };
}

export async function scanPublicSite(options: SiteScanOptions): Promise<SiteScanResult> {
  const startUrl = normalizeUrl(options.startUrl);
  const maxPages = Math.max(1, Math.min(options.maxPages ?? 10, 50));
  const queue = [startUrl.toString()];
  const discovered = new Set(queue);
  const visited = new Set<string>();
  const pages: PageScanResult[] = [];
  const limitations = [
    `This local crawl stayed on the starting domain and stopped after ${maxPages} page${maxPages === 1 ? "" : "s"} at most.`,
    "Authenticated flows, JavaScript-only interaction states, and source-code-aware checks are not included in this first desktop pass."
  ];

  while (queue.length > 0 && pages.length < maxPages) {
    const current = queue.shift();

    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);

    try {
      const analyzedPage = await analyzeFetchedPage(current, "local");
      const { internalLinks, ...page } = analyzedPage;
      pages.push(page);

      for (const link of internalLinks) {
        const linkUrl = new URL(link);
        if (options.sameOriginOnly !== false && linkUrl.origin !== startUrl.origin) {
          continue;
        }

        if (!discovered.has(link)) {
          discovered.add(link);
          queue.push(link);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error while scanning the page.";
      limitations.push(`Could not scan ${current}: ${message}`);
    }
  }

  const issuesByLayer: Record<ComplianceLayer, ScanIssue[]> = {
    accessibility: [],
    privacy: [],
    consent: [],
    security: []
  };

  for (const page of pages) {
    for (const issue of page.issues) {
      issuesByLayer[issue.layer].push(issue);
    }
  }

  const allIssues = Object.values(issuesByLayer).flat();
  const score = scoreFromIssues(allIssues);
  const summary =
    allIssues.length === 0
      ? `No obvious issues were detected across ${pages.length} scanned page${pages.length === 1 ? "" : "s"}.`
      : `${allIssues.length} issue${allIssues.length === 1 ? "" : "s"} surfaced across ${pages.length} scanned page${pages.length === 1 ? "" : "s"}.`;

  return {
    startUrl: options.startUrl,
    normalizedUrl: startUrl.toString(),
    score,
    summary,
    scannedPages: pages.length,
    discoveredPages: discovered.size,
    pageLimit: maxPages,
    pages,
    issuesByLayer,
    limitationNotes: limitations
  };
}

export type HostedToolScanResult = {
  tool: ToolType;
  url: string;
  normalizedUrl: string;
  title: string;
  score: number;
  summary: string;
  issues: Array<{
    title: string;
    detail: string;
    severity: ScanSeverity;
  }>;
  limitationNotes: string[];
  metadata: PageScanMetadata;
};

export async function runHostedToolScan(tool: ToolType, rawUrl: string): Promise<HostedToolScanResult> {
  const page = await analyzeFetchedPage(rawUrl, "hosted");
  const allowedTitles = new Set(TOOL_ISSUE_TITLES[tool]);
  const filteredIssues = page.issues.filter((issue) => allowedTitles.has(issue.title));

  return {
    tool,
    url: rawUrl,
    normalizedUrl: page.normalizedUrl,
    title: page.title,
    score: scoreFromIssues(filteredIssues),
    summary:
      filteredIssues.length === 0
        ? "No obvious issues were detected in this lightweight public-page scan, but broader crawling may still reveal additional problems."
        : `${filteredIssues.length} issue${filteredIssues.length === 1 ? "" : "s"} surfaced in this lightweight public-page scan.`,
    issues: filteredIssues.map((issue) => ({
      title: issue.title,
      detail: issue.detail,
      severity: issue.severity
    })),
    limitationNotes: page.limitationNotes,
    metadata: page.metadata
  };
}