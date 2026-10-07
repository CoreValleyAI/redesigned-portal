/**
 * The platform story told by /platform ("The Iceberg") and teased on the
 * homepage: the GPU above the waterline, nine operational layers below it.
 * One source for the dive's captions, the homepage teaser and structured data.
 *
 * Bodies are written for the reader who buys the result, not the stack: what
 * you get first, in plain words, at most two short sentences. The engineering
 * names live in `tags`, which render small and in mono.
 */

export interface PlatformLayer {
  title: string;
  body: string;
  tags: string;
}

export const PLATFORM_LAYERS: PlatformLayer[] = [
  {
    title: "Networking",
    body: "Every customer gets a private network, and nothing reaches your work unless you allow it. Latency inside Kathmandu stays under 5 ms.",
    tags: "vpc · cilium · egress policy · <5 ms",
  },
  {
    title: "Storage",
    body: "Your files outlive the job on replicated volumes, with fast local disks for scratch. Upload a dataset once, not every run.",
    tags: "block · object · nvme scratch",
  },
  {
    title: "Power & cooling",
    body: "Our Kathmandu datacenter runs on Nepal's hydropower. Racks stay cool, so a card holds full speed for the whole job, not just the first ten minutes.",
    tags: "hydropower · thermal · redundancy",
  },
  {
    title: "Scheduling",
    body: "Launch a pod, a notebook or an endpoint, and we put it on the right card. You get your own private Kubernetes cluster without having to run it.",
    tags: "kubernetes · vcluster · orchestration",
  },
  {
    title: "Monitoring",
    body: "Watch GPU use, job health and spend as they happen. You see the cost before the invoice does.",
    tags: "gpu metrics · traces · alerts",
  },
  {
    title: "Security & isolation",
    body: "On whole cards and hardware slices (MIG), a neighbour's crash can't reach your work. Every action lands in an audit log you can export.",
    tags: "mig · audit log · least privilege",
  },
  {
    title: "Data residency",
    body: "Your data stays in Kathmandu, and nothing is copied abroad. The jurisdiction is Nepal.",
    tags: "np-ktm-1 · in-country",
  },
  {
    title: "NPR billing",
    body: "Pay by the second, in rupees, by eSewa, Khalti, bank transfer or invoice. No dollar card, no exchange-rate surprises.",
    tags: "per second · esewa · khalti · invoice",
  },
  {
    title: "Local support",
    body: "Engineers in Kathmandu, working Nepal time. You talk to the people who run the racks.",
    tags: "kathmandu · nepal time",
  },
];

/** Steps of the dive: intro · GPU · waterline · 9 layers · whole iceberg. */
export const DIVE_STEPS = PLATFORM_LAYERS.length + 3;
