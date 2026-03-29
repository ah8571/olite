import crypto from "node:crypto";

export type BillingPlan = "monthly" | "annual";

type PaddleConfig = {
  apiKey?: string;
  apiBaseUrl: string;
  webhookSecret?: string;
  monthlyPriceId?: string;
  annualPriceId?: string;
};

type PaddleApiEnvelope<T> = {
  data: T;
};

function normalizeEnv(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function isBillingPlan(value: string): value is BillingPlan {
  return value === "monthly" || value === "annual";
}

export function getPaddleConfig(): PaddleConfig {
  return {
    apiKey: normalizeEnv(process.env.PADDLE_API_KEY),
    apiBaseUrl: normalizeEnv(process.env.OLITE_PADDLE_API_BASE_URL) ?? "https://api.paddle.com",
    webhookSecret: normalizeEnv(process.env.PADDLE_WEBHOOK_SECRET),
    monthlyPriceId: normalizeEnv(process.env.PADDLE_MONTHLY_PRICE_ID),
    annualPriceId: normalizeEnv(process.env.PADDLE_ANNUAL_PRICE_ID)
  };
}

export function getManagedCheckoutPath(plan: BillingPlan): string | undefined {
  const config = getPaddleConfig();
  const priceId = plan === "monthly" ? config.monthlyPriceId : config.annualPriceId;

  if (!config.apiKey || !priceId) {
    return undefined;
  }

  return `/api/billing/checkout?plan=${plan}`;
}

export function getPriceIdForPlan(plan: BillingPlan, config = getPaddleConfig()): string | undefined {
  return plan === "monthly" ? config.monthlyPriceId : config.annualPriceId;
}

export function inferPlanFromPriceId(priceId: string | undefined, config = getPaddleConfig()): BillingPlan | undefined {
  if (!priceId) {
    return undefined;
  }

  if (config.monthlyPriceId && priceId === config.monthlyPriceId) {
    return "monthly";
  }

  if (config.annualPriceId && priceId === config.annualPriceId) {
    return "annual";
  }

  return undefined;
}

export function verifyPaddleWebhookSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const parts = signatureHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce(
      (accumulator, part) => {
        const [key, value] = part.split("=", 2);

        if (key && value) {
          accumulator[key] = value;
        }

        return accumulator;
      },
      {} as Record<string, string>
    );

  if (!parts.ts || !parts.h1) {
    return false;
  }

  const expected = crypto.createHmac("sha256", secret).update(`${parts.ts}:${rawBody}`).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(parts.h1, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

export async function paddleApiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getPaddleConfig();

  if (!config.apiKey) {
    throw new Error("PADDLE_API_KEY is not configured.");
  }

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Paddle API request failed (${response.status}): ${errorText}`);
  }

  const payload = (await response.json()) as PaddleApiEnvelope<T>;
  return payload.data;
}

export async function getPaddleCustomerEmail(customerId: string): Promise<string | undefined> {
  const customer = await paddleApiRequest<{ email?: string }>(`/customers/${customerId}`);
  return normalizeEnv(customer.email);
}