import AxeBuilder from "@axe-core/playwright";

import { scoreFromIssues } from "../../lib/scan/helpers";
import type { ComplianceLayer, PageScanResult, ScanIssue, SiteScanResult } from "../../lib/scanner-core";

type AxeEvidence = {
  selector: string;
  snippet: string;
  note?: string;
};

function impactToSeverity(impact: string | null | undefined): "low" | "medium" | "high" {
  if (impact === "critical" || impact === "serious") {
    return "high";
  }

  if (impact === "moderate") {
    return "medium";
  }

  return "low";
}

function buildAxeIssues(pageUrl: string, violations: Awaited<ReturnType<InstanceType<typeof AxeBuilder>["analyze"]>>["violations"]): ScanIssue[] {
  return violations.map((violation) => {
    const evidence: AxeEvidence[] = violation.nodes.slice(0, 5).map((node) => ({
      selector: node.target.join(" | ") || "axe target unavailable",
      snippet: (node.html || "").replace(/\s+/g, " ").trim().slice(0, 220),
      note: node.failureSummary?.replace(/\s+/g, " ").trim()
    }));

    return {
      layer: "accessibility",
      pageUrl,
      title: `Axe rule violation: ${violation.id}`,
      detail: `${violation.help}. ${violation.description}`,
      severity: impactToSeverity(violation.impact),
      locationSummary: `${violation.nodes.length} node${violation.nodes.length === 1 ? "" : "s"} matched axe rule ${violation.id}`,
      evidence
    } satisfies ScanIssue;
  });
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

export async function augmentSiteResultWithAxeAccessibility(result: SiteScanResult): Promise<SiteScanResult> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  const nextPages = [...result.pages];
  const nextLimitations = [...result.limitationNotes];
  const pageLimit = Math.min(result.pages.length, 1);

  try {
    for (let index = 0; index < pageLimit; index += 1) {
      const pageResult = nextPages[index];
      const context = await browser.newContext({
        viewport: { width: 1366, height: 900 },
        ignoreHTTPSErrors: true
      });

      try {
        const page = await context.newPage();
        await page.goto(pageResult.normalizedUrl, { waitUntil: "domcontentloaded", timeout: 20000 });

        const axeResults = await new AxeBuilder({ page }).analyze();
        const axeIssues = buildAxeIssues(pageResult.normalizedUrl, axeResults.violations);

        if (axeIssues.length > 0) {
          nextPages[index] = {
            ...pageResult,
            issues: [...pageResult.issues, ...axeIssues]
          };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown axe accessibility error.";
        nextLimitations.push(`Axe accessibility checks could not run for ${pageResult.normalizedUrl}: ${message}`);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  nextLimitations.push(
    `Desktop axe accessibility checks sampled ${pageLimit} page${pageLimit === 1 ? "" : "s"} using axe-core in a Playwright browser context.`
  );

  return rebuildSite(
    {
      ...result,
      pages: nextPages
    },
    nextLimitations
  );
}