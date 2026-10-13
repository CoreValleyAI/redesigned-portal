"use client";

/**
 * "Every layer, named" — the stack as an exploded isometric drawing beside
 * the list of its layers (copy/en/stack.ts): the facility at the bottom,
 * then the network and storage, the servers and their GPUs, the AI
 * software, and your workspace on top.
 *
 * Motion is tied to the reader, on every screen: as the section scrolls
 * into view the plates separate, like a technical drawing pulled apart, and
 * a packet of light travels up through them. Pointing at (or tapping, or
 * focusing) a layer in the list lifts its plate and lights it in hydro; the
 * plates answer the pointer back. With reduced motion the drawing is shown
 * already apart and still. The drawing is decorative; the list carries the
 * meaning.
 */
import { useEffect, useRef, useState } from "react";
import { AppLink } from "@/components/system/app-link";
import { LAYERS, type LayerId } from "@/copy/en/stack";
import { cn } from "@/lib/cn";
import { trackScroll } from "@/lib/motion/scroll";

/* Isometric geometry, in viewBox units. */
const VB = { w: 560, h: 560 };
const CX = 280;
const W = 168; // plate half-width
const H = 84; // plate half-height (2:1 isometric)
const T = 13; // plate thickness
const BASE = 452; // the bottom plate's centre
const GAP_CLOSED = 30;
const GAP_OPEN = 86;

/** A point on a plate's top face: u along the right edge, v along the left, both −1…1. */
const iso = (u: number, v: number, cy: number) => [CX + ((u - v) * W) / 2, cy + ((u + v) * H) / 2] as const;
const pts = (list: (readonly [number, number])[]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

function Plate({ index, id, active }: { index: number; id: LayerId; active: boolean }) {
  // Drawn at the closed position; CSS moves it up as the stack opens.
  const level = LAYERS.length - 1 - index; // 0 = bottom
  const cy = BASE - level * GAP_CLOSED;
  const top = pts([
    [CX, cy - H],
    [CX + W, cy],
    [CX, cy + H],
    [CX - W, cy],
  ]);
  const left = pts([
    [CX - W, cy],
    [CX, cy + H],
    [CX, cy + H + T],
    [CX - W, cy + T],
  ]);
  const right = pts([
    [CX, cy + H],
    [CX + W, cy],
    [CX + W, cy + T],
    [CX, cy + H + T],
  ]);
  return (
    <g
      className={cn("stack-plate", active && "is-active")}
      style={{ "--lift": `${level * (GAP_OPEN - GAP_CLOSED)}px`, "--i": index } as React.CSSProperties}
    >
      <polygon points={left} className="stack-plate__side" />
      <polygon points={right} className="stack-plate__side stack-plate__side--r" />
      <polygon points={top} className="stack-plate__top" />
      <Details id={id} cy={cy} />
      <text x={CX - W - 14} y={cy + 4} textAnchor="end" className="stack-plate__num">
        {String(index + 1).padStart(2, "0")}
      </text>
    </g>
  );
}

/** What is drawn on each plate's top face. */
function Details({ id, cy }: { id: LayerId; cy: number }) {
  if (id === "facility") {
    // The floor grid, and the power feed running in.
    const dots: React.ReactNode[] = [];
    for (let i = -3; i <= 3; i++)
      for (let j = -3; j <= 3; j++) {
        const [x, y] = iso(i / 4, j / 4, cy);
        dots.push(<circle key={`${i}${j}`} cx={x} cy={y} r={1.6} className="stack-dot" />);
      }
    const [ax, ay] = iso(-0.95, 0.62, cy);
    const [bx, by] = iso(0.75, 0.62, cy);
    return (
      <g>
        {dots}
        <line x1={ax} y1={ay} x2={bx} y2={by} className="stack-feed" pathLength={1} />
      </g>
    );
  }
  if (id === "fabric") {
    // Two fabric lanes, and storage blocks beside them.
    const lane = (v: number) => {
      const [x1, y1] = iso(-0.85, v, cy);
      const [x2, y2] = iso(0.3, v, cy);
      return <line key={v} x1={x1} y1={y1} x2={x2} y2={y2} className="stack-lane" />;
    };
    const blocks = [-0.55, -0.1, 0.35].map((v) => {
      const p = [iso(0.5, v - 0.15, cy), iso(0.85, v - 0.15, cy), iso(0.85, v + 0.15, cy), iso(0.5, v + 0.15, cy)];
      return <polygon key={v} points={pts(p)} className="stack-block" />;
    });
    return (
      <g>
        {lane(-0.3)}
        {lane(0.05)}
        {lane(0.4)}
        {blocks}
      </g>
    );
  }
  if (id === "compute") {
    // Two servers, four GPUs each.
    return (
      <g>
        {[-0.42, 0.42].map((v) => {
          const box = [iso(-0.8, v - 0.3, cy), iso(0.8, v - 0.3, cy), iso(0.8, v + 0.3, cy), iso(-0.8, v + 0.3, cy)];
          return (
            <g key={v}>
              <polygon points={pts(box)} className="stack-server" />
              {[-0.55, -0.18, 0.18, 0.55].map((u) => {
                const g = [
                  iso(u - 0.13, v - 0.17, cy),
                  iso(u + 0.13, v - 0.17, cy),
                  iso(u + 0.13, v + 0.17, cy),
                  iso(u - 0.13, v + 0.17, cy),
                ];
                return <polygon key={u} points={pts(g)} className="stack-gpu" />;
              })}
            </g>
          );
        })}
      </g>
    );
  }
  if (id === "software") {
    // Services as tiles.
    const tiles: React.ReactNode[] = [];
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const u = -0.6 + i * 0.6;
        const v = -0.6 + j * 0.6;
        const t = [
          iso(u - 0.22, v - 0.22, cy),
          iso(u + 0.22, v - 0.22, cy),
          iso(u + 0.22, v + 0.22, cy),
          iso(u - 0.22, v + 0.22, cy),
        ];
        tiles.push(
          <polygon key={`${i}${j}`} points={pts(t)} className={cn("stack-tile", (i + j) % 3 === 0 && "is-on")} />,
        );
      }
    return <g>{tiles}</g>;
  }
  // Your workspace: lines of code and a cursor.
  const lines = [0.9, 0.55, 0.75, 0.4].map((len, k) => {
    const v = -0.55 + k * 0.32;
    const [x1, y1] = iso(-0.8, v, cy);
    const [x2, y2] = iso(-0.8 + len * 1.4, v, cy);
    return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} className={cn("stack-code", k === 1 && "is-on")} />;
  });
  const [cxp, cyp] = iso(-0.8 + 0.4 * 1.4 + 0.08, 0.41, cy);
  return (
    <g>
      {lines}
      <circle cx={cxp} cy={cyp} r={2.6} className="stack-cursor" />
    </g>
  );
}

