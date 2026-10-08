import Link from "next/link";
import { Badge, ButtonLink, Card, Icon, StatBlock } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import { Reveal, RevealGroup } from "@/components/fx/reveal";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo";
import { FaqList } from "@/components/marketing/faq-list";
import { EARLY_ACCESS, FACTS } from "@/lib/availability";
import { ORG } from "@/lib/site";
import type { IconName } from "@/components/ui";

export const metadata = pageMetadata({
  title: "About CoreValley — Nepal's Sovereign AI Cloud",
  description:
    "CoreValley runs NVIDIA H200 GPUs in a hydro-powered Kathmandu datacenter, so Nepali teams can build AI without foreign clouds, foreign currency or foreign support hours.",
  path: "/company",
});

/* Copy rule for this page: every claim is something the public site states
   or a customer can verify. Availability, latency and power come from
   lib/availability.ts, so this page cannot drift from the home page. */

const PRINCIPLES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "lock",
    title: "Sovereign by default",
    body: "Your infrastructure, your data and your support stay in Nepal. Local compliance is a design requirement, not an add-on for enterprise deals.",
  },
  {
    icon: "terminal",
    title: "Practical over theoretical",
    body: "We optimise for real work: fast setup, firm quotes in rupees, and engineers in Kathmandu who answer in Nepal time.",
  },
  {
    icon: "university",
    title: "Accessible to researchers",
    body: "University labs and student projects should reach serious GPUs without an enterprise procurement cycle. Enterprise early access comes first; research access is next.",
  },
  {
    icon: "check-circle",
    title: "Honest about constraints",
    body: "We publish what we actually run. Today that is the NVIDIA H200. Where a GPU has not landed or a control is still in progress, we say so.",
  },
];

/* The four products, under the names the rest of the site uses. The old
   public site's names are kept as a "formerly" line so returning visitors
   recognise them. */
const OFFER: {
  icon: IconName;
  title: string;
  formerly: string;
  body: string;
  href: string;
  cta: string;
}[] = [
  {
    icon: "slice",
    title: "GPU pods",
    formerly: "formerly GPU Workspace",
    body: "Rent a whole H200 or a slice of one, with root access and your own images. Pay by the second.",
    href: "/products/gpu-pods",
    cta: "See GPU pods",
  },
  {
    icon: "notebook",
    title: "JupyterHub",
    formerly: "formerly AI Lab",
    body: "Managed GPU notebooks for teams, labs and courses. Nobody has to run a shared server.",
    href: "/products/jupyterhub",
    cta: "See JupyterHub",
  },
  {
    icon: "broadcast",
    title: "Model endpoints",
    formerly: "formerly Inference & Endpoints",
    body: "Open-weight models behind an OpenAI-compatible API, served from inside Nepal and billed per token.",
    href: "/products/model-endpoints",
    cta: "See model endpoints",
  },
  {
    icon: "node",
    title: "Dedicated & bare metal",
    formerly: "formerly part of GPU Workspace",
    body: "Whole H200 servers that only you use, reserved by the month, in your own private cluster.",
    href: "/products/dedicated",
    cta: "See dedicated servers",
  },
];

const AUDIENCES: {
  icon: IconName;
  title: string;
  body: string;
  status: { tone: "hydro" | "neutral"; label: string };
}[] = [
  {
    icon: "building",
    title: "Enterprises and public sector",
    body: "Isolated environments, data that stays in the country and engineers in Kathmandu — for banks, hospitals, government and any regulated workload that cannot cross a border.",
    status: { tone: "hydro", label: "Open now · H200" },
  },
  {
    icon: "university",
    title: "Universities and researchers",
    body: "Managed notebooks so students and faculty can work with modern models without running a cluster or opening a foreign cloud account.",
    status: { tone: "neutral", label: "Coming soon" },
  },
  {
    icon: "launch",
    title: "Startups and ML teams",
    body: "GPU pods with root access, the freedom to install what you need, and a path to endpoints when you ship.",
    status: { tone: "neutral", label: "Coming soon" },
  },
];

