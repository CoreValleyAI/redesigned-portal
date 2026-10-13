import { ValleyPortrait } from "@/components/art/valley-portrait";
import { HpeLogo, NvidiaLogo } from "@/components/brand/partner-logos";
import { ClusterDiagram } from "@/components/hardware/visuals";
import { LayerStack } from "@/components/infrastructure/layer-stack";
import { RimDrag } from "@/components/infrastructure/rim-drag";
import { Page } from "@/components/motion/page";
import { BlinkBar } from "@/components/system/blink-bar";
import { Cta } from "@/components/system/cta";
import { createNotes, F, NoteList, NoteRef } from "@/components/system/fact";
import { Faq } from "@/components/system/faq";
import { KeyFacts } from "@/components/system/key-facts";
import { Kicker } from "@/components/system/kicker";
import { SectionHead } from "@/components/system/section";
import { SpecReadout } from "@/components/system/spec-readout";
import { Status } from "@/components/system/status";
import { TextLink } from "@/components/system/text-link";
import { INFRASTRUCTURE } from "@/copy/en/infrastructure";
import { STACK } from "@/copy/en/stack";
import { fact, v } from "@/lib/facts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: INFRASTRUCTURE.meta.title,
  description: INFRASTRUCTURE.meta.description,
  path: "/infrastructure",
});

const fmt = (n: number, digits = 0) => n.toLocaleString("en-US", { maximumFractionDigits: digits });

