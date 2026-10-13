"use client";

/**
 * A GPU that answers the pointer (the hardware page's hero). Wraps the
 * stylised board (GpuArt) and tells its CSS where the pointer is, in the
 * drawing's own units: the die's compute dots heat up around it, the glow
 * leans toward it, and while the pointer (or a finger) is on the card the
 * memory stacks stream into the die. Two custom properties and one
 * attribute per event; the browser does the rest (app/styles/motion.css,
 * .gpu-*). Decorative: the specifications are in the text.
 */
import { useRef } from "react";
import { GpuArt } from "./visuals";

const VIEW = { w: 560, h: 360 };

export function GpuLive({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const at = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--gx", (((e.clientX - r.left) / r.width) * VIEW.w).toFixed(1));
    el.style.setProperty("--gy", (((e.clientY - r.top) / r.height) * VIEW.h).toFixed(1));
  };
  const on = (e: React.PointerEvent) => {
    at(e);
    ref.current?.setAttribute("data-live", "");
  };
  const off = () => ref.current?.removeAttribute("data-live");

  return (
    <div
      ref={ref}
      className={`gpu-live touch-pan-y ${className ?? ""}`}
      onPointerEnter={on}
      onPointerDown={on}
      onPointerMove={at}
      onPointerLeave={off}
      onPointerCancel={off}
    >
      <GpuArt />
    </div>
  );
}
