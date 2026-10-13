"use client";

/**
 * A small moving picture for each link of the snow-to-token chain (S4),
 * in the site's dot language: snow falling on the peaks, water running
 * downhill, a turbine, a pulse along the grid into the valley, the real
 * valley contoured, a rack's lights, the live GPU, pulses between the
 * cluster's GPUs, and an answer arriving in Nepali.
 *
 * SVG and CSS only (app/styles/motion.css, .bv-*); the animations run only
 * while the picture is on screen and not at all with reduced motion.
 * Decorative: each beat's text says what it shows.
 */
import { useEffect, useRef, useState } from "react";
import { ValleyPortrait } from "@/components/art/valley-portrait";
import { GpuLive } from "@/components/hardware/gpu-live";
import { cn } from "@/lib/cn";

/** Beat ids, from copy/en/home.ts and copy/en/infrastructure.ts. */
const KIND: Record<string, Kind> = {
  snow: "snow",
  water: "rivers",
  rivers: "rivers",
  turbines: "turbine",
  grid: "grid",
  valley: "valley",
  datacentre: "rack",
  machine: "gpu",
  network: "network",
  token: "answer",
  answer: "answer",
};
type Kind = "snow" | "rivers" | "turbine" | "grid" | "valley" | "rack" | "gpu" | "network" | "answer";

export function BeatVisual({ id, className }: { id: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const kind = KIND[id];

  // Animations play only while the picture is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) el.dataset.play = "";
      else delete el.dataset.play;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!kind) return null;
  const frame = "relative overflow-hidden rounded-panel border border-line bg-bg-raised";
  return (
    <div ref={ref} aria-hidden="true" className={cn("beat-visual", className)}>
      {kind === "valley" ? (
        <ValleyPortrait className={cn(frame, "aspect-[16/9] w-full")} />
      ) : kind === "gpu" ? (
        <div className={cn(frame, "aspect-[16/9] w-full p-3")}>
          <GpuLive />
        </div>
      ) : kind === "answer" ? (
        <Answer className={cn(frame, "aspect-[16/9] w-full")} />
      ) : (
        <svg viewBox="0 0 320 180" className={cn(frame, "aspect-[16/9] w-full")} focusable="false">
          {kind === "snow" && <Snow />}
          {kind === "rivers" && <Rivers />}
          {kind === "turbine" && <Turbine />}
          {kind === "grid" && <Grid />}
          {kind === "rack" && <Rack />}
          {kind === "network" && <Network />}
        </svg>
      )}
    </div>
  );
}

