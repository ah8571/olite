import Link from "next/link";

import type { CommerceConfig } from "@/lib/commerce";

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

function getPricingPlans(commerce: CommerceConfig): PricingPlan[] {
  return [
    {
      name: "Free",
      label: "Live now",
      price: "$0",
      note: "2 hosted scans per day across accessibility and privacy",
      features: [
        "Fast public-page checks with no setup required",
        "Useful for quick triage before a deeper pass",
        "Best for trying the workflow before downloading the app"
      ],
      href: "/tools/accessibility",
      cta: "Start free"
    },
    {
      name: "Pro Monthly",
      label: commerce.monthlyCheckoutUrl ? "Checkout live" : "Planned",
      price: "$5",
      note: "Per month for the local-first desktop workflow",
      features: [
        "Broader local scans and repeatable workflows",
        "Saved scan history and exportable reports",
        "Simple utility pricing instead of a heavier SaaS model"
      ],
      href: commerce.monthlyCheckoutUrl ?? commerce.earlyAccessUrl,
      cta: commerce.monthlyCheckoutUrl ? "Buy monthly access" : "Join early access",
      featured: true
    },
    {
      name: "Pro Annual",
      label: commerce.yearlyCheckoutUrl ? "Checkout live" : "Planned",
      price: "$50",
      note: "Annual option for regular individual or agency use",
      features: [
        "Cheaper than paying monthly for a full year",
        "Same local scan workflow without cloud-heavy pricing",
        "Good fit for consultants and repeat review work"
      ],
      href: commerce.yearlyCheckoutUrl ?? commerce.earlyAccessUrl,
      cta: commerce.yearlyCheckoutUrl ? "Buy annual access" : "Request annual option"
    }
  ];
}

export function PricingSection({ commerce }: { commerce: CommerceConfig }) {
  const plans = getPricingPlans(commerce);

  return (
    <section className="page-section" id="pricing">
      <div className="container">
        <div className="pricing-section-head">
          <p className="kicker">Pricing</p>
          <h2 className="section-title">Start free. Pay only when the local workflow is worth it.</h2>
          <p className="section-copy pricing-section-copy">
            The hosted scanners are the fast way to test fit. The paid path only starts when you need more
            than 2 free scans per day, broader local scans, or repeatable desktop workflows.
          </p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article className={`pricing-card${plan.featured ? " featured" : ""}`} key={plan.name}>
              <span className="plan-label">{plan.label}</span>
              <h3>{plan.name}</h3>
              <div className="price-line">
                <strong className="price-value">{plan.price}</strong>
                <span className="price-note">{plan.note}</span>
              </div>
              <ul className="bullet-list">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <div className="hero-actions compact pricing-card-actions">
                <Link className={plan.featured ? "button" : "button-secondary"} href={plan.href}>
                  {plan.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}