import type { Page } from "playwright";

import { scoreFromIssues } from "../../lib/scan/helpers";
import type { ComplianceLayer, PageScanResult, ScanIssue, SiteScanResult } from "../../lib/scanner-core";

type RenderedEvidence = {
  selector: string;
  snippet: string;
  note?: string;
};

type RenderedPageSnapshot = {
  hiddenFocusable: RenderedEvidence[];
  skipTargetFailures: RenderedEvidence[];
  skipActivationFailures: RenderedEvidence[];
  requiredIndicatorFailures: RenderedEvidence[];
  groupedControlLegendFailures: RenderedEvidence[];
  keyboardWalk: RenderedEvidence[];
  keyboardWalkFailed: boolean;
  keyboardWalkStalled: boolean;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildRenderedIssues(pageUrl: string, snapshot: RenderedPageSnapshot): ScanIssue[] {
  const issues: ScanIssue[] = [];

  if (snapshot.hiddenFocusable.length > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl,
      title: "Focusable elements hidden from view after render",
      detail: `${snapshot.hiddenFocusable.length} rendered focusable element${snapshot.hiddenFocusable.length === 1 ? " appears" : "s appear"} hidden from view, which can make keyboard navigation unpredictable.`,
      severity: snapshot.hiddenFocusable.length > 2 ? "medium" : "low",
      locationSummary: `${snapshot.hiddenFocusable.length} focusable element${snapshot.hiddenFocusable.length === 1 ? "" : "s"} hidden after render`,
      evidence: snapshot.hiddenFocusable
    });
  }

  if (snapshot.skipTargetFailures.length > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl,
      title: "Rendered skip link target missing",
      detail: `${snapshot.skipTargetFailures.length} skip link${snapshot.skipTargetFailures.length === 1 ? " points" : "s point"} to a target that was not present after the page rendered.`,
      severity: "medium",
      locationSummary: `${snapshot.skipTargetFailures.length} rendered skip link target${snapshot.skipTargetFailures.length === 1 ? "" : "s"} missing`,
      evidence: snapshot.skipTargetFailures
    });
  }

  if (snapshot.skipActivationFailures.length > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl,
      title: "Skip link did not change focus or route after activation",
      detail: `${snapshot.skipActivationFailures.length} rendered skip link${snapshot.skipActivationFailures.length === 1 ? " did" : "s did"} not appear to move focus or location when activated.`,
      severity: "medium",
      locationSummary: `${snapshot.skipActivationFailures.length} skip link activation${snapshot.skipActivationFailures.length === 1 ? "" : "s"} did not change focus or route`,
      evidence: snapshot.skipActivationFailures
    });
  }

  if (snapshot.requiredIndicatorFailures.length > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl,
      title: "Required form controls may lack a clear required indicator",
      detail: `${snapshot.requiredIndicatorFailures.length} required form control${snapshot.requiredIndicatorFailures.length === 1 ? " does" : "s do"} not appear to expose a clear required-state cue in the rendered UI.`,
      severity: "low",
      locationSummary: `${snapshot.requiredIndicatorFailures.length} required form control${snapshot.requiredIndicatorFailures.length === 1 ? "" : "s"} without an obvious required cue`,
      evidence: snapshot.requiredIndicatorFailures
    });
  }

  if (snapshot.groupedControlLegendFailures.length > 0) {
    issues.push({
      layer: "accessibility",
      pageUrl,
      title: "Grouped form controls missing a clear legend",
      detail: `${snapshot.groupedControlLegendFailures.length} rendered checkbox or radio group${snapshot.groupedControlLegendFailures.length === 1 ? " appears" : "s appear"} to be missing a clear legend.`,
      severity: "medium",
      locationSummary: `${snapshot.groupedControlLegendFailures.length} grouped control set${snapshot.groupedControlLegendFailures.length === 1 ? "" : "s"} missing a legend`,
      evidence: snapshot.groupedControlLegendFailures
    });
  }

  if (snapshot.keyboardWalkFailed) {
    issues.push({
      layer: "accessibility",
      pageUrl,
      title: "Keyboard tab progression could not be established after render",
      detail: "Olite could not establish a reliable keyboard focus target during the first tab steps after the page rendered.",
      severity: "medium",
      locationSummary: "Initial keyboard progression did not land on a clear focus target",
      evidence: snapshot.keyboardWalk
    });
  }

  if (snapshot.keyboardWalkStalled) {
    issues.push({
      layer: "accessibility",
      pageUrl,
      title: "Keyboard focus appears stalled during early tab progression",
      detail: "The first keyboard tab steps appeared to stall on the same target, which can make keyboard navigation harder to predict.",
      severity: "low",
      locationSummary: "Early keyboard tab progression repeated the same focus target",
      evidence: snapshot.keyboardWalk
    });
  }

  return issues;
}

