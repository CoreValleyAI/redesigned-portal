import Link from "next/link";
import { Button, Card, Icon, StatBlock } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import { Reveal, RevealGroup } from "@/components/fx/reveal";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo";
import { FaqList } from "@/components/marketing/faq-list";
import { ORG } from "@/lib/site";
import type { IconName } from "@/components/ui";

export const metadata = pageMetadata({
  title: "About CoreValley — Nepal's Sovereign AI Cloud",
  description:
    "CoreValley builds GPU infrastructure in Kathmandu so researchers, startups, banks and public bodies can train and run AI without foreign clouds, foreign currency or foreign support hours.",
  path: "/company",
});

/* Copy rule for this page: every claim is something the public site states
   or a customer can verify. Positioning and principles are the company's own
   words; hardware and payment details match the products and pricing pages. */

const PRINCIPLES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "lock",
    title: "Sovereign by default",
    body: "Infrastructure, data and support stay inside Nepal. Compliance with local regulation is a design requirement, not an add-on we bolt on for enterprise deals.",
  },
  {
    icon: "terminal",
    title: "Practical over theoretical",
    body: "We optimise for real workflows: fast environment spin-up, clear NPR pricing, and support that answers when a training job dies at night.",
  },
  {
    icon: "university",
    title: "Accessible to researchers",
    body: "University labs, individual researchers and student projects should reach serious GPUs without an enterprise procurement cycle.",
  },
  {
    icon: "check-circle",
    title: "Honest about constraints",
    body: "We publish what we actually run. Where a control is in progress or a GPU has not landed yet, we say so rather than implying otherwise.",
  },
];

const OFFER: { icon: IconName; title: string; body: string; href: string; cta: string }[] = [
  {
    icon: "notebook",
    title: "AI Lab",
    body: "Managed JupyterHub on GPUs for teams, labs and courses. Collaborative workspaces, GPU monitoring, no infrastructure expertise required.",
    href: "/products/jupyterhub",
    cta: "JupyterHub",
  },
  {
    icon: "slice",
    title: "GPU Workspace",
    body: "Full GPU environments with root access, custom images and multi-GPU scaling for fine-tuning, full training and computer vision.",
    href: "/products/gpu-pods",
    cta: "GPU pods and dedicated nodes",
  },
  {
    icon: "broadcast",
    title: "Inference & endpoints",
    body: "Shared or dedicated OpenAI-compatible endpoints with autoscaling, served with low latency from inside Nepal.",
    href: "/products/model-endpoints",
    cta: "Model endpoints",
  },
];

const AUDIENCES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "university",
    title: "Universities and researchers",
    body: "Managed notebook environments so students and faculty can work with modern models without administering a cluster or opening a foreign cloud account.",
  },
  {
    icon: "launch",
    title: "Startups and ML teams",
    body: "Full GPU pods with root access, the freedom to install what you need, and the ability to move to endpoints when you ship.",
  },
  {
    icon: "building",
    title: "Enterprises and public sector",
    body: "Isolated environments, data-residency guarantees and local support suitable for banks, healthcare, government and any regulated workload that cannot cross borders.",
  },
];

