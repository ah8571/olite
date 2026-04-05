import type { Browser, BrowserContext, Cookie, Page } from "playwright";

import { scoreFromIssues } from "../../lib/scan/helpers";
import type {
  ComplianceLayer,
  PageRuntimeAudit,
  PageScanResult,
  PrivacyRegion,
  RuntimeAuditControl,
  RuntimeAuditCookie,
  RuntimeAuditGpcComparison,
  RuntimeAuditInteraction,
  RuntimeAuditPhase,
  RuntimeAuditTrackerRequest,
  ScanIssue,
  SiteScanResult
} from "../../lib/scanner-core";

type ConsentControlKind = RuntimeAuditControl["kind"];

type RequestPattern = {
  label: string;
  match: RegExp;
};

type CookiePattern = {
  label: string;
  matchName: RegExp;
};

type RuntimeAuditSnapshot = {
  runtimeAudit: PageRuntimeAudit;
  limitationNotes: string[];
};

const MAX_ROUTE_SAMPLES = 3;

const TRACKER_REQUEST_PATTERNS: RequestPattern[] = [
  { label: "Google Analytics", match: /(google-analytics\.com|googletagmanager\.com|gtag\/js|collect\?v=)/i },
  { label: "Meta Pixel", match: /(connect\.facebook\.net|facebook\.com\/tr)/i },
  { label: "LinkedIn Insight", match: /(snap\.licdn\.com|px\.ads\.linkedin\.com)/i },
  { label: "Hotjar", match: /(static\.hotjar\.com|script\.hotjar\.com|vars\.hotjar\.com)/i },
  { label: "Microsoft Clarity", match: /(clarity\.ms|bat\.bing\.com)/i },
  { label: "TikTok Pixel", match: /(analytics\.tiktok\.com|business-api\.tiktok\.com)/i },
  { label: "X Ads", match: /(static\.ads-twitter\.com|analytics\.twitter\.com)/i }
];

const TRACKER_COOKIE_PATTERNS: CookiePattern[] = [
  { label: "Google Analytics", matchName: /^(_ga|_gid|_gat|_gcl_au|FPID|FPLC)$/i },
  { label: "Meta Pixel", matchName: /^(_fbp|_fbc)$/i },
  { label: "LinkedIn Insight", matchName: /^(_li_id|li_gc|li_sugr)$/i },
  { label: "Hotjar", matchName: /^(_hj[A-Za-z0-9_]+)$/i },
  { label: "Microsoft Clarity", matchName: /^(_clck|_clsk|CLID|ANONCHK|MR|MUID)$/i },
  { label: "TikTok Pixel", matchName: /^(_ttp)$/i },
  { label: "X Ads", matchName: /^(_twclid|personalization_id)$/i }
];

