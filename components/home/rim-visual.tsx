/**
 * "Your data stays in the valley" (S9 teaser, still form). A contour map of
 * a valley in the dot language: rings of dots rise toward the rim, the
 * three cities sit on the valley floor, and the data — a lit cluster —
 * rests inside the innermost ring. Deterministic (seeded), decorative, and
 * stylised: the shape is not a survey of the real rim and draws no
 * national borders. The interactive version (drag the data toward the rim)
 * lives on /infrastructure.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A closed, gently irregular ring. */
function ring(cx: number, cy: number, rx: number, ry: number, wobble: number, seed: number, n = 120) {
  const rnd = mulberry32(seed);
  const k1 = rnd() * Math.PI * 2;
  const k2 = rnd() * Math.PI * 2;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const w = 1 + wobble * (0.6 * Math.sin(3 * a + k1) + 0.4 * Math.sin(5 * a + k2));
    pts.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]);
  }
  return pts;
}

const CITIES = [
  { name: "Kathmandu", x: 238, y: 206, anchor: "end" as const },
  { name: "Lalitpur", x: 252, y: 268, anchor: "end" as const },
  { name: "Bhaktapur", x: 438, y: 222, anchor: "start" as const },
];

export function RimVisual({ className }: { className?: string }) {
  const rings = [0, 1, 2, 3, 4, 5].map((i) =>
    ring(320, 240, 120 + i * 34, 82 + i * 26, 0.08 + i * 0.012, 11 + i, 64 + i * 22),
  );
  const rnd = mulberry32(42);
  const data = Array.from({ length: 26 }, () => {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * 26;
    return [336 + Math.cos(a) * r * 1.3, 240 + Math.sin(a) * r] as const;
  });
  return (
    <svg viewBox="0 0 640 480" className={className} aria-hidden="true" focusable="false">
      {/* Each ring is one dotted stroke: round caps on a zero-length dash
          draw a dot every few units, so hundreds of dots cost one path. */}
      {rings.map((pts, i) => (
        <path
          key={i}
          d={`M${pts.map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join("L")}Z`}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={i === 5 ? "0 7" : "0 8.5"}
          strokeWidth={i === 5 ? 4.2 : 3.2}
          className={i === 5 ? "stroke-ink-2" : "stroke-dot-off"}
          opacity={i === 5 ? 0.9 : 0.55 + i * 0.07}
        />
      ))}
      {/* The rim, labelled. */}
      <text x="498" y="50" textAnchor="start" className="fill-ink-3 font-mono text-[11px] tracking-[0.14em] uppercase">
        The rim
      </text>
      {CITIES.map((c) => (
        <g key={c.name}>
          <circle cx={c.x} cy={c.y} r="3" className="fill-ink" />
          <text
            x={c.anchor === "end" ? c.x - 8 : c.x + 8}
            y={c.y + 4}
            textAnchor={c.anchor}
            className="fill-ink-3 text-[12px]"
          >
            {c.name}
          </text>
        </g>
      ))}
      {/* Your data. */}
      <circle cx="336" cy="240" r="40" className="fill-hydro" opacity="0.08" />
      {data.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.6" className="fill-hydro" />
      ))}
      <text
        x="336"
        y="302"
        textAnchor="middle"
        className="fill-hydro-ink font-mono text-[11px] tracking-[0.14em] uppercase"
      >
        Your data
      </text>
    </svg>
  );
}
