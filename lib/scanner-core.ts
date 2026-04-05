import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { Agent } from "undici";

import { applyIssueGuidanceToHostedToolResult } from "./issue-guidance";
import type { ToolType } from "./scanner-config";
import {
  buildElementEvidence,
  getAccessibleName,
  hasLabelSignal,
  isCookiePolicyLinkCandidate,
  isDoNotSellCandidate,
  isPolicyLinkCandidate,
  isPrivacyRightsCandidate,
  isTagNode,
  normalizeLink,
  normalizeText,
  normalizeUrl,
  scoreFromIssues,
  truncateText
} from "./scan/helpers";
import type {
  AnalyzedPage,
  ComplianceLayer,
  HostedToolScanResult,
  PageScanMetadata,
  PageScanResult,
  PrivacyRegion,
  ScanIssue,
  ScanSeverity,
  SiteScanOptions,
  SiteScanResult,
  SinglePageMode
} from "./scan/types";

export type {
  ComplianceLayer,
  HostedToolScanResult,
  PageRuntimeAudit,
  PageScanMetadata,
  PageScanResult,
  PrivacyRegion,
  RuntimeAuditControl,
  RuntimeAuditCookie,
  RuntimeAuditGpcComparison,
  RuntimeAuditInteraction,
  RuntimeAuditPhase,
  RuntimeAuditTrackerRequest,
  ScanIssue,
  ScanIssueEvidence,
  ScanSeverity,
  SiteScanOptions,
  SiteScanResult,
  SinglePageMode
} from "./scan/types";

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
    "Missing main landmark",
    "Multiple h1 headings detected",
    "Images missing alt text",
    "Inputs missing visible or programmatic labels",
    "Placeholder-only form fields",
    "Weak heading structure signals",
    "Buttons without accessible names",
    "Links without accessible names",
    "Repeated vague link text may not describe destinations",
    "Non-interactive elements appear to act like controls",
    "Tables may be missing clear headers",
    "Malformed list structure detected",
    "Duplicate landmark structure detected",
    "Iframes missing title attributes",
    "Potential focus order override from positive tabindex"
  ],
  cookie: [
    "Tracking signals without visible cookie wording",
    "No obvious cookie policy link detected",
    "No obvious cookie settings or withdrawal path detected",
    "Cookie banner without obvious reject or manage controls",
    "Limited security header coverage"
  ],
  privacy: [
    "Tracking signals without visible cookie wording",
    "No obvious privacy or cookie policy links detected",
    "No obvious cookie policy link detected",
    "No obvious cookie settings or withdrawal path detected",
    "Privacy policy link could not be verified",
    "Cookie banner without obvious reject or manage controls",
    "No obvious privacy rights request path detected",
    "No obvious sale or sharing opt-out path detected",
    "Limited visible US privacy rights cues",
    "No visible Global Privacy Control cue detected",
    "Email capture without visible privacy cues",
    "Limited security header coverage"
  ]
};

function normalizePrivacyRegion(region: PrivacyRegion | undefined): PrivacyRegion {
  return region === "us" ? "us" : "eu";
}

