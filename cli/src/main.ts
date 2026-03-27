import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import { scanPublicSite } from "../../lib/scanner-core";

type CliOptions = {
  url?: string;
  sitemapUrl?: string;
  maxPages: number;
  outputPath?: string;
  sameOriginOnly: boolean;
  showHelp: boolean;
};

function printHelp() {
  process.stdout.write(`Olite CLI\n\nUsage:\n  npm run cli:start -- --url https://example.com [options]\n\nOptions:\n  --url <value>           Start URL to scan\n  --sitemap <value>       Optional sitemap URL to seed the crawl\n  --max-pages <number>    Maximum pages to scan (default: 10)\n  --output <path>         Write the full JSON report to disk\n  --allow-cross-origin    Allow cross-origin discovery during the crawl\n  --help                  Show this help\n`);
}

function requireValue(flag: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing value for ${flag}.`);
  }

  return value;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    maxPages: 10,
    sameOriginOnly: true,
    showHelp: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (!value) {
      continue;
    }

    if (!value.startsWith("--") && !options.url) {
      options.url = value;
      continue;
    }

    switch (value) {
      case "--url":
        options.url = requireValue(value, argv[index + 1]);
        index += 1;
        break;
      case "--sitemap":
        options.sitemapUrl = requireValue(value, argv[index + 1]);
        index += 1;
        break;
      case "--max-pages": {
        const rawValue = requireValue(value, argv[index + 1]);
        const parsedValue = Number(rawValue);

        if (!Number.isFinite(parsedValue) || parsedValue < 1) {
          throw new Error("--max-pages must be a number greater than 0.");
        }

        options.maxPages = Math.floor(parsedValue);
        index += 1;
        break;
      }
      case "--output":
        options.outputPath = requireValue(value, argv[index + 1]);
        index += 1;
        break;
      case "--allow-cross-origin":
        options.sameOriginOnly = false;
        break;
      case "--help":
        options.showHelp = true;
        break;
      default:
        throw new Error(`Unknown flag: ${value}`);
    }
  }

  return options;
}

async function writeReport(outputPath: string, report: unknown) {
  const resolvedPath = path.resolve(outputPath);
  await mkdir(path.dirname(resolvedPath), { recursive: true });
  await writeFile(resolvedPath, JSON.stringify(report, null, 2), "utf8");
  return resolvedPath;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.showHelp || !options.url) {
    printHelp();
    process.exit(options.url ? 0 : 1);
    return;
  }

  const report = await scanPublicSite({
    startUrl: options.url,
    sitemapUrl: options.sitemapUrl,
    maxPages: options.maxPages,
    sameOriginOnly: options.sameOriginOnly
  });

  process.stdout.write(`${report.summary}\n`);
  process.stdout.write(`Score: ${report.score}/100\n`);
  process.stdout.write(`Scanned pages: ${report.scannedPages}\n`);
  process.stdout.write(`Discovered pages: ${report.discoveredPages}\n`);
  process.stdout.write(
    `Issues by layer: accessibility ${report.issuesByLayer.accessibility.length}, privacy ${report.issuesByLayer.privacy.length}, consent ${report.issuesByLayer.consent.length}, security ${report.issuesByLayer.security.length}\n`
  );

  if (options.outputPath) {
    const resolvedPath = await writeReport(options.outputPath, report);
    process.stdout.write(`Saved report to ${resolvedPath}\n`);
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unexpected CLI failure.";
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
