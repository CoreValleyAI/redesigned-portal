"use client";

/**
 * "Every layer, named" — NVIDIA's five-layer cake of AI (energy, chips,
 * infrastructure, models, applications) as an exploded isometric drawing
 * beside the list of its layers (copy/en/stack.ts): the river that powers
 * it at the bottom, then one GPU package, the datacentre floor, models as
 * services, and your application on top. Illustrative, not a plan of the
 * cluster: no counts, no topology.
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

/* Isometric geometry, in viewBox units. Plates on the left, callouts to the
   right, a title block below: an exploded technical drawing. */
const VB = { w: 720, h: 600 };
const CX = 250;
const W = 172; // plate half-width
const H = 86; // plate half-height (2:1 isometric)
const T = 9; // plate thickness
const BASE = 470; // the bottom plate's centre
const GAP_CLOSED = 30;
const GAP_OPEN = 88;

type P = readonly [number, number];
/** A point on a plate's top face: u along the right edge, v along the left, both −1…1. */
const iso = (u: number, v: number, cy: number, z = 0): P => [CX + ((u - v) * W) / 2, cy + ((u + v) * H) / 2 - z];
const pts = (list: P[]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** An upright box standing on a plate: the footprint u0…u1 × v0…v1, h tall. */
function Box({
  u0,
  u1,
  v0,
  v1,
  h,
  cy,
  top = "stack-box__top",
  children,
}: {
  u0: number;
  u1: number;
  v0: number;
  v1: number;
  h: number;
  cy: number;
  top?: string;
  /** Drawn on the front (u1) face: receives a mapper from (s along v, t up) to the face. */
  children?: (face: (s: number, t: number) => P) => React.ReactNode;
}) {
  const front = (s: number, t: number): P => iso(u1, v0 + (v1 - v0) * s, cy, h * t);
  return (
    <g>
      <polygon
        points={pts([iso(u0, v1, cy), iso(u1, v1, cy), iso(u1, v1, cy, h), iso(u0, v1, cy, h)])}
        className="stack-box__side"
      />
      <polygon
        points={pts([iso(u1, v0, cy), iso(u1, v1, cy), iso(u1, v1, cy, h), iso(u1, v0, cy, h)])}
        className="stack-box__front"
      />
      <polygon
        points={pts([iso(u0, v0, cy, h), iso(u1, v0, cy, h), iso(u1, v1, cy, h), iso(u0, v1, cy, h)])}
        className={top}
      />
      {children?.(front)}
    </g>
  );
}

const CALLOUT: Record<LayerId, string> = {
  applications: "Your products · your customers",
  models: "Open models · fine-tunes · serving",
  infrastructure: "Datacentre · network · storage",
  chips: "NVIDIA H200 NVL · 141 GB HBM3e",
  energy: "Nepal's hydropower",
};

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
  const lx = CX + W + 22;
  return (
    <g
      className={cn("stack-plate", active && "is-active")}
      style={{ "--lift": `${level * (GAP_OPEN - GAP_CLOSED)}px`, "--i": index } as React.CSSProperties}
    >
      <polygon points={left} className="stack-plate__side" />
      <polygon points={right} className="stack-plate__side stack-plate__side--r" />
      <polygon points={top} className="stack-plate__top" />
      {/* A fine border inset on the plate, like a machined edge. */}
      <polygon
        points={pts([iso(-0.94, -0.94, cy), iso(0.94, -0.94, cy), iso(0.94, 0.94, cy), iso(-0.94, 0.94, cy)])}
        className="stack-plate__inset"
      />
      <Details id={id} cy={cy} />
      {/* Callout: from the plate's right corner to its label. */}
      <line x1={CX + W + 3} y1={cy} x2={lx - 4} y2={cy} className="stack-leader" />
      <circle cx={CX + W + 3} cy={cy} r="1.6" className="stack-leader__dot" />
      <text x={lx} y={cy - 3} className="stack-plate__num">
        {String(index + 1).padStart(2, "0")} · {LAYERS[index]!.name}
      </text>
      <text x={lx} y={cy + 11} className="stack-plate__spec">
        {CALLOUT[id]}
      </text>
    </g>
  );
}

