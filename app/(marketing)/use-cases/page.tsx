import Link from "next/link";
import { Badge, ButtonLink, Card, Icon, Terminal } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import type { IconName } from "@/components/ui";
import { Reveal, RevealGroup } from "@/components/fx/reveal";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo";
import { FaqList } from "@/components/marketing/faq-list";
import { EARLY_ACCESS } from "@/lib/availability";

export const metadata = pageMetadata({
  title: "AI Use Cases in Nepal — Language Models, Banking, Healthcare, Research",
  description:
    "What you can run on CoreValley's GPU cloud in Kathmandu: Nepali language models, regulated banking, clinical imaging, government AI, university research and startup products — with data that stays in Nepal.",
  path: "/use-cases",
});

/* Copy rule: outcome first, in the reader's words; the technique names stay
   in the workload chips, where the people who use them look for them. */
const CASES: {
  icon: IconName;
  sector: string;
  title: string;
  body: string;
  workloads: string[];
  why: string;
  setup: string;
  /** Set when this audience cannot get in yet. */
  soon?: boolean;
}[] = [
  {
    icon: "docs",
    sector: "Language",
    title: "Nepali and Maithili language models",
    body: "Teach models Nepali properly. Continue pre-training and instruction-tune on Devanagari text — the data that closes the gap is exactly the data that should not leave the country.",
    workloads: [
      "Continued pre-training",
      "LoRA / QLoRA",
      "SFT and DPO",
      "Tokenizer work",
    ],
    why: "Text corpora often carry personal data from local sources. Training in-country keeps where the data came from defensible.",
    setup: "H200 pods for training, then a model endpoint to serve the result.",
  },
  {
    icon: "building",
    sector: "Banking",
    title: "Regulated financial workloads",
    body: "Read KYC documents, flag suspicious transactions and score credit — for banks and finance companies under NRB supervision.",
    workloads: [
      "Document OCR",
      "Fraud detection",
      "Credit scoring",
      "Churn models",
    ],
    why: "Customer data cannot cross the border. Dedicated servers and private networking, where nothing leaves unless you allow it, make the security review answerable.",
    setup: "Dedicated H200 servers in your own private cluster, with outbound traffic blocked by default.",
  },
  {
    icon: "health",
    sector: "Healthcare",
    title: "Clinical imaging and records",
    body: "Triage radiology scans, screen retinal images and pull facts out of clinical notes — for hospitals and diagnostic chains, without exporting patient data.",
    workloads: [
      "Medical imaging",
      "Clinical NLP",
      "Segmentation",
      "Triage models",
    ],
    why: "Patient data is the least portable data there is. Where the compute sits is the whole argument.",
    setup: "GPU pods with persistent storage; dedicated capacity for production.",
  },
  {
    icon: "certificate",
    sector: "Public sector",
    title: "Government and civic AI",
    body: "Automate citizen services, digitise land records and build Nepali-language public information systems — on infrastructure inside the jurisdiction.",
    workloads: [
      "Document digitisation",
      "Speech to text",
      "Translation",
      "Chat assistants",
    ],
    why: "Sovereignty is a procurement requirement, not a preference. The infrastructure is inside Nepal.",
    setup: "Dedicated servers, plus model endpoints for public-facing assistants.",
  },
  {
    icon: "university",
    sector: "Research",
    title: "Universities and labs",
    body: "Real GPU access for students and faculty — no procurement cycle, no shared server to look after, and no foreign cloud account nobody can pay for.",
    workloads: [
      "Course notebooks",
      "Thesis research",
      "Climate and PINN work",
      "Workshops",
    ],
    why: "JupyterHub shuts idle notebooks down on its own, so a department can give forty students a GPU without forty invoices.",
    setup: "JupyterHub with a hardware slice of an H200 (MIG) for each student.",
    soon: true,
  },
  {
    icon: "launch",
    sector: "Startups",
    title: "Product teams shipping AI",
    body: "Fine-tune a small model, serve it behind an endpoint, and grow with your traffic — with costs in the currency your runway is in.",
    workloads: [
      "Fine-tuning",
      "RAG pipelines",
      "Inference endpoints",
      "Batch jobs",
    ],
    why: "Per-second billing and per-token endpoints mean the bill follows your traction instead of running ahead of it.",
    setup: "GPU pods for fine-tuning, per-token model endpoints in production.",
    soon: true,
  },
];

