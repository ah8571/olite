import { NextResponse } from "next/server";

import { getManagedCheckoutPath, getPaddleConfig, getPriceIdForPlan, isBillingPlan, paddleApiRequest } from "@/lib/paddle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const plan = searchParams.get("plan") ?? "";

  if (!isBillingPlan(plan)) {
    return NextResponse.json({ error: "A valid billing plan is required." }, { status: 400 });
  }

  const config = getPaddleConfig();
  const priceId = getPriceIdForPlan(plan, config);

  if (!config.apiKey || !priceId || !getManagedCheckoutPath(plan)) {
    return NextResponse.json({ error: "Managed Paddle checkout is not configured for this plan." }, { status: 503 });
  }

  const transaction = await paddleApiRequest<{ checkout?: { url?: string } }>("/transactions", {
    method: "POST",
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      collection_mode: "automatic",
      custom_data: {
        plan,
        source: "olite-website"
      }
    })
  });

  const checkoutUrl = transaction.checkout?.url;

  if (!checkoutUrl) {
    return NextResponse.json({ error: "Paddle did not return a checkout URL." }, { status: 502 });
  }

  return NextResponse.redirect(checkoutUrl);
}