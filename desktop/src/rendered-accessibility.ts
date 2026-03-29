import { BrowserWindow } from "electron";

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

async function readActiveElement(window: BrowserWindow): Promise<RenderedEvidence | null> {
  return (await window.webContents.executeJavaScript(`(() => {
    function normalizeText(value) {
      return String(value || '').replace(/\s+/g, ' ').trim();
    }

    function getSelector(element) {
      if (!(element instanceof Element)) {
        return 'unknown';
      }

      if (element.id) {
        return element.tagName.toLowerCase() + '#' + element.id;
      }

      const parts = [];
      let current = element;

      while (current && current instanceof Element && parts.length < 4) {
        const tag = current.tagName.toLowerCase();
        const siblings = current.parentElement ? Array.from(current.parentElement.children).filter((child) => child.tagName === current.tagName) : [];
        const index = siblings.indexOf(current) + 1;
        parts.unshift(tag + ':nth-of-type(' + Math.max(index, 1) + ')');
        current = current.parentElement;
      }

      return parts.join(' > ');
    }

    const active = document.activeElement;

    if (!active || active === document.body || active === document.documentElement) {
      return null;
    }

    return {
      selector: getSelector(active),
      snippet: normalizeText(active.outerHTML || active.textContent || '').slice(0, 220),
      note: 'Observed as the active element during keyboard tab sampling.'
    };
  })()`)) as RenderedEvidence | null;
}

async function sampleKeyboardWalk(window: BrowserWindow): Promise<{
  keyboardWalk: RenderedEvidence[];
  keyboardWalkFailed: boolean;
  keyboardWalkStalled: boolean;
}> {
  await window.webContents.executeJavaScript(`(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (document.body instanceof HTMLElement) {
      document.body.focus?.();
    }
  })()`);

  const steps: RenderedEvidence[] = [];
  let stableRepeats = 0;
  let lastSelector = "";

  for (let step = 0; step < 5; step += 1) {
    window.webContents.sendInputEvent({ type: "keyDown", keyCode: "Tab" });
    window.webContents.sendInputEvent({ type: "keyUp", keyCode: "Tab" });
    await delay(80);

    const active = await readActiveElement(window);

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

async function inspectRenderedPage(url: string): Promise<RenderedPageSnapshot> {
  const window = new BrowserWindow({
    show: false,
    width: 1366,
    height: 900,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  try {
    await window.loadURL(url);
    await delay(700);

    const snapshot = (await window.webContents.executeJavaScript(`(async () => {
      const focusableSelector = [
        'a[href]',
        'button',
        'input:not([type="hidden"])',
        'select',
        'textarea',
        'summary',
        'iframe',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ].join(',');

      function normalizeText(value) {
        return String(value || '').replace(/\s+/g, ' ').trim();
      }

      function getSelector(element) {
        if (!(element instanceof Element)) {
          return 'unknown';
        }

        if (element.id) {
          return element.tagName.toLowerCase() + '#' + element.id;
        }

        const parts = [];
        let current = element;

        while (current && current instanceof Element && parts.length < 4) {
          const tag = current.tagName.toLowerCase();
          const siblings = current.parentElement ? Array.from(current.parentElement.children).filter((child) => child.tagName === current.tagName) : [];
          const index = siblings.indexOf(current) + 1;
          parts.unshift(tag + ':nth-of-type(' + Math.max(index, 1) + ')');
          current = current.parentElement;
        }

        return parts.join(' > ');
      }

      function getSnippet(element) {
        if (!(element instanceof Element)) {
          return '';
        }

        return normalizeText(element.outerHTML || element.textContent || '').slice(0, 220);
      }

      function isVisible(element) {
        if (!(element instanceof HTMLElement)) {
          return true;
        }

        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && rect.width > 0 && rect.height > 0;
      }

      function isCandidateFocusable(element) {
        if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
          return false;
        }

        if (element instanceof HTMLElement && element.hasAttribute('disabled')) {
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
          note: 'Element appears focusable in the DOM but is not visibly rendered.'
        }));

      const skipLinks = Array.from(document.querySelectorAll('a[href^="#"]'))
        .filter((element) => /skip|skip to content|jump to content|skip navigation/i.test(normalizeText(element.textContent || element.getAttribute('aria-label') || element.getAttribute('title'))))
      const skipTargetFailures = skipLinks
        .map((element) => {
          const href = element.getAttribute('href') || '';
          const targetId = href.startsWith('#') ? href.slice(1) : '';
          const target = targetId ? document.getElementById(targetId) : null;

          if (target) {
            return null;
          }

          return {
            selector: getSelector(element),
            snippet: getSnippet(element),
            note: targetId ? 'Skip link target #' + targetId + ' was not found after render.' : 'Skip link target could not be resolved.'
          };
        })
        .filter(Boolean)
        .slice(0, 5);

      const skipActivationFailures = [];

      for (const element of skipLinks.slice(0, 2)) {
        const href = element.getAttribute('href') || '';
        const targetId = href.startsWith('#') ? href.slice(1) : '';
        const target = targetId ? document.getElementById(targetId) : null;

        if (!target) {
          continue;
        }

        const previousHash = window.location.hash;
        const beforeActive = document.activeElement;
        element.click();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const afterActive = document.activeElement;
        const routeChanged = window.location.hash !== previousHash;
        const focusChanged = Boolean(afterActive && afterActive !== beforeActive && (afterActive === target || target.contains(afterActive)));

        if (!routeChanged && !focusChanged) {
          skipActivationFailures.push({
            selector: getSelector(element),
            snippet: getSnippet(element),
            note: targetId ? 'Skip link target #' + targetId + ' existed, but activation did not change focus or route.' : 'Skip link activation did not change focus or route.'
          });
        }
      }

      return {
        hiddenFocusable,
        skipTargetFailures,
        skipActivationFailures,
        keyboardWalk: [],
        keyboardWalkFailed: false,
        keyboardWalkStalled: false
      };
    })()`)) as RenderedPageSnapshot;

    const keyboardWalk = await sampleKeyboardWalk(window);

    return {
      ...snapshot,
      ...keyboardWalk
    };
  } finally {
    if (!window.isDestroyed()) {
      window.destroy();
    }
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
    `Desktop rendered accessibility checks sampled ${pageLimit} page${pageLimit === 1 ? "" : "s"} for post-render focusability, skip-link behavior, and early keyboard tab progression.`
  );

  return rebuildSite({
    ...result,
    pages: nextPages
  }, nextLimitations);
}