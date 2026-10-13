/**
 * The six things we sell — the only home of product copy (docs/revamp/03 §3).
 * /products, the product pages, the header's mega panel, the home page's
 * product chapter and the contact form's choices all read from here.
 *
 * Accuracy (docs/revamp/04 §2): customers work in HPE AI Essentials on HPE
 * Private Cloud AI, with NVIDIA AI Enterprise, on NVIDIA H200 NVL GPUs.
 * Nothing here may describe software, interconnects or terms beyond that.
 * Numbers come from lib/facts.ts by id.
 */
import type { FactId } from "@/lib/facts";
import type { GlyphName } from "@/components/system/dot-glyph";

export type ProductSlug =
  | "reserved"
  | "on-demand"
  | "inferencing"
  | "mig-slicing"
  | "storage"
  | "services";

export interface Product {
  slug: ProductSlug;
  name: string;
  /** One line for menus and cards. */
  promise: string;
  /** The hero headline (≤ 6 words). */
  tagline: string;
  /** The hero lead (≤ 30 words). */
  summary: string;
  glyph: GlyphName;
  bestFor: string;
  billing: string;
  commitment: string;
  steps: { title: string; body: string }[];
  features: { title: string; body: string }[];
  /** At most three key specs; the full sheet lives on /hardware. */
  specs: FactId[];
  faq: { q: string; a: string }[];
  meta: { title: string; description: string };
}

