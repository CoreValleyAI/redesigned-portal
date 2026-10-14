import { GpuLive } from "@/components/hardware/gpu-live";
import { Page } from "@/components/motion/page";
import { BlinkBar } from "@/components/system/blink-bar";
import { ButtonLink } from "@/components/system/button";
import { Cta } from "@/components/system/cta";
import { createNotes, NoteList, NoteRef } from "@/components/system/fact";
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
                The GPU
              </ButtonLink>
            </div>
          </div>
          <div style={{ animation: "cv-rise-in 900ms var(--ease-expo) 200ms both" }}>
            <GpuLive />
          </div>
        </div>
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
          </div>
          <SpecList rows={h.gpu.key} />
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
                { ...h.roadmap.next, state: "next" as const },
                { ...h.roadmap.later, state: "later" as const },
              ].map((step, i) => (
                <li
                  key={step.label}
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
