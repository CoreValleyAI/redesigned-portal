/**
 * /trust — for the security review (docs/revamp/08 §9). Plain words, and
 * only what is true: the data handling here matches the privacy and data
 * residency pages. Certifications are listed only with the owner's
 * confirmation (open question Q8); until then their status shows as
 * "to confirm" on staging and blocks the production build.
 */
export const TRUST = {
  meta: {
    title: "Trust — security, data handling and compliance status",
    description:
      "How CoreValley handles your data: stored and processed in the Kathmandu Valley, isolated in hardware, accessed only when you ask. Our subprocessors, incident promise and how to report a vulnerability.",
  },
  hero: {
    kicker: "Trust",
    title: "Trust, in plain words.",
    lead: "Where your data lives, who can see it, what we have certified and what we haven't yet. We are early, and this page says exactly where we stand.",
  },
  approach: {
    kicker: "Our approach",
    title: "Four commitments.",
    items: [
      {
        title: "Your data stays in the valley",
        body: "Workload data is stored and processed in our Kathmandu Valley datacentre, and is not replicated outside Nepal.",
      },
      {
        title: "Isolation you can point to",
        body: "MIG slices are isolated in the GPU itself; reserved GPUs run only your organisation's work.",
      },
      {
        title: "We look only when you ask",
        body: "Our staff look at the contents of your workloads only when you ask us to for support, or when the law requires it.",
      },
      {
        title: "We tell you within 72 hours",
        body: "If an incident affects your data, we tell you within 72 hours of confirming it: what happened, what was involved and what we are doing.",
      },
    ],
  },
  compliance: {
    kicker: "Compliance status",
    title: "Certifications, with dates.",
    lead: "Each one is listed with its date once we hold it. Until then it says so — we never imply a certificate we don't have.",
    items: [
      { name: "ISO/IEC 27001", what: "Information security management" },
      { name: "Datacentre tier certification", what: "The facility's design and operation" },
      { name: "Government cloud listing", what: "Nepal's list of approved cloud and datacentre providers" },
    ],
    status: "To be confirmed",
  },
  data: {
    kicker: "Data handling",
    title: "What we keep, and where.",
    rows: [
      {
        label: "Account data",
        value:
          "Names, work emails, billing contacts and payment references. Kept in Nepal while the account is open, and afterwards as long as Nepali law requires.",
      },
      {
        label: "Workload data",
        value:
          "Datasets, models, checkpoints, prompts, outputs and logs. Stored and processed in the Kathmandu Valley; deleted when you ask or when your account closes, as set out in your agreement.",
      },
      {
        label: "Training on your data",
        value: "Never. We do not sell data, and we do not use customer workloads or prompts to train anything.",
      },
    ],
  },
  subprocessors: {
    kicker: "Subprocessors",
    title: "Who else touches anything.",
    lead: "None of these see your workload data.",
    items: [
      { name: "GitHub, Inc.", role: "Hosts this website (GitHub Pages)", where: "United States" },
      { name: "FormSubmit", role: "Relays messages sent through this website's forms", where: "Outside Nepal" },
      { name: "Zoho Mail", role: "Email for @corevalley.ai addresses", where: "Outside Nepal" },
      { name: "Cloudflare", role: "DNS for corevalley.ai", where: "Global network" },
    ],
  },
  disclosure: {
    kicker: "Responsible disclosure",
    title: "Found a vulnerability?",
    body: "Write to info@corevalley.ai with the details. Our security contact is also published in security.txt.",
  },
} as const;
