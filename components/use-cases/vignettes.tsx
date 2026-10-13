"use client";

/**
 * Pictures of the work (S16): each use case shows the workload itself, as a
 * small live screen — a ledger being scored, speech becoming text, a GPU
 * shared by a class, a loss curve falling — instead of stock imagery or
 * abstract art. Product-UI vignettes, in the site's own type and dots.
 *
 * Every one is illustrative (sample data, no customer's) and decorative:
 * the card's text carries the meaning. They play only while on screen,
 * pause off it, and with reduced motion show their finished frame. The
 * server renders that finished frame too, so nothing is blank before
 * scripts load.
 */
import { useEffect, useRef, useState } from "react";
import type { Art } from "@/copy/en/use-cases";
import { cn } from "@/lib/cn";

/** A step counter that runs while the element is on screen. Starts (and
    rests, for reduced motion and the server) on the last step. */
function useLoop(count: number, ms: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(count - 1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.documentElement.dataset.motion === "reduce") return;
    let timer = 0;
    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
      delete el.dataset.play;
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting && !timer) {
          el.dataset.play = "";
          setStep(0);
          timer = window.setInterval(() => setStep((s) => (s + 1) % count), ms);
        } else if (!e?.isIntersecting && timer) stop();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [count, ms]);
  return [ref, step] as const;
}

function Frame({
  label,
  meta,
  children,
  frameRef,
  className,
}: {
  label: string;
  meta?: string;
  children: React.ReactNode;
  frameRef?: React.Ref<HTMLDivElement>;
  className?: string;
}) {
  return (
    <div ref={frameRef} aria-hidden="true" className={cn("vg", className)}>
      <div className="vg__bar">
        <span className="vg__live" />
        <span className="vg__label">{label}</span>
        {meta ? <span className="vg__meta">{meta}</span> : null}
      </div>
      <div className="vg__body">{children}</div>
    </div>
  );
}

/* ── Startups and IT exporters: an API call, streamed back ──────────────── */
const API_ANSWER =
  "Namaste! Your order #4471 left our Kathmandu warehouse this morning and should reach Pokhara tomorrow. Anything else?".split(
    /(?<= )/,
  );
function Api() {
  const [ref, step] = useLoop(API_ANSWER.length + 14, 110);
  const shown = Math.max(0, Math.min(API_ANSWER.length, step - 5));
  const done = shown >= API_ANSWER.length;
  return (
    <Frame frameRef={ref} label="POST /v1/chat/completions" meta="NVIDIA NIM">
      <div className="vg-code">
        <span className="vg-dim">{"{"}</span> <span className="vg-key">&quot;model&quot;</span>:{" "}
        <span className="vg-str">&quot;your-fine-tune&quot;</span>, <span className="vg-key">&quot;stream&quot;</span>:{" "}
        <span className="vg-str">true</span> <span className="vg-dim">{"}"}</span>
      </div>
      <div className="vg-answer">
        {API_ANSWER.slice(0, shown).map((t, i) => (
          <span key={i} className="vg-token">
            {t}
          </span>
        ))}
        {!done && <span className="vg-caret" />}
      </div>
      <div className="vg-foot">
        <span className={cn("vg-chip", done && "is-on")}>{done ? "200 OK" : "streaming"}</span>
        <span className="vg-chip">tokens · {Math.round(shown * 1.4)}</span>
        <span className="vg-chip vg-push">per second · NPR</span>
      </div>
    </Frame>
  );
}

