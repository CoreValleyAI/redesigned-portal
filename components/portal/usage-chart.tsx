/**
 * Inline SVG area chart for a usage or telemetry series.
 *
 * No charting dependency, and no hooks beyond useId, so it renders on the
 * server or inside a client component alike. The series is deterministic
 * (lib/api/synthetic.ts), so the path is identical on the server and after
 * hydration. On mount the line wipes in left to right and the area rises
 * under it (app/portal.css). Nothing on the line blinks or breathes.
 */
import * as React from "react";
import { formatCompactNumber } from "@/lib/format";
import type { TimeSeriesPoint } from "@/lib/api/types";

export function UsageChart({
  points,
  unit,
  height = 132,
  accent = "var(--hydro)",
  label,
  animate = true,
}: {
  points: TimeSeriesPoint[];
  unit?: string;
  height?: number;
  accent?: string;
  label?: string;
  /** Accepted for existing callers and ignored: the newest point is no
      longer marked with a pulsing dot. */
  live?: boolean;
  /** Entrance motion; off for charts redrawn every frame. */
  animate?: boolean;
}) {
  // One id per chart instance: two charts with the same shape used to share
  // a gradient id, and the second one painted with the first one's colour.
  const gradientId = `usage-grad-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  if (points.length === 0) return null;

  const W = 600;
  const H = height;
  const pad = 4;
  const max = Math.max(...points.map((p) => p.v), 1);
  const stepX = (W - pad * 2) / Math.max(1, points.length - 1);

  const xy = points.map((p, i) => ({
    x: pad + i * stepX,
    y: H - pad - (p.v / max) * (H - pad * 2),
  }));
  const line = `M${xy.map((c) => `${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(" L")}`;
  const area = `${line} L${(pad + (points.length - 1) * stepX).toFixed(2)},${H - pad} L${pad},${H - pad} Z`;

  return (
    <figure>
      {label ? (
        <figcaption className="mb-4 flex items-baseline justify-between gap-4">
          <span className="cv-label text-[10px]">{label}</span>
          <span className="nums font-mono text-[12px] text-ink-400">
            peak <span className="text-ink-100">{formatCompactNumber(max)}</span>
            {unit ? ` ${unit}` : ""}
          </span>
        </figcaption>
      ) : null}
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={label ? `${label} over time` : "Usage over time"}
          className="block w-full"
          style={{ height }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.24" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Baseline grid: three hairlines, no axis furniture. */}
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={pad}
              x2={W - pad}
              y1={pad + f * (H - pad * 2)}
              y2={pad + f * (H - pad * 2)}
              stroke="var(--border-subtle)"
              strokeWidth="1"
              strokeDasharray="2 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={area} fill={`url(#${gradientId})`} className={animate ? "pt-area" : undefined} />
          <path
            d={line}
            fill="none"
            stroke={accent}
            strokeWidth="1.75"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className={animate ? "pt-wipe" : undefined}
          />
        </svg>
      </div>
    </figure>
  );
}

/** Compact inline sparkline for table rows and tiles. */
export function Sparkline({
  points,
  width = 96,
  height = 26,
  accent = "var(--hydro)",
}: {
  points: TimeSeriesPoint[];
  width?: number;
  height?: number;
  accent?: string;
}) {
  if (points.length === 0) return null;
  const max = Math.max(...points.map((p) => p.v), 1);
  const stepX = width / Math.max(1, points.length - 1);
  const d = points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - (p.v / max) * (height - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} aria-hidden="true" className="block">
      <path
        d={d}
        fill="none"
        stroke={accent}
        strokeWidth="1.25"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="pt-wipe"
      />
    </svg>
  );
}
