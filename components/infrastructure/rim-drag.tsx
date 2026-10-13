"use client";

/**
 * The Valley Rim (S9). Your dataset is a lit cluster in the middle of the
 * valley. Drag it toward the rim and it meets growing resistance — the
 * further you pull, the less it moves — then springs home when you let go.
 * It never crosses the rim, because the data really does stay inside.
 *
 * Pointer, touch and keyboard: drag it, or press "Try to take it out"
 * (which pulls it to the rim and lets go). The status line is a polite
 * live region. Reduced motion: no animation, the message alone.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/system/button";
import { onFrame } from "@/lib/motion/clock";
import { Spring, SPRINGS } from "@/lib/motion/spring";

const SIZE = 480;
const C = SIZE / 2;
const RIM = 200;

/** Rubber band: free movement near the centre, asymptotic toward the rim. */
function resist(d: number) {
  const free = RIM * 0.35;
  if (d <= free) return d;
  const over = d - free;
  const room = RIM * 0.92 - free;
  return free + room * (1 - Math.exp(-over / (room * 1.6)));
}

const MESSAGES = {
  rest: "Your data, inside the valley.",
  pulling: "Pulling toward the rim…",
  rim: "It stays in the valley.",
};

export function RimDrag() {
  const svgRef = useRef<SVGSVGElement>(null);
  const dataRef = useRef<SVGGElement>(null);
  const x = useRef(new Spring(0, SPRINGS.throw));
  const y = useRef(new Spring(0, SPRINGS.throw));
  const dragging = useRef(false);
  const [msg, setMsg] = useState<keyof typeof MESSAGES>("rest");

  const paint = useCallback(() => {
    const g = dataRef.current;
    if (g) g.setAttribute("transform", `translate(${x.current.value.toFixed(2)} ${y.current.value.toFixed(2)})`);
  }, []);

  // Spring home whenever not dragging.
  const settle = useCallback(() => {
    x.current.target = 0;
    y.current.target = 0;
    const off = onFrame((_, dt) => {
      if (dragging.current) return false;
      x.current.step(dt);
      y.current.step(dt);
      paint();
      if (x.current.settled && y.current.settled) {
        off();
        return false;
      }
      return true;
    });
  }, [paint]);

  const toLocal = (e: React.PointerEvent) => {
    const svg = svgRef.current!;
    const r = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * SIZE - C,
      y: ((e.clientY - r.top) / r.height) * SIZE - C,
    };
  };

  const move = (px: number, py: number) => {
    const d = Math.hypot(px, py);
    const k = d > 0 ? resist(d) / d : 0;
    x.current.snap(px * k);
    y.current.snap(py * k);
    paint();
    setMsg(d > RIM * 0.75 ? "rim" : "pulling");
  };

  const tryToLeave = () => {
    if (document.documentElement.dataset.motion === "reduce") {
      setMsg("rim");
      return;
    }
    // Pull it to the rim on the right, then let go.
    let t = 0;
    dragging.current = true;
    const off = onFrame((_, dt) => {
      t += dt;
      const p = Math.min(1, t / 0.6);
      move(p * RIM * 1.6, -p * RIM * 0.35);
      if (p >= 1) {
        off();
        dragging.current = false;
        settle();
        return false;
      }
      return true;
    });
  };

  useEffect(() => paint(), [paint]);

  return (
    <div className="flex flex-col items-center gap-6">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[30rem] touch-none select-none"
        aria-hidden="true"
        onPointerDown={(e) => {
          const p = toLocal(e);
          if (Math.hypot(p.x - x.current.value, p.y - y.current.value) > 70) return;
          dragging.current = true;
          (e.currentTarget as Element).setPointerCapture(e.pointerId);
          move(p.x, p.y);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          const p = toLocal(e);
          move(p.x, p.y);
        }}
        onPointerUp={() => {
          if (!dragging.current) return;
          dragging.current = false;
          setMsg("rim");
          settle();
        }}
        onPointerCancel={() => {
          dragging.current = false;
          settle();
        }}
      >
        {/* Contours rising to the rim. */}
        {[0.42, 0.58, 0.74, 0.88].map((f, i) => (
          <circle
            key={f}
            cx={C}
            cy={C}
            r={RIM * f}
            fill="none"
            className="stroke-dot-off"
            strokeWidth="1.5"
            strokeDasharray="1.5 7"
            strokeLinecap="round"
            opacity={0.5 + i * 0.12}
          />
        ))}
        <circle cx={C} cy={C} r={RIM} fill="none" className="stroke-ink-2" strokeWidth="2.4" strokeDasharray="2 8" strokeLinecap="round" />
        <text x={C} y={C - RIM - 14} textAnchor="middle" className="fill-ink-3 font-mono text-[12px] tracking-[0.14em] uppercase">
          The rim · Nepal
        </text>
        {/* The data. */}
        <g ref={dataRef} className="cursor-grab active:cursor-grabbing">
          <circle cx={C} cy={C} r="54" className="fill-hydro" opacity="0.1" />
          <circle cx={C} cy={C} r="30" className="fill-hydro" opacity="0.18" />
          {Array.from({ length: 19 }, (_, i) => {
            const a = i * 2.39996;
            const r = Math.sqrt(i / 19) * 22;
            return <circle key={i} cx={C + Math.cos(a) * r} cy={C + Math.sin(a) * r} r="3" className="fill-hydro" />;
          })}
          <text x={C} y={C + 52} textAnchor="middle" className="fill-hydro-ink font-mono text-[11px] tracking-[0.14em] uppercase">
            Your data
          </text>
        </g>
      </svg>
      <p aria-live="polite" className="type-title-3 min-h-[1.6em] text-center text-ink">
        {MESSAGES[msg]}
      </p>
      <Button variant="secondary" onClick={tryToLeave}>
        Try to take it out
      </Button>
    </div>
  );
}
