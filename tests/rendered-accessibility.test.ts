import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { augmentSiteResultWithRenderedAccessibility } from "../desktop/src/rendered-accessibility";
import type { PageScanResult, SiteScanResult } from "../lib/scanner-core";

function buildPage(url: string): PageScanResult {
  return {
    url,
    normalizedUrl: url,
    title: "Fixture page",
    score: 100,
    summary: "Fixture summary",
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
    summary: "Fixture site",
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

  if (path === "/broken-skip") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <body>
          <a href="#main-content">Skip to content</a>
          <button>First button</button>
          <a href="/healthy">Healthy route</a>
        </body>
      </html>`);
    return;
  }

  if (path === "/healthy") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <body>
          <a href="#main-content">Skip to content</a>
          <main id="main-content" tabindex="-1">
            <button>Start</button>
            <a href="/next">Next</a>
            <input type="text" aria-label="Name" />
          </main>
        </body>
      </html>`);
    return;
  }

  if (path === "/broken-skip-activation") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <body>
          <a href="#main-content" onclick="event.preventDefault()">Skip to content</a>
          <main id="main-content" tabindex="-1">
            <button>Start</button>
          </main>
        </body>
      </html>`);
    return;
  }

  if (path === "/form-gaps") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <body>
          <main>
            <label for="email">Email address</label>
            <input id="email" type="email" required>

            <fieldset>
              <label><input type="radio" name="contact" value="email"> Email</label>
              <label><input type="radio" name="contact" value="phone"> Phone</label>
            </fieldset>
          </main>
        </body>
      </html>`);
    return;
  }

  if (path === "/form-healthy") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <body>
          <main>
            <label for="name">Full name (required)</label>
            <input id="name" type="text" required aria-describedby="name-help">
            <p id="name-help">This required field is used on your invoice.</p>

            <fieldset>
              <legend>Preferred contact method</legend>
              <label><input type="checkbox" name="contact-email"> Email</label>
              <label><input type="checkbox" name="contact-sms"> SMS</label>
            </fieldset>
          </main>
        </body>
      </html>`);
    return;
  }

  if (path === "/hydration-gap") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <body>
          <a href="#main-content">Skip to content</a>
          <main id="main-content" tabindex="-1">
            <h1>Hydration fixture</h1>
            <button>Start</button>
          </main>
          <script>
            setTimeout(() => {
              document.querySelector('main')?.remove();
            }, 120);
          </script>
        </body>
      </html>`);
    return;
  }

  if (path === "/hydration-healthy") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <body>
          <a href="#main-content">Skip to content</a>
          <main id="main-content" tabindex="-1">
            <h1>Hydration healthy fixture</h1>
            <button>Start</button>
          </main>
          <script>
            setTimeout(() => {
              const heading = document.querySelector('h1');
              if (heading) {
                heading.textContent = 'Hydration healthy fixture updated';
              }
            }, 120);
          </script>
        </body>
      </html>`);
    return;
  }

  if (path === "/keyboard-gaps") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <body>
          <main>
            <a href="/next" style="position:absolute; left:-9999px; top:0;">Hidden step</a>
            <button style="outline:none; box-shadow:none; border:0;">Continue</button>
          </main>
        </body>
      </html>`);
    return;
  }

  if (path === "/keyboard-healthy") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <head>
          <style>
            button:focus-visible,
            a:focus-visible {
              outline: 3px solid #0b57d0;
              outline-offset: 2px;
            }
          </style>
        </head>
        <body>
          <main>
            <a href="/next">Visible next step</a>
            <button>Continue</button>
          </main>
        </body>
      </html>`);
    return;
  }

  if (path === "/at-tree-gap") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <body>
          <main>
            <h1 role="presentation">ARIA tree gap fixture</h1>
            <p>This page looks structured visually, but the heading is stripped from the accessibility tree.</p>
          </main>
        </body>
      </html>`);
    return;
  }

  if (path === "/at-tree-healthy") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <body>
          <main>
            <h1>ARIA tree healthy fixture</h1>
            <p>This page keeps its main landmark and heading exposed in the accessibility tree.</p>
          </main>
        </body>
      </html>`);
    return;
  }

  response.writeHead(404, { "content-type": "text/plain" });
  response.end("Not found");
}

describe("augmentSiteResultWithRenderedAccessibility", () => {
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

  it("flags a rendered skip link whose target is missing", async () => {
    const result = await augmentSiteResultWithRenderedAccessibility(buildSite(`${baseUrl}/broken-skip`));
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(titles).toContain("Rendered skip link target missing");
  });

  it("keeps a healthy page free of skip-target failures", async () => {
    const result = await augmentSiteResultWithRenderedAccessibility(buildSite(`${baseUrl}/healthy`));
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(titles).not.toContain("Rendered skip link target missing");
    expect(result.limitationNotes.some((note) => note.includes("Desktop rendered accessibility checks sampled 1 page"))).toBe(true);
  });

  it("flags a rendered skip link that fails to change focus or route on activation", async () => {
    const result = await augmentSiteResultWithRenderedAccessibility(buildSite(`${baseUrl}/broken-skip-activation`));
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(titles).toContain("Skip link did not change focus or route after activation");
  });

  it("flags rendered required-state and grouped-control structure gaps", async () => {
    const result = await augmentSiteResultWithRenderedAccessibility(buildSite(`${baseUrl}/form-gaps`));
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(titles).toContain("Required form controls may lack a clear required indicator");
    expect(titles).toContain("Grouped form controls missing a clear legend");
  });

  it("keeps healthy rendered form structure free of those new gaps", async () => {
    const result = await augmentSiteResultWithRenderedAccessibility(buildSite(`${baseUrl}/form-healthy`));
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(titles).not.toContain("Required form controls may lack a clear required indicator");
    expect(titles).not.toContain("Grouped form controls missing a clear legend");
  });

  it("flags semantic structure that disappears after hydration", async () => {
    const result = await augmentSiteResultWithRenderedAccessibility(buildSite(`${baseUrl}/hydration-gap`));
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(titles).toContain("Hydration appears to remove key semantic structure");
  });

  it("does not flag hydration when semantics remain intact", async () => {
    const result = await augmentSiteResultWithRenderedAccessibility(buildSite(`${baseUrl}/hydration-healthy`));
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(titles).not.toContain("Hydration appears to remove key semantic structure");
  });

  it("flags offscreen keyboard targets and weak visible focus cues", async () => {
    const result = await augmentSiteResultWithRenderedAccessibility(buildSite(`${baseUrl}/keyboard-gaps`));
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(titles).toContain("Keyboard focus reached an offscreen or non-visible target");
    expect(titles).toContain("Focused controls may lack a clear visible focus indicator");
  });

  it("keeps healthy keyboard-flow fixtures free of those new focus issues", async () => {
    const result = await augmentSiteResultWithRenderedAccessibility(buildSite(`${baseUrl}/keyboard-healthy`));
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(titles).not.toContain("Keyboard focus reached an offscreen or non-visible target");
    expect(titles).not.toContain("Focused controls may lack a clear visible focus indicator");
  });

  it("flags primary structure that drops out of the accessibility tree", async () => {
    const result = await augmentSiteResultWithRenderedAccessibility(buildSite(`${baseUrl}/at-tree-gap`));
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(titles).toContain("Accessibility tree may not expose the primary page structure");
  });

  it("keeps healthy accessibility-tree structure free of that approximation gap", async () => {
    const result = await augmentSiteResultWithRenderedAccessibility(buildSite(`${baseUrl}/at-tree-healthy`));
    const titles = result.pages[0].issues.map((issue) => issue.title);

    expect(titles).not.toContain("Accessibility tree may not expose the primary page structure");
  });
});