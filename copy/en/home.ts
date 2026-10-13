/**
 * Home — "The valley is coming online." (docs/revamp/08 §1)
 *
 * Teasers only: every chapter states one thing and points to the page that
 * owns the subject. Numbers are fact ids (lib/facts.ts) so the page can
 * footnote them; copy budget per chapter: headline ≤ 8 words, lead ≤ 30.
 */
import type { GlyphName } from "@/components/system/dot-glyph";
import type { FactId } from "@/lib/facts";

export interface Beat {
  id: string;
  glyph: GlyphName;
  /** One or two words for the rail. */
  label: string;
  title: string;
  body: string;
  metric: { fact: FactId; label: string } | null;
}

export const HOME = {
  meta: {
    title: "CoreValley — Nepal's GPU cloud, NVIDIA H200 NVL in the Kathmandu Valley",
    description:
      "NVIDIA H200 NVL GPUs on HPE Private Cloud AI, in a hydro-powered datacentre in the Kathmandu Valley. Billed per second in NPR. Coming soon; early access open.",
  },

  hero: {
    kicker: ["Kathmandu Valley", "NVIDIA H200 NVL", "Coming soon"],
    /** "The valley is / coming online." — "online." is the lit word. */
    title: { line1: "The valley is", line2: "coming", lit: "online." },
    lead: "Nepal's GPU cloud: NVIDIA H200 NVL GPUs on HPE Private Cloud AI, in a datacentre in the Kathmandu Valley.",
    primary: { href: "/contact", label: "Request access" },
    secondary: { href: "#journey", label: "See how it works" },
    facts: [
      { value: "8 × H200 NVL", label: "in the first cluster" },
      { value: "Per second", label: "billed in rupees" },
      { value: "In the valley", label: "where your data stays" },
    ],
  },

  journey: {
    kicker: "From snow to token",
    title: "Power that starts as snow.",
    continuation: "Answers that never leave the valley.",
    beats: [
      {
        id: "snow",
        glyph: "snow",
        label: "Snow",
        title: "It starts as snow.",
        body: "Himalayan snow and glaciers feed the rivers that run through Nepal, all year round.",
        metric: null,
      },
      {
        id: "water",
        glyph: "water",
        label: "Rivers",
        title: "The rivers turn turbines.",
        body: "Nepal's electricity grid is built on hydropower.",
        metric: { fact: "place.gridHydro", label: "of installed capacity is hydro" },
      },
      {
        id: "valley",
        glyph: "infrastructure",
        label: "The valley",
        title: "The valley draws the power.",
        body: "Our datacentre in the Kathmandu Valley runs on Nepal's hydropower.",
        metric: { fact: "place.uptime", label: "facility uptime commitment" },
      },
      {
        id: "machine",
        glyph: "hardware",
        label: "The machine",
        title: "The power becomes compute.",
        body: "Eight NVIDIA H200 NVL GPUs on HPE Private Cloud AI.",
        metric: { fact: "gpu.memory", label: "of memory on every GPU" },
      },
      {
        id: "token",
        glyph: "token",
        label: "Your answer",
        title: "The compute becomes an answer.",
        body: "Your request is answered by GPUs inside the valley, close to you.",
        metric: { fact: "place.latency", label: "round trip inside the valley" },
      },
    ] satisfies Beat[] as Beat[],
    link: { href: "/infrastructure", label: "The whole journey" },
  },

  slice: {
    kicker: "One GPU, seven ways",
    title: "141 GB on one GPU.",
    continuation: "Most jobs need a slice of it.",
    lead: "NVIDIA Multi-Instance GPU splits one H200 NVL into as many as seven GPUs, each isolated in hardware. Pay for the slice, not the card.",
    readTime: "An H200 NVL reads its whole memory in about 29 milliseconds — faster than a blink.",
    link: { href: "/products/mig-slicing", label: "MIG slicing" },
  },

  rim: {
    kicker: "Residency",
    title: "Your data stays in the valley.",
    continuation: "Inside the rim, under Nepal's law.",
    lead: "Datasets, checkpoints, models, prompts and answers are stored and processed in our Kathmandu Valley datacentre. We say exactly what else leaves Nepal, and what doesn't.",
    link: { href: "/infrastructure#residency", label: "What stays, what leaves" },
  },

  meter: {
    kicker: "Billing",
    title: "Pay for the seconds you use.",
    continuation: "Not the hour you started in.",
    lead: "GPU time is billed per second, with a 60-second minimum, in Nepalese rupees. Stop the job and the meter stops with it.",
    link: { href: "/pricing", label: "How billing works" },
  },

  products: {
    kicker: "Products",
    title: "Six ways to run.",
    continuation: "One cluster in the valley.",
    link: { href: "/products", label: "Compare all six" },
  },

  stories: {
    kicker: "Built for Nepal",
    title: "Work that belongs here.",
    continuation: "Close to the people it serves.",
    link: { href: "/use-cases", label: "All use cases" },
  },

  partners: {
    line: "Built on HPE Private Cloud AI, co-engineered by HPE and NVIDIA.",
    names: ["HPE", "NVIDIA"],
    link: { href: "/hardware", label: "The machines" },
  },

  climb: {
    kicker: "Start the climb",
    title: "What are you here for?",
    lead: "Pick one. It takes about a minute.",
  },
} as const;
