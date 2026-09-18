"use client";

/**
 * The quote console: three dials — GPU, count, hours — and a price screen
 * that follows them. Set the three and the number is already there; the
 * only thing to press is the button that carries the plan to the form.
 *
 * DIALS. Each is a real cylinder in CSS 3D inside a bordered housing: the
 * options sit on a drum that rotates about its horizontal axis behind a
 * recessed window, with knurled grips down both sides and a chevron above
 * and below, the way a rack's setting dial turns. Turn it with the wheel,
 * by dragging, by clicking a chevron or the option above or below, or with
 * the arrow keys (each is a spinbutton). Transforms only, so it costs
 * nothing at rest.
 *
 * SCREEN. The price rolls digit by digit — each digit is a 0–9 strip that
 * translates to its value — so a change reads as a meter turning, not a
 * number swapping.
 *
 * Rates are the catalogue's on-demand hourly list prices (NPR). Eight full
 * cards is billed as a whole node, which is why that step is cheaper than
 * eight singles. The US-cloud figure is an illustrative multiple.
 */

import * as React from "react";
import Link from "next/link";
import { Button, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";

interface Gpu {
  id: string;
  label: string;
  sub: string;
  /** NPR per hour, one unit. */
  rate: number;
  /** NPR per hour for a whole node of eight, when that exists. */
  node?: number;
  slice?: boolean;
  /** On the roadmap: quoted on request rather than available now. */
  soon?: boolean;
}

/* Ten options, weakest family first and each family's size variants
   together, small to large: l4, l40s, rtx pro 6000, then the h100 slices up
   to the full card, then the h200 slices up to the full card. The intro
   settles on the middle rung. Full-card and h200 MIG rates are the
   catalogue's list prices; the h100 slices are scaled from them and, like
   the catalogue's own numbers, are placeholders awaiting approval. */
const GPUS: Gpu[] = [
  { id: "l4", label: "l4", sub: "24 gb gddr6", rate: 62 },
  { id: "l40s", label: "l40s", sub: "48 gb gddr6", rate: 145 },
  { id: "rtx-pro-6000", label: "rtx pro 6000", sub: "96 gb gddr7", rate: 240 },
  { id: "h100-1g", label: "h100 · 1g", sub: "mig slice · 10 gb", rate: 55, slice: true },
  { id: "h100-2g", label: "h100 · 2g", sub: "mig slice · 20 gb", rate: 100, slice: true },
  { id: "h100", label: "h100", sub: "80 gb hbm2e · full", rate: 315, node: 2420 },
  { id: "h200-1g", label: "h200 · 1g", sub: "mig slice · 18 gb", rate: 72, slice: true },
  { id: "h200-2g", label: "h200 · 2g", sub: "mig slice · 35 gb", rate: 132, slice: true },
  { id: "h200-3g", label: "h200 · 3g", sub: "mig slice · 71 gb", rate: 232, slice: true },
  { id: "h200", label: "h200", sub: "141 gb hbm3e · full", rate: 415, node: 3180 },
];
/** The rung the intro settles on: the middle of the list. */
const GPU_DEFAULT = Math.floor(GPUS.length / 2) - 1;
const COUNTS = [1, 2, 4, 8];
const HOURS: { v: number; label: string; sub: string }[] = [
  { v: 1, label: "1 h", sub: "a test" },
  { v: 8, label: "8 h", sub: "a shift" },
  { v: 24, label: "24 h", sub: "a day" },
  { v: 72, label: "72 h", sub: "a weekend" },
  { v: 168, label: "1 wk", sub: "168 h" },
  { v: 720, label: "1 mo", sub: "720 h" },
];

/** What the same run costs on a US cloud, as a multiple. Illustrative. */
const US_CLOUD = 1.42;

/** Positions on the drum: at least as many as the longest list, and a few
    more, so the cylinder is round and no two options share an angle. */
const SLOTS = 12;
const STEP = 360 / SLOTS;
/** The intro settle, ms, and the stagger between dials. Matches the CSS. */
const SPIN_MS = 1700;
const SPIN_STAGGER = 160;

/* ── One dial ────────────────────────────────────────────────────────────── */

function Chevron({ up }: { up?: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={up ? "M2.5 7.5 6 4l3.5 3.5" : "M2.5 4.5 6 8l3.5-3.5"} />
    </svg>
  );
}

type Phase = "hold" | "spin" | "ready";

function Drum({
  label,
  items,
  index,
  onChange,
  className,
  phase,
  spin,
  delay,
}: {
  label: string;
  items: { key: string; text: string; sub?: string }[];
  index: number;
  onChange: (i: number) => void;
  className?: string;
  /** Intro: "hold" parks the drum a few turns away, "spin" lets it settle. */
  phase: Phase;
  /** Turns for the intro, in degrees. Sign sets the direction. */
  spin: number;
  /** Stagger for the intro settle, ms. */
  delay: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const idx = React.useRef(index);
  idx.current = index;
  const clamp = React.useCallback(
    (i: number) => Math.min(items.length - 1, Math.max(0, i)),
    [items.length],
  );
  const step = (d: number) => onChange(clamp(idx.current + d));

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let acc = 0;
    let dragY: number | null = null;
    // Wheel: non-passive so the page does not scroll while a dial turns.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      acc += e.deltaY;
      if (Math.abs(acc) >= 40) {
        onChange(clamp(idx.current + Math.sign(acc)));
        acc = 0;
      }
    };
    const onDown = (e: PointerEvent) => {
      dragY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (dragY === null) return;
      const dy = dragY - e.clientY;
      if (Math.abs(dy) >= 32) {
        onChange(clamp(idx.current + Math.sign(dy)));
        dragY = e.clientY;
      }
    };
    const onUp = () => {
      dragY = null;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [onChange, clamp]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowDown" || e.key === "ArrowRight") step(1);
    else if (e.key === "Home") onChange(0);
    else if (e.key === "End") onChange(items.length - 1);
    else return;
    e.preventDefault();
  };

  const current = items[index]!;

  return (
    <div className={cn("drum", className)}>
      <span className="drum__label">
        <span>{label}</span>
        <span className="drum__hint" aria-hidden="true">
          turn
        </span>
      </span>

      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={index === 0}
        onClick={() => step(-1)}
        className="drum__chev"
      >
        <Chevron up />
      </button>

      <div
        ref={ref}
        role="spinbutton"
        tabIndex={0}
        aria-label={label}
        aria-valuenow={index}
        aria-valuemin={0}
        aria-valuemax={items.length - 1}
        aria-valuetext={current.text}
        onKeyDown={onKey}
        className="drum__win outline-none focus-visible:ring-2 focus-visible:ring-hydro/60"
      >
        <span aria-hidden="true" className="drum__grip drum__grip--l" />
        <span aria-hidden="true" className="drum__grip drum__grip--r" />
        <div className="drum__view">
          <div
            className="drum__cyl"
            data-phase={phase}
            style={
              {
                "--rot": `${index * STEP + (phase === "hold" ? spin : 0)}deg`,
                "--spin-delay": `${delay}ms`,
              } as React.CSSProperties
            }
          >
            {items.map((it, i) => (
              <button
                key={it.key}
                type="button"
                tabIndex={-1}
                aria-hidden={i !== index}
                data-on={i === index ? "" : undefined}
                onClick={() => onChange(i)}
                className="drum__item"
                style={{ "--a": `${i * STEP}deg` } as React.CSSProperties}
              >
                <span className="drum__text">{it.text}</span>
                {it.sub ? <span className="drum__sub">{it.sub}</span> : null}
              </button>
            ))}
          </div>
        </div>
        <span aria-hidden="true" className="drum__edge" />
      </div>

      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={index === items.length - 1}
        onClick={() => step(1)}
        className="drum__chev"
      >
        <Chevron />
      </button>
    </div>
  );
}

/* ── Rolling digits ──────────────────────────────────────────────────────── */

/**
 * Columns are keyed by their distance from the RIGHT, so when the value
 * gains or loses a digit the existing digits keep their identity and keep
 * rolling; only the new leading column mounts — and it mounts at zero
 * width showing 0, then grows and rolls to its digit on the next frame.
 */
function Odometer({
  value,
  live = true,
  className,
}: {
  value: number;
  /** Until live, every digit shows 0; going live rolls each to its value. */
  live?: boolean;
  className?: string;
}) {
  const text = value.toLocaleString("en-US");
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
  }, []);
  const n = text.length;
  return (
    <span className={cn("odo", className)} aria-label={text}>
      {text.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <Digit key={`r${n - i}`} d={ch} live={live} late={mounted.current} />
        ) : (
          <Sep key={`r${n - i}`} ch={ch} late={mounted.current} />
        ),
      )}
    </span>
  );
}

