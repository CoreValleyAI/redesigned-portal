import { Icon } from "@/components/ui";
import { DocsNav } from "@/components/docs/docs-nav";
import { DocsSearch } from "@/components/docs/docs-search";
import { getNav, getSearchDocs } from "@/lib/docs/content";

/**
 * The documentation shell: sticky sidebar (search, nav from mkdocs.yml,
 * feedback) beside the page. Content comes from corevalley-docs/docs/ via
 * lib/docs/content.ts and is rendered by the design system, not MkDocs.
 */
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const nav = getNav();
  const search = getSearchDocs();

  return (
    <div className="mx-auto max-w-page-xl px-5 py-12 md:px-10">
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
