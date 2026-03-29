import { NextResponse } from "next/server";

import { getEntitlementByEmail, isEntitlementActive, signEntitlement } from "@/lib/entitlements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody = {
  email?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const email = body.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const entitlement = await getEntitlementByEmail(email);

  return NextResponse.json({
    email,
    active: isEntitlementActive(entitlement),
    entitlement: entitlement ?? null,
    signedEntitlement: entitlement ? signEntitlement(entitlement) ?? null : null
  });
}