/* The workload families the platform is built for, each pointed at the
   product that runs it. */
const WORKLOADS: { icon: IconName; title: string; body: string; href: string }[] = [
  {
    icon: "slice",
    title: "LLM fine-tuning",
    body: "LoRA, QLoRA and full fine-tunes on whole H200 cards or slices of one.",
    href: "/products/gpu-pods",
  },
  {
    icon: "node",
    title: "Full training runs",
    body: "Eight H200s joined by NVLink in one server, and reserved dedicated capacity.",
    href: "/products/dedicated",
  },
  {
    icon: "broadcast",
    title: "Production serving",
    body: "OpenAI-compatible endpoints, shared or dedicated, that scale with your traffic.",
    href: "/products/model-endpoints",
  },
  {
    icon: "eye",
    title: "Computer vision and multimodal",
    body: "Imaging, OCR and video models, with fast local NVMe scratch space.",
    href: "/products/gpu-pods",
  },
  {
    icon: "lab",
    title: "Scientific research",
    body: "Simulation, physics-informed networks and climate work.",
    href: "/products/jupyterhub",
  },
  {
    icon: "university",
    title: "Courses and teaching",
    body: "Notebooks for a whole cohort, with per-user limits and automatic idle shutdown.",
    href: "/products/jupyterhub",
  },
];

const LIFECYCLE: { step: string; title: string; body: string }[] = [
  {
    step: "01",
    title: "Explore on a slice",
    body: "Start in JupyterHub on a slice of an H200 — a hardware slice (MIG) or a cheaper shared one (HAMi). Cheap enough to leave running while you find out whether the idea holds.",
  },
  {
    step: "02",
    title: "Train on whole cards",
    body: "Move to whole H200 cards, or a full eight-GPU server joined by NVLink for distributed runs.",
  },
  {
    step: "03",
    title: "Serve behind an endpoint",
    body: "Deploy to a model endpoint with an OpenAI-compatible API, or keep a dedicated pod running. Billed per token or per second.",
  },
  {
    step: "04",
    title: "Reserve capacity",
    body: "When load is steady, move to a reserved dedicated server and take the discount that comes with a longer term.",
  },
];

const FAQ = [
  {
    q: "Who can get access today?",
    a: "Enterprises, on NVIDIA H200, through early access. More GPUs — starting with the RTX PRO 6000 Blackwell — and access for more teams, including universities and startups, are coming soon. You can join the list now.",
  },
  {
    q: "Does my data ever leave Nepal?",
    a: "No. Compute and storage are in Kathmandu, nothing is replicated to a foreign region, and you can block all outbound traffic for a project.",
  },
  {
    q: "Can a university give a whole class GPU access?",
    a: "Yes — that is what JupyterHub is for: per-user limits, automatic idle shutdown and shared GPU slices, on one invoice. Access for universities is coming soon; join the list and we will tell you first.",
  },
  {
    q: "What does a regulated workload look like on CoreValley?",
    a: "Dedicated servers in your own private Kubernetes cluster, private networking with outbound traffic blocked by default, an append-only audit log and invoices in NPR — the pieces a bank or public body needs for a security review.",
  },
  {
    q: "How do I move from experiment to production?",
    a: "Inside one project: from a notebook slice, to whole cards, to a model endpoint or a reserved server. Same account, same rupee invoice, same country.",
  },
];

