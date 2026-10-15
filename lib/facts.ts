/**
 * The facts registry — every number and technical claim the site states,
 * with where it comes from and how sure we are (docs/revamp/04 §1).
 *
 * Rules:
 *  · Components render facts through this module (or copy modules that read
 *    from it), never by typing a number into JSX.
 *  · `to-verify` facts render on staging with a visible marker, and fail a
 *    production build (see `fact()`), so nothing unconfirmed can go live.
 *  · Confidential values never enter this file or this repository (it is
 *    public). What is not cleared for the website is simply absent.
 *  · CTO ruling, 14 Oct 2026: no detailed specifications on the site. The
 *    GPU is named with its headline figures only; no GPU or server counts,
 *    server, CPU, memory, network or storage details, platform product
 *    names or software licensing.
 *  · Each rendered number carries its `asOf` date on the page (a footnote or
 *    caption), and claims with a disclaimer render it (`footnote`).
 */

export type FactStatus = "confirmed" | "to-verify";

/** The page that owns the subject (docs/revamp/03 §3). */
export type FactOwner = "hardware" | "infrastructure" | "platform" | "pricing" | "contact" | "company" | "products";

export interface Source {
  name: string;
  url?: string;
}

export interface Fact {
  value: string;
  /** Short label, for spec rows and kickers. */
  label: string;
  status: FactStatus;
  source: Source;
  /** ISO date the value was last checked. */
  asOf: string;
  owner: FactOwner;
  /** A disclaimer that must be shown wherever the fact is shown. */
  footnote?: string;
}

const NVIDIA_H200: Source = {
  name: "NVIDIA H200 datasheet",
  url: "https://www.nvidia.com/en-us/data-center/h200/",
};
const OWNER: Source = { name: "CoreValley (owner confirmation)" };
const PUBLISHED: Source = { name: "Published CoreValley terms", url: "https://corevalley.ai/pricing/" };

const D = "2026-10-13";

