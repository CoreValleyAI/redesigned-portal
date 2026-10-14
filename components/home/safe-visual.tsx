/**
 * "Your data is safe with us" (home, residency teaser). Your data — a lit
 * cluster of dots — rests at the centre of rings of dots, each ring one of
 * the protections around it, labelled on its crest. Deterministic (seeded)
 * and decorative: the labels repeat what the copy and /trust say.
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

/** Ring index → its label, on the ring's crest. */
const LABELS: { ring: number; text: string; strong?: boolean }[] = [
  { ring: 1, text: "Isolated in hardware" },
  { ring: 3, text: "Seen only when you ask" },
  { ring: 5, text: "Safe with us", strong: true },
];

export function SafeVisual({ className }: { className?: string }) {
  const rings = [0, 1, 2, 3, 4, 5].map((i) =>
    ring(320, 240, 120 + i * 34, 82 + i * 26, 0.03 + i * 0.006, 11 + i, 64 + i * 22),
  );
  const rnd = mulberry32(42);
  const data = Array.from({ length: 26 }, () => {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * 26;
    return [320 + Math.cos(a) * r * 1.3, 240 + Math.sin(a) * r] as const;
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
      {/* The rings, labelled on their crests. */}
      {LABELS.map((l) => {
        // The ring's crest: its point straight above the centre.
        const pts = rings[l.ring]!;
        const y = pts[Math.round(pts.length * 0.75) % pts.length]![1];
        const w = l.text.length * 8.4 + 20;
        return (
          <g key={l.ring}>
            <rect x={320 - w / 2} y={y - 11} width={w} height={22} rx={11} className="fill-bg" />
            <text
              x="320"
              y={y + 4}
              textAnchor="middle"
              className={
                l.strong
                  ? "fill-hydro-ink font-mono text-[11px] tracking-[0.14em] uppercase light:fill-hydro"
                  : "fill-ink-3 font-mono text-[11px] tracking-[0.14em] uppercase"
              }
            >
              {l.text}
            </text>
          </g>
        );
      })}
      {/* Your data. */}
      <circle cx="320" cy="240" r="40" className="fill-hydro" opacity="0.08" />
      {data.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.6" className="fill-hydro" />
      ))}
      <text
        x="320"
        y="302"
        textAnchor="middle"
        className="fill-hydro-ink font-mono text-[11px] tracking-[0.14em] uppercase"
      >
        Your data
      </text>
    </svg>
  );
}
