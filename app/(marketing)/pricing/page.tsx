import { MeterTeaser } from "@/components/home/meter-teaser";
import { Page } from "@/components/motion/page";
import { QuoteBuilder } from "@/components/pricing/quote-builder";
import { Cta } from "@/components/system/cta";
import { Faq } from "@/components/system/faq";
import { Kicker } from "@/components/system/kicker";
import { SectionHead } from "@/components/system/section";
import { Status } from "@/components/system/status";
import { PRICING } from "@/copy/en/pricing";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: PRICING.meta.title,
  description: PRICING.meta.description,
  path: "/pricing",
});

export default function PricingPage() {
  const p = PRICING;
  return (
    <Page>
      <section className="relative pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))] pb-[clamp(3rem,7vw,6rem)]">
        <div className="container-page">
          <div className="flex max-w-[60rem] flex-col gap-6">
          <Kicker>{p.hero.kicker}</Kicker>
          <h1 className="type-display-2 max-w-[14ch]">{p.hero.title}</h1>
          <p className="type-lead measure text-ink-2">{p.hero.lead}</p>
          <Status />
        </div>
        </div>
      </section>

      {/* The Meter (S8) */}
      <section aria-labelledby="meter-title" className="pb-[var(--section-y)]">
        <div className="container-page flex flex-col gap-10">
          <SectionHead id="meter-title" kicker={p.meter.kicker} title={p.meter.title} continuation={p.meter.continuation} size="title-2" />
          <MeterTeaser />
        </div>
      </section>

      {/* What you pay for, what you never pay for. */}
      <section aria-labelledby="pay-title" className="section-y">
        <div className="container-page grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-8">
            <SectionHead id="pay-title" kicker={p.payFor.kicker} title={p.payFor.title} size="title-2" />
            <ul className="flex flex-col">
              {p.payFor.items.map((it, i) => (
                <li key={it.title} className="grid gap-1 border-t border-line py-5 sm:grid-cols-[10rem_1fr] sm:gap-6" data-reveal style={{ "--i": i } as React.CSSProperties}>
                  <span className="type-body font-semibold text-ink">{it.title}</span>
                  <span className="type-body text-ink-2">{it.body}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-8">
            <SectionHead kicker={p.never.kicker} title={p.never.title} size="title-2" />
            <ul className="grid gap-3 sm:grid-cols-2">
              {p.never.items.map((it, i) => (
                <li key={it.title} className="flex flex-col gap-2 rounded-card border border-line bg-bg-raised p-5" data-reveal style={{ "--i": i } as React.CSSProperties}>
                  <span aria-hidden="true" className="type-kicker text-hydro-ink light:text-hydro">
                    0 NPR
                  </span>
                  <span className="type-body font-semibold text-ink">{it.title}</span>
                  <span className="type-small text-ink-2">{it.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How you pay */}
      <section aria-labelledby="how-title" className="section-y">
        <div className="container-page flex flex-col gap-10">
          <SectionHead id="how-title" kicker={p.pay.kicker} title={p.pay.title} size="title-2" />
          <ul className="flex flex-wrap gap-3">
            {p.pay.methods.map((m) => (
              <li key={m} className="type-title-3 rounded-pill border border-line bg-bg-raised px-6 py-3">
                {m}
              </li>
            ))}
          </ul>
          <p className="type-small text-ink-3">{p.pay.note}</p>
        </div>
      </section>

      {/* The quote console */}
      <section id="quote" aria-labelledby="quote-title" className="section-y scroll-mt-[var(--header-h)]">
        <div className="container-page flex flex-col gap-12">
          <SectionHead id="quote-title" kicker={p.quote.kicker} title={p.quote.title} lead={p.quote.lead} />
          <QuoteBuilder />
        </div>
      </section>

      <section aria-labelledby="faq-title" className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_2fr]">
          <SectionHead id="faq-title" kicker="Questions" title="About pricing." size="title-2" />
          <Faq items={[...p.faq]} />
        </div>
      </section>

      <Cta
        title="Get a firm quote in rupees."
        lead="Within one working day."
        action={{ href: "/contact?intent=workloads", label: "Request a quote" }}
      />
    </Page>
  );
}
