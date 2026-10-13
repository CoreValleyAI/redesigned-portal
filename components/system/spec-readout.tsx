/**
 * Spec readout (S15, engineer mode): facts from the registry as a plain
 * monospace table (label and value, aligned) for people who want
 * the raw numbers rather than the story. It is labelled a specification
 * readout and never dressed up as command output from our machines.
 *
 * Rendered on the server and shown only in engineer mode (a CSS attribute
 * on <html>), so switching the mode never shifts the layout it doesn't
 * touch. Only confirmed facts are listed.
 */
import { cn } from "@/lib/cn";
import { fact, isUnverified, type FactId } from "@/lib/facts";

export function SpecReadout({ title, ids, className }: { title: string; ids: FactId[]; className?: string }) {
  const rows = ids.filter((id) => !isUnverified(id)).map((id) => ({ id, f: fact(id) }));
  if (!rows.length) return null;
  return (
    <figure
      className={cn("hidden overflow-hidden rounded-card border border-line bg-bg-sunken engineer:block", className)}
    >
      <figcaption className="type-kicker flex items-center justify-between gap-4 border-b border-line px-4 py-2.5 text-ink-3">
        <span>{title}</span>
        <span>Specification readout</span>
      </figcaption>
      <dl className="grid font-mono text-[0.8125rem] leading-snug md:grid-cols-2 md:gap-x-10 md:px-4">
        {rows.map(({ id, f }) => (
          <div
            key={id}
            className="flex items-baseline justify-between gap-6 border-b border-line px-4 py-2.5 last:border-b-0 md:px-0 md:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
          >
            <dt className="text-ink-3">{f.label}</dt>
            <dd className="text-right text-ink tabular">{f.value}</dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
