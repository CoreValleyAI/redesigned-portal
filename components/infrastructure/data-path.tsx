/**
 * The data path (residency, S9): where your work lives, as a technical
 * schematic in the style of the GPU and stack drawings. Your team connects
 * from inside Nepal; inside the datacentre boundary, five kinds of work data
 * flow between the GPUs and storage; nothing is replicated across the
 * border. Illustrative only: no counts, capacities or topology (CTO ruling,
 * 14 Oct 2026). Decorative: the list beside it carries the meaning.
 */
import { cn } from "@/lib/cn";

const ITEMS = ["Datasets", "Checkpoints", "Prompts · answers", "Notebooks", "Job logs"];

/** A flow: the quiet line, and the pulse that runs along it. */
function Flow({ d, delay = 0 }: { d: string; delay?: number }) {
  return (
    <>
      <path d={d} className="dp-link" />
      <path d={d} className="dp-flow" style={{ "--d": `${delay}s` } as React.CSSProperties} />
    </>
  );
}

export function DataPath({ className }: { className?: string }) {
  const recY = (i: number) => 104 + i * 48;
  return (
    <svg
      viewBox="0 0 640 440"
      className={cn("data-path h-auto w-full", className)}
      aria-hidden="true"
      focusable="false"
    >
      {/* Nepal, and inside it the datacentre. */}
      <rect x="8" y="18" width="524" height="404" rx="6" className="dp-nepal" />
      <text x="22" y="38" className="dp-label">
        Nepal
      </text>
      <rect x="150" y="56" width="362" height="348" rx="4" className="dp-dc" />
      <text x="164" y="78" className="dp-label dp-label--strong">
        Datacentre · Kathmandu Valley
      </text>

      {/* Your team, connecting in. */}
      <rect x="26" y="198" width="98" height="54" rx="4" className="dp-box" />
      <text x="75" y="221" textAnchor="middle" className="dp-name">
        Your team
      </text>
      <text x="75" y="238" textAnchor="middle" className="dp-sub">
        in Nepal
      </text>
      <Flow d="M124 225 H 176" />
      <text x="75" y="272" textAnchor="middle" className="dp-sub">
        &lt; 5 ms round trip
      </text>

      {/* The work data, as records. */}
      {ITEMS.map((t, i) => (
        <g key={t}>
          <rect x="176" y={recY(i)} width="124" height="34" rx="3" className="dp-record" />
          <rect x="176" y={recY(i)} width="3" height="34" className="dp-record__mark" />
          <text x="188" y={recY(i) + 21} className="dp-item">
            {t}
          </text>
        </g>
      ))}

      {/* Compute: the GPUs. */}
      <rect x="344" y="100" width="150" height="116" rx="4" className="dp-box" />
      <text x="358" y="122" className="dp-name">
        Compute
      </text>
      <text x="358" y="138" className="dp-sub">
        NVIDIA H200 NVL
      </text>
      {/* One GPU package: the die, and HBM either side of it. */}
      <rect x="396" y="152" width="46" height="46" rx="2" className="dp-gpu" style={{ "--i": 0 } as React.CSSProperties} />
      {[0, 1, 2].flatMap((k) => [
        <rect key={`l${k}`} x="374" y={152 + k * 16} width="16" height="12" rx="1.2" className="dp-bay" />,
        <rect key={`r${k}`} x="448" y={152 + k * 16} width="16" height="12" rx="1.2" className="dp-bay" />,
      ])}

      {/* Storage. */}
      <rect x="344" y="270" width="150" height="116" rx="4" className="dp-box" />
      <text x="358" y="292" className="dp-name">
        Storage
      </text>
      <text x="358" y="308" className="dp-sub">
        Object and file
      </text>
      {Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            x={358 + c * 12.4}
            y={320 + r * 20}
            width="8.5"
            height="14"
            rx="1.2"
            className="dp-bay"
          />
        )),
      )}

      {/* Records to compute and storage; compute and storage both ways. */}
      {[0, 1, 2].map((i) => (
        <Flow
          key={`c${i}`}
          d={`M300 ${recY(i) + 17} C 322 ${recY(i) + 17}, 322 ${150 + i * 22}, 344 ${150 + i * 22}`}
          delay={i * 0.3}
        />
      ))}
      {[3, 4].map((i) => (
        <Flow
          key={`s${i}`}
          d={`M300 ${recY(i) + 17} C 322 ${recY(i) + 17}, 322 ${322 + (i - 3) * 30}, 344 ${322 + (i - 3) * 30}`}
          delay={i * 0.3}
        />
      ))}
      <Flow d="M408 216 V 270" />
      <Flow d="M430 270 V 216" delay={0.5} />

      {/* The border: no replication abroad. */}
      <path d="M512 244 H 608" className="dp-blocked" />
      <path d="M560 236 l 14 16 M574 236 l -14 16" className="dp-cross" />
      <text x="586" y="222" textAnchor="middle" className="dp-sub">
        No copies
      </text>
      <text x="586" y="272" textAnchor="middle" className="dp-sub">
        abroad
      </text>

      <text x="22" y="410" className="dp-sub">
        Data path · illustration
      </text>
    </svg>
  );
}
