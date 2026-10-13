"use client";

/**
 * The rail beside "From snow to token": five stations on a dotted line, and
 * a light that travels down it as you read (the Flow). The station whose
 * beat crosses the middle of the screen switches on. Progress comes from
 * lib/motion/scroll (no layout reads per frame) and is written straight to
 * a CSS variable — React re-renders only when the active station changes.
 */
import { useEffect, useRef, useState } from "react";
import { DotGlyph, type GlyphName } from "@/components/system/dot-glyph";
import { cn } from "@/lib/cn";
import { trackScroll } from "@/lib/motion/scroll";

export function JourneyRail({
  beats,
  listId,
}: {
  beats: { id: string; glyph: GlyphName; label: string }[];
  /** The id of the list of beats this rail follows. */
  listId: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const list = document.getElementById(listId);
    const el = ref.current;
    if (!list || !el) return;
    const n = beats.length;
    return trackScroll(
      list,
      "center",
      (p) => {
        el.style.setProperty("--p", p.toFixed(4));
        setActive(Math.min(n - 1, Math.floor(p * n)));
      },
      0.12,
    );
  }, [beats.length, listId]);

  return (
    <div aria-hidden="true" className="hidden lg:block">
      <div ref={ref} className="sticky top-[calc(var(--header-h)+10svh)] flex h-[72svh] flex-col justify-between py-4">
        {/* The line, and the light travelling down it. */}
        <div className="absolute top-8 bottom-8 left-[1.375rem] w-px bg-[repeating-linear-gradient(to_bottom,var(--line-strong)_0_2px,transparent_2px_8px)] opacity-70" />
        <div
          className="absolute top-8 bottom-8 left-[1.375rem] w-px origin-top bg-gradient-to-b from-transparent via-hydro to-hydro will-change-transform"
          style={{ transform: "scaleY(var(--p, 0))" }}
        />
        <div
          className="absolute top-8 left-[1.375rem] size-2.5 rounded-full bg-hydro shadow-[0_0_0_4px_var(--hydro-wash),0_0_18px_var(--hydro)] will-change-transform"
          style={{ transform: "translate(-50%, -50%) translateY(calc((72svh - 4rem) * var(--p, 0)))" }}
        />

        {beats.map((b, i) => (
          <div key={b.id} className="relative flex items-center gap-5">
            <span
              className={cn(
                "grid size-11 place-items-center rounded-full border bg-bg transition-[border-color,transform] duration-[var(--dur-spring-smooth)] ease-spring",
                i === active ? "scale-110 border-hydro" : "border-line",
              )}
            >
              <DotGlyph name={b.glyph} className="size-6" on={i <= active} />
            </span>
            <span
              className={cn(
                "type-kicker transition-[color,opacity] duration-[var(--dur-base)]",
                i === active ? "text-ink" : "text-ink-3",
              )}
            >
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