const CONTROL_PATTERNS: Record<ConsentControlKind, RegExp> = {
  accept: /\b(accept(?: all| cookies)?|allow(?: all| cookies)?|got it|enable all|i agree)\b/i,
  reject: /\b(reject(?: all| cookies)?|decline|deny|refuse|opt out|continue without accepting|necessary only|essential only)\b/i,
  manage: /\b(manage(?: preferences| cookies)?|settings|customi[sz]e|privacy choices|your choices)\b/i,
  reopen: /\b(cookie settings|cookie preferences|privacy choices|change(?: privacy| cookie)? settings|update preferences|review choices|review preferences|withdraw consent|privacy settings)\b/i
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildRuntimeIssues(page: PageScanResult, runtimeAudit: PageRuntimeAudit): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const initialRequests = runtimeAudit.trackerRequests.filter((entry) => entry.phase === "before-interaction");
  const initialCookies = runtimeAudit.trackerCookies.filter((entry) => entry.phase === "before-interaction");
  const postInteractionRequests = runtimeAudit.trackerRequests.filter((entry) => entry.phase !== "before-interaction");
  const postInteractionCookies = runtimeAudit.trackerCookies.filter((entry) => entry.phase !== "before-interaction");
  const hasConsentControls = runtimeAudit.consentControls.length > 0;
  const hasRejectControl = runtimeAudit.consentControls.some((control) => control.kind === "reject");
  const hasManageControl = runtimeAudit.consentControls.some((control) => control.kind === "manage");
  const hasPostInteractionReopenControl = runtimeAudit.postInteractionControls.some((control) => control.kind === "reopen");

  if (page.metadata.privacyRegion === "eu" && hasConsentControls && !hasRejectControl) {
    issues.push({
      layer: "privacy",
      pageUrl: page.normalizedUrl,
      title: "Consent UI does not expose an obvious reject control",
      detail: "The runtime browser audit detected consent-style controls, but it did not find an obvious reject or decline option.",
      severity: "medium",
      locationSummary: "Consent controls were detected without an obvious reject option",
      evidence: runtimeAudit.consentControls.slice(0, 5).map((entry) => ({
        selector: entry.selector,
        snippet: entry.label,
        note: `${entry.kind} control detected during runtime consent audit.`
      }))
    });
  }

  if (page.metadata.privacyRegion === "eu" && hasConsentControls && !hasManageControl) {
    issues.push({
      layer: "privacy",
      pageUrl: page.normalizedUrl,
      title: "Consent UI does not expose an obvious manage-preferences control",
      detail: "The runtime browser audit detected consent-style controls, but it did not find an obvious manage-preferences or settings option.",
      severity: "low",
      locationSummary: "Consent controls were detected without an obvious preferences management option",
      evidence: runtimeAudit.consentControls.slice(0, 5).map((entry) => ({
        selector: entry.selector,
        snippet: entry.label,
        note: `${entry.kind} control detected during runtime consent audit.`
      }))
    });
  }

  if (
    page.metadata.privacyRegion === "eu" &&
    hasConsentControls &&
    (runtimeAudit.interactionAttempted === "reject" || runtimeAudit.interactionAttempted === "accept") &&
    !hasPostInteractionReopenControl
  ) {
    issues.push({
      layer: "privacy",
      pageUrl: page.normalizedUrl,
      title: "No obvious cookie settings or withdrawal path was detected after consent interaction",
      detail:
        "The runtime browser audit interacted with the visible consent UI, but it did not find an obvious Cookie Settings, Privacy Choices, or withdrawal path afterward.",
      severity: "low",
      locationSummary: "No obvious way to revisit cookie choices was detected after the consent interaction",
      evidence: runtimeAudit.consentControls.slice(0, 5).map((entry) => ({
        selector: entry.selector,
        snippet: entry.label,
        note: `${entry.kind} control detected before the consent interaction.`
      }))
    });
  }

  if (page.metadata.privacyRegion === "eu" && initialRequests.length > 0) {
    issues.push({
      layer: "privacy",
      pageUrl: page.normalizedUrl,
      title: "Tracking requests fired before consent interaction",
      detail: `${initialRequests.length} tracker request${initialRequests.length === 1 ? " was" : "s were"} observed before any consent control was activated in the runtime browser audit.`,
      severity: "high",
      locationSummary: "Runtime network activity before any consent click",
      evidence: initialRequests.slice(0, 5).map((entry) => ({
        selector: "runtime network",
        snippet: entry.url,
        note: `${entry.label} request observed during ${entry.phase}.`
      }))
    });
  }

  if (page.metadata.privacyRegion === "eu" && initialCookies.length > 0) {
    issues.push({
      layer: "privacy",
      pageUrl: page.normalizedUrl,
      title: "Tracking cookies set before consent interaction",
      detail: `${initialCookies.length} tracking cookie${initialCookies.length === 1 ? " was" : "s were"} present before any consent control was activated in the runtime browser audit.`,
      severity: "high",
      locationSummary: "Runtime cookie state before any consent click",
      evidence: initialCookies.slice(0, 5).map((entry) => ({
        selector: "runtime cookie jar",
        snippet: `${entry.name} @ ${entry.domain}${entry.path}`,
        note: `${entry.label} cookie observed during ${entry.phase}.`
      }))
    });
  }

  if (hasRejectControl && runtimeAudit.interactionAttempted === "reject" && postInteractionRequests.length > 0) {
    issues.push({
      layer: "privacy",
      pageUrl: page.normalizedUrl,
      title: "Tracking requests still observed after reject interaction",
      detail: `${postInteractionRequests.length} tracker request${postInteractionRequests.length === 1 ? " was" : "s were"} still observed immediately after activating a reject-style consent control.`,
      severity: "medium",
      locationSummary: "Runtime network activity persisted after reject interaction",
      evidence: postInteractionRequests.slice(0, 5).map((entry) => ({
        selector: "runtime network",
        snippet: entry.url,
        note: `${entry.label} request observed during ${entry.phase}.`
      }))
    });
  }

  if (hasRejectControl && runtimeAudit.interactionAttempted === "reject" && postInteractionCookies.length > 0) {
    issues.push({
      layer: "privacy",
      pageUrl: page.normalizedUrl,
      title: "Tracking cookies still present after reject interaction",
      detail: `${postInteractionCookies.length} tracking cookie${postInteractionCookies.length === 1 ? " remained" : "s remained"} after activating a reject-style consent control.`,
      severity: "medium",
      locationSummary: "Runtime cookie state after reject interaction",
      evidence: postInteractionCookies.slice(0, 5).map((entry) => ({
        selector: "runtime cookie jar",
        snippet: `${entry.name} @ ${entry.domain}${entry.path}`,
        note: `${entry.label} cookie observed during ${entry.phase}.`
      }))
    });
  }

  if (
    page.metadata.privacyRegion === "us" &&
    runtimeAudit.gpcComparison?.simulated &&
    runtimeAudit.gpcComparison.baselineTrackerRequestCount + runtimeAudit.gpcComparison.baselineTrackerCookieCount > 0 &&
    !runtimeAudit.gpcComparison.behaviorChanged
  ) {
    issues.push({
      layer: "privacy",
      pageUrl: page.normalizedUrl,
      title: "Tracking behavior did not change when GPC was simulated",
      detail:
        `Global Privacy Control was simulated, but the observed tracking counts did not change. Baseline requests/cookies: ` +
        `${runtimeAudit.gpcComparison.baselineTrackerRequestCount}/${runtimeAudit.gpcComparison.baselineTrackerCookieCount}. ` +
        `With GPC: ${runtimeAudit.gpcComparison.gpcTrackerRequestCount}/${runtimeAudit.gpcComparison.gpcTrackerCookieCount}.`,
      severity: "medium",
      locationSummary: "Runtime behavior looked unchanged when a browser privacy signal was simulated",
      evidence: [
        {
          selector: "runtime network",
          snippet: `baseline requests=${runtimeAudit.gpcComparison.baselineTrackerRequestCount}, gpc requests=${runtimeAudit.gpcComparison.gpcTrackerRequestCount}`,
          note: "Compare tracker activity with and without the simulated GPC signal."
        },
        {
          selector: "runtime cookie jar",
          snippet: `baseline cookies=${runtimeAudit.gpcComparison.baselineTrackerCookieCount}, gpc cookies=${runtimeAudit.gpcComparison.gpcTrackerCookieCount}`,
          note: "Compare tracking-cookie presence with and without the simulated GPC signal."
        }
      ]
    });
  }

  return issues;
}

