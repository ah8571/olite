import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

import type { ScanIssueEvidence, ScanSeverity } from "./types";

export function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function truncateText(value: string, maxLength = 180): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1).trimEnd()}...` : value;
}

function escapeSelectorValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function isTagNode(node: AnyNode | null): node is AnyNode & { tagName: string } {
  return Boolean(node && "tagName" in node && typeof node.tagName === "string");
}

export function getNodeSelector($: cheerio.CheerioAPI, element: AnyNode): string {
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

export function getElementSnippet($: cheerio.CheerioAPI, element: AnyNode): string {
  return truncateText(normalizeText($.html(element) ?? ""), 220);
}

export function buildElementEvidence(
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

export function getAccessibleName($: cheerio.CheerioAPI, element: AnyNode): string {
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

export function hasLabelSignal($: cheerio.CheerioAPI, element: AnyNode): boolean {
  const node = $(element);
  const id = normalizeText(node.attr("id"));
  const ariaLabel = normalizeText(node.attr("aria-label"));
  const ariaLabelledBy = normalizeText(node.attr("aria-labelledby"));
  const wrappedByLabel = node.closest("label").length > 0;
  const linkedLabel = id ? $(`label[for="${id.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"]`).length > 0 : false;

  return Boolean(wrappedByLabel || linkedLabel || ariaLabel || ariaLabelledBy);
}

export function normalizeUrl(rawUrl: string): URL {
  const value = rawUrl.trim();
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const url = new URL(withProtocol);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }

  return url;
}

export function normalizeLink(baseUrl: URL, href: string): string | null {
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

export function isPolicyLinkCandidate($: cheerio.CheerioAPI, baseUrl: URL, element: AnyNode): boolean {
  const node = $(element);
  const href = normalizeText(node.attr("href"));
  const resolvedHref = href ? normalizeLink(baseUrl, href) : null;
  const accessibleName = getAccessibleName($, element);
  const combinedSignal = normalizeText(
    [
      accessibleName,
      node.text(),
      node.attr("title"),
      node.attr("aria-label"),
      href,
      resolvedHref ? new URL(resolvedHref).pathname : ""
    ]
      .filter(Boolean)
      .join(" ")
  );

  return /(privacy|privacy policy|cookie|cookie policy|data protection|data privacy|terms|terms of service|terms of use|legal|gdpr|ccpa)/i.test(
    combinedSignal
  );
}

export function isCookiePolicyLinkCandidate($: cheerio.CheerioAPI, baseUrl: URL, element: AnyNode): boolean {
  const node = $(element);
  const href = normalizeText(node.attr("href"));
  const resolvedHref = href ? normalizeLink(baseUrl, href) : null;
  const accessibleName = getAccessibleName($, element);
  const combinedSignal = normalizeText(
    [
      accessibleName,
      node.text(),
      node.attr("title"),
      node.attr("aria-label"),
      href,
      resolvedHref ? new URL(resolvedHref).pathname : ""
    ]
      .filter(Boolean)
      .join(" ")
  );

  return /(cookie policy|cookie notice|cookie statement|use of cookies|cookies)/i.test(combinedSignal);
}

export function isPrivacyRightsCandidate($: cheerio.CheerioAPI, baseUrl: URL, element: AnyNode): boolean {
  const node = $(element);
  const href = normalizeText(node.attr("href"));
  const resolvedHref = href ? normalizeLink(baseUrl, href) : null;
  const accessibleName = getAccessibleName($, element);
  const combinedSignal = normalizeText(
    [
      accessibleName,
      node.text(),
      node.attr("title"),
      node.attr("aria-label"),
      href,
      resolvedHref ? new URL(resolvedHref).pathname : ""
    ]
      .filter(Boolean)
      .join(" ")
  );

  return /(privacy request|privacy rights|consumer rights|data request|delete my data|data deletion|deletion request|access request|correction request|your privacy choices|opt out|do not sell|do not share)/i.test(
    combinedSignal
  );
}

export function isDoNotSellCandidate($: cheerio.CheerioAPI, baseUrl: URL, element: AnyNode): boolean {
  const node = $(element);
  const href = normalizeText(node.attr("href"));
  const resolvedHref = href ? normalizeLink(baseUrl, href) : null;
  const accessibleName = getAccessibleName($, element);
  const combinedSignal = normalizeText(
    [
      accessibleName,
      node.text(),
      node.attr("title"),
      node.attr("aria-label"),
      href,
      resolvedHref ? new URL(resolvedHref).pathname : ""
    ]
      .filter(Boolean)
      .join(" ")
  );

  return /(do not sell|do not share|do not sell or share|your privacy choices|opt out of sale|opt out of sharing)/i.test(
    combinedSignal
  );
}

export function clampScore(score: number): number {
  return Math.max(1, Math.min(100, Math.round(score)));
}

export function scoreFromIssues(issues: Array<{ severity: ScanSeverity }>): number {
  let score = 100;

  for (const issue of issues) {
    score -= issue.severity === "high" ? 16 : issue.severity === "medium" ? 10 : 5;
  }

  return clampScore(score);
}