const FAQ = [
  {
    q: "Where is CoreValley hosted?",
    a: "In Kathmandu, Nepal. Compute and storage are physically located in the country, in the region we call np-ktm-1. Nothing is replicated abroad.",
  },
  {
    q: "Which GPUs do you run?",
    a: "NVIDIA H200 (141 GB HBM3e) and H100 (80 GB HBM3), whole or sliced with MIG and HAMi, are coming online through early access. RTX PRO 6000 Blackwell, L40S and L4 are on the roadmap.",
  },
  {
    q: "How do you bill?",
    a: "In Nepali rupees. On-demand usage is metered per second and invoiced monthly; monthly reserved and custom enterprise terms are available. We accept eSewa, Khalti, bank transfer and corporate invoices on net terms.",
  },
  {
    q: "Are you open to new customers?",
    a: "Yes, through early access. Tell us the model, the dataset size and the GPU hours you expect, and we size capacity with you before you commit to anything.",
  },
  {
    q: "How do I reach the team?",
    a: "Email info@corevalley.ai or use the contact form. We answer in Nepal Standard Time, usually within one business day.",
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
        lead="We exist so that researchers, startups and enterprises can develop and run AI without depending on foreign clouds, foreign currencies or foreign support hours."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink-100">
              Our mission
            </h2>
            <div className="mt-5 space-y-5 leading-relaxed text-ink-300">
              <p>
                CoreValley is building sovereign GPU infrastructure in Nepal so
                that local talent can train models, fine-tune LLMs, run
                inference and ship AI products without the cost structure or
                compliance friction of overseas providers.
              </p>
              <p>
                For too long, serious AI work in Nepal has meant shipping data
                abroad, paying in USD and waiting for support across time zones.
                That model does not serve universities, regulated industries, or
                the next generation of Nepali AI companies.
              </p>
              <p>
                The alternative is straightforward: the same class of NVIDIA
                hardware powering global AI labs, hosted in Kathmandu, billed in
                rupees, and supported by engineers who understand both the
                technology and the local context.
              </p>
            </div>
          </div>

          <Card padding={32}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-9">
              <StatBlock
                value="100%"
                label="sovereign compute"
                size="sm"
                accent
              />
              <StatBlock value="NPR" label="local billing" size="sm" />
              <StatBlock value="NPT" label="support timezone" size="sm" />
              <StatBlock value="0" label="data leaving nepal" size="sm" />
            </div>
          </Card>
        </div>
      </Section>

      <Section
        eyebrow="What we run"
        title="Three service lines, one platform."
        lead="Notebooks for teams, full GPU environments for training, and endpoints for serving — on H100 and H200 cards in Kathmandu, sharing projects, storage and keys."
        alt
      >
        <RevealGroup step={80} className="grid gap-4 md:grid-cols-3">
          {OFFER.map((o) => (
            <Card key={o.title} padding={26} className="flex h-full flex-col">
              <Icon name={o.icon} size={21} weight="duotone" className="text-ink-100" />
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink-100">
                {o.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-400">{o.body}</p>
              <Link
                href={o.href}
                className="mt-5 inline-flex items-center gap-1.5 font-mono text-[12px] tracking-wide text-hydro transition-colors duration-normal hover:text-hydro-300"
              >
                {o.cta}
                <Icon name="arrow-right" size={13} />
              </Link>
            </Card>
          ))}
        </RevealGroup>

        <Reveal>
          <dl className="mt-10 grid gap-x-10 gap-y-6 border-t border-line-subtle pt-8 sm:grid-cols-3">
            <div>
              <dt className="cv-label text-[10px]">Hardware</dt>
              <dd className="mt-2 text-sm text-ink-300">
                NVIDIA H200 and H100 today; RTX PRO 6000 Blackwell, L40S and L4 on
                the roadmap.
              </dd>
            </div>
            <div>
              <dt className="cv-label text-[10px]">Software</dt>
              <dd className="mt-2 text-sm text-ink-300">
                CUDA, cuDNN, PyTorch, TensorFlow, Jupyter, vLLM and DeepSpeed from
                first boot.
              </dd>
            </div>
            <div>
              <dt className="cv-label text-[10px]">Billing</dt>
              <dd className="mt-2 text-sm text-ink-300">
                NPR, metered per second. eSewa, Khalti, bank transfer and
                corporate invoices.
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
          which also lets each entry be as long as it needs to be. */}
      <Section eyebrow="Who we serve" title="Who we build for." alt>
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
                <h3 className="self-center text-lg font-semibold tracking-tight text-ink-100">
                  {a.title}
                </h3>
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

      <Section eyebrow="Contact" title="Where to find us." alt>
        <Reveal>
          <dl className="grid gap-x-10 gap-y-8 border-t border-line-subtle pt-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="cv-label text-[10px]">Location</dt>
              <dd className="mt-3 text-ink-200">Kathmandu Valley, Nepal</dd>
              <dd className="mt-1 font-mono text-xs text-ink-500">np-ktm-1</dd>
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
                replies within one business day
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

        <div className="mt-8 flex justify-center">
          <Link href="/contact">
            <Button
              variant="primary"
              size="lg"
              iconRight={<Icon name="arrow-right" size={17} />}
            >
              Get in touch
            </Button>
          </Link>
        </div>
      </Section>
    </>
  );
}