function rebuildPage(page: PageScanResult): PageScanResult {
  const score = scoreFromIssues(page.issues);
  const summary =
    page.issues.length === 0
      ? "No obvious issues were detected on this page in the current local analysis."
      : `${page.issues.length} issue${page.issues.length === 1 ? "" : "s"} surfaced on this page in the current local analysis.`;

  return {
    ...page,
    score,
    summary
  };
}

function rebuildSite(result: SiteScanResult, limitationNotes: string[]): SiteScanResult {
  const pages = result.pages.map(rebuildPage);
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
    ...result,
    pages,
    issuesByLayer,
    score,
    summary,
    limitationNotes
  };
}

function matchTrackerRequest(url: string): string | null {
  for (const pattern of TRACKER_REQUEST_PATTERNS) {
    if (pattern.match.test(url)) {
      return pattern.label;
    }
  }

  return null;
}

function extractTrackingCookies(cookies: Cookie[], phase: RuntimeAuditPhase): RuntimeAuditCookie[] {
  const matches: RuntimeAuditCookie[] = [];

  for (const cookie of cookies) {
    const pattern = TRACKER_COOKIE_PATTERNS.find((entry) => entry.matchName.test(cookie.name));

    if (!pattern) {
      continue;
    }

    matches.push({
      label: pattern.label,
      name: cookie.name,
      domain: cookie.domain,
      path: cookie.path,
      phase
    });
  }

  return matches;
}

