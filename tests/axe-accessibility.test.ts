import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { augmentSiteResultWithAxeAccessibility } from "../desktop/src/axe-accessibility";
import type { PageScanResult, SiteScanResult } from "../lib/scanner-core";

function buildPage(url: string): PageScanResult {
  return {
    url,
    normalizedUrl: url,
    title: "Fixture axe page",
    score: 100,
    summary: "Fixture axe summary",
    issues: [],
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
}

function buildSite(url: string): SiteScanResult {
  const page = buildPage(url);

  return {
    startUrl: url,
    normalizedUrl: url,
    score: 100,
    summary: "Fixture axe site",
    scannedPages: 1,
    discoveredPages: 1,
    pageLimit: 1,
    pages: [page],
    issuesByLayer: {
      accessibility: [],
      privacy: [],
      consent: [],
      security: []
    },
    limitationNotes: []
  };
}

function handleFixtureRequest(request: IncomingMessage, response: ServerResponse) {
  const path = request.url ?? "/";

  if (path === "/violations") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <body>
          <main>
            <img src="hero.jpg">
            <button aria-label=""></button>
          </main>
        </body>
      </html>`);
    return;
  }

  if (path === "/healthy") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <head>
          <title>Healthy axe fixture</title>
        </head>
        <body>
          <main>
            <h1>Healthy fixture</h1>
            <img src="hero.jpg" alt="Decorative hero image">
            <button>Open details</button>
          </main>
        </body>
      </html>`);
    return;
  }

  response.writeHead(404, { "content-type": "text/plain" });
  response.end("Not found");
}

describe("augmentSiteResultWithAxeAccessibility", () => {
  let server: ReturnType<typeof createServer>;
  let baseUrl = "";

  beforeAll(async () => {
    server = createServer(handleFixtureRequest);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  });

  it("adds axe rule violations to the normalized issue model", async () => {
    const result = await augmentSiteResultWithAxeAccessibility(buildSite(`${baseUrl}/violations`));
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(titles).toContain("Axe rule violation: image-alt");
    expect(result.limitationNotes.some((note) => note.includes("Desktop axe accessibility checks sampled 1 page"))).toBe(true);
  }, 15000);

  it("keeps a healthy page free of axe violations", async () => {
    const result = await augmentSiteResultWithAxeAccessibility(buildSite(`${baseUrl}/healthy`));
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(titles.filter((title) => title.startsWith("Axe rule violation:"))).toHaveLength(0);
  }, 15000);
});