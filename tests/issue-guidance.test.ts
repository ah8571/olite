import { describe, expect, it } from "vitest";

import {
  applyIssueGuidanceToHostedToolResult,
  applyIssueGuidanceToSiteResult,
  getIssueClassification,
  getIssueSuggestedFix
} from "../lib/issue-guidance";
import type { HostedToolScanResult, SiteScanResult } from "../lib/scan/types";

describe("issue guidance", () => {
  it("returns concrete suggested fixes for new assistive-technology approximation findings", () => {
    expect(getIssueSuggestedFix("accessibility", "Dialog interaction may not move and return focus predictably")).toContain(
      "move focus into"
    );
    expect(getIssueSuggestedFix("accessibility", "Validation feedback may not be announced clearly after interaction")).toContain(
      "aria-live"
    );
  });

  it("classifies assistive-technology approximation findings for export consumers", () => {
    expect(getIssueClassification("accessibility", "Dialog interaction may not move and return focus predictably")).toMatchObject({
      issueFamily: "interactive-pattern",
      verificationMethod: "interaction-flow",
      confidenceLevel: "medium",
      manualReviewRecommended: true
    });

    expect(getIssueClassification("privacy", "Tracking requests fired before consent interaction")).toMatchObject({
      issueFamily: "consent-runtime",
      verificationMethod: "network-runtime"
    });
  });

  it("enriches site results with suggested fixes and refreshes layer grouping", () => {
    const result: SiteScanResult = {
      startUrl: "https://example.com",
      normalizedUrl: "https://example.com/",
      score: 88,
      summary: "Fixture summary",
      scannedPages: 1,
      discoveredPages: 1,
      pageLimit: 1,
      pages: [
        {
          url: "https://example.com",
          normalizedUrl: "https://example.com/",
          title: "Fixture page",
          score: 88,
          summary: "Fixture page summary",
          limitationNotes: [],
          metadata: {
            privacyRegion: "eu",
            htmlLangPresent: true,
            imageCount: 0,
            formCount: 0,
            emailFieldCount: 0,
            checkboxCount: 0,
            placeholderOnlyFieldCount: 0,
            policyLinkCount: 0,
            privacyRightsLinkCount: 0,
            doNotSellLinkCount: 0,
            accessRequestSignalPresent: false,
            correctionRequestSignalPresent: false,
            deletionRequestSignalPresent: false,
            gpcSignalPresent: false,
            trackingSignals: [],
            securityHeadersPresent: [],
            h1Count: 1,
            headingCount: 1,
            mainLandmarkCount: 1,
            skipLinkCount: 0,
            positiveTabindexCount: 0,
            insecureFormActionCount: 0
          },
          issues: [
            {
              layer: "accessibility",
              pageUrl: "https://example.com/",
              title: "Critical controls may lack accessible names after render",
              detail: "Fixture detail",
              severity: "medium"
            }
          ]
        }
      ],
      issuesByLayer: {
        accessibility: [],
        privacy: [],
        consent: [],
        security: []
      },
      limitationNotes: []
    };

    const enriched = applyIssueGuidanceToSiteResult(result);
    expect(enriched.pages[0].issues[0].suggestedFix).toContain("programmatically named");
    expect(enriched.pages[0].issues[0].issueFamily).toBe("post-hydration-accessibility");
    expect(enriched.pages[0].issues[0].verificationMethod).toBe("rendered-browser");
    expect(enriched.issuesByLayer.accessibility[0].suggestedFix).toContain("programmatically named");
  });

  it("enriches hosted tool results with suggested fixes", () => {
    const result: HostedToolScanResult = {
      tool: "accessibility",
      url: "https://example.com",
      normalizedUrl: "https://example.com/",
      title: "Fixture page",
      score: 90,
      summary: "Fixture summary",
      issues: [
        {
          layer: "accessibility",
          title: "Missing page title",
          detail: "Fixture detail",
          severity: "medium"
        }
      ],
      limitationNotes: [],
      metadata: {
        privacyRegion: "eu",
        htmlLangPresent: true,
        imageCount: 0,
        formCount: 0,
        emailFieldCount: 0,
        checkboxCount: 0,
        placeholderOnlyFieldCount: 0,
        policyLinkCount: 0,
        privacyRightsLinkCount: 0,
        doNotSellLinkCount: 0,
        accessRequestSignalPresent: false,
        correctionRequestSignalPresent: false,
        deletionRequestSignalPresent: false,
        gpcSignalPresent: false,
        trackingSignals: [],
        securityHeadersPresent: [],
        h1Count: 1,
        headingCount: 1,
        mainLandmarkCount: 1,
        skipLinkCount: 0,
        positiveTabindexCount: 0,
        insecureFormActionCount: 0
      }
    };

    const enriched = applyIssueGuidanceToHostedToolResult(result);
    expect(enriched.issues[0].suggestedFix).toContain("descriptive title element");
  });
});