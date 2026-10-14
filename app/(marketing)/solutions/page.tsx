import { Page } from "@/components/motion/page";
import { IndustryGlyph } from "@/components/solutions/industry-glyph";
import { AppLink } from "@/components/system/app-link";
import { Cta } from "@/components/system/cta";
import { DotGlyph } from "@/components/system/dot-glyph";
import { createNotes, NoteList, NoteRef } from "@/components/system/fact";
import { GlassLight } from "@/components/system/glass-light";
import { Kicker } from "@/components/system/kicker";
import { SectionHead } from "@/components/system/section";
import { Status } from "@/components/system/status";
import { TextLink } from "@/components/system/text-link";
import { productBySlug } from "@/copy/en/products";
import { SOLUTIONS } from "@/copy/en/solutions";
import { findUseCase } from "@/copy/en/use-cases";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: SOLUTIONS.meta.title,
  description: SOLUTIONS.meta.description,
  path: "/solutions",
});

const pad = (n: number) => String(n).padStart(2, "0");

export default function SolutionsPage() {
  const s = SOLUTIONS;
  const notes = createNotes(["place.latency", "place.power"]);

  return (
    <Page>
      {/* Hero, with the six industries as a jump index. */}
      <section className="relative isolate overflow-clip pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))] pb-[clamp(3rem,7vw,6rem)]">
        <GlassLight variant="c" />
        <div className="container-page grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <div className="flex flex-col gap-6">
            <Kicker>{s.hero.kicker}</Kicker>
            <h1 className="type-display-2 max-w-[14ch]">
              {s.hero.title} <span className="text-ink-3">{s.hero.continuation}</span>
            </h1>
            <p className="type-lead measure text-ink-2">{s.hero.lead}</p>
            <Status />
          </div>
          <nav aria-label="Industries">
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {s.industries.items.map((ind, i) => (
                <li
                  key={ind.id}
                  className="min-w-0"
                  style={{ animation: `cv-rise-in 700ms var(--ease-expo) ${120 + i * 70}ms both` }}
                >
                  <a
                    href={`#${ind.id}`}
                    data-refract
                    data-refract-bezel="16"
                    className="lg lg-card group flex h-full flex-col gap-6 rounded-panel p-4 md:gap-8 md:p-5"
                  >
                    <IndustryGlyph name={ind.glyph} className="size-9 md:size-10" />
                    <span className="type-small font-medium text-balance text-ink">{ind.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* Solutions by industry */}
      <section aria-labelledby="industries-title" className="pb-[var(--section-y)]">
        <div className="container-page flex flex-col gap-12">
          <SectionHead
            id="industries-title"
            kicker={s.industries.kicker}
            title={s.industries.title}
            continuation={s.industries.continuation}
          />
          <div className="flex flex-col">
            {s.industries.items.map((ind, i) => {
              const cases = ind.cases.map((slug) => findUseCase(slug)).filter((u) => u !== undefined);
              return (
                <article
                  key={ind.id}
                  id={ind.id}
                  aria-labelledby={`${ind.id}-title`}
                  className="grid scroll-mt-[calc(var(--header-h)+1.5rem)] gap-8 border-t border-line py-12 last:border-b lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16 lg:py-16"
                >
                  <header className="flex flex-col gap-5" data-reveal>
                    <span className="flex items-center gap-4">
                      <IndustryGlyph name={ind.glyph} className="size-11" on />
                      <span className="type-kicker text-ink-3">{pad(i + 1)}</span>
                    </span>
                    <h3 id={`${ind.id}-title`} className="type-title-2 max-w-[16ch]">
                      {ind.name}
                    </h3>
                    <p className="type-lead text-ink-2">{ind.promise}</p>
                  </header>

                  <div className="flex flex-col gap-8">
                    <ul className="grid gap-x-10 sm:grid-cols-2">
                      {ind.workloads.map((w, j) => (
                        <li
                          key={w.title}
                          className="flex flex-col gap-1.5 border-t border-line py-5"
                          data-reveal
                          style={{ "--i": j % 2 } as React.CSSProperties}
                        >
                          <span className="type-body font-semibold text-ink">{w.title}</span>
                          <span className="type-small text-ink-2">{w.body}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-col gap-3">
                      <h4 className="type-kicker text-ink-3">{s.industries.runsOn}</h4>
                      <ul className="flex flex-wrap gap-2.5">
                        {ind.products.map((slug) => {
                          const p = productBySlug(slug);
                          if (!p) return null;
                          return (
                            <li key={slug}>
                              <AppLink
                                href={`/products/${slug}`}
                                className="lg group type-small inline-flex h-10 items-center gap-2.5 rounded-pill pr-4 pl-2.5 text-ink"
                              >
                                <DotGlyph name={p.glyph} className="size-5" />
                                {p.name}
                              </AppLink>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {cases.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h4 className="type-kicker text-ink-3">{s.industries.cases}</h4>
                        <ul className="flex flex-col gap-2">
                          {cases.map((u) => (
                            <li key={u.slug}>
                              <TextLink href={`/use-cases#${u.slug}`} arrow className="type-small">
                                {u.title}
                              </TextLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why CoreValley */}
      <section id="why" aria-labelledby="why-title" className="section-y relative isolate scroll-mt-[var(--header-h)]">
        <GlassLight variant="b" />
        <div className="container-page flex flex-col gap-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHead id="why-title" kicker={s.why.kicker} title={s.why.title} continuation={s.why.continuation} />
            <TextLink href={s.why.link.href} arrow className="shrink-0">
              {s.why.link.label}
            </TextLink>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {s.why.items.map((r, i) => (
              <li
                key={r.title}
                className="lg group flex flex-col gap-10 rounded-panel p-6 md:p-7"
                data-reveal
                style={{ "--i": i % 3 } as React.CSSProperties}
              >
                <DotGlyph name={r.glyph} className="size-10" />
                <div className="mt-auto flex flex-col gap-2">
                  <h3 className="type-title-3 text-ink">{r.title}</h3>
                  <p className="type-small text-ink-2">
                    {r.body}
                    {r.note && <NoteRef notes={notes} id={r.note} />}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Cta
        title={s.cta.title}
        continuation={s.cta.continuation}
        action={s.cta.action}
        secondary={s.cta.secondary}
      />
      <NoteList notes={notes} />
    </Page>
  );
}
