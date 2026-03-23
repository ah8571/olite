import { NextResponse } from "next/server";

import { runBasicScan } from "@/lib/scanner";
import type { ToolType } from "@/lib/scanner-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody = {
  tool?: ToolType;
  url?: string;
};

function isTool(value: string): value is ToolType {
  return value === "accessibility" || value === "privacy" || value === "consent";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!body.url || !body.tool || !isTool(body.tool)) {
      return NextResponse.json({ error: "A valid tool and URL are required." }, { status: 400 });
    }

    const result = await runBasicScan(body.tool, body.url);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The scan could not be completed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}