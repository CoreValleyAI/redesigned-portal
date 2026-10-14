import { Page } from "@/components/motion/page";
import { IcebergDive } from "@/components/platform/iceberg-dive";
import { Cta } from "@/components/system/cta";
import { DotGlyph } from "@/components/system/dot-glyph";
import { SectionHead } from "@/components/system/section";
import { TextLink } from "@/components/system/text-link";
import { PLATFORM } from "@/copy/en/platform";
import { DOCS_URL } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: PLATFORM.meta.title,
  description: PLATFORM.meta.description,
  path: "/platform",
});

export default function PlatformPage() {
  const p = PLATFORM;
  return (
    <Page>
      {/* The Iceberg: the GPU above the waterline, the layers we run below. */}
      <IcebergDive />

      {/* The tools */}
      <section aria-labelledby="tools-title" className="section-y">
        <div className="container-page">
          <SectionHead
            id="tools-title"
            kicker={p.tools.kicker}
            title={p.tools.title}
            continuation={p.tools.continuation}
          />
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {p.tools.items.map((t, i) => (
              <li
                key={t.name}
                className="group flex items-start gap-4 rounded-card border border-line bg-bg-raised p-5 transition-[border-color,transform] duration-[var(--dur-spring-smooth)] ease-spring hover:-translate-y-0.5 hover:border-line-strong"
                data-reveal
                style={{ "--i": i % 4 } as React.CSSProperties}
              >
                <DotGlyph name={t.glyph} className="mt-0.5 size-8" />
                <span className="flex flex-col gap-1">
                  <span className="type-body font-semibold text-ink">{t.name}</span>
                  <span className="type-small text-ink-2">{t.what}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="type-caption mt-6 text-ink-3">{p.tools.note}</p>
        </div>
      </section>

      {/* Isolation */}
      <section aria-labelledby="iso-title" className="section-y">
        <div className="container-page">
          <SectionHead id="iso-title" kicker={p.isolation.kicker} title={p.isolation.title} />
          <ul className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {p.isolation.items.map((it, i) => (
              <li
                key={it.title}
                className="flex flex-col gap-3 border-t border-line pt-6"
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
              >
                <h3 className="type-title-3">{it.title}</h3>
                <p className="type-body text-ink-2">{it.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <TextLink href={p.isolation.link.href} arrow>
              {p.isolation.link.label}
            </TextLink>
          </div>
        </div>
      </section>

      <Cta
        title="See it for yourself."
        continuation="The docs go deeper."
        action={{ href: "/contact?intent=workloads", label: "Request access" }}
        secondary={{ href: DOCS_URL, label: "Read the docs" }}
      />
    </Page>
  );
}
