import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { augmentSiteResultWithRuntimePrivacyAudit } from "../desktop/src/runtime-privacy-audit";
import type { PageScanResult, SiteScanResult } from "../lib/scanner-core";

function buildPage(url: string, privacyRegion: "eu" | "us" = "eu"): PageScanResult {
  return {
    url,
    normalizedUrl: url,
    title: "Fixture privacy page",
    score: 100,
    summary: "Fixture privacy summary",
    issues: [],
    limitationNotes: [],
    metadata: {
      privacyRegion,
      htmlLangPresent: true,
      imageCount: 0,
      formCount: 0,
      emailFieldCount: 0,
      checkboxCount: 0,
      placeholderOnlyFieldCount: 0,
      policyLinkCount: 1,
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

function buildSite(url: string, privacyRegion: "eu" | "us" = "eu"): SiteScanResult {
  const page = buildPage(url, privacyRegion);

  return {
    startUrl: url,
    normalizedUrl: url,
    score: 100,
    summary: "Fixture privacy site",
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

function pageTemplate(nextPath: string, routeMode: "honor" | "ignore") {
  return `<!doctype html>
    <html lang="en">
      <body>
        <button id="reject-all">Reject all</button>
        <a href="${nextPath}">Next route</a>
        <script>
          document.getElementById('reject-all').addEventListener('click', () => {
            document.cookie = 'consent=reject; path=/';
          });

          const consentRejected = document.cookie.includes('consent=reject');
          const shouldTrack = ${routeMode === "ignore" ? "true" : "!consentRejected"};

          if (shouldTrack) {
            fetch('/googletagmanager.com/collect?v=1', { mode: 'no-cors' }).catch(() => {});
          }
        </script>
      </body>
    </html>`;
}

function gpcTemplate(mode: "honor" | "ignore") {
  return `<!doctype html>
    <html lang="en">
      <body>
        <p>GPC test page</p>
        <script>
          const gpcSignalDetected = ${mode === "honor" ? "navigator.globalPrivacyControl === true" : "false"};
          const shouldTrack = !gpcSignalDetected;

          if (shouldTrack) {
            fetch('/googletagmanager.com/collect?v=1', { mode: 'no-cors' }).catch(() => {});
          }
        </script>
      </body>
    </html>`;
}

function handleFixtureRequest(request: IncomingMessage, response: ServerResponse) {
  const path = request.url ?? "/";

  if (path === "/honor") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(pageTemplate("/honor-next", "honor"));
    return;
  }

  if (path === "/honor-next") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(pageTemplate("/honor-last", "honor"));
    return;
  }

  if (path === "/honor-last") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end("<html lang=\"en\"><body><p>Done</p></body></html>");
    return;
  }

  if (path === "/ignore") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(pageTemplate("/ignore-next", "ignore"));
    return;
  }

  if (path === "/ignore-next") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(pageTemplate("/ignore-last", "ignore"));
    return;
  }

  if (path === "/ignore-last") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end("<html lang=\"en\"><body><p>Done</p></body></html>");
    return;
  }

  if (path.startsWith("/googletagmanager.com/collect")) {
    response.writeHead(204);
    response.end();
    return;
  }

  if (path === "/gpc-honor") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(gpcTemplate("honor"));
    return;
  }

  if (path === "/gpc-ignore") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(gpcTemplate("ignore"));
    return;
  }

  response.writeHead(404, { "content-type": "text/plain" });
  response.end("Not found");
}

describe("augmentSiteResultWithRuntimePrivacyAudit", () => {
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

  it("follows same-origin routes and sees consent honored across pages", async () => {
    const result = await augmentSiteResultWithRuntimePrivacyAudit(buildSite(`${baseUrl}/honor`));
    const runtimeAudit = result.pages[0].metadata.runtimeAudit;

    expect(runtimeAudit).toBeDefined();
    expect(runtimeAudit?.interactionAttempted).toBe("reject");
    expect(runtimeAudit?.sampledUrls.length).toBeGreaterThan(1);
    expect(runtimeAudit?.postInteractionTrackerRequestCount).toBe(0);
  }, 15000);

  it("follows same-origin routes and flags trackers that persist after reject", async () => {
    const result = await augmentSiteResultWithRuntimePrivacyAudit(buildSite(`${baseUrl}/ignore`));
    const runtimeAudit = result.pages[0].metadata.runtimeAudit;
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(runtimeAudit).toBeDefined();
    expect(runtimeAudit?.interactionAttempted).toBe("reject");
    expect(runtimeAudit?.sampledUrls.length).toBeGreaterThan(1);
    expect(runtimeAudit?.postInteractionTrackerRequestCount).toBeGreaterThan(0);
    expect(titles).toContain("Tracking requests still observed after reject interaction");
  }, 15000);

  it("compares tracker behavior with and without GPC when the site honors the signal", async () => {
    const result = await augmentSiteResultWithRuntimePrivacyAudit(buildSite(`${baseUrl}/gpc-honor`, "us"));
    const runtimeAudit = result.pages[0].metadata.runtimeAudit;
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(runtimeAudit?.gpcComparison?.simulated).toBe(true);
    expect(runtimeAudit?.gpcComparison?.behaviorChanged).toBe(true);
    expect(runtimeAudit?.gpcComparison?.gpcTrackerRequestCount).toBeLessThan(runtimeAudit?.gpcComparison?.baselineTrackerRequestCount ?? 0);
    expect(titles).not.toContain("Tracking behavior did not change when GPC was simulated");
  }, 15000);

  it("flags unchanged tracker behavior when the site ignores GPC", async () => {
    const result = await augmentSiteResultWithRuntimePrivacyAudit(buildSite(`${baseUrl}/gpc-ignore`, "us"));
    const runtimeAudit = result.pages[0].metadata.runtimeAudit;
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(runtimeAudit?.gpcComparison?.simulated).toBe(true);
    expect(runtimeAudit?.gpcComparison?.behaviorChanged).toBe(false);
    expect(titles).toContain("Tracking behavior did not change when GPC was simulated");
  }, 15000);
});