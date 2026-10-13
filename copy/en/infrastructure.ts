/**
 * /infrastructure — the place (docs/revamp/08 §5): power, the datacentre,
 * the network and residency. Owner-confirmed claims only, each with its
 * disclaimer (04 §2a): hydropower, 99.99 % facility uptime, < 5 ms inside
 * the valley. No address, coordinates or security arrangements.
 */
import type { Beat } from "./home";

export const INFRASTRUCTURE = {
  meta: {
    title: "Infrastructure — a hydro-powered datacentre in the Kathmandu Valley",
    description:
      "Where CoreValley runs: a datacentre in the Kathmandu Valley on Nepal's hydropower, with a 99.99 % facility uptime commitment, 400 Gb/s networking and data kept in Nepal.",
  },
  hero: {
    kicker: "Infrastructure",
    title: "The place.",
    lead: "A datacentre in the Kathmandu Valley, running on Nepal's hydropower. Where your data is stored, processed and kept.",
    portrait:
      "The Kathmandu Valley, contoured every 100 m from public elevation data (SRTM). The highlighted line is 1,400 m, near the edge of the valley floor.",
  },
  journey: {
    kicker: "From snow to token",
    title: "The whole chain,",
    continuation: "one link at a time.",
    beats: [
      {
        id: "snow",
        glyph: "snow",
        label: "Snow",
        title: "It starts as snow.",
        body: "Himalayan snow and glaciers feed Nepal's rivers through the year.",
        metric: null,
      },
      {
        id: "rivers",
        glyph: "water",
        label: "Rivers",
        title: "Rivers fall to the plains.",
        body: "They drop steeply from the mountains — the head of water that makes hydropower work.",
        metric: null,
      },
      {
        id: "turbines",
        glyph: "water",
        label: "Turbines",
        title: "Turbines turn.",
        body: "Nepal's electricity grid is built on hydropower.",
        metric: { fact: "place.gridHydro", label: "of installed capacity is hydro" },
      },
      {
        id: "grid",
        glyph: "infrastructure",
        label: "The grid",
        title: "The grid carries it to the valley.",
        body: "Power reaches the Kathmandu Valley over the national grid.",
        metric: null,
      },
      {
        id: "datacentre",
        glyph: "infrastructure",
        label: "The datacentre",
        title: "Our datacentre draws the power.",
        body: "In the Kathmandu Valley, running on Nepal's hydropower.",
        metric: { fact: "place.uptime", label: "facility uptime commitment" },
      },
      {
        id: "machine",
        glyph: "hardware",
        label: "The machine",
        title: "The power becomes compute.",
        body: "NVIDIA H200 NVL GPUs on HPE Private Cloud AI, each with",
        metric: { fact: "gpu.memory", label: "of HBM3e memory" },
      },
      {
        id: "network",
        glyph: "platform",
        label: "The network",
        title: "Data moves inside the cluster.",
        body: "NVIDIA Spectrum Ethernet connects the cluster.",
        metric: { fact: "cluster.network", label: "NVIDIA Spectrum Ethernet" },
      },
      {
        id: "answer",
        glyph: "token",
        label: "Your answer",
        title: "The answer stays close.",
        body: "Requests from inside the valley make the round trip in",
        metric: { fact: "place.latency", label: "inside the Kathmandu Valley" },
      },
    ] satisfies Beat[] as Beat[],
  },
  power: {
    kicker: "Power",
    title: "Runs on hydropower.",
    continuation: "Nepal's own.",
    lead: "Our datacentre runs on Nepal's grid, which is built on hydropower. We say it plainly and footnote it, rather than dressing it up as a certificate we don't hold.",
  },
  datacentre: {
    kicker: "The datacentre",
    title: "What we can say about the building.",
    lead: "Enough to judge it, nothing that helps anyone break in.",
    points: [
      { title: "In the Kathmandu Valley", body: "Inside the rim of the valley, in Nepal." },
      { title: "Being commissioned", body: "The first cluster is coming soon; enterprise early access is open." },
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
    lead: "Inside the cluster, 400 Gb/s NVIDIA Spectrum Ethernet. From inside the Kathmandu Valley, a round trip typically takes under five milliseconds.",
  },
  residency: {
    kicker: "Residency",
    title: "Your data stays in the valley.",
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
    leaves: {
      title: "Leaves Nepal",
      items: [
        "Signing in and software updates, through HPE GreenLake cloud (no customer data is stored there)",
        "This website, hosted on GitHub Pages in the United States",
        "Messages you send through this website's forms, relayed by FormSubmit",
        "Email to and from @corevalley.ai, hosted by Zoho Mail",
        "Calls your own code makes to services abroad — your choice, not ours",
      ],
    },
    link: { href: "/legal/data-residency", label: "The data residency commitment" },
  },
  faq: [
    {
      q: "Where exactly is the data?",
      a: "In our datacentre in the Kathmandu Valley. We don't publish the address; regulated customers get a written description of their data flows during onboarding.",
    },
    {
      q: "How fast is the network?",
      a: "Inside the cluster, 400 Gb/s NVIDIA Spectrum Ethernet. From inside the Kathmandu Valley a round trip typically takes under 5 ms; yours depends on your network and location.",
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
