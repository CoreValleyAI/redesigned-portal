import { ContourCover } from "@/components/art/contour-cover";
import { Page } from "@/components/motion/page";
import { Cta } from "@/components/system/cta";
import { Kicker } from "@/components/system/kicker";
import { SectionHead } from "@/components/system/section";
import { Atlas } from "@/components/use-cases/atlas";
import { INDIA, NEPAL } from "@/copy/en/use-cases";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Use cases — AI work that belongs in Nepal",
  description:
    "Language AI for 124 mother tongues, fraud detection, hydropower forecasting, Himalayan hazard science, healthcare triage, universities and more — what teams in Nepal can build on GPUs in the Kathmandu Valley.",
  path: "/use-cases",
});

export default function UseCasesPage() {
  return (
    <Page>
      <section className="relative overflow-clip pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))] pb-[clamp(3rem,7vw,6rem)]">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 opacity-70 [mask-image:linear-gradient(to_right,transparent,black_40%)] lg:block"
        >
          <ContourCover seed="use-cases-atlas" className="h-full w-full bg-transparent" />
        </div>
        <div className="container-page">
          <div className="flex max-w-[60rem] flex-col gap-6">
            <Kicker>Use cases</Kicker>
            <h1 className="type-display-2 max-w-[13ch]">
              Work that belongs <span className="text-ink-3">in Nepal.</span>
            </h1>
            <p className="type-lead measure text-ink-2">
              124 mother tongues, one valley. What teams in Nepal can build on GPUs close to home — each story grounded
              in one number, with its source.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Stories" className="pb-[var(--section-y)]">
        <div className="container-page">
          <Atlas cases={NEPAL} />
          <p className="type-caption mt-8 text-ink-3">
            &ldquo;Built for&rdquo; describes who could build each one; it does not name customers or partners.
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
