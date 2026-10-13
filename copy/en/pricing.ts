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
  meter: {
    kicker: "The meter",
    title: "The meter runs while your job does.",
    continuation: "Not a second longer.",
  },
  payFor: {
    kicker: "What you pay for",
    title: "Four things, plainly.",
    items: [
      { title: "GPU time", body: "On-demand GPUs and MIG slices, per second of running time, with a 60-second minimum." },
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
    title: "Sketch it in three answers.",
    lead: "We turn this into a capacity plan and a firm rupee quote within one working day.",
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

export const QUOTE_PRODUCTS: { slug: ProductSlug; label: string; unit: "gpus" | "slices" | "tb" | "none" }[] = [
  { slug: "on-demand", label: "On-demand GPUs", unit: "gpus" },
  { slug: "reserved", label: "Reserved GPUs", unit: "gpus" },
  { slug: "mig-slicing", label: "MIG slices", unit: "slices" },
  { slug: "inferencing", label: "Inferencing", unit: "gpus" },
  { slug: "storage", label: "Storage", unit: "none" },
  { slug: "services", label: "Services", unit: "none" },
];

export const QUOTE_DURATIONS = ["A few hours", "Days", "Weeks", "Months", "A year or more"] as const;
