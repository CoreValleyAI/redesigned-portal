import { Page } from "@/components/motion/page";
import { MetroMap } from "@/components/platform/metro-map";
import { Strata } from "@/components/platform/strata";
import { Cta } from "@/components/system/cta";
import { DotGlyph } from "@/components/system/dot-glyph";
import { Kicker } from "@/components/system/kicker";
import { SectionHead } from "@/components/system/section";
import { Status } from "@/components/system/status";
import { TextLink } from "@/components/system/text-link";
import { PLATFORM } from "@/copy/en/platform";
import { DOCS_URL } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: PLATFORM.meta.title,
  description: PLATFORM.meta.description,
  path: "/platform",
});

export default function PlatformPage() {
  const p = PLATFORM;
  return (
    <Page>
      {/* Hero, with the strata beside it. */}
      <section className="relative pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))] pb-[clamp(3rem,7vw,6rem)]">
        <div className="container-page grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-6">
            <Kicker>{p.hero.kicker}</Kicker>
            <h1 className="type-display-2 max-w-[14ch]">{p.hero.title}</h1>
            <p className="type-lead measure text-ink-2">{p.hero.lead}</p>
            <Status />
          </div>
          <Strata layers={p.layers.items} />
        </div>
      </section>

      {/* The layers, top to bottom. */}
      <section aria-labelledby="layers-title" className="section-y">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <SectionHead id="layers-title" kicker={p.layers.kicker} title={p.layers.title} continuation={p.layers.continuation} />
          <ol className="flex flex-col">
            {p.layers.items.map((l, i) => (
              <li key={l.id} className="grid gap-2 border-t border-line py-6 last:border-b md:grid-cols-[2.5rem_1fr] md:items-baseline md:gap-6" data-reveal style={{ "--i": i } as React.CSSProperties}>
                <span className="type-kicker text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex flex-col gap-1.5">
                  <span className="type-title-3 flex items-center gap-3">
                    {l.name}
                    {l.touch && <span className="type-kicker rounded-pill bg-hydro-wash px-2.5 py-1 text-hydro-ink light:text-hydro">You work here</span>}
                  </span>
                  <span className="type-body text-ink-2">{l.line}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The tools */}
      <section aria-labelledby="tools-title" className="section-y">
        <div className="container-page">
          <SectionHead id="tools-title" kicker={p.tools.kicker} title={p.tools.title} continuation={p.tools.continuation} />
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {p.tools.items.map((t, i) => (
              <li
                key={t.name}
                className="group flex items-start gap-4 rounded-card border border-line bg-bg-raised p-5 transition-[border-color,transform] duration-[var(--dur-spring-smooth)] ease-spring hover:-translate-y-0.5 hover:border-line-strong"
                data-reveal
                style={{ "--i": i % 4 } as React.CSSProperties}
              >
                <DotGlyph name={t.glyph} className="mt-0.5 size-8" />
                <span className="flex flex-col gap-1">
                  <span className="type-body font-semibold text-ink">{t.name}</span>
                  <span className="type-small text-ink-2">{t.what}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="type-caption mt-6 text-ink-3">Tool names are trademarks of their owners, shown to say what is included in HPE AI Essentials.</p>
        </div>
      </section>

      {/* A day on the platform */}
      <section aria-labelledby="day-title" className="section-y">
        <div className="container-page flex flex-col gap-12">
          <SectionHead id="day-title" kicker={p.day.kicker} title={p.day.title} lead={p.day.lead} />
          <MetroMap lines={p.day.lines} />
        </div>
      </section>

      {/* Isolation */}
      <section aria-labelledby="iso-title" className="section-y">
        <div className="container-page">
          <SectionHead id="iso-title" kicker={p.isolation.kicker} title={p.isolation.title} />
          <ul className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {p.isolation.items.map((it, i) => (
              <li key={it.title} className="flex flex-col gap-3 border-t border-line pt-6" data-reveal style={{ "--i": i } as React.CSSProperties}>
                <h3 className="type-title-3">{it.title}</h3>
                <p className="type-body text-ink-2">{it.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <TextLink href={p.isolation.link.href} arrow>
              {p.isolation.link.label}
            </TextLink>
          </div>
        </div>
      </section>

      <Cta
        title="See it for yourself."
        continuation="The docs go deeper."
        action={{ href: "/contact?intent=workloads", label: "Request access" }}
        secondary={{ href: DOCS_URL, label: "Read the docs" }}
      />
    </Page>
  );
}
