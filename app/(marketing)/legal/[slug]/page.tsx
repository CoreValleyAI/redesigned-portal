import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/fx/reveal";
import { pageMetadata } from "@/lib/seo";

/**
 * The three legal pages the footer links to.
 *
 * These exist because the footer links to them, and a footer that links to a
 * 404 is worse than a footer with no legal section. The content is an honest
 * summary of how the platform actually works — it is NOT a substitute for
 * counsel-reviewed policy, and `reviewNote` says so on every page rather than
 * pretending otherwise.
 *
 * Content lives in this map rather than MDX for the same reason /docs does:
 * it keeps the route working end to end without adding a content pipeline
 * nobody has asked for.
 */

interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

interface LegalPage {
  title: string;
  lead: string;
  updated: string;
  sections: LegalSection[];
}

const PAGES: Record<string, LegalPage> = {
  privacy: {
    title: "Privacy",
    lead: "What CoreValley collects when you visit this website or use the platform, where it is kept, and who can see it.",
    updated: "9 October 2026",
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
          "Fonts and images come from our own sites, not from third-party servers.",
          "One setting is stored in your browser: cv-theme, which remembers whether you chose the light or dark theme. It stays on your device and is never sent to us.",
        ],
      },
      {
        heading: "The contact form and email",
        paragraphs: [
          "The contact form sends what you enter: your name, work email, organisation, what you are interested in, estimated GPU hours, your message and, if you came from the pricing page, the configuration you chose. It is delivered to our mailbox by FormSubmit (formsubmit.co), a third-party form service with servers outside Nepal.",
          "Email to and from any @corevalley.ai address, including enquiries from the form, is hosted by Zoho Mail, outside Nepal.",
          "We use an enquiry only to answer it and follow up. We keep it for up to two years after our last contact with you and then delete it, unless you become a customer, in which case it becomes part of your account record. Please keep confidential details out of the form; we will set up a secure channel for them.",
        ],
      },
      {
        heading: "Customer accounts",
        paragraphs: [
          "If your organisation uses the platform, we hold two kinds of data, kept separate. Account data identifies your organisation: names, work email addresses, billing contacts, tax registration and payment references. Platform data is what your workloads produce: container images, datasets you upload, model checkpoints, logs and inference traffic.",
          "Both are stored in np-ktm-1, in Kathmandu, and are not replicated outside Nepal. Account data is kept while the account is open and afterwards for as long as Nepali law requires. Platform data is yours: we delete it when you ask, or when your account closes, as set out in your agreement.",
          "Payments are handled by the payment provider or bank you choose. They see the transaction, not your workloads.",
        ],
      },
      {
        heading: "Who can see your data",
        paragraphs: [
          "We do not sell data, and we do not use customer workloads or prompts to train anything. Our staff look at the contents of your workloads only when you ask us to for support, or when the law requires it.",
        ],
      },
      {
        heading: "Data that leaves Nepal",
        paragraphs: [
          "Customer workload data stays in Nepal. These services, used for the website and for email, are outside the country:",
        ],
        bullets: [
          "GitHub Pages (United States): hosts the websites and sees visitors' IP addresses.",
          "FormSubmit: delivers contact-form enquiries.",
          "Zoho Mail: hosts email for @corevalley.ai addresses.",
        ],
      },
      {
        heading: "Security incidents",
        paragraphs: [
          "If a security incident affects your personal data or your platform data, we will tell you within 72 hours of confirming it: what happened, what data was involved, and what we are doing about it.",
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
    lead: "The agreement that covers your use of CoreValley compute.",
    updated: "12 August 2026",
    sections: [
      {
        heading: "The agreement",
        paragraphs: [
          "These terms apply between CoreValley AI Pvt. Ltd., registered in Kathmandu, and the organisation named on the account. An order form, enterprise agreement or signed SOW overrides anything here that conflicts with it.",
        ],
      },
      {
        heading: "What you may run",
        paragraphs: [
          "Anything lawful in Nepal that does not endanger the platform or other tenants. Concretely, the prohibited list is short and we enforce it:",
        ],
        bullets: [
          "Attempting to reach another tenant's workloads, storage or network.",
          "Crypto mining, distributed denial-of-service traffic, or sustained outbound scanning.",
          "Training or serving models whose stated purpose is to produce child sexual abuse material, or to target individuals for harassment.",
          "Reselling raw capacity as your own infrastructure product without a reseller agreement.",
        ],
      },
      {
        heading: "Billing",
        paragraphs: [
          "GPU pods are metered per second of running time; endpoints are metered per token. Metered usage for a calendar month is invoiced in Nepalese rupees on the first working day of the next month, payable within 30 days. VAT is applied at the statutory rate.",
          "Reserved and dedicated terms are billed in advance for the committed period. Committed capacity is not refundable mid-term, but it can be moved between SKUs of equal or greater value.",
          "An invoice unpaid after 45 days suspends new launches. Running workloads are given 7 days' written notice before suspension, so a production endpoint is never cut off without warning.",
        ],
      },
      {
        heading: "Availability",
        paragraphs: [
          "np-ktm-1 targets 99.5% monthly availability of the control plane for all tiers, and 99.9% for Dedicated and Sovereign tiers under a signed SLA. Service credits, where an SLA applies, are the sole remedy for missed availability.",
          "Scheduled maintenance is announced at least 72 hours ahead and runs inside a published window. Emergency maintenance — a kernel or firmware fix with an active exploit — can run sooner, and we will say what it was afterwards.",
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
          "You can close a pay-as-you-go account at any time from the portal; you are billed for metered usage up to the moment the last workload stops. We can terminate for material breach after 14 days' written notice, if the breach is still unfixed. On termination you have 30 days to retrieve your data before it is deleted.",
        ],
      },
    ],
  },

  "data-residency": {
    title: "Data residency",
    lead: "The specific, checkable commitments behind the word sovereign.",
    updated: "9 October 2026",
    sections: [
      {
        heading: "The commitment",
        paragraphs: [
          "Customer data placed on CoreValley is processed and stored inside Nepal, in the np-ktm-1 region in Kathmandu. It is not replicated, backed up, cached or failed over to infrastructure outside the country.",
          "This is a property of how the platform is built, not a setting you enable. There is no foreign region to accidentally schedule into.",
        ],
      },
      {
        heading: "What counts as customer data",
        paragraphs: [
          "Everything your workload touches:",
        ],
        bullets: [
          "Datasets and files on block or object storage.",
          "Model weights, checkpoints and adapters.",
          "Container images you push to the registry.",
          "Prompts, completions and embeddings passing through model endpoints.",
          "Notebook state and JupyterHub home directories.",
          "Pod stdout, stderr and application logs.",
        ],
      },
      {
        heading: "Where we are not sovereign",
        paragraphs: [
          "Being specific about the edges is the point. These do cross the border, and none of them carry customer workload data:",
        ],
        bullets: [
          "This website, docs.corevalley.ai and status.corevalley.ai are hosted on GitHub Pages in the United States, which sees visitors' IP addresses. No customer data is on them.",
          "Enquiries sent through the contact form on this website are delivered to our inbox by FormSubmit, a third-party form service with servers outside Nepal. They carry what you type into the form, so keep confidential details for a secure channel.",
          "Email to and from @corevalley.ai addresses, including invoices and notifications, is hosted by Zoho Mail, outside Nepal. It carries what is written in the email, not workload content.",
          "Public container and package registries you choose to pull from are outside our control and outside the country; the pull is your egress, under your policy.",
          "If you call a third-party model API from inside a pod, that request leaves Nepal. The platform cannot make someone else's endpoint sovereign.",
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

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.lead, path: `/legal/${slug}` });
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <>
      <PageHero eyebrow="Legal" title={page.title} lead={page.lead}>
        <p className="mt-8 font-mono text-[11.5px] tracking-wide text-ink-600">
          last updated {page.updated}
        </p>
      </PageHero>

      <div className="mx-auto max-w-page-xl px-5 py-20 md:px-10 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[220px_1fr] lg:gap-20">
          {/* Section index. Sticky on desktop; on mobile it would just be the
              same list twice, so it is hidden rather than stacked. */}
          <nav
            aria-label="On this page"
            className="hidden lg:sticky lg:top-28 lg:block lg:self-start"
          >
            <p className="cv-label text-[10px]">On this page</p>
            <ul className="mt-5 flex flex-col gap-3">
              {page.sections.map((s) => (
                <li key={s.heading}>
                  <a
                    href={`#${slugify(s.heading)}`}
                    className="text-[13px] text-ink-500 transition-colors duration-normal hover:text-ink-100"
                  >
                    {s.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <article className="max-w-[68ch]">
            {page.sections.map((s, i) => (
              <Reveal
                as="section"
                key={s.heading}
                delay={Math.min(i, 4) * 60}
                id={slugify(s.heading)}
                /* scroll-mt clears the sticky header; without it an anchor
                   jump parks the heading underneath the nav bar. */
                className="scroll-mt-28 border-t border-line-subtle py-10 first:border-t-0 first:pt-0"
              >
                <h2 className="text-[1.3rem] font-semibold tracking-tight text-ink-100">
                  {s.heading}
                </h2>
                {s.paragraphs.map((p) => (
                  <p key={p} className="mt-4 leading-relaxed text-ink-300">
                    {p}
                  </p>
                ))}
                {s.bullets ? (
                  <ul className="mt-5 flex flex-col gap-3">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex gap-3 leading-relaxed text-ink-300">
                        <Icon
                          name="check"
                          size={13}
                          className="mt-1.5 shrink-0 text-ink-600"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Reveal>
            ))}

            {/* Said plainly, at the bottom of every legal page, because a
                summary presented as a contract is how people get hurt. */}
            <aside className="mt-12 rounded-lg border border-line bg-carbon-800/60 px-6 py-5">
              <p className="text-[13.5px] leading-relaxed text-ink-400">
                This page is a plain-language summary of how the platform
                operates. For a contract that binds — an MSA, a DPA, or a
                signed SLA — write to{" "}
                <a
                  href="mailto:info@corevalley.ai"
                  className="text-hydro underline decoration-hydro/40 underline-offset-4 transition-colors duration-normal hover:text-hydro-300"
                >
                  info@corevalley.ai
                </a>{" "}
                and we will send the current executed version.
              </p>
            </aside>

            <Link
              href="/"
              className="group mt-10 inline-flex items-center gap-2 font-mono text-[12.5px] tracking-wide text-ink-400 transition-colors duration-normal hover:text-ink-100"
            >
              <Icon
                name="arrow-right"
                size={14}
                className="rotate-180 transition-transform duration-normal ease-out group-hover:-translate-x-1"
              />
              back to home
            </Link>
          </article>
        </div>
      </div>
    </>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
