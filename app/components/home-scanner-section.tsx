"use client";

import { useState } from "react";

import { ScannerForm } from "@/components/scanner-form";
import { toolConfig, toolOrder, type ToolType } from "@/lib/scanner-config";

export function HomeScannerSection() {
  const [tool, setTool] = useState<ToolType>("accessibility");
  const activeConfig = toolConfig[tool];

  return (
    <section className="page-section" id="scanner">
      <div className="container">
        <div className="scanner-home-head">
          <div>
            <p className="kicker">Try It Here</p>
            <h2 className="section-title">Run two free scans per day right on the homepage.</h2>
            <p className="section-copy">
              Start with a quick hosted pass for accessibility or privacy. If the workflow proves useful,
              move into the desktop app for broader local scans, repeatable checks, and exports.
            </p>
          </div>
          <div className="scanner-mode-row" role="tablist" aria-label="Scanner mode">
            {toolOrder.map((value) => {
              const isActive = value === tool;

              return (
                <button
                  key={value}
                  className={`scanner-mode-button${isActive ? " is-active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTool(value)}
                >
                  <span className="scanner-mode-label">{activeConfig.title === toolConfig[value].title ? toolConfig[value].title : toolConfig[value].title}</span>
                  <span className="scanner-mode-copy">{toolConfig[value].sampleChecks[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
        <ScannerForm tool={tool} />
      </div>
    </section>
  );
}