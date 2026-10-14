import { ValleyPortrait } from "@/components/art/valley-portrait";
import { HpeLogo, NvidiaLogo } from "@/components/brand/partner-logos";
import { LayerStack } from "@/components/infrastructure/layer-stack";
import { DataPath } from "@/components/infrastructure/data-path";
import { Page } from "@/components/motion/page";
import { BlinkBar } from "@/components/system/blink-bar";
import { Cta } from "@/components/system/cta";
import { createNotes, F, NoteList, NoteRef } from "@/components/system/fact";
import { Faq } from "@/components/system/faq";
import { KeyFacts } from "@/components/system/key-facts";
import { Kicker } from "@/components/system/kicker";
import { SectionHead } from "@/components/system/section";
import { Status } from "@/components/system/status";
import { TextLink } from "@/components/system/text-link";
import { INFRASTRUCTURE } from "@/copy/en/infrastructure";
import { STACK, STACK_NOTE } from "@/copy/en/stack";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: INFRASTRUCTURE.meta.title,
  description: INFRASTRUCTURE.meta.description,
  path: "/infrastructure",
});

export default function InfrastructurePage() {
  const p = INFRASTRUCTURE;
  const notes = createNotes([STACK_NOTE, "place.power", "place.gridHydro", "place.uptime", "place.latency"]);

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
              { label: "GPUs", value: "NVIDIA H200 NVL", caption: "141 GB HBM3e each" },
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
          <p className="type-caption text-ink-3">
            The five layers are NVIDIA&apos;s framing
            <NoteRef notes={notes} id="cake" />.
          </p>
        </div>
      </section>

      {/* Capacity: where we start and where we are going, with no numbers
          for what runs today (CTO ruling, 14 Oct 2026). */}
      <section id="capacity" aria-labelledby="capacity-title" className="section-y scroll-mt-[var(--header-h)]">
        <div className="container-page flex flex-col gap-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHead
              id="capacity-title"
              kicker={p.capacity.kicker}
              title={p.capacity.title}
              continuation={p.capacity.continuation}
              lead={p.capacity.lead}
            />
            <TextLink href={p.capacity.link.href} arrow className="shrink-0">
              {p.capacity.link.label}
            </TextLink>
          </div>
          <ol className="grid gap-4 md:grid-cols-3">
            {p.capacity.steps.map((step, i) => (
              <li
                key={step.label}
                className="flex flex-col gap-3 rounded-panel border border-line bg-bg-raised p-6"
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="type-kicker text-ink-3">{step.label}</span>
                <span className="type-title-3">{step.title}</span>
                <span className="type-small text-ink-2">{step.body}</span>
              </li>
            ))}
          </ol>
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
            <div className="flex flex-col gap-6">
              <h3 className="type-kicker flex items-center gap-2 text-hydro-ink light:text-hydro">
                <span aria-hidden="true" className="size-2 rounded-full bg-hydro" />
                {p.residency.stays.title}
              </h3>
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {p.residency.stays.items.map((s) => (
                  <li key={s} className="type-small border-t border-line py-3 text-ink-2">
                    {s}
                  </li>
                ))}
              </ul>
              <p className="type-small text-ink-3">{p.residency.note}</p>
            </div>
            <TextLink href={p.residency.link.href} arrow>
              {p.residency.link.label}
            </TextLink>
          </div>
          <DataPath />
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
