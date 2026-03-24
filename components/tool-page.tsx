import Link from "next/link";

import { ScannerForm } from "@/components/scanner-form";
import { toolConfig, toolOrder, type ToolType } from "@/lib/scanner-config";

const toolPageSections: Record<
  ToolType,
  {
    scopeTitle: string;
    scopeCopy: string;
    scopePoints: string[];
    nextStepTitle: string;
    nextStepCopy: string;
  }
> = {
  accessibility: {
    scopeTitle: "Fast signals for visible WCAG issues",
    scopeCopy:
      "This hosted scanner focuses on what can be detected quickly from a single public page: document language, image alt coverage, basic form labeling, and similar machine-detectable issues.",
    scopePoints: [
      "Single public URL scan",
      "Useful before launch, proposal reviews, or remediation triage",
      "No keyboard-flow, screen-reader, or contrast auditing in this hosted pass"
    ],
    nextStepTitle: "How to use the result",
    nextStepCopy:
      "If the scanner flags issues, use the output to identify the template, component, or form pattern behind them. That gives you a concrete starting point for a fuller accessibility review."
  },
  privacy: {
    scopeTitle: "Public privacy signals, not legal theater",
    scopeCopy:
      "The privacy checker is designed to catch obvious public-page gaps around policy visibility, cookie wording, tracking signals, and baseline security-header presence.",
    scopePoints: [
      "Focused on public GDPR-facing website signals",
      "Useful for quick prospect reviews and pre-launch checks",
      "Does not inspect consent platform logic, data storage, or back-office practices"
    ],
    nextStepTitle: "How to use the result",
    nextStepCopy:
      "Use the findings to review your cookie messaging, privacy-link visibility, and tracking setup. For anything high-risk, follow with a manual legal and implementation review."
  }
};

export function ToolPage({ tool }: { tool: ToolType }) {
  const config = toolConfig[tool];
  const section = toolPageSections[tool];

  return (
    <>
      <section className="tool-page-hero">
        <div className="container split-grid tool-hero-grid">
          <div>
            <p className="eyebrow">{config.eyebrow}</p>
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
          <aside className="section-panel">
            <p className="kicker">Best For</p>
            <h2>{section.scopeTitle}</h2>
            <ul className="bullet-list">
              {config.bestFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
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
            <p className="kicker">Scope</p>
            <h2>{section.scopeTitle}</h2>
            <p className="section-copy">{section.scopeCopy}</p>
            <ul className="bullet-list">
              {section.scopePoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="section-panel">
            <p className="kicker">Next Step</p>
            <h2>{section.nextStepTitle}</h2>
            <p className="section-copy">{section.nextStepCopy}</p>
            <ul className="bullet-list">
              {config.resultGuidance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section className="page-section">
        <div className="container section-panel">
          <p className="kicker">Other Free Tools</p>
          <h2>Keep the first pass focused</h2>
          <p className="section-copy">
            Olite is leading with two free public-page checks so the product stays concrete: accessibility
            signals and privacy standards. Broader monitoring and local-first workflows can expand later.
          </p>
          <div className="tool-link-row">
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