const FACTS = {
  /* ── The GPU: NVIDIA H200 NVL ───────────────────────────────────────── */
  "gpu.model": {
    value: "NVIDIA H200 NVL",
    label: "GPU",
    status: "confirmed",
    source: OWNER,
    asOf: D,
    owner: "hardware",
  },
  "gpu.memory": {
    value: "141 GB",
    label: "GPU memory",
    status: "confirmed",
    source: NVIDIA_H200,
    asOf: D,
    owner: "hardware",
  },
  "gpu.memoryType": {
    value: "HBM3e",
    label: "Memory type",
    status: "confirmed",
    source: NVIDIA_H200,
    asOf: D,
    owner: "hardware",
  },
  "gpu.bandwidth": {
    value: "4.8 TB/s",
    label: "Memory bandwidth",
    status: "confirmed",
    source: NVIDIA_H200,
    asOf: D,
    owner: "hardware",
  },
  "gpu.fp8": {
    value: "3,341 TFLOPS",
    label: "FP8 Tensor Core",
    status: "confirmed",
    source: NVIDIA_H200,
    asOf: D,
    owner: "hardware",
    footnote: "Tensor Core figures are NVIDIA's, with sparsity.",
  },
  "gpu.power": {
    value: "Up to 600 W",
    label: "Max power (configurable)",
    status: "confirmed",
    source: NVIDIA_H200,
    asOf: D,
    owner: "hardware",
  },
  "gpu.migCount": {
    value: "7",
    label: "MIG instances, up to",
    status: "confirmed",
    source: NVIDIA_H200,
    asOf: D,
    owner: "hardware",
  },
  "gpu.migSize": {
    value: "16.5 GB",
    label: "Memory per smallest instance",
    status: "confirmed",
    source: NVIDIA_H200,
    asOf: D,
    owner: "hardware",
  },



  /* ── The place ──────────────────────────────────────────────────────── */
  "place.location": {
    value: "Kathmandu Valley, Nepal",
    label: "Location",
    status: "confirmed",
    source: OWNER,
    asOf: D,
    owner: "infrastructure",
  },
  "place.power": {
    value: "Nepal's hydropower",
    label: "Power",
    status: "confirmed",
    source: OWNER,
    asOf: D,
    owner: "infrastructure",
    footnote: "Our datacentre runs on Nepal's hydro-dominated grid.",
  },
  "place.gridHydro": {
    value: "≈ 95 %",
    label: "Hydro share of Nepal's installed capacity",
    status: "confirmed",
    source: { name: "Nepal Rastra Bank, FY2025/26" },
    asOf: D,
    owner: "infrastructure",
    footnote: "About 3,905 of 4,120 MW of installed capacity is hydropower.",
  },
  "place.uptime": {
    value: "99.99 %",
    label: "Datacentre facility uptime commitment",
    status: "confirmed",
    source: OWNER,
    asOf: D,
    owner: "infrastructure",
    footnote:
      "99.99 % is our datacentre facility's availability commitment (power, cooling and building infrastructure). Service-level terms for CoreValley services are set out in your agreement.",
  },
  "place.latency": {
    value: "< 5 ms",
    label: "Round trip inside the Kathmandu Valley",
    status: "confirmed",
    source: OWNER,
    asOf: D,
    owner: "infrastructure",
    footnote:
      "Typical round-trip figure for connections inside the Kathmandu Valley; your latency depends on your network and location.",
  },
  "place.timezone": {
    value: "UTC+05:45",
    label: "Nepal Standard Time",
    status: "confirmed",
    source: { name: "Nepal Standard Time" },
    asOf: D,
    owner: "contact",
  },

  /* ── Money ──────────────────────────────────────────────────────────── */
  "billing.unit": {
    value: "Per second",
    label: "Billing",
    status: "confirmed",
    source: PUBLISHED,
    asOf: D,
    owner: "pricing",
  },
  "billing.minimum": {
    value: "60 seconds",
    label: "Minimum per run",
    status: "confirmed",
    source: PUBLISHED,
    asOf: D,
    owner: "pricing",
  },
  "billing.currency": {
    value: "Nepalese rupees (NPR)",
    label: "Currency",
    status: "confirmed",
    source: PUBLISHED,
    asOf: D,
    owner: "pricing",
  },
  "billing.rails": {
    value: "eSewa, Khalti, bank transfer or invoice",
    label: "Ways to pay",
    status: "confirmed",
    source: PUBLISHED,
    asOf: D,
    owner: "pricing",
  },
  "billing.rates": {
    value: "Being finalised",
    label: "Published rates",
    status: "confirmed",
    source: PUBLISHED,
    asOf: D,
    owner: "pricing",
  },
  "contact.reply": {
    value: "Within one working day",
    label: "Reply time",
    status: "confirmed",
    source: PUBLISHED,
    asOf: D,
    owner: "contact",
  },
} as const satisfies Record<string, Fact>;

export type FactId = keyof typeof FACTS;

/** Production builds refuse to render facts that are still to verify. */
const STRICT =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_NOINDEX !== "1" &&
  process.env.NEXT_PUBLIC_FACTS_STRICT !== "0";

export function fact(id: FactId): Fact {
  const f: Fact = FACTS[id];
  if (f.status === "to-verify" && STRICT) {
    throw new Error(
      `Fact "${id}" (${f.value}) is still to verify and cannot appear on the production site. ` +
        `Confirm it in lib/facts.ts or remove it from the page.`,
    );
  }
  return f;
}

/** The fact's value as text. */
export function v(id: FactId): string {
  return fact(id).value;
}

export function isUnverified(id: FactId): boolean {
  const f: Fact = FACTS[id];
  return f.status === "to-verify";
}

/** Every fact, for the registry page in engineer mode and for tests. */
export function allFacts(): [FactId, Fact][] {
  return Object.entries(FACTS) as [FactId, Fact][];
}

/** "13 Oct 2026" — how asOf dates are written on the page. */
export function asOfLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][(m ?? 1) - 1];
  return `${d} ${month} ${y}`;
}
