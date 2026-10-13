/**
 * Status — the one way availability is shown (05 §7): a mono label, a rule,
 * and the plain-English detail. Deliberately quiet: no glowing pill, no
 * pulse. An outlined dot means "coming"; a filled one means "live".
 */
import { cn } from "@/lib/cn";
import { STATUS, type StatusId } from "@/lib/availability";

export function Status({ id = "h200", className }: { id?: StatusId; className?: string }) {
  const s = STATUS[id];
  return (
    <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      <span className="type-kicker inline-flex items-center gap-2 text-ink">
        <span
          aria-hidden="true"
          className={cn(
            "inline-block size-2 rounded-full",
            s.state === "live" ? "bg-hydro" : "border-[1.5px] border-hydro",
          )}
        />
        {s.label}
      </span>
      <span aria-hidden="true" className="h-px w-6 bg-line-strong/60" />
      <span className="type-small text-ink-2">{s.detail}</span>
    </p>
  );
}
