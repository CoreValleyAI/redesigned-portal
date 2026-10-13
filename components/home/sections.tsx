/**
 * Home chapters 6–9: the products, three stories, the partners line and the
 * first step of the climb. Each is a teaser that hands off to the page that
 * owns the subject.
 */
import { ViewTransition } from "react";
import { AppLink } from "@/components/system/app-link";
import { Arrow } from "@/components/system/button";
import { DotGlyph, type GlyphName } from "@/components/system/dot-glyph";
import { SectionHead } from "@/components/system/section";
import { TextLink } from "@/components/system/text-link";
import { ContourCover } from "@/components/art/contour-cover";
import { HOME } from "@/copy/en/home";
import { PRODUCTS } from "@/copy/en/products";
import { findUseCase, HOME_STORIES } from "@/copy/en/use-cases";
import { cn } from "@/lib/cn";

export function ProductsSection() {
  const p = HOME.products;
  return (
    <section aria-labelledby="products-title" className="section-y">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHead id="products-title" kicker={p.kicker} title={p.title} continuation={p.continuation} />
          <TextLink href={p.link.href} arrow className="shrink-0">
            {p.link.label}
          </TextLink>
        </div>
      </div>

      {/* A snap carousel on phones, a 3 × 2 grid from tablets up. */}
      <ul className="container-page mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 lg:gap-5 [&::-webkit-scrollbar]:hidden">
        {PRODUCTS.map((product, i) => (
          <li
            key={product.slug}
            className="w-[82%] shrink-0 snap-start md:w-auto"
            data-reveal
            style={{ "--i": i % 3 } as React.CSSProperties}
          >
            <AppLink
              href={`/products/${product.slug}`}
              className="group flex h-full flex-col gap-10 rounded-panel border border-line bg-bg-raised p-6 transition-[border-color,background-color,transform] duration-[var(--dur-spring-smooth)] ease-spring hover:-translate-y-0.5 hover:border-line-strong md:p-7 dark:hover:bg-bg-elevated"
            >
              <ViewTransition name={`product-glyph-${product.slug}`} share="morph" default="none">
                <DotGlyph name={product.glyph} className="size-11" />
              </ViewTransition>
              <span className="mt-auto flex flex-col gap-2">
                <span className="type-title-3 flex items-center justify-between gap-3 text-ink">
                  {product.name}
                  <Arrow className="group-btn text-ink-3 transition-transform duration-[var(--dur-spring-snappy)] ease-spring group-hover:translate-x-1 group-hover:text-ink" />
                </span>
                <span className="type-small text-ink-2">{product.promise}</span>
              </span>
            </AppLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StoriesSection() {
  const s = HOME.stories;
  const stories = HOME_STORIES.map((slug) => findUseCase(slug)!);
  return (
    <section aria-labelledby="stories-title" className="section-y">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHead id="stories-title" kicker={s.kicker} title={s.title} continuation={s.continuation} />
          <TextLink href={s.link.href} arrow className="shrink-0">
            {s.link.label}
          </TextLink>
        </div>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {stories.map((u, i) => (
            <li key={u.slug} data-reveal style={{ "--i": i } as React.CSSProperties}>
              <AppLink
                href={`/use-cases#${u.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-bg-raised transition-[border-color,transform] duration-[var(--dur-spring-smooth)] ease-spring hover:-translate-y-0.5 hover:border-line-strong"
              >
                <ContourCover seed={u.slug} className="aspect-[16/10] w-full" />
                <span className="flex flex-1 flex-col gap-3 p-6">
                  <span className="type-kicker text-ink-3">{u.sector}</span>
                  <span className="type-title-3 text-ink">{u.title}</span>
                  <span className="type-small text-ink-2">{u.fact}</span>
                </span>
              </AppLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PartnersLine() {
  const p = HOME.partners;
  return (
    <section aria-label="Partners" className="py-[calc(var(--section-y)*0.5)]">
      <div className="container-page flex flex-col items-center gap-6 text-center">
        <p className="flex items-center gap-6 md:gap-10">
          {p.names.map((n, i) => (
            <span key={n} className="flex items-center gap-6 md:gap-10">
              {i > 0 && <span aria-hidden="true" className="h-6 w-px bg-line-strong/60" />}
              <span className="type-title-2 tracking-[-0.02em] text-ink">{n}</span>
            </span>
          ))}
        </p>
        <p className="type-body max-w-[36rem] text-ink-2">{p.line}</p>
        <TextLink href={p.link.href} arrow>
          {p.link.label}
        </TextLink>
      </div>
    </section>
  );
}

const ROUTES: { href: string; title: string; body: string; glyph: GlyphName; primary?: boolean }[] = [
  {
    href: "/contact?intent=workloads",
    title: "Run AI workloads",
    body: "GPUs, slices, storage or serving.",
    glyph: "hardware",
    primary: true,
  },
  {
    href: "/contact?intent=partner",
    title: "Partner with us",
    body: "Resellers, integrators, universities.",
    glyph: "company",
  },
  { href: "/contact?intent=press", title: "Press", body: "Interviews and information.", glyph: "blog" },
  { href: "/jobs", title: "Careers", body: "Build Nepal's AI infrastructure.", glyph: "careers" },
  { href: "/contact?intent=support", title: "Support", body: "Help with an existing request.", glyph: "services" },
];

export function Climb() {
  const c = HOME.climb;
  return (
    <section aria-labelledby="climb-title" className="section-y">
      <div className="container-page">
        <SectionHead id="climb-title" kicker={c.kicker} title={c.title} lead={c.lead} align="center" />
        <ul className="mx-auto mt-12 grid max-w-[64rem] gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROUTES.map((r, i) => (
            <li
              key={r.href}
              className={cn(r.primary && "sm:col-span-2 lg:col-span-1 lg:row-span-2")}
              data-reveal
              style={{ "--i": i } as React.CSSProperties}
            >
              <AppLink
                href={r.href}
                className={cn(
                  "group flex h-full items-start gap-4 rounded-panel border p-5 transition-[border-color,background-color,transform] duration-[var(--dur-spring-smooth)] ease-spring hover:-translate-y-0.5 md:p-6",
                  r.primary
                    ? "border-hydro bg-hydro-wash lg:flex-col lg:justify-between lg:p-8"
                    : "border-line bg-bg-raised hover:border-line-strong",
                )}
              >
                <DotGlyph name={r.glyph} className={cn("size-9", r.primary && "lg:size-14")} on={r.primary} />
                <span className="flex flex-1 flex-col gap-1">
                  <span className={cn("type-title-3 flex items-center gap-2 text-ink", r.primary && "lg:type-title-2")}>
                    {r.title}
                    <Arrow className="text-ink-3 transition-transform duration-[var(--dur-spring-snappy)] ease-spring group-hover:translate-x-1 group-hover:text-ink" />
                  </span>
                  <span className="type-small text-ink-2">{r.body}</span>
                </span>
              </AppLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