function getAttributeMap(node: AnyNode): Record<string, string> {
  return "attribs" in node && typeof node.attribs === "object" && node.attribs !== null
    ? (node.attribs as Record<string, string>)
    : {};
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

async function verifyPolicyLinkDestinations(responseUrl: string, html: string): Promise<ScanIssue[]> {
  const $ = cheerio.load(html);
  const baseUrl = new URL(responseUrl);
  const candidates = $("a[href]")
    .filter((_, element) => isPolicyLinkCandidate($, baseUrl, element))
    .get()
    .slice(0, 3);

  const issues: ScanIssue[] = [];

  for (const element of candidates) {
    const href = normalizeText($(element).attr("href"));
    const normalizedHref = href ? normalizeLink(baseUrl, href) : null;

    if (!normalizedHref) {
      issues.push({
        layer: "privacy",
        pageUrl: responseUrl,
        title: "Privacy policy link could not be verified",
        detail: "A privacy-related link was detected, but its destination could not be resolved into a valid URL.",
        severity: "medium",
        locationSummary: "Privacy-related link has an invalid or unsupported destination",
        evidence: buildElementEvidence($, [element], () => "Review whether this privacy control points to a real reachable destination.")
      });
      continue;
    }

    try {
      const policyUrl = new URL(normalizedHref);
      const { response, body } = await fetchTextResponse(policyUrl);
      const contentType = response.headers.get("content-type") ?? "";
      const policyText = normalizeText(body.replace(/<[^>]+>/g, " "));

      if (!/text\/html|application\/xhtml\+xml/i.test(contentType) || policyText.length < 140) {
        issues.push({
          layer: "privacy",
          pageUrl: responseUrl,
          title: "Privacy policy link could not be verified",
          detail: "A privacy-related destination resolved, but it did not appear to return a meaningful HTML privacy notice.",
          severity: "low",
          locationSummary: `Resolved policy destination: ${policyUrl.toString()}`,
          evidence: buildElementEvidence($, [element], () => `Resolved destination: ${policyUrl.toString()}`)
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown fetch error.";
      issues.push({
        layer: "privacy",
        pageUrl: responseUrl,
        title: "Privacy policy link could not be verified",
        detail: "A privacy-related link was detected, but the destination could not be reached successfully.",
        severity: "medium",
        locationSummary: `Policy destination fetch failed: ${message}`,
        evidence: buildElementEvidence($, [element], () => "Review whether this privacy control points to a live policy page.")
      });
    }
  }

  return issues;
}

function analyzeHtmlPage(
  baseUrl: URL,
  responseUrl: string,
  html: string,
  headers: Headers,
  privacyRegionInput?: PrivacyRegion
): AnalyzedPage {
  const $ = cheerio.load(html);
  const privacyRegion = normalizePrivacyRegion(privacyRegionInput);
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
      return !hasLabelSignal($, element);
    })
    .get();
  const unlabeledInputs = unlabeledInputElements.length;
  const placeholderOnlyFieldElements = $("input, textarea")
    .filter((_, element) => {
      const node = $(element);
      const type = normalizeText(node.attr("type")).toLowerCase();

      if (["hidden", "submit", "reset", "button", "checkbox", "radio", "file", "image"].includes(type)) {
        return false;
      }

      return Boolean(normalizeText(node.attr("placeholder")) && !hasLabelSignal($, element));
    })
    .get();
  const placeholderOnlyFieldCount = placeholderOnlyFieldElements.length;
  const emailFieldCount = $("input[type='email']").length;
  const checkboxCount = $("input[type='checkbox']").length;
  const mainLandmarkCount = $("main, [role='main']").length;
  const policyLinkElements = $("a[href], button, [role='button']")
    .filter((_, element) => isPolicyLinkCandidate($, new URL(responseUrl), element))
    .get();
  const policyLinkCount = policyLinkElements.length;
  const cookiePolicyLinkElements = $("a[href], button, [role='button']")
    .filter((_, element) => isCookiePolicyLinkCandidate($, new URL(responseUrl), element))
    .get();
  const cookiePolicyLinkCount = cookiePolicyLinkElements.length;
  const privacyRightsElements = $("a[href], button, [role='button']")
    .filter((_, element) => isPrivacyRightsCandidate($, new URL(responseUrl), element))
    .get();
  const privacyRightsLinkCount = privacyRightsElements.length;
  const doNotSellElements = $("a[href], button, [role='button']")
    .filter((_, element) => isDoNotSellCandidate($, new URL(responseUrl), element))
    .get();
  const doNotSellLinkCount = doNotSellElements.length;
  const pageText = $.text();
  const controlText = $("button, a[href], input[type='button'], input[type='submit'], [role='button']")
    .map((_, element) => normalizeText(getAccessibleName($, element) || $(element).text() || $(element).attr("value")))
    .get()
    .filter(Boolean)
    .join(" ");
  const cookieBannerSignalPresent =
    /(cookie consent|accept cookies|cookie settings|cookie preferences|privacy preferences|we use cookies|this website uses cookies)/i.test(
      pageText
    );
  const cookieAcceptControlPresent =
    /\b(accept all|accept cookies|allow all|allow cookies|got it|enable all|i agree)\b/i.test(controlText);
  const cookieRejectControlPresent =
    /\b(reject all|reject cookies|decline|deny|necessary only|essential only|continue without accepting)\b/i.test(controlText);
  const cookieManageControlPresent =
    /\b(manage preferences|manage cookies|cookie settings|cookie preferences|privacy preferences|customi[sz]e|your choices)\b/i.test(controlText);
  const cookieReopenControlPresent =
    /\b(cookie settings|cookie preferences|privacy choices|change(?: privacy| cookie)? settings|update preferences|review choices|review preferences|withdraw consent|privacy settings)\b/i.test(
      controlText
    );
  const cookieControlSignal = cookieRejectControlPresent || cookieManageControlPresent;
  const accessRequestSignalPresent =
    /(access request|request access|right to know|access your data|know what personal information)/i.test($.text());
  const correctionRequestSignalPresent =
    /(correction request|correct your information|right to correct|update your information|correct inaccurate information)/i.test(
      $.text()
    );
  const deletionRequestSignalPresent =
    /(delete my data|deletion request|request deletion|right to delete|delete your personal information)/i.test($.text());
  const gpcSignalPresent = /(global privacy control|\bgpc\b|browser opt-?out preference signal)/i.test($.text());
  const consentSignal = /(subscribe|opt in|marketing consent|agree to receive|email updates)/i.test($.text());
  const trackingSignals = TRACKING_PATTERNS.filter((entry) => entry.match.test(html)).map((entry) => entry.label);
  const securityHeadersPresent = SECURITY_HEADERS.filter((header) => headers.has(header));
  const headings = $("h1, h2, h3, h4, h5, h6")
    .map((_, element) => Number(element.tagName.slice(1)))
    .get();
  const h1Count = headings.filter((level) => level === 1).length;
  const headingLevelSkip = headings.some((level, index) => index > 0 && level - headings[index - 1] > 1);
  const skipLinkElements = $("a[href]")
    .filter((_, element) => {
      const href = normalizeText($(element).attr("href"));
      const accessibleName = getAccessibleName($, element);
      return /^#/.test(href) && /(skip|skip to content|jump to content|skip navigation)/i.test(accessibleName);
    })
    .get();
  const skipLinkCount = skipLinkElements.length;
  const positiveTabindexElements = $("[tabindex]")
    .filter((_, element) => {
      const value = Number.parseInt(normalizeText($(element).attr("tabindex")), 10);
      return Number.isFinite(value) && value > 0;
    })
    .get();
  const positiveTabindexCount = positiveTabindexElements.length;
  const buttonWithoutNameElements = $("button, input[type='button'], input[type='submit'], input[type='reset'], [role='button']")
    .filter((_, element) => !getAccessibleName($, element))
    .get();
  const buttonWithoutNameCount = buttonWithoutNameElements.length;
  const linkWithoutNameElements = $("a[href]")
    .filter((_, element) => !getAccessibleName($, element))
    .get();
  const linkWithoutNameCount = linkWithoutNameElements.length;
  const vagueLinkPattern = /^(read more|learn more|more|click here|here|details|see more|view more)$/i;
  const vagueLinkGroups = new Map<string, AnyNode[]>();

  $("a[href]").each((_, element) => {
    const accessibleName = normalizeText(getAccessibleName($, element)).toLowerCase();

    if (!accessibleName || !vagueLinkPattern.test(accessibleName)) {
      return;
    }

    const existing = vagueLinkGroups.get(accessibleName) ?? [];
    existing.push(element);
    vagueLinkGroups.set(accessibleName, existing);
  });

  const repeatedVagueLinkElements = Array.from(vagueLinkGroups.values())
    .filter((elements) => {
      if (elements.length < 2) {
        return false;
      }

      const hrefs = new Set(
        elements
          .map((element) => normalizeText($(element).attr("href")))
          .filter(Boolean)
      );

      return hrefs.size > 1;
    })
    .flat();
  const repeatedVagueLinkCount = repeatedVagueLinkElements.length;
  const iframeMissingTitleElements = $("iframe")
    .filter((_, element) => !normalizeText($(element).attr("title")))
    .get();
  const iframeMissingTitleCount = iframeMissingTitleElements.length;
  const tableMissingHeaderElements = $("table")
    .filter((_, element) => {
      const rows = $(element).find("tr");
      const columns = rows.first().find("th, td");
      const thCount = $(element).find("th").length;

      return rows.length >= 2 && columns.length >= 2 && thCount === 0;
    })
    .get();
  const tableMissingHeaderCount = tableMissingHeaderElements.length;
  const malformedListElements = $("ul, ol")
    .filter((_, element) => {
      const invalidChildren = $(element)
        .children()
        .filter((_, child) => {
          if (!isTagNode(child)) {
            return false;
          }

          return !["li", "script", "template"].includes(child.tagName.toLowerCase());
        });

      return invalidChildren.length > 0;
    })
    .get();
  const malformedListCount = malformedListElements.length;
  const duplicateMainElements = $("main, [role='main']").get();
  const duplicateBannerElements = $("body > header, [role='banner']").get();
  const duplicateContentInfoElements = $("body > footer, [role='contentinfo']").get();
  const duplicateLandmarkElements = [
    ...(duplicateMainElements.length > 1 ? duplicateMainElements : []),
    ...(duplicateBannerElements.length > 1 ? duplicateBannerElements : []),
    ...(duplicateContentInfoElements.length > 1 ? duplicateContentInfoElements : [])
  ];
  const duplicateLandmarkCount = duplicateLandmarkElements.length;
  const controlLikeAttributeNames = new Set(["onclick", "ng-click", "@click", "v-on:click", "(click)", "data-click", "data-action"]);
  const controlRolePattern = /^(button|link|tab|menuitem|checkbox|radio|switch)$/i;
  const nonInteractiveControlLikeElements = $("*")
    .filter((_, element) => {
      if (!isTagNode(element)) {
        return false;
      }

      const tagName = element.tagName.toLowerCase();

      if (["a", "button", "input", "select", "textarea", "summary", "details", "label"].includes(tagName)) {
        return false;
      }

      const attribs = getAttributeMap(element);
      const attributeNames = Object.keys(attribs);
      const hasControlLikeAttribute = attributeNames.some((name) => controlLikeAttributeNames.has(name.toLowerCase()));

      if (!hasControlLikeAttribute) {
        return false;
      }

      const role = normalizeText(attribs.role);
      const tabindex = normalizeText(attribs.tabindex);
      const hasRole = controlRolePattern.test(role);
      const hasKeyboardFocus = tabindex !== "" && !Number.isNaN(Number(tabindex)) && Number(tabindex) >= 0;
      const hasKeyboardHandler = attributeNames.some((name) => /^onkey(down|up|press)$/i.test(name) || /key(down|up|press)/i.test(name));

      return !hasRole || !hasKeyboardFocus || !hasKeyboardHandler;
    })
    .get();
  const nonInteractiveControlLikeCount = nonInteractiveControlLikeElements.length;
  const trackingEvidence = $("script[src], script")
    .filter((_, element) => TRACKING_PATTERNS.some((entry) => entry.match.test($(element).attr("src") ?? $(element).html() ?? "")))
    .get();
  const insecureFormActionElements = $("form[action]")
    .filter((_, element) => {
      if (new URL(responseUrl).protocol !== "https:") {
        return false;
      }

      const action = normalizeText($(element).attr("action"));

      if (!action) {
        return false;
      }

      const normalizedAction = normalizeLink(new URL(responseUrl), action);
      return normalizedAction ? new URL(normalizedAction).protocol === "http:" : /^http:\/\//i.test(action);
    })
    .get();
  const insecureFormActionCount = insecureFormActionElements.length;
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

  if (mainLandmarkCount === 0) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Missing main landmark",
      detail: "The page does not expose a main landmark via a main element or role='main'.",
      severity: "low",
      locationSummary: "No main landmark detected"
    });
  }

  if (h1Count > 1) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Multiple h1 headings detected",
      detail: `${h1Count} h1 elements were detected on the page, which may weaken the primary page outline.`,
      severity: "low",
      locationSummary: `${h1Count} h1 elements found`,
      evidence: buildElementEvidence($, $("h1").get(), () => "Review whether only one primary page heading should be exposed.")
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

  if (placeholderOnlyFieldCount > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Placeholder-only form fields",
      detail: `${placeholderOnlyFieldCount} form field${placeholderOnlyFieldCount === 1 ? " appears" : "s appear"} to rely on placeholder text without a visible or programmatic label.`,
      severity: placeholderOnlyFieldCount > 2 ? "high" : "medium",
      locationSummary: `${placeholderOnlyFieldCount} placeholder-only form field${placeholderOnlyFieldCount === 1 ? "" : "s"}`,
      evidence: buildElementEvidence($, placeholderOnlyFieldElements, (element) => {
        const placeholder = normalizeText($(element).attr("placeholder"));
        return placeholder ? `Placeholder text: ${placeholder}` : "Field appears to rely on placeholder text only.";
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

  if (repeatedVagueLinkCount > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Repeated vague link text may not describe destinations",
      detail: `${repeatedVagueLinkCount} link${repeatedVagueLinkCount === 1 ? " appears" : "s appear"} to reuse vague text like 'read more' or 'click here' for different destinations.`,
      severity: repeatedVagueLinkCount > 3 ? "medium" : "low",
      locationSummary: `${repeatedVagueLinkCount} vague link label${repeatedVagueLinkCount === 1 ? "" : "s"} reused across different destinations`,
      evidence: buildElementEvidence($, repeatedVagueLinkElements, (element) => {
        const href = normalizeText($(element).attr("href"));
        const name = normalizeText(getAccessibleName($, element));
        return href ? `Link text \"${name}\" points to ${href}` : `Vague link text \"${name}\" was reused.`;
      })
    });
  }

  if (nonInteractiveControlLikeCount > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Non-interactive elements appear to act like controls",
      detail: `${nonInteractiveControlLikeCount} non-interactive element${nonInteractiveControlLikeCount === 1 ? " appears" : "s appear"} to expose click-style behavior without complete role and keyboard support.`,
      severity: nonInteractiveControlLikeCount > 2 ? "medium" : "low",
      locationSummary: `${nonInteractiveControlLikeCount} non-semantic control-like element${nonInteractiveControlLikeCount === 1 ? "" : "s"}`,
      evidence: buildElementEvidence($, nonInteractiveControlLikeElements, (element) => {
        const role = normalizeText($(element).attr("role"));
        const tabindex = normalizeText($(element).attr("tabindex"));
        return [
          role ? `role=${role}` : "missing role",
          tabindex ? `tabindex=${tabindex}` : "missing keyboard focus",
          Object.keys(getAttributeMap(element)).find((name) => controlLikeAttributeNames.has(name.toLowerCase())) ?? "click handler"
        ].join(", ");
      })
    });
  }

  if (tableMissingHeaderCount > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Tables may be missing clear headers",
      detail: `${tableMissingHeaderCount} table${tableMissingHeaderCount === 1 ? " appears" : "s appear"} to contain tabular data without any header cells.`,
      severity: tableMissingHeaderCount > 1 ? "medium" : "low",
      locationSummary: `${tableMissingHeaderCount} table${tableMissingHeaderCount === 1 ? "" : "s"} without th headers`,
      evidence: buildElementEvidence($, tableMissingHeaderElements, () => "Review whether this table needs th cells or a clearer non-table structure.")
    });
  }

  if (malformedListCount > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Malformed list structure detected",
      detail: `${malformedListCount} list${malformedListCount === 1 ? " appears" : "s appear"} to contain direct children that are not list items.`,
      severity: "low",
      locationSummary: `${malformedListCount} list structure${malformedListCount === 1 ? "" : "s"} with non-li children`,
      evidence: buildElementEvidence($, malformedListElements, (element) => {
        const invalidChildTags = $(element)
          .children()
          .map((_, child) => (isTagNode(child) ? child.tagName.toLowerCase() : "unknown"))
          .get()
          .filter((tag) => !["li", "script", "template"].includes(tag));

        return invalidChildTags.length > 0 ? `Unexpected direct children: ${invalidChildTags.join(", ")}` : "List contains unexpected direct child elements.";
      })
    });
  }

  if (duplicateLandmarkCount > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Duplicate landmark structure detected",
      detail: "The page exposes multiple main, banner, or contentinfo landmark regions that may weaken structural navigation.",
      severity: "low",
      locationSummary: `${duplicateLandmarkCount} duplicated landmark element${duplicateLandmarkCount === 1 ? "" : "s"} detected`,
      evidence: buildElementEvidence($, duplicateLandmarkElements, (element) => {
        if (!isTagNode(element)) {
          return "Duplicate landmark element detected.";
        }

        const role = normalizeText($(element).attr("role"));
        return role ? `Landmark role: ${role}` : `Landmark tag: ${element.tagName.toLowerCase()}`;
      })
    });
  }

  if (positiveTabindexCount > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl: responseUrl,
      title: "Potential focus order override from positive tabindex",
      detail: `${positiveTabindexCount} element${positiveTabindexCount === 1 ? " uses" : "s use"} a positive tabindex value, which can create a fragile keyboard and assistive-technology navigation order.`,
      severity: "low",
      locationSummary: `${positiveTabindexCount} element${positiveTabindexCount === 1 ? "" : "s"} with positive tabindex`,
      evidence: buildElementEvidence($, positiveTabindexElements, (element) => {
        const tabindex = normalizeText($(element).attr("tabindex"));
        return tabindex ? `tabindex=${tabindex}` : undefined;
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

  if (privacyRegion === "eu" && !cookieBannerSignalPresent && trackingSignals.length > 0) {
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

  if (privacyRegion === "eu" && trackingSignals.length > 0 && cookiePolicyLinkCount === 0) {
    issues.push({
      layer: "privacy",
      pageUrl: responseUrl,
      title: "No obvious cookie policy link detected",
      detail:
        policyLinkCount > 0
          ? "Tracking signals were detected and some privacy-related links were present, but no obvious cookie-policy-specific link or button was found."
          : "Tracking signals were detected, but no obvious cookie-policy-specific link or button was found on the page.",
      severity: policyLinkCount > 0 ? "low" : "medium",
      locationSummary: "Tracking detected without an obvious cookie policy path"
    });
  }

  if (privacyRegion === "eu" && trackingSignals.length > 0 && !cookieReopenControlPresent) {
    issues.push({
      layer: "privacy",
      pageUrl: responseUrl,
      title: "No obvious cookie settings or withdrawal path detected",
      detail:
        "Tracking signals were detected, but the page did not expose an obvious Cookie Settings, Privacy Choices, or similar path for revisiting cookie choices later.",
      severity: cookieBannerSignalPresent || policyLinkCount > 0 ? "low" : "medium",
      locationSummary: "Tracking detected without an obvious later cookie-settings path"
    });
  }

  if (privacyRegion === "eu" && cookieBannerSignalPresent && trackingSignals.length > 0 && !cookieControlSignal) {
    issues.push({
      layer: "privacy",
      pageUrl: responseUrl,
      title: "Cookie banner without obvious reject or manage controls",
      detail: "Cookie wording was detected, but no obvious reject-all or manage-preferences wording was found alongside active tracking signals.",
      severity: "medium",
      locationSummary: "Cookie wording found, but reject or manage wording was not detected"
    });
  }

  if (privacyRightsLinkCount === 0) {
    issues.push({
      layer: "privacy",
      pageUrl: responseUrl,
      title: "No obvious privacy rights request path detected",
      detail:
        "This page did not expose an obvious privacy-rights, data-request, deletion, or consumer-choices path in its visible links or buttons.",
      severity: privacyRegion === "us" ? "medium" : "low",
      locationSummary: "No visible privacy-rights or data-request path found"
    });
  }

  if (trackingSignals.length > 0 && doNotSellLinkCount === 0) {
    issues.push({
      layer: "privacy",
      pageUrl: responseUrl,
      title: "No obvious sale or sharing opt-out path detected",
      detail:
        "Tracking signals were detected, but no obvious 'Do Not Sell or Share' or 'Your Privacy Choices' path was found in visible links or buttons.",
      severity: "low",
      locationSummary: "Tracking detected without an obvious sale or sharing opt-out path"
    });
  }

  if (privacyRegion === "us" && (!accessRequestSignalPresent || !correctionRequestSignalPresent || !deletionRequestSignalPresent)) {
    const missingSignals = [
      accessRequestSignalPresent ? null : "access",
      correctionRequestSignalPresent ? null : "correction",
      deletionRequestSignalPresent ? null : "deletion"
    ].filter(Boolean);

    issues.push({
      layer: "privacy",
      pageUrl: responseUrl,
      title: "Limited visible US privacy rights cues",
      detail: `Public privacy-rights signals appear incomplete for this page. Missing visible cues: ${missingSignals.join(", ")}.`,
      severity: privacyRightsLinkCount === 0 ? "medium" : "low",
      locationSummary: "Access, correction, or deletion wording was not clearly surfaced"
    });
  }

  if (privacyRegion === "us" && trackingSignals.length > 0 && !gpcSignalPresent) {
    issues.push({
      layer: "privacy",
      pageUrl: responseUrl,
      title: "No visible Global Privacy Control cue detected",
      detail:
        "Tracking signals were detected, but no visible mention of Global Privacy Control or browser-based opt-out handling was found on the page.",
      severity: "low",
      locationSummary: "No visible GPC or browser opt-out cue found"
    });
  }

  if (policyLinkCount === 0) {
    issues.push({
      layer: "privacy",
      pageUrl: responseUrl,
      title: "No obvious privacy or cookie policy links detected",
      detail: "This page did not expose a visible privacy, cookie, or terms link or button in its markup.",
      severity: "medium",
      locationSummary: "No matching privacy, cookie, or data-protection cues found in page links or buttons"
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

  if (new URL(responseUrl).protocol !== "https:") {
    issues.push({
      layer: "security",
      pageUrl: responseUrl,
      title: "Page is not served over HTTPS",
      detail: "The scanned page resolved over HTTP rather than HTTPS.",
      severity: "high",
      locationSummary: `Resolved protocol: ${new URL(responseUrl).protocol}`
    });
  }

  if (insecureFormActionCount > 0) {
    issues.push({
      layer: "security",
      pageUrl: responseUrl,
      title: "Forms submit to insecure HTTP targets",
      detail: `${insecureFormActionCount} form${insecureFormActionCount === 1 ? " submits" : "s submit"} to an HTTP action target from an HTTPS page.`,
      severity: "medium",
      locationSummary: `${insecureFormActionCount} form action${insecureFormActionCount === 1 ? "" : "s"} resolve to HTTP`,
      evidence: buildElementEvidence($, insecureFormActionElements, (element) => {
        const action = normalizeText($(element).attr("action"));
        return action ? `Form action: ${action}` : "Form action resolves to an insecure HTTP endpoint.";
      })
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
      privacyRegion,
      htmlLangPresent,
      imageCount,
      formCount,
      emailFieldCount,
      checkboxCount,
      placeholderOnlyFieldCount,
      policyLinkCount,
      cookiePolicyLinkCount,
      privacyRightsLinkCount,
      doNotSellLinkCount,
      accessRequestSignalPresent,
      correctionRequestSignalPresent,
      deletionRequestSignalPresent,
      gpcSignalPresent,
      cookieBannerSignalPresent,
      cookieAcceptControlPresent,
      cookieRejectControlPresent,
      cookieManageControlPresent,
      cookieReopenControlPresent,
      trackingSignals,
      securityHeadersPresent,
      h1Count,
      headingCount: headings.length,
      mainLandmarkCount,
      skipLinkCount,
      positiveTabindexCount,
      insecureFormActionCount
    },
    internalLinks: Array.from(new Set(internalLinks))
  };
}

export async function scanSinglePage(
  rawUrl: string,
  mode: SinglePageMode = "local",
  privacyRegion?: PrivacyRegion
): Promise<PageScanResult> {
  const url = normalizeUrl(rawUrl);
  const { response, html } = await fetchHtmlPage(url);
  const page = analyzeHtmlPage(url, response.url, html, response.headers, privacyRegion);

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

async function analyzeFetchedPage(
  rawUrl: string,
  mode: SinglePageMode,
  privacyRegion?: PrivacyRegion
): Promise<AnalyzedPage> {
  const url = normalizeUrl(rawUrl);
  const { response, html } = await fetchHtmlPage(url);
  const page = analyzeHtmlPage(url, response.url, html, response.headers, privacyRegion);
  const policyVerificationIssues = await verifyPolicyLinkDestinations(response.url, html);

  if (policyVerificationIssues.length > 0) {
    page.issues.push(...policyVerificationIssues);
    page.score = scoreFromIssues(page.issues);
    page.summary =
      page.issues.length === 0
        ? "No obvious issues were detected on this page in the current local analysis."
        : `${page.issues.length} issue${page.issues.length === 1 ? "" : "s"} surfaced on this page in the current local analysis.`;
  }

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
  const maxPages = Math.max(1, Math.min(options.maxPages ?? 10, 100));
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
      const analyzedPage = await analyzeFetchedPage(current, "local", options.privacyRegion);
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

export async function runHostedToolScan(
  tool: ToolType,
  rawUrl: string,
  privacyRegion?: PrivacyRegion
): Promise<HostedToolScanResult> {
  const page = await analyzeFetchedPage(rawUrl, "hosted", privacyRegion);
  const allowedTitles = new Set(TOOL_ISSUE_TITLES[tool]);
  const filteredIssues = page.issues.filter((issue) => allowedTitles.has(issue.title));

  return applyIssueGuidanceToHostedToolResult({
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
      layer: issue.layer,
      title: issue.title,
      detail: issue.detail,
      severity: issue.severity,
      locationSummary: issue.locationSummary,
      evidence: issue.evidence
    })),
    limitationNotes: page.limitationNotes,
    metadata: page.metadata
  });
}