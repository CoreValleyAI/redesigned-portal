/**
 * Key facts: a row of labelled values, the fact-sheet pattern serious
 * infrastructure pages open with. Each value can carry its footnote; the
 * row reflows from two columns on a phone to all six on a wide screen.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface KeyFact {
  label: string;
  value: ReactNode;
  caption?: ReactNode;
}

export function KeyFacts({ items, className }: { items: KeyFact[]; className?: string }) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 overflow-hidden rounded-panel border border-line bg-bg-raised md:grid-cols-3 xl:grid-cols-6",
        className,
      )}
    >
      {items.map((it, i) => (
        <div
          key={it.label}
          className="-mt-px -ml-px flex flex-col gap-2 border-t border-l border-line p-5 md:p-6"
          data-reveal
          style={{ "--i": i % 6 } as React.CSSProperties}
        >
          <dt className="type-kicker text-ink-3">{it.label}</dt>
          <dd className="flex flex-col gap-1">
            <span className="type-title-3 text-ink">{it.value}</span>
            {it.caption ? <span className="type-caption text-ink-3">{it.caption}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