export const PRODUCTS: Product[] = [
  {
    slug: "reserved",
    name: "Reserved GPUs",
    promise: "H200 NVL capacity held for you, for a term.",
    tagline: "Capacity that's yours alone.",
    summary:
      "Reserve NVIDIA H200 NVL GPUs for a term you choose. They are held for your organisation the whole time, and nobody else's work runs on them.",
    glyph: "reserved",
    bestFor: "Steady training, regulated data, production",
    billing: "A fixed rate for the term, in NPR",
    commitment: "A term you choose",
    steps: [
      { title: "Tell us the work", body: "The models, the data and the deadline. A few sentences is enough." },
      {
        title: "Get a capacity plan",
        body: "GPUs, storage and term, with a firm quote in rupees within one working day.",
      },
      {
        title: "Run on capacity held for you",
        body: "Your GPUs are reserved in HPE AI Essentials from the first day of the term to the last.",
      },
    ],
    features: [
      {
        title: "Held for the whole term",
        body: "No queue and no contention: the GPUs are yours from the first day of the term to the last.",
      },
      {
        title: "From one GPU to a whole server",
        body: "Reserve a single H200 NVL, or a full HPE ProLiant DL380a Gen12 with four of them.",
      },
      {
        title: "Nobody else on your GPUs",
        body: "Reserved GPUs run only your organisation's work, which keeps tenancy questions simple.",
      },
      {
        title: "The same workspace",
        body: "Notebooks, pipelines, training and serving in HPE AI Essentials, on GPUs that are always there.",
      },
      {
        title: "Data that stays in Nepal",
        body: "Datasets, checkpoints and models stay in our datacentre in the Kathmandu Valley.",
      },
      {
        title: "Rates set by the term",
        body: "Your quote shows the rate for the term up front, in rupees, with nothing added later.",
      },
    ],
    specs: ["gpu.model", "gpu.memory", "cluster.gpusPerServer"],
    faq: [
      {
        q: "How long is a term?",
        a: "You choose. Tell us how long you need the capacity and we quote the term in rupees.",
      },
      {
        q: "Does anyone else use our GPUs?",
        a: "No. Reserved GPUs run only your organisation's work for the whole term.",
      },
      {
        q: "What do we work in?",
        a: "HPE AI Essentials on HPE Private Cloud AI, with NVIDIA AI Enterprise — the same workspace as every CoreValley product.",
      },
    ],
    meta: {
      title: "Reserved GPUs — NVIDIA H200 NVL held for your organisation",
      description:
        "Reserve NVIDIA H200 NVL GPUs in the Kathmandu Valley for a term you choose. Held for you alone, quoted in NPR, data kept in Nepal.",
    },
  },
  {
    slug: "on-demand",
    name: "On-demand GPUs",
    promise: "Whole H200 NVL GPUs when you need them, by the second.",
    tagline: "Whole GPUs, by the second.",
    summary:
      "Use an NVIDIA H200 NVL when the work needs one and stop when it's done. You pay for the seconds it runs, with a 60-second minimum, in rupees.",
    glyph: "on-demand",
    bestFor: "Experiments, fine-tunes, bursts of training",
    billing: "Per second, 60-second minimum",
    commitment: "None",
    steps: [
      { title: "Open your workspace", body: "A notebook or a pipeline in HPE AI Essentials." },
      { title: "Start on an H200 NVL", body: "One GPU, or several for a bigger job." },
      { title: "Stop, and the meter stops", body: "You pay for the seconds the work ran, in rupees." },
    ],
    features: [
      {
        title: "Billed by the second",
        body: "No rounding up to the hour. Stop the job and the meter stops with it, after a 60-second minimum.",
      },
      {
        title: "141 GB on every GPU",
        body: "Room for large models and long contexts on a single card, at 4.8 TB/s.",
      },
      {
        title: "Notebooks and pipelines",
        body: "JupyterLab, Kubeflow pipelines and Ray jobs, ready in HPE AI Essentials.",
      },
      {
        title: "No commitment",
        body: "Nothing to reserve and no contract. When the work turns steady, reserved capacity costs less.",
      },
      {
        title: "Close to your data",
        body: "Storage sits beside the GPUs in the same datacentre, so data never crosses a border to be read.",
      },
    ],
    specs: ["gpu.memory", "gpu.bandwidth", "billing.minimum"],
    faq: [
      {
        q: "What is the smallest charge?",
        a: "Sixty seconds. After that you pay for each second the work runs.",
      },
      {
        q: "Can we use more than one GPU?",
        a: "Yes. Ask for the number of GPUs a job needs when you request access, and we plan capacity for it.",
      },
    ],
    meta: {
      title: "On-demand GPUs — NVIDIA H200 NVL by the second",
      description:
        "NVIDIA H200 NVL GPUs in the Kathmandu Valley when you need them, billed per second in NPR with a 60-second minimum. Coming soon; early access open.",
    },
  },
  {
    slug: "inferencing",
    name: "Inferencing",
    promise: "Serve models in Nepal with NVIDIA NIM and KServe.",
    tagline: "Your models, served in Nepal.",
    summary:
      "Put models behind an endpoint with NVIDIA NIM microservices and KServe, on GPUs in the Kathmandu Valley. Prompts and answers are processed in Nepal.",
    glyph: "inferencing",
    bestFor: "AI features in production, internal assistants",
    billing: "GPU time or a reserved endpoint, in NPR",
    commitment: "None, or a reserved endpoint",
    steps: [
      { title: "Pick a model", body: "An NVIDIA NIM microservice for a popular open model, or your own." },
      { title: "Deploy an endpoint", body: "With NIM or KServe in HPE AI Essentials." },
      { title: "Call it from your app", body: "From inside Nepal, to GPUs inside the valley." },
    ],
    features: [
      {
        title: "NVIDIA NIM microservices",
        body: "Optimised containers for popular open models, part of NVIDIA AI Enterprise.",
      },
      {
        title: "Your own models too",
        body: "Serve fine-tuned or custom models with KServe in HPE AI Essentials.",
      },
      {
        title: "Familiar APIs",
        body: "NIM language-model endpoints follow the OpenAI API format, so existing client code carries over.",
      },
      {
        title: "Right-sized",
        body: "Smaller models can run on a MIG slice instead of a whole H200 NVL.",
      },
      {
        title: "In-country by design",
        body: "Requests are processed on GPUs inside the Kathmandu Valley, under Nepal's law.",
      },
    ],
    specs: ["software.nvaie", "gpu.memory", "place.latency"],
    faq: [
      {
        q: "Which models can we serve?",
        a: "Open models available as NVIDIA NIM microservices, and your own models through KServe. Tell us what you want to run and we confirm it fits.",
      },
      {
        q: "Do prompts leave Nepal?",
        a: "No. Endpoints run on our GPUs in the Kathmandu Valley, so prompts and answers are processed there.",
      },
    ],
    meta: {
      title: "Inferencing — serve AI models in Nepal",
      description:
        "Serve open and custom models with NVIDIA NIM and KServe on NVIDIA H200 NVL GPUs in the Kathmandu Valley. Prompts and answers processed in Nepal.",
    },
  },
  {
    slug: "mig-slicing",
    name: "MIG slicing",
    promise: "Up to seven isolated GPUs from one H200 NVL.",
    tagline: "One H200, up to seven GPUs.",
    summary:
      "NVIDIA Multi-Instance GPU splits one H200 NVL into as many as seven slices, each with its own memory and compute, isolated in hardware. Pay for the slice, not the card.",
    glyph: "mig-slicing",
    bestFor: "Notebooks, teaching, small models",
    billing: "Per second, per slice",
    commitment: "None",
    steps: [
      { title: "Choose a slice size", body: "From one seventh of an H200 NVL up to the whole card." },
      { title: "Work as on any GPU", body: "Notebooks, training and serving see the slice as a GPU of its own." },
      { title: "Grow when you need to", body: "Move the same work to whole GPUs when it outgrows the slice." },
    ],
    features: [
      {
        title: "Up to seven slices",
        body: "As small as 16.5 GB each, or fewer, larger slices when a job needs more memory.",
      },
      {
        title: "Isolated in hardware",
        body: "Each slice has its own memory and compute. A neighbour's crash or out-of-memory error never reaches yours.",
      },
      {
        title: "Sized to the job",
        body: "Run a notebook or a small model on a slice that fits, so a whole GPU never sits half idle.",
      },
      {
        title: "Made for classrooms",
        body: "Give every student or researcher an isolated GPU of their own, from one card.",
      },
    ],
    specs: ["gpu.migCount", "gpu.migSize", "gpu.memory"],
    faq: [
      {
        q: "What is MIG?",
        a: "Multi-Instance GPU, an NVIDIA feature that partitions one GPU into separate instances, each with dedicated memory and compute.",
      },
      {
        q: "How small can a slice be?",
        a: "One seventh of an H200 NVL: 16.5 GB of memory with its own share of compute.",
      },
    ],
    meta: {
      title: "MIG slicing — up to seven GPUs from one H200 NVL",
      description:
        "Split an NVIDIA H200 NVL into up to seven hardware-isolated GPU slices of 16.5 GB with NVIDIA MIG. Billed per second, per slice, in NPR.",
    },
  },
  {
    slug: "storage",
    name: "Storage",
    promise: "All-flash storage beside the GPUs, in Nepal.",
    tagline: "Your data, beside the GPUs.",
    summary:
      "All-flash storage in the same Kathmandu Valley datacentre as the GPUs, with S3-compatible object and file access. Datasets, checkpoints and models stay in Nepal.",
    glyph: "storage",
    bestFor: "Datasets, checkpoints, model weights",
    billing: "By capacity, in NPR",
    commitment: "None",
    steps: [
      { title: "Bring your data", body: "Upload once, with the S3 tools you already use." },
      { title: "Read it from every job", body: "Notebooks, pipelines and endpoints work from the same copy." },
      { title: "Keep what matters", body: "Checkpoints and models stay beside the GPUs, in Nepal." },
    ],
    features: [
      {
        title: "All flash",
        body: "HPE Alletra Storage MP X10000 — flash throughout, in the same cluster as the GPUs.",
      },
      {
        title: "S3-compatible",
        body: "Object storage that works with the S3 tools and libraries you already have, plus file access.",
      },
      {
        title: "Local NVMe for scratch",
        body: "Every GPU server also has local NVMe for fast temporary files.",
      },
      {
        title: "Stays in Nepal",
        body: "Nothing is copied abroad. Your data lives in the Kathmandu Valley.",
      },
    ],
    specs: ["cluster.storage", "cluster.storageAccess", "place.location"],
    faq: [
      {
        q: "Can we use our existing S3 tools?",
        a: "Yes. The object storage is S3-compatible, so the usual command-line tools and SDKs work.",
      },
      {
        q: "Where is the data kept?",
        a: "In our datacentre in the Kathmandu Valley, in the same cluster as the GPUs.",
      },
    ],
    meta: {
      title: "Storage — all-flash, S3-compatible, in Nepal",
      description:
        "All-flash HPE Alletra storage beside NVIDIA H200 NVL GPUs in the Kathmandu Valley, with S3-compatible object and file access. Data stays in Nepal.",
    },
  },
  {
    slug: "services",
    name: "Services & engineering",
    promise: "Engineers in Kathmandu, on your project.",
    tagline: "Engineers in Kathmandu, on your project.",
    summary:
      "Help from the people who run the cluster: sizing capacity, moving work from another cloud, getting a model trained and into production, and setting up GPUs for a class or a lab.",
    glyph: "services",
    bestFor: "Enterprises, public sector, universities",
    billing: "Scoped and quoted in NPR",
    commitment: "Per engagement",
    steps: [
      { title: "Tell us the goal", body: "A migration, a first model in production, a GPU lab for a class." },
      { title: "Agree the scope", body: "What we'll do, by when, quoted in rupees." },
      { title: "Work with us", body: "Engineers in Kathmandu, on Nepal time, alongside your team." },
    ],
    features: [
      {
        title: "Capacity planning",
        body: "Tell us the model, the data and the deadline. We size the GPUs, storage and term, and quote it in rupees.",
      },
      {
        title: "Migration from another cloud",
        body: "We help move training, data and serving to the Kathmandu Valley and check it runs the same here.",
      },
      {
        title: "From training to production",
        body: "Hands-on help to get a fine-tune running and the model behind an endpoint.",
      },
      {
        title: "GPUs for teaching and research",
        body: "GPU access for a class, a lab or a department, with an isolated slice per person.",
      },
      {
        title: "On Nepal time",
        body: "Engineers in Kathmandu, working on Nepal Standard Time (UTC+05:45).",
      },
    ],
    specs: ["place.timezone", "contact.reply"],
    faq: [
      {
        q: "Do we need services to use the GPUs?",
        a: "No. They are there for teams who want help; many will not need them.",
      },
      {
        q: "How is it priced?",
        a: "Each engagement is scoped and quoted in rupees before it starts.",
      },
    ],
    meta: {
      title: "Services & engineering — engineers in Kathmandu",
      description:
        "Capacity planning, migration, training and deployment help from CoreValley engineers in Kathmandu, on Nepal time. Scoped and quoted in NPR.",
    },
  },
];

export function productBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
