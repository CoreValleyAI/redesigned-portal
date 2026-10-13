/**
 * A generative contour print (S14) — the cover art for posts and use cases,
 * drawn on the server from the slug (lib/art/contours.ts). Theme-aware
 * through CSS colours: hairline contours in ink, one accent level in hydro,
 * dots on the high ground. Decorative.
 */
import { contourArt } from "@/lib/art/contours";
import { cn } from "@/lib/cn";

export function ContourCover({ seed, className }: { seed: string; className?: string }) {
  const art = contourArt(seed);
  return (
    <svg
      viewBox={`0 0 ${art.width} ${art.height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={cn("block bg-bg-sunken", className)}
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
  );
}
