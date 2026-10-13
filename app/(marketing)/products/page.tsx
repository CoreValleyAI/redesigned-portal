import { Page } from "@/components/motion/page";
import { FitFinder } from "@/components/products/fit-finder";
import { ProductCard } from "@/components/products/product-card";
import { Cta } from "@/components/system/cta";
import { DotGlyph } from "@/components/system/dot-glyph";
import { Kicker } from "@/components/system/kicker";
import { SectionHead } from "@/components/system/section";
import { Status } from "@/components/system/status";
import { PRODUCTS } from "@/copy/en/products";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Products — six ways to run AI in Nepal",
  description:
    "Reserved GPUs, on-demand GPUs billed by the second, inferencing, MIG slicing, storage and engineering services — on NVIDIA H200 NVL in the Kathmandu Valley.",
  path: "/products",
});

export default function ProductsPage() {
  return (
    <Page>
      {/* Hero: the six glyphs line up as the headline rises. */}
      <section className="relative pt-[calc(var(--header-h)+clamp(3.5rem,9vw,8rem))] pb-[clamp(3rem,7vw,6rem)]">
        <div className="container-page flex flex-col gap-10">
          <div aria-hidden="true" className="flex flex-wrap gap-3 md:gap-4">
            {PRODUCTS.map((p, i) => (
              <span
                key={p.slug}
                className="grid size-14 place-items-center rounded-card border border-line bg-bg-raised md:size-16"
                style={{ animation: `cv-rise-in 700ms var(--ease-expo) ${120 + i * 70}ms both` }}
              >
                <DotGlyph name={p.glyph} className="size-8 md:size-9" on />
              </span>
            ))}
          </div>
          <div className="flex max-w-[56rem] flex-col gap-6">
            <Kicker>Products</Kicker>
            <h1 className="type-display-2">
              Six ways to run AI <span className="text-ink-3">in Nepal.</span>
            </h1>
            <p className="type-lead measure text-ink-2">
              Whole GPUs, slices of one, endpoints for your models and storage beside them — all on NVIDIA H200 NVL in
              the Kathmandu Valley, all billed in rupees.
            </p>
            <Status />
          </div>
        </div>
      </section>

      <section aria-label="The six products" className="pb-[var(--section-y)]">
        <ul className="container-page grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {PRODUCTS.map((p, i) => (
            <li key={p.slug} data-reveal style={{ "--i": i % 3 } as React.CSSProperties}>
              <ProductCard product={p} detail />
            </li>
          ))}
        </ul>
      </section>

      <section id="compare" aria-labelledby="compare-title" className="section-y scroll-mt-[var(--header-h)]">
        <div className="container-page">
          <SectionHead
            id="compare-title"
            kicker="Compare"
            title="Which one fits."
            continuation="Billing, commitment, and what each is for."
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