const FAQ = [
  {
    q: "Where is CoreValley hosted?",
    a: "In a hydro-powered datacenter in the Kathmandu Valley, Nepal — the region we call np-ktm-1. Compute and storage stay in the country. Nothing is replicated abroad.",
  },
  {
    q: "Which GPUs do you run?",
    a: "The NVIDIA H200, with 141 GB of memory, is available now through enterprise early access — as a whole card or as a slice. The RTX PRO 6000 Blackwell is coming soon, with the L40S after it.",
  },
  {
    q: "How do you bill?",
    a: "In Nepali rupees. Usage is metered per second and invoiced monthly, and dedicated servers can be reserved by the month. Pay by eSewa, Khalti, bank transfer or corporate invoice on net terms. Rates are not published yet, so every request gets a firm quote within one working day.",
  },
  {
    q: "Are you open to new customers?",
    a: "Yes. Early access is open to enterprises on NVIDIA H200 now. Tell us the model, the dataset size and the GPU hours you expect, and we size capacity with you before you commit. Universities, startups and other teams can join the list today — access for more teams is coming soon.",
  },
  {
    q: "What does early access mean?",
    a: "The H200 platform is live, and we onboard enterprise teams one at a time. You tell us the workload, we send a capacity plan and a firm rupee quote within one working day, and our team sets up your project with you. More GPUs, and access for more teams, are coming soon.",
  },
  {
    q: "Why does it matter that the GPUs are in Kathmandu?",
    a: "Two reasons. Your data never has to leave the country, and latency inside Kathmandu is under 5 ms — so an app serving users in Nepal does not wait on a round trip overseas.",
  },
  {
    q: "What powers the datacenter?",
    a: "Hydropower. Our Kathmandu datacenter runs on Nepal's hydroelectricity, so your compute is low-carbon and its power price is not tied to a gas market on another continent.",
  },
  {
    q: "How do I reach the team?",
    a: "Email info@corevalley.ai or use the contact form. We reply within one working day, in Nepal time.",
  },
];

