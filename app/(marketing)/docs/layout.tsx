import { Icon } from "@/components/ui";
import { DocsNav } from "@/components/docs/docs-nav";
import { DocsSearch } from "@/components/docs/docs-search";
import { getNav, getSearchDocs } from "@/lib/docs/content";
import { DOCS_URL } from "@/lib/site";

/**
 * The documentation shell: sticky sidebar (search, nav from mkdocs.yml,
 * feedback) beside the page. Content comes from corevalley-docs/docs/ via
 * lib/docs/content.ts and is rendered by the design system, not MkDocs.
 */
/* Once the documentation is served from docs.corevalley.ai
   (NEXT_PUBLIC_DOCS_URL), these in-app pages exist only to forward old links:
   an inline script sends the visitor to the same path on the new host before
   anything renders, and a visible link covers the no-JavaScript case. The
   base path is stripped first so /redesigned-portal/docs/x/ → /x/. */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const REDIRECT = DOCS_URL
  ? `(function(){var p=location.pathname;var b=${JSON.stringify(BASE)};if(b&&p.indexOf(b)===0)p=p.slice(b.length);p=p.replace(/^\\/docs\\/?/,"");location.replace(${JSON.stringify(DOCS_URL)}+"/"+p+location.search+location.hash)})();`
  : "";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const nav = getNav();
  const search = getSearchDocs();

  return (
    <div className="mx-auto max-w-page-xl px-5 py-12 md:px-10">
      {DOCS_URL ? (
        <>
          <script dangerouslySetInnerHTML={{ __html: REDIRECT }} />
          <p className="mb-8 rounded-md border border-line bg-carbon-700 px-4 py-3 text-sm text-ink-300">
            The documentation has moved to{" "}
            <a href={`${DOCS_URL}/`} className="text-hydro underline underline-offset-4">
              {DOCS_URL.replace(/^https?:\/\//, "")}
            </a>
            .
          </p>
        </>
      ) : null}
      <div className="grid gap-10 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-14">
        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto">
          <p className="cv-label mb-4">Documentation</p>
          <DocsSearch docs={search} />
          <DocsNav groups={nav} />

          <a
            href="mailto:info@corevalley.ai"
            className="mt-8 hidden items-center gap-2 text-[13px] text-ink-500 transition-colors duration-normal hover:text-ink-100 lg:inline-flex"
          >
            <Icon name="send" size={14} />
            Docs feedback
          </a>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
