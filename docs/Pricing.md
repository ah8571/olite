# Olite Pricing Thoughts

## Pricing Goals

Olite pricing should reflect the product strategy:

- keep robust scanning local-first
- keep hosted costs minimal
- stay inexpensive enough for individual developers and small website owners
- still leave room for agency and team pricing later

The product should not depend on heavy hosted scan infrastructure. The main paid value should come from the scanner itself, the reporting experience, workflow convenience, and premium capabilities rather than cloud compute.

## Core Pricing Principle

If Olite keeps deep scanning on the user's machine, pricing can stay relatively low because the company is not paying to run large hosted crawls for every customer.

This is an important strategic advantage.

Hosted infrastructure should stay limited to:

- account management
- billing
- optional report sync or history
- lightweight dashboards
- limited public URL scans for top-of-funnel acquisition

## Target Pricing Direction

Current preference:

- monthly pricing should stay inexpensive, potentially around $10 per month for individual subscribers
- annual pricing could be around $50 per year as a simple, affordable license option

This is intentionally closer to lightweight tooling than enterprise compliance software.

Reference mindset:

- affordable utility software
- similar in spirit to a smaller Screaming Frog-style purchase decision
- easy enough to justify for an individual developer, consultant, or small business owner

## Possible Pricing Models

### Model A: Free + Low-Cost Individual Plan

This is the simplest starting model.

#### Free

- limited public URL scans on the website
- limited number of scans per day
- headline issues only
- prompts to install the CLI for deeper analysis

#### Individual

- around $9 to $10 per month
- or around $49 to $59 per year
- full local CLI scans
- deeper issue detail
- exports and saved reports
- more advanced checks over time

Why this model works:

- easy to understand
- low friction for early adoption
- fits the local-first architecture
- good for solo developers and small businesses

Main downside:

- revenue per customer may be low unless adoption volume is strong

### Model B: Free + Individual + Agency

This adds a higher tier for consultants and agencies.

#### Free

- limited public scans

#### Individual

- around $9 to $10 per month
- or around $49 to $59 per year

#### Agency

- around $24 to $49 per month
- or around $149 to $299 per year
- multiple projects
- client-friendly exports
- project history
- priority support later

Why this model works:

- preserves affordability for solo users
- gives agencies a tier with better economics
- avoids forcing every customer into the same low price ceiling

Main downside:

- requires a clearer feature split between individual and agency plans

### Model C: Free Tool + Perpetual License + Optional Updates

This is closer to the Screaming Frog style the project may want to learn from.

#### Free

- limited public scans
- limited local usage or limited feature set

#### Paid License

- one-time yearly license or renewal-style license around $50 per year
- access to the full CLI
- updates during the license period

Possible extension later:

- optional cloud add-on for saved history, reporting sync, or team features

Why this model works:

- simple buying decision
- feels like practical utility software rather than SaaS overhead
- attractive to developers who dislike ongoing subscriptions

Main downside:

- recurring revenue is less predictable unless renewals are strong

## Recommended Starting Model

The strongest starting option is likely a hybrid of Model A and Model C.

Recommended first structure:

### Free

- public URL scanner on the website
- rate limited by IP
- a few scans per day
- high-level findings only

### CLI Personal

- $9 per month or $49 per year
- unlimited local scans on the user's machine
- full issue detail
- exportable reports
- access to new checks added during the subscription or license period

### Team or Agency Later

- higher-priced plan added only after there is evidence of demand
- multi-project management
- shared reports
- client workflows
- optional cloud history

Why this recommendation fits Olite:

- aligns with the low-hosting-cost strategy
- keeps the product affordable
- supports a developer-first launch
- does not force a complex billing system on day one

## What Customers Should Actually Pay For

Customers should mainly pay for:

- full local scan access
- deeper reports
- export options
- better rules and checks
- remediation guidance
- saved project history later
- collaboration features later

Customers should not feel like they are paying mainly for cloud compute.

## Pricing Risks To Watch

### Risk 1: Pricing Too Low

If pricing is too cheap, the product may attract usage but not enough revenue to support continued development.

This is especially relevant if:

- support needs increase
- rules become more sophisticated
- users want polished reporting and integrations

### Risk 2: Charging for the Wrong Thing

If pricing is tied too heavily to hosted scan volume, the company may accidentally create infrastructure costs that work against the local-first strategy.

### Risk 3: Underpricing Agencies

Agencies can extract much more value from the product than a solo user. That likely justifies a higher tier later, even if the base plan remains inexpensive.

## Early Monetization Recommendation

For the earliest version of Olite, the cleanest pricing decision is:

- keep the free public scanner narrow
- sell the CLI as the first paid product
- aim for about $9 per month or about $49 per year
- avoid heavy hosted scanning in paid plans
- add team and agency pricing only after the core scanner proves useful

## Open Pricing Questions

- Should the first paid offer be monthly, annual, or both?
- Should the annual plan be framed as a subscription or a yearly license?
- Should the free version include any local CLI usage, or should the CLI be paid-only?
- At what point should agency or team pricing be introduced?
- Should cloud reporting be bundled or treated as a future add-on?