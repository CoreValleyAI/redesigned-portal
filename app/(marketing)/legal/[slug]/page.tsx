import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Page } from "@/components/motion/page";
import { AppLink } from "@/components/system/app-link";
import { Kicker } from "@/components/system/kicker";
import { LEGAL, LEGAL_NOTE, type LegalPage } from "@/copy/en/legal";
import { pageMetadata } from "@/lib/seo";

/**
 * The three legal pages the footer links to: privacy, terms and data
 * residency. The text lives in copy/en/legal.ts. Each page is a numbered
 * list of sections with a sticky index on wide screens, and ends by saying
 * plainly that it is a summary, not the contract.
 */

type Slug = keyof typeof LEGAL;
const SLUGS = Object.keys(LEGAL) as Slug[];
const EMAIL = "info@corevalley.ai";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Turn the mailbox address inside a sentence into a link. */
function withMail(text: string) {
  const parts = text.split(EMAIL);
  return parts.flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <a
            key={i}
            href={`mailto:${EMAIL}`}
            className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-hydro"
          >
            {EMAIL}
          </a>,
          part,
        ],
  );
}

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

function pageFor(slug: string): LegalPage | undefined {
  return (SLUGS as string[]).includes(slug) ? LEGAL[slug as Slug] : undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pageFor(slug);
  if (!page) return {};
  return pageMetadata({ title: page.title, description: page.lead, path: `/legal/${slug}` });
}

export default async function LegalRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = pageFor(slug);
  if (!page) notFound();
  const others = SLUGS.filter((s) => s !== slug);

  return (
    <Page>
      <section className="pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))] pb-[clamp(2.5rem,6vw,5rem)]">
        <div className="container-page">
          <div className="flex max-w-[60rem] flex-col gap-6">
            <Kicker>Legal</Kicker>
            <h1 className="type-display-2 max-w-[14ch]">{page.title}</h1>
            <p className="type-lead measure text-ink-2">{page.lead}</p>
            <p className="type-caption font-mono text-ink-3">Last updated {page.updated}</p>
          </div>
        </div>
      </section>

      <div className="container-page pb-[var(--section-y)]">
        <div className="grid gap-12 border-t border-line pt-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-20 lg:pt-16">
          {/* On a phone the index would only repeat the headings below it. */}
          <nav
            aria-label="On this page"
            className="hidden lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:block lg:self-start"
          >
            <p className="type-kicker text-ink-3">On this page</p>
            <ol className="mt-5 flex flex-col gap-3">
              {page.sections.map((s, i) => (
                <li key={s.heading}>
                  <a
                    href={`#${slugify(s.heading)}`}
                    className="type-small flex gap-3 text-ink-2 transition-colors duration-[var(--dur-short)] hover:text-ink"
                  >
                    <span aria-hidden="true" className="font-mono text-ink-3 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6">
              <p className="type-kicker text-ink-3">Also</p>
              {others.map((s) => (
                <AppLink
                  key={s}
                  href={`/legal/${s}`}
                  className="type-small text-ink-2 transition-colors duration-[var(--dur-short)] hover:text-ink"
                >
                  {LEGAL[s].title}
                </AppLink>
              ))}
            </div>
          </nav>

          <article className="max-w-[44rem]">
            {page.sections.map((s, i) => (
              <section
                key={s.heading}
                id={slugify(s.heading)}
                aria-labelledby={`${slugify(s.heading)}-h`}
                className="scroll-mt-[calc(var(--header-h)+1.5rem)] border-t border-line py-10 first:border-t-0 first:pt-0"
              >
                <h2 id={`${slugify(s.heading)}-h`} className="type-title-3 flex items-baseline gap-4">
                  <span aria-hidden="true" className="type-kicker text-hydro-ink tabular-nums light:text-hydro">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.heading}
                </h2>
                {s.paragraphs.map((p) => (
                  <p key={p} className="type-body mt-4 text-ink-2">
                    {withMail(p)}
                  </p>
                ))}
                {s.bullets && (
                  <ul className="mt-5 flex flex-col gap-3">
                    {s.bullets.map((b) => (
                      <li key={b} className="type-body flex gap-3.5 text-ink-2">
                        <span aria-hidden="true" className="mt-[0.62em] size-1.5 shrink-0 rounded-full bg-hydro" />
                        <span>{withMail(b)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <aside className="mt-6 rounded-panel border border-line bg-bg-sunken p-6 md:p-8">
              <p className="type-small text-ink-2">{withMail(LEGAL_NOTE)}</p>
            </aside>
          </article>
        </div>
      </div>
    </Page>
  );
}
