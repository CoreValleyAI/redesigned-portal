/**
 * The mono eyebrow above a headline (05 §2.2, "kicker"). Optional dot in
 * front: hydro for "on" things, an outline for "coming".
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Kicker({
  children,
  className,
  dot,
  as: As = "p",
}: {
  children: ReactNode;
  className?: string;
  dot?: "on" | "soon";
  as?: "p" | "span" | "div" | "h2" | "h3";
}) {
  return (
    <As className={cn("type-kicker flex items-center gap-2.5 text-ink-3", className)}>
      {dot && (
        <span
          aria-hidden="true"
          className={cn(
            "inline-block size-[0.5rem] shrink-0 rounded-full",
            dot === "on" ? "bg-hydro" : "border-[1.5px] border-hydro",
          )}
        />
      )}
      {children}
    </As>
  );
}
