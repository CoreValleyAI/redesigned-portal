"use client";

/**
 * Pictures of the outcome (S16): one calm drawing per use case — a river
 * forecast running ahead of today, a payment flagged for review, one GPU
 * shared by a class, a line of Nepali speech written down. Owner review,
 * 14 Oct 2026: simple and effective, nothing technical — no pipelines,
 * readouts, counters or figures that look like real data.
 *
 * Every one is decorative (the card's text carries the meaning) and drawn
 * in the site's tokens, so it reads in both themes. The resting state is
 * the finished picture: that is what the server renders, what reduced
 * motion shows, and what an off-screen card holds. The gentle loop runs
 * only while the picture is on screen ([data-play]), on touch screens as
 * much as with a mouse, since it needs no pointer at all.
 */
import { useEffect, useRef } from "react";
import type { Art } from "@/copy/en/use-cases";
import { cn } from "@/lib/cn";

/** Plays the picture's loop while it is on screen. */
function usePlay() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.documentElement.dataset.motion === "reduce") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) el.dataset.play = "";
        else delete el.dataset.play;
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

type Tone = "hydro" | "warn" | "ink" | "sky";

function Frame({
  label,
  legend,
  children,
  className,
}: {
  label: string;
  legend?: [Tone, string][];
  children: React.ReactNode;
  className?: string;
}) {
  const ref = usePlay();
  return (
    <div ref={ref} aria-hidden="true" className={cn("vg", className)}>
      <p className="vg__label">{label}</p>
      <div className="vg__body">{children}</div>
      {legend ? (
        <ul className="vg__legend">
          {legend.map(([tone, text]) => (
            <li key={text} data-tone={tone}>
              {text}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const cssVars = (v: Record<string, number | string>) => v as React.CSSProperties;

/* ── Startups and IT exporters: your product, reaching its customers ───── */
const REACH = [
  [64, 18],
  [72, 68],
  [104, 34],
  [112, 8],
  [124, 58],
  [148, 24],
  [150, 72],
] as const;
const ORIGIN = [28, 42] as const;
const reachArc = ([x, y]: readonly [number, number]) => {
  const [ox, oy] = ORIGIN;
  return `M${ox},${oy} Q${(ox + x) / 2},${Math.max(0, Math.min(oy, y) - 14)} ${x},${y}`;
};
function Reach() {
  const [ox, oy] = ORIGIN;
  return (
    <Frame
      label="Your product, serving customers"
      legend={[
        ["hydro", "Your product"],
        ["ink", "Customers, at home and abroad"],
      ]}
    >
      <svg viewBox="0 0 160 80" className="vg-svg">
        {REACH.map((p, i) => (
          <g key={i} style={cssVars({ "--i": i })}>
            <path d={reachArc(p)} className="vg-arc" />
            <path d={reachArc(p)} pathLength={1} className="vg-pulse" />
            <circle cx={p[0]} cy={p[1]} r={2.6} className="vg-dest" />
          </g>
        ))}
        <rect x={ox - 12} y={oy - 12} width={24} height={24} rx={6} className="vg-node" />
        {[
          [-4, -4],
          [4, -4],
          [-4, 4],
          [4, 4],
        ].map(([dx, dy], i) => (
          <circle key={i} cx={ox + dx!} cy={oy + dy!} r={1.8} className="vg-node-dot" />
        ))}
      </svg>
    </Frame>
  );
}

/* ── Banks and wallets: payments checked, one sent for review ──────────── */
const FLAGGED = 2;
function Payments() {
  return (
    <Frame
      label="Payments, checked as they happen"
      legend={[
        ["hydro", "Looks fine"],
        ["warn", "Sent for review"],
      ]}
    >
      <div className="vg-pay">
        {[0.8, 0.6, 0.9, 0.7, 0.55].map((w, i) => (
          <div key={i} className={cn("vg-pay__card", i === FLAGGED && "is-flag")} style={cssVars({ "--i": i })}>
            <span className="vg-pay__tint" />
            <span className="vg-pay__sym" lang="ne">
              रु
            </span>
            <span className="vg-pay__line" style={cssVars({ "--w": w })} />
            <span className="vg-pay__line is-short" />
            <span className="vg-pay__mark">
              <svg viewBox="0 0 16 16">
                {i === FLAGGED ? <path d="M4.5 14V2.5M4.5 3h7l-2 3 2 3h-7" /> : <path d="M3.5 8.5l3 3 6-7" />}
              </svg>
            </span>
          </div>
        ))}
        <span className="vg-pay__sweep" />
      </div>
    </Frame>
  );
}

/* ── Universities: one GPU, a private slice for each student ───────────── */
function Classroom() {
  return (
    <Frame
      label="One GPU, shared by a class"
      legend={[
        ["hydro", "A slice of the GPU"],
        ["ink", "One for each student"],
      ]}
    >
      <svg viewBox="0 0 160 80" className="vg-svg">
        <rect x={16} y={6} width={128} height={30} rx={5} className="vg-gpu" />
        {Array.from({ length: 7 }, (_, i) => {
          const x = Math.round((21 + i * 17.2) * 10) / 10;
          const cx = x + 7.5;
          return (
            <g key={i} style={cssVars({ "--i": i })}>
              <rect x={x} y={11} width={15} height={20} rx={2.5} className="vg-cell" />
              <path d={`M${cx},36 L${cx},49`} className="vg-link" />
              <circle cx={cx} cy={54.5} r={3.4} className="vg-person" />
              <path
                d={`M${cx - 6.5},72 Q${cx - 6.5},61 ${cx},61 Q${cx + 6.5},61 ${cx + 6.5},72 Z`}
                className="vg-person"
              />
            </g>
          );
        })}
      </svg>
    </Frame>
  );
}

/* ── Voice: Nepali speech, written down ────────────────────────────────── */
function Voice({ variant }: { variant?: string }) {
  const label =
    variant === "media"
      ? "Archive audio, written down"
      : variant === "telecom"
        ? "A caller, understood in Nepali"
        : "Nepali speech, written down";
  return (
    <Frame label={label}>
      <div className="vg-voice">
        <div className="vg-wave">
          {Array.from({ length: 28 }, (_, i) => (
            <span key={i} style={cssVars({ "--i": i, "--h": Math.round((0.3 + ((i * 37) % 11) / 15) * 100) / 100 })} />
          ))}
        </div>
        <p className="vg-said" lang="ne">
          <span className="vg-type">नमस्ते, मेरो खाताको ब्यालेन्स कति छ?</span>
        </p>
        <p className="vg-gloss">“Hello, what&apos;s my account balance?”</p>
      </div>
    </Frame>
  );
}

/* ── Private language models: an answer that shows its source ──────────── */
const CHATS: Record<string, { q: string; a: string; src: string }> = {
  tourism: {
    q: "Which teahouses near Ghorepani stay open in winter?",
    a: "Most of them do. Here are the ones your guide lists, and how to book.",
    src: "trek-guide.pdf",
  },
  legal: {
    q: "Which rulings deal with land registration?",
    a: "Several do. Here is a short summary of each, with its page.",
    src: "rulings.pdf",
  },
  default: {
    q: "Which clauses mention ending the contract?",
    a: "Two of them. Either side may end it with written notice.",
    src: "contract.pdf",
  },
};
function Assistant({ variant }: { variant?: string }) {
  const { q, a, src } = CHATS[variant ?? "default"] ?? CHATS.default!;
  return (
    <Frame label="Ask your own documents">
      <div className="vg-chat">
        <p className="vg-q">{q}</p>
        <p className="vg-a">
          <span className="vg-type">{a}</span>
        </p>
        <p className="vg-src">
          <svg viewBox="0 0 16 16">
            <path d="M4 1.5h5.5l3 3v10H4zM9.5 1.5v3h3" />
          </svg>
          {src}
        </p>
      </div>
    </Frame>
  );
}

/* ── Training: mistakes falling as the model learns ────────────────────── */
const LOSS_D = Array.from({ length: 41 }, (_, i) => {
  const x = i / 40;
  const y = 52 - 40 * Math.exp(-x * 3.2) + Math.sin(i * 1.9) * 1.2 * (1 - x);
  return `${i ? "L" : "M"}${Math.round(x * 1000) / 10},${Math.round(y * 10) / 10}`;
}).join(" ");
function Training() {
  return (
    <Frame label="Your model, learning" legend={[["hydro", "Mistakes, falling as it trains"]]}>
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="vg-svg vg-stretch">
        <path d="M0,58 L100,58" className="vg-axis" />
        <path d={`${LOSS_D} L100,58 L0,58 Z`} className="vg-area" />
        <path d={LOSS_D} className="vg-curve" />
      </svg>
    </Frame>
  );
}

/* ── Language: the languages of Nepal ──────────────────────────────────── */
const LANGS: [string, string][] = [
  ["नेपाली", "Nepali"],
  ["मैथिली", "Maithili"],
  ["भोजपुरी", "Bhojpuri"],
  ["थारू", "Tharu"],
  ["तामाङ", "Tamang"],
  ["नेपाल भाषा", "Nepal Bhasa"],
];
function Languages() {
  return (
    <Frame label="The languages of Nepal">
      <ul className="vg-langs">
        {LANGS.map(([ne, en], i) => (
          <li key={en} style={cssVars({ "--i": i })}>
            <span lang="ne">{ne}</span>
            <span className="vg-langs__en">{en}</span>
          </li>
        ))}
        <li className="is-more">and many more</li>
      </ul>
    </Frame>
  );
}

/* ── Documents: handwriting in, searchable text out ────────────────────── */
const HAND = [0.92, 0.74, 0.86, 0.58, 0.8].map((w, i) => {
  const y = 12 + i * 11;
  const end = 6 + w * 46;
  let d = `M6,${y}`;
  for (let x = 6; x < end; x += 6) {
    const k = ((x * 7 + i * 3) % 5) - 2;
    d += ` q3,${Math.round((-3 - k * 0.6) * 10) / 10} 6,0`;
  }
  return d;
});
function Records({ variant }: { variant?: string }) {
  const label =
    variant === "heritage"
      ? "A manuscript, made searchable"
      : variant === "contract"
        ? "A job contract, checked"
        : "A handwritten record, made searchable";
  return (
    <Frame label={label} legend={variant === "contract" ? [["warn", "A clause worth a second look"]] : undefined}>
      <div className="vg-doc">
        <div className={cn("vg-page", variant === "heritage" && "is-old")}>
          <svg viewBox="0 0 58 66" preserveAspectRatio="none" className="vg-svg vg-stretch">
            {HAND.map((d, i) => (
              <path key={i} d={d} className="vg-hand" />
            ))}
          </svg>
          <span className="vg-beam" />
        </div>
        <span className="vg-doc__arrow" />
        <div className="vg-text">
          {[0.9, 0.7, 0.84, 0.52, 0.76].map((w, i) => (
            <span
              key={i}
              className={cn("vg-text__line", variant === "contract" && i === 3 && "is-flag")}
              style={cssVars({ "--w": w, "--i": i })}
            />
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── Hydropower: river flow, and the forecast ahead of today ───────────── */
// Rounded, so the server and the browser draw exactly the same path.
const r2 = (n: number) => Math.round(n * 100) / 100;
const PAST = Array.from({ length: 30 }, (_, i) => r2(62 - Math.sin(i * 0.33) * 12 - i * 0.6 + Math.sin(i * 1.7) * 3));
const AHEAD = Array.from({ length: 22 }, (_, i) => r2(PAST[29]! - Math.sin(i * 0.25 + 0.4) * 14 + i * 0.3));
const fx = (i: number, n: number, off: number) => r2(off + (i / (n - 1)) * (off ? 42 : 58));
const PAST_D = PAST.map((y, i) => `${i ? "L" : "M"}${fx(i, PAST.length, 0)},${y}`).join(" ");
const AHEAD_D = AHEAD.map((y, i) => `${i ? "L" : "M"}${fx(i, AHEAD.length, 58)},${y}`).join(" ");
const BAND_D =
  AHEAD.map((y, i) => `${i ? "L" : "M"}${fx(i, AHEAD.length, 58)},${r2(y - 3 - i * 0.6)}`).join(" ") +
  " " +
  AHEAD.map((y, i) => [y, i] as const)
    .reverse()
    .map(([y, i]) => `L${fx(i, AHEAD.length, 58)},${r2(y + 3 + i * 0.6)}`)
    .join(" ") +
  " Z";
function Forecast() {
  return (
    <Frame
      label="River flow, and the days ahead"
      legend={[
        ["ink", "What the river did"],
        ["hydro", "The forecast"],
      ]}
    >
      <div className="vg-forecast">
        <svg viewBox="0 18 100 64" preserveAspectRatio="none" className="vg-svg vg-stretch">
          <path d={`${PAST_D} L58,82 L0,82 Z`} className="vg-river" />
          <path d={PAST_D} className="vg-past" />
          <path d={BAND_D} className="vg-band" />
          <path d={AHEAD_D} className="vg-ahead" />
          <path d="M58,18 L58,82" className="vg-now" />
        </svg>
        <span className="vg-forecast__today">Today</span>
      </div>
    </Frame>
  );
}

/* ── Hazards: a satellite passing over a glacial lake ──────────────────── */
function Lakes() {
  return (
    <Frame
      label="Glacial lakes, watched from orbit"
      legend={[
        ["sky", "Glacial lake"],
        ["hydro", "Satellite pass"],
      ]}
    >
      <svg viewBox="0 0 160 80" className="vg-svg">
        <path
          d="M0,80 L0,52 L22,34 L36,44 L58,18 L76,38 L92,26 L116,48 L134,30 L160,50 L160,80 Z"
          className="vg-ridge is-back"
        />
        <path d="M58,18 L52,26 L58,24 L64,27 Z M134,30 L129,36 L134,35 L139,37 Z" className="vg-snow" />
        <path d="M0,80 L0,64 L30,50 L54,60 L76,48 L106,64 L132,54 L160,66 L160,80 Z" className="vg-ridge" />
        <path d="M84,62 C88,56 104,55 110,60 C114,64 104,68 94,67 C87,67 82,66 84,62 Z" className="vg-lake" />
        <g className="vg-sat">
          <path d="M80,12 L68,62 L112,62 Z" className="vg-cone" />
          <rect x={76} y={6} width={8} height={6} rx={1} className="vg-sat__body" />
          <rect x={64} y={7.5} width={10} height={3} rx={0.6} className="vg-sat__wing" />
          <rect x={86} y={7.5} width={10} height={3} rx={0.6} className="vg-sat__wing" />
        </g>
      </svg>
    </Frame>
  );
}

/* ── Health: an X-ray moved to the front of the queue ──────────────────── */
function Xray() {
  return (
    <Frame label="Chest X-rays, sorted for the doctor" legend={[["warn", "Look at this one first"]]}>
      <div className="vg-xray">
        <svg viewBox="0 0 60 60" className="vg-film">
          <rect x="0" y="0" width="60" height="60" rx="4" className="vg-film-bg" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <path d={`M30,${16 + i * 7} C22,${14 + i * 7} 14,${18 + i * 7} 10,${24 + i * 7}`} className="vg-rib" />
              <path d={`M30,${16 + i * 7} C38,${14 + i * 7} 46,${18 + i * 7} 50,${24 + i * 7}`} className="vg-rib" />
            </g>
          ))}
          <path d="M30,10 L30,54" className="vg-spine" />
          <circle cx="41" cy="27" r="7" className="vg-heat" />
        </svg>
        <ul className="vg-queue">
          <li className="is-flag">First</li>
          <li>Routine</li>
          <li>Routine</li>
        </ul>
      </div>
    </Frame>
  );
}

/* ── Agriculture: a leaf photo, checked ────────────────────────────────── */
function Leaf() {
  return (
    <Frame
      label="A photo of a leaf, from a phone"
      legend={[
        ["warn", "Leaf spot found"],
        ["hydro", "Advice by voice, in Nepali"],
      ]}
    >
      <svg viewBox="0 0 100 60" className="vg-svg">
        <path d="M14,46 C26,10 70,6 88,12 C80,34 54,56 14,46 Z" className="vg-leaf" />
        <path d="M14,46 C40,34 62,22 88,12" className="vg-vein" />
        {[
          [52, 26],
          [58, 30],
          [49, 33],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.4 + i * 0.4} className="vg-spot" />
        ))}
        <rect x="43" y="19" width="22" height="19" rx="2" className="vg-find" />
      </svg>
    </Frame>
  );
}

/** The picture for a use case. `variant` adjusts the words where one kind
    of picture serves several stories. */
export function Vignette({ art, variant, className }: { art: Art; variant?: string; className?: string }) {
  const body = (() => {
    switch (art) {
      case "reach":
        return <Reach />;
      case "payments":
        return <Payments />;
      case "classroom":
        return <Classroom />;
      case "voice":
        return <Voice variant={variant} />;
      case "assistant":
        return <Assistant variant={variant} />;
      case "training":
        return <Training />;
      case "languages":
        return <Languages />;
      case "records":
        return <Records variant={variant} />;
      case "forecast":
        return <Forecast />;
      case "lakes":
        return <Lakes />;
      case "xray":
        return <Xray />;
      case "leaf":
        return <Leaf />;
    }
  })();
  return <div className={cn("vg-box-wrap", className)}>{body}</div>;
}

/** Which variant of a shared picture a story uses. */
export function variantFor(slug: string): string | undefined {
  return (
    {
      heritage: "heritage",
      "migrant-workers": "contract",
      media: "media",
      telecom: "telecom",
      tourism: "tourism",
      "legal-research": "legal",
    } as Record<string, string>
  )[slug];
}
