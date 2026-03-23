import Link from "next/link";

import { ScannerForm } from "@/components/scanner-form";
import { toolConfig, toolOrder, type ToolType } from "@/lib/scanner-config";

export function ToolPage({ tool }: { tool: ToolType }) {
  const config = toolConfig[tool];

  return (
    <>
      <section className="tool-page-hero">
        <div className="container">
          <p className="eyebrow">Free Tool</p>
          <h1 className="tool-title">{config.title}</h1>
          <p className="tool-copy">{config.description}</p>
          <div className="badge-row">
            {config.sampleChecks.map((item) => (
              <span className="badge" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="page-section">
        <div className="container">
          <ScannerForm tool={tool} />
        </div>
      </section>
      <section className="page-section">
        <div className="container split-grid">
          <div className="section-panel">
            <p className="kicker">Hosted Free Tool</p>
            <h2>Built for fast public-page checks</h2>
            <p className="section-copy">
              These hosted tools are intentionally lightweight so the frontend can live cheaply on Vercel while
              the heavier local scanner and CLI evolve separately.
            </p>
            <ul className="bullet-list">
              <li>Single public-page scan only</li>
              <li>No authenticated crawling</li>
              <li>No source-code-aware analysis</li>
              <li>Best used as a quick top-of-funnel audit</li>
            </ul>
          </div>
          <div className="section-panel">
            <p className="kicker">Other Free Tools</p>
            <h2>Explore adjacent checks</h2>
            <ul className="mini-list">
              {toolOrder
                .filter((value) => value !== tool)
                .map((value) => (
                  <li key={value}>
                    <Link href={`/tools/${toolConfig[value].slug}`}>{toolConfig[value].title}</Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}