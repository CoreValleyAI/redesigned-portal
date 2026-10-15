/**
 * The three /products bands, each as a small schematic in the data-path
 * language (app/styles/visuals.css, .dp-*): Run — your app calling an
 * endpoint and getting an answer back; Build — a notebook becoming a
 * pipeline, tracked and served; Scale — a whole GPU, a GPU in MIG slices
 * and storage on one private network. Illustrations only: no counts.
 */
import { cn } from "@/lib/cn";

function Flow({ d, delay = 0 }: { d: string; delay?: number }) {
  return (
    <>
      <path d={d} className="dp-link" />
      <path d={d} className="dp-flow" style={{ "--d": `${delay}s` } as React.CSSProperties} />
    </>
  );
}

function Box({ x, y, w, h, name, sub }: { x: number; y: number; w: number; h: number; name: string; sub?: string }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="5" className="dp-box" />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 2 : h / 2 + 4)} textAnchor="middle" className="dp-name">
        {name}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" className="dp-sub">
          {sub}
        </text>
      )}
    </>
  );
}

function Run() {
  return (
    <>
      <Box x={10} y={70} w={110} h={60} name="Your app" sub="request" />
      <Flow d="M120 92 H 186" />
      <Flow d="M186 108 H 120" delay={0.6} />
      {/* The endpoint: a model behind an API. */}
      <rect x="186" y="44" width="150" height="112" rx="8" className="pm-space" />
      <text x="200" y="66" className="dp-label dp-label--strong">
        Endpoint
      </text>
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect
            key={`${r}${c}`}
            x={204 + c * 30}
            y={78 + r * 22}
            width="24"
            height="16"
            rx="2"
            className={(r + c) % 3 === 0 ? "dp-gpu" : "dp-bay"}
            style={{ "--i": r + c } as React.CSSProperties}
          />
        )),
      )}
      <Flow d="M336 100 H 370" delay={0.3} />
      {/* The answer, streaming. */}
      <rect x="370" y="62" width="100" height="76" rx="5" className="dp-box" />
      {[0.8, 0.62, 0.74, 0.4].map((w, i) => (
        <line key={i} x1="382" y1={82 + i * 13} x2={382 + 76 * w} y2={82 + i * 13} className="cat-line" />
      ))}
      <text x="420" y="158" textAnchor="middle" className="dp-sub">
        Answer
      </text>
    </>
  );
}

function Build() {
  const stages = [
    { name: "Notebook", sub: "explore" },
    { name: "Pipeline", sub: "train" },
    { name: "Track", sub: "compare" },
    { name: "Serve", sub: "endpoint" },
  ];
  return (
    <>
      {stages.map((s, i) => (
        <g key={s.name}>
          <Box x={10 + i * 118} y={70} w={98} h={60} name={s.name} sub={s.sub} />
          {i < stages.length - 1 && <Flow d={`M${108 + i * 118} 100 H ${128 + i * 118}`} delay={i * 0.3} />}
        </g>
      ))}
      {/* The loop back: a better run starts from what was tracked. */}
      <path d="M295 130 C 295 172, 59 172, 59 130" className="pm-notice" />
      <text x="177" y="186" textAnchor="middle" className="dp-sub">
        Improve · run again
      </text>
      <text x="236" y="40" textAnchor="middle" className="dp-sub">
        One workspace
      </text>
    </>
  );
}

function Scale() {
  return (
    <>
      {/* The private network every part sits on. */}
      <path d="M20 160 H 460" className="pm-space-line" />
      <text x="20" y="182" className="dp-sub">
        Private network
      </text>
      {/* A whole GPU. */}
      <rect x="20" y="30" width="120" height="96" rx="6" className="dp-box" />
      <rect
        x="54"
        y="52"
        width="52"
        height="52"
        rx="2"
        className="dp-gpu"
        style={{ "--i": 0 } as React.CSSProperties}
      />
      <text x="80" y="20" textAnchor="middle" className="dp-sub">
        Whole GPU
      </text>
      {/* A GPU in slices. */}
      <rect x="180" y="30" width="120" height="96" rx="6" className="dp-box" />
      {Array.from({ length: 7 }, (_, k) => (
        <rect
          key={k}
          x={190 + k * 14.6}
          y="44"
          width="11"
          height="68"
          rx="1.5"
          className={k % 3 === 1 ? "dp-bay" : "dp-gpu"}
          style={{ "--i": k } as React.CSSProperties}
        />
      ))}
      <text x="240" y="20" textAnchor="middle" className="dp-sub">
        MIG slices
      </text>
      {/* Storage. */}
      <rect x="340" y="30" width="120" height="96" rx="6" className="dp-box" />
      {[0, 1, 2, 3].map((r) => (
        <rect key={r} x="352" y={42 + r * 20} width="96" height="13" rx="2" className="dp-record" />
      ))}
      <text x="400" y="20" textAnchor="middle" className="dp-sub">
        Storage
      </text>
      {[80, 240, 400].map((x, i) => (
        <Flow key={x} d={`M${x} 126 V 160`} delay={i * 0.4} />
      ))}
    </>
  );
}

export function CatalogArt({ band, className }: { band: "run" | "build" | "scale"; className?: string }) {
  return (
    <svg
      viewBox="0 0 480 200"
      className={cn("data-path pm h-auto w-full", className)}
      aria-hidden="true"
      focusable="false"
    >
      {band === "run" ? <Run /> : band === "build" ? <Build /> : <Scale />}
    </svg>
  );
}
