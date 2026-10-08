import { notFound } from "next/navigation";
import Link from "next/link";
import { ButtonLink, Card, Icon, Terminal } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/fx/reveal";
import { PRODUCTS, productBySlug } from "@/lib/products";
import { EARLY_ACCESS } from "@/lib/availability";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, breadcrumbJsonLd, serviceJsonLd } from "@/components/seo/json-ld";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return {};
  return pageMetadata({
    title: `${product.name} — GPU cloud in Nepal`,
    description: product.summary,
    path: `/products/${product.slug}`,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({
            path: `/products/${product.slug}`,
            name: product.name,
            description: product.summary,
            audience: product.audience,
          }),
          breadcrumbJsonLd([
            { name: "Products", path: "/products" },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
        ]}
      />
      <PageHero eyebrow="Products" title={product.name} lead={product.summary}>
        {/* What is on offer, read before the buttons that act on it. */}
        <p className="mt-6 max-w-[62ch] text-[14px] leading-relaxed text-ink-300">
          {EARLY_ACCESS.line} We reply {EARLY_ACCESS.replyTime}.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink
            href="/contact"
            variant="primary"
            size="lg"
            iconRight={<Icon name="arrow-right" size={17} />}
          >
            Get early access
          </ButtonLink>
          <ButtonLink href="/pricing" variant="secondary" size="lg">
            How billing works
          </ButtonLink>
        </div>
        <p className="mt-6 font-mono text-[12px] leading-relaxed tracking-wide text-ink-500">
          built for {product.audience.toLowerCase()}
          <span aria-hidden="true"> · </span>
          <span className="sr-only">. Technology: </span>
          {product.meta}
        </p>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <div className="grid gap-4 sm:grid-cols-2">
            {product.features.map((f) => (
              <Card key={f.title} padding={24} className="h-full">
                <h2 className="text-base font-semibold tracking-tight text-ink-100">{f.title}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-400">{f.body}</p>
              </Card>
            ))}
          </div>

          <div className="min-w-0 lg:sticky lg:top-24">
            <Terminal title="np-ktm-1.corevalley.ai" lines={product.terminal} />
            <Card surface="solid" padding={0} className="mt-4">
              <dl>
                {product.specs.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex items-center justify-between gap-4 px-5 py-3.5 ${
                      i > 0 ? "border-t border-line-subtle" : ""
                    }`}
                  >
                    <dt className="cv-label shrink-0 text-[10px]">{s.label}</dt>
                    <dd className="text-right font-mono text-[13px] text-ink-200">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </div>
      </Section>

      <Section>
        <Reveal kind="scale">
          <Card padding={36} className="text-center">
            <h2 className="display text-[clamp(1.5rem,3vw,2rem)]">Start with a quote.</h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-300">
              {EARLY_ACCESS.promise}
            </p>
            <div className="mt-7 flex justify-center">
              <ButtonLink
                href="/contact"
                variant="primary"
                size="lg"
                iconRight={<Icon name="arrow-right" size={17} />}
              >
                Get early access
              </ButtonLink>
            </div>
          </Card>
        </Reveal>
      </Section>

      <Section eyebrow="Other products" title="Keep exploring.">
        <div className="flex flex-wrap gap-3">
          {PRODUCTS.filter((p) => p.slug !== product.slug).map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="group">
              <Card
                surface="solid"
                padding={16}
                className="transition-colors duration-fast group-hover:border-line-strong"
              >
                <span className="flex items-center gap-2.5">
                  <Icon name={p.icon} size={17} className="text-ink-200" />
                  <span className="text-sm font-semibold text-ink-200">{p.name}</span>
                  <Icon
                    name="arrow-right"
                    size={14}
                    className="text-ink-500 transition-transform duration-normal ease-out group-hover:translate-x-0.5"
                  />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
