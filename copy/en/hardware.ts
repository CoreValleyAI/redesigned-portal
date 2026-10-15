/**
 * /hardware — the GPU (docs/revamp/08 §4) and where we go next. Every
 * number is a fact id.
 *
 * CTO ruling, 14 Oct 2026: the GPU is named with its headline figures only.
 * No full specification table, no GPU or server counts, no server, network
 * or storage details.
 *
 * No NVLink claims anywhere: interconnect bridges are not part of the
 * confirmed configuration (owner ruling, 13 Oct 2026).
 */
import type { FactId } from "@/lib/facts";

export const HARDWARE = {
  meta: {
    title: "Hardware — NVIDIA H200 NVL GPUs in Nepal",
    description:
      "NVIDIA H200 NVL GPUs in the Kathmandu Valley: 141 GB of HBM3e at 4.8 TB/s on every GPU, split into up to seven isolated slices with MIG. Coming soon; early access open.",
  },
  hero: {
    kicker: "Hardware",
    title: "The GPU.",
    lead: "NVIDIA H200 NVL: 141 GB of fast memory on every card, in a datacentre in the Kathmandu Valley.",
  },
  gpu: {
    kicker: "The GPU",
    title: "NVIDIA H200 NVL.",
    continuation: "The headline numbers, from NVIDIA.",
    key: ["gpu.memory", "gpu.bandwidth", "gpu.fp8", "gpu.migCount"] as FactId[],
  },
  feel: {
    kicker: "Memory you can feel",
    title: "141 GB in about 29 milliseconds.",
    lead: "At 4.8 TB/s, an H200 NVL can read its entire memory in about 29 milliseconds. A blink takes 100 to 400.",
  },
  roadmap: {
    kicker: "What comes next",
    title: "Starting with H200.",
    continuation: "Built for what follows.",
    now: { label: "Now", title: "NVIDIA H200 NVL", body: "Coming soon · enterprise early access" },
    next: { label: "Next", title: "Sixteen GPUs", body: "More H200 NVL as early-access customers come on board." },
    later: {
      label: "Later",
      title: "More GPUs",
      body: "Other NVIDIA GPUs and new generations, as demand grows.",
    },
  },
  faq: [
    {
      q: "Why the H200 NVL?",
      a: "141 GB of HBM3e at 4.8 TB/s fits large models and long contexts on a single card, and it splits into up to seven isolated MIG slices, so smaller jobs pay for a slice rather than a whole GPU.",
    },
    {
      q: "How many slices can one GPU make?",
      a: "Up to seven, each with its own memory and compute, using NVIDIA Multi-Instance GPU. See MIG slicing for how they are offered.",
    },
    {
      q: "Can we reserve several GPUs?",
      a: "Yes. Tell us what you need and we will plan it with you.",
    },
    {
      q: "Why are the Tensor Core figures so high?",
      a: "They are NVIDIA's peak figures with sparsity. Real throughput depends on the model, the precision and the code; we are happy to help you measure yours.",
    },
  ],
} as const;
