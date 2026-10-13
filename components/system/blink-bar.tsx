/**
 * A time scale against a blink (S10, and "memory you can feel"): one bar is
 * a blink at the short end of its range (100 ms), divided into dots; the
 * span being explained is lit from the left. Static and exact: the lit
 * fraction is computed, not animated, so it reads the same with reduced
 * motion. Decorative; the sentence beside it carries the meaning.
 */
import { cn } from "@/lib/cn";

export function BlinkBar({
  ms,
  blink = 100,
  dots = 50,
  label,
  className,
}: {
  /** The span to light, in milliseconds. */
  ms: number;
  blink?: number;
  dots?: number;
  label: string;
  className?: string;
}) {
  const lit = Math.max(1, Math.round((ms / blink) * dots));
  return (
    <figure className={cn("flex flex-col gap-3", className)}>
      <div aria-hidden="true" className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${dots}, minmax(0, 1fr))` }}>
        {Array.from({ length: dots }, (_, i) => (
          <span
            key={i}
            className={cn("aspect-square rounded-full", i < lit ? "bg-hydro" : "bg-dot-off")}
            style={i < lit ? { animation: `cv-fade-in 300ms var(--ease-out) ${i * 18}ms both` } : undefined}
          />
        ))}
      </div>
      <figcaption className="type-caption flex justify-between text-ink-3">
        <span>{label}</span>
        <span>a quick blink · {blink} ms</span>
      </figcaption>
    </figure>
  );
}
