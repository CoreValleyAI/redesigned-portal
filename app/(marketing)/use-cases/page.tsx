import Link from "next/link";
import { Badge, Button, Card, Icon, Terminal } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import type { IconName } from "@/components/ui";
import { Reveal, RevealGroup } from "@/components/fx/reveal";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/lib/seo";
import { FaqList } from "@/components/marketing/faq-list";

export const metadata = pageMetadata({
  title: "AI Use Cases in Nepal — Language Models, Banking, Healthcare, Research",
  description:
    "What teams run on CoreValley's GPU cloud in Kathmandu: Nepali and Maithili language models, regulated banking workloads, clinical imaging, government AI, university research and startup inference — with data that stays in Nepal.",
  path: "/use-cases",
});

const CASES: {
  icon: IconName;
  sector: string;
  title: string;
  body: string;
  workloads: string[];
  why: string;
  setup: string;
}[] = [
  {
    icon: "docs",
    sector: "Language",
    title: "Nepali and Maithili language models",
    body: "Continued pre-training and instruction tuning on Devanagari corpora. Nepali is under-represented in frontier models, and the data needed to fix that is exactly the data that should not leave the country.",
    workloads: [
      "Continued pre-training",
      "LoRA / QLoRA",
      "SFT and DPO",
      "Tokenizer work",
    ],
    why: "Corpora often carry personal data from local sources. Training in-country keeps provenance defensible.",
    setup: "H200 pods for training, a model endpoint to serve the result.",
  },
  {
    icon: "building",
    sector: "Banking",
    title: "Regulated financial workloads",
    body: "KYC document understanding, transaction monitoring and credit models for banks and finance companies operating under NRB supervision.",
    workloads: [
      "Document OCR",
      "Fraud detection",
      "Credit scoring",
      "Churn models",
    ],
    why: "Customer data cannot cross a border. Dedicated nodes and default-deny networking make the security review answerable.",
    setup: "Dedicated nodes on a private vCluster with egress default-denied.",
  },
  {
    icon: "health",
    sector: "Healthcare",
    title: "Clinical imaging and records",
    body: "Radiology triage, retinal screening and clinical note extraction for hospitals and diagnostic chains, on infrastructure that never exports patient data.",
    workloads: [
      "Medical imaging",
      "Clinical NLP",
      "Segmentation",
      "Triage models",
    ],
    why: "Patient data is the least portable data there is. Physical location of compute is the whole argument.",
    setup: "GPU pods with persistent volumes; dedicated capacity for production.",
  },
  {
    icon: "certificate",
    sector: "Public sector",
    title: "Government and civic AI",
    body: "Citizen service automation, land-records digitisation and Nepali-language public information systems, run on sovereign infrastructure.",
    workloads: [
      "Document digitisation",
      "Speech to text",
      "Translation",
      "Chat assistants",
    ],
    why: "Sovereignty is a procurement requirement, not a preference. The infrastructure is inside the jurisdiction.",
    setup: "Dedicated nodes, plus model endpoints for public-facing assistants.",
  },
  {
    icon: "university",
    sector: "Research",
    title: "Universities and labs",
    body: "Real GPU access for students and faculty without procurement cycles, shared server administration or a foreign cloud account nobody can pay for.",
    workloads: [
      "Course notebooks",
      "Thesis research",
      "Climate and PINN work",
      "Workshops",
    ],
    why: "JupyterHub with idle culling means a department can give forty students a GPU without forty invoices.",
    setup: "AI Lab: managed JupyterHub with MIG slice profiles per cohort.",
  },
  {
    icon: "launch",
    sector: "Startups",
    title: "Product teams shipping AI",
    body: "Fine-tune a small model, serve it behind an endpoint, and scale as traffic grows — with costs in the currency your runway is denominated in.",
    workloads: [
      "Fine-tuning",
      "RAG pipelines",
      "Inference endpoints",
      "Batch jobs",
    ],
    why: "Per-second billing and per-token endpoints mean the bill tracks traction rather than leading it.",
    setup: "GPU pods for fine-tuning, per-token model endpoints in production.",
  },
];

/* The workload families the platform is built for, as the public site lists
   them, each pointed at the product that runs it. */