/* Seeded once at module load, so the server and the browser draw the same. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RIDGE = "M0 150L36 124L58 134L92 96L118 116L150 80L176 104L204 88L238 118L262 108L292 128L320 118";
const PEAKS: [number, number][] = [
  [92, 96],
  [150, 80],
  [204, 88],
];

const FLAKES = (() => {
  const r = seeded(7);
  return Array.from({ length: 46 }, () => ({
    x: r() * 320,
    s: (r() - 0.5) * 30,
    d: 5 + r() * 6,
    o: r() * 11,
    r: 0.9 + r() * 1.5,
  }));
})();

function Snow() {
  return (
    <>
      <path d={`${RIDGE}L320 180L0 180Z`} className="fill-bg-sunken" />
      <path
        d={RIDGE}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="0 6"
        strokeWidth="2.4"
        className="stroke-ink-3"
      />
      {PEAKS.map(([x, y]) => (
        <path
          key={x}
          d={`M${x - 15} ${y + 13}L${x} ${y}L${x + 15} ${y + 12}`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0 4.5"
          strokeWidth="3.4"
          className="stroke-ink"
        />
      ))}
      {FLAKES.map((f, i) => (
        <circle
          key={i}
          cx={f.x}
          cy={-6}
          r={f.r}
          className="bv-flake fill-ink"
          style={{ "--dur": `${f.d}s`, "--delay": `-${f.o}s`, "--drift": `${f.s}px` } as React.CSSProperties}
        />
      ))}
    </>
  );
}

const RIVERS = [
  "M160 -4C150 40 182 66 166 100C150 132 176 156 160 184",
  "M44 6C80 48 118 70 166 100",
  "M290 14C250 54 206 78 168 110",
  "M96 -4C104 30 128 58 158 76",
];

function Rivers() {
  return (
    <>
      {RIVERS.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" strokeWidth={i === 0 ? 7 : 4} strokeLinecap="round" className="stroke-hydro-wash" />
          <path
            d={d}
            fill="none"
            strokeWidth={i === 0 ? 2.6 : 1.8}
            strokeLinecap="round"
            strokeDasharray="1 11"
            className="bv-flow stroke-hydro"
            style={{ "--dur": `${1.1 + i * 0.25}s` } as React.CSSProperties}
          />
        </g>
      ))}
    </>
  );
}

function Turbine() {
  return (
    <>
      <path
        d="M20 30C70 40 100 70 128 82"
        fill="none"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="1 10"
        className="bv-flow stroke-hydro"
        style={{ "--dur": "0.9s" } as React.CSSProperties}
      />
      <circle
        cx="160"
        cy="90"
        r="52"
        fill="none"
        strokeDasharray="0 7"
        strokeLinecap="round"
        strokeWidth="2.4"
        className="stroke-dot-off"
      />
      <g className="bv-spin">
        {[0, 120, 240].map((a) => (
          <line
            key={a}
            x1="160"
            y1="90"
            x2={160 + Math.cos((a * Math.PI) / 180) * 44}
            y2={90 + Math.sin((a * Math.PI) / 180) * 44}
            strokeLinecap="round"
            strokeDasharray="0 6"
            strokeWidth="4"
            className="stroke-ink"
          />
        ))}
      </g>
      <circle cx="160" cy="90" r="7" className="fill-hydro" />
      <path
        d="M212 90H300"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="1 10"
        className="bv-flow stroke-glow-2"
        style={{ "--dur": "0.7s" } as React.CSSProperties}
      />
    </>
  );
}

function Pylon({ x }: { x: number }) {
  return (
    <path
      d={`M${x - 10} 150L${x} 58L${x + 10} 150M${x - 14} 70H${x + 14}M${x - 6} 110H${x + 6}`}
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      className="stroke-ink-3"
    />
  );
}

const WIRE = "M26 70Q62 92 98 70Q134 92 170 70Q210 92 248 74";

function Grid() {
  return (
    <>
      {[26, 98, 170].map((x) => (
        <Pylon key={x} x={x} />
      ))}
      <path d={WIRE} fill="none" strokeWidth="1.4" className="stroke-line-strong" />
      <path
        d={WIRE}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="8 92"
        className="bv-pulse stroke-hydro"
      />
      {[
        [262, 74],
        [274, 82],
        [268, 92],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="3.4" className="fill-hydro" />
      ))}
      <text x="300" y="118" textAnchor="end" className="fill-ink-3 font-mono text-[8px] tracking-[0.14em] uppercase">
        Kathmandu Valley
      </text>
    </>
  );
}

function Rack() {
  return (
    <>
      <rect
        x="104"
        y="14"
        width="112"
        height="152"
        rx="8"
        fill="none"
        strokeWidth="1.6"
        className="stroke-line-strong"
      />
      {Array.from({ length: 8 }, (_, u) => {
        const gpu = u === 3 || u === 4;
        return (
          <g key={u}>
            <rect
              x="114"
              y={24 + u * 17.5}
              width="92"
              height="13"
              rx="3"
              className={gpu ? "fill-hydro-wash stroke-hydro" : "fill-bg-sunken stroke-line"}
              strokeWidth="1"
            />
            {Array.from({ length: 5 }, (_, k) => (
              <circle
                key={k}
                cx={124 + k * 8}
                cy={30.5 + u * 17.5}
                r="1.7"
                className={cn("bv-led", gpu ? "fill-hydro" : "fill-ink-3")}
                style={{ "--delay": `${((u * 5 + k) * 0.37) % 2.2}s` } as React.CSSProperties}
              />
            ))}
          </g>
        );
      })}
    </>
  );
}

function Network() {
  const left = [0, 1, 2, 3].map((i) => [62, 46 + i * 29] as const);
  const right = [0, 1, 2, 3].map((i) => [258, 46 + i * 29] as const);
  return (
    <>
      <rect x="36" y="26" width="52" height="128" rx="8" fill="none" strokeWidth="1.4" className="stroke-line-strong" />
      <rect
        x="232"
        y="26"
        width="52"
        height="128"
        rx="8"
        fill="none"
        strokeWidth="1.4"
        className="stroke-line-strong"
      />
      <rect x="146" y="74" width="28" height="32" rx="5" className="fill-bg-sunken stroke-ink-3" strokeWidth="1.2" />
      {[...left, ...right].map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x} ${y}L160 90`} fill="none" strokeWidth="1" className="stroke-line" />
          <path
            d={`M${x} ${y}L160 90`}
            fill="none"
            strokeWidth="2.4"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="10 90"
            className="bv-pulse stroke-hydro"
            style={{ "--dur": `${1.4 + (i % 3) * 0.3}s`, "--delay": `-${(i * 0.23) % 1.4}s` } as React.CSSProperties}
          />
          <circle cx={x} cy={y} r="5" className="fill-hydro" />
        </g>
      ))}
    </>
  );
}

/* ── The answer: a request, then an answer arriving piece by piece ───────── */

const PROMPT = "Translate to Nepali: good morning";
const REPLY = "शुभ प्रभात";

function Answer({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(REPLY.length);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = document.documentElement.dataset.motion === "reduce";
    if (still) return;
    // Graphemes, so a Devanagari letter and its marks arrive together.
    const seg =
      typeof Intl !== "undefined" && "Segmenter" in Intl
        ? Array.from(new Intl.Segmenter("ne", { granularity: "grapheme" }).segment(REPLY), (s) => s.segment)
        : Array.from(REPLY);
    let timer = 0;
    let i = 0;
    const tick = () => {
      i = i >= seg.length + 14 ? 0 : i + 1; // a pause on the full answer, then again
      setShown(seg.slice(0, Math.min(i, seg.length)).join("").length);
      timer = window.setTimeout(tick, i === 0 ? 600 : 140);
    };
    const io = new IntersectionObserver(([e]) => {
      window.clearTimeout(timer);
      if (e?.isIntersecting) {
        i = 0;
        tick();
      } else setShown(REPLY.length);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref} className={cn("flex flex-col justify-center gap-3 p-6 font-mono text-[0.8125rem]", className)}>
      <p className="text-ink-2">
        <span className="text-hydro-ink light:text-hydro">›</span> {PROMPT}
      </p>
      <p className="font-sans text-[1.5rem] text-ink">
        {REPLY.slice(0, shown)}
        <span className="bv-caret ml-0.5 inline-block h-[1.1em] w-[0.5ch] translate-y-[0.15em] bg-hydro" />
      </p>
      <p className="text-ink-3">answered in the Kathmandu Valley</p>
    </div>
  );
}
