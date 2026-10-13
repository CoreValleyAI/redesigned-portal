import { Page } from "@/components/motion/page";
import { Cta } from "@/components/system/cta";
import { Kicker } from "@/components/system/kicker";
import { GlassLight } from "@/components/system/glass-light";
import { SectionHead } from "@/components/system/section";
import { Atlas } from "@/components/use-cases/atlas";
import { UseCaseCarousel } from "@/components/use-cases/carousel";
import { findUseCase, HOME_STORIES, INDIA, NEPAL } from "@/copy/en/use-cases";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Use cases — AI work that belongs in Nepal",
  description:
    "Fraud, AML and KYC for banks and wallets, voice AI in Nepali, private language models, training on local data, universities, startups and IT exporters — what teams in Nepal can build on GPUs in the Kathmandu Valley.",
  path: "/use-cases",
});

export default function UseCasesPage() {
  const featured = HOME_STORIES.map((slug) => findUseCase(slug)!);
  return (
    <Page>
      <section className="relative overflow-clip pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))] pb-[clamp(2.5rem,5vw,4rem)]">
        <div className="container-page">
          <div className="flex max-w-[60rem] flex-col gap-6">
            <Kicker>Use cases</Kicker>
            <h1 className="type-display-2 max-w-[13ch]">
              Work that belongs <span className="text-ink-3">in Nepal.</span>
            </h1>
            <p className="type-lead measure text-ink-2">
              Banks scoring payments, call centres answering in Nepali, teams training on their own data, a class
              sharing one GPU. What teams in Nepal can run on GPUs close to home — each story grounded in one number,
              with its source.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="featured-title" className="relative isolate overflow-x-clip pb-[var(--section-y)]">
        <GlassLight />
        <h2 id="featured-title" className="sr-only">
          Featured
        </h2>
        <UseCaseCarousel cases={featured} label="Featured use cases" size="lg" linkBase="" />
      </section>

      <section aria-labelledby="stories-title" className="pb-[var(--section-y)]">
        <div className="container-page flex flex-col gap-10">
          <SectionHead
            id="stories-title"
            kicker="Every story"
            title="All the work."
            continuation="Filter by what it runs on."
            size="title-2"
          />
          <Atlas cases={NEPAL} />
          <p className="type-caption text-ink-3">
            &ldquo;Built for&rdquo; describes who could build each one; it does not name customers or partners. The
            pictures are illustrations with sample data.
          </p>
        </div>
      </section>

      <section aria-labelledby="india-title" className="section-y">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            <SectionHead id="india-title" kicker="India" title={INDIA.title} lead={INDIA.lead} size="title-2" />
            <p className="type-small rounded-card border border-line bg-bg-sunken p-4 text-ink">{INDIA.boundary}</p>
          </div>
          <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {INDIA.items.map((it, i) => (
              <li
                key={it.title}
                className="flex flex-col gap-2 border-t border-line pt-5"
                data-reveal
                style={{ "--i": i % 2 } as React.CSSProperties}
              >
                <h3 className="type-title-3">{it.title}</h3>
                <p className="type-small text-ink-2">{it.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Cta
        title="Have an idea that belongs here?"
        continuation="Tell us about it."
        action={{ href: "/contact?intent=workloads&topic=use-case", label: "Talk about your use case" }}
      />
    </Page>
  );
}