const WORKLOADS: { icon: IconName; title: string; body: string; href: string }[] = [
  {
    icon: "slice",
    title: "LLM fine-tuning",
    body: "LoRA, QLoRA and full fine-tunes on H100 and H200 pods.",
    href: "/products/gpu-pods",
  },
  {
    icon: "node",
    title: "Full training runs",
    body: "Multi-GPU NVLink nodes and reserved dedicated capacity.",
    href: "/products/dedicated",
  },
  {
    icon: "broadcast",
    title: "Production serving",
    body: "OpenAI-compatible endpoints, shared or dedicated, autoscaled.",
    href: "/products/model-endpoints",
  },
  {
    icon: "eye",
    title: "Computer vision and multimodal",
    body: "Imaging, OCR and video models with local NVMe scratch.",
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
    body: "Cohort notebooks with per-user limits and idle culling.",
    href: "/products/jupyterhub",
  },
];

const FAQ = [
  {
    q: "Does my data ever leave Nepal?",
    a: "No. Compute and storage are in Kathmandu, and egress can be default-denied per project. Nothing is replicated to a foreign region.",
  },
  {
    q: "Can a university give a whole class GPU access?",
    a: "Yes. AI Lab is managed JupyterHub with spawner profiles, per-user limits and idle culling, so a department can run a course on shared MIG slices with one invoice.",
  },
  {
    q: "What does a regulated workload look like on CoreValley?",
    a: "Dedicated nodes on a private vCluster, default-deny tenant networking, an append-only audit log and NPR invoicing — the pieces a bank or public body needs for a security review.",
  },
  {
    q: "How do I move from experiment to production?",
    a: "The same project moves from a shared notebook slice to whole cards to a model endpoint or a reserved node, without changing provider, currency or jurisdiction.",
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
        title="What teams actually run here."
        lead="The common thread is not the model architecture. It is that the data cannot leave, the invoice has to be in rupees, or the support has to answer in Nepal time."
      />

      <Section>
        <RevealGroup step={80} className="grid gap-4 lg:grid-cols-2">
          {CASES.map((c) => (
            <Card key={c.title} padding={28} className="h-full">
              <div className="flex items-center gap-3">
                <span className="inline-flex rounded-lg border border-line bg-carbon-600 p-2.5">
                  <Icon
                    name={c.icon}
                    size={19}
                    weight="duotone"
                    className="text-ink-100"
                  />
                </span>
                <Badge tone="neutral">{c.sector}</Badge>
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
                  <dd className="text-[12.5px] leading-relaxed text-ink-400">
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
                  <dd className="text-[12.5px] leading-relaxed text-ink-400">
                    <span className="font-mono text-[11px] tracking-wide text-ink-500">
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
        lead="Six families of workload, each with a product that runs it. Every one is metered in rupees and stays in Kathmandu."
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
        lead="The same project moves from a shared notebook to a dedicated node without changing provider, currency or jurisdiction."
      >
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_0.9fr]">
          <ol className="flex flex-col gap-4">
            {[
              {
                step: "01",
                title: "Explore on a shared slice",
                body: "Start in JupyterHub on a MIG or HAMi slice. Cheap enough to leave running while you work out whether the idea holds.",
              },
              {
                step: "02",
                title: "Train on whole cards",
                body: "Move to exclusive H100 or H200 pods, or a full eight-GPU NVLink node for distributed runs.",
              },
              {
                step: "03",
                title: "Serve behind an endpoint",
                body: "Deploy to a model endpoint on vLLM, or keep a dedicated pod running. Metered per token or per second.",
              },
              {
                step: "04",
                title: "Reserve capacity",
                body: "When load is steady, move to a reserved dedicated node and take the term discount.",
              },
            ].map((s, i) => (
              <Reveal as="li" key={s.step} delay={i * 80}>
                <Card surface="solid" padding={22}>
                  <div className="flex gap-4">
                    <span className="nums font-mono text-sm text-ink-600">
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

          <Terminal
            title="np-ktm-1.corevalley.ai — lifecycle"
            lines={[
              {
                prompt: "$",
                text: "corevalley jupyter start --profile h200-1g",
              },
              { out: "→ notebook ready · NPR 84/hr" },
              {
                prompt: "$",
                text: "corevalley pods launch --gpu h200 --count 8",
              },
              { out: "→ 8x h200 nvlink · NPR 3,180/hr" },
              { prompt: "$", text: "corevalley endpoints deploy nepali-7b" },
              { out: "→ live · billed per token" },
              { comment: "same project · same vcluster · same invoice" },
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
            Tell us what you are building.
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-300">
            Most conversations start with a model, a dataset size and a
            deadline. That is enough for us to recommend a tier.
          </p>
          <div className="mt-7 flex justify-center">
            <Link href="/contact">
              <Button
                variant="primary"
                size="lg"
                iconRight={<Icon name="arrow-right" size={17} />}
              >
                Contact sales
              </Button>
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
