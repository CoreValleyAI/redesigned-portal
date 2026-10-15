import { Page } from "@/components/motion/page";
import { Cta } from "@/components/system/cta";
import { Kicker } from "@/components/system/kicker";
import { SectionHead } from "@/components/system/section";
import { TextLink } from "@/components/system/text-link";
import { TRUST } from "@/copy/en/trust";
import { asset } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: TRUST.meta.title,
  description: TRUST.meta.description,
  path: "/trust",
});

export default function TrustPage() {
  const t = TRUST;
  return (
    <Page>
      <section className="relative pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))] pb-[clamp(3rem,7vw,6rem)]">
        <div className="container-page">
          <div className="flex max-w-[60rem] flex-col gap-6">
            <Kicker>{t.hero.kicker}</Kicker>
            <h1 className="type-display-2 max-w-[13ch]">{t.hero.title}</h1>
            <p className="type-lead measure text-ink-2">{t.hero.lead}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="approach-title" className="pb-[var(--section-y)]">
        <div className="container-page">
          <SectionHead id="approach-title" kicker={t.approach.kicker} title={t.approach.title} size="title-2" />
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {t.approach.items.map((it, i) => (
              <li
                key={it.title}
                className="flex flex-col gap-3 rounded-panel border border-line bg-bg-raised p-6 md:p-8"
                data-reveal
                style={{ "--i": i % 2 } as React.CSSProperties}
              >
                <span aria-hidden="true" className="type-kicker text-hydro-ink light:text-hydro">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="type-title-3">{it.title}</h3>
                <p className="type-body text-ink-2">{it.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="data-title" className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            <SectionHead id="data-title" kicker={t.data.kicker} title={t.data.title} size="title-2" />
            <TextLink href="/legal/privacy" arrow>
              The privacy policy
            </TextLink>
          </div>
          <dl className="flex flex-col">
            {t.data.rows.map((r) => (
              <div
                key={r.label}
                className="grid gap-2 border-t border-line py-5 last:border-b sm:grid-cols-[11rem_1fr] sm:gap-6"
              >
                <dt className="type-body font-semibold text-ink">{r.label}</dt>
                <dd className="type-body text-ink-2">{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="sub-title" className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <SectionHead
            id="sub-title"
            kicker={t.subprocessors.kicker}
            title={t.subprocessors.title}
            lead={t.subprocessors.lead}
            size="title-2"
          />
          <ul className="grid gap-3 sm:grid-cols-2">
            {t.subprocessors.items.map((s) => (
              <li key={s.name} className="flex flex-col gap-1.5 rounded-card border border-line bg-bg-raised p-5">
                <span className="type-body font-semibold text-ink">{s.name}</span>
                <span className="type-small text-ink-2">{s.role}</span>
                <span className="type-caption text-ink-3">{s.where}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="disclosure-title" className="section-y">
        <div className="container-page">
          <div className="flex max-w-[48rem] flex-col gap-5">
            <SectionHead id="disclosure-title" kicker={t.disclosure.kicker} title={t.disclosure.title} size="title-2" />
            <p className="type-lead text-ink-2">{t.disclosure.body}</p>
            <div className="flex flex-wrap gap-6">
              <TextLink href="mailto:info@corevalley.ai">info@corevalley.ai</TextLink>
              <a
                href={asset("/.well-known/security.txt")}
                className="type-body font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-hydro"
              >
                security.txt
              </a>
            </div>
          </div>
        </div>
      </section>

      <Cta
        title="Need more for your review?"
        lead="Ask for a written description of how your data flows. We prepare it during onboarding."
        action={{ href: "/contact?intent=workloads&topic=security", label: "Ask about security" }}
        secondary={{ href: "/infrastructure#residency", label: "Data residency" }}
      />
    </Page>
  );
}