async function readActiveElement(page: Page): Promise<RenderedEvidence | null> {
  return page.evaluate(() => {
    function normalizeText(value: string | null | undefined): string {
      return String(value ?? "").replace(/\s+/g, " ").trim();
    }

    function getSelector(element: Element): string {
      if (element.id) {
        return `${element.tagName.toLowerCase()}#${element.id}`;
      }

      const parts: string[] = [];
      let current: Element | null = element;

      while (current && parts.length < 4) {
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

    const active = document.activeElement;

    if (!(active instanceof Element) || active === document.body || active === document.documentElement) {
      return null;
    }

    return {
      selector: getSelector(active),
      snippet: normalizeText((active as HTMLElement).outerHTML || active.textContent || "").slice(0, 220),
      note: "Observed as the active element during keyboard tab sampling."
    };
  });
}

async function sampleKeyboardWalk(page: Page): Promise<{
  keyboardWalk: RenderedEvidence[];
  keyboardWalkFailed: boolean;
  keyboardWalkStalled: boolean;
}> {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (document.body instanceof HTMLElement) {
      document.body.focus?.();
    }
  });

  const steps: RenderedEvidence[] = [];
  let stableRepeats = 0;
  let lastSelector = "";

  for (let step = 0; step < 5; step += 1) {
    await page.keyboard.press("Tab");
    await delay(80);

    const active = await readActiveElement(page);

    if (!active) {
      continue;
    }

    const selector = active.selector;
    steps.push({
      ...active,
      note: `Keyboard step ${step + 1}`
    });

    if (selector === lastSelector) {
      stableRepeats += 1;
    } else {
      stableRepeats = 0;
      lastSelector = selector;
    }
  }

  return {
    keyboardWalk: steps,
    keyboardWalkFailed: steps.length === 0,
    keyboardWalkStalled: stableRepeats >= 2 && steps.length > 0
  };
}

