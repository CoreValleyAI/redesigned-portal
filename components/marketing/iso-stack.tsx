"use client";

/**
 * The growth path — slice, whole cards, a reserved rack — drawn in the same
 * language as the chip graph and the dot terrain on this page: a light
 * surface with a hairline edge, Hydro cells whose strength says how much is
 * yours, a dotted floor, and mono call-outs on dotted leaders.
 *
 *   01 · one H200 die, 7 hardware slices, 2 of them yours
 *   02 · a server tray, 4 whole cards, every cell yours
 *   03 · a rack of 8 servers inside a dashed reservation line
 *
 * "focus" (desktop, pinned beside the steps) shows one scene and crossfades
 * as `lit` changes; "row" (phones) shows all three small, side by side.
 * Plain SVG, deterministic, no animation loop; the crossfade is a CSS
 * opacity transition that reduced-motion visitors get instantly.
 */
import { cn } from "@/lib/cn";

type P = [number, number, number];
type V = [number, number];

/* Isometric projection: x runs down-right, y runs down-left, z runs up. */
const U = 16;
const iso = ([x, y, z]: P): V => [(x - y) * 0.866 * U, (x + y) * 0.5 * U - z * U];
const poly = (ps: P[]) => ps.map((p) => iso(p).map((n) => n.toFixed(1)).join(",")).join(" ");

/* Stable pseudo-random strength per cell, so the server and client agree. */
const noise = (i: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

interface Shape {
  kind: "face" | "cell" | "floor";
  points: string;
  /** 0–1: Hydro strength for a cell. */
  k?: number;
}

/** The three visible faces of a box (left, right, top), back to front. */
function box(x: number, y: number, z: number, w: number, d: number, h: number): Shape[] {
  const t = z + h;
  return [
    { kind: "face", points: poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, t], [x, y + d, t]]) },
    { kind: "face", points: poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, t], [x + w, y, t]]) },
    { kind: "face", points: poly([[x, y, t], [x + w, y, t], [x + w, y + d, t], [x, y + d, t]]) },
  ];
}

/** A grid of cells lying on a horizontal plane at height z. */
function topCells(
  x: number, y: number, z: number, w: number, d: number,
  cols: number, rows: number, strength: (c: number, r: number) => number,
): Shape[] {
  const out: Shape[] = [];
  const cw = w / cols, rd = d / rows, g = 0.14;
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++) {
      const x0 = x + c * cw + g, y0 = y + r * rd + g;
      out.push({
        kind: "cell",
        k: Math.round(strength(c, r) * 1000) / 1000,
        points: poly([[x0, y0, z], [x0 + cw - 2 * g, y0, z], [x0 + cw - 2 * g, y0 + rd - 2 * g, z], [x0, y0 + rd - 2 * g, z]]),
      });
    }
  return out;
}

/** A grid of cells on the front face (x = const) of a box. */
function frontCells(
  x: number, y: number, z: number, d: number, h: number,
  cols: number, rows: number, strength: (c: number, r: number) => number,
): Shape[] {
  const out: Shape[] = [];
  const cd = d / cols, rh = h / rows, g = 0.12;
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++) {
      const y0 = y + c * cd + g, z0 = z + r * rh + g;
      out.push({
        kind: "cell",
        k: Math.round(strength(c, r) * 1000) / 1000,
        points: poly([[x, y0, z0], [x, y0 + cd - 2 * g, z0], [x, y0 + cd - 2 * g, z0 + rh - 2 * g], [x, y0, z0 + rh - 2 * g]]),
      });
    }
  return out;
}

/** The dotted floor the object stands on — the terrain's dots, flattened. */
function floor(x: number, y: number, w: number, d: number, step = 1): Shape[] {
  const out: Shape[] = [];
  for (let i = 0; i <= w; i += step)
    for (let j = 0; j <= d; j += step) {
      const [px, py] = iso([x + i, y + j, 0]);
      out.push({ kind: "floor", points: `${px.toFixed(1)},${py.toFixed(1)}` });
    }
  return out;
}

