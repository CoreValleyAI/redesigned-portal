/**
 * /infrastructure — the place and the stack (docs/revamp/08 §5, revised 13
 * Oct 2026: the facts first — a key facts row, every layer named — and no
 * storytelling). Owner-confirmed claims only, each with its disclaimer
 * (04 §2a): hydropower, 99.99 % facility uptime, < 5 ms inside the valley.
 * No address, coordinates, topology or security arrangements, and (CTO
 * ruling, 14 Oct 2026) no GPU or server counts, server, network or storage
 * specifications.
 */

export const INFRASTRUCTURE = {
  meta: {
    title: "Infrastructure — a hydro-powered datacentre in the Kathmandu Valley",
    description:
      "Where CoreValley runs: NVIDIA H200 NVL GPUs in a datacentre in the Kathmandu Valley on Nepal's hydropower, with a 99.99 % facility uptime commitment and under 5 ms round trips inside the valley.",
  },
  hero: {
    kicker: "Infrastructure",
    title: "The place.",
    lead: "A datacentre in the Kathmandu Valley, running on Nepal's hydropower. Where your data is stored, processed and kept.",
    portrait:
      "The Kathmandu Valley, contoured every 100 m from public elevation data (SRTM). The highlighted line is 1,400 m, near the edge of the valley floor.",
  },
  facts: {
    kicker: "Key facts",
    title: "At a glance.",
  },
  capacity: {
    kicker: "Capacity",
    title: "Starting with H200 NVL.",
    continuation: "Growing from there.",
    lead: "Our first NVIDIA H200 NVL GPUs are being commissioned now. We'll scale to sixteen GPUs, then add other NVIDIA GPUs as demand grows.",
    link: { href: "/hardware", label: "The GPU" },
    steps: [
      { label: "Now", title: "NVIDIA H200 NVL", body: "Being commissioned; enterprise early access is open." },
      { label: "Next", title: "Sixteen GPUs", body: "More H200 NVL as early-access customers come on board." },
      { label: "Later", title: "More GPUs", body: "Other NVIDIA GPUs and new generations, as demand grows." },
    ],
  },
  power: {
    kicker: "Power",
    title: "Runs on hydropower.",
    continuation: "Nepal's own.",
    lead: "Our datacentre runs on Nepal's grid, which is built on hydropower. We say it plainly and footnote it, rather than dressing it up as a certificate we don't hold.",
  },
  datacentre: {
    kicker: "The facility",
    title: "What we can say about the building.",
    lead: "Enough to judge it, nothing that helps anyone break in.",
    points: [
      { title: "In the Kathmandu Valley", body: "In Nepal, close to the teams who use it." },
      { title: "Being commissioned", body: "Our first GPUs are coming soon; enterprise early access is open." },
      { title: "99.99 % facility uptime", body: "The facility's commitment for power, cooling and the building." },
      {
        title: "Details on request",
        body: "We don't publish the address or security arrangements. Regulated customers get a written description of their data flows during onboarding.",
      },
    ],
  },
  network: {
    kicker: "Network",
    title: "Under 5 ms inside the valley.",
    continuation: "At least twenty round trips in a quick blink.",
    lead: "From inside the Kathmandu Valley, a round trip to our datacentre typically takes under five milliseconds.",
  },
  residency: {
    kicker: "Residency",
    title: "Your data is safe with us.",
    continuation: "Here is exactly what that means.",
    stays: {
      title: "Stays in Nepal",
      items: [
        "Datasets and files you upload",
        "Model weights, checkpoints and adapters",
        "Prompts and answers of your endpoints",
        "Notebooks and their outputs",
        "Logs of your jobs",
      ],
    },
    note: "Nothing you upload, train or generate is copied outside Nepal. Regulated customers get a written description of their data flows during onboarding.",
    link: { href: "/legal/data-residency", label: "The data residency commitment" },
  },
  faq: [
    {
      q: "Where exactly is the data?",
      a: "In our datacentre in the Kathmandu Valley. We don't publish the address; regulated customers get a written description of their data flows during onboarding.",
    },
    {
      q: "What runs there?",
      a: "NVIDIA H200 NVL GPUs, on infrastructure built with HPE and NVIDIA. We don't publish the detailed configuration; customers get what they need during onboarding.",
    },
    {
      q: "How fast is the network?",
      a: "From inside the Kathmandu Valley a round trip typically takes under 5 ms; yours depends on your network and location.",
    },
    {
      q: "What powers the datacentre?",
      a: "Nepal's grid, which is built on hydropower.",
    },
    {
      q: "What does 99.99 % cover?",
      a: "It is the datacentre facility's availability commitment for power, cooling and building infrastructure. Service-level terms for CoreValley services are set out in your agreement.",
    },
  ],
} as const;
