/**
 * /pricing — how the money works (docs/revamp/08 §8). The only home of the
 * billing model, payment methods and the quote; the reply promise may appear
 * here (03 §3). No rates until they are published.
 */
import type { ProductSlug } from "./products";

export const PRICING = {
  meta: {
    title: "Pricing — billed by the second, in Nepalese rupees",
    description:
      "How CoreValley billing works: GPU time per second with a 60-second minimum, reserved terms at a fixed rate, storage by capacity — all in NPR, paid by eSewa, Khalti, bank transfer or invoice.",
  },
  hero: {
    kicker: "Pricing",
    title: "Billed by the second, in rupees.",
    lead: "Rates are being finalised. Tell us what you want to run and we reply within one working day with a capacity plan and a firm quote in rupees.",
  },
  billing: {
    kicker: "Billing",
    title: "Per second, in rupees.",
    continuation: "Nothing rounded up.",
  },
  payFor: {
    kicker: "What you pay for",
    title: "Four things, plainly.",
    items: [
      {
        title: "GPU time",
        body: "On-demand GPUs and MIG slices, per second of running time, with a 60-second minimum.",
      },
      { title: "Reserved terms", body: "Capacity held for you, at a fixed rate for the term you choose." },
      { title: "Storage", body: "The capacity you keep beside the GPUs." },
      { title: "Services", body: "Engineering work, scoped and quoted before it starts." },
    ],
  },
  never: {
    kicker: "What you never pay for",
    title: "No small print.",
    items: [
      { title: "Waiting", body: "Time in a queue before your job starts." },
      { title: "After you stop", body: "The meter stops with the job." },
      { title: "Rounding up", body: "No rounding to the next hour." },
      { title: "Currency conversion", body: "You are billed in rupees, so there is no exchange-rate margin." },
    ],
  },
  pay: {
    kicker: "How you pay",
    title: "In rupees, the way you already pay.",
    methods: ["eSewa", "Khalti", "Bank transfer", "Invoice"],
    note: "Metered usage is invoiced monthly in Nepalese rupees. VAT is applied at the statutory rate.",
  },
  quote: {
    kicker: "Get a quote",
    title: "Sketch the plan.",
    continuation: "We send the quote.",
    lead: "A few quick answers. We turn them into a capacity plan and a firm rupee quote within one working day.",
  },
  faq: [
    {
      q: "When will rates be published?",
      a: "They are being finalised. Until then, every request gets a firm quote in rupees within one working day.",
    },
    {
      q: "How does per-second billing work?",
      a: "On-demand GPUs and MIG slices are metered for each second they run, with a 60-second minimum per run. Stop the job and the meter stops with it.",
    },
    {
      q: "Which currency, and how do we pay?",
      a: "Nepalese rupees. Pay by eSewa, Khalti, bank transfer or invoice.",
    },
    {
      q: "Is there a minimum commitment?",
      a: "Not for on-demand GPUs or MIG slices. Reserved capacity is held for the term you choose.",
    },
    {
      q: "Do you offer pricing for universities?",
      a: "Tell us about your institution and the course or research, and we will quote for it.",
    },
  ],
} as const;

/** The quote console's questions (components/pricing/quote-builder.tsx). */
export const QUOTE = {
  steps: {
    what: "What will you run on?",
    whatHint: "Pick one; you can change it later.",
    gpus: "How many GPUs?",
    gpusHint: "Pick one to four, or more for anything larger.",
    slices: "How many slices?",
    slicesHint: "Up to seven isolated slices per GPU.",
    storage: "How much storage?",
    storageHint: "Fast storage, beside the GPUs.",
    duration: "For how long?",
    workload: "What kind of work?",
  },
} as const;

export const QUOTE_PRODUCTS: {
  slug: ProductSlug;
  label: string;
  /** How it is sized and billed, in a few words. */
  unitLabel: string;
  unit: "gpus" | "slices" | "tb" | "none";
}[] = [
  { slug: "on-demand", label: "On-demand GPUs", unitLabel: "Whole GPUs · per second", unit: "gpus" },
  { slug: "reserved", label: "Reserved GPUs", unitLabel: "Held for you · fixed term", unit: "gpus" },
  { slug: "mig-slicing", label: "MIG slices", unitLabel: "Up to 7 per GPU · per second", unit: "slices" },
  { slug: "inferencing", label: "Inferencing", unitLabel: "Models served in Nepal", unit: "gpus" },
  { slug: "storage", label: "Storage", unitLabel: "By capacity", unit: "tb" },
  { slug: "services", label: "Services", unitLabel: "Engineers · scoped first", unit: "none" },
];

/** Ids are the contact form's own duration answers (copy/en/contact.ts). */
export const QUOTE_DURATIONS = [
  { id: "A few hours", label: "Hours", short: "Hours" },
  { id: "Days", label: "Days", short: "Days" },
  { id: "Weeks", label: "Weeks", short: "Weeks" },
  { id: "Months", label: "Months", short: "Months" },
  { id: "A year or more", label: "A year +", short: "1 yr +" },
] as const;

export const QUOTE_STORAGE = [
  { id: "under-1tb", label: "Under 1 TB", short: "< 1 TB" },
  { id: "1-10tb", label: "1–10 TB", short: "1–10" },
  { id: "10tb-plus", label: "10 TB +", short: "10 +" },
] as const;

export const QUOTE_WORKLOADS = [
  { id: "training", label: "Training", short: "Train" },
  { id: "fine-tuning", label: "Fine-tuning", short: "Tune" },
  { id: "inference", label: "Inference", short: "Serve" },
  { id: "research", label: "Research", short: "Research" },
] as const;
