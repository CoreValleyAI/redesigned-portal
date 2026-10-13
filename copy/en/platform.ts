/**
 * /platform — the software you actually touch (docs/revamp/08 §6).
 * Owner-confirmed (13 Oct 2026): customers use HPE AI Essentials on HPE
 * Private Cloud AI, with NVIDIA AI Enterprise. Only that stack is described;
 * tool names are trademarks of their owners and appear for identification.
 */
import type { GlyphName } from "@/components/system/dot-glyph";
import type { FactId } from "@/lib/facts";

export const PLATFORM = {
  meta: {
    title: "Platform — HPE AI Essentials on HPE Private Cloud AI",
    description:
      "What you work in at CoreValley: HPE AI Essentials on HPE Private Cloud AI with NVIDIA AI Enterprise — notebooks, pipelines, training and model serving on NVIDIA H200 NVL in Nepal.",
  },
  hero: {
    kicker: "Platform",
    title: "From silicon to your notebook.",
    lead: "HPE Private Cloud AI, co-engineered by HPE and NVIDIA: NVIDIA H200 NVL GPUs and NVIDIA AI Enterprise underneath, and HPE AI Essentials — the workspace you use — on top.",
  },
  layers: {
    kicker: "The stack",
    title: "Five layers,",
    continuation: "one system.",
    items: [
      {
        id: "aie",
        name: "HPE AI Essentials",
        line: "Your workspace: notebooks, pipelines, training, serving and data tools in one place.",
        fact: null,
        touch: true,
      },
      {
        id: "nvaie",
        name: "NVIDIA AI Enterprise",
        line: "NVIDIA's AI software, including NIM microservices for serving models.",
        fact: null,
        touch: false,
      },
      {
        id: "storage",
        name: "HPE Alletra Storage MP X10000",
        line: "All-flash storage with S3-compatible object and file access.",
        fact: "cluster.storage",
        touch: false,
      },
      {
        id: "network",
        name: "NVIDIA Spectrum Ethernet",
        line: "Networking inside the cluster.",
        fact: "cluster.network",
        touch: false,
      },
      {
        id: "gpu",
        name: "NVIDIA H200 NVL",
        line: "GPUs that can be split into up to seven with MIG.",
        fact: "gpu.memory",
        touch: false,
      },
    ] satisfies { id: string; name: string; line: string; fact: FactId | null; touch: boolean }[],
  },
  tools: {
    kicker: "What you work in",
    title: "The tools you already know.",
    continuation: "Ready on day one.",
    items: [
      { name: "JupyterLab", what: "Notebooks", glyph: "docs" },
      {
        name: "Kubeflow",
        what: "ML pipelines, with Katib for tuning and Kale for turning notebooks into pipelines",
        glyph: "platform",
      },
      { name: "Airflow", what: "Scheduling workflows", glyph: "on-demand" },
      { name: "Ray", what: "Distributed compute", glyph: "mig-slicing" },
      { name: "Spark", what: "Data processing at scale", glyph: "water" },
      { name: "MLflow", what: "Experiment tracking", glyph: "blog" },
      { name: "KServe", what: "Model serving", glyph: "inferencing" },
      { name: "NVIDIA NIM", what: "Optimised microservices for popular models", glyph: "hardware" },
      { name: "Presto", what: "SQL across your data", glyph: "storage" },
      { name: "Superset", what: "Dashboards", glyph: "pricing" },
      { name: "TensorFlow", what: "A framework, ready to use", glyph: "token" },
    ] satisfies { name: string; what: string; glyph: GlyphName }[],
  },
  day: {
    kicker: "Pipelines",
    title: "Four pipelines, one cluster.",
    lead: "Example workflows in HPE AI Essentials, stage by stage. Data and models stay on the cluster from the first step to the last.",
    lines: [
      {
        id: "models",
        name: "Model operations",
        stops: [
          { tool: "JupyterLab", role: "Explore" },
          { tool: "Kubeflow", role: "Pipeline" },
          { tool: "Katib", role: "Tune" },
          { tool: "MLflow", role: "Track" },
          { tool: "KServe", role: "Serve" },
        ],
      },
      {
        id: "llm",
        name: "Language models",
        stops: [
          { tool: "NVIDIA NIM", role: "Base model" },
          { tool: "JupyterLab", role: "Evaluate" },
          { tool: "MLflow", role: "Register" },
          { tool: "KServe", role: "Endpoint" },
        ],
      },
      {
        id: "predict",
        name: "Batch predictions",
        stops: [
          { tool: "Airflow", role: "Schedule" },
          { tool: "Spark", role: "Features" },
          { tool: "Ray", role: "Inference" },
          { tool: "Storage", role: "Results · S3" },
        ],
      },
      {
        id: "data",
        name: "Data operations",
        stops: [
          { tool: "Storage", role: "Object · file" },
          { tool: "Spark", role: "Transform" },
          { tool: "Presto", role: "SQL" },
          { tool: "Superset", role: "Dashboards" },
        ],
      },
    ],
  },
  isolation: {
    kicker: "Isolation",
    title: "Boundaries you can point to.",
    items: [
      { title: "Hardware slices", body: "A MIG slice has its own memory and compute, isolated in the GPU itself." },
      { title: "Reserved means yours", body: "Reserved GPUs run only your organisation's work for the whole term." },
      { title: "In the valley", body: "Your data is stored and processed in our Kathmandu Valley datacentre." },
    ],
    link: { href: "/trust", label: "Trust and data handling" },
  },
} as const;
