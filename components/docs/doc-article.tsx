import Link from "next/link";
import { Card, Icon } from "@/components/ui";
import type { DocPage } from "@/lib/docs/content";
import { DocMarkdown } from "./markdown";
import { DocsToc } from "./docs-toc";

/**
 * One documentation page: eyebrow, title, the rendered Markdown, a table of
 * contents on wide screens, previous/next, and the closing contact card.
 */
export function DocArticle({ page }: { page: DocPage }) {
  const toc = page.headings.length >= 2 ? page.headings : [];
  return (
    <div className={toc.length ? "grid gap-10 xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-12" : undefined}>
      <article className="min-w-0">
        <p className="cv-label">{page.section ?? "Documentation"}</p>
        <h1 className="mt-3 display text-[clamp(1.8rem,3.6vw,2.3rem)]">{page.heading}</h1>

        <div className="prose-docs mt-8">
          <DocMarkdown body={page.body} pageFile={page.file} />
        </div>

        {page.prev || page.next ? (
          <nav
            aria-label="Pagination"
            className="mt-14 grid gap-4 border-t border-line-subtle pt-8 sm:grid-cols-2"
          >
            {page.prev ? (
              <Link
                href={page.prev.url}
                className="group flex flex-col gap-1 rounded-lg border border-line p-4 transition-colors duration-normal hover:border-line-strong"
              >
                <span className="cv-label text-[10px]">Previous</span>
                <span className="flex items-center gap-2 text-[14px] font-medium text-ink-100">
                  <Icon
                    name="arrow-right"
                    size={14}
                    className="rotate-180 text-ink-600 transition-transform duration-normal ease-out group-hover:-translate-x-1"
                  />
                  {page.prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {page.next ? (
              <Link
                href={page.next.url}
                className="group flex flex-col gap-1 rounded-lg border border-line p-4 text-right transition-colors duration-normal hover:border-line-strong sm:col-start-2"
              >
                <span className="cv-label text-[10px]">Next</span>
                <span className="flex items-center justify-end gap-2 text-[14px] font-medium text-ink-100">
                  {page.next.title}
                  <Icon
                    name="arrow-right"
                    size={14}
                    className="text-ink-600 transition-transform duration-normal ease-out group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ) : null}
          </nav>
        ) : null}

        <Card surface="solid" padding={22} className="mt-12">
          <div className="flex items-start gap-3">
            <Icon name="info" size={18} weight="duotone" className="mt-0.5 shrink-0 text-info" />
            <p className="text-[13.5px] leading-relaxed text-ink-400">
              These docs cover the platform as it ships today. For anything not
              documented here, email{" "}
              <a
                href="mailto:info@corevalley.ai"
                className="text-hydro underline decoration-hydro/40 underline-offset-4 transition-colors duration-normal hover:text-hydro-300"
              >
                info@corevalley.ai
              </a>.
            </p>
          </div>
        </Card>
      </article>

      {toc.length ? <DocsToc headings={toc} /> : null}
    </div>
  );
}
