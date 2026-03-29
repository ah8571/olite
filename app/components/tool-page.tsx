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
      "This hosted scanner focuses on what can be detected quickly from a single public page: document language, image alt coverage, basic form labeling, accessible names, and similar machine-detectable issues.",
    scopePoints: [
      "2 free hosted scans per day",
      "Single public URL scan each time",
      "Useful before launch, proposal reviews, or remediation triage",
      "No keyboard-flow, screen-reader, or contrast auditing in this hosted pass"
    ],
    nextStepTitle: "How to use the result",
    nextStepCopy:
      "If the scanner flags issues, use the output to identify the template, component, or form pattern behind them. Then move into the desktop app when you need broader local scans and more than the hosted daily limit."
  },
  privacy: {
    scopeTitle: "Public privacy signals, not legal theater",
    scopeCopy:
      "The privacy checker is designed to catch obvious public-page gaps around policy visibility, cookie controls, tracking signals, email capture transparency, and baseline security-header presence.",
    scopePoints: [
      "2 free hosted scans per day",
      "Focused on public GDPR-facing website signals",
      "Useful for quick prospect reviews and pre-launch checks",
      "Does not inspect consent platform logic, data storage, or back-office practices"
    ],
    nextStepTitle: "How to use the result",
    nextStepCopy:
      "Use the findings to review your cookie messaging, privacy-link visibility, and tracking setup. Then move into the desktop app when you need broader local scans and more than the hosted daily limit."
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
          <h2>Use the free scans to test the site. Then download the app.</h2>
          <p className="section-copy">
            Olite is leading with two free public-page checks so the product stays concrete: accessibility
            signals and privacy standards. The hosted tools are capped at 2 free scans per day, and the
            desktop app is the path to broader local-first scanning after that.
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