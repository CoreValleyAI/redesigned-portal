import Link from "next/link";
import { Button, Card, Icon, StatBlock } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import { Reveal, RevealGroup } from "@/components/fx/reveal";
import type { IconName } from "@/components/ui";

export const metadata = {
  title: "Company",
  description:
    "CoreValley builds sovereign GPU infrastructure in Nepal so local teams can train, fine-tune and deploy AI without depending on foreign clouds.",
};

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
    body: "Isolated environments, data-residency guarantees and local support suitable for regulated industries and government use cases.",
  },
];

export default function CompanyPage() {
  return (
    <>
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
                The alternative is straightforward: high-performance NVIDIA
                compute hosted in Kathmandu, billed in rupees, drawing on
                Himalayan hydroelectricity, supported by engineers who
                understand both the technology and the local context.
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

      <Section eyebrow="Principles" title="What guides us." alt>
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
      <Section eyebrow="Who we serve" title="Who we build for.">
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

      <Section eyebrow="Contact" title="Where to find us." alt>
        <Reveal>
          <dl className="grid gap-x-10 gap-y-8 border-t border-line-subtle pt-10 sm:grid-cols-3">
            <div>
              <dt className="cv-label text-[10px]">Location</dt>
              <dd className="mt-3 text-ink-200">Kathmandu Valley, Nepal</dd>
              <dd className="mt-1 font-mono text-xs text-ink-500">np-ktm-1</dd>
            </div>
            <div>
              <dt className="cv-label text-[10px]">Email</dt>
              <dd className="mt-3">
                <a
                  href="mailto:info@corevalley.ai"
                  className="text-hydro underline decoration-hydro/40 underline-offset-4 transition-colors duration-normal hover:text-hydro-300"
                >
                  info@corevalley.ai
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