export default function InfrastructurePage() {
  const p = INFRASTRUCTURE;
  const gpus = Number(v("cluster.gpus"));
  const servers = Number(v("cluster.servers"));
  const hbm = gpus * parseFloat(v("gpu.memory"));
  const bandwidth = gpus * parseFloat(v("gpu.bandwidth"));
  const fp8 = (gpus * parseFloat(v("gpu.fp8").replace(/,/g, ""))) / 1000;
  const memory = servers * parseFloat(v("server.memory"));

  const notes = createNotes([
    "place.power",
    "place.gridHydro",
    "place.uptime",
    "place.latency",
    {
      key: "totals",
      text: `Totals are the per-GPU figures from NVIDIA's datasheet multiplied by the ${gpus} GPUs of the first cluster: ${v("gpu.memory")} and ${v("gpu.bandwidth")} each.`,
      source: fact("gpu.memory").source,
      asOf: fact("gpu.memory").asOf,
    },
    {
      key: "fp8",
      text: `The sum of NVIDIA's per-GPU peak, ${v("gpu.fp8")} FP8 Tensor Core with sparsity, across ${gpus} GPUs. A peak figure, not a benchmark.`,
      source: fact("gpu.fp8").source,
      asOf: fact("gpu.fp8").asOf,
    },
  ]);

  const cluster = [
    { label: "GPUs", value: `${gpus} × H200 NVL`, caption: v("gpu.formFactor") },
    { label: "GPU memory", value: <>{fmt(hbm)} GB</>, caption: "HBM3e in total", note: "totals" },
    {
      label: "Memory bandwidth",
      value: <>{fmt(bandwidth, 1)} TB/s</>,
      caption: "summed across the GPUs",
      note: "totals",
    },
    { label: "FP8 Tensor Core", value: <>{fmt(fp8, 1)} PFLOPS</>, caption: "peak, with sparsity", note: "fp8" },
    { label: "Servers", value: `${servers} × DL380a Gen12`, caption: "HPE ProLiant" },
    {
      label: "Processors and memory",
      value: `${servers * 2} × Xeon 6 · ${fmt(memory)} TB`,
      caption: "Intel Xeon 6; system memory",
    },
    { label: "Fabric", value: v("cluster.network"), caption: fact("cluster.network").label },
    { label: "Storage", value: v("cluster.storage"), caption: "usable all-flash, S3 and file" },
  ];

  return (
    <Page>
      {/* Hero */}
      <section className="relative pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))] pb-[clamp(3rem,7vw,6rem)]">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
          <div className="flex flex-col gap-6">
            <Kicker>{p.hero.kicker}</Kicker>
            <h1 className="type-display-1">{p.hero.title}</h1>
            <p className="type-lead measure text-ink-2">{p.hero.lead}</p>
            <Status id="region" />
            <div className="mt-4 flex items-center gap-6 text-ink-2">
              <NvidiaLogo className="h-6" />
              <span aria-hidden="true" className="h-6 w-px bg-line-strong" />
              <HpeLogo className="h-5" />
            </div>
          </div>
          <figure className="flex flex-col gap-3" data-parallax="0.05">
            <ValleyPortrait className="aspect-[640/545] w-full rounded-panel border border-line" />
            <figcaption className="type-caption text-ink-3">{p.hero.portrait}</figcaption>
          </figure>
        </div>
      </section>

      {/* Key facts */}
      <section aria-labelledby="facts-title" className="pb-[var(--section-y)]">
        <div className="container-page flex flex-col gap-8">
          <h2 id="facts-title" className="type-kicker text-ink-3">
            {p.facts.kicker}
          </h2>
          <KeyFacts
            items={[
              { label: "Location", value: "Kathmandu Valley", caption: "Nepal" },
              {
                label: "Power",
                value: (
                  <>
                    Hydropower
                    <NoteRef notes={notes} id="place.power" />
                  </>
                ),
                caption: "Nepal's grid",
              },
              {
                label: "Facility uptime",
                value: (
                  <>
                    <F id="place.uptime" />
                    <NoteRef notes={notes} id="place.uptime" />
                  </>
                ),
                caption: "power, cooling, building",
              },
              { label: "Fabric", value: v("cluster.network"), caption: fact("cluster.network").label },
              {
                label: "Latency",
                value: (
                  <>
                    <F id="place.latency" />
                    <NoteRef notes={notes} id="place.latency" />
                  </>
                ),
                caption: "round trip in the valley",
              },
              { label: "Status", value: "Commissioning", caption: "enterprise early access" },
            ]}
          />
        </div>
      </section>

      {/* Every layer, named. */}
      <section id="stack" aria-labelledby="stack-title" className="section-y scroll-mt-[var(--header-h)]">
        <div className="container-page flex flex-col gap-14">
          <SectionHead
            id="stack-title"
            kicker={STACK.kicker}
            title={STACK.title}
            continuation={STACK.continuation}
            lead={STACK.lead}
          />
          <LayerStack />
        </div>
      </section>

      {/* The first cluster, totalled. */}
      <section id="cluster" aria-labelledby="cluster-title" className="section-y scroll-mt-[var(--header-h)]">
        <div className="container-page flex flex-col gap-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHead
              id="cluster-title"
              kicker={p.cluster.kicker}
              title={p.cluster.title}
              continuation={p.cluster.continuation}
              lead={p.cluster.lead}
            />
            <TextLink href={p.cluster.link.href} arrow className="shrink-0">
              {p.cluster.link.label}
            </TextLink>
          </div>
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-8">
              {cluster.map((c, i) => (
                <div
                  key={c.label}
                  className="flex flex-col gap-1.5 border-t border-line pt-4"
                  data-reveal
                  style={{ "--i": i % 4 } as React.CSSProperties}
                >
                  <dt className="type-kicker order-1 text-ink-3">{c.label}</dt>
                  <dd className="order-2 flex flex-col gap-1">
                    <span className="type-title-2 tabular text-ink">
                      {c.value}
                      {c.note ? <NoteRef notes={notes} id={c.note} /> : null}
                    </span>
                    <span className="type-caption text-ink-3">{c.caption}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col gap-4" data-parallax="0.05">
              <ClusterDiagram network={v("cluster.network")} storage={v("cluster.storage")} />
              <p className="type-caption text-ink-3">
                A simplified drawing of the first cluster. Wiring, topology and addresses are not shown.
              </p>
            </div>
          </div>
          <SpecReadout
            title="Cluster and servers"
            ids={[
              "cluster.platform",
              "cluster.gpus",
              "cluster.servers",
              "cluster.gpusPerServer",
              "server.model",
              "server.cpu",
              "server.memory",
              "server.localStorage",
              "cluster.network",
              "cluster.storage",
              "cluster.storageSystem",
              "cluster.storageAccess",
            ]}
          />
        </div>
      </section>

      {/* Power */}
      <section id="power" aria-labelledby="power-title" className="section-y scroll-mt-[var(--header-h)]">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:gap-20">
          <SectionHead
            id="power-title"
            kicker={p.power.kicker}
            title={p.power.title}
            continuation={p.power.continuation}
            lead={p.power.lead}
          />
          <div className="flex flex-col gap-10 lg:pt-10">
            <div className="flex flex-col gap-2 border-t border-line pt-6">
              <p className="type-display-2 tabular">
                <F id="place.gridHydro" />
                <NoteRef notes={notes} id="place.gridHydro" />
              </p>
              <p className="type-body text-ink-2">of Nepal&apos;s installed electricity capacity is hydropower.</p>
            </div>
            <div className="flex flex-col gap-2 border-t border-line pt-6">
              <p className="type-display-2 tabular">
                <F id="place.uptime" />
                <NoteRef notes={notes} id="place.uptime" />
              </p>
              <p className="type-body text-ink-2">
                the datacentre facility&apos;s uptime commitment for power, cooling and the building.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Network (S10) */}
      <section id="network" aria-labelledby="net-title" className="section-y scroll-mt-[var(--header-h)]">
        <div className="container-page flex flex-col gap-12">
          <SectionHead
            id="net-title"
            kicker={p.network.kicker}
            title={p.network.title}
            continuation={p.network.continuation}
            lead={p.network.lead}
          />
          <div className="flex flex-col gap-4">
            <BlinkBar ms={5} label="One round trip inside the valley · under 5 ms" />
            <p className="type-caption text-ink-3">
              Typical figure; yours depends on your network and location
              <NoteRef notes={notes} id="place.latency" />
            </p>
          </div>
        </div>
      </section>

      {/* The facility */}
      <section aria-labelledby="dc-title" className="section-y">
        <div className="container-page">
          <SectionHead id="dc-title" kicker={p.datacentre.kicker} title={p.datacentre.title} lead={p.datacentre.lead} />
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {p.datacentre.points.map((pt, i) => (
              <li
                key={pt.title}
                className="flex flex-col gap-3 rounded-panel border border-line bg-bg-raised p-6"
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
              >
                <span aria-hidden="true" className="size-2 rounded-full bg-hydro" />
                <h3 className="type-title-3">{pt.title}</h3>
                <p className="type-small text-ink-2">{pt.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Residency (S9) */}
      <section id="residency" aria-labelledby="res-title" className="section-y scroll-mt-[var(--header-h)]">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-10">
            <SectionHead
              id="res-title"
              kicker={p.residency.kicker}
              title={p.residency.title}
              continuation={p.residency.continuation}
            />
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="type-kicker mb-4 flex items-center gap-2 text-hydro-ink light:text-hydro">
                  <span aria-hidden="true" className="size-2 rounded-full bg-hydro" />
                  {p.residency.stays.title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {p.residency.stays.items.map((s) => (
                    <li key={s} className="type-small text-ink-2">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="type-kicker mb-4 flex items-center gap-2 text-ink-3">
                  <span aria-hidden="true" className="size-2 rounded-full border border-ink-3" />
                  {p.residency.leaves.title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {p.residency.leaves.items.map((s) => (
                    <li key={s} className="type-small text-ink-2">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <TextLink href={p.residency.link.href} arrow>
              {p.residency.link.label}
            </TextLink>
          </div>
          <RimDrag />
        </div>
      </section>

      <section aria-labelledby="faq-title" className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_2fr]">
          <SectionHead id="faq-title" kicker="Questions" title="About the place." size="title-2" />
          <Faq items={[...p.faq]} />
        </div>
      </section>

      <Cta
        title="Taking it to your security team?"
        continuation="Start with Trust."
        action={{ href: "/contact?intent=workloads", label: "Request access" }}
        secondary={{ href: "/trust", label: "Trust" }}
      />
      <NoteList notes={notes} />
    </Page>
  );
}
