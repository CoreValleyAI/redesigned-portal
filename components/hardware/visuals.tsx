/**
 * Hardware drawings in the dot language — stylised, faithful in layout,
 * never a product render or a logo (05 §6).
 *
 *  GpuArt          the H200 NVL card seen from above with its cooler removed,
 *                  drawn as a technical illustration: the bracket, the PCIe
 *                  edge, voltage regulation, the power connector, and the
 *                  package — the GPU die (its clusters, L2 band and compute
 *                  units) with six HBM3e stacks on the interposer. Inside
 *                  <GpuLive> (gpu-live.tsx) it answers the pointer: the die's
 *                  compute dots heat up under it and the memory streams; the
 *                  classes and per-dot variables here are what the CSS
 *                  (app/styles/motion.css, .gpu-*) works from.
 *  ClusterDiagram  the first cluster as a calm diagram: two GPU servers of
 *                  four GPUs, the storage, the network — no wiring, ports or
 *                  addresses (those stay private).
 */
import { cn } from "@/lib/cn";

/** Gold of the edge fingers. */
const GOLD = "#c8a24e";

/** A labelled leader: from a point on the drawing to its label. */
function Callout({
  x1,
  y1,
  x2,
  y2,
  label,
  anchor = "middle",
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  anchor?: "start" | "middle" | "end";
}) {
  const up = y2 < y1;
  return (
    <g>
      <polyline points={`${x1},${y1} ${x2},${y2}`} className="stroke-ink-4" strokeWidth="0.7" fill="none" />
      <circle cx={x1} cy={y1} r="1.5" className="fill-ink-3" />
      <text
        x={x2}
        y={up ? y2 - 5 : y2 + 10}
        textAnchor={anchor}
        className="fill-ink-3 font-mono text-[8.5px] tracking-[0.14em] uppercase"
      >
        {label}
      </text>
    </g>
  );
}

