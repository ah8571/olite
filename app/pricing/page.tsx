import Link from "next/link";
import type { Metadata } from "next";

import { getCommerceConfig } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Pricing for Olite's free accessibility scanner, free privacy checker, and planned deeper local-first workflows."
};

type PricingPlan = {
  name: string;
  label: string;
  price: string;
  note: string;
  features: string[];
  href: string;
  cta: string;
  featured?: boolean;
};

export default function PricingPage() {
  const commerce = getCommerceConfig();
  const plans: PricingPlan[] = [
    {
      name: "Free",
      label: "Live now",
      price: "$0",
      note: "Best for quick first-pass checks",
      features: [
        "Free accessibility scanner for one public page at a time",
        "Free privacy checker for one public page at a time",
        "Instant, lightweight results for obvious public-page signals",
        "No setup required"
      ],
      href: "/tools/accessibility",
      cta: "Start free"
    },
    {
      name: "Pro Monthly",
      label: commerce.monthlyCheckoutUrl ? "Checkout live" : "Planned",
      price: "$10",
      note: "Per user per month for the local-first desktop and CLI workflow",
      features: [
        "Local-first scans for broader coverage",
        "Repeatable reports and local project history",
        "Desktop shell on top of a shared scan engine",
        "CLI-oriented workflow for technical users"
      ],
      href: commerce.monthlyCheckoutUrl ?? commerce.earlyAccessUrl,
      cta: commerce.monthlyCheckoutUrl ? "Buy monthly access" : "Join early access",
      featured: true
    },
    {
      name: "Pro Annual",
      label: commerce.yearlyCheckoutUrl ? "Checkout live" : "Planned",
      price: "$50",
      note: "Yearly license-style option for individuals and small teams",
      features: [
        "Cheaper annual path for a lightweight utility software model",
        "Same local scan workflow without cloud-heavy pricing",
        "Good fit for consultants, agencies, and repeat audits",
        "Keeps billing on the website instead of inside the app"
      ],
      href: commerce.yearlyCheckoutUrl ?? commerce.earlyAccessUrl,
      cta: commerce.yearlyCheckoutUrl ? "Buy annual access" : "Request annual option"
    }
  ];

  return (
    <>
      <section className="pricing-hero">
        <div className="container split-grid">
          <div>
            <p className="eyebrow">Pricing</p>
            <h1 className="section-title">Start with free public-page checks. Pay later only if deeper workflow coverage matters.</h1>
            <p className="section-copy">
              Olite should stay easy to try. The free offer proves the value with focused accessibility and
              privacy checks, while future paid tiers can justify themselves with deeper local-first scanning
              and repeatable workflows.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/tools/accessibility">
                Start free
              </Link>
              <Link className="button-secondary" href="/tools/privacy">
                Try privacy checker
              </Link>
              <Link className="button-secondary" href={commerce.monthlyCheckoutUrl ?? commerce.earlyAccessUrl}>
                {commerce.monthlyCheckoutUrl ? "Buy monthly access" : "Join early access waitlist"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container pricing-grid">
          {plans.map((plan) => (
            <article className={`pricing-card${plan.featured ? " featured" : ""}`} key={plan.name}>
              <span className="plan-label">{plan.label}</span>
              <h2>{plan.name}</h2>
              <div className="price-line">
                <strong className="price-value">{plan.price}</strong>
                <span className="price-note">{plan.note}</span>
              </div>
              <ul className="bullet-list">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="hero-actions compact">
                <Link className={plan.featured ? "button" : "button-secondary"} href={plan.href}>
                  {plan.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="container split-grid">
          <div className="section-panel waitlist-panel">
            <p className="kicker">Early Access</p>
            <h2>Interested in the CLI or desktop app?</h2>
            <p className="section-copy">
              The hosted site is the front door. The deeper product can stay downloadable and local-first.
              If you want early access to that version, send a short note and describe the kind of workflow
              you need.
            </p>
            <div className="hero-actions compact">
              <Link className="button" href={commerce.earlyAccessUrl}>
                Email for early access
              </Link>
              {commerce.monthlyCheckoutUrl ? (
                <Link className="button-secondary" href={commerce.monthlyCheckoutUrl}>
                  Open monthly checkout
                </Link>
              ) : null}
              {commerce.yearlyCheckoutUrl ? (
                <Link className="button-secondary" href={commerce.yearlyCheckoutUrl}>
                  Open annual checkout
                </Link>
              ) : null}
            </div>
          </div>
          <div className="section-panel">
            <p className="kicker">Included In Free</p>
            <h2>Enough to answer, "Do we have obvious public-page issues?"</h2>
            <ul className="bullet-list">
              <li>Accessibility checks for alt text, labels, and page-language signals</li>
              <li>Privacy checks for policy visibility, cookie wording, and tracking signals</li>
              <li>Fast results without account setup</li>
            </ul>
          </div>
          <div className="section-panel">
            <p className="kicker">Reserved For Paid</p>
            <h2>The parts that genuinely require more product depth</h2>
            <ul className="bullet-list">
              <li>Broader crawls across multiple pages and templates</li>
              <li>Repeatable scanning history and project organization</li>
              <li>Local-first desktop and CLI-based workflows for technical teams</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}