/** A column that mounted after first paint grows from nothing and rolls. */
function useLate(late: boolean, target: string, from: string) {
  const [cur, setCur] = React.useState(late ? from : target);
  const [fresh, setFresh] = React.useState(late);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      setCur(target);
      setFresh(false);
    });
    return () => cancelAnimationFrame(id);
  }, [target]);
  return [cur, fresh] as const;
}

function Digit({ d, live, late }: { d: string; live: boolean; late: boolean }) {
  const [cur, fresh] = useLate(late, d, "0");
  return (
    <span className="odo__col" data-new={fresh ? "" : undefined} aria-hidden="true">
      <span className="odo__strip" style={{ "--d": live ? cur : "0" } as React.CSSProperties}>
        {Array.from({ length: 10 }, (_, k) => (
          <span key={k}>{k}</span>
        ))}
      </span>
    </span>
  );
}

function Sep({ ch, late }: { ch: string; late: boolean }) {
  const [, fresh] = useLate(late, ch, ch);
  return (
    <span className="odo__sep" data-new={fresh ? "" : undefined} aria-hidden="true">
      {ch}
    </span>
  );
}

/* ── The console ─────────────────────────────────────────────────────────── */

export function QuoteLock({ className }: { className?: string }) {
  const [g, setG] = React.useState(GPU_DEFAULT);
  const [c, setC] = React.useState(2);
  const [h, setH] = React.useState(2);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [phase, setPhase] = React.useState<Phase>("hold");

  // The intro: the dials sit a few turns off until the console is well
  // into view, then spin home — alternating directions, staggered — and
  // the price rolls up from zero as they settle. Then the user has them.
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("ready");
      return;
    }
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        setPhase("spin");
        timer = window.setTimeout(() => setPhase("ready"), SPIN_MS + 2 * SPIN_STAGGER + 80);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const gpu = GPUS[g]!;
  const count = COUNTS[c]!;
  const hours = HOURS[h]!;
  const perHour = count === 8 && gpu.node ? gpu.node : gpu.rate * count;
  const total = perHour * hours.v;
  const usTotal = Math.round(total * US_CLOUD);
  const reserve = hours.v >= 720 || (count >= 8 && !gpu.slice);
  const status = gpu.soon
    ? { tone: "warn", text: "on the roadmap · quoted on request" }
    : reserve
      ? { tone: "warn", text: "reserved · plan in 1 day" }
      : { tone: "ok", text: "available now" };
  const href = `/contact?gpu=${encodeURIComponent(gpu.id)}&count=${count}&hours=${hours.v}&npr=${total}`;

  return (
    <div ref={rootRef} className={cn("console", className)}>
      {/* The board: a trace pattern across the plate and a pulse of current
          running along it toward the screen. */}
      <span aria-hidden="true" className="console__traces" />
      <span aria-hidden="true" className="console__pulse" />
      <div className="console__bar">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="size-1.5 rounded-pill bg-hydro shadow-glow-sm" />
          quote console · np-ktm-1
        </span>
        <span className="hidden sm:inline">on-demand · billed per second · list prices</span>
      </div>

      <div className="console__body">
        {/* Dials. */}
        <div className="console__drums">
          <Drum
            label="gpu"
            items={GPUS.map((x) => ({ key: x.id, text: x.label, sub: x.sub }))}
            index={g}
            onChange={setG}
            className="drum--gpu"
            phase={phase}
            spin={-720}
            delay={0}
          />
          <Drum
            label="count"
            items={COUNTS.map((n) => ({
              key: String(n),
              text: `× ${n}`,
              sub: n === 8 ? "whole node" : n === 1 ? "single" : "multi-gpu",
            }))}
            index={c}
            onChange={setC}
            className="drum--count"
            phase={phase}
            spin={1080}
            delay={SPIN_STAGGER}
          />
          <Drum
            label="hours"
            items={HOURS.map((x) => ({ key: String(x.v), text: x.label, sub: x.sub }))}
            index={h}
            onChange={setH}
            className="drum--hours"
            phase={phase}
            spin={-1440}
            delay={2 * SPIN_STAGGER}
          />
        </div>

        {/* Screen. */}
        <div className="console__screen">
          <p className="console__eyebrow">
            {count}× {gpu.label} · {hours.label} · np-ktm-1
          </p>
          <p className="console__price">
            <span className="console__unit">NPR</span>
            <Odometer value={perHour} live={phase === "ready"} />
            <span className="console__per">/ hr</span>
          </p>
          <div className="console__rows">
            <p className="console__row">
              <span className="console__key">total for {hours.label}</span>
              <span className="console__val">
                NPR <Odometer value={total} live={phase === "ready"} />
              </span>
            </p>
            <p className="console__row">
              <span className="console__key">same run, us cloud est.</span>
              <span className="console__val console__val--dim">
                NPR {usTotal.toLocaleString("en-US")}
              </span>
            </p>
            <p className="console__row">
              <span className="console__key">capacity</span>
              <span
                className={cn(
                  "console__val flex items-center gap-1.5",
                  status.tone === "warn" ? "text-warning" : "text-hydro",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1 rounded-pill",
                    status.tone === "warn" ? "bg-warning" : "bg-hydro shadow-glow-sm",
                  )}
                />
                {status.text}
              </span>
            </p>
          </div>
          <div className="console__actions">
            <Link href={href}>
              <Button variant="primary" size="lg" iconRight={<Icon name="arrow-right" size={17} />}>
                Request this plan
              </Button>
            </Link>
            <span className="console__note">carries this configuration to the form</span>
          </div>
        </div>
      </div>
    </div>
  );
}
