/**
 * What is actually on offer today, in one place.
 *
 * Every page that states availability, latency, power source or reply time
 * reads it from here, so the site cannot say "coming soon" in one section and
 * "available now" in the next. Fleet status itself lives on each SKU in
 * lib/catalog.ts; this module only words it.
 *
 * Confirmed facts (October 2026):
 *  · NVIDIA H200 is available now, through enterprise early access.
 *  · RTX PRO 6000 Blackwell is coming soon; L40S after it.
 *  · Network latency inside Kathmandu is under 5 ms.
 *  · The datacenter runs on hydropower.
 *  · Rates are not published yet; every request gets a firm NPR quote.
 */
import { GPU_SKUS } from "@/lib/catalog";
import type { GpuSku } from "@/lib/api/types";

/** SKUs a customer can run today. */
export const AVAILABLE_GPUS: GpuSku[] = GPU_SKUS.filter((s) => s.status === "available");

/** SKUs announced but not yet live, in catalogue order. */
export const SOON_GPUS: GpuSku[] = GPU_SKUS.filter((s) => s.status === "coming-soon");

export const EARLY_ACCESS = {
  /** Shortest form, for pills and eyebrows. */
  pill: "H200 available now",
  /** Who can get in today. */
  audience: "enterprises",
  /** One sentence for near a call to action. */
  line: "Early access is open to enterprises on NVIDIA H200. More GPUs, and access for more teams, are coming soon.",
  /** What the next step is, said plainly. */
  promise: "Tell us what you want to run. We reply within one working day with a capacity plan and a firm rupee quote.",
  /** The reply-time commitment on its own. */
  replyTime: "within one working day",
} as const;

export const FACTS = {
  // Non-breaking spaces: "5" and "ms" must never wrap onto separate lines.
  latency: "<5 ms",
  latencyLong: "under 5 ms",
  latencyLabel: "latency in Kathmandu",
  power: "Our Kathmandu datacenter runs on Nepal's hydropower.",
  powerShort: "hydro-powered",
  region: "np-ktm-1",
  regionLong: "our Kathmandu region (np-ktm-1)",
} as const;

/** "Coming soon" wording for a SKU, so every page labels the roadmap alike. */
export function statusLabel(sku: Pick<GpuSku, "status">): string {
  return sku.status === "available" ? "available now" : "coming soon";
}
