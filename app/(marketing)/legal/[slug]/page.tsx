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
    lead: "What CoreValley collects, where it is stored, and who can reach it.",
    updated: "12 August 2026",
    sections: [
      {
        heading: "What we hold",
        paragraphs: [
          "Two categories, kept separate. Account data is what identifies your organisation: names, work email addresses, billing contacts, tax registration and payment references. Platform data is what your workloads produce: container images, datasets you upload, model checkpoints, logs and inference traffic.",
          "Account data is retained for as long as the account is open and for seven years afterwards, which is what Nepali company and tax law requires of us. Platform data is yours, and is deleted on request or within 30 days of account closure.",
        ],
      },
      {
        heading: "Where it lives",
        paragraphs: [
          "Both categories are stored in np-ktm-1, in Kathmandu. Neither is replicated outside Nepal. We do not operate a foreign disaster-recovery region, because a DR region abroad would defeat the reason customers choose this platform.",
        ],
        bullets: [
          "Object storage and block volumes are encrypted at rest with AES-256.",
          "Traffic to and from the control plane is TLS 1.3 only.",
          "Tenant networks are default-deny between customers, enforced by Cilium.",
        ],
      },
      {
        heading: "Who can read your data",
        paragraphs: [
          "Nobody at CoreValley reads the contents of your volumes, notebooks or inference requests as a matter of course. Engineers can access a tenant's storage only through a break-glass procedure that requires a named approver, is time-boxed, and writes an entry to the append-only audit log you can export.",
          "We do not sell data, and we do not use customer workloads or prompts to train anything.",
        ],
      },
      {
        heading: "Third parties",
        paragraphs: [
          "Payment processing is handled by eSewa, Khalti or your bank, depending on the method you choose; those providers see the transaction, not your workloads. Identity is handled by Keycloak, which we host ourselves in the same region. Product analytics are first-party and aggregate — we do not embed third-party tracking scripts on the portal.",
        ],
      },
      {
        heading: "Your requests",
        paragraphs: [
          "Write to privacy@corevalley.ai to get a copy of what we hold on your organisation, to correct it, or to have platform data deleted. We answer within 30 days, usually much sooner.",
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
    updated: "12 August 2026",
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
        heading: "Egress",
        paragraphs: [
          "Tenant networks are default-deny outbound on regulated projects. Nothing leaves your vCluster unless you write a policy that lets it, and every allowed destination is visible in the flow log. On standard projects egress is open by default, because most teams need to pull packages — it can be locked down per project from the portal at any time.",
        ],
      },
      {
        heading: "Where we are not sovereign",
        paragraphs: [
          "Being specific about the edges is the point. Three things do cross the border, and none of them carry customer data:",
        ],
        bullets: [
          "Outbound email — invoices and system notifications — is relayed through a provider with servers outside Nepal. It contains billing metadata, not workload content.",
          "Public container and package registries you choose to pull from are outside our control and outside the country; the pull is your egress, under your policy.",
          "If you call a third-party model API from inside a pod, that request leaves Nepal. The platform cannot make someone else's endpoint sovereign.",
        ],
      },
      {
        heading: "Evidence",
        paragraphs: [
          "The append-only audit log records every control-plane action against your tenant, hash-chained so gaps are detectable, and exportable as JSON from the portal. For regulated deployments we will also provide a written data-flow description and a network policy review as part of onboarding. Ask your account contact, or write to compliance@corevalley.ai.",
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
                  href="mailto:legal@corevalley.ai"
                  className="text-hydro underline decoration-hydro/40 underline-offset-4 transition-colors duration-normal hover:text-hydro-300"
                >
                  legal@corevalley.ai
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
