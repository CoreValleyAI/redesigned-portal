import { ContourCover } from "@/components/art/contour-cover";
import { Journey } from "@/components/home/journey";
import { RimDrag } from "@/components/infrastructure/rim-drag";
import { Page } from "@/components/motion/page";
import { BlinkBar } from "@/components/system/blink-bar";
import { Cta } from "@/components/system/cta";
import { createNotes, F, NoteList, NoteRef } from "@/components/system/fact";
import { Faq } from "@/components/system/faq";
import { Kicker } from "@/components/system/kicker";
import { SectionHead } from "@/components/system/section";
import { Status } from "@/components/system/status";
import { TextLink } from "@/components/system/text-link";
import { INFRASTRUCTURE } from "@/copy/en/infrastructure";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: INFRASTRUCTURE.meta.title,
  description: INFRASTRUCTURE.meta.description,
  path: "/infrastructure",
});

export default function InfrastructurePage() {
  const p = INFRASTRUCTURE;
  const notes = createNotes(["place.power", "place.gridHydro", "place.uptime", "gpu.memory", "cluster.network", "place.latency"]);

  return (
    <Page>
      {/* Hero */}
      <section className="relative overflow-clip pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))] pb-[clamp(3rem,7vw,6rem)]">
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]">
          <ContourCover seed="kathmandu-valley" className="h-full w-full bg-transparent" />
        </div>
        <div className="container-page flex max-w-[60rem] flex-col gap-6">
          <Kicker>{p.hero.kicker}</Kicker>
          <h1 className="type-display-1">{p.hero.title}</h1>
          <p className="type-lead measure text-ink-2">{p.hero.lead}</p>
          <Status id="region" />
        </div>
      </section>

      <Journey
        id="chain"
        kicker={p.journey.kicker}
        title={p.journey.title}
        continuation={p.journey.continuation}
        beats={p.journey.beats}
        notes={notes}
      />

      {/* Power */}
      <section id="power" aria-labelledby="power-title" className="section-y scroll-mt-[var(--header-h)]">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:gap-20">
          <SectionHead id="power-title" kicker={p.power.kicker} title={p.power.title} continuation={p.power.continuation} lead={p.power.lead} />
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
              <p className="type-body text-ink-2">the datacentre facility&apos;s uptime commitment for power, cooling and the building.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The datacentre */}
      <section aria-labelledby="dc-title" className="section-y">
        <div className="container-page">
          <SectionHead id="dc-title" kicker={p.datacentre.kicker} title={p.datacentre.title} lead={p.datacentre.lead} />
          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {p.datacentre.points.map((pt, i) => (
              <li key={pt.title} className="flex flex-col gap-3 rounded-panel border border-line bg-bg-raised p-6" data-reveal style={{ "--i": i } as React.CSSProperties}>
                <span aria-hidden="true" className="size-2 rounded-full bg-hydro" />
                <h3 className="type-title-3">{pt.title}</h3>
                <p className="type-small text-ink-2">{pt.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Network (S10) */}
      <section id="network" aria-labelledby="net-title" className="section-y scroll-mt-[var(--header-h)]">
        <div className="container-page flex flex-col gap-12">
          <SectionHead id="net-title" kicker={p.network.kicker} title={p.network.title} continuation={p.network.continuation} lead={p.network.lead} />
          <div className="flex flex-col gap-4">
            <BlinkBar ms={5} label="One round trip inside the valley · under 5 ms" />
            <p className="type-caption text-ink-3">
              Typical figure; yours depends on your network and location
              <NoteRef notes={notes} id="place.latency" />
            </p>
          </div>
        </div>
      </section>

      {/* Residency (S9) */}
      <section id="residency" aria-labelledby="res-title" className="section-y scroll-mt-[var(--header-h)]">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-10">
            <SectionHead id="res-title" kicker={p.residency.kicker} title={p.residency.title} continuation={p.residency.continuation} />
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