interface Callout {
  at: P;
  text: string;
  /** Which side of the drawing the label sits on. */
  side: "left" | "right";
}

interface SceneDef {
  shapes: Shape[];
  label: string;
  callouts: Callout[];
  reserved?: boolean;
}

/* ── The three scenes ─────────────────────────────────────────────────── */

const SCENES: SceneDef[] = [
  {
    // One H200: the board, and on it the die split into 7 hardware slices.
    // The two slices that are yours are full Hydro; the rest are faint.
    label: "one h200 · 2 of 7 slices",
    shapes: [
      ...floor(-2, -2, 14, 10),
      ...box(0, 0, 0, 10, 6, 0.3),
      ...box(2.6, 1.2, 0.3, 4.8, 3.6, 0.25),
      ...topCells(2.6, 1.2, 0.55, 4.8, 3.6, 7, 3, (c, r) => (c < 2 ? 0.55 + noise(c * 7 + r) * 0.4 : 0.06 + noise(c * 7 + r) * 0.08)),
    ],
    callouts: [
      { at: [3.2, 1.2, 0.55], text: "2g.35gb · yours", side: "left" },
      { at: [7.4, 3, 0.55], text: "7 slices · 141 gb", side: "right" },
    ],
  },
  {
    // A server tray open on top, four whole cards in it, every cell lit.
    label: "4 × h200 · whole cards",
    shapes: [
      ...floor(-2, -2, 16, 12),
      ...box(0, 0, 0, 12, 8, 1.3),
      ...[0, 1, 2, 3].flatMap((i) => [
        ...box(0.9 + i * 2.7, 0.9, 1.3, 2.1, 6.2, 0.2),
        ...topCells(0.9 + i * 2.7, 0.9, 1.5, 2.1, 6.2, 2, 6, (c, r) => 0.45 + noise(i * 31 + c * 6 + r) * 0.45),
      ]),
    ],
    callouts: [
      { at: [1.9, 0.9, 1.5], text: "141 gb each", side: "left" },
      { at: [11.2, 4, 1.3], text: "4 × h200", side: "right" },
    ],
  },
  {
    // A rack of eight servers, each a row of lit cells on the front face,
    // held for one customer by a dashed line around the lot.
    label: "dedicated · reserved",
    reserved: true,
    shapes: [
      ...floor(-2, -2, 9, 9),
      ...box(0, 0, 0, 5, 5, 11),
      ...Array.from({ length: 8 }, (_, u) =>
        frontCells(5, 0.5, 0.7 + u * 1.22, 4, 1, 6, 1, (c) => 0.4 + noise(u * 13 + c) * 0.5),
      ).flat(),
    ],
    callouts: [
      { at: [5, 0.5, 10.4], text: "8 servers", side: "right" },
      { at: [0, 5, 6], text: "yours alone", side: "left" },
    ],
  },
];

/* ── Rendering ────────────────────────────────────────────────────────── */

function bounds(shapes: Shape[]) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const s of shapes)
    for (const pair of s.points.split(" ")) {
      const [x, y] = pair.split(",").map(Number) as V;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
  return { x0, y0, w: x1 - x0, h: y1 - y0 };
}

