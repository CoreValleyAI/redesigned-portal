/**
 * Facts on the page (docs/revamp/04 §1).
 *
 *  <F id="gpu.memory" />          the value, straight from lib/facts.ts
 *  createNotes([...])              numbered footnotes for one page
 *  <NoteRef notes={n} id="..." />  the superscript marker, linked both ways
 *  <NoteList notes={n} />          the list at the foot of the page
 *
 * A fact that is still `to-verify` renders with a dotted amber underline on
 * staging so it can't be missed in review; a production build refuses it
 * (lib/facts.ts → fact()).
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { asOfLabel, fact, type FactId, isUnverified } from "@/lib/facts";

export function F({ id, className }: { id: FactId; className?: string }) {
  const f = fact(id);
  if (isUnverified(id)) {
    return (
      <span
        className={cn("underline decoration-warn decoration-dotted decoration-2 underline-offset-4", className)}
        title={`To verify before launch · ${f.source.name}`}
        data-unverified={id}
      >
        {f.value}
      </span>
    );
  }
  return <span className={className}>{f.value}</span>;
}

export interface NoteEntry {
  key: string;
  text: ReactNode;
  source?: { name: string; url?: string };
  asOf?: string;
}

export interface Notes {
  /** Footnote number for a key. */
  n: (key: string) => number;
  list: NoteEntry[];
}

/**
 * One page's footnotes, numbered in the order given. Keys are fact ids (the
 * fact's footnote, source and date are used) or custom entries.
 */
export function createNotes(entries: (FactId | NoteEntry)[]): Notes {
  const list: NoteEntry[] = entries.map((e) => {
    if (typeof e !== "string") return e;
    const f = fact(e);
    return {
      key: e,
      text: f.footnote ?? `${f.label}: ${f.value}.`,
      source: f.source,
      asOf: f.asOf,
    };
  });
  const index = new Map(list.map((e, i) => [e.key, i + 1]));
  return {
    list,
    n: (key) => {
      const i = index.get(key);
      if (!i) throw new Error(`No footnote "${key}" on this page; add it to createNotes().`);
      return i;
    },
  };
}

export function NoteRef({ notes, id, className }: { notes: Notes; id: string; className?: string }) {
  const n = notes.n(id);
  return (
    <sup className={cn("ml-0.5 align-super font-sans text-[clamp(0.65rem,0.4em,0.95rem)] font-medium tracking-normal", className)}>
      <a
        href={`#note-${n}`}
        id={`ref-${n}`}
        aria-label={`Note ${n}`}
        className="rounded-[2px] px-0.5 text-ink-3 transition-colors duration-[var(--dur-short)] hover:text-hydro-ink"
      >
        {n}
      </a>
    </sup>
  );
}

export function NoteList({ notes, className }: { notes: Notes; className?: string }) {
  if (!notes.list.length) return null;
  return (
    <aside aria-labelledby="notes-title" className={cn("container-page pb-16", className)}>
      <div className="rule-fade mb-8" />
      <h2 id="notes-title" className="type-kicker mb-5 text-ink-3">
        Notes
      </h2>
      <ol className="grid gap-3 md:grid-cols-2 md:gap-x-12">
        {notes.list.map((e, i) => (
          <li key={e.key} id={`note-${i + 1}`} className="type-caption flex gap-3 text-ink-3 target:text-ink">
            <a href={`#ref-${i + 1}`} className="tabular shrink-0 text-ink-2 hover:text-hydro-ink" aria-label={`Back to note ${i + 1} in the text`}>
              {i + 1}
            </a>
            <span>
              {e.text}
              {e.source && (
                <>
                  {" "}
                  {e.source.url ? (
                    <a href={e.source.url} className="underline decoration-line-strong underline-offset-2 hover:text-ink">
                      {e.source.name}
                    </a>
                  ) : (
                    <span>{e.source.name}</span>
                  )}
                  {e.asOf && <>, {asOfLabel(e.asOf)}</>}.
                </>
              )}
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
