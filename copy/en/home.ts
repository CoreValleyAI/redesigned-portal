/**
 * Home — "The valley is coming online." (docs/revamp/08 §1, revised 13 Oct
 * 2026: no storytelling; each chapter states what is there, technically,
 * in the "One GPU, seven ways" pattern — a short headline, a grey
 * continuation, a lead, one clean picture).
 *
 * Teasers only: every chapter points to the page that owns the subject.
 * Numbers are fact ids (lib/facts.ts) so the page can footnote them; copy
 * budget per chapter: headline ≤ 8 words, lead ≤ 30.
 */
import type { FactId } from "@/lib/facts";

export const HOME = {
  meta: {
    title: "CoreValley — Nepal's GPU cloud, NVIDIA H200 NVL in the Kathmandu Valley",
    description:
      "NVIDIA H200 NVL GPUs in a hydro-powered datacentre in the Kathmandu Valley. Billed per second in NPR. Coming soon; early access open.",
  },

  hero: {
    kicker: ["Kathmandu Valley", "NVIDIA H200 NVL", "Coming soon"],
    /** "The valley is / coming online." — "online." is the lit word. */
    title: { line1: "The valley is", line2: "coming", lit: "online." },
    lead: "Nepal's GPU cloud: NVIDIA H200 NVL GPUs, built with HPE and NVIDIA, in a datacentre in the Kathmandu Valley.",
    primary: { href: "/contact", label: "Request access" },
    secondary: { href: "#stack", label: "See how it works" },
    facts: [
      { value: "H200 NVL", label: "NVIDIA GPUs" },
      { value: "Per second", label: "billed in rupees" },
      { value: "Safe with us", label: "your data, protected" },
    ],
  },

  builtOn: {
    label: "Built on",
    line: "NVIDIA H200 NVL GPUs, on infrastructure built with HPE",
  },

  gpu: {
    kicker: "The GPU",
    title: "141 GB on every GPU.",
    continuation: "HBM3e at 4.8 TB/s.",
    lead: "Room for large models and long contexts on a single card, Tensor Cores for FP8, BF16 and TF32, and NVIDIA's AI software on top.",
    specs: ["gpu.memory", "gpu.bandwidth", "gpu.fp8", "gpu.power"] satisfies FactId[] as FactId[],
    link: { href: "/hardware#gpu", label: "The GPU" },
  },

  slice: {
    kicker: "One GPU, seven ways",
    title: "141 GB on one GPU.",
    continuation: "Most jobs need a slice of it.",
    lead: "NVIDIA Multi-Instance GPU splits one H200 NVL into as many as seven GPUs, each isolated in hardware. Pay for the slice, not the card.",
    readTime: "An H200 NVL reads its whole memory in about 29 milliseconds — faster than a blink.",
    link: { href: "/products/mig-slicing", label: "MIG slicing" },
  },

  cases: {
    kicker: "Use cases",
    title: "Built for the work.",
    continuation: "Banks, products, classrooms.",
    lead: "Fraud scoring, voice in Nepali, private language models, training on local data — the work that should run close to home.",
    link: { href: "/use-cases", label: "All use cases" },
  },

  rim: {
    kicker: "Data protection",
    title: "Your data is safe with us.",
    continuation: "Protected at every step.",
    lead: "Your datasets, models, prompts and answers are isolated from other customers, seen only when you ask us to, and never used to train anything.",
    link: { href: "/trust", label: "How we protect it" },
  },

  billing: {
    kicker: "Billing",
    title: "Pay for the seconds you use.",
    continuation: "Not the hour you started in.",
  },

  tools: {
    kicker: "Your workspace",
    title: "The tools you already use.",
    continuation: "Ready on day one.",
    lead: "Notebooks, pipelines, training, serving and data tools in one workspace, ready when you sign in.",
    link: { href: "/platform", label: "The platform" },
    groups: [
      { name: "Notebooks and pipelines", tools: ["JupyterLab", "Kubeflow", "Kale", "Airflow"] },
      { name: "Training at scale", tools: ["Ray", "Spark", "Katib", "TensorFlow"] },
      { name: "Serving and tracking", tools: ["KServe", "MLflow", "NVIDIA NIM"] },
      { name: "Data and analytics", tools: ["Presto", "Superset"] },
    ],
  },

  products: {
    kicker: "Products",
    title: "Six ways to run.",
    continuation: "One cloud in Nepal.",
    link: { href: "/products", label: "Compare all six" },
  },

  climb: {
    kicker: "Start the climb",
    title: "What are you here for?",
    lead: "Pick one. It takes about a minute.",
  },
} as const;