async function createAuditContext(browser: Browser, useGpc = false): Promise<BrowserContext> {
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    ignoreHTTPSErrors: true,
    ...(useGpc ? { extraHTTPHeaders: { "Sec-GPC": "1" } } : {})
  });

  if (useGpc) {
    await context.addInitScript(() => {
      try {
        Object.defineProperty(Navigator.prototype, "globalPrivacyControl", {
          configurable: true,
          get() {
            return true;
          }
        });
      } catch {
        try {
          Object.defineProperty(window.navigator, "globalPrivacyControl", {
            configurable: true,
            value: true
          });
        } catch {
          // Ignore pages that prevent redefining this property.
        }
      }
    });
  }

  return context;
}

async function inspectTrackerState(browser: Browser, url: string, useGpc = false): Promise<{
  requestCount: number;
  cookieCount: number;
}> {
  const context = await createAuditContext(browser, useGpc);

  try {
    const page = await context.newPage();
    const trackerRequests: RuntimeAuditTrackerRequest[] = [];

    page.on("request", (request) => {
      const label = matchTrackerRequest(request.url());

      if (!label) {
        return;
      }

      trackerRequests.push({
        label,
        url: request.url(),
        resourceType: request.resourceType(),
        phase: "before-interaction"
      });
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await delay(1800);

    return {
      requestCount: trackerRequests.length,
      cookieCount: extractTrackingCookies(await context.cookies(), "before-interaction").length
    };
  } finally {
    await context.close();
  }
}

async function inspectGpcComparison(browser: Browser, url: string): Promise<RuntimeAuditGpcComparison> {
  const baseline = await inspectTrackerState(browser, url, false);
  const gpc = await inspectTrackerState(browser, url, true);

  return {
    simulated: true,
    baselineTrackerRequestCount: baseline.requestCount,
    baselineTrackerCookieCount: baseline.cookieCount,
    gpcTrackerRequestCount: gpc.requestCount,
    gpcTrackerCookieCount: gpc.cookieCount,
    behaviorChanged: baseline.requestCount !== gpc.requestCount || baseline.cookieCount !== gpc.cookieCount
  };
}

async function collectSameOriginRouteSamples(page: Page, origin: string): Promise<string[]> {
  const currentUrl = page.url();

  return page.evaluate(
    ({ currentUrl: currentPageUrl, origin: currentOrigin, maxSamples }) => {
      const urls: string[] = [];

      for (const link of Array.from(document.querySelectorAll("a[href]"))) {
        const href = link.getAttribute("href");

        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
          continue;
        }

        try {
          const resolved = new URL(href, currentPageUrl);

          if (resolved.origin !== currentOrigin) {
            continue;
          }

          resolved.hash = "";
          const value = resolved.toString();

          if (!urls.includes(value)) {
            urls.push(value);
          }

          if (urls.length >= maxSamples) {
            break;
          }
        } catch {
          continue;
        }
      }

      return urls;
    },
    { currentUrl, origin, maxSamples: Math.max(MAX_ROUTE_SAMPLES - 1, 0) }
  );
}

async function followSameOriginRoutes(page: Page, sampledUrls: string[], routeUrls: string[]): Promise<void> {
  for (const routeUrl of routeUrls) {
    if (sampledUrls.includes(routeUrl)) {
      continue;
    }

    await page.goto(routeUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    sampledUrls.push(routeUrl);
    await delay(1200);
  }
}

async function detectConsentControls(page: Page): Promise<RuntimeAuditControl[]> {
  return page.evaluate((patternSource) => {
    const patterns = Object.fromEntries(
      Object.entries(patternSource).map(([key, value]) => [key, new RegExp(value, "i")])
    ) as Record<"accept" | "reject" | "manage" | "reopen", RegExp>;

    function normalizeText(value: string | null | undefined): string {
      return String(value ?? "").replace(/\s+/g, " ").trim();
    }

    function buildSelector(element: Element): string {
      if (element.id) {
        return `${element.tagName.toLowerCase()}#${element.id}`;
      }

      const parts: string[] = [];
      let current: Element | null = element;

      while (current && parts.length < 5) {
        const tagName = current.tagName.toLowerCase();
        const siblings = current.parentElement
          ? Array.from(current.parentElement.children).filter((child) => child.tagName === current?.tagName)
          : [];
        const index = siblings.indexOf(current) + 1;
        parts.unshift(`${tagName}:nth-of-type(${Math.max(index, 1)})`);
        current = current.parentElement;
      }

      return parts.join(" > ");
    }

    function isVisible(element: Element): boolean {
      if (!(element instanceof HTMLElement)) {
        return true;
      }

      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" && rect.width > 0 && rect.height > 0;
    }

    const controls: Array<{ kind: "accept" | "reject" | "manage" | "reopen"; label: string; selector: string }> = [];
    const candidates = Array.from(
      document.querySelectorAll('button, a[href], input[type="button"], input[type="submit"], [role="button"]')
    );

    for (const element of candidates) {
      if (!isVisible(element)) {
        continue;
      }

      const label = normalizeText(
        element.textContent ||
          element.getAttribute("aria-label") ||
          element.getAttribute("title") ||
          element.getAttribute("value")
      );

      if (!label) {
        continue;
      }

      for (const kind of ["reject", "manage", "reopen", "accept"] as const) {
        if (!controls.some((entry) => entry.kind === kind) && patterns[kind].test(label)) {
          controls.push({ kind, label, selector: buildSelector(element) });
        }
      }
    }

    return controls;
  }, {
    accept: CONTROL_PATTERNS.accept.source,
    reject: CONTROL_PATTERNS.reject.source,
    manage: CONTROL_PATTERNS.manage.source,
    reopen: CONTROL_PATTERNS.reopen.source
  });
}

async function attemptConsentInteraction(page: Page, controls: RuntimeAuditControl[]): Promise<RuntimeAuditInteraction> {
  const target = controls.find((entry) => entry.kind === "reject") ?? controls.find((entry) => entry.kind === "accept");

  if (!target) {
    return "none";
  }

  try {
    await page.locator(target.selector).first().click({ timeout: 4000 });
    await delay(1400);
    return target.kind === "reject" ? "reject" : "accept";
  } catch {
    return "failed";
  }
}

async function inspectRuntimePrivacy(url: string, privacyRegion: PrivacyRegion): Promise<RuntimeAuditSnapshot> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await createAuditContext(browser, false);
    const page = await context.newPage();
    const trackerRequests: RuntimeAuditTrackerRequest[] = [];
    const sampledUrls = [url];
    let currentPhase: RuntimeAuditPhase = "before-interaction";

    page.on("request", (request) => {
      const label = matchTrackerRequest(request.url());

      if (!label) {
        return;
      }

      trackerRequests.push({
        label,
        url: request.url(),
        resourceType: request.resourceType(),
        phase: currentPhase
      });
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    sampledUrls[0] = page.url();
    await delay(1800);

    const consentControls = await detectConsentControls(page);
    const sameOriginRoutes = await collectSameOriginRouteSamples(page, new URL(page.url()).origin);
    const initialCookies = extractTrackingCookies(await context.cookies(), "before-interaction");
    const interactionAttempted = await attemptConsentInteraction(page, consentControls);

    if (interactionAttempted === "reject") {
      currentPhase = "after-reject";
      await delay(1200);
    } else if (interactionAttempted === "accept") {
      currentPhase = "after-accept";
      await delay(1200);
    }

    if (interactionAttempted === "reject" || interactionAttempted === "accept") {
      await followSameOriginRoutes(page, sampledUrls, sameOriginRoutes);
    }

    const postInteractionControls =
      interactionAttempted === "none" || interactionAttempted === "failed" ? [] : await detectConsentControls(page);

    const postInteractionCookies =
      interactionAttempted === "none" || interactionAttempted === "failed"
        ? []
        : extractTrackingCookies(await context.cookies(), currentPhase);
    const gpcComparison = privacyRegion === "us" ? await inspectGpcComparison(browser, url) : undefined;

    const runtimeAudit: PageRuntimeAudit = {
      ran: true,
      consentControls,
      postInteractionControls,
      interactionAttempted,
      sampledUrls,
      ...(gpcComparison ? { gpcComparison } : {}),
      trackerRequests,
      trackerCookies: [...initialCookies, ...postInteractionCookies],
      initialTrackerRequestCount: trackerRequests.filter((entry) => entry.phase === "before-interaction").length,
      initialTrackerCookieCount: initialCookies.length,
      postInteractionTrackerRequestCount: trackerRequests.filter((entry) => entry.phase !== "before-interaction").length,
      postInteractionTrackerCookieCount: postInteractionCookies.length
    };

    const limitationNotes = [
      `Runtime browser audit sampled ${sampledUrls.length} same-origin page${sampledUrls.length === 1 ? "" : "s"} in a headless browser and observed request and cookie signals before and immediately after one consent interaction.`,
      ...(gpcComparison ? ["Runtime browser audit also compared tracker behavior with and without a simulated Global Privacy Control signal."] : []),
      "This runtime audit does not prove full sitewide consent compliance and does not replace route-by-route or authenticated flow testing."
    ];

    return {
      runtimeAudit,
      limitationNotes
    };
  } finally {
    await browser.close();
  }
}

export async function augmentSiteResultWithRuntimePrivacyAudit(result: SiteScanResult): Promise<SiteScanResult> {
  const nextPages = [...result.pages];
  const nextLimitations = [...result.limitationNotes];
  const pageLimit = Math.min(result.pages.length, 1);

  for (let index = 0; index < pageLimit; index += 1) {
    const page = nextPages[index];

    try {
      const { runtimeAudit, limitationNotes } = await inspectRuntimePrivacy(page.normalizedUrl, page.metadata.privacyRegion);
      const runtimeIssues = buildRuntimeIssues(page, runtimeAudit);

      nextPages[index] = {
        ...page,
        metadata: {
          ...page.metadata,
          runtimeAudit
        },
        issues: [...page.issues, ...runtimeIssues]
      };

      nextLimitations.push(...limitationNotes);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown runtime audit error.";
      nextLimitations.push(`Runtime browser audit could not run for ${page.normalizedUrl}: ${message}`);
    }
  }

  return rebuildSite(
    {
      ...result,
      pages: nextPages
    },
    nextLimitations
  );
}