export function GpuArt({ className }: { className?: string }) {
  // The die's floor plan: two rows of four processing clusters around the
  // L2 cache band, each cluster a grid of compute units (the dots).
  const die = { x: 206, y: 144, w: 48, h: 44 };
  const blockW = (die.w - 5 - 3 * 1.4) / 4;
  const rowsY = [die.y + 2.5, die.y + die.h / 2 + 2.5];
  const blockH = die.h / 2 - 5;
  const sms: { x: number; y: number; i: number }[] = [];
  const blocks: { x: number; y: number }[] = [];
  rowsY.forEach((by, r) => {
    for (let c = 0; c < 4; c++) {
      const bx = die.x + 2.5 + c * (blockW + 1.4);
      blocks.push({ x: bx, y: by });
      for (let sy = 0; sy < 4; sy++)
        for (let sx = 0; sx < 2; sx++)
          sms.push({ x: bx + 2.9 + sx * 3.9, y: by + 2.4 + sy * 3.6, i: r * 8 + c * 2 + sx + sy });
    }
  });
  const stacks = [130, 155, 180].flatMap((y) => [
    { x: 184, y, side: -1 },
    { x: 259, y, side: 1 },
  ]);
  const fingers: number[] = [];
  for (let x = 79; x <= 297; x += 3.4) if (x < 114 || x > 123) fingers.push(x);

  return (
    <svg viewBox="0 0 560 360" className={cn("h-auto w-full", className)} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="gpu-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="var(--hydro)" stopOpacity="0.3" />
          <stop offset="1" stopColor="var(--hydro)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* The bracket, with its exhaust slots. */}
      <rect
        x="26"
        y="50"
        width="14"
        height="242"
        rx="1"
        className="fill-bg-sunken stroke-line-strong"
        strokeWidth="0.9"
      />
      <rect
        x="15"
        y="50"
        width="25"
        height="8"
        rx="1"
        className="fill-bg-sunken stroke-line-strong"
        strokeWidth="0.9"
      />
      <circle cx="21" cy="54" r="1.8" className="fill-bg stroke-ink-4" strokeWidth="0.6" />
      {Array.from({ length: 23 }, (_, i) => (
        <rect
          key={i}
          x="30"
          y={76 + i * 8}
          width="6"
          height="4"
          rx="1"
          className="fill-bg stroke-line-strong"
          strokeWidth="0.6"
        />
      ))}

      {/* The board, and the PCIe edge with its key. */}
      <rect
        x="40"
        y="70"
        width="484"
        height="202"
        rx="3"
        className="fill-bg-raised stroke-line-strong"
        strokeWidth="1"
      />
      <rect
        x="76"
        y="270"
        width="40"
        height="15"
        rx="1.5"
        className="fill-bg-raised stroke-line-strong"
        strokeWidth="1"
      />
      <rect
        x="122"
        y="270"
        width="178"
        height="15"
        rx="1.5"
        className="fill-bg-raised stroke-line-strong"
        strokeWidth="1"
      />
      <rect x="77" y="268" width="222" height="3" className="fill-bg-raised" />
      {fingers.map((x) => (
        <rect key={x} x={x} y="274" width="2" height="9" rx="0.4" fill={GOLD} opacity="0.85" />
      ))}

      {/* The cooler's footprint (removed in this view). */}
      <rect
        x="47"
        y="76"
        width="470"
        height="190"
        rx="2"
        fill="none"
        className="stroke-ink-4"
        strokeWidth="0.7"
        strokeDasharray="3 3"
      />

      {/* PCIe lanes, from the edge to the package, in pairs. */}
      {Array.from({ length: 8 }, (_, k) => {
        const x0 = 134 + k * 13;
        const x1 = 196 + k * 8.4;
        return [0, 1.7].map((o) => (
          <path
            key={`${k}-${o}`}
            d={`M${x0 + o} 269 V252 L${x1 + o} 234 V223`}
            fill="none"
            className="stroke-line-strong"
            strokeWidth="0.6"
          />
        ));
      })}

      {/* Mounting holes for the cooler. */}
      {(
        [
          [156, 98],
          [304, 98],
          [156, 236],
          [304, 236],
          [512, 258],
          [58, 86],
        ] as const
      ).map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="4.2" className="fill-bg stroke-line-strong" strokeWidth="0.8" />
          <circle cx={x} cy={y} r="1.6" className="fill-ink-4" />
        </g>
      ))}

      {/* Voltage regulation: inductors, their power stages, bulk capacitors. */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = 330 + i * 19;
        return (
          <g key={i}>
            <rect
              x={x}
              y="88"
              width="14"
              height="14"
              rx="1.5"
              className="fill-bg-sunken stroke-line-strong"
              strokeWidth="0.8"
            />
            <rect x={x + 3} y="105" width="8" height="5" rx="0.6" className="fill-ink-4" opacity="0.55" />
            <rect
              x={x}
              y="232"
              width="14"
              height="14"
              rx="1.5"
              className="fill-bg-sunken stroke-line-strong"
              strokeWidth="0.8"
            />
            <rect x={x + 3} y="223" width="8" height="5" rx="0.6" className="fill-ink-4" opacity="0.55" />
          </g>
        );
      })}
      {[150, 182].map((y) =>
        Array.from({ length: 8 }, (_, i) => (
          <g key={`${y}-${i}`}>
            <circle cx={340 + i * 16} cy={y} r="4.6" className="fill-bg-raised stroke-line-strong" strokeWidth="0.8" />
            <circle cx={340 + i * 16} cy={y} r="1.3" className="fill-ink-4" opacity="0.6" />
          </g>
        )),
      )}
      {Array.from({ length: 4 }, (_, i) => (
        <rect
          key={i}
          x={70 + i * 19}
          y="92"
          width="13"
          height="13"
          rx="1.5"
          className="fill-bg-sunken stroke-line-strong"
          strokeWidth="0.8"
        />
      ))}
      {/* A board controller, and its passives. */}
      <rect
        x="92"
        y="160"
        width="20"
        height="20"
        rx="1"
        className="fill-bg-sunken stroke-line-strong"
        strokeWidth="0.8"
      />
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i}>
          <line x1={94 + i * 4} y1="158" x2={94 + i * 4} y2="160" className="stroke-ink-4" strokeWidth="0.6" />
          <line x1={94 + i * 4} y1="180" x2={94 + i * 4} y2="182" className="stroke-ink-4" strokeWidth="0.6" />
        </g>
      ))}
      {(
        [
          [72, 132],
          [80, 132],
          [72, 206],
          [80, 206],
          [124, 128],
          [124, 212],
          [140, 150],
          [140, 186],
          [470, 124],
          [480, 124],
          [470, 208],
          [480, 208],
        ] as const
      ).map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="4" height="2" rx="0.4" className="fill-ink-4" opacity="0.55" />
      ))}

      {/* The power connector at the end of the card. */}
      <rect x="474" y="72" width="38" height="16" rx="1.2" className="fill-bg-sunken stroke-ink-3" strokeWidth="0.8" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          x={477 + (i % 6) * 5.6}
          y={i < 6 ? 75 : 81}
          width="3.6"
          height="3.6"
          rx="0.5"
          className="fill-bg stroke-ink-4"
          strokeWidth="0.5"
        />
      ))}

      {/* Under the hand, the package glows (it drifts toward the pointer). */}
      <circle cx="230" cy="166" r="104" fill="url(#gpu-glow)" className="gpu-glow" />

      {/* The package: substrate, decoupling capacitors, interposer. */}
      <rect
        x="168"
        y="110"
        width="124"
        height="112"
        rx="3"
        className="fill-bg-sunken stroke-line-strong"
        strokeWidth="1"
      />
      {Array.from({ length: 16 }, (_, i) => (
        <g key={i}>
          <rect x={174 + i * 7} y="113" width="3.2" height="1.8" rx="0.3" className="fill-ink-4" opacity="0.6" />
          <rect x={174 + i * 7} y="217.5" width="3.2" height="1.8" rx="0.3" className="fill-ink-4" opacity="0.6" />
        </g>
      ))}
      {Array.from({ length: 13 }, (_, i) => (
        <g key={i}>
          <rect x="171" y={120 + i * 7} width="1.8" height="3.2" rx="0.3" className="fill-ink-4" opacity="0.6" />
          <rect x="287.2" y={120 + i * 7} width="1.8" height="3.2" rx="0.3" className="fill-ink-4" opacity="0.6" />
        </g>
      ))}
      <rect
        x="180"
        y="127"
        width="100"
        height="78"
        rx="1.5"
        className="fill-bg-raised stroke-ink-4"
        strokeWidth="0.8"
      />

      {/* HBM3e stacks, with the links to the die. */}
      {stacks.map((s, i) => (
        <g key={i}>
          <rect
            x={s.x}
            y={s.y}
            width="17"
            height="22"
            rx="0.8"
            className="fill-bg-sunken stroke-hydro"
            strokeWidth="0.8"
          />
          {[4.4, 8.8, 13.2, 17.6].map((d) => (
            <line
              key={d}
              x1={s.x + 2}
              y1={s.y + d}
              x2={s.x + 15}
              y2={s.y + d}
              className="stroke-hydro"
              strokeWidth="0.5"
              opacity="0.35"
            />
          ))}
          <rect
            x={s.side < 0 ? s.x + 14 : s.x + 0.8}
            y={s.y + 2}
            width="2.2"
            height="18"
            rx="0.4"
            className="gpu-hbm fill-hydro"
            style={{ "--i": i } as React.CSSProperties}
          />
          {[6, 11, 16].map((d) => (
            <line
              key={d}
              x1={s.side < 0 ? s.x + 17 : s.x}
              y1={s.y + d}
              x2={s.side < 0 ? die.x : die.x + die.w}
              y2={s.y + d}
              className="gpu-link stroke-hydro"
              strokeWidth="0.7"
            />
          ))}
        </g>
      ))}

      {/* The GPU die: its clusters, the L2 band, compute units as dots. */}
      <rect x={die.x} y={die.y} width={die.w} height={die.h} rx="1.5" className="fill-hydro" />
      <rect
        x={die.x + 2.5}
        y={die.y + die.h / 2 - 2}
        width={die.w - 5}
        height="4"
        rx="0.5"
        className="fill-on-hydro"
        opacity="0.22"
      />
      {blocks.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={blockW}
          height={blockH}
          rx="0.6"
          className="fill-on-hydro stroke-on-hydro"
          fillOpacity="0.06"
          strokeOpacity="0.35"
          strokeWidth="0.45"
        />
      ))}
      {sms.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r="1.05"
          className="gpu-sm fill-on-hydro"
          style={{ "--x": d.x, "--y": d.y, "--i": d.i } as React.CSSProperties}
        />
      ))}

      {/* Callouts. */}
      <Callout x1={192} y1={133} x2={150} y2={44} label="HBM3e" />
      <Callout x1={230} y1={144} x2={230} y2={44} label="GPU die" />
      <Callout x1={387} y1={88} x2={387} y2={44} label="Voltage regulation" />
      <Callout x1={493} y1={72} x2={493} y2={44} label="Power" />
      <Callout x1={186} y1={284} x2={186} y2={304} label="PCIe Gen5" />

      {/* Title block. */}
      <g>
        <rect
          x="364"
          y="296"
          width="180"
          height="52"
          rx="2"
          fill="none"
          className="stroke-line-strong"
          strokeWidth="0.8"
        />
        <line x1="364" y1="315" x2="544" y2="315" className="stroke-line-strong" strokeWidth="0.6" />
        <text x="372" y="309.5" className="fill-ink-2 font-mono text-[9px] font-semibold tracking-[0.12em] uppercase">
          NVIDIA H200 NVL
        </text>
        <text x="372" y="328" className="fill-ink-3 font-mono text-[7.5px] tracking-[0.14em] uppercase">
          Top view · cooler removed
        </text>
        <text x="372" y="340" className="fill-ink-3 font-mono text-[7.5px] tracking-[0.14em] uppercase">
          Illustration · not to scale
        </text>
      </g>
    </svg>
  );
}

