/**
 * Copy and figures. Every number is one the live site already publishes:
 * GPU figures from NVIDIA's datasheets (see lib/gpu-specs.ts in the site),
 * the rest from corevalley.ai's own pages. Nothing here is invented for the
 * draft; if a figure is not on the site, it is not on this page.
 */

export const SITE = "https://corevalley.ai";

export const GPUS = [
  {
    id: "h200",
    name: "NVIDIA H200",
    arch: "Hopper · SXM5",
    role: "Large-model training and long-context inference",
    specs: [
      { k: "Memory", v: "141 GB", sub: "HBM3e" },
      { k: "Bandwidth", v: "4.8 TB/s", sub: "memory" },
      { k: "FP8", v: "3,958", sub: "TFLOPS, with sparsity" },
      { k: "Interconnect", v: "900 GB/s", sub: "NVLink" },
    ],
    mig: "Up to 7 MIG slices of 18 GB",
  },
  {
    id: "rtx-pro-6000",
    name: "NVIDIA RTX PRO 6000 Blackwell",
    arch: "Blackwell · Server Edition",
    role: "Inference, fine-tuning, rendering and visual AI",
    specs: [
      { k: "Memory", v: "96 GB", sub: "GDDR7 ECC" },
      { k: "Bandwidth", v: "1.6 TB/s", sub: "memory" },
      { k: "FP4", v: "4,000", sub: "TFLOPS, as published" },
      { k: "Host link", v: "PCIe Gen5", sub: "x16" },
    ],
    mig: "Up to 4 MIG slices of 24 GB",
  },
] as const;

/* A metric is a number that counts up, or a `text` shown as is. The
   InfiniBand tile names the fabric without a link speed: add the speed here
   once it is confirmed. */
export const RIVER_METRICS: { value: number; unit: string; label: string; decimals: number; text?: string }[] = [
  { value: 900, unit: "GB/s", label: "NVLink between H200s", decimals: 0 },
  { value: 0, unit: "", label: "Fabric between GPU nodes", decimals: 0, text: "InfiniBand" },
  { value: 4.8, unit: "TB/s", label: "HBM3e bandwidth per H200", decimals: 1 },
  { value: 0, unit: "", label: "Copies replicated abroad", decimals: 0 },
];

export const SCALE_STEPS = [
  {
    n: "01",
    title: "Start on a slice.",
    body: "A MIG partition of an H200, billed by the second. Enough to fine-tune a 7B model tonight and shut it down by morning.",
    cmd: "corevalley pods launch --gpu h200 --slice 2g.35gb",
  },
  {
    n: "02",
    title: "Graduate to whole cards.",
    body: "The same image, the same volume, the same API key, on a full card, and on four of them when the job outgrows one.",
    cmd: "corevalley pods launch --gpu h200 --count 4",
  },
  {
    n: "03",
    title: "Reserve the rack.",
    body: "Dedicated nodes on a private vcluster, reserved by the month, with the same meter and the same audit log.",
    cmd: "corevalley dedicated reserve --nodes 4 --term 1m",
  },
] as const;

export const LAYERS = [
  { title: "Networking", tags: "vpc · cilium · egress policy" },
  { title: "Storage", tags: "block · object · nvme scratch" },
  { title: "Power & cooling", tags: "hydro grid · thermal · redundancy" },
  { title: "Orchestration", tags: "kubernetes · vcluster · scheduling" },
  { title: "Monitoring", tags: "gpu metrics · traces · alerts" },
  { title: "Security & isolation", tags: "mig · audit log · least access" },
  { title: "Data residency", tags: "np-ktm-1 · in-country" },
  { title: "NPR billing", tags: "per second · esewa · khalti · invoice" },
  { title: "Local support", tags: "kathmandu · nepal time" },
] as const;

export const SOVEREIGN = [
  {
    icon: "pin",
    title: "Data stays in Nepal",
    body: "Compute and storage sit in Kathmandu. Nothing is replicated abroad, and the jurisdiction is Nepal.",
    tag: "np-ktm-1",
  },
  {
    icon: "wallet",
    title: "Billed in rupees",
    body: "Metered per second, invoiced in NPR. No dollar cards, no FX surprises, no procurement friction.",
    tag: "esewa · khalti · invoice",
  },
  {
    icon: "support",
    title: "Support on Nepal time",
    body: "Engineers in Kathmandu. You talk to the people who run the racks, in your working hours.",
    tag: "kathmandu · npt",
  },
] as const;
