"use client";

/**
 * A generative contour print (S14) — the cover art for posts and use cases,
 * drawn from the slug (lib/art/contours.ts). Computed in the browser when the
 * cover comes near the viewport, so a page of fifteen stories ships no
 * path data at all; the box holds its size from the start (no layout
 * shift). Theme-aware through CSS colours: hairline contours in ink, one
 * level in hydro, dots on the high ground. Decorative.
 */
import { useEffect, useRef, useState } from "react";
import { contourArt, type ContourArt } from "@/lib/art/contours";
import { cn } from "@/lib/cn";

export function ContourCover({ seed, className }: { seed: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [art, setArt] = useState<ContourArt | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        setArt(contourArt(seed));
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seed]);

  return (
    <div ref={ref} aria-hidden="true" className={cn("relative overflow-hidden bg-bg-sunken", className)}>
      {art && (
        <svg
          viewBox={`0 0 ${art.width} ${art.height}`}
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
          className="absolute inset-0 h-full w-full"
          style={{ animation: "cv-fade-in 700ms var(--ease-out) both" }}
        >
          {art.levels.map((l, i) => (
            <path
              key={i}
              d={l.d}
              fill="none"
              strokeLinecap="round"
              className={i === art.accent ? "stroke-hydro" : "stroke-ink-3"}
              strokeWidth={i === art.accent ? 1.6 : 0.9}
              opacity={i === art.accent ? 1 : 0.22 + l.t * 0.45}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {art.dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} className="fill-ink-2" opacity="0.55" />
          ))}
        </svg>
      )}
    </div>
  );
}
