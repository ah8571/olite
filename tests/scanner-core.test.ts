import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { scanSinglePage } from "../lib/scanner-core";

function handleFixtureRequest(request: IncomingMessage, response: ServerResponse) {
  const path = request.url ?? "/";

  if (path === "/interaction-gaps") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <head>
          <title>Interaction gaps</title>
        </head>
        <body>
          <main>
            <article>
              <h2>Article one</h2>
              <a href="/article-one">Read more</a>
            </article>
            <article>
              <h2>Article two</h2>
              <a href="/article-two">Read more</a>
            </article>
            <div onclick="window.location='/checkout'">Checkout now</div>
          </main>
        </body>
      </html>`);
    return;
  }

  if (path === "/interaction-healthy") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <head>
          <title>Healthy interactions</title>
        </head>
        <body>
          <main>
            <article>
              <h2>Article one</h2>
              <a href="/article-one">Read more about pricing</a>
            </article>
            <article>
              <h2>Article two</h2>
              <a href="/article-two">Read more about accessibility</a>
            </article>
            <div role="button" tabindex="0" onclick="window.location='/checkout'" onkeydown="if (event.key === 'Enter') window.location='/checkout'">
              Checkout now
            </div>
          </main>
        </body>
      </html>`);
    return;
  }

  if (path === "/structure-gaps") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <head>
          <title>Structural gaps</title>
        </head>
        <body>
          <header>Primary header</header>
          <header>Secondary header</header>
          <main>
            <table>
              <tr><td>Plan</td><td>Price</td></tr>
              <tr><td>Starter</td><td>$19</td></tr>
            </table>
            <ul>
              <div>Broken child</div>
              <li>Real item</li>
            </ul>
          </main>
          <footer>Footer one</footer>
          <footer>Footer two</footer>
        </body>
      </html>`);
    return;
  }

  if (path === "/structure-healthy") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <head>
          <title>Structural healthy</title>
        </head>
        <body>
          <header>Primary header</header>
          <main>
            <table>
              <thead>
                <tr><th scope="col">Plan</th><th scope="col">Price</th></tr>
              </thead>
              <tbody>
                <tr><td>Starter</td><td>$19</td></tr>
              </tbody>
            </table>
            <ul>
              <li>First item</li>
              <li>Second item</li>
            </ul>
          </main>
          <footer>Footer one</footer>
        </body>
      </html>`);
    return;
  }

  if (path === "/cookie-audit-gaps") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <head>
          <title>Cookie audit gaps</title>
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-TEST"></script>
        </head>
        <body>
          <header>
            <a href="/privacy-policy">Privacy Policy</a>
          </header>
          <main>
            <section>
              <p>This website uses cookies to improve your experience.</p>
              <button>Accept all</button>
            </section>
          </main>
        </body>
      </html>`);
    return;
  }

  if (path === "/cookie-audit-healthy") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <head>
          <title>Cookie audit healthy</title>
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-TEST"></script>
        </head>
        <body>
          <header>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/cookie-policy">Cookie Policy</a>
            <a href="/cookie-settings">Cookie Settings</a>
          </header>
          <main>
            <section>
              <p>This website uses cookies to improve your experience.</p>
              <button>Accept all</button>
              <button>Reject all</button>
              <button>Manage preferences</button>
            </section>
          </main>
        </body>
      </html>`);
    return;
  }

  if (path === "/cookie-audit-link-only") {
    response.writeHead(200, { "content-type": "text/html" });
    response.end(`<!doctype html>
      <html lang="en">
        <head>
          <title>Cookie audit link only</title>
        </head>
        <body>
          <footer>
            <a href="/blog/cookie-audit">Cookie Audit Tool</a>
          </footer>
          <main>
            <p>No cookie banner is shown on this page.</p>
          </main>
        </body>
      </html>`);
    return;
  }

  response.writeHead(200, { "content-type": "text/html" });
  response.end(`<!doctype html><html lang="en"><head><title>Fallback</title></head><body><main>ok</main></body></html>`);
}

