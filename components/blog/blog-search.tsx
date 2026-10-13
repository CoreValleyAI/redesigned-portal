"use client";

/**
 * Blog search. A button opens a native <dialog>; the small JSON index
 * (/blog/search-index.json, built with the site) is fetched on first open
 * and searched with MiniSearch — the same library the docs search uses.
 * "/" and ⌘K / Ctrl+K open it from anywhere on the blog.
 */
import * as React from "react";
import Link from "next/link";
import MiniSearch from "minisearch";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/content/format";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface Doc {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string;
  authors: string;
  text: string;
  date: string;
}

export function BlogSearch({ className }: { className?: string }) {
  const dialog = React.useRef<HTMLDialogElement>(null);
  const input = React.useRef<HTMLInputElement>(null);
  const [index, setIndex] = React.useState<MiniSearch<Doc> | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);

  const load = React.useCallback(async () => {
    if (index || failed) return;
    try {
      const res = await fetch(`${BASE}/blog/search-index.json`);
      const docs: Doc[] = await res.json();
      const ms = new MiniSearch<Doc>({
        fields: ["title", "excerpt", "category", "tags", "authors", "text"],
        storeFields: ["title", "excerpt", "category", "date"],
        searchOptions: { boost: { title: 4, tags: 2, excerpt: 2 }, prefix: true, fuzzy: 0.2 },
      });
      ms.addAll(docs);
      setIndex(ms);
    } catch {
      setFailed(true);
    }
  }, [index, failed]);

  const open = React.useCallback(() => {
    dialog.current?.showModal();
    void load();
    requestAnimationFrame(() => input.current?.focus());
  }, [load]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, select, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const hits = React.useMemo(
    () => (index && q.trim() ? index.search(q.trim()).slice(0, 8) : []),
    [index, q],
  ) as unknown as (Doc & { id: string })[];

  React.useEffect(() => setActive(0), [q]);

  const go = (slug: string) => {
    window.location.href = `${BASE}/blog/${slug}/`;
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={cn(
          "inline-flex h-10 items-center gap-2.5 rounded-full border border-line bg-surface-card pr-3 pl-4 text-[13.5px] text-ink-400 transition-colors hover:border-line-strong hover:text-ink-200",
          className,
        )}
      >
        <Icon name="search" size={15} />
        Search posts
        <kbd className="ml-2 rounded border border-line px-1.5 font-mono text-[10.5px] text-ink-500">/</kbd>
      </button>

      <dialog
        ref={dialog}
        aria-label="Search the blog"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] rounded-[1.5rem] border border-line bg-surface-card p-0 text-ink-100 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 border-b border-line-subtle px-5">
          <Icon name="search" size={17} className="text-ink-500" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, hits.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && hits[active]) {
                go(hits[active]!.id);
              }
            }}
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-controls="blog-search-results"
            aria-activedescendant={hits[active] ? `bs-${hits[active]!.id}` : undefined}
            placeholder="Search posts, topics and authors"
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-500"
          />
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="text-[12px] text-ink-500 hover:text-ink-200"
          >
            Esc
          </button>
        </div>
        <ul id="blog-search-results" role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
          {failed ? (
            <li className="px-4 py-6 text-center text-[14px] text-ink-500">Search couldn’t load. Try again later.</li>
          ) : null}
          {!failed && q.trim() && index && !hits.length ? (
            <li className="px-4 py-6 text-center text-[14px] text-ink-500">No posts match “{q}”.</li>
          ) : null}
          {hits.map((h, i) => (
            <li key={h.id} id={`bs-${h.id}`} role="option" aria-selected={i === active}>
              <Link
                href={`/blog/${h.id}/`}
                onMouseEnter={() => setActive(i)}
                className={cn("block rounded-2xl px-4 py-3", i === active && "bg-carbon-700/40")}
              >
                <p className="text-[15px] font-medium text-ink-100">{h.title}</p>
                <p className="mt-0.5 line-clamp-1 text-[13px] text-ink-500">{h.excerpt}</p>
                <p className="mt-1 font-mono text-[11px] text-ink-500">
                  {[h.category, formatDate(h.date)].filter(Boolean).join(" · ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