export default function UseCasesPage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd(FAQ),
          breadcrumbJsonLd([{ name: "Use cases", path: "/use-cases" }]),
        ]}
      />

      <PageHero
        eyebrow="Use cases"
        title="Work that belongs in Nepal."
        lead="The common thread is not the model. It is that the data cannot leave the country, the invoice has to be in rupees, or support has to answer in Nepal time."
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
        <RevealGroup step={80} className="grid gap-4 lg:grid-cols-2">
          {CASES.map((c) => (
            <Card key={c.title} padding={28} className="h-full">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-lg border border-line bg-carbon-600 p-2.5">
                  <Icon
                    name={c.icon}
                    size={19}
                    weight="duotone"
                    className="text-ink-100"
                  />
                </span>
                <Badge tone="neutral">{c.sector}</Badge>
                {c.soon ? (
                  <span className="label ml-auto">
                    Access coming soon
                  </span>
                ) : null}
              </div>

              <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink-100">
                {c.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-400">
                {c.body}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {c.workloads.map((w) => (
                  <span
                    key={w}
                    className="rounded-md border border-line bg-carbon-600 px-2.5 py-1 font-mono text-[11.5px] text-ink-300"
                  >
                    {w}
                  </span>
                ))}
              </div>

              <dl className="mt-5 border-t border-line-subtle pt-4">
                <div className="flex items-start gap-2.5">
                  <dt className="sr-only">Why here</dt>
                  <Icon
                    name="lock"
                    size={15}
                    className="mt-0.5 shrink-0 text-ink-300"
                  />
                  <dd className="text-[13px] leading-relaxed text-ink-400">
                    {c.why}
                  </dd>
                </div>
                <div className="mt-3 flex items-start gap-2.5">
                  <dt className="sr-only">Typical setup</dt>
                  <Icon
                    name="cpu"
                    size={15}
                    className="mt-0.5 shrink-0 text-ink-300"
                  />
                  <dd className="text-[13px] leading-relaxed text-ink-400">
                    <span className="font-mono text-[11.5px] tracking-wide text-ink-500">
                      typical setup ·{" "}
                    </span>
                    {c.setup}
                  </dd>
                </div>
              </dl>
            </Card>
          ))}
        </RevealGroup>
      </Section>

      <Section
        eyebrow="Workloads"
        title="Built for the work, not the demo."
        lead="Six kinds of workload, each with a product that runs it. All metered in rupees, all kept in Kathmandu."
        alt
      >
        <RevealGroup step={60} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WORKLOADS.map((w) => (
            <Link key={w.title} href={w.href} className="group">
              <Card
                surface="solid"
                padding={22}
                className="h-full transition-[border-color,transform] duration-normal ease-standard group-hover:border-line-strong group-hover:-translate-y-px"
              >
                <Icon name={w.icon} size={19} weight="duotone" className="text-ink-100" />
                <h3 className="mt-3 text-base font-semibold tracking-tight text-ink-100">
                  {w.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-400">{w.body}</p>
              </Card>
            </Link>
          ))}
        </RevealGroup>
      </Section>

      <Section
        eyebrow="From lab to production"
        title="One platform across the lifecycle."
        lead="The same project grows from a shared notebook to a dedicated server — without switching clouds, currencies or countries."
      >
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_0.9fr]">
          <ol className="flex flex-col gap-4">
            {LIFECYCLE.map((s, i) => (
              <Reveal as="li" key={s.step} delay={i * 80}>
                <Card surface="solid" padding={22}>
                  <div className="flex gap-4">
                    <span className="nums font-mono text-sm text-ink-500">
                      {s.step}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold tracking-tight text-ink-100">
                        {s.title}
                      </h3>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-400">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </ol>

          {/* No rates here: they are not published yet (lib/catalog.ts). */}
          <Terminal
            title="np-ktm-1.corevalley.ai — lifecycle"
            lines={[
              {
                prompt: "$",
                text: "corevalley jupyter start --profile h200-1g",
              },
              { out: "→ notebook ready · h200 1g.18gb slice" },
              {
                prompt: "$",
                text: "corevalley pods launch --gpu h200 --count 8",
              },
              { out: "→ 8× h200 · nvlink · billed per second" },
              { prompt: "$", text: "corevalley endpoints deploy nepali-7b" },
              { out: "→ live · billed per token" },
              { comment: "same project · same private cluster · same rupee invoice" },
              { prompt: "$", text: "" },
            ]}
          />
        </div>
      </Section>

      <Section eyebrow="Questions" title="Before you ask." alt>
        <FaqList items={FAQ} />
      </Section>

      <Section>
        <Card padding={40} className="text-center">
          <h2 className="display text-[clamp(1.5rem,3vw,2rem)]">
            Tell us what you&rsquo;re building.
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-300">
            A model, a dataset size and a deadline are enough for us to
            recommend a setup. We reply {EARLY_ACCESS.replyTime} with a
            capacity plan and a firm rupee quote.
          </p>
          <p className="mx-auto mt-4 max-w-[52ch] text-[14px] leading-relaxed text-ink-400">
            {EARLY_ACCESS.line}
          </p>
          <div className="mt-7 flex justify-center">
            <ButtonLink
              href="/contact"
              variant="primary"
              size="lg"
              iconRight={<Icon name="arrow-right" size={17} />}
            >
              Get early access
            </ButtonLink>
          </div>
        </Card>
      </Section>
    </>
  );
}
