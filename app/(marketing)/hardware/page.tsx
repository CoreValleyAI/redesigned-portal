import { EngineerSwitch } from "@/components/chrome/pref-switch";
import { ExplodedServer } from "@/components/hardware/exploded-server";
import { ClusterDiagram, GpuArt } from "@/components/hardware/visuals";
import { Page } from "@/components/motion/page";
import { BlinkBar } from "@/components/system/blink-bar";
import { ButtonLink } from "@/components/system/button";
import { Cta } from "@/components/system/cta";
import { createNotes, F, NoteList, NoteRef } from "@/components/system/fact";
import { Faq } from "@/components/system/faq";
import { Kicker } from "@/components/system/kicker";
import { SectionHead } from "@/components/system/section";
import { SpecList } from "@/components/system/spec-list";
import { Status } from "@/components/system/status";
import { HARDWARE } from "@/copy/en/hardware";
import { fact, v } from "@/lib/facts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: HARDWARE.meta.title,
  description: HARDWARE.meta.description,
  path: "/hardware",
});

export default function HardwarePage() {
  const h = HARDWARE;
  const notes = createNotes([
    "gpu.memory",
    "gpu.fp8",
    {
      key: "readtime",
      text: `${v("gpu.memory")} ÷ ${v("gpu.bandwidth")} ≈ 29 ms. Blinks last roughly 100–400 ms.`,
      source: fact("gpu.bandwidth").source,
      asOf: fact("gpu.bandwidth").asOf,
    },
    "cluster.platform",
  ]);

  return (
    <Page>
      {/* Hero */}
      <section className="relative overflow-clip pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))] pb-[clamp(3rem,7vw,6rem)]">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="flex flex-col gap-6">
            <Kicker>{h.hero.kicker}</Kicker>
            <h1 className="type-display-2">{h.hero.title}</h1>
            <p className="type-lead measure text-ink-2">{h.hero.lead}</p>
            <Status />
            <div className="mt-2 flex flex-wrap gap-3">
              <ButtonLink href="/contact?intent=workloads&product=reserved" size="lg" magnetic>
                Request access
              </ButtonLink>
              <ButtonLink href="#gpu" variant="secondary" size="lg">
                The specifications
              </ButtonLink>
            </div>
          </div>
          <div style={{ animation: "cv-rise-in 900ms var(--ease-expo) 200ms both" }}>
            <GpuArt />
          </div>
        </div>
      </section>

      {/* The Machine (S6) */}
      <section aria-labelledby="machine-title" className="pt-[var(--section-y)]">
        <div className="container-page">
          <SectionHead
            id="machine-title"
            kicker={h.machine.kicker}
            title={h.machine.title}
            continuation={h.machine.continuation}
          />
        </div>
        <ExplodedServer
          layers={h.machine.layers.map((l) => ({
            id: l.id,
            title: l.title,
            body: l.body,
            caption: l.caption,
            value: <F id={l.fact} />,
          }))}
        />
      </section>

      {/* The GPU */}
      <section id="gpu" aria-labelledby="gpu-title" className="section-y scroll-mt-[var(--header-h)]">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            <SectionHead id="gpu-title" kicker={h.gpu.kicker} title={h.gpu.title} continuation={h.gpu.continuation} />
            <p className="type-small text-ink-3">
              Tensor Core figures are NVIDIA&apos;s peak numbers with sparsity
              <NoteRef notes={notes} id="gpu.fp8" />.
            </p>
            <EngineerSwitch className="max-w-[20rem] rounded-card border border-line bg-bg-raised p-4" />
          </div>
          <div>
            <div className="engineer:hidden">
              <SpecList rows={h.gpu.key} />
            </div>
            <div className="hidden engineer:block">
              <SpecList rows={h.gpu.full} dense />
            </div>
          </div>
        </div>
      </section>

      {/* Memory you can feel */}
      <section aria-labelledby="feel-title" className="section-y">
        <div className="container-page flex flex-col gap-10">
          <SectionHead id="feel-title" kicker={h.feel.kicker} title={h.feel.title} lead={h.feel.lead} />
          <BlinkBar ms={29} label="Reading all 141 GB · about 29 ms" className="max-w-[56rem]" />
          <p className="type-caption text-ink-3">
            Arithmetic from the datasheet
            <NoteRef notes={notes} id="readtime" />
          </p>
        </div>
      </section>

      {/* The cluster */}
      <section aria-labelledby="cluster-title" className="section-y">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            <SectionHead
              id="cluster-title"
              kicker={h.cluster.kicker}
              title={h.cluster.title}
              continuation={h.cluster.continuation}
              lead={h.cluster.lead}
            />
            <SpecList rows={h.cluster.rows} dense />
          </div>
          <div className="lg:pt-20">
            <ClusterDiagram network={v("cluster.network")} storage={v("cluster.storage")} />
            <p className="type-caption mt-4 text-ink-3">
              A simplified drawing of the first cluster. Wiring and addresses are not shown.
            </p>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" aria-labelledby="roadmap-title" className="section-y scroll-mt-[var(--header-h)]">
        <div className="container-page">
          <SectionHead
            id="roadmap-title"
            kicker={h.roadmap.kicker}
            title={h.roadmap.title}
            continuation={h.roadmap.continuation}
          />
          <div className="relative mt-14">
            <div
              aria-hidden="true"
              className="absolute top-[0.6rem] right-0 left-0 hidden h-px bg-[repeating-linear-gradient(to_right,var(--line-strong)_0_2px,transparent_2px_9px)] md:block"
            />
            <ol className="relative grid gap-10 md:grid-cols-3 md:gap-6">
              {[
                { ...h.roadmap.now, state: "now" as const },
                {
                  label: h.roadmap.next.label,
                  title: <F id={h.roadmap.next.fact} />,
                  body: h.roadmap.next.body,
                  state: "next" as const,
                },
                { ...h.roadmap.later, state: "later" as const },
              ].map((step, i) => (
                <li
                  key={i}
                  className="relative flex flex-col gap-3"
                  data-reveal
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span
                    aria-hidden="true"
                    className={
                      step.state === "now"
                        ? "size-5 rounded-full bg-hydro shadow-[0_0_0_6px_var(--hydro-wash)]"
                        : step.state === "next"
                          ? "size-5 rounded-full border-2 border-hydro bg-bg"
                          : "size-5 rounded-full border-2 border-dashed border-line-strong bg-bg"
                    }
                  />
                  <span className="type-kicker mt-3 text-ink-3">{step.label}</span>
                  <span className="type-title-3">{step.title}</span>
                  <span className="type-small text-ink-2">{step.body}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_2fr]">
          <SectionHead id="faq-title" kicker="Questions" title="About the hardware." size="title-2" />
          <Faq items={[...h.faq]} />
        </div>
      </section>

      <Cta
        title="Put an H200 NVL to work."
        continuation="Early access is open."
        action={{ href: "/contact?intent=workloads", label: "Request access" }}
        secondary={{ href: "/platform", label: "The software" }}
      />
      <NoteList notes={notes} />
    </Page>
  );
}
