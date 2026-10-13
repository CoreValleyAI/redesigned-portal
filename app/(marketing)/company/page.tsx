import { Brandmark } from "@/components/brand/logo";
import { Page } from "@/components/motion/page";
import { Cta } from "@/components/system/cta";
import { Kicker } from "@/components/system/kicker";
import { SectionHead } from "@/components/system/section";
import { TextLink } from "@/components/system/text-link";
import { COMPANY } from "@/copy/en/company";
import { openJobs } from "@/lib/content/jobs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: COMPANY.meta.title,
  description: COMPANY.meta.description,
  path: "/company",
});

export default function CompanyPage() {
  const c = COMPANY;
  const roles = openJobs().length;

  return (
    <Page>
      <section className="relative pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))] pb-[clamp(3rem,7vw,6rem)]">
        <div className="container-page grid items-end gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-6">
            <Kicker>{c.hero.kicker}</Kicker>
            <h1 className="type-display-2 max-w-[14ch]">
              {c.hero.title} <span className="text-ink-3">{c.hero.continuation}</span>
            </h1>
            <p className="type-lead measure text-ink-2">{c.hero.lead}</p>
          </div>
          <div aria-hidden="true" className="hidden justify-end lg:flex">
            <Brandmark className="w-64 opacity-90" />
          </div>
        </div>
      </section>

      {/* Why we exist: three paragraphs, set large. */}
      <section aria-labelledby="why-title" className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <h2 id="why-title" className="type-kicker text-ink-3">
            {c.why.kicker}
          </h2>
          <div className="flex flex-col gap-8">
            {c.why.paragraphs.map((p, i) => (
              <p
                key={i}
                className="type-title-3 max-w-[34ch] font-medium text-ink"
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="principles-title" className="section-y">
        <div className="container-page">
          <SectionHead id="principles-title" kicker={c.principles.kicker} title={c.principles.title} />
          <ol className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {c.principles.items.map((p, i) => (
              <li
                key={p.title}
                className="flex flex-col gap-3 border-t border-line pt-6"
                data-reveal
                style={{ "--i": i % 3 } as React.CSSProperties}
              >
                <span className="type-kicker text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="type-title-2">{p.title}</h3>
                <p className="type-body text-ink-2">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="vision-title" className="section-y">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <SectionHead
            id="vision-title"
            kicker={c.vision.kicker}
            title={c.vision.title}
            continuation={c.vision.continuation}
            lead={c.vision.lead}
          />
          <ol className="relative flex flex-col gap-10 border-l border-dashed border-line-strong pl-8">
            {c.vision.items.map((v, i) => (
              <li
                key={v.title}
                className="relative flex flex-col gap-2"
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
              >
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 -left-[2.4rem] size-4 rounded-full border-2 border-dashed border-line-strong bg-bg"
                />
                <h3 className="type-title-3">{v.title}</h3>
                <p className="type-body text-ink-2">{v.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="press-title" className="section-y">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-6">
            <SectionHead id="press-title" kicker={c.press.kicker} title={c.press.title} size="title-2" />
            <dl className="flex flex-col">
              {c.press.lines.map((l) => (
                <div key={l.label} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[8rem_1fr]">
                  <dt className="type-kicker self-center text-ink-3">{l.label}</dt>
                  <dd className="type-body text-ink">
                    {"href" in l && l.href ? (
                      <a
                        href={l.href}
                        className="underline decoration-line-strong underline-offset-4 hover:decoration-hydro"
                      >
                        {l.value}
                      </a>
                    ) : (
                      l.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col gap-6">
            <SectionHead kicker={c.careers.kicker} title={c.careers.title} size="title-2" />
            <p className="type-body text-ink-2">
              {roles > 0
                ? `${roles} open ${roles === 1 ? "role" : "roles"} right now.`
                : "No open roles right now — general applications are always welcome."}
            </p>
            <TextLink href="/jobs" arrow>
              See open roles
            </TextLink>
          </div>
        </div>
      </section>

      <Cta
        title="Come and see what we're building."
        action={{ href: "/contact", label: "Get in touch" }}
        secondary={{ href: "/blog", label: "Read the blog" }}
      />
    </Page>
  );
}
