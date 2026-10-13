import { Hero } from "@/components/home/hero";
import { Journey } from "@/components/home/journey";
import { MeterTeaser } from "@/components/home/meter-teaser";
import { RimVisual } from "@/components/home/rim-visual";
import { Climb, PartnersLine, ProductsSection, StoriesSection } from "@/components/home/sections";
import { SliceTeaser } from "@/components/home/slice-teaser";
import { Page } from "@/components/motion/page";
import { createNotes, NoteList, NoteRef } from "@/components/system/fact";
import { SectionHead } from "@/components/system/section";
import { TextLink } from "@/components/system/text-link";
import { HOME } from "@/copy/en/home";
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
    "place.gridHydro",
    "place.uptime",
    "gpu.memory",
    "place.latency",
    {
      key: "readtime",
      text: `${v("gpu.memory")} of memory read at ${v("gpu.bandwidth")} takes about 29 ms; a blink lasts roughly 100–400 ms.`,
      source: { name: "NVIDIA H200 datasheet", url: "https://www.nvidia.com/en-us/data-center/h200/" },
      asOf: "2026-10-13",
    },
    "gpu.migSize",
  ]);
  const s = HOME.slice;

  return (
    <Page>
      <Hero />
      <Journey
        kicker={HOME.journey.kicker}
        title={HOME.journey.title}
        continuation={HOME.journey.continuation}
        beats={HOME.journey.beats}
        link={HOME.journey.link}
        notes={notes}
      />

      {/* 3 — One GPU, seven ways (S7 teaser) */}
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
          <SliceTeaser memory={v("gpu.memory")} slice={v("gpu.migSize")} />
        </div>
      </section>

      {/* 4 — Your data stays in the valley (S9 teaser) */}
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
          <RimVisual className="w-full lg:order-1" />
        </div>
      </section>

      {/* 5 — Pay for the seconds you use (S8 teaser) */}
      <section aria-labelledby="meter-title" className="section-y">
        <div className="container-page flex flex-col gap-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHead
              id="meter-title"
              kicker={HOME.meter.kicker}
              title={HOME.meter.title}
              continuation={HOME.meter.continuation}
              lead={HOME.meter.lead}
            />
            <TextLink href={HOME.meter.link.href} arrow className="shrink-0">
              {HOME.meter.link.label}
            </TextLink>
          </div>
          <MeterTeaser />
        </div>
      </section>

      <ProductsSection />
      <StoriesSection />
      <PartnersLine />
      <Climb />
      <NoteList notes={notes} />
    </Page>
  );
}
