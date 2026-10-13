"use client";

/**
 * The platform as strata (08 §6): five plates of liquid glass stacked over a
 * slow, drifting light — the GPU at the bottom, the workspace you touch on
 * top, lit in hydro. Each plate is real backdrop glass (app/styles/glass.css,
 * .lg), so the light behind it blurs and bends through every pane; the
 * stack answers the pointer with a gentle tilt and lifts the plate under
 * it. The text beside it is the real content (this is decorative).
 */
import { useRef } from "react";
import { cn } from "@/lib/cn";

const KIND: Record<string, string> = {
  aie: "Workspace",
  nvaie: "AI software",
  storage: "Storage",
  network: "Network",
  gpu: "Compute",
};

export function Strata({
  layers,
  className,
}: {
  layers: readonly { id: string; name: string; touch: boolean }[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const n = layers.length;

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--tx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty("--ty", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };
  const leave = () => {
    ref.current?.style.setProperty("--tx", "0");
    ref.current?.style.setProperty("--ty", "0");
  };

  return (
    <div
      ref={ref}
      aria-hidden="true"
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn("strata relative isolate py-10", className)}
    >
      {/* The light behind the glass. */}
      <div className="strata__light pointer-events-none absolute inset-0 -z-10">
        <span className="strata__orb strata__orb--a" />
        <span className="strata__orb strata__orb--b" />
        <span className="strata__orb strata__orb--c" />
      </div>

      <div className="strata__stack flex flex-col items-center gap-3">
        {layers.map((l, i) => (
          <div
            key={l.id}
            data-refract
            data-refract-bezel="14"
            className={cn("strata__plate", l.touch ? "lg-hydro text-on-hydro" : "lg text-ink")}
            style={{ "--i": i, width: `${74 + (i / (n - 1)) * 26}%` } as React.CSSProperties}
          >
            <span className={cn("font-mono text-[0.6875rem] tabular", l.touch ? "" : "text-ink-2")}>
              {String(n - i).padStart(2, "0")}
            </span>
            <span className="truncate text-[0.9375rem] font-semibold tracking-[-0.01em]">{l.name}</span>
            <span className={cn("type-kicker ml-auto hidden shrink-0 sm:inline", l.touch ? "" : "text-ink-2")}>
              {KIND[l.id] ?? ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
