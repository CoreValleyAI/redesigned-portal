/**
 * Hardware drawings in the dot language — stylised, faithful in layout,
 * never a product render or a logo (05 §6).
 *
 *  GpuArt          the H200 NVL board seen from above, stylised: the GPU die,
 *                  its memory stacks, the PCIe edge, the airflow fins. Inside
 *                  <GpuLive> (gpu-live.tsx) it answers the pointer: the die's
 *                  compute dots heat up under it and the memory streams; the
 *                  classes and per-dot variables here are what the CSS
 *                  (app/styles/motion.css, .gpu-*) works from.
 *  ClusterDiagram  the first cluster as a calm diagram: two GPU servers of
 *                  four GPUs, the storage, the network — no wiring, ports or
 *                  addresses (those stay private).
 */
import { cn } from "@/lib/cn";

export function GpuArt({ className }: { className?: string }) {
  const fins = Array.from({ length: 28 }, (_, i) => i);
  return (
    <svg viewBox="0 0 560 360" className={cn("h-auto w-full", className)} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="gpu-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="var(--hydro)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--hydro)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Board */}
      <rect
        x="20"
        y="40"
        width="520"
        height="260"
        rx="22"
        className="fill-bg-raised stroke-line-strong"
        strokeWidth="1.5"
      />
      {/* PCIe edge */}
      {Array.from({ length: 30 }, (_, i) => (
        <rect key={i} x={120 + i * 9} y="300" width="5" height="16" rx="1" className="fill-ink-3" opacity="0.6" />
      ))}
      {/* Fins */}
      {fins.map((i) => (
        <line
          key={i}
          x1={44 + i * 17.5}
          y1="62"
          x2={44 + i * 17.5}
          y2="98"
          className="stroke-dot-off"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      {/* Die glow: drifts toward the pointer inside <GpuLive>. */}
      <circle cx="280" cy="190" r="120" fill="url(#gpu-glow)" className="gpu-glow" />
      {/* GPU die */}
      <rect x="225" y="140" width="110" height="100" rx="8" className="fill-hydro" />
      {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 6 }, (_, c) => (
          <circle
            key={`${r}-${c}`}
            cx={240 + c * 16}
            cy={155 + r * 17.5}
            r="2.2"
            className="gpu-sm fill-on-hydro"
            style={{ "--x": 240 + c * 16, "--y": 155 + r * 17.5, "--i": r + c } as React.CSSProperties}
          />
        )),
      )}
      {/* Memory stacks (stylised) */}
      {(
        [
          [160, 128],
          [160, 176],
          [160, 224],
          [352, 128],
          [352, 176],
          [352, 224],
        ] as const
      ).map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="48" height="38" rx="5" className="fill-bg stroke-hydro" strokeWidth="1.4" />
          {Array.from({ length: 3 }, (_, r) =>
            Array.from({ length: 4 }, (_, c) => (
              <circle
                key={`${r}-${c}`}
                cx={x + 9 + c * 10}
                cy={y + 9 + r * 10}
                r="1.8"
                className="gpu-hbm fill-hydro"
                style={{ "--i": i * 3 + r + (x > 280 ? 3 - c : c) } as React.CSSProperties}
              />
            )),
          )}
        </g>
      ))}
      <text
        x="280"
        y="275"
        textAnchor="middle"
        className="fill-ink-3 font-mono text-[11px] tracking-[0.18em] uppercase"
      >
        GPU · HBM3e
      </text>
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
          className="stroke-hydro"
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
        className="stroke-hydro"
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
