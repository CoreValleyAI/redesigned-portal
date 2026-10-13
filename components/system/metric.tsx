/**
 * Metric — the one big number a moment is about (05 §7, 01 §4.3): the
 * value, its unit, what it means in a sentence, and a footnote marker.
 * A number gets a whole moment, not a cell in a stat strip.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Metric({
  value,
  unit,
  caption,
  note,
  size = "metric",
  className,
  accent = false,
}: {
  value: ReactNode;
  unit?: ReactNode;
  caption?: ReactNode;
  note?: ReactNode;
  size?: "metric" | "display-2" | "title-1";
  className?: string;
  /** Hydro numerals (one per page, at most). */
  accent?: boolean;
}) {
  const sizeClass = { metric: "type-metric", "display-2": "type-display-2 tabular", "title-1": "type-title-1 tabular" }[
    size
  ];
  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <p
        className={cn(
          sizeClass,
          "flex items-baseline gap-[0.12em]",
          accent ? "text-hydro-ink light:text-hydro" : "text-ink",
        )}
      >
        <span>{value}</span>
        {unit && <span className="text-[0.42em] font-medium tracking-[-0.01em] text-ink-2">{unit}</span>}
        {note && <span className="self-start text-[0.22em]">{note}</span>}
      </p>
      {caption && <figcaption className="type-body measure text-ink-2">{caption}</figcaption>}
    </figure>
  );
}
