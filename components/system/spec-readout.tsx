/**
 * Spec readout (S15, engineer mode): facts from the registry as a plain
 * monospace table (label, value, then its source and date) for people who want
 * the raw numbers rather than the story. It is labelled a specification
 * readout and never dressed up as command output from our machines.
 *
 * Rendered on the server and shown only in engineer mode (a CSS attribute
 * on <html>), so switching the mode never shifts the layout it doesn't
 * touch. Only confirmed facts are listed.
 */
import { Fragment } from "react";
import { cn } from "@/lib/cn";
import { asOfLabel, fact, isUnverified, type FactId } from "@/lib/facts";

export function SpecReadout({ title, ids, className }: { title: string; ids: FactId[]; className?: string }) {
  const rows = ids.filter((id) => !isUnverified(id)).map((id) => ({ id, f: fact(id) }));
  if (!rows.length) return null;
  return (
    <figure
      className={cn("hidden overflow-hidden rounded-card border border-line bg-bg-sunken engineer:block", className)}
    >
      <figcaption className="type-kicker flex items-center justify-between gap-4 border-b border-line px-4 py-2.5 text-ink-3">
        <span>{title}</span>
        <span className="text-ink-4">Specification readout</span>
      </figcaption>
      <dl className="grid grid-cols-[minmax(0,20ch)_minmax(0,1fr)] gap-x-5 gap-y-3 px-4 py-4 font-mono text-[0.8125rem] leading-snug">
        {rows.map(({ id, f }) => (
          <Fragment key={id}>
            <dt className="text-ink-3">{f.label}</dt>
            <dd className="text-ink">
              {f.value}
              <span className="block text-[0.75rem] text-ink-4">
                # {f.source.name}, {asOfLabel(f.asOf)}
              </span>
            </dd>
          </Fragment>
        ))}
      </dl>
    </figure>
  );
}
