import crypto from "node:crypto";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";

import type { BillingPlan } from "./paddle";

export type EntitlementStatus = "active" | "trialing" | "past_due" | "canceled" | "inactive";

export type EntitlementRecord = {
  email: string;
  plan: BillingPlan;
  status: EntitlementStatus;
  source: "paddle";
  customerId?: string;
  subscriptionId?: string;
  transactionId?: string;
  expiresAt?: string;
  updatedAt: string;
};

type EntitlementStore = {
  entitlements: EntitlementRecord[];
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeDate(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

function getStorePath(): string {
  const configured = process.env.OLITE_ENTITLEMENT_STORE_PATH?.trim();
  return configured ? configured : path.join(process.cwd(), ".data", "entitlements.json");
}

async function readStore(): Promise<EntitlementStore> {
  try {
    const raw = await readFile(getStorePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<EntitlementStore>;

    return {
      entitlements: Array.isArray(parsed.entitlements) ? parsed.entitlements : []
    };
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return { entitlements: [] };
    }

    throw error;
  }
}

async function writeStore(store: EntitlementStore) {
  const storePath = getStorePath();
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

export async function getEntitlementByEmail(email: string): Promise<EntitlementRecord | undefined> {
  const normalizedEmail = normalizeEmail(email);
  const store = await readStore();

  return store.entitlements.find((item) => normalizeEmail(item.email) === normalizedEmail);
}

export async function upsertEntitlement(record: EntitlementRecord): Promise<EntitlementRecord> {
  const normalizedRecord: EntitlementRecord = {
    ...record,
    email: normalizeEmail(record.email),
    expiresAt: normalizeDate(record.expiresAt),
    updatedAt: normalizeDate(record.updatedAt) ?? new Date().toISOString()
  };

  const store = await readStore();
  const nextEntitlements = store.entitlements.filter((item) => normalizeEmail(item.email) !== normalizedRecord.email);
  nextEntitlements.unshift(normalizedRecord);
  await writeStore({ entitlements: nextEntitlements });

  return normalizedRecord;
}

export function isEntitlementActive(record: EntitlementRecord | undefined): boolean {
  if (!record) {
    return false;
  }

  if (record.status !== "active" && record.status !== "trialing") {
    return false;
  }

  if (!record.expiresAt) {
    return true;
  }

  return new Date(record.expiresAt).getTime() > Date.now();
}

export function signEntitlement(record: EntitlementRecord): string | undefined {
  const secret = process.env.OLITE_ENTITLEMENT_SIGNING_SECRET?.trim();

  if (!secret) {
    return undefined;
  }

  const payload = Buffer.from(JSON.stringify(record)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}