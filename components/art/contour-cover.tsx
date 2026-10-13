"use client";

/**
 * A generative contour print (S14): the cover art for posts and use cases,
 * drawn from the slug (lib/art/contours.ts). Computed in the browser when the
 * cover comes near the viewport, so a page of fifteen stories ships no path
 * data at all; the box holds its size from the start (no layout shift).
 * Theme-aware through CSS colours: hairline contours in ink, one level in
 * the accent tone, dots on the high ground. Decorative.
 *
 * Two extras for a print shown large (a post's header):
 *
 *  · draw   every contour line traces itself in, end to end, as if a
 *           plotter were drawing the map; the levels follow one another
 *           from the valley floor up. Reduced motion: the finished print.
 *  · light  a soft light follows the pointer and the lines under it glow in
 *           the accent tone. On touch screens it drifts across by itself.
 */
import { useEffect, useRef, useState } from "react";
import { contourArt, type ContourArt } from "@/lib/art/contours";
import { cn } from "@/lib/cn";

import type { ContourTone } from "@/lib/content/tone";

export type { ContourTone };

const TONE: Record<ContourTone, { stroke: string; fill: string }> = {
  hydro: { stroke: "stroke-hydro", fill: "fill-hydro" },
  "glow-2": { stroke: "stroke-glow-2", fill: "fill-glow-2" },
  "glow-3": { stroke: "stroke-glow-3", fill: "fill-glow-3" },
};

export function ContourCover({
  seed = "",
  load,
  className,
  tone = "hydro",
  draw = false,
  light = false,
}: {
  /** A generated print, from this slug. */
  seed?: string;
  /** Or a print from elsewhere (the real valley, lib/art/valley.ts). */
  load?: () => Promise<ContourArt> | ContourArt;
  className?: string;
  tone?: ContourTone;
  draw?: boolean;
  light?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [art, setArt] = useState<ContourArt | null>(null);
  // Drawn large, strokes are set in screen pixels from the print's scale.
  const [box, setBox] = useState({ w: 640, h: 400 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let live = true;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        Promise.resolve(load ? load() : contourArt(seed))
          .then((a) => live && setArt(a))
          .catch(() => {
            /* no art: the box stays quietly empty */
          });
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => {
      live = false;
      io.disconnect();
    };
    // The loader is chosen once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !draw) return;
    const ro = new ResizeObserver(([e]) => {
      const r = e?.contentRect;
      if (r && r.width > 0) setBox({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !light) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
      el.dataset.lit = "";
    };
    const onLeave = () => delete el.dataset.lit;
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [light]);

  const t = TONE[tone];
  // "slice": the print covers the box, so its scale is the larger ratio.
  const scale = art ? Math.max(box.w / art.width, box.h / art.height) || 1 : 1;
  const px = 1 / scale; // one screen pixel, in print units

  const lines = (lit: boolean) =>
    art!.levels.map((l, i) => {
      const accent = i === art!.accent;
      const common = {
        fill: "none",
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        className: lit || accent ? t.stroke : "stroke-ink-3",
      };
      if (!draw) {
        return (
          <path
            key={i}
            d={l.d}
            {...common}
            strokeWidth={accent ? 1.6 : 0.9}
            opacity={accent ? 1 : 0.22 + l.t * 0.45}
            vectorEffect="non-scaling-stroke"
          />
        );
      }
      return (
        <g
          key={i}
          strokeWidth={(accent ? 1.75 : 1) * px}
          opacity={lit ? 0.95 : accent ? 1 : 0.24 + l.t * 0.5}
          {...common}
        >
          {l.lines.map((d, j) => (
            <path
              key={j}
              d={d}
              pathLength={1}
              className="contour-trace"
              style={{ "--d": `${i * 110 + ((j * 37) % 23) * 9}ms` } as React.CSSProperties}
            />
          ))}
        </g>
      );
    });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("relative overflow-hidden bg-bg-sunken", light && "contour-light", className)}
    >
      {art && (
        <>
          <svg
            viewBox={`0 0 ${art.width} ${art.height}`}
            preserveAspectRatio="xMidYMid slice"
            focusable="false"
            className="absolute inset-0 h-full w-full"
            style={draw ? undefined : { animation: "cv-fade-in 700ms var(--ease-out) both" }}
          >
            {lines(false)}
            {art.dots.map((d, i) => (
              <circle
                key={i}
                cx={d.x}
                cy={d.y}
                r={draw ? d.r * 1.2 * Math.max(px, 0.6) : d.r}
                className={cn("fill-ink-2", draw && "contour-dot")}
                opacity="0.55"
                style={draw ? ({ "--d": `${900 + (i % 17) * 60}ms` } as React.CSSProperties) : undefined}
              />
            ))}
            {art.markers?.map((m, i) => (
              <g key={m.label} className="contour-dot" style={{ "--d": `${1500 + i * 180}ms` } as React.CSSProperties}>
                <circle cx={m.x} cy={m.y} r={9 * px} className={t.fill} opacity={0.18} />
                <circle cx={m.x} cy={m.y} r={3.5 * px} className={t.fill} />
                <text
                  x={m.x + 12 * px}
                  y={m.y + 4 * px}
                  fontSize={11 * px}
                  className="fill-ink-2 font-mono tracking-[0.12em] uppercase"
                >
                  {m.label}
                </text>
              </g>
            ))}
          </svg>
          {light && (
            <svg
              viewBox={`0 0 ${art.width} ${art.height}`}
              preserveAspectRatio="xMidYMid slice"
              focusable="false"
              className="contour-light__glow absolute inset-0 h-full w-full"
            >
              {lines(true)}
              {art.dots.map((d, i) => (
                <circle key={i} cx={d.x} cy={d.y} r={d.r * 1.6} className={t.fill} />
              ))}
            </svg>
          )}
        </>
      )}
    </div>
  );
}
