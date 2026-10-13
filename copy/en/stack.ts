/**
 * "Every layer, named" — the stack from the facility to your work, each
 * layer with its real parts (docs/revamp/04 §2). Shown on the home page and
 * on /infrastructure (components/infrastructure/layer-stack.tsx). Values
 * come from lib/facts.ts; nothing here may name a part the HPE briefing or
 * the owner has not confirmed (no NVLink, no switch models, no topology).
 */
import type { FactId } from "@/lib/facts";
import { fact, v } from "@/lib/facts";

export type LayerId = "work" | "software" | "compute" | "fabric" | "facility";

export interface Layer {
  id: LayerId;
  /** Short name for the list and the plate. */
  name: string;
  /** The parts, in one line. */
  parts: string;
  /** A sentence of what it does for you. */
  body: string;
  /** Facts this layer states, for footnotes and engineer mode. */
  facts: FactId[];
  href: string;
}

const gpus = Number(v("cluster.gpus"));
const hbm = gpus * parseFloat(v("gpu.memory"));

/** Top to bottom: the order the eye reads the drawing. */
export const LAYERS: Layer[] = [
  {
    id: "work",
    name: "Your workspace",
    parts: `${v("software.workspace")} · JupyterLab, Kubeflow, Ray, Spark, MLflow, KServe`,
    body: "Notebooks, pipelines, training, serving and data tools, together in one workspace.",
    facts: ["software.workspace"],
    href: "/platform",
  },
  {
    id: "software",
    name: "AI software",
    parts: `${v("software.nvaie")} · NVIDIA NIM · ${v("cluster.platform")}`,
    body: "NVIDIA's supported AI stack and model microservices, on HPE's private cloud platform.",
    facts: ["software.nvaie", "cluster.platform"],
    href: "/platform",
  },
  {
    id: "compute",
    name: "Compute",
    parts: `${v("cluster.servers")} × ${v("server.model")} · ${gpus} × ${v("gpu.model")} · ${hbm.toLocaleString("en-US")} GB HBM3e`,
    body: `Each server: ${v("cluster.gpusPerServer")} GPUs, ${v("server.cpu")} processors, ${v("server.memory")} of memory and local NVMe.`,
    facts: ["cluster.servers", "server.model", "cluster.gpus", "gpu.memory", "server.cpu", "server.memory"],
    href: "/hardware",
  },
  {
    id: "fabric",
    name: "Network and storage",
    parts: `${v("cluster.network")} ${fact("cluster.network").label} · ${v("cluster.storage")} all-flash`,
    body: `${v("cluster.storageSystem")}: S3-compatible object and file storage, beside the GPUs.`,
    facts: ["cluster.network", "cluster.storage", "cluster.storageSystem", "cluster.storageAccess"],
    href: "/hardware",
  },
  {
    id: "facility",
    name: "The facility",
    parts: `${v("place.location")} · ${v("place.power")} · ${v("place.uptime")} facility uptime`,
    body: "A datacentre inside the rim of the valley, being commissioned now.",
    facts: ["place.location", "place.power", "place.uptime"],
    href: "/infrastructure",
  },
];

export const STACK = {
  kicker: "The stack",
  title: "Every layer, named.",
  continuation: "All of it in the valley.",
  lead: "From the building and its power to the notebook you open: every part named, every part running in the valley.",
} as const;
