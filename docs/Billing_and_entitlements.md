# Billing And Entitlements

## Recommended Starting Model

For Olite, the best near-term billing model is:

- let people download the desktop app first
- keep checkout on the website
- let the desktop app verify entitlements from a lightweight hosted service
- avoid putting the full subscription purchase flow inside Electron as the primary path

This keeps the buying flow simpler and avoids rebuilding billing, tax, receipt, and subscription-management UX inside the desktop shell.

## Why Not Trust Local-Only Billing

If the app is fully local and open source, purely local usage limits are not reliable as a paid gate.

Anything enforced only in the client can be modified, bypassed, or removed.

That means paid access needs at least one hosted control point:

- a signed entitlement check
- a license key or activation token
- or an authenticated account lookup

## Recommended Entitlement Flow

### 1. Website Checkout

- customer buys monthly or annual access on the website
- checkout stays tied to Paddle on the website
- customer receives a post-purchase activation path

### 2. Desktop Install First

- anyone can install the desktop app
- the app can expose a small free mode or trial mode
- the user upgrades only when the workflow proves useful

### 3. App Activation

- app asks for email plus magic link, license key, or account sign-in
- app calls a small Olite entitlement endpoint
- endpoint returns the current entitlement payload with plan, status, and expiry

### 4. Local Cache With Refresh

- app stores the entitlement locally
- app refreshes entitlement periodically when online
- app uses a grace period so paid users are not blocked immediately by temporary network issues

## What To Gate

The cleanest early gating model is not total lockout of the app.

Instead, gate premium workflow depth:

- broader crawls
- saved scan history beyond a free cap
- exports beyond a free cap
- desktop-only premium checks
- repeatable project workflows

That lets people try the app first without creating a separate trial-download product.

## Free Mode Recommendation

Recommended free desktop mode:

- single-page review only until entitlements are live in the desktop shell
- limited saved history
- basic exports or watermarked exports
- same local shell, but not the full workflow depth

This fits the product better than time-bombing the app after a short trial period.

## Minimum Hosted Pieces Needed

Olite does not need a heavy cloud backend to start paid desktop access.

The minimum useful hosted pieces are:

- Paddle checkout
- webhook receiver for subscription changes
- small entitlement store keyed by customer or email
- activation and refresh endpoint for the desktop app

## Suggested Early Implementation Shape

### Website

- checkout links for monthly and annual access
- account or activation instructions page
- later: billing portal link for subscription management

### Backend

- receive webhook events for purchase, renewal, cancellation, refund, and expiry
- map billing records to entitlement records
- issue entitlement payloads to the desktop app

Current first-pass implementation in this repository:

- Paddle webhook route at `/api/paddle/webhook`
- optional managed checkout route at `/api/billing/checkout?plan=monthly|annual`
- desktop entitlement lookup route at `/api/desktop/entitlement`
- file-backed entitlement store via `OLITE_ENTITLEMENT_STORE_PATH`

### Desktop

- allow free mode by default
- add an "Unlock Pro" flow
- cache entitlement locally
- refresh entitlement in the background

## Environment Variables

Use these variables for the new billing path:

- `PADDLE_API_KEY`
- `PADDLE_WEBHOOK_SECRET`
- `PADDLE_MONTHLY_PRICE_ID`
- `PADDLE_ANNUAL_PRICE_ID`
- `OLITE_PADDLE_API_BASE_URL`
- `OLITE_ENTITLEMENT_SIGNING_SECRET`
- `OLITE_ENTITLEMENT_STORE_PATH`

If you already have Paddle-hosted payment links, you can keep using:

- `NEXT_PUBLIC_OLITE_LS_MONTHLY_URL`
- `NEXT_PUBLIC_OLITE_LS_YEARLY_URL`

If those public checkout URLs are not set, the website can fall back to the managed transaction route when the Paddle API key and price IDs are configured.

## Practical Recommendation

The best first implementation is:

1. keep checkout on the website
2. let people install the app before paying
3. gate premium desktop depth with hosted entitlements
4. avoid in-app purchase UX as the main billing surface

That is the simplest model that still gives Olite a real paid product instead of a trust-only paywall.