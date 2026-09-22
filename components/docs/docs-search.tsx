"use client";

/**
 * ⌘K search over the documentation.
 *
 * The index is a list of heading-delimited sections computed at build time
 * by lib/docs/content.ts and passed in as a prop; MiniSearch indexes it on
 * first open (a few kilobytes today). The palette is a native <dialog>
 * (focus trap, Escape, inert background for free) in the site's glass
 * treatment, with combobox/listbox semantics for keyboard navigation.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import MiniSearch from "minisearch";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { SearchDoc } from "@/lib/docs/content";

interface Hit extends SearchDoc {
  score: number;
}

const LIMIT = 12;

function buildIndex(docs: SearchDoc[]) {
  const ms = new MiniSearch<SearchDoc>({
    fields: ["page", "heading", "text"],
    storeFields: ["page", "section", "url", "heading", "anchor", "text"],
    searchOptions: {
      boost: { page: 3, heading: 2 },
      prefix: true,
      fuzzy: 0.2,
      combineWith: "AND",
    },
  });
  ms.addAll(docs);
  return ms;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** A window of `text` around the first query term, split for highlighting. */
function snippet(text: string, terms: string[]): React.ReactNode {
  if (!text) return null;
  const re = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "ig");
  const at = text.search(re);
  const start = at < 0 ? 0 : Math.max(0, at - 60);
  let slice = text.slice(start, start + 170);
  if (start > 0) slice = `…${slice.replace(/^\S*\s/, "")}`;
  if (start + 170 < text.length) slice = `${slice.replace(/\s\S*$/, "")}…`;
  const parts = slice.split(re);
  return parts.map((p, i) =>
    re.test(p) ? (
      <mark key={i} className="rounded-xs bg-hydro/15 text-hydro-300">
        {p}
      </mark>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    ),
  );
}

export function DocsSearch({ docs }: { docs: SearchDoc[] }) {
  const router = useRouter();
  const dialog = React.useRef<HTMLDialogElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const input = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [cursor, setCursor] = React.useState(0);
  const [mod, setMod] = React.useState<"⌘" | "Ctrl" | null>(null);
  const index = React.useMemo(() => (open ? buildIndex(docs) : null), [open, docs]);

  // The shortcut hint depends on the platform: decide after hydration.
  React.useEffect(() => {
    setMod(/mac|iphone|ipad/i.test(navigator.platform) ? "⌘" : "Ctrl");
  }, []);

  // ⌘K / Ctrl+K anywhere on the page.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    const dlg = dialog.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      dlg.showModal();
      input.current?.focus();
    }
    if (!open && dlg.open) dlg.close();
  }, [open]);

  const close = React.useCallback(() => {
    setOpen(false);
    setQuery("");
    setCursor(0);
    trigger.current?.focus();
  }, []);

  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const hits: Hit[] = React.useMemo(() => {
    if (!index || !terms.length) return [];
    return index
      .search(query)
      .slice(0, LIMIT)
      .map((r) => ({
        id: String(r.id),
        page: r.page as string,
        section: (r.section as string | null) ?? null,
        url: r.url as string,
        heading: r.heading as string,
        anchor: r.anchor as string,
        text: r.text as string,
        score: r.score,
      }));
  }, [index, query, terms.length]);

  // Group consecutive hits by page, keeping score order.
  const groups: { page: string; section: string | null; hits: Hit[] }[] = [];
  for (const h of hits) {
    const g = groups.find((x) => x.page === h.page);
    if (g) g.hits.push(h);
    else groups.push({ page: h.page, section: h.section, hits: [h] });
  }
  const flat = groups.flatMap((g) => g.hits);

  function go(hit: Hit) {
    close();
    router.push(hit.anchor ? `${hit.url}#${hit.anchor}` : hit.url);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (flat.length ? (c + 1) % flat.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (flat.length ? (c - 1 + flat.length) % flat.length : 0));
    } else if (e.key === "Enter") {
      const hit = flat[cursor];
      if (hit) {
        e.preventDefault();
        go(hit);
      }
    }
  }

  const activeId = flat[cursor] ? `docs-hit-${cursor}` : undefined;

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the documentation"
        aria-keyshortcuts="Control+K Meta+K"
        className="mb-6 flex w-full items-center gap-2 rounded-md border border-line bg-carbon-700/60 px-2.5 py-2 text-[13px] text-ink-500 transition-colors duration-fast hover:border-line-strong hover:text-ink-200"
      >
        <Icon name="search" size={14} />
        <span className="flex-1 text-left">Search docs…</span>
        {mod ? (
          <kbd className="rounded-sm border border-line bg-carbon-600 px-1.5 py-px font-mono text-[10px] text-ink-500">
            {mod} K
          </kbd>
        ) : null}
      </button>

      <dialog
        ref={dialog}
        onClose={close}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
        aria-label="Search the documentation"
        className="glass-modal m-auto mt-[10vh] w-[min(40rem,calc(100vw-2rem))] rounded-lg p-0 text-fg backdrop:bg-carbon-900/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 border-b border-line-subtle px-4 py-3">
          <Icon name="search" size={16} className="shrink-0 text-ink-500" />
          <input
            ref={input}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search docs"
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-controls="docs-search-results"
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent font-mono text-[14px] text-ink-100 outline-none placeholder:text-ink-600"
          />
          <kbd className="hidden rounded-sm border border-line bg-carbon-600 px-1.5 py-px font-mono text-[10px] text-ink-500 sm:inline">
            esc
          </kbd>
        </div>

        <ul
          id="docs-search-results"
          role="listbox"
          aria-label="Results"
          className="max-h-[50vh] overflow-y-auto p-2"
        >
          {!terms.length ? (
            <li className="px-2.5 py-8 text-center text-[13px] text-ink-500">
              Type to search {docs.length} sections across the docs.
            </li>
          ) : !hits.length ? (
            <li className="px-2.5 py-8 text-center text-[13px] text-ink-500">
              No results for “{query.trim()}”.
            </li>
          ) : (
            groups.map((g) => (
              <li key={g.page} role="presentation">
                <p className="cv-label px-2.5 pt-2 pb-1 text-[10px]">
                  {g.section ? `${g.section} · ${g.page}` : g.page}
                </p>
                <ul role="presentation">
                  {g.hits.map((h) => {
                    const i = flat.indexOf(h);
                    const on = i === cursor;
                    return (
                      <li
                        key={h.id}
                        id={`docs-hit-${i}`}
                        role="option"
                        aria-selected={on}
                        onMouseMove={() => setCursor(i)}
                        onClick={() => go(h)}
                        className={cn(
                          "flex cursor-pointer flex-col gap-0.5 rounded-md px-2.5 py-2 transition-colors duration-fast",
                          on ? "bg-carbon-600 text-ink-100" : "text-ink-300",
                        )}
                      >
                        <span className="flex items-center gap-2 text-[13.5px] font-medium">
                          <Icon
                            name={h.anchor ? "caret-right" : "docs"}
                            size={12}
                            className={on ? "text-hydro" : "text-ink-600"}
                          />
                          {h.heading}
                        </span>
                        <span className="line-clamp-2 pl-5 text-[12.5px] leading-relaxed text-ink-500">
                          {snippet(h.text, terms)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center gap-4 border-t border-line-subtle px-4 py-2 font-mono text-[10.5px] text-ink-600">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
          <span className="ml-auto sr-only" aria-live="polite">
            {terms.length ? `${hits.length} results` : ""}
          </span>
        </div>
      </dialog>
    </>
  );
}