export function ClusterDiagram({
  className,
  network,
  storage,
}: {
  className?: string;
  /** e.g. "400 Gb/s" (from lib/facts.ts). */
  network: string;
  /** e.g. "62 TB" (from lib/facts.ts). */
  storage: string;
}) {
  const server = (y: number, label: string) => (
    <g transform={`translate(40 ${y})`}>
      <rect width="400" height="96" rx="14" className="fill-bg-raised stroke-line-strong" strokeWidth="1.4" />
      <text x="20" y="28" className="fill-ink-2 font-mono text-[11px] tracking-[0.14em] uppercase">
        {label}
      </text>
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i} transform={`translate(${20 + i * 92} 42)`}>
          <rect width="80" height="36" rx="7" className="fill-hydro-wash stroke-hydro" strokeWidth="1.3" />
          {Array.from({ length: 6 }, (_, k) => (
            <circle key={k} cx={12 + k * 11} cy="18" r="2.2" className="fill-hydro" />
          ))}
        </g>
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 760 360" className={cn("h-auto w-full", className)} aria-hidden="true" focusable="false">
      {server(30, "GPU server · 4 × H200 NVL")}
      {server(150, "GPU server · 4 × H200 NVL")}
      {/* Network spine */}
      <rect
        x="480"
        y="30"
        width="56"
        height="216"
        rx="12"
        className="fill-bg-sunken stroke-line-strong"
        strokeWidth="1.4"
      />
      <text
        x="508"
        y="270"
        textAnchor="middle"
        className="fill-ink-3 font-mono text-[10px] tracking-[0.14em] uppercase"
      >
        {network}
      </text>
      {[78, 198].map((y) => (
        <line
          key={y}
          x1="440"
          y1={y}
          x2="480"
          y2={y}
          className="cluster-flow stroke-hydro"
          strokeWidth="2"
          strokeDasharray="2 6"
          strokeLinecap="round"
        />
      ))}
      <line
        x1="536"
        y1="138"
        x2="580"
        y2="138"
        className="cluster-flow stroke-hydro"
        strokeWidth="2"
        strokeDasharray="2 6"
        strokeLinecap="round"
      />
      {/* Storage */}
      <g transform="translate(580 70)">
        <rect width="150" height="136" rx="14" className="fill-bg-raised stroke-line-strong" strokeWidth="1.4" />
        {Array.from({ length: 4 }, (_, r) => (
          <rect key={r} x="18" y={22 + r * 24} width="114" height="14" rx="4" className="fill-dot-off" />
        ))}
        <text
          x="75"
          y="160"
          textAnchor="middle"
          className="fill-ink-3 font-mono text-[10px] tracking-[0.14em] uppercase"
        >
          {storage} all-flash
        </text>
      </g>
      {/* Software band */}
      <rect x="40" y="290" width="690" height="44" rx="12" className="fill-bg-sunken" />
      <text x="385" y="317" textAnchor="middle" className="fill-ink-2 text-[13px]">
        NVIDIA AI Enterprise · HPE AI Essentials
      </text>
    </svg>
  );
}
