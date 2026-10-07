/**
 * The quote console's vocabulary, shared by the console (which writes a plan
 * into the link) and the contact form (which reads it back and prefills the
 * enquiry). Pure data and string helpers: no React, so the contact page does
 * not pull the console's UI into its bundle.
 *
 * Status comes from the catalogue, never from here: when an SKU flips to
 * "available" in lib/catalog.ts, its dial entry stops saying "coming soon"
 * and its button stops saying "join the waitlist" without a change in this
 * file.
 */
import { GPU_SKUS } from "@/lib/catalog";

export interface QuoteGpu {
  /** Stable id, written into the /contact link. */
  id: string;
  /** The dial face, lowercase mono like the rest of the console. */
  dial: string;
  /** The line under the dial face. */
  sub: string;
  /** Compact form for the console screen: "H200 · 35 GB slice". */
  short: string;
  /** Full, plain form for the enquiry: "NVIDIA H200 hardware slice …". */
  name: string;
  /** A MIG partition rather than a whole card. */
  slice: boolean;
  /** Announced but not live yet (from the catalogue). */
  soon: boolean;
}

const H200 = "h200-sxm-141";

function isSoon(skuId: string): boolean {
  return GPU_SKUS.find((s) => s.id === skuId)?.status !== "available";
}

/* Available configurations first, smallest to largest, then the roadmap in
   catalogue order. Slice sizes are the H200's MIG profiles. */
const ENTRIES: (Omit<QuoteGpu, "soon" | "sub"> & { sku: string; memGb: number })[] = [
  {
    id: "h200-1g",
    sku: H200,
    memGb: 18,
    dial: "h200 · 1g",
    short: "H200 · 18 GB slice",
    name: "NVIDIA H200 hardware slice, 18 GB (MIG 1g.18gb)",
    slice: true,
  },
  {
    id: "h200-2g",
    sku: H200,
    memGb: 35,
    dial: "h200 · 2g",
    short: "H200 · 35 GB slice",
    name: "NVIDIA H200 hardware slice, 35 GB (MIG 2g.35gb)",
    slice: true,
  },
  {
    id: "h200-3g",
    sku: H200,
    memGb: 71,
    dial: "h200 · 3g",
    short: "H200 · 71 GB slice",
    name: "NVIDIA H200 hardware slice, 71 GB (MIG 3g.71gb)",
    slice: true,
  },
  {
    id: "h200",
    sku: H200,
    memGb: 141,
    dial: "h200",
    short: "H200 · full card",
    name: "NVIDIA H200, full card (141 GB HBM3e)",
    slice: false,
  },
  {
    id: "rtx-pro-6000",
    sku: "rtx-pro-6000-blackwell-96",
    memGb: 96,
    dial: "rtx pro 6000",
    short: "RTX PRO 6000 · 96 GB",
    name: "NVIDIA RTX PRO 6000 Blackwell (96 GB GDDR7)",
    slice: false,
  },
  {
    id: "l40s",
    sku: "l40s-48",
    memGb: 48,
    dial: "l40s",
    short: "L40S · 48 GB",
    name: "NVIDIA L40S (48 GB GDDR6)",
    slice: false,
  },
];

export const QUOTE_GPUS: QuoteGpu[] = ENTRIES.map(({ sku, memGb, ...g }) => {
  const soon = isSoon(sku);
  return {
    ...g,
    soon,
    sub: `${memGb} gb · ${soon ? "coming soon" : g.slice ? "slice" : "full card"}`,
  };
});

export const QUOTE_COUNTS = [1, 2, 4, 8] as const;

export interface QuoteHours {
  v: number;
  dial: string;
  sub: string;
  long: string;
}

export const QUOTE_HOURS: QuoteHours[] = [
  { v: 1, dial: "1 h", sub: "a test", long: "1 hour" },
  { v: 8, dial: "8 h", sub: "a shift", long: "8 hours" },
  { v: 24, dial: "24 h", sub: "a day", long: "24 hours" },
  { v: 72, dial: "72 h", sub: "a weekend", long: "72 hours" },
  { v: 168, dial: "1 wk", sub: "168 h", long: "1 week" },
  { v: 720, dial: "1 mo", sub: "720 h", long: "1 month" },
];

export interface QuotePlan {
  gpu: QuoteGpu;
  count: number;
  hours: QuoteHours | null;
}

/** The link the console's button follows. */
export function planHref(plan: { gpu: QuoteGpu; count: number; hours: QuoteHours }): string {
  const q = new URLSearchParams({
    gpu: plan.gpu.id,
    count: String(plan.count),
    hours: String(plan.hours.v),
  });
  return `/contact/?${q.toString()}`;
}

/**
 * Reads a plan back out of a query string. An unknown GPU means no plan at
 * all (an old or hand-edited link); a bad count falls back to one; a bad
 * hours value is simply left out.
 */
export function parsePlan(search: string): QuotePlan | null {
  const q = new URLSearchParams(search);
  const gpu = QUOTE_GPUS.find((g) => g.id === q.get("gpu"));
  if (!gpu) return null;
  const n = Number(q.get("count"));
  const count = (QUOTE_COUNTS as readonly number[]).includes(n) ? n : 1;
  const h = Number(q.get("hours"));
  const hours = QUOTE_HOURS.find((x) => x.v === h) ?? null;
  return { gpu, count, hours };
}

/** One plain sentence, for the top of the enquiry message. */
export function describePlan(plan: QuotePlan): string {
  const run = plan.hours ? `, for ${plan.hours.long}` : "";
  return `From the quote console: ${plan.count}× ${plan.gpu.name}${run}.`;
}
