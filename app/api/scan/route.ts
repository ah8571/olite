import { NextResponse } from "next/server";

import { runBasicScan } from "@/lib/scanner";
import type { PrivacyRegion } from "@/lib/scan/types";
import type { ToolType } from "@/lib/scanner-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody = {
  tool?: ToolType;
  url?: string;
  privacyRegion?: PrivacyRegion;
};

type RateLimitEntry = {
  day: string;
  count: number;
};

const DAILY_SCAN_LIMIT = 2;

const rateLimitStore = getRateLimitStore();

function isTool(value: string): value is ToolType {
  return value === "accessibility" || value === "privacy";
}

function isPrivacyRegion(value: string): value is PrivacyRegion {
  return value === "us" || value === "eu";
}

function getRateLimitStore(): Map<string, RateLimitEntry> {
  const globalStore = globalThis as typeof globalThis & {
    __oliteDailyRateLimitStore?: Map<string, RateLimitEntry>;
  };

  if (!globalStore.__oliteDailyRateLimitStore) {
    globalStore.__oliteDailyRateLimitStore = new Map<string, RateLimitEntry>();
  }

  return globalStore.__oliteDailyRateLimitStore;
}

function getCurrentDayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const connectingIp = request.headers.get("cf-connecting-ip");
  const userAgent = request.headers.get("user-agent") ?? "unknown-agent";
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || connectingIp || "unknown-ip";

  return `${ip}:${userAgent}`;
}

function buildRateLimitHeaders(remaining: number): HeadersInit {
  return {
    "X-RateLimit-Limit": String(DAILY_SCAN_LIMIT),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": getCurrentDayKey()
  };
}

function enforceDailyLimit(request: Request): { allowed: boolean; remaining: number } {
  const clientIdentifier = getClientIdentifier(request);
  const currentDay = getCurrentDayKey();

  for (const [key, value] of rateLimitStore.entries()) {
    if (value.day !== currentDay) {
      rateLimitStore.delete(key);
    }
  }

  const existing = rateLimitStore.get(clientIdentifier);

  if (!existing || existing.day !== currentDay) {
    rateLimitStore.set(clientIdentifier, { day: currentDay, count: 1 });
    return { allowed: true, remaining: DAILY_SCAN_LIMIT - 1 };
  }

  if (existing.count >= DAILY_SCAN_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  rateLimitStore.set(clientIdentifier, existing);

  return {
    allowed: true,
    remaining: DAILY_SCAN_LIMIT - existing.count
  };
}

export async function POST(request: Request) {
  try {
    const rateLimit = enforceDailyLimit(request);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Free checks used for today. Try again tomorrow or download the desktop app."
        },
        {
          status: 429,
          headers: buildRateLimitHeaders(rateLimit.remaining)
        }
      );
    }

    const body = (await request.json()) as RequestBody;

    if (!body.url || !body.tool || !isTool(body.tool)) {
      return NextResponse.json(
        { error: "A valid tool and URL are required." },
        { status: 400, headers: buildRateLimitHeaders(rateLimit.remaining) }
      );
    }

    const privacyRegion = isPrivacyRegion(body.privacyRegion ?? "") ? body.privacyRegion : undefined;
    const result = await runBasicScan(body.tool, body.url, privacyRegion);
    return NextResponse.json(result, { headers: buildRateLimitHeaders(rateLimit.remaining) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The scan could not be completed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}