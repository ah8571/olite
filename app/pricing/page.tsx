import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Pricing for Olite's free accessibility scanner, free privacy checker, and planned deeper local-first workflows."
};

export default function PricingPage() {
  redirect("/#pricing");
}