/**
 * /solutions — CoreValley by industry, and why CoreValley (added 14 Oct
 * 2026). Six industries in the owner's words, each with the workloads it
 * runs, the products that fit and the use cases that go deeper.
 *
 * CTO ruling, 14 Oct 2026: no detailed specifications. The GPU is named
 * with its headline figures only (from lib/facts.ts); no counts, servers,
 * networking, storage systems or platform product names.
 */
import type { ProductSlug } from "./products";
import type { IndustryGlyphName } from "@/components/solutions/industry-glyph";
import type { GlyphName } from "@/components/system/dot-glyph";
import { v } from "@/lib/facts";

export interface Industry {
  /** The anchor on /solutions. */
  id: string;
  name: string;
  promise: string;
  glyph: IndustryGlyphName;
  /** What teams in this industry run, in plain words. */
  workloads: { title: string; body: string }[];
  products: ProductSlug[];
  /** Slugs in copy/en/use-cases.ts that go deeper. */
  cases: string[];
}

export const SOLUTIONS = {
  meta: {
    title: "Solutions — AI cloud for banks, insurers, retail, manufacturing, education and startups",
    description:
      "CoreValley by industry: fraud, risk and document AI for banks, underwriting and claims for insurers, recommendations and demand for retail, simulation for manufacturing, GPUs for research labs and AI-native startups — on NVIDIA H200 NVL in Nepal.",
  },
  hero: {
    kicker: "Solutions",
    title: "AI cloud for the work",
    continuation: "your industry does.",
    lead: `NVIDIA H200 NVL GPUs in Nepal, billed by the second in rupees — set up for the workloads of six industries, from fraud scoring at a bank to coursework in a classroom.`,
  },
  industries: {
    kicker: "Solutions by industry",
    title: "Six industries.",
    continuation: "One GPU cloud.",
    runsOn: "Runs on",
    cases: "Go deeper",
    items: [
      {
        id: "banking",
        name: "Banking & Financial Services",
        promise: "Fraud, risk, and document AI for BFSI.",
        glyph: "bank",
        workloads: [
          { title: "Fraud scoring", body: "Score payments and transfers as they happen, and surface linked mule accounts." },
          { title: "AML and KYC", body: "Screen names across Devanagari and Latin scripts and check identity documents." },
          { title: "Credit and risk models", body: "Train on your own lending history, on GPUs held for your institution." },
          { title: "Document AI", body: "Read loan files, statements and forms, and ask a private assistant about policy." },
        ],
        products: ["reserved", "inferencing", "services"],
        cases: ["fraud-and-kyc", "private-llm"],
      },
      {
        id: "insurance",
        name: "Insurance",
        promise: "Rethink underwriting and claims with AI.",
        glyph: "umbrella",
        workloads: [
          { title: "Claims intake", body: "Read claim forms, receipts, photos and medical documents automatically." },
          { title: "Suspicious claims", body: "Flag claims that look unusual, so reviewers start with the right ones." },
          { title: "Underwriting models", body: "Price risk from your own policy and claims history." },
          { title: "Policyholder support", body: "Answer questions in Nepali and English, around the clock." },
        ],
        products: ["inferencing", "on-demand", "services"],
        cases: ["private-llm", "voice-ai"],
      },
      {
        id: "retail",
        name: "E-commerce & Retail",
        promise: "AI for recommendations, pricing, and demand.",
        glyph: "bag",
        workloads: [
          { title: "Recommendations", body: "Suggest the next product from your catalogue and order history." },
          { title: "Pricing and promotions", body: "Model prices and offers before they go live." },
          { title: "Demand forecasting", body: "By product, store and season — Dashain and Tihar included." },
          { title: "Search and support", body: "Product search and chat that understand Nepali." },
        ],
        products: ["on-demand", "inferencing", "mig-slicing"],
        cases: ["startups", "language-ai"],
      },
      {
        id: "manufacturing",
        name: "Manufacturing",
        promise: "AI for design, simulation, and smart factories.",
        glyph: "factory",
        workloads: [
          { title: "Design and simulation", body: "Run simulations and design studies that need large GPU memory." },
          { title: "Visual inspection", body: "Find defects in camera feeds from the line." },
          { title: "Predictive maintenance", body: "Spot failing machines early from their sensor data." },
          { title: "Production and energy forecasts", body: "Plan output and power use a day or a season ahead." },
        ],
        products: ["reserved", "on-demand", "services"],
        cases: ["hydropower-forecasting", "model-training"],
      },
      {
        id: "education",
        name: "Technical Education & Research",
        promise: "AI Cloud for research labs and learning.",
        glyph: "cap",
        workloads: [
          { title: "A GPU for every student", body: "An isolated slice of a GPU each, in a notebook, for coursework." },
          { title: "Research runs", body: "Thesis and lab training runs on whole GPUs, without queueing abroad." },
          { title: "Local datasets", body: "Nepali language and Himalayan science data, kept with the lab." },
          { title: "Workshops and AI skills", body: "Hands-on programmes, with our engineers alongside." },
        ],
        products: ["mig-slicing", "on-demand", "services"],
        cases: ["universities", "himalayan-hazards", "language-ai"],
      },
      {
        id: "startups",
        name: "Digital & AI Native Startups",
        promise: "Scalable AI Cloud for AI-native teams.",
        glyph: "rocket",
        workloads: [
          { title: "Start on a slice", body: "Prototype on part of a GPU, then move to whole GPUs as you grow." },
          { title: "Fine-tune open models", body: "Adapt open models to your data and your customers' language." },
          { title: "Serve your product", body: "Put your model behind an endpoint your app can call." },
          { title: "Pay in rupees", body: "Per-second billing in NPR, with no dollar card needed." },
        ],
        products: ["mig-slicing", "on-demand", "inferencing"],
        cases: ["startups", "model-training"],
      },
    ] satisfies Industry[],
  },
  why: {
    kicker: "Why CoreValley",
    title: "Why CoreValley.",
    continuation: "Six reasons, plainly.",
    items: [
      {
        glyph: "hardware",
        title: v("gpu.model"),
        body: `${v("gpu.memory")} of ${v("gpu.memoryType")} on every GPU, read at ${v("gpu.bandwidth")}: room for large models and long contexts on a single card.`,
        note: null,
      },
      {
        glyph: "mig-slicing",
        title: "Pay for the slice",
        body: `NVIDIA Multi-Instance GPU splits one GPU into up to ${v("gpu.migCount")} isolated GPUs. Start on a slice, grow into whole cards.`,
        note: null,
      },
      {
        glyph: "on-demand",
        title: "By the second, in rupees",
        body: `Billed per second in Nepalese rupees, with a ${v("billing.minimum")} minimum. Pay by ${v("billing.rails")} — no dollar card.`,
        note: null,
      },
      {
        glyph: "trust",
        title: "Your data, safe with us",
        body: "Slices are isolated in the GPU itself and reserved GPUs run only your work. We never train on your data, and we look only when you ask.",
        note: null,
      },
      {
        glyph: "services",
        title: "Close to you",
        body: `${v("place.latency")} round trip inside the Kathmandu Valley, and engineers who work Nepal time.`,
        note: "place.latency",
      },
      {
        glyph: "water",
        title: "Runs on hydropower",
        body: "Our datacentre runs on Nepal's grid, which is built on hydropower.",
        note: "place.power",
      },
    ] satisfies { glyph: GlyphName; title: string; body: string; note: "place.latency" | "place.power" | null }[],
    link: { href: "/trust", label: "Trust and data handling" },
  },
  cta: {
    title: "Tell us what your industry needs.",
    continuation: "We'll plan it with you.",
    action: { href: "/contact?intent=workloads&topic=use-case", label: "Talk to us" },
    secondary: { href: "/products", label: "See the products" },
  },
} as const;