async function collectRenderedSnapshot(page: Page): Promise<RenderedPageSnapshot> {
  return page.evaluate(async () => {
    const focusableSelector = [
      "a[href]",
      "button",
      'input:not([type="hidden"])',
      "select",
      "textarea",
      "summary",
      "iframe",
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(",");

    function normalizeText(value: string | null | undefined): string {
      return String(value ?? "").replace(/\s+/g, " ").trim();
    }

    function getSelector(element: Element): string {
      if (element.id) {
        return `${element.tagName.toLowerCase()}#${element.id}`;
      }

      const parts: string[] = [];
      let current: Element | null = element;

      while (current && parts.length < 4) {
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

    function getSnippet(element: Element): string {
      return normalizeText((element as HTMLElement).outerHTML || element.textContent || "").slice(0, 220);
    }

    function isVisible(element: Element): boolean {
      if (!(element instanceof HTMLElement)) {
        return true;
      }

      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" && rect.width > 0 && rect.height > 0;
    }

    function isCandidateFocusable(element: Element): boolean {
      if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
        return false;
      }

      if (element instanceof HTMLElement && element.hasAttribute("disabled")) {
        return false;
      }

      if (element.closest('[hidden], [inert], [aria-hidden="true"]')) {
        return false;
      }

      return true;
    }

    const focusable = Array.from(document.querySelectorAll(focusableSelector)).filter(isCandidateFocusable);
    const hiddenFocusable = focusable
      .filter((element) => !isVisible(element))
      .slice(0, 5)
      .map((element) => ({
        selector: getSelector(element),
        snippet: getSnippet(element),
        note: "Element appears focusable in the DOM but is not visibly rendered."
      }));

    const skipLinks = Array.from(document.querySelectorAll('a[href^="#"]')).filter((element) =>
      /skip|skip to content|jump to content|skip navigation/i.test(
        normalizeText(element.textContent || element.getAttribute("aria-label") || element.getAttribute("title"))
      )
    );

    const skipTargetFailures = skipLinks
      .map((element) => {
        const href = element.getAttribute("href") || "";
        const targetId = href.startsWith("#") ? href.slice(1) : "";
        const target = targetId ? document.getElementById(targetId) : null;

        if (target) {
          return null;
        }

        return {
          selector: getSelector(element),
          snippet: getSnippet(element),
          note: targetId ? `Skip link target #${targetId} was not found after render.` : "Skip link target could not be resolved."
        };
      })
      .filter(Boolean)
      .slice(0, 5) as RenderedEvidence[];

    const skipActivationFailures: RenderedEvidence[] = [];

    for (const element of skipLinks.slice(0, 2)) {
      const href = element.getAttribute("href") || "";
      const targetId = href.startsWith("#") ? href.slice(1) : "";
      const target = targetId ? document.getElementById(targetId) : null;

      if (!target) {
        continue;
      }

      const previousHash = window.location.hash;
      const beforeActive = document.activeElement;
      (element as HTMLElement).click();
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const afterActive = document.activeElement;
      const routeChanged = window.location.hash !== previousHash;
      const focusChanged = Boolean(afterActive && afterActive !== beforeActive && (afterActive === target || target.contains(afterActive)));

      if (!routeChanged && !focusChanged) {
        skipActivationFailures.push({
          selector: getSelector(element),
          snippet: getSnippet(element),
          note: targetId
            ? `Skip link target #${targetId} existed, but activation did not change focus or route.`
            : "Skip link activation did not change focus or route."
        });
      }
    }

    function getAccessibleCue(element: Element): string {
      if (!(element instanceof HTMLElement)) {
        return "";
      }

      const labelledBy = normalizeText(element.getAttribute("aria-labelledby"));
      const describedBy = normalizeText(element.getAttribute("aria-describedby"));
      const explicitLabel = normalizeText(element.getAttribute("aria-label") || element.getAttribute("title") || element.getAttribute("placeholder"));
      const closestLabel = normalizeText(element.closest("label")?.textContent);
      const id = element.id;
      const linkedLabel = id ? normalizeText(document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent) : "";
      const labelledByText = labelledBy
        .split(/\s+/)
        .filter(Boolean)
        .map((value) => normalizeText(document.getElementById(value)?.textContent))
        .join(" ");
      const describedByText = describedBy
        .split(/\s+/)
        .filter(Boolean)
        .map((value) => normalizeText(document.getElementById(value)?.textContent))
        .join(" ");

      return [closestLabel, linkedLabel, labelledByText, describedByText, explicitLabel].filter(Boolean).join(" ");
    }

    const requiredIndicatorFailures = Array.from(
      document.querySelectorAll('input[required], select[required], textarea[required], [aria-required="true"]')
    )
      .filter((element) => {
        const input = element as HTMLInputElement;
        const type = input.type?.toLowerCase() || "";

        if (["hidden", "submit", "reset", "button", "image", "range", "color"].includes(type)) {
          return false;
        }

        const cueText = getAccessibleCue(element);
        return !/(required|mandatory|must be filled|needed)/i.test(cueText);
      })
      .slice(0, 5)
      .map((element) => ({
        selector: getSelector(element),
        snippet: getSnippet(element),
        note: "Required state was present, but the rendered control did not expose an obvious required cue in nearby labeling or descriptive text."
      }));

    const groupedControlLegendFailures = Array.from(document.querySelectorAll("fieldset"))
      .filter((fieldset) => {
        const controls = Array.from(fieldset.querySelectorAll('input[type="radio"], input[type="checkbox"]'));

        if (controls.length < 2) {
          return false;
        }

        const legendText = normalizeText(fieldset.querySelector("legend")?.textContent);
        return legendText.length === 0;
      })
      .slice(0, 5)
      .map((fieldset) => ({
        selector: getSelector(fieldset),
        snippet: getSnippet(fieldset),
        note: "Grouped checkbox or radio controls were rendered inside a fieldset without a readable legend."
      }));

    return {
      hiddenFocusable,
      skipTargetFailures,
      skipActivationFailures,
      requiredIndicatorFailures,
      groupedControlLegendFailures,
      keyboardWalk: [],
      keyboardWalkFailed: false,
      keyboardWalkStalled: false
    };
  }) as Promise<RenderedPageSnapshot>;
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

export async function inspectRenderedPage(url: string): Promise<RenderedPageSnapshot> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 1366, height: 900 },
      ignoreHTTPSErrors: true
    });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await delay(700);
    const snapshot = await collectRenderedSnapshot(page);
    const keyboardWalk = await sampleKeyboardWalk(page);

    return {
      ...snapshot,
      ...keyboardWalk
    };
  } finally {
    await browser.close();
  }
}

export async function augmentSiteResultWithRenderedAccessibility(result: SiteScanResult): Promise<SiteScanResult> {
  const pageLimit = result.pages.length === 1 ? 1 : Math.min(result.pages.length, 3);
  const nextPages = [...result.pages];
  const nextLimitations = [...result.limitationNotes];

  for (let index = 0; index < pageLimit; index += 1) {
    const page = nextPages[index];

    try {
      const snapshot = await inspectRenderedPage(page.normalizedUrl);
      const renderedIssues = buildRenderedIssues(page.normalizedUrl, snapshot);

      if (renderedIssues.length > 0) {
        nextPages[index] = {
          ...page,
          issues: [...page.issues, ...renderedIssues]
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown rendered-check error.";
      nextLimitations.push(`Rendered accessibility checks could not run for ${page.normalizedUrl}: ${message}`);
    }
  }

  nextLimitations.push(
    `Desktop rendered accessibility checks sampled ${pageLimit} page${pageLimit === 1 ? "" : "s"} for post-render focusability, skip-link behavior, early keyboard tab progression, and basic rendered form structure cues.`
  );

  return rebuildSite({
    ...result,
    pages: nextPages
  }, nextLimitations);
}