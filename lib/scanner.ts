import * as cheerio from "cheerio";

import type { ToolType } from "@/lib/scanner-config";

type ScanIssue = {
  title: string;
  detail: string;
  severity: "low" | "medium" | "high";
};

export type ScanResult = {
  tool: ToolType;
  url: string;
  normalizedUrl: string;
  title: string;
  score: number;
  summary: string;
  issues: ScanIssue[];
  limitationNotes: string[];
  metadata: {
    htmlLangPresent: boolean;
    imageCount: number;
    formCount: number;
    emailFieldCount: number;
    checkboxCount: number;
    policyLinkCount: number;
    trackingSignals: string[];
    securityHeadersPresent: string[];
  };
};

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

export async function runBasicScan(tool: ToolType, rawUrl: string): Promise<ScanResult> {
  const url = normalizeUrl(rawUrl);

  const response = await fetch(url.toString(), {
    headers: {
      "user-agent": "OliteScanBot/0.1 (+https://olite.dev)"
    },
    redirect: "follow",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`The target returned HTTP ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    throw new Error("The target did not return an HTML page.");
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const pageTitle = $("title").first().text().trim() || url.hostname;
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
  const cookieBannerSignal = /(cookie consent|accept cookies|cookie settings|privacy preferences)/i.test(
    $.text()
  );
  const consentSignal = /(subscribe|opt in|marketing consent|agree to receive|email updates)/i.test($.text());
  const trackingSignals = TRACKING_PATTERNS.filter((entry) => entry.match.test(html)).map(
    (entry) => entry.label
  );
  const securityHeadersPresent = SECURITY_HEADERS.filter((header) => response.headers.has(header));

  const limitationNotes = [
    "This hosted scan only checks the single public page you entered.",
    "Authenticated flows, JavaScript-only states, and source-code-aware checks are not included in this free result."
  ];

  const issues: ScanIssue[] = [];

  if (!htmlLangPresent) {
    issues.push({
      title: "Missing html lang attribute",
      detail: "The page does not expose a language attribute on the html element.",
      severity: "medium"
    });
  }

  if (missingAltCount > 0) {
    issues.push({
      title: "Images missing alt text",
      detail: `${missingAltCount} image${missingAltCount === 1 ? "" : "s"} appear to have no alt attribute.`,
      severity: missingAltCount > 4 ? "high" : "medium"
    });
  }

  if (unlabeledInputs > 0) {
    issues.push({
      title: "Inputs missing visible or programmatic labels",
      detail: `${unlabeledInputs} form control${unlabeledInputs === 1 ? "" : "s"} may be unlabeled.`,
      severity: unlabeledInputs > 2 ? "high" : "medium"
    });
  }

  if (!cookieBannerSignal && trackingSignals.length > 0) {
    issues.push({
      title: "Tracking signals without visible cookie wording",
      detail: `Detected ${trackingSignals.join(", ")} but could not find obvious cookie-banner wording on this page.`,
      severity: "medium"
    });
  }

  if (policyLinkCount === 0) {
    issues.push({
      title: "No obvious privacy or cookie policy links detected",
      detail: "This page did not expose a visible privacy, cookie, or terms link in its markup.",
      severity: "medium"
    });
  }

  if (emailFieldCount > 0 && checkboxCount === 0 && !consentSignal) {
    issues.push({
      title: "Email capture without visible consent signals",
      detail: "An email field was found, but no checkbox or obvious consent wording was detected on the page.",
      severity: "medium"
    });
  }

  if (securityHeadersPresent.length < 2) {
    issues.push({
      title: "Limited security header coverage",
      detail: `Only ${securityHeadersPresent.length} of ${SECURITY_HEADERS.length} common security headers were detected.`,
      severity: "low"
    });
  }

  let score = 95;
  for (const issue of issues) {
    score -= issue.severity === "high" ? 16 : issue.severity === "medium" ? 10 : 5;
  }

  const filteredIssues = issues.filter((issue) => {
    if (tool === "accessibility") {
      return ["Missing html lang attribute", "Images missing alt text", "Inputs missing visible or programmatic labels"].includes(
        issue.title
      );
    }

    if (tool === "privacy") {
      return [
        "Tracking signals without visible cookie wording",
        "No obvious privacy or cookie policy links detected",
        "Limited security header coverage"
      ].includes(issue.title);
    }

    return ["Email capture without visible consent signals", "No obvious privacy or cookie policy links detected"].includes(
      issue.title
    );
  });

  const finalScore = clampScore(score - Math.max(0, issues.length - filteredIssues.length) * 4);
  const summary =
    filteredIssues.length === 0
      ? "No obvious issues were detected in this lightweight public-page scan, but broader crawling may still reveal additional problems."
      : `${filteredIssues.length} issue${filteredIssues.length === 1 ? "" : "s"} surfaced in this lightweight public-page scan.`;

  return {
    tool,
    url: rawUrl,
    normalizedUrl: response.url,
    title: pageTitle,
    score: finalScore,
    summary,
    issues: filteredIssues,
    limitationNotes,
    metadata: {
      htmlLangPresent,
      imageCount,
      formCount,
      emailFieldCount,
      checkboxCount,
      policyLinkCount,
      trackingSignals,
      securityHeadersPresent
    }
  };
}