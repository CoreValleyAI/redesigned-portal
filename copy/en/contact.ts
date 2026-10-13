/**
 * /contact — the Ascent (S11). Every route in starts here; only "Run AI
 * workloads" continues through the full climb. Field names are what the
 * inbox sees (FormSubmit mails them as a table), so they are readable.
 */
export const CONTACT = {
  meta: {
    title: "Request access — tell us what you want to run",
    description:
      "Request early access to NVIDIA H200 NVL GPUs in the Kathmandu Valley, or reach CoreValley for partnerships, press and support. We reply within one working day.",
  },
  hero: {
    kicker: "Contact",
    title: "Start the climb.",
    lead: "A few short questions — about a minute. We reply within one working day with a capacity plan and a firm quote in rupees.",
  },
  inbox: "info@corevalley.ai",
  routes: [
    { id: "workloads", title: "Run AI workloads", body: "GPUs, slices, storage or serving.", glyph: "hardware" },
    { id: "partner", title: "Partner with us", body: "Resellers, integrators, universities.", glyph: "company" },
    { id: "press", title: "Press", body: "Interviews and information.", glyph: "blog" },
    { id: "support", title: "Support", body: "Help with an existing request.", glyph: "services" },
    { id: "careers", title: "Careers", body: "See open roles.", glyph: "careers" },
  ],
  workloads: ["Training", "Fine-tuning", "Inference or an API", "Notebooks or teaching", "Something else"],
  durations: ["A few hours", "Days", "Weeks", "Months", "A year or more", "Not sure yet"],
  needs: [
    { id: "nepal", label: "Must stay in Nepal" },
    { id: "regulated", label: "Regulated (bank, health or government)" },
    { id: "personal", label: "Contains personal data" },
  ],
  times: ["Any time", "Mornings (NPT)", "Afternoons (NPT)"],
  steps: {
    route: "What are you here for?",
    run: "What do you want to run?",
    size: "What size, and for how long?",
    data: "Anything about your data we should know?",
    message: { partner: "Tell us about the partnership.", press: "What's the story?", support: "How can we help?" },
    you: "Who should we talk to?",
    review: "Check your answers.",
  },
  disclosure:
    "This form is delivered to our inbox by a third-party service outside Nepal. Please keep confidential details for a secure channel.",
  done: {
    title: "Request sent.",
    lead: "We reply within one working day, from Kathmandu.",
    next: [
      "We read it and check what you need against the cluster.",
      "You get a capacity plan and a firm quote in rupees.",
      "If it fits, we set you up for early access.",
    ],
  },
} as const;

export type RouteId = (typeof CONTACT.routes)[number]["id"];
