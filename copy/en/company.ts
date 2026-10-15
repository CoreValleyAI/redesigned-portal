/**
 * /company — who we are and where we are going (docs/revamp/08 §10). No
 * product or pricing content (03 §3). The vision is labelled as plans,
 * never dated, never promised (01 §9).
 */
export const COMPANY = {
  meta: {
    title: "Company — built in the valley, for the valley",
    description:
      "CoreValley AI is building Nepal's GPU cloud in the Kathmandu Valley: why we exist, how we work, and where we are going.",
  },
  hero: {
    kicker: "Company",
    title: "Built in the valley,",
    continuation: "for the valley.",
    lead: "CoreValley AI is building Nepal's GPU cloud: modern AI compute in the Kathmandu Valley, run by people who live here.",
  },
  why: {
    kicker: "Why we exist",
    paragraphs: [
      "AI is becoming part of how a country works — how it speaks, banks, learns and governs. The compute behind it has mostly lived abroad, billed in dollars and governed by other countries' laws.",
      "We think Nepal should have its own: GPUs in the Kathmandu Valley, billed in rupees, holding data under Nepal's law, with engineers on Nepal time who pick up when you call.",
      "We are starting with NVIDIA H200 NVL GPUs, and building carefully from there.",
    ],
  },
  principles: {
    kicker: "How we work",
    title: "Five principles.",
    items: [
      {
        title: "Say what's true.",
        body: "Coming soon says coming soon. Every number on this site has a source and a date.",
      },
      { title: "Keep it here.", body: "Your data, our engineers and your bill — in Nepal, in rupees." },
      { title: "Make it simple.", body: "Plain words, clear terms, one place to ask." },
      { title: "Own the whole thing.", body: "From the rack to your notebook, we answer for it." },
      { title: "Build for the long run.", body: "Start right-sized, and grow with the people who use it." },
    ],
  },
  vision: {
    kicker: "Where we're going",
    title: "Plans,",
    continuation: "not promises.",
    lead: "We'll say each one when it is true.",
    items: [
      { title: "New GPU generations", body: "As they ship, and as our customers need them." },
      { title: "Larger clusters", body: "Grown with demand, in the valley." },
      { title: "A datacentre of our own", body: "One day. Not soon, and we won't pretend otherwise." },
    ],
  },
  press: {
    kicker: "Press and partners",
    title: "Talk to us.",
    lines: [
      { label: "Press", value: "info@corevalley.ai", href: "mailto:info@corevalley.ai" },
      { label: "Partners", value: "Built on NVIDIA" },
    ],
  },
  careers: {
    kicker: "Careers",
    title: "Build Nepal's AI infrastructure.",
  },
} as const;
