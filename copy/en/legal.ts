/**
 * The legal pages: privacy, terms and data residency.
 *
 * Plain-language summaries of how CoreValley actually works, kept to what
 * is confirmed (docs/revamp/04): the facts registry, the HPE Private Cloud
 * AI briefing and the owner's answers. Anything that belongs to a contract
 * (payment terms, service levels, notice periods) points to the customer's
 * agreement rather than inventing numbers. Each page says at the bottom
 * that it is a summary, not the contract.
 */

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalPage {
  title: string;
  lead: string;
  updated: string;
  sections: LegalSection[];
}

const UPDATED = "13 October 2026";

/** Where CoreValley's own systems depend on a service abroad: said the same
    way on every page that lists them. */
const GREENLAKE =
  "HPE GreenLake cloud, Hewlett Packard Enterprise's hosted management service, outside Nepal: the platform needs it for signing in and for software updates, and it holds the inventory of our systems and their administrators' accounts. No customer data is stored there.";

export const LEGAL: Record<"privacy" | "terms" | "data-residency", LegalPage> = {
  privacy: {
    title: "Privacy",
    lead: "What CoreValley collects when you visit this website or write to us, what we hold when your organisation uses CoreValley, where it is kept and who can see it.",
    updated: UPDATED,
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          "CoreValley AI Pvt. Ltd., Kathmandu, Nepal, is responsible for the personal data described on this page. For anything about it, write to info@corevalley.ai.",
        ],
      },
      {
        heading: "This website",
        paragraphs: [
          "This covers corevalley.ai, docs.corevalley.ai and status.corevalley.ai. They are static sites hosted on GitHub Pages, run by GitHub, Inc. in the United States. Like any web host, GitHub receives your IP address and browser details in order to serve each page, and keeps them in its server logs for security. We do not receive those logs.",
          "Beyond that, visiting these sites collects nothing about you:",
        ],
        bullets: [
          "No analytics, advertising or tracking scripts.",
          "No cookies.",
          "Fonts, images and the 3D terrain come from our own sites, not from third-party servers.",
          "Your display choices are kept in your browser's local storage, on your device only, and never sent to us: cv-theme (light or dark), cv-motion (whether motion is reduced) and cv-engineer (engineer mode).",
          "While you fill in the contact form, your answers are kept in your browser's session storage (cv-ascent), so a reload does not lose them. They are cleared when the form is sent or the tab is closed.",
        ],
      },
      {
        heading: "The contact form and email",
        paragraphs: [
          "The contact form sends what you enter: what you are writing about; for a workload, what you want to run, the product, size and duration you have in mind and any requirements for your data, or otherwise your message; and your name and work email, with your organisation, phone number and the best time to reach you if you give them. A short reference code is added so that we can find your enquiry. The form is delivered to our mailbox by FormSubmit (formsubmit.co), a third-party form service with servers outside Nepal.",
          "Email to and from any @corevalley.ai address, including enquiries from the form, is hosted by Zoho Mail, outside Nepal.",
          "We use an enquiry only to answer it and follow up. We keep it for up to two years after our last contact with you and then delete it, unless you become a customer, in which case it becomes part of your account record. Please keep confidential details out of the form; we will set up a secure channel for them.",
        ],
      },
      {
        heading: "Job applications",
        paragraphs: [
          "When you apply for a role at corevalley.ai/jobs, the form sends what you enter (your name, email, phone number, where you are based, links you add, your CV and your note) together with the role you applied for. Like the contact form, it is delivered to our mailbox by FormSubmit, with servers outside Nepal, and held in our Zoho Mail inbox.",
          "Only the people involved in hiring read applications. We keep an application for up to 12 months to consider you for that role and similar ones, then delete it, unless you join us. You can ask us to delete it sooner by writing to info@corevalley.ai.",
        ],
      },
      {
        heading: "Customer accounts",
        paragraphs: [
          "When your organisation uses CoreValley, we hold two kinds of data, kept apart. Account data identifies your organisation and its users: names, work email addresses, billing contacts, tax registration and payment references. Customer data is what your work brings and produces: datasets, model weights and checkpoints, prompts and outputs, notebooks and logs.",
          "Customer data is stored and processed on our systems in our datacentre in the Kathmandu Valley, and is not stored outside Nepal. It is yours: we delete it when you ask, or when your account closes, as set out in your agreement.",
          "Account data is kept in our own records while the account is open, and afterwards for as long as Nepali law requires. The platform's software signs users in through HPE GreenLake cloud, outside Nepal, which may process your users' sign-in details. Email about your account goes through Zoho Mail.",
          "Payments are handled by the payment provider or bank you choose. They see the transaction, not your work.",
        ],
      },
      {
        heading: "Who can see your data",
        paragraphs: [
          "We do not sell data, and we do not use customer data or prompts to train anything. Our staff look at the contents of your work only when you ask us to for support, or when the law requires it.",
        ],
      },
      {
        heading: "Data that leaves Nepal",
        paragraphs: [
          "Your datasets, models, prompts and outputs stay in Nepal. These services, used for the website, for email and to run the platform, are outside the country:",
        ],
        bullets: [
          "GitHub Pages (United States): hosts the websites and sees visitors' IP addresses.",
          "FormSubmit: delivers contact-form enquiries and job applications.",
          "Zoho Mail: hosts email for @corevalley.ai addresses.",
          GREENLAKE,
        ],
      },
      {
        heading: "Security incidents",
        paragraphs: [
          "If a security incident affects your personal data or your customer data, we will tell you within 72 hours of confirming it: what happened, what data was involved, and what we are doing about it.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "Under Nepal's Privacy Act, 2075 (2018), you can ask for a copy of the personal data we hold about you or your organisation, have it corrected, or have it deleted where we are not required to keep it. Write to info@corevalley.ai; we answer within 30 days, usually much sooner.",
        ],
      },
      {
        heading: "Children",
        paragraphs: [
          "CoreValley is a service for organisations. It is not meant for anyone under 18, and we do not knowingly collect their data.",
        ],
      },
      {
        heading: "Changes to this page",
        paragraphs: [
          "When this page changes, the date at the top changes with it. If a change affects how we handle customer data, we will email the account's contacts before it takes effect.",
        ],
      },
    ],
  },

  terms: {
    title: "Terms of service",
    lead: "A plain-language summary of the terms that cover your use of CoreValley. Your signed agreement is what binds.",
    updated: UPDATED,
    sections: [
      {
        heading: "The agreement",
        paragraphs: [
          "These terms apply between CoreValley AI Pvt. Ltd., registered in Kathmandu, and the organisation named on the account. An order form, enterprise agreement or signed statement of work overrides anything here that conflicts with it.",
        ],
      },
      {
        heading: "What you may run",
        paragraphs: [
          "Anything lawful in Nepal that does not endanger the platform or other customers. The prohibited list is short, and we enforce it:",
        ],
        bullets: [
          "Attempting to reach another customer's workloads, storage or network.",
          "Crypto mining, denial-of-service traffic, or sustained outbound scanning.",
          "Training or serving models whose stated purpose is to produce child sexual abuse material, or to target individuals for harassment.",
          "Reselling raw capacity as your own infrastructure product without a reseller agreement.",
        ],
      },
      {
        heading: "Billing",
        paragraphs: [
          "On-demand GPUs and MIG slices are billed per second of running time, with a 60-second minimum per run. Reserved capacity is held for you at a fixed rate for the term you choose. Storage is billed by the capacity you keep, and engineering services are quoted before the work starts.",
          "Prices are in Nepalese rupees. Metered usage is invoiced monthly, and VAT is applied at the statutory rate. You can pay by eSewa, Khalti, bank transfer or invoice. Payment terms are set out in your order form.",
        ],
      },
      {
        heading: "Availability",
        paragraphs: [
          "Our datacentre facility commits to 99.99 % availability of its power, cooling and building infrastructure. Service levels for CoreValley services, and any service credits, are set out in your order form or service-level agreement.",
          "We announce scheduled maintenance in advance. An urgent security fix can run sooner, and we tell you afterwards what was done.",
        ],
      },
      {
        heading: "Liability",
        paragraphs: [
          "Neither party is liable to the other for indirect or consequential loss. Our aggregate liability in any twelve-month period is capped at the fees you paid us in that period. Nothing in these terms limits liability for fraud, or for anything that cannot be limited under Nepali law.",
        ],
      },
      {
        heading: "Ending it",
        paragraphs: [
          "You can close a pay-as-you-go account at any time by writing to us; metered usage is billed up to the moment your last workload stops. Either party can end the agreement for a material breach that is not fixed after written notice. When an account closes, you have time to take your data with you before it is deleted, as set out in your agreement.",
        ],
      },
    ],
  },

  "data-residency": {
    title: "Data residency",
    lead: "The specific, checkable commitments behind “your data stays in Nepal”, and the edges where something does leave.",
    updated: UPDATED,
    sections: [
      {
        heading: "The commitment",
        paragraphs: [
          "Customer data placed on CoreValley is stored and processed on our systems in our datacentre in the Kathmandu Valley. It is not stored outside Nepal: not replicated, backed up or cached abroad.",
          "This is how the platform is built, not a setting you switch on. HPE Private Cloud AI runs in our datacentre, and there is no foreign region to schedule into.",
        ],
      },
      {
        heading: "What counts as customer data",
        paragraphs: ["Everything your work brings and produces:"],
        bullets: [
          "Datasets and files in file and object storage.",
          "Model weights, checkpoints and adapters.",
          "Container images you bring.",
          "Prompts, completions and embeddings passing through your endpoints.",
          "Notebooks and their outputs.",
          "Logs of your jobs and applications.",
        ],
      },
      {
        heading: "Where something does leave",
        paragraphs: [
          "Being specific about the edges is the point. These cross the border, and none of them store your customer data:",
        ],
        bullets: [
          GREENLAKE,
          "This website, docs.corevalley.ai and status.corevalley.ai are hosted on GitHub Pages in the United States, which sees visitors' IP addresses.",
          "Enquiries and job applications sent through the forms on this website are delivered to our inbox by FormSubmit, a third-party form service with servers outside Nepal. They carry what you type and attach, so keep confidential details for a secure channel.",
          "Email to and from @corevalley.ai addresses, including invoices and notifications, is hosted by Zoho Mail, outside Nepal. It carries what is written in the email.",
          "Public container images, packages and models you choose to download come from outside the country; the download is your traffic, under your policy.",
          "If your code calls a third-party model API, that request leaves Nepal. We cannot make someone else's service sovereign.",
        ],
      },
      {
        heading: "Evidence",
        paragraphs: [
          "For regulated deployments we provide a written description of how your data flows as part of onboarding. Ask your account contact, or write to info@corevalley.ai.",
        ],
      },
    ],
  },
};

export const LEGAL_NOTE =
  "This page is a plain-language summary of how CoreValley operates. For a contract that binds (a master agreement, a data processing agreement or a service-level agreement), write to info@corevalley.ai and we will send the current version.";
