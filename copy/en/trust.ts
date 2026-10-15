/**
 * /trust — for the security review (docs/revamp/08 §9). Plain words, and
 * only what is true: the data handling here matches the privacy and data
 * residency pages. Certifications appear only once the owner confirms
 * them (open question Q8), each with its date.
 */
export const TRUST = {
  meta: {
    title: "Trust — security and data handling",
    description:
      "How CoreValley keeps your data safe: stored and processed in Nepal, isolated in hardware, accessed only when you ask. Our subprocessors, incident promise and how to report a vulnerability.",
  },
  hero: {
    kicker: "Trust",
    title: "Trust, in plain words.",
    lead: "Where your data lives, who can see it, and how to reach us about security. We are early, and this page says exactly where we stand.",
  },
  approach: {
    kicker: "Our approach",
    title: "Four commitments.",
    items: [
      {
        title: "Your data is safe with us",
        body: "Workload data is stored and processed in our own datacentre in Nepal, and is not replicated outside Nepal.",
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
  data: {
    kicker: "Data handling",
    title: "What we keep, and where.",
    rows: [
      {
        label: "Account data",
        value:
          "Names, work emails, billing contacts and payment references. Kept in our own records while the account is open, and afterwards as long as Nepali law requires. Signing in goes through HPE GreenLake cloud and email through our email provider, both outside Nepal.",
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
      {
        name: "Hewlett Packard Enterprise",
        role: "HPE GreenLake cloud: signing in and software updates for the platform",
        where: "Outside Nepal",
      },
      { name: "Website and email providers", role: "Serve this website, deliver its forms and host our email", where: "Outside Nepal" },
    ],
  },
  disclosure: {
    kicker: "Responsible disclosure",
    title: "Found a vulnerability?",
    body: "Write to info@corevalley.ai with the details. Our security contact is also published in security.txt.",
  },
} as const;