export function LayerStack({ className, compact = false }: { className?: string; compact?: boolean }) {
  const [active, setActive] = useState<LayerId | null>(null);
  const figure = useRef<HTMLDivElement>(null);

  // The stack opens with the scroll.
  useEffect(() => {
    const el = figure.current;
    if (!el) return;
    if (document.documentElement.dataset.motion === "reduce") {
      el.style.setProperty("--open", "1");
      return;
    }
    return trackScroll(
      el,
      "enter",
      (p) => {
        const open = Math.min(1, Math.max(0, (p - 0.15) / 0.6));
        el.style.setProperty("--open", (1 - (1 - open) ** 3).toFixed(4));
      },
      0.1,
    );
  }, []);

  return (
    <div className={cn("grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16", className)}>
      <div ref={figure} aria-hidden="true" className="stack-figure relative mx-auto w-full max-w-[34rem] lg:order-2">
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="h-auto w-full overflow-visible">
          {/* Bottom plate first, so the ones above overlap it. */}
          {[...LAYERS]
            .map((l, i) => ({ l, i }))
            .reverse()
            .map(({ l, i }) => (
              <Plate key={l.id} index={i} id={l.id} active={active === l.id} />
            ))}
          <circle cx={CX} cy={BASE} r={4} className="stack-packet" />
        </svg>
      </div>
      <ol className="flex flex-col lg:order-1" onPointerLeave={() => setActive(null)}>
        {LAYERS.map((l, i) => (
          <li key={l.id} className="border-t border-line last:border-b">
            <AppLink
              href={l.href}
              onPointerEnter={() => setActive(l.id)}
              onFocus={() => setActive(l.id)}
              onBlur={() => setActive(null)}
              className={cn(
                "group grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 py-5 transition-colors duration-[var(--dur-short)] focus-visible:outline-none",
                active === l.id ? "text-ink" : "text-ink",
              )}
            >
              <span
                className={cn(
                  "type-kicker tabular transition-colors duration-[var(--dur-short)]",
                  active === l.id ? "text-hydro-ink light:text-hydro" : "text-ink-3",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="type-title-3">{l.name}</span>
                <span className="type-small text-ink-2">{l.parts}</span>
                {!compact && <span className="type-small text-ink-3">{l.body}</span>}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "text-ink-3 transition-[transform,color] duration-[var(--dur-spring-snappy)] ease-spring group-hover:translate-x-1 group-hover:text-ink group-focus-visible:text-ink",
                )}
              >
                →
              </span>
            </AppLink>
          </li>
        ))}
      </ol>
    </div>
  );
}
