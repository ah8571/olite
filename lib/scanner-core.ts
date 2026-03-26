import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { Agent } from "undici";

import type { ToolType } from "./scanner-config";

export type ScanSeverity = "low" | "medium" | "high";
export type ComplianceLayer = "accessibility" | "privacy" | "consent" | "security";

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

type AnalyzedPage = PageScanResult & {
  internalLinks: string[];
};

type SiteScanOptions = {
  startUrl: string;
  sitemapUrl?: string;
  maxPages?: number;
  sameOriginOnly?: boolean;
};

type SinglePageMode = "hosted" | "local";

const TRACKING_PATTERNS = [
  { label: "Google Analytics", match: /(google-analytics|gtag\(|googletagmanager)/i },
  { label: "Meta Pixel", match: /(connect\.facebook\.net|fbq\()/i },
  { label: "LinkedIn Insight", match: /(snap\.licdn\.com)/i },
  { label: "Hotjar", match: /(static\.hotjar\.com|hj\()/i },
  { label: "Microsoft Clarity", match: /(clarity\.ms|clarity\()/i },
  { label: "TikTok Pixel", match: /(analytics\.tiktok\.com|ttq\()/i },
  { label: "X Ads", match: /(static\.ads-twitter\.com|twq\()/i }
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
    "Missing page title",
    "Missing html lang attribute",
    "Images missing alt text",
    "Inputs missing visible or programmatic labels",
    "Weak heading structure signals",
    "Buttons without accessible names",
    "Links without accessible names",
    "Iframes missing title attributes"
  ],
  privacy: [
    "Tracking signals without visible cookie wording",
    "No obvious privacy or cookie policy links detected",
    "Cookie banner without obvious reject or manage controls",
    "Email capture without visible privacy cues",
    "Limited security header coverage"
  ]
};

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function truncateText(value: string, maxLength = 180): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1).trimEnd()}...` : value;
}

function escapeSelectorValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function isTagNode(node: AnyNode | null): node is AnyNode & { tagName: string } {
  return Boolean(node && "tagName" in node && typeof node.tagName === "string");
}

function getNodeSelector($: cheerio.CheerioAPI, element: AnyNode): string {
  const path: string[] = [];
  let current: AnyNode | null = element;

  while (current && current.type !== "root") {
    if (!isTagNode(current)) {
      current = current.parent ?? null;
      continue;
    }

    const node = $(current);
    const tagName = current.tagName.toLowerCase();
    const id = normalizeText(node.attr("id"));

    if (id) {
      path.unshift(`${tagName}[id="${escapeSelectorValue(id)}"]`);
      break;
    }

    const classNames = normalizeText(node.attr("class"))
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((className) => className.replace(/[^a-zA-Z0-9_-]/g, ""))
      .filter(Boolean);

    const siblingTags = (current.parent?.children ?? []).filter(
      (sibling) => isTagNode(sibling) && sibling.tagName === tagName
    );
    const siblingIndex = siblingTags.indexOf(current) + 1;
    const classSuffix = classNames.length > 0 ? `.${classNames.join(".")}` : "";
    path.unshift(`${tagName}${classSuffix}:nth-of-type(${Math.max(siblingIndex, 1)})`);

    current = current.parent ?? null;
  }

  return path.join(" > ");
}

function getElementSnippet($: cheerio.CheerioAPI, element: AnyNode): string {
  return truncateText(normalizeText($.html(element) ?? ""), 220);
}

function buildElementEvidence(
  $: cheerio.CheerioAPI,
  elements: AnyNode[],
  noteBuilder?: (element: AnyNode, index: number) => string | undefined,
  maxItems = 5
): ScanIssueEvidence[] {
  return elements.slice(0, maxItems).map((element, index) => ({
    selector: getNodeSelector($, element),
    snippet: getElementSnippet($, element),
    ...(noteBuilder ? { note: noteBuilder(element, index) } : {})
  }));
}

function getReferencedText($: cheerio.CheerioAPI, idList: string): string {
  const ids = idList.split(/\s+/).filter(Boolean);

  return normalizeText(
    ids
      .map((id) => {
        const safeId = id.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        return normalizeText($(`[id="${safeId}"]`).first().text());
      })
      .filter(Boolean)
      .join(" ")
  );
}

function getAccessibleName($: cheerio.CheerioAPI, element: AnyNode): string {
  const node = $(element);
  const ariaLabel = normalizeText(node.attr("aria-label"));
  const ariaLabelledBy = normalizeText(node.attr("aria-labelledby"));
  const titleAttr = normalizeText(node.attr("title"));
  const textContent = normalizeText(node.text());
  const inputValue = normalizeText(node.attr("value"));
  const imageAlt = normalizeText(
    node
      .find("img[alt]")
      .map((_, image) => normalizeText($(image).attr("alt")))
      .get()
      .filter(Boolean)
      .join(" ")
  );

  return (
    ariaLabel ||
    (ariaLabelledBy ? getReferencedText($, ariaLabelledBy) : "") ||
    titleAttr ||
    inputValue ||
    textContent ||
    imageAlt
  );
}

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
  const { response, body } = await fetchTextResponse(url);

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    throw new Error("The target did not return an HTML page.");
  }

  return {
    response,
    html: body
  };
}

async function fetchTextResponse(url: URL) {
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

    return {
      response,
      body: await response.text()
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchSitemapUrls(rawSitemapUrl: string, siteOrigin: string, maxUrls: number): Promise<string[]> {
  const visited = new Set<string>();
  const discoveredUrls = new Set<string>();

  async function walkSitemap(url: URL, depth: number) {
    if (depth > 2 || visited.has(url.toString()) || discoveredUrls.size >= maxUrls) {
      return;
    }

    visited.add(url.toString());

    const { response, body } = await fetchTextResponse(url);
    const contentType = response.headers.get("content-type") ?? "";

    if (!/(xml|text\/plain|application\/octet-stream)/i.test(contentType) && !url.pathname.endsWith(".xml")) {
      throw new Error("The sitemap URL did not return XML content.");
    }

    const $ = cheerio.load(body, { xmlMode: true });
    const nestedSitemaps = $("sitemap > loc")
      .map((_, element) => normalizeText($(element).text()))
      .get()
      .filter(Boolean);

    for (const nested of nestedSitemaps) {
      try {
        const nestedUrl = normalizeUrl(nested);

        if (nestedUrl.origin === siteOrigin) {
          await walkSitemap(nestedUrl, depth + 1);
        }
      } catch {
        continue;
      }
    }

    const pageUrls = $("url > loc")
      .map((_, element) => normalizeText($(element).text()))
      .get()
      .filter(Boolean);

    for (const entry of pageUrls) {
      try {
        const pageUrl = normalizeUrl(entry);

        if (pageUrl.origin === siteOrigin) {
          discoveredUrls.add(pageUrl.toString());
        }

        if (discoveredUrls.size >= maxUrls) {
          break;
        }
      } catch {
        continue;
      }
    }
  }

  await walkSitemap(normalizeUrl(rawSitemapUrl), 0);

  return Array.from(discoveredUrls);
}

function analyzeHtmlPage(baseUrl: URL, responseUrl: string, html: string, headers: Headers): AnalyzedPage {
  const $ = cheerio.load(html);
  const pageTitleText = normalizeText($("title").first().text());
  const title = pageTitleText || baseUrl.hostname;
  const htmlLangPresent = Boolean($("html").attr("lang")?.trim());
  const imageCount = $("img").length;
  const missingAltElements = $("img")
    .filter((_, element) => $(element).attr("alt") === undefined)
    .get();
  const missingAltCount = missingAltElements.length;
  const formCount = $("form").length;
  const unlabeledInputElements = $("input, textarea, select")
    .filter((_, element) => {
      const id = $(element).attr("id");
      const ariaLabel = $(element).attr("aria-label");
      const ariaLabelledBy = $(element).attr("aria-labelledby");
      const wrappedByLabel = $(element).closest("label").length > 0;
      const linkedLabel = id ? $(`label[for="${id}"]`).length > 0 : false;

      return !wrappedByLabel && !linkedLabel && !ariaLabel && !ariaLabelledBy;
    })
    .get();
  const unlabeledInputs = unlabeledInputElements.length;
  const emailFieldCount = $("input[type='email']").length;
  const checkboxCount = $("input[type='checkbox']").length;
  const policyLinkCount = $("a")
    .filter((_, element) => /(privacy|cookie|data protection)/i.test($(element).text()))
    .length;
  const cookieBannerSignal = /(cookie consent|accept cookies|cookie settings|privacy preferences)/i.test($.text());
  const cookieControlSignal =
    /(reject all|reject cookies|decline|manage preferences|manage cookies|customi[sz]e|privacy preferences|cookie settings)/i.test(
      $.text()
    );
  const consentSignal = /(subscribe|opt in|marketing consent|agree to receive|email updates)/i.test($.text());
  const trackingSignals = TRACKING_PATTERNS.filter((entry) => entry.match.test(html)).map((entry) => entry.label);
  const securityHeadersPresent = SECURITY_HEADERS.filter((header) => headers.has(header));
  const headings = $("h1, h2, h3, h4, h5, h6")
    .map((_, element) => Number(element.tagName.slice(1)))
    .get();
  const h1Count = headings.filter((level) => level === 1).length;
  const headingLevelSkip = headings.some((level, index) => index > 0 && level - headings[index - 1] > 1);
  const buttonWithoutNameElements = $("button, input[type='button'], input[type='submit'], input[type='reset'], [role='button']")
    .filter((_, element) => !getAccessibleName($, element))
    .get();
  const buttonWithoutNameCount = buttonWithoutNameElements.length;
  const linkWithoutNameElements = $("a[href]")
    .filter((_, element) => !getAccessibleName($, element))
    .get();
  const linkWithoutNameCount = linkWithoutNameElements.length;
  const iframeMissingTitleElements = $("iframe")
    .filter((_, element) => !normalizeText($(element).attr("title")))
    .get();
  const iframeMissingTitleCount = iframeMissingTitleElements.length;
  const trackingEvidence = $("script[src], script")
    .filter((_, element) => TRACKING_PATTERNS.some((entry) => entry.match.test($(element).attr("src") ?? $(element).html() ?? "")))
    .get();
  const internalLinks = $("a[href]")
    .map((_, element) => normalizeLink(new URL(responseUrl), $(element).attr("href") ?? ""))
    .get()
    .filter((value): value is string => Boolean(value))
    .filter((value) => new URL(value).origin === new URL(responseUrl).origin);

  const issues: ScanIssue[] = [];

  if (!pageTitleText) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Missing page title",
      detail: "The page does not expose a non-empty title element.",
      severity: "medium",
      locationSummary: "Document head",
      evidence: [
        {
          selector: "head > title:nth-of-type(1)",
          snippet: "No non-empty <title> element was detected.",
          note: "Add a descriptive page title in the document head."
        }
      ]
    });
  }

  if (!htmlLangPresent) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Missing html lang attribute",
      detail: "The page does not expose a language attribute on the html element.",
      severity: "medium",
      locationSummary: "html element",
      evidence: [
        {
          selector: "html",
          snippet: truncateText(normalizeText($.html($("html").get(0) ?? "") || "<html>"), 120),
          note: "Add a lang attribute such as lang=\"en\" to the root html element."
        }
      ]
    });
  }

  if (missingAltCount > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Images missing alt text",
      detail: `${missingAltCount} image${missingAltCount === 1 ? "" : "s"} appear to have no alt attribute.`,
      severity: missingAltCount > 4 ? "high" : "medium",
      locationSummary: `${missingAltCount} image element${missingAltCount === 1 ? "" : "s"} without alt text`,
      evidence: buildElementEvidence($, missingAltElements, (element) => {
        const src = normalizeText($(element).attr("src"));
        return src ? `Image source: ${src}` : "Image element missing alt text.";
      })
    });
  }

  if (unlabeledInputs > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Inputs missing visible or programmatic labels",
      detail: `${unlabeledInputs} form control${unlabeledInputs === 1 ? "" : "s"} may be unlabeled.`,
      severity: unlabeledInputs > 2 ? "high" : "medium",
      locationSummary: `${unlabeledInputs} unlabeled form control${unlabeledInputs === 1 ? "" : "s"}`,
      evidence: buildElementEvidence($, unlabeledInputElements, (element) => {
        const type = normalizeText($(element).attr("type")) || (isTagNode(element) ? element.tagName : "control");
        const name = normalizeText($(element).attr("name"));
        return name ? `${type} control with name="${name}" has no label signal.` : `${type} control has no label signal.`;
      })
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
      severity: "low",
      locationSummary: h1Count === 0 ? "No h1 element found" : "Heading sequence appears to skip levels"
    });
  }

  if (buttonWithoutNameCount > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Buttons without accessible names",
      detail: `${buttonWithoutNameCount} button${buttonWithoutNameCount === 1 ? "" : "s"} may not expose a readable accessible name.`,
      severity: buttonWithoutNameCount > 2 ? "high" : "medium",
      locationSummary: `${buttonWithoutNameCount} button-like control${buttonWithoutNameCount === 1 ? "" : "s"} without an accessible name`,
      evidence: buildElementEvidence($, buttonWithoutNameElements, (element) => {
        const type = normalizeText($(element).attr("type"));
        return type ? `Button type: ${type}` : "Button-like control has no readable accessible name.";
      })
    });
  }

  if (linkWithoutNameCount > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Links without accessible names",
      detail: `${linkWithoutNameCount} link${linkWithoutNameCount === 1 ? "" : "s"} may not expose a readable accessible name.`,
      severity: linkWithoutNameCount > 3 ? "high" : "medium",
      locationSummary: `${linkWithoutNameCount} link${linkWithoutNameCount === 1 ? "" : "s"} without an accessible name`,
      evidence: buildElementEvidence($, linkWithoutNameElements, (element) => {
        const href = normalizeText($(element).attr("href"));
        return href ? `Link target: ${href}` : "Link has no readable accessible name.";
      })
    });
  }

  if (iframeMissingTitleCount > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Iframes missing title attributes",
      detail: `${iframeMissingTitleCount} iframe${iframeMissingTitleCount === 1 ? "" : "s"} appear to be missing a descriptive title attribute.`,
      severity: "medium",
      locationSummary: `${iframeMissingTitleCount} iframe${iframeMissingTitleCount === 1 ? "" : "s"} missing title text`,
      evidence: buildElementEvidence($, iframeMissingTitleElements)
    });
  }

  if (!cookieBannerSignal && trackingSignals.length > 0) {
    issues.push({
      layer: "privacy",
      pageUrl: responseUrl,
      title: "Tracking signals without visible cookie wording",
      detail: `Detected ${trackingSignals.join(", ")} but could not find obvious cookie-banner wording on this page.`,
      severity: "medium",
      locationSummary: "Tracking scripts detected without obvious cookie wording",
      evidence: buildElementEvidence($, trackingEvidence, (element) => {
        const src = normalizeText($(element).attr("src"));
        return src ? `Tracking script source: ${src}` : "Inline script matched a known tracking pattern.";
      })
    });
  }

  if (cookieBannerSignal && trackingSignals.length > 0 && !cookieControlSignal) {
    issues.push({
      layer: "privacy",
      pageUrl: responseUrl,
      title: "Cookie banner without obvious reject or manage controls",
      detail: "Cookie wording was detected, but no obvious reject-all or manage-preferences wording was found alongside active tracking signals.",
      severity: "medium",
      locationSummary: "Cookie wording found, but reject or manage wording was not detected"
    });
  }

  if (policyLinkCount === 0) {
    issues.push({
      layer: "privacy",
      pageUrl: responseUrl,
      title: "No obvious privacy or cookie policy links detected",
      detail: "This page did not expose a visible privacy, cookie, or terms link in its markup.",
      severity: "medium",
      locationSummary: "No matching privacy, cookie, or data-protection link text found in page links"
    });
  }

  if (emailFieldCount > 0 && policyLinkCount === 0 && !consentSignal) {
    issues.push({
      layer: "privacy",
      pageUrl: responseUrl,
      title: "Email capture without visible privacy cues",
      detail: "An email field was found, but no nearby privacy-policy or clear data-use wording signal was detected on the page.",
      severity: "medium",
      locationSummary: "Email capture detected without visible privacy cues",
      evidence: buildElementEvidence(
        $,
        $("input[type='email']").get(),
        () => "Review nearby copy for privacy notice, lawful-use explanation, or policy link."
      )
    });
  }

  if (emailFieldCount > 0 && checkboxCount === 0 && !consentSignal) {
    issues.push({
      layer: "consent",
      pageUrl: responseUrl,
      title: "Email capture without visible consent signals",
      detail: "An email field was found, but no checkbox or obvious consent wording was detected on the page.",
      severity: "medium",
      locationSummary: "Email capture detected without visible consent cues",
      evidence: buildElementEvidence(
        $,
        $("input[type='email']").get(),
        () => "Review nearby copy for consent wording or a meaningful opt-in control."
      )
    });
  }

  if (securityHeadersPresent.length < 2) {
    issues.push({
      layer: "security",
      pageUrl: responseUrl,
      title: "Limited security header coverage",
      detail: `Only ${securityHeadersPresent.length} of ${SECURITY_HEADERS.length} common security headers were detected.`,
      severity: "low",
      locationSummary: `Missing ${SECURITY_HEADERS.length - securityHeadersPresent.length} common security header${SECURITY_HEADERS.length - securityHeadersPresent.length === 1 ? "" : "s"}`,
      evidence: SECURITY_HEADERS.filter((header) => !headers.has(header)).map((header) => ({
        selector: "response headers",
        snippet: header,
        note: "Header was not present in the HTTP response."
      }))
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
  const sitemapUrl = options.sitemapUrl ? normalizeUrl(options.sitemapUrl) : null;
  const maxPages = Math.max(1, Math.min(options.maxPages ?? 10, 50));
  const queue = [startUrl.toString()];
  const discovered = new Set(queue);
  const visited = new Set<string>();
  const pages: PageScanResult[] = [];
  const limitations = [
    `This local crawl stayed on the starting domain and stopped after ${maxPages} page${maxPages === 1 ? "" : "s"} at most.`,
    "Authenticated flows, JavaScript-only interaction states, and source-code-aware checks are not included in this first desktop pass."
  ];

  if (sitemapUrl) {
    try {
      const sitemapUrls = await fetchSitemapUrls(sitemapUrl.toString(), startUrl.origin, Math.max(maxPages * 3, 25));

      if (sitemapUrls.length > 0) {
        for (const sitemapEntry of sitemapUrls) {
          if (!discovered.has(sitemapEntry)) {
            discovered.add(sitemapEntry);
            queue.push(sitemapEntry);
          }
        }

        limitations.push(
          `Used sitemap seeding from ${sitemapUrl.toString()} to add ${sitemapUrls.length} URL${sitemapUrls.length === 1 ? "" : "s"} to the crawl queue.`
        );
      } else {
        limitations.push(`A sitemap was provided at ${sitemapUrl.toString()}, but no same-origin page URLs were parsed from it.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown sitemap error.";
      limitations.push(`Could not use sitemap ${sitemapUrl.toString()}: ${message}`);
    }
  }

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
    sitemapUrl: sitemapUrl?.toString(),
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