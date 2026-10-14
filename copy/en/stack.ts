/**
 * "Every layer, named" — CoreValley on NVIDIA's five-layer cake of AI
 * (Jensen Huang: energy, chips, infrastructure, models, applications). Shown
 * on the home page and on /infrastructure
 * (components/infrastructure/layer-stack.tsx).
 *
 * CTO ruling, 14 Oct 2026: no detailed specifications. Name the GPU and its
 * headline memory only; no GPU or server counts, server, network or storage
 * details, platform product names or software licensing.
 */
import type { NoteEntry } from "@/components/system/fact";
import type { FactId } from "@/lib/facts";
import { v } from "@/lib/facts";

export type LayerId = "applications" | "models" | "infrastructure" | "chips" | "energy";

export interface Layer {
  id: LayerId;
  /** Short name for the list and the plate. */
  name: string;
  /** What the layer is at CoreValley, in one line. */
  parts: string;
  /** A sentence of what it does for you. */
  body: string;
  /** Facts this layer states, for footnotes. */
  facts: FactId[];
  href: string;
}

/** Top to bottom: the order the eye reads the drawing. */
export const LAYERS: Layer[] = [
  {
    id: "applications",
    name: "Applications",
    parts: "Fraud scoring · voice in Nepali · assistants · forecasting",
    body: "What you build: the products and services your customers use.",
    facts: [],
    href: "/use-cases",
  },
  {
    id: "models",
    name: "Models",
    parts: "Open models · your fine-tunes · your own",
    body: "Train, fine-tune and serve models with the tools you already know: JupyterLab, Kubeflow, Ray, MLflow.",
    facts: [],
    href: "/platform",
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    parts: "Datacentre · cooling · networking · storage · scheduling",
    body: "What turns chips into one machine, run by our engineers in Kathmandu.",
    facts: [],
    href: "/infrastructure",
  },
  {
    id: "chips",
    name: "Chips",
    parts: `${v("gpu.model")} · ${v("gpu.memory")} ${v("gpu.memoryType")} per GPU`,
    body: "Whole GPUs, or up to seven isolated slices of one with NVIDIA MIG.",
    facts: ["gpu.model", "gpu.memory", "gpu.migCount"],
    href: "/hardware",
  },
  {
    id: "energy",
    name: "Energy",
    parts: `${v("place.power")} · ${v("place.uptime")} facility uptime`,
    body: "Where every AI stack starts. Ours runs on Nepal's hydro-dominated grid.",
    facts: ["place.power", "place.uptime"],
    href: "/infrastructure#power",
  },
];

export const STACK = {
  kicker: "The five-layer cake",
  title: "Every layer, named.",
  continuation: "From energy to your app.",
  lead: "NVIDIA's Jensen Huang describes AI as a five-layer cake: energy, chips, infrastructure, models and applications. Here is each layer at CoreValley.",
} as const;

/** The footnote that credits the framing. */
export const STACK_NOTE: NoteEntry = {
  key: "cake",
  text: "The five layers (energy, chips, infrastructure, models, applications) are NVIDIA's framing, from Jensen Huang.",
  source: { name: "NVIDIA, “AI Is a 5-Layer Cake”", url: "https://blogs.nvidia.com/blog/ai-5-layer-cake/" },
  asOf: "2026-10-14",
};