export default function CompanyPage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd(FAQ),
          breadcrumbJsonLd([{ name: "Company", path: "/company" }]),
        ]}
      />

      <PageHero
        eyebrow="Company"
        title="Nepal's AI infrastructure, built for Nepal."
        lead="We exist so that researchers, startups and enterprises can build and run AI without foreign clouds, foreign currency or foreign support hours."
      >
        <p className="mt-8 flex items-center gap-3 font-mono text-[11.5px] tracking-label whitespace-nowrap text-ink-300 uppercase">
          <span aria-hidden="true" className="h-px w-8 shrink-0 bg-hydro" />
          <span>
            <span className="text-hydro light:text-hydro-dark">{EARLY_ACCESS.pill}</span> ·{" "}
            <span className="hidden sm:inline">enterprise&nbsp;</span>early access
          </span>
        </p>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink-100">
              Our mission
            </h2>
            <div className="mt-5 space-y-5 leading-relaxed text-ink-300">
              <p>
                CoreValley is building GPU infrastructure in Nepal, so Nepali
                teams can train models, fine-tune LLMs, run inference and ship
                AI products without sending data abroad or paying in dollars.
              </p>
              <p>
                Until now, serious AI work in Nepal has meant three
                compromises: data shipped overseas, invoices in USD, and
                support that answers while you sleep. That does not work for
                universities, for regulated industries, or for the next
                generation of Nepali AI companies.
              </p>
              <p>
                So we built the alternative: the NVIDIA H200, the same class of
                GPU the world&rsquo;s AI labs train on, in a hydro-powered
                datacenter in Kathmandu. Billed in rupees, and run by engineers
                who understand both the technology and the local context.
              </p>
            </div>
          </div>

          <Card padding={32}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-9">
              <StatBlock value="H200" label="available now" size="sm" accent />
              <StatBlock value={FACTS.latency} label={FACTS.latencyLabel} size="sm" />
              <StatBlock value="NPR" label="billed in rupees" size="sm" />
              <StatBlock value="100%" label="of your data stays in nepal" size="sm" />
            </div>
          </Card>
        </div>
      </Section>

      <Section
        eyebrow="What we run"
        title="Four products, one platform."
        lead="Notebooks for teams, GPU environments for training, endpoints for serving and dedicated servers for steady load. All on NVIDIA H200s in Kathmandu today, with Blackwell coming soon — one account, one rupee invoice."
        alt
      >
        <RevealGroup step={80} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OFFER.map((o) => (
            <Card key={o.title} padding={26} className="flex h-full flex-col">
              <Icon name={o.icon} size={21} weight="duotone" className="text-ink-100" />
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink-100">
                {o.title}
              </h3>
              <p className="mt-1 font-mono text-[11.5px] tracking-wide text-ink-500">
                {o.formerly}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-400">{o.body}</p>
              <Link
                href={o.href}
                className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-mono text-[12.5px] tracking-wide text-hydro transition-colors duration-normal hover:text-hydro-300"
              >
                {o.cta}
                <Icon name="arrow-right" size={13} />
              </Link>
            </Card>
          ))}
        </RevealGroup>

        <Reveal>
          <dl className="mt-10 grid gap-x-10 gap-y-6 border-t border-line-subtle pt-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="cv-label text-[10px]">Hardware</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-300">
                NVIDIA H200, available now. RTX PRO 6000 Blackwell coming
                soon; L40S after it.
              </dd>
            </div>
            <div>
              <dt className="cv-label text-[10px]">Software</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-300">
                Ready from first boot: CUDA, PyTorch, TensorFlow, Jupyter,
                vLLM and DeepSpeed.
              </dd>
            </div>
            <div>
              <dt className="cv-label text-[10px]">Billing</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-300">
                In rupees, metered per second. eSewa, Khalti, bank transfer or
                corporate invoice.
              </dd>
            </div>
            <div>
              <dt className="cv-label text-[10px]">Power and latency</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-300">
                A hydro-powered datacenter in Kathmandu, with{" "}
                {FACTS.latencyLong.replace(/(\d) /, "$1 ")} latency inside
                the city.
              </dd>
            </div>
          </dl>
        </Reveal>
      </Section>

      <Section eyebrow="Principles" title="What guides us.">
        <RevealGroup step={80} className="grid gap-4 md:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <Card key={p.title} padding={26} className="h-full">
              <Icon
                name={p.icon}
                size={21}
                weight="duotone"
                className="text-ink-100"
              />
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink-100">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">
                {p.body}
              </p>
            </Card>
          ))}
        </RevealGroup>
      </Section>

      {/* Three equal cards in a row was the same shape as the section above
          it and the section below it. These are three audiences, not three
          products — so they are a list with hanging icons and dividing rules,
          which also lets each entry be as long as it needs to be. Each says
          plainly whether it can get in today. */}
      <Section
        eyebrow="Who we serve"
        title="Who we build for."
        lead={EARLY_ACCESS.line}
        alt
      >
        <ul className="flex flex-col">
          {AUDIENCES.map((a, i) => (
            <Reveal as="li" key={a.title} delay={i * 80}>
              <div className="grid gap-5 border-t border-line-subtle py-9 md:grid-cols-[auto_1fr_1.4fr] md:gap-10">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-line bg-carbon-600">
                  <Icon
                    name={a.icon}
                    size={20}
                    weight="duotone"
                    className="text-ink-100"
                  />
                </span>
                <div className="flex flex-col items-start gap-2.5 self-center">
                  <h3 className="text-lg font-semibold tracking-tight text-ink-100">
                    {a.title}
                  </h3>
                  <Badge tone={a.status.tone}>{a.status.label}</Badge>
                </div>
                <p className="max-w-[56ch] self-center leading-relaxed text-ink-400">
                  {a.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Questions" title="Frequently asked.">
        <FaqList items={FAQ} />
      </Section>

      <Section eyebrow="Contact" title="Where to find us.">
        <Reveal>
          <dl className="grid gap-x-10 gap-y-8 border-t border-line-subtle pt-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="cv-label text-[10px]">Location</dt>
              <dd className="mt-3 text-ink-200">Kathmandu Valley, Nepal</dd>
              <dd className="mt-1 font-mono text-xs text-ink-500">
                np-ktm-1 · hydro-powered
              </dd>
            </div>
            <div>
              <dt className="cv-label text-[10px]">Email</dt>
              <dd className="mt-3">
                <a
                  href={`mailto:${ORG.email}`}
                  className="text-hydro underline decoration-hydro/40 underline-offset-4 transition-colors duration-normal hover:text-hydro-300"
                >
                  {ORG.email}
                </a>
              </dd>
              <dd className="mt-1 font-mono text-xs text-ink-500">
                replies within one working day
              </dd>
            </div>
            <div>
              <dt className="cv-label text-[10px]">Careers</dt>
              <dd className="mt-3">
                <a
                  href="https://www.linkedin.com/company/corevalleyai/jobs/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-hydro underline decoration-hydro/40 underline-offset-4 transition-colors duration-normal hover:text-hydro-300"
                >
                  Open roles
                  <Icon name="external" size={13} className="text-ink-500" />
                </a>
              </dd>
              <dd className="mt-1 font-mono text-xs text-ink-500">
                hiring in kathmandu
              </dd>
            </div>
            <div>
              <dt className="cv-label text-[10px]">Elsewhere</dt>
              <dd className="mt-3 flex flex-col gap-2">
                <a
                  href={ORG.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-ink-200 transition-colors duration-normal hover:text-hydro"
                >
                  LinkedIn
                  <Icon name="external" size={13} className="text-ink-500" />
                </a>
                <a
                  href={ORG.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-ink-200 transition-colors duration-normal hover:text-hydro"
                >
                  GitHub
                  <Icon name="external" size={13} className="text-ink-500" />
                </a>
              </dd>
            </div>
          </dl>
        </Reveal>

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <ButtonLink
            href="/contact"
            variant="primary"
            size="lg"
            iconRight={<Icon name="arrow-right" size={17} />}
          >
            Get early access
          </ButtonLink>
          <p className="max-w-[46ch] text-[13.5px] leading-relaxed text-ink-400">
            {EARLY_ACCESS.promise}
          </p>
        </div>
      </Section>
    </>
  );
}