/** What stands on each plate. */
function Details({ id, cy }: { id: LayerId; cy: number }) {
  if (id === "energy") {
    // A river across the plate, flowing, and the feed it powers.
    const river = (u0: number, phase: number) => {
      const p: P[] = [];
      for (let k = 0; k <= 24; k++) {
        const t = k / 24;
        p.push(iso(u0 + 0.05 * Math.sin(t * Math.PI * 4 + phase), -0.9 + 1.8 * t, cy));
      }
      return `M${p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L")}`;
    };
    const [p0, p1] = [iso(0.55, 0.75, cy), iso(0.55, -0.85, cy)];
    return (
      <g>
        {[-0.6, -0.35, -0.1].map((u, k) => (
          <path key={u} d={river(u, k * 1.3)} className="stack-river" pathLength={1} />
        ))}
        <line x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} className="stack-feed" pathLength={1} />
      </g>
    );
  }
  if (id === "infrastructure") {
    // A raised floor of tiles and two rows of racks across a cold aisle.
    const tiles: React.ReactNode[] = [];
    for (let i = -6; i <= 6; i++) {
      const [a1, a2] = [iso(i / 7, -0.9, cy), iso(i / 7, 0.9, cy)];
      const [b1, b2] = [iso(-0.9, i / 7, cy), iso(0.9, i / 7, cy)];
      tiles.push(<line key={`a${i}`} x1={a1[0]} y1={a1[1]} x2={a2[0]} y2={a2[1]} className="stack-grid" />);
      tiles.push(<line key={`b${i}`} x1={b1[0]} y1={b1[1]} x2={b2[0]} y2={b2[1]} className="stack-grid" />);
    }
    const racks = [-0.62, -0.38, -0.14, 0.1, 0.34].flatMap((v) => [
      { u0: -0.55, u1: -0.3, v },
      { u0: 0.1, u1: 0.35, v },
    ]);
    return (
      <g>
        {tiles}
        {racks.map((r, i) => (
          <Box key={i} u0={r.u0} u1={r.u1} v0={r.v} v1={r.v + 0.2} h={22} cy={cy}>
            {(face) =>
              [0.25, 0.45, 0.65, 0.85].map((t) => {
                const [a, b] = [face(0.12, t), face(0.88, t)];
                return <line key={t} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className="stack-rack-line" />;
              })
            }
          </Box>
        ))}
      </g>
    );
  }
  if (id === "chips") {
    // One GPU package: the substrate, the die in the middle, lit, and the
    // stacks of HBM memory either side of it.
    const hbm = [-0.58, 0.38].flatMap((u0) => [-0.44, -0.12, 0.2].map((v0) => ({ u0, v0 })));
    return (
      <g>
        <Box u0={-0.72} u1={0.72} v0={-0.58} v1={0.58} h={4} cy={cy} />
        <polygon
          points={pts([iso(-0.26, -0.34, cy, 6), iso(0.26, -0.34, cy, 6), iso(0.26, 0.34, cy, 6), iso(-0.26, 0.34, cy, 6)])}
          className="stack-gpu"
        />
        {hbm.map(({ u0, v0 }) => (
          <Box key={`${u0}${v0}`} u0={u0} u1={u0 + 0.2} v0={v0} v1={v0 + 0.24} h={10} cy={cy} top="stack-tile" />
        ))}
      </g>
    );
  }
  if (id === "models") {
    // Models as services: raised tiles, a few of them running.
    const tiles: React.ReactNode[] = [];
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 3; j++) {
        const u = -0.66 + i * 0.44;
        const v = -0.5 + j * 0.5;
        const on = (i + j * 2) % 3 === 0;
        tiles.push(
          <Box
            key={`${i}${j}`}
            u0={u - 0.17}
            u1={u + 0.17}
            v0={v - 0.18}
            v1={v + 0.18}
            h={on ? 6 : 3}
            cy={cy}
            top={on ? "stack-tile is-on" : "stack-tile"}
          />,
        );
      }
    return <g>{tiles}</g>;
  }
  // Applications: a window — title bar, lines of content, a cursor.
  const win = pts([iso(-0.8, -0.7, cy, 2), iso(0.8, -0.7, cy, 2), iso(0.8, 0.7, cy, 2), iso(-0.8, 0.7, cy, 2)]);
  const bar = pts([iso(-0.8, -0.7, cy, 2), iso(-0.62, -0.7, cy, 2), iso(-0.62, 0.7, cy, 2), iso(-0.8, 0.7, cy, 2)]);
  const lines = [
    [0.9, false],
    [0.55, true],
    [0.75, false],
    [0.4, false],
    [0.62, true],
  ] as const;
  const cur = iso(-0.5 + 0.28 * 5 + 0.04, -0.6 + 0.55 * 1.2 + 0.06, cy, 2);
  return (
    <g>
      <polygon points={win} className="stack-window" />
      <polygon points={bar} className="stack-window__bar" />
      {[-0.55, -0.45, -0.35].map((v) => {
        const [x, y] = iso(-0.71, v, cy, 2);
        return <circle key={v} cx={x} cy={y} r="1.6" className="stack-window__dot" />;
      })}
      {lines.map(([len, on], k) => {
        const u = -0.5 + k * 0.28;
        const [a, b] = [iso(u, -0.6, cy, 2), iso(u, -0.6 + len * 1.2, cy, 2)];
        return <line key={k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={cn("stack-code", on && "is-on")} />;
      })}
      <circle cx={cur[0]} cy={cur[1]} r={2.4} className="stack-cursor" />
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
      <div ref={figure} aria-hidden="true" className="stack-figure relative mx-auto w-full max-w-[44rem] lg:order-2">
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="h-auto w-full overflow-visible">
          {/* Bottom plate first, so the ones above overlap it. */}
          {[...LAYERS]
            .map((l, i) => ({ l, i }))
            .reverse()
            .map(({ l, i }) => (
              <Plate key={l.id} index={i} id={l.id} active={active === l.id} />
            ))}
          <circle cx={CX} cy={BASE} r={4} className="stack-packet" />
          {/* Title block. */}
          <g>
            <rect x="430" y="540" width="282" height="48" rx="2" className="stack-title" />
            <line x1="430" y1="558" x2="712" y2="558" className="stack-title__rule" />
            <text x="439" y="553" className="stack-title__head">
              CoreValley · five layers of AI
            </text>
            <text x="439" y="575" className="stack-title__sub">
              After NVIDIA&apos;s five-layer cake · not to scale
            </text>
          </g>
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
