import { NextResponse } from "next/server";

import { upsertEntitlement, type EntitlementStatus } from "@/lib/entitlements";
import { getPaddleConfig, getPaddleCustomerEmail, inferPlanFromPriceId, verifyPaddleWebhookSignature } from "@/lib/paddle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaddleWebhookEvent = {
  event_type?: string;
  occurred_at?: string;
  data?: Record<string, unknown>;
};

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

function readPriceId(data: Record<string, unknown>): string | undefined {
  const items = Array.isArray(data.items) ? data.items : [];

  for (const item of items) {
    const entry = readRecord(item);
    const directPriceId = readString(entry?.price_id);

    if (directPriceId) {
      return directPriceId;
    }

    const nestedPrice = readRecord(entry?.price);
    const nestedPriceId = readString(nestedPrice?.id);

    if (nestedPriceId) {
      return nestedPriceId;
    }
  }

  return undefined;
}

function mapStatus(eventType: string | undefined, data: Record<string, unknown>): EntitlementStatus {
  const status = readString(data.status);

  if (eventType === "transaction.completed") {
    return "active";
  }

  if (status === "active") {
    return "active";
  }

  if (status === "trialing") {
    return "trialing";
  }

  if (status === "past_due") {
    return "past_due";
  }

  if (status === "canceled" || eventType === "subscription.canceled") {
    return "canceled";
  }

  return "inactive";
}

function readExpiry(data: Record<string, unknown>): string | undefined {
  const billingPeriod = readRecord(data.current_billing_period);
  const scheduledChange = readRecord(data.scheduled_change);

  return (
    readString(billingPeriod?.ends_at) ??
    readString(data.next_billed_at) ??
    readString(data.canceled_at) ??
    readString(scheduledChange?.effective_at)
  );
}

async function resolveEmail(data: Record<string, unknown>): Promise<string | undefined> {
  const customer = readRecord(data.customer);
  const customData = readRecord(data.custom_data);

  const directEmail =
    readString(customer?.email) ??
    readString(data.email) ??
    readString(data.customer_email) ??
    readString(customData?.email);

  if (directEmail) {
    return directEmail.toLowerCase();
  }

  const customerId = readString(data.customer_id) ?? readString(customer?.id);

  if (!customerId) {
    return undefined;
  }

  const customerEmail = await getPaddleCustomerEmail(customerId);
  return customerEmail?.toLowerCase();
}

export async function POST(request: Request) {
  const config = getPaddleConfig();

  if (!config.webhookSecret) {
    return NextResponse.json({ error: "PADDLE_WEBHOOK_SECRET is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("paddle-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Paddle-Signature header." }, { status: 400 });
  }

  const rawBody = await request.text();

  if (!verifyPaddleWebhookSignature(rawBody, signature, config.webhookSecret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as PaddleWebhookEvent;
  const data = readRecord(event.data);

  if (!event.event_type || !data) {
    return NextResponse.json({ received: true, ignored: true, reason: "Unsupported event shape." });
  }

  if (event.event_type !== "transaction.completed" && !event.event_type.startsWith("subscription.")) {
    return NextResponse.json({ received: true, ignored: true, eventType: event.event_type });
  }

  const email = await resolveEmail(data);
  const priceId = readPriceId(data);
  const plan = inferPlanFromPriceId(priceId, config);

  if (!email || !plan) {
    return NextResponse.json({
      received: true,
      ignored: true,
      eventType: event.event_type,
      reason: !email ? "Could not resolve customer email." : "Could not map Paddle price to a plan."
    });
  }

  const entitlement = await upsertEntitlement({
    email,
    plan,
    status: mapStatus(event.event_type, data),
    source: "paddle",
    customerId: readString(data.customer_id),
    subscriptionId: readString(data.subscription_id) ?? readString(data.id),
    transactionId: event.event_type === "transaction.completed" ? readString(data.id) : undefined,
    expiresAt: readExpiry(data),
    updatedAt: event.occurred_at ?? new Date().toISOString()
  });

  return NextResponse.json({ received: true, entitlement });
}