"use client";

/**
 * A row of racks in perspective, built from the site's own materials: glass
 * panels, hairline borders, mono labels, Hydro LEDs. No canvas.
 *
 * Three racks stand side by side on a stage rotated a few degrees so their
 * top and side faces show. Each holds node trays whose GPU cells rise and
 * fall like utilisation (the `.rack__fill` animation) with an LED that blinks
 * now and then.
 *
 * Hover:
 *  · The stage leans toward the pointer.
 *  · The rack under the pointer pulls out of the row and its trays fan open
 *    like drawers — a staggered depth step from top to bottom — while its
 *    side and top faces deepen to match.
 *  · Load follows the cursor: cells near it climb to full and glow, cells
 *    further away settle back, across all three racks at once. That part is
 *    JavaScript (one rAF per pointer move, writing a `--hot` value per cell);
 *    everything else is CSS. Static under `prefers-reduced-motion`.
 */

import * as React from "react";
import { cn } from "@/lib/cn";

const RACKS = [
  { id: "rack a", sku: "h200", trays: 9, gpus: 8, note: "training" },
  { id: "rack b", sku: "h100", trays: 9, gpus: 8, note: "inference" },
  { id: "rack c", sku: "h100", trays: 9, gpus: 4, note: "notebooks" },
] as const;

/** Radius of the load wave around the pointer, px. */
const WAVE = 120;

export function RackRow3D({
  className,
  /** Index of a rack to hold pulled-out and lit, as if hovered — driven by
   *  the pinned story's active step. Undefined leaves the row at rest. */
  lit,
}: {
  className?: string;
  lit?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const cells = Array.from(el.querySelectorAll<HTMLElement>("[data-cell]"));
    let frame = 0;
    let last: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      el.style.setProperty("--ry", `${16 + nx * 6}deg`);
      el.style.setProperty("--rx", `${-8 - ny * 4}deg`);

      // The wave. Rects are read each frame rather than cached: the racks
      // are in 3D and their projected boxes move with the tilt.
      for (const c of cells) {
        const b = c.getBoundingClientRect();
        const dx = b.left + b.width / 2 - e.clientX;
        const dy = b.top + b.height / 2 - e.clientY;
        const d = Math.hypot(dx, dy);
        const hot = d < WAVE ? (1 - d / WAVE) ** 1.6 : 0;
        const prev = Number(c.dataset.hot ?? 0);
        if (Math.abs(hot - prev) > 0.02) {
          c.dataset.hot = hot.toFixed(2);
          c.style.setProperty("--hot", hot.toFixed(2));
        }
      }
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      last = null;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      el.style.removeProperty("--ry");
      el.style.removeProperty("--rx");
      for (const c of cells) {
        c.dataset.hot = "0";
        c.style.removeProperty("--hot");
      }
    };
    // Touch: a tap pulls that rack out (data-tap carries the hover pose)
    // and lights the cells around the finger; it all settles a moment later.
    let tapTimer = 0;
    const onTap = (e: PointerEvent) => {
      if (fine) return;
      const rack = (e.target as HTMLElement).closest<HTMLElement>(".rack3d__rack");
      for (const r of el.querySelectorAll<HTMLElement>(".rack3d__rack")) delete r.dataset.tap;
      if (rack) rack.dataset.tap = "";
      onMove(e);
      window.clearTimeout(tapTimer);
      tapTimer = window.setTimeout(() => {
        if (rack) delete rack.dataset.tap;
        onLeave();
      }, 1600);
    };
    el.addEventListener("pointerdown", onTap, { passive: true });
    if (fine) {
      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerleave", onLeave, { passive: true });
    }
    return () => {
      el.removeEventListener("pointerdown", onTap);
      window.clearTimeout(tapTimer);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-lit={lit === undefined ? undefined : lit}
      className={cn("rack3d", className)}
    >
      <div className="rack3d__stage">
        {RACKS.map((rack, i) => (
          <div
            key={rack.id}
            className="rack3d__rack glass-panel rounded-md"
            // Depth steps are positive — every rack sits in front of the
            // stage's plane. Behind it, the (transparent) stage would win
            // hit-testing in a preserve-3d context and :hover would never
            // reach a rack.
            style={{ "--z": `${(RACKS.length - 1 - i) * 28}px` } as React.CSSProperties}
          >
            <span className="rack3d__side" />
            <span className="rack3d__top" />

            <div className="flex items-center justify-between border-b border-line-subtle px-2.5 py-2 font-mono text-[9.5px] tracking-label text-ink-500 uppercase">
              <span>{rack.id}</span>
              <span className="flex items-center gap-1">
                <span className="size-1 rounded-pill bg-hydro shadow-[0_0_5px_var(--hydro)]" />
                {rack.sku}
              </span>
            </div>

            <ul className="rack3d__trays flex flex-col gap-1 p-2">
              {Array.from({ length: rack.trays }, (_, t) => (
                <li
                  key={t}
                  className="rack3d__tray flex items-center gap-1.5 rounded-[3px] border border-line-subtle bg-carbon-800/80 px-1.5 py-1"
                  style={{ "--t": t } as React.CSSProperties}
                >
                  <span
                    className="rack__led size-1 shrink-0 rounded-pill bg-hydro"
                    style={{ "--i": i * 9 + t } as React.CSSProperties}
                  />
                  <span className="flex flex-1 items-end gap-[3px]">
                    {Array.from({ length: 8 }, (_, c) => (
                      <span
                        key={c}
                        data-cell={c < rack.gpus ? "" : undefined}
                        className={cn(
                          "rack__cell relative h-2.5 flex-1 overflow-hidden rounded-[1px] border border-line-subtle",
                          c >= rack.gpus && "opacity-20",
                        )}
                        style={{ "--i": (i * 9 + t) * 8 + c } as React.CSSProperties}
                      >
                        {c < rack.gpus ? (
                          <>
                            <span className="rack__fill" />
                            <span className="rack__hot" />
                          </>
                        ) : null}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-line-subtle px-2.5 py-1.5 font-mono text-[9px] text-ink-600">
              {rack.trays * rack.gpus} gpus · {rack.note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