describe("scanSinglePage interaction heuristics", () => {
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

  it("flags repeated vague link text across different destinations", async () => {
    const result = await scanSinglePage(`${baseUrl}/interaction-gaps`, "local", "eu");
    const titles = result.issues.map((issue) => issue.title);

    expect(titles).toContain("Repeated vague link text may not describe destinations");
  });

  it("flags non-interactive elements that act like controls without keyboard support", async () => {
    const result = await scanSinglePage(`${baseUrl}/interaction-gaps`, "local", "eu");
    const titles = result.issues.map((issue) => issue.title);

    expect(titles).toContain("Non-interactive elements appear to act like controls");
  });

  it("keeps descriptive links and keyboard-capable custom controls free of those new issues", async () => {
    const result = await scanSinglePage(`${baseUrl}/interaction-healthy`, "local", "eu");
    const titles = result.issues.map((issue) => issue.title);

    expect(titles).not.toContain("Repeated vague link text may not describe destinations");
    expect(titles).not.toContain("Non-interactive elements appear to act like controls");
  });
});

describe("scanSinglePage structural semantics heuristics", () => {
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

  it("flags data tables that appear to be missing headers", async () => {
    const result = await scanSinglePage(`${baseUrl}/structure-gaps`, "local", "eu");
    const titles = result.issues.map((issue) => issue.title);

    expect(titles).toContain("Tables may be missing clear headers");
  });

  it("flags malformed list structures and duplicated landmark regions", async () => {
    const result = await scanSinglePage(`${baseUrl}/structure-gaps`, "local", "eu");
    const titles = result.issues.map((issue) => issue.title);

    expect(titles).toContain("Malformed list structure detected");
    expect(titles).toContain("Duplicate landmark structure detected");
  });

  it("keeps healthy structural semantics free of those new issues", async () => {
    const result = await scanSinglePage(`${baseUrl}/structure-healthy`, "local", "eu");
    const titles = result.issues.map((issue) => issue.title);

    expect(titles).not.toContain("Tables may be missing clear headers");
    expect(titles).not.toContain("Malformed list structure detected");
    expect(titles).not.toContain("Duplicate landmark structure detected");
  });
});

describe("scanSinglePage privacy cookie heuristics", () => {
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

  it("flags cookie-audit gaps when tracking is present but cookie policy and controls are weak", async () => {
    const result = await scanSinglePage(`${baseUrl}/cookie-audit-gaps`, "local", "eu");
    const titles = result.issues.map((issue) => issue.title);

    expect(result.metadata.cookieBannerSignalPresent).toBe(true);
    expect(result.metadata.cookiePolicyLinkCount).toBe(0);
    expect(result.metadata.cookieRejectControlPresent).toBe(false);
    expect(result.metadata.cookieManageControlPresent).toBe(false);
    expect(result.metadata.cookieReopenControlPresent).toBe(false);
    expect(titles).toContain("No obvious cookie policy link detected");
    expect(titles).toContain("No obvious cookie settings or withdrawal path detected");
    expect(titles).toContain("Cookie banner without obvious reject or manage controls");
  });

  it("keeps stronger cookie-policy and control patterns free of those cookie-audit issues", async () => {
    const result = await scanSinglePage(`${baseUrl}/cookie-audit-healthy`, "local", "eu");
    const titles = result.issues.map((issue) => issue.title);

    expect(result.metadata.cookieBannerSignalPresent).toBe(true);
    expect(result.metadata.cookiePolicyLinkCount).toBeGreaterThan(0);
    expect(result.metadata.cookieRejectControlPresent).toBe(true);
    expect(result.metadata.cookieManageControlPresent).toBe(true);
    expect(result.metadata.cookieReopenControlPresent).toBe(true);
    expect(titles).not.toContain("No obvious cookie policy link detected");
    expect(titles).not.toContain("No obvious cookie settings or withdrawal path detected");
    expect(titles).not.toContain("Cookie banner without obvious reject or manage controls");
  });

  it("does not treat a cookie-related navigation link as an accept control in hosted metadata", async () => {
    const result = await scanSinglePage(`${baseUrl}/cookie-audit-link-only`, "local", "eu");

    expect(result.metadata.cookieAcceptControlPresent).toBe(false);
    expect(result.metadata.cookieRejectControlPresent).toBe(false);
    expect(result.metadata.cookieManageControlPresent).toBe(false);
    expect(result.metadata.cookieReopenControlPresent).toBe(false);
  });
});
