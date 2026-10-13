/**
 * /hardware — the machines (docs/revamp/08 §4). The only home of GPU specs,
 * the cluster and the roadmap (03 §3). Every number is a fact id.
 *
 * No NVLink claims anywhere: interconnect bridges are not part of the
 * confirmed configuration (owner ruling, 13 Oct 2026).
 */
import type { FactId } from "@/lib/facts";

export const HARDWARE = {
  meta: {
    title: "Hardware — NVIDIA H200 NVL on HPE Private Cloud AI",
    description:
      "Eight NVIDIA H200 NVL GPUs in two HPE ProLiant DL380a Gen12 servers, on HPE Private Cloud AI with 400 Gb/s NVIDIA Spectrum networking and 62 TB of all-flash storage.",
  },
  hero: {
    kicker: "Hardware",
    title: "The machines.",
    lead: "What runs first: eight NVIDIA H200 NVL GPUs in two HPE ProLiant DL380a Gen12 servers, on HPE Private Cloud AI, co-engineered by HPE and NVIDIA.",
  },
  machine: {
    kicker: "The server",
    title: "One HPE ProLiant DL380a Gen12,",
    continuation: "layer by layer.",
    layers: [
      {
        id: "chassis",
        title: "The chassis",
        body: "An HPE ProLiant DL380a Gen12, built for accelerators — two of them in the first cluster.",
        fact: "cluster.servers" as FactId,
        caption: "GPU servers",
      },
      {
        id: "gpus",
        title: "Four GPUs",
        body: "Four NVIDIA H200 NVL GPUs in each server: PCIe, dual-slot, air-cooled.",
        fact: "cluster.gpusPerServer" as FactId,
        caption: "H200 NVL per server",
      },
      {
        id: "memory",
        title: "GPU memory",
        body: "Each H200 NVL carries HBM3e memory, read at 4.8 terabytes a second.",
        fact: "gpu.memory" as FactId,
        caption: "HBM3e per GPU",
      },
      {
        id: "host",
        title: "The host",
        body: "Two Intel Xeon 6 processors and a terabyte of system memory feed the GPUs; local NVMe holds scratch data.",
        fact: "server.memory" as FactId,
        caption: "system memory per server",
      },
      {
        id: "network",
        title: "The network",
        body: "400 Gb/s NVIDIA Spectrum Ethernet connects the cluster.",
        fact: "cluster.network" as FactId,
        caption: "NVIDIA Spectrum Ethernet",
      },
    ],
  },
  gpu: {
    kicker: "The GPU",
    title: "NVIDIA H200 NVL.",
    continuation: "The numbers, from NVIDIA's datasheet.",
    key: ["gpu.memory", "gpu.bandwidth", "gpu.fp8", "gpu.bf16", "gpu.migCount", "gpu.power"] as FactId[],
    full: [
      "gpu.model",
      "gpu.memory",
      "gpu.memoryType",
      "gpu.bandwidth",
      "gpu.fp8",
      "gpu.bf16",
      "gpu.tf32",
      "gpu.fp32",
      "gpu.fp64",
      "gpu.fp64Tensor",
      "gpu.migCount",
      "gpu.migSize",
      "gpu.power",
      "gpu.formFactor",
      "gpu.pcie",
      "gpu.decoders",
      "gpu.confidential",
    ] as FactId[],
  },
  feel: {
    kicker: "Memory you can feel",
    title: "141 GB in about 29 milliseconds.",
    lead: "At 4.8 TB/s, an H200 NVL can read its entire memory in about 29 milliseconds. A blink takes 100 to 400.",
  },
  cluster: {
    kicker: "The cluster",
    title: "HPE Private Cloud AI.",
    continuation: "Built as one system.",
    lead: "The first CoreValley cluster is a complete HPE Private Cloud AI system: GPU servers, a control plane, all-flash storage and NVIDIA networking, with NVIDIA AI Enterprise and HPE AI Essentials on top.",
    rows: ["cluster.gpus", "cluster.servers", "server.cpu", "server.memory", "cluster.network", "cluster.storage", "cluster.storageAccess", "software.nvaie"] as FactId[],
  },
  roadmap: {
    kicker: "What comes next",
    title: "Starting with H200.",
    continuation: "Built for what follows.",
    now: { label: "Now", title: "NVIDIA H200 NVL", body: "Coming soon · enterprise early access" },
    next: { label: "Next", fact: "roadmap.next" as FactId, body: "No date yet" },
    later: { label: "Later", title: "New generations as they ship", body: "We'll add GPU generations and larger clusters as demand grows." },
  },
  faq: [
    {
      q: "What is the difference between H200 NVL and H200 SXM?",
      a: "Both have 141 GB of HBM3e at 4.8 TB/s. The NVL is a PCIe card for standard servers, air-cooled, up to 600 W, and splits into up to seven 16.5 GB MIG instances; the SXM module sits on NVIDIA HGX boards, runs up to 700 W, and its MIG instances are 18 GB.",
    },
    {
      q: "How many slices can one GPU make?",
      a: "Up to seven, each with its own memory and compute, using NVIDIA Multi-Instance GPU. See MIG slicing for how they are offered.",
    },
    {
      q: "Can we reserve a whole server?",
      a: "Yes. A server holds four H200 NVL GPUs; tell us what you need and we will plan it with you.",
    },
    {
      q: "Why are the Tensor Core figures so high?",
      a: "They are NVIDIA's peak figures with sparsity. Real throughput depends on the model, the precision and the code; we are happy to help you measure yours.",
    },
  ],
} as const;
