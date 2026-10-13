/**
 * Spec rows — a server-rendered definition list in the mono/sans pairing
 * of a datasheet. Values come from lib/facts.ts by id (or literal rows for
 * things that are not facts). Rows read left/right on wide screens and
 * stack on narrow ones.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { fact, type FactId } from "@/lib/facts";
import { F } from "./fact";

export type SpecRow = FactId | { label: ReactNode; value: ReactNode };

export function SpecList({
  rows,
  className,
  dense = false,
}: {
  rows: SpecRow[];
  className?: string;
  dense?: boolean;
}) {
  return (
    <dl className={cn("divide-y divide-line border-y border-line", className)}>
      {rows.map((row, i) => {
        const isFact = typeof row === "string";
        const label = isFact ? fact(row).label : row.label;
        const value = isFact ? <F id={row} /> : row.value;
        return (
          <div
            key={isFact ? row : i}
            className={cn(
              "grid gap-1 sm:grid-cols-[minmax(10rem,1fr)_2fr] sm:gap-6",
              dense ? "py-2.5" : "py-4",
            )}
          >
            <dt className="type-kicker self-center text-ink-3">{label}</dt>
            <dd className="type-body tabular text-ink">{value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