function Scene({
  def,
  w,
  h,
  padX,
  callouts,
}: {
  def: SceneDef;
  w: number;
  h: number;
  padX: number;
  callouts: boolean;
}) {
  const b = bounds(def.shapes);
  const pad = 12;
  const s = Math.min((w - padX * 2) / b.w, (h - pad * 2) / b.h);
  const tx = (w - b.w * s) / 2 - b.x0 * s;
  const ty = (h - b.h * s) / 2 - b.y0 * s;
  const place = (p: P): V => {
    const [x, y] = iso(p);
    return [x * s + tx, y * s + ty];
  };

  /* The reservation line: a dashed iso outline just outside the rack. */
  const ring = def.reserved
    ? poly([[-0.6, -0.6, 0], [5.6, -0.6, 0], [5.6, 5.6, 0], [-0.6, 5.6, 0]])
    : null;

  return (
    <>
      <g transform={`translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${s.toFixed(3)})`}>
        {def.shapes.map((sh, i) =>
          sh.kind === "floor" ? (
            <circle
              key={i}
              cx={sh.points.split(",")[0]}
              cy={sh.points.split(",")[1]}
              r={1.15 / s}
              className="fill-ink-500"
              opacity={0.28}
            />
          ) : sh.kind === "face" ? (
            <polygon
              key={i}
              points={sh.points}
              className="fill-carbon-600 stroke-ink-500"
              strokeOpacity={0.45}
              strokeWidth={1 / s}
              strokeLinejoin="round"
            />
          ) : (
            <polygon
              key={i}
              points={sh.points}
              className="fill-hydro"
              fillOpacity={sh.k}
            />
          ),
        )}
        {ring ? (
          <polygon
            points={ring}
            className="fill-none stroke-hydro"
            strokeOpacity={0.8}
            strokeWidth={1.2 / s}
            strokeDasharray={`${4 / s} ${4 / s}`}
          />
        ) : null}
      </g>

      {callouts
        ? def.callouts.map((c) => {
            const [ax, ay] = place(c.at);
            const lx = c.side === "left" ? Math.max(8, ax - 70) : Math.min(w - 8, ax + 70);
            const ly = ay - 34;
            const elbow = c.side === "left" ? lx + 12 : lx - 12;
            return (
              <g key={c.text}>
                <polyline
                  points={`${ax.toFixed(1)},${ay.toFixed(1)} ${elbow.toFixed(1)},${ly.toFixed(1)} ${lx.toFixed(1)},${ly.toFixed(1)}`}
                  className="fill-none stroke-hydro"
                  strokeOpacity={0.55}
                  strokeWidth={1}
                  strokeDasharray="2 4"
                />
                <circle cx={ax} cy={ay} r={2.2} className="fill-hydro" />
                <circle cx={lx} cy={ly} r={2.4} className="fill-hydro" />
                <text
                  x={c.side === "left" ? lx - 7 : lx + 7}
                  y={ly + 3.5}
                  textAnchor={c.side === "left" ? "end" : "start"}
                  className="fill-ink-400 font-mono text-[10.5px]"
                >
                  {c.text}
                </text>
              </g>
            );
          })
        : null}
    </>
  );
}

export function IsoStack({
  lit = 0,
  mode = "focus",
  className,
}: {
  lit?: number;
  mode?: "focus" | "row";
  className?: string;
}) {
  if (mode === "row") {
    return (
      <ol className={cn("grid grid-cols-3 gap-2", className)} aria-label="Slice, whole cards, dedicated">
        {SCENES.map((def) => (
          <li key={def.label} className="flex flex-col items-center">
            <svg viewBox="0 0 160 150" className="w-full" aria-hidden="true">
              <Scene def={def} w={160} h={150} padX={10} callouts={false} />
            </svg>
            <p className="mt-1 text-center font-mono text-[10px] leading-snug text-ink-500">{def.label}</p>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <figure className={cn("relative", className)}>
      <svg viewBox="0 0 460 340" className="w-full overflow-visible" role="img" aria-label={SCENES[lit]?.label}>
        {SCENES.map((def, i) => (
          <g
            key={def.label}
            className="motion-safe:transition-opacity motion-safe:duration-500"
            style={{ opacity: i === lit ? 1 : 0 }}
          >
            <Scene def={def} w={460} h={340} padX={90} callouts />
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 text-center font-mono text-[10.5px] tracking-label text-ink-500 uppercase">
        {SCENES[lit]?.label}
      </figcaption>
    </figure>
  );
}
