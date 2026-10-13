import { BuiltOn } from "@/components/home/built-on";
import { GpuSection } from "@/components/home/gpu-section";
import { Hero } from "@/components/home/hero";
import { RimVisual } from "@/components/home/rim-visual";
import { Climb, ProductsSection } from "@/components/home/sections";
import { SliceTeaser } from "@/components/home/slice-teaser";
import { ToolsSection } from "@/components/home/tools-section";
import { LayerStack } from "@/components/infrastructure/layer-stack";
import { Page } from "@/components/motion/page";
import { BillingBox } from "@/components/pricing/billing-box";
import { createNotes, NoteList, NoteRef } from "@/components/system/fact";
import { GlassLight } from "@/components/system/glass-light";
import { SectionHead } from "@/components/system/section";
import { TextLink } from "@/components/system/text-link";
import { UseCaseCarousel } from "@/components/use-cases/carousel";
import { HOME } from "@/copy/en/home";
import { STACK } from "@/copy/en/stack";
import { findUseCase, HOME_STORIES } from "@/copy/en/use-cases";
import { v } from "@/lib/facts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: HOME.meta.title,
  absoluteTitle: true,
  description: HOME.meta.description,
  path: "/",
});

export default function HomePage() {
  const notes = createNotes([
    "place.uptime",
    "gpu.fp8",
    {
      key: "readtime",
      text: `${v("gpu.memory")} of memory read at ${v("gpu.bandwidth")} takes about 29 ms; a blink lasts roughly 100–400 ms.`,
      source: { name: "NVIDIA H200 datasheet", url: "https://www.nvidia.com/en-us/data-center/h200/" },
      asOf: "2026-10-13",
    },
    "gpu.migSize",
    "place.latency",
  ]);
  const s = HOME.slice;
  const stories = HOME_STORIES.map((slug) => findUseCase(slug)!);

  return (
    <Page>
      <Hero />
      <BuiltOn />

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
          <LayerStack compact />
          <p className="type-caption text-ink-3">
            The facility&apos;s uptime is its own commitment for power, cooling and the building
            <NoteRef notes={notes} id="place.uptime" />.
          </p>
        </div>
      </section>

      <GpuSection notes={notes} />

      {/* One GPU, seven ways (S7 teaser) */}
      <section aria-labelledby="slice-title" className="section-y">
        <div className="container-page grid items-center gap-16 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <SectionHead
              id="slice-title"
              kicker={s.kicker}
              title={s.title}
              continuation={s.continuation}
              lead={s.lead}
            />
            <p className="type-body measure border-l-2 border-hydro pl-5 text-ink-2" data-reveal>
              {s.readTime}
              <NoteRef notes={notes} id="readtime" />
            </p>
            <div>
              <TextLink href={s.link.href} arrow>
                {s.link.label}
              </TextLink>
            </div>
          </div>
          <div data-parallax="0.05">
            <SliceTeaser memory={v("gpu.memory")} slice={v("gpu.migSize")} />
          </div>
        </div>
      </section>

      {/* Use cases, in the owner's order. */}
      <section aria-labelledby="cases-title" className="section-y relative isolate overflow-x-clip">
        <GlassLight />
        <div className="container-page mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHead
            id="cases-title"
            kicker={HOME.cases.kicker}
            title={HOME.cases.title}
            continuation={HOME.cases.continuation}
            lead={HOME.cases.lead}
          />
          <TextLink href={HOME.cases.link.href} arrow className="shrink-0">
            {HOME.cases.link.label}
          </TextLink>
        </div>
        <UseCaseCarousel cases={stories} label="Use cases" />
      </section>

      {/* Your data stays in the valley (S9 teaser) */}
      <section aria-labelledby="rim-title" className="section-y">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="flex flex-col gap-8 lg:order-2">
            <SectionHead
              id="rim-title"
              kicker={HOME.rim.kicker}
              title={HOME.rim.title}
              continuation={HOME.rim.continuation}
              lead={HOME.rim.lead}
            />
            <div>
              <TextLink href={HOME.rim.link.href} arrow>
                {HOME.rim.link.label}
              </TextLink>
            </div>
          </div>
          <div className="lg:order-1" data-parallax="0.06">
            <RimVisual className="w-full" />
          </div>
        </div>
      </section>

      {/* Billing at a glance. */}
      <section aria-labelledby="billing-title" className="section-y relative isolate">
        <GlassLight variant="b" />
        <div className="container-page flex flex-col gap-12">
          <SectionHead
            id="billing-title"
            kicker={HOME.billing.kicker}
            title={HOME.billing.title}
            continuation={HOME.billing.continuation}
          />
          <BillingBox more />
        </div>
      </section>

      <ToolsSection />
      <ProductsSection />
      <Climb />
      <NoteList notes={notes} />
    </Page>
  );
}