/* ── Banks and wallets: transactions scored as they arrive ─────────────── */
const TX = [
  { t: "10:42:07", ch: "Wallet → Bank", amt: "4,500", s: 0.08 },
  { t: "10:42:07", ch: "QR · merchant", amt: "1,250", s: 0.04 },
  { t: "10:42:08", ch: "Bank → Wallet", amt: "98,000", s: 0.94 },
  { t: "10:42:08", ch: "Remittance in", amt: "62,300", s: 0.21 },
  { t: "10:42:09", ch: "Wallet → Wallet", amt: "9,999", s: 0.88 },
  { t: "10:42:09", ch: "Card · e-com", amt: "3,480", s: 0.11 },
  { t: "10:42:10", ch: "QR · merchant", amt: "640", s: 0.03 },
  { t: "10:42:10", ch: "Wallet → Bank", amt: "25,000", s: 0.36 },
];
function Ledger() {
  const [ref, step] = useLoop(TX.length, 900);
  const rows = Array.from({ length: 5 }, (_, i) => TX[(step - i + TX.length * 4) % TX.length]!);
  const flagged = rows.filter((r) => r.s >= 0.85).length;
  return (
    <Frame frameRef={ref} label="Transactions · scored live" meta="NPR">
      <ul className="vg-rows">
        {rows.map((r, i) => (
          <li key={`${step}-${i}`} className={cn("vg-row", i === 0 && "is-new", r.s >= 0.85 && "is-flag")}>
            <span className="vg-dim vg-hide-sm">{r.t}</span>
            <span className="vg-ch">{r.ch}</span>
            <span className="vg-amt">{r.amt}</span>
            <span className="vg-score">
              <span className="vg-meter" style={{ "--v": r.s } as React.CSSProperties} />
              {r.s.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
      <div className="vg-foot">
        <span className={cn("vg-chip", flagged > 0 && "is-warn")}>
          {flagged > 0 ? `${flagged} to review · linked accounts` : "no alerts"}
        </span>
        <span className="vg-chip vg-push">KYC · name match 0.97 ✓</span>
      </div>
    </Frame>
  );
}

/* ── Universities: one GPU, a slice for each student ───────────────────── */
function Slices() {
  const [ref] = useLoop(1, 100000);
  const students = ["S01", "S02", "S03", "S04", "S05", "S06", "S07"];
  return (
    <Frame frameRef={ref} label="1 × H200 NVL · 7 MIG slices" meta="JupyterLab">
      <ul className="vg-slices">
        {students.map((s, i) => (
          <li key={s} className="vg-slice" style={{ "--i": i } as React.CSSProperties}>
            <span className="vg-dim">{s}</span>
            <span className="vg-cells">
              {Array.from({ length: 12 }, (_, k) => (
                <span key={k} style={{ "--k": k } as React.CSSProperties} />
              ))}
            </span>
            <span className="vg-mem">16.5 GB</span>
          </li>
        ))}
      </ul>
      <div className="vg-foot">
        <span className="vg-chip is-on">7 notebooks running</span>
        <span className="vg-chip vg-push">isolated in hardware</span>
      </div>
    </Frame>
  );
}

/* ── Voice: Nepali speech to text, intent, and a spoken reply ──────────── */
const SAID = ["नमस्ते,", "मेरो", "खाताको", "ब्यालेन्स", "कति", "छ?"];
function Voice({ variant }: { variant?: string }) {
  const [ref, step] = useLoop(34, 170);
  const words = Math.max(0, Math.min(SAID.length, Math.floor((step - 2) / 2)));
  const heard = words >= SAID.length;
  const replying = step >= 20;
  return (
    <Frame
      frameRef={ref}
      label={variant === "media" ? "Speech → text · archive" : "Speech → text · नेपाली"}
      meta="real time"
    >
      <div className={cn("vg-wave", !heard && "is-live")}>
        {Array.from({ length: 32 }, (_, i) => (
          <span key={i} style={{ "--i": i, "--h": 0.25 + ((i * 37) % 11) / 14 } as React.CSSProperties} />
        ))}
      </div>
      <p className="vg-said" lang="ne">
        {SAID.slice(0, words).join(" ")}
        {!heard && <span className="vg-caret" />}
      </p>
      <p className={cn("vg-gloss", heard && "is-on")}>“Hello, what&apos;s my account balance?”</p>
      <div className="vg-foot">
        <span className={cn("vg-chip", heard && "is-on")}>intent · balance enquiry</span>
        <span className={cn("vg-chip vg-push", replying && "is-on")} lang="ne">
          {replying ? "उत्तर: एकछिन, म हेर्छु।" : "…"}
        </span>
      </div>
    </Frame>
  );
}

/* ── Private language models: an answer that cites its sources ─────────── */
const ANSWER = "Clauses 7.2 and 11.4: either side may end the contract with 30 days' notice, given in writing.".split(
  /(?<= )/,
);
function Assistant({ variant }: { variant?: string }) {
  const [ref, step] = useLoop(ANSWER.length + 16, 120);
  const shown = Math.max(0, Math.min(ANSWER.length, step - 4));
  const done = shown >= ANSWER.length;
  const q =
    variant === "tourism"
      ? "Which teahouses near Ghorepani are open in winter?"
      : variant === "legal"
        ? "Which precedents discuss land registration disputes?"
        : "Which clauses mention termination?";
  return (
    <Frame frameRef={ref} label="Assistant · your documents" meta="cited">
      <p className="vg-q">{q}</p>
      <p className="vg-a">
        {variant === "tourism" || variant === "legal" ? (
          <span className="vg-dim">Searching your documents…</span>
        ) : (
          <>
            {ANSWER.slice(0, shown).join("")}
            {!done && <span className="vg-caret" />}
          </>
        )}
      </p>
      <div className="vg-foot">
        <span className={cn("vg-chip", done && "is-on")}>contract.pdf · p. 4</span>
        <span className={cn("vg-chip", done && "is-on")}>contract.pdf · p. 9</span>
        <span className="vg-chip vg-push">stays in Nepal</span>
      </div>
    </Frame>
  );
}

/* ── Training: a fine-tune on eight GPUs ───────────────────────────────── */
const LOSS = Array.from({ length: 48 }, (_, i) => {
  const x = i / 47;
  const noise = Math.sin(i * 2.7) * 0.025 + Math.sin(i * 1.3) * 0.018;
  return Math.round((0.12 + 0.78 * Math.exp(-x * 3.4) + noise * (1 - x * 0.6)) * 1000) / 1000;
});
const LOSS_D = LOSS.map((y, i) => `${i === 0 ? "M" : "L"}${(i / 47) * 100},${(y * 100).toFixed(1)}`).join(" ");
function Training() {
  const [ref, step] = useLoop(60, 110);
  const p = Math.min(1, step / 48);
  const steps = Math.round(p * 4000);
  return (
    <Frame frameRef={ref} label="Fine-tune · your model" meta="8 × H200 NVL">
      <div className="vg-train">
        <svg viewBox="-2 -4 104 108" preserveAspectRatio="none" className="vg-loss">
          <path d="M0,100 L100,100" className="vg-axis" />
          <path d={LOSS_D} pathLength={1} className="vg-curve" style={{ strokeDashoffset: 1 - p }} />
        </svg>
        <div className="vg-gpus">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className={cn("vg-gpu", i === 4 && "vg-gap")} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      </div>
      <div className="vg-foot">
        <span className="vg-chip tabular">step {steps.toLocaleString("en-US")} / 4,000</span>
        <span className={cn("vg-chip", step % 16 > 11 && "is-on")}>checkpoint → S3</span>
        <span className="vg-chip vg-push tabular">loss {LOSS[Math.min(47, Math.round(p * 47))]!.toFixed(3)}</span>
      </div>
    </Frame>
  );
}

/* ── Language: a Nepali sentence, tokenised ────────────────────────────── */
const TOKENS: [string, number][] = [
  ["हामी", 41823],
  [" नेपाल", 30961],
  ["मै", 7714],
  [" मोड", 52210],
  ["ेल", 1903],
  [" तालिम", 66741],
  [" दिन्छौं", 48802],
  ["।", 902],
];
const LANGS = ["Nepali", "Maithili", "Bhojpuri", "Tamang", "Nepal Bhasa"];
function Tokens() {
  const [ref, step] = useLoop(30, 200);
  const shown = Math.max(0, Math.min(TOKENS.length, step - 1));
  return (
    <Frame frameRef={ref} label="Tokenizer · Devanagari" meta="124 mother tongues">
      <p className="vg-said" lang="ne">
        हामी नेपालमै मोडेल तालिम दिन्छौं।
      </p>
      <ul className="vg-tokens">
        {TOKENS.map(([t, id], i) => (
          <li key={i} className={cn("vg-tok", i < shown && "is-on")} lang="ne">
            <span>{t.trim() || "␠"}</span>
            <span className="vg-dim tabular">{id}</span>
          </li>
        ))}
      </ul>
      <div className="vg-foot vg-langs">
        {LANGS.map((l, i) => (
          <span key={l} className={cn("vg-chip", Math.floor(step / 6) % LANGS.length === i && "is-on")}>
            {l}
          </span>
        ))}
      </div>
    </Frame>
  );
}

/* ── Documents: a page read line by line ───────────────────────────────── */
function Ocr({ variant }: { variant?: string }) {
  const [ref, step] = useLoop(28, 220);
  const fields =
    variant === "heritage"
      ? [
          ["Script", "Newar (Prachalit)"],
          ["Folio", "12 recto"],
          ["Lines", "7"],
        ]
      : variant === "contract"
        ? [
            ["Employer", "████ LLC"],
            ["Salary", "matches offer ✓"],
            ["Fee clause", "flag ⚑"],
          ]
        : [
            ["नाम", "████ ████"],
            ["मिति", "२०८१/०४/१२"],
            ["वडा नं.", "५"],
          ];
  const read = Math.max(0, Math.min(fields.length, Math.floor((step - 3) / 4)));
  const label =
    variant === "heritage"
      ? "Manuscript · OCR"
      : variant === "contract"
        ? "Contract · check"
        : "Record · Devanagari OCR";
  return (
    <Frame frameRef={ref} label={label} meta="handwriting">
      <div className="vg-doc">
        <div className="vg-page">
          {[0.92, 0.78, 0.86, 0.6, 0.82, 0.5].map((w, i) => (
            <span key={i} className="vg-line" style={{ "--w": w } as React.CSSProperties} />
          ))}
          <span className="vg-beam" />
        </div>
        <dl className="vg-fields">
          {fields.map(([k, val], i) => (
            <div key={k} className={cn("vg-field", i < read && "is-on")}>
              <dt className="vg-dim" lang={variant ? undefined : "ne"}>
                {k}
              </dt>
              <dd lang={variant ? undefined : "ne"}>{val}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Frame>
  );
}

/* ── Hydropower: inflow, and the forecast ahead ────────────────────────── */
// Rounded, so the server and the browser draw exactly the same path.
const r2 = (n: number) => Math.round(n * 100) / 100;
const PAST = Array.from({ length: 30 }, (_, i) => r2(62 - Math.sin(i * 0.33) * 12 - i * 0.6 + Math.sin(i * 1.7) * 3));
const AHEAD = Array.from({ length: 22 }, (_, i) => r2(PAST[29]! - Math.sin(i * 0.25 + 0.4) * 14 + i * 0.3));
function Forecast() {
  const [ref, step] = useLoop(40, 120);
  const p = Math.min(1, step / 26);
  const x = (i: number, n: number, off: number) => r2(off + (i / (n - 1)) * (off ? 42 : 58));
  const past = PAST.map((y, i) => `${i ? "L" : "M"}${x(i, PAST.length, 0)},${y}`).join(" ");
  const ahead = AHEAD.map((y, i) => `${i ? "L" : "M"}${x(i, AHEAD.length, 58)},${y}`).join(" ");
  const band =
    AHEAD.map((y, i) => `${i ? "L" : "M"}${x(i, AHEAD.length, 58)},${r2(y - 3 - i * 0.6)}`).join(" ") +
    " " +
    [...AHEAD]
      .reverse()
      .map((y, j) => {
        const i = AHEAD.length - 1 - j;
        return `L${x(i, AHEAD.length, 58)},${r2(y + 3 + i * 0.6)}`;
      })
      .join(" ") +
    " Z";
  return (
    <Frame frameRef={ref} label="River inflow · forecast" meta="+72 h">
      <svg viewBox="0 18 100 64" preserveAspectRatio="none" className="vg-chart">
        <path d={past} className="vg-past" />
        <path d={band} className="vg-band" style={{ opacity: p }} />
        <path d={ahead} pathLength={1} className="vg-ahead" style={{ strokeDashoffset: 1 - p }} />
        <path d="M58,18 L58,82" className="vg-now" />
      </svg>
      <div className="vg-foot">
        <span className="vg-chip">observed</span>
        <span className={cn("vg-chip", p >= 1 && "is-on")}>forecast · hourly</span>
        <span className="vg-chip vg-push">now</span>
      </div>
    </Frame>
  );
}

/* ── Hazards: radar fringes over a glacial lake ────────────────────────── */
function Radar() {
  const [ref] = useLoop(1, 100000);
  return (
    <Frame frameRef={ref} label="InSAR · ground movement" meta="lake watch">
      <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice" className="vg-radar">
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse
            key={i}
            cx={62}
            cy={30}
            rx={8 + i * 6}
            ry={5 + i * 3.6}
            className="vg-fringe"
            style={{ "--i": i } as React.CSSProperties}
          />
        ))}
        <path d="M22,34 C26,24 38,22 44,28 C50,34 44,44 34,44 C26,44 20,40 22,34 Z" className="vg-lake" />
        <circle cx={62} cy={30} r={2.2} className="vg-ping" />
      </svg>
      <div className="vg-foot">
        <span className="vg-chip">glacial lake</span>
        <span className="vg-chip is-warn">change detected</span>
        <span className="vg-chip vg-push">satellite pass</span>
      </div>
    </Frame>
  );
}

/* ── Health: a triage queue for the radiologist ────────────────────────── */
function Xray() {
  const [ref, step] = useLoop(12, 600);
  const flagged = step >= 4;
  return (
    <Frame frameRef={ref} label="Chest X-ray · triage" meta="decision support">
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
          <circle cx="41" cy="27" r="7" className={cn("vg-heat", flagged && "is-on")} />
        </svg>
        <ul className="vg-queue">
          <li className={cn(flagged && "is-flag")}>
            <span>Study 0142</span>
            <span>{flagged ? "review first" : "scoring…"}</span>
          </li>
          <li>
            <span>Study 0141</span>
            <span>routine</span>
          </li>
          <li>
            <span>Study 0140</span>
            <span>routine</span>
          </li>
        </ul>
      </div>
      <div className="vg-foot">
        <span className="vg-chip">a radiologist decides</span>
        <span className="vg-chip vg-push">not a diagnosis</span>
      </div>
    </Frame>
  );
}

/* ── Agriculture: a leaf photo, checked ────────────────────────────────── */
function Vision() {
  const [ref, step] = useLoop(14, 450);
  const found = step >= 5;
  return (
    <Frame frameRef={ref} label="Leaf photo · crop health" meta="from a phone">
      <div className="vg-leaf-wrap">
        <svg viewBox="0 0 100 60" className="vg-leaf">
          <path d="M14,46 C26,10 70,6 88,12 C80,34 54,56 14,46 Z" className="vg-leaf-body" />
          <path d="M14,46 C40,34 62,22 88,12" className="vg-vein" />
          {[
            [52, 26],
            [58, 30],
            [49, 33],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2.4 + i * 0.4} className="vg-spot" />
          ))}
          <rect x="43" y="19" width="22" height="19" rx="2" className={cn("vg-box", found && "is-on")} />
        </svg>
      </div>
      <div className="vg-foot">
        <span className={cn("vg-chip", found && "is-warn")}>{found ? "leaf spot · likely" : "checking…"}</span>
        <span className={cn("vg-chip vg-push", found && "is-on")}>advice by voice, in Nepali</span>
      </div>
    </Frame>
  );
}

/** The picture for a use case. `variant` adjusts the words where one kind
    of picture serves several stories. */
export function Vignette({ art, variant, className }: { art: Art; variant?: string; className?: string }) {
  const body = (() => {
    switch (art) {
      case "api":
        return <Api />;
      case "ledger":
        return <Ledger />;
      case "slices":
        return <Slices />;
      case "voice":
        return <Voice variant={variant} />;
      case "assistant":
        return <Assistant variant={variant} />;
      case "training":
        return <Training />;
      case "tokens":
        return <Tokens />;
      case "ocr":
        return <Ocr variant={variant} />;
      case "forecast":
        return <Forecast />;
      case "radar":
        return <Radar />;
      case "xray":
        return <Xray />;
      case "vision":
        return <Vision />;
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
      tourism: "tourism",
      "legal-research": "legal",
    } as Record<string, string>
  )[slug];
}
