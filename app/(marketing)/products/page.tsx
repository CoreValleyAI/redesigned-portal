import { Page } from "@/components/motion/page";
import { CatalogArt } from "@/components/products/catalog-art";
import { CatalogCard } from "@/components/products/catalog-card";
import { FitFinder } from "@/components/products/fit-finder";
import { AppLink } from "@/components/system/app-link";
import { Cta } from "@/components/system/cta";
import { DotGlyph } from "@/components/system/dot-glyph";
import { GlassLight } from "@/components/system/glass-light";
import { KeyFacts } from "@/components/system/key-facts";
import { Kicker } from "@/components/system/kicker";
import { SectionHead } from "@/components/system/section";
import { Status } from "@/components/system/status";
import { PRODUCT_CATALOG, PRODUCTS, SERVICE_TAGS } from "@/copy/en/products";
import { v } from "@/lib/facts";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Products — GPU as a Service, PaaS and serverless AI in Nepal",
  description:
    "Run, build and scale AI in Nepal: serverless APIs and managed inference, a managed AI platform with MLOps tools, and GPU, infrastructure, network and storage as a service on NVIDIA H200 NVL. Billed in rupees.",
  path: "/products",
});

const LIGHTS = ["a", "b", "c"] as const;

export default function ProductsPage() {
  return (
    <Page>
      {/* Hero: what we offer, in the terms clouds are compared by. */}
      <section className="relative isolate pt-[calc(var(--header-h)+clamp(3.5rem,9vw,8rem))] pb-[clamp(3rem,7vw,6rem)]">
        <GlassLight />
        <div className="container-page flex flex-col gap-10">
          <div className="flex max-w-[60rem] flex-col gap-6">
            <Kicker>Products</Kicker>
            <h1 className="type-display-2">
              Run, build and scale AI <span className="text-ink-3">in Nepal.</span>
            </h1>
            <p className="type-lead measure text-ink-2">
              From an API call to a whole GPU: serverless and managed inference, a managed AI platform, and GPUs,
              networking and storage as services — all on NVIDIA H200 NVL, all billed in rupees.
            </p>
            <Status />
          </div>
          <nav
            aria-label="Service models"
            className="-mx-[var(--page-x)] overflow-x-auto px-[var(--page-x)] [scrollbar-width:none]"
          >
            <ul className="flex w-max gap-2.5 md:w-auto md:flex-wrap">
              {SERVICE_TAGS.map((t, i) => (
                <li key={t.tag} style={{ animation: `cv-rise-in 700ms var(--ease-expo) ${160 + i * 60}ms both` }}>
                  <AppLink
                    href={t.href}
                    className="lg lg-card group flex items-center gap-3 rounded-pill py-2 pr-4 pl-2.5"
                  >
                    <span className="type-kicker rounded-pill bg-hydro-wash px-2.5 py-1 normal-case text-hydro-ink light:text-hydro">
                      {t.tag}
                    </span>
                    <span className="type-small whitespace-nowrap text-ink">{t.label}</span>
                  </AppLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* Run · Build · Scale */}
      {PRODUCT_CATALOG.map((g, gi) => (
        <section
          key={g.id}
          id={g.id}
          aria-labelledby={`${g.id}-title`}
          className="section-y relative isolate scroll-mt-[var(--header-h)] border-t border-line"
        >
          <GlassLight variant={LIGHTS[gi % 3]} />
          <div className="container-page flex flex-col gap-12">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
              <div className="flex flex-col gap-6">
                <span aria-hidden="true" className="type-display-1 tabular leading-none text-ink-4">
                  {g.n}
                </span>
                <SectionHead
                  id={`${g.id}-title`}
                  kicker={g.name}
                  title={g.title}
                  continuation={g.continuation}
                  lead={g.lead}
                />
              </div>
              <div className="lg lg-card rounded-panel p-5 md:p-7" data-parallax="0.04">
                <CatalogArt band={g.id} />
              </div>
            </div>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {g.items.map((it, i) => (
                <CatalogCard key={it.id} item={it} i={i} />
              ))}
            </ul>
          </div>
        </section>
      ))}

      {/* At a glance. */}
      <section aria-labelledby="glance-title" className="section-y border-t border-line">
        <div className="container-page flex flex-col gap-8">
          <h2 id="glance-title" className="type-kicker text-ink-3">
            Every product, at a glance
          </h2>
          <KeyFacts
            items={[
              { label: "GPU", value: "H200 NVL", caption: `NVIDIA · ${v("gpu.memory")} each` },
              { label: "Billing", value: v("billing.unit"), caption: `minimum ${v("billing.minimum")}` },
              { label: "Currency", value: "NPR", caption: "Nepalese rupees" },
              { label: "Ways to pay", value: "Local", caption: v("billing.rails") },
              { label: "Latency", value: v("place.latency"), caption: "round trip in the valley" },
              { label: "Power", value: "Hydro", caption: "Nepal's grid" },
            ]}
          />
        </div>
      </section>

      <section id="compare" aria-labelledby="compare-title" className="section-y scroll-mt-[var(--header-h)]">
        <div className="container-page">
          <SectionHead
            id="compare-title"
            kicker="Compare"
            title="Compare the six products."
            continuation="Billing, commitment and what each is for."
          />
          <div className="mt-12 overflow-x-auto rounded-panel border border-line [scrollbar-width:thin]">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <caption className="sr-only">
                The six products compared by billing, commitment and what they are best for
              </caption>
              <thead>
                <tr className="border-b border-line bg-bg-sunken">
                  {["Product", "Billing", "Commitment", "Best for"].map((h, i) => (
                    <th
                      key={h}
                      scope="col"
                      className={`type-kicker px-5 py-4 font-medium text-ink-3 ${i === 0 ? "sticky left-0 bg-bg-sunken" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p) => (
                  <tr key={p.slug} className="border-b border-line last:border-b-0">
                    <th scope="row" className="sticky left-0 bg-bg px-5 py-5 align-top">
                      <span className="type-body flex items-center gap-3 font-medium text-ink">
                        <DotGlyph name={p.glyph} className="size-6" />
                        {p.name}
                      </span>
                    </th>
                    <td className="type-small px-5 py-5 align-top text-ink-2">{p.billing}</td>
                    <td className="type-small px-5 py-5 align-top text-ink-2">{p.commitment}</td>
                    <td className="type-small px-5 py-5 align-top text-ink-2">{p.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section aria-labelledby="fit-title" className="section-y">
        <div className="container-page flex flex-col gap-12">
          <SectionHead id="fit-title" kicker="Not sure?" title="Two questions." continuation="One suggestion." />
          <FitFinder />
        </div>
      </section>

      <Cta
        title="Tell us what you want to run."
        continuation="We'll plan it with you."
        action={{ href: "/contact?intent=workloads", label: "Request access" }}
        secondary={{ href: "/hardware", label: "The machines" }}
      />
    </Page>
  );
}
