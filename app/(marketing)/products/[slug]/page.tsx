import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { MeterTeaser } from "@/components/home/meter-teaser";
import { SliceTeaser } from "@/components/home/slice-teaser";
import { Page } from "@/components/motion/page";
import { ProductCard } from "@/components/products/product-card";
import { JsonLd, serviceJsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/system/breadcrumbs";
import { ButtonLink } from "@/components/system/button";
import { Cta } from "@/components/system/cta";
import { DotGlyph } from "@/components/system/dot-glyph";
import { createNotes, NoteList } from "@/components/system/fact";
import { Faq } from "@/components/system/faq";
import { Kicker } from "@/components/system/kicker";
import { SectionHead } from "@/components/system/section";
import { SpecList } from "@/components/system/spec-list";
import { SpecReadout } from "@/components/system/spec-readout";
import { Status } from "@/components/system/status";
import { TextLink } from "@/components/system/text-link";
import { PRODUCTS, productBySlug } from "@/copy/en/products";
import { fact, v } from "@/lib/facts";
import { pageMetadata } from "@/lib/seo";

/** Products whose idea can be shown working, not only described. */
const DEMOS: Partial<Record<string, { title: string; continuation: string; demo: () => React.ReactNode }>> = {
  "mig-slicing": {
    title: "One GPU, seven ways.",
    continuation: "Each slice isolated in hardware.",
    demo: () => <SliceTeaser memory={v("gpu.memory")} slice={v("gpu.migSize")} />,
  },
  "on-demand": {
    title: "The meter runs while your job does.",
    continuation: "Not a second longer.",
    demo: () => <MeterTeaser />,
  },
};

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return {};
  return pageMetadata({
    title: product.meta.title,
    description: product.meta.description,
    path: `/products/${product.slug}`,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const others = PRODUCTS.filter((p) => p.slug !== product.slug);
  const notes = createNotes(product.specs.filter((id) => fact(id).footnote || fact(id).source.url));
  const contact = `/contact?intent=workloads&product=${product.slug}`;

  return (
    <Page>
      <JsonLd
        data={serviceJsonLd({
          path: `/products/${product.slug}`,
          name: product.name,
          description: product.summary,
          audience: product.bestFor,
        })}
      />

      {/* Hero */}
      <section className="relative pt-[calc(var(--header-h)+clamp(2.5rem,7vw,6rem))] pb-[clamp(3rem,7vw,6rem)]">
        <div className="container-page grid items-end gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col gap-6">
            <Breadcrumbs
              trail={[
                { href: "/products", label: "Products" },
                { href: `/products/${product.slug}`, label: product.name },
              ]}
            />
            <Kicker>{product.name}</Kicker>
            <h1 className="type-display-2 max-w-[14ch]">{product.tagline}</h1>
            <p className="type-lead measure text-ink-2">{product.summary}</p>
            <Status />
            <div className="mt-2 flex flex-wrap gap-3">
              <ButtonLink href={contact} size="lg" magnetic>
                Request access
              </ButtonLink>
              <ButtonLink href="#how" variant="secondary" size="lg">
                How it works
              </ButtonLink>
            </div>
          </div>
          <div className="hidden justify-end lg:flex">
            <div className="grid aspect-square w-full max-w-[22rem] place-items-center rounded-panel border border-line bg-bg-raised">
              <ViewTransition name={`product-glyph-${product.slug}`} share="morph" default="none">
                <DotGlyph name={product.glyph} className="size-40" on />
              </ViewTransition>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" aria-labelledby="how-title" className="section-y scroll-mt-[var(--header-h)]">
        <div className="container-page">
          <SectionHead id="how-title" kicker="How it works" title="Three steps." size="title-1" />
          <ol className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
            {product.steps.map((step, i) => (
              <li
                key={step.title}
                className="flex flex-col gap-4 rounded-panel border border-line bg-bg-raised p-6 md:p-8"
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="type-kicker text-hydro-ink light:text-hydro">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="type-title-3">{step.title}</h3>
                <p className="type-small text-ink-2">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {DEMOS[product.slug] && (
        <section aria-labelledby="see-title" className="section-y">
          <div className="container-page flex flex-col items-center gap-14">
            <SectionHead
              id="see-title"
              kicker="See it"
              title={DEMOS[product.slug]!.title}
              continuation={DEMOS[product.slug]!.continuation}
              align="center"
            />
            {DEMOS[product.slug]!.demo()}
          </div>
        </section>
      )}

      {/* What you get */}
      <section aria-labelledby="get-title" className="section-y">
        <div className="container-page">
          <SectionHead id="get-title" kicker="What you get" title={`${product.name}, in detail.`} size="title-1" />
          <ul className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {product.features.map((f, i) => (
              <li
                key={f.title}
                className="flex flex-col gap-3 border-t border-line pt-6"
                data-reveal
                style={{ "--i": i % 3 } as React.CSSProperties}
              >
                <h3 className="type-title-3">{f.title}</h3>
                <p className="type-body text-ink-2">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Under the hood, and billing */}
      <section aria-labelledby="hood-title" className="section-y">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-6">
            <SectionHead id="hood-title" kicker="Under the hood" title="The key numbers." size="title-2" />
            <SpecList rows={product.specs} />
            <SpecReadout
              title={product.name}
              ids={[
                ...new Set([
                  ...product.specs,
                  "gpu.model" as const,
                  "gpu.memory" as const,
                  "gpu.bandwidth" as const,
                  "billing.currency" as const,
                  "billing.rails" as const,
                ]),
              ]}
            />
            <TextLink href="/hardware" arrow>
              Full specifications
            </TextLink>
          </div>
          <div className="flex flex-col gap-6">
            <SectionHead kicker="Billing" title={product.billing} size="title-2" />
            <p className="type-body text-ink-2">
              Commitment: {product.commitment.toLowerCase()}. Rates are being finalised; every request gets a firm quote
              in rupees.
            </p>
            <TextLink href="/pricing" arrow>
              How billing works
            </TextLink>
          </div>
        </div>
      </section>

      {/* Product questions only (03 §3). */}
      <section aria-labelledby="faq-title" className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_2fr]">
          <SectionHead
            id="faq-title"
            kicker="Questions"
            title={`About ${product.name.toLowerCase()}.`}
            size="title-2"
          />
          <Faq items={product.faq} />
        </div>
      </section>

      <Cta
        title={`Start with ${product.name.toLowerCase()}.`}
        lead="Tell us what you want to run. It takes about a minute."
        action={{ href: contact, label: "Request access" }}
      />

      <section aria-labelledby="others-title" className="pb-[var(--section-y)]">
        <div className="container-page">
          <h2 id="others-title" className="type-kicker mb-6 text-ink-3">
            Other ways to run
          </h2>
          <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] md:grid md:grid-cols-5 md:overflow-visible [&::-webkit-scrollbar]:hidden">
            {others.map((p) => (
              <li key={p.slug} className="w-[70%] shrink-0 snap-start md:w-auto">
                <ProductCard product={p} className="gap-6 p-5 md:p-5" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <NoteList notes={notes} />
    </Page>
  );
}
