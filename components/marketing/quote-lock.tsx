"use client";

/**
 * The quote console: three dials — GPU, count, hours — and a screen that
 * reads the plan back in plain words, says whether it can run today, and
 * hands it to the contact form.
 *
 * DIALS. Each is a real cylinder in CSS 3D inside a bordered housing: the
 * options sit on a drum that rotates about its horizontal axis behind a
 * recessed window, with knurled grips down both sides and a chevron above
 * and below, the way a rack's setting dial turns. Transforms only, so it
 * costs nothing at rest.
 *
 * TURNING. Click (or tap, or Tab to) a dial to take hold of it; then the
 * wheel, a drag, the arrow keys, a chevron or the option above or below all
 * turn it. A dial that is not held never takes the wheel, so scrolling past
 * the console scrolls the page — and a held dial at its end lets the wheel
 * go. Touch never turns a dial by dragging: on a phone the console sits in
 * the scroll path, so a swipe always scrolls, and a tap on a chevron turns.
 *
 * SCREEN. Rates are not published yet, so there is no price here: the
 * screen states the plan, its status (H200 is available now; the rest of the
 * roadmap is "coming soon", read from the catalogue), what comes back, and
 * the button. The button carries the plan to /contact, where the form reads
 * it back (components/marketing/quote-plan.ts is the shared vocabulary).
 *
 * The Odometer below is kept for when published rates return to the screen.
 */

import * as React from "react";
import { ButtonLink, Icon } from "@/components/ui";
import { EARLY_ACCESS } from "@/lib/availability";
import { cn } from "@/lib/cn";
import { QUOTE_COUNTS, QUOTE_GPUS, QUOTE_HOURS, planHref } from "./quote-plan";

/** The rung each dial starts on: a full H200, one card, one day. */
const GPU_DEFAULT = Math.max(0, QUOTE_GPUS.findIndex((x) => x.id === "h200"));
const COUNT_DEFAULT = 0;
const HOURS_DEFAULT = 2;

/** Positions on the drum: at least as many as the longest list, and a few
    more, so the cylinder is round and no two options share an angle. */
const SLOTS = 12;
const STEP = 360 / SLOTS;
/** The intro settle, ms, and the stagger between dials. Matches the CSS. */
const SPIN_MS = 1700;
const SPIN_STAGGER = 160;
/** Wheel travel per step, and drag travel per step, in px. */
const WHEEL_STEP = 40;
const DRAG_STEP = 32;

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
  const rootRef = React.useRef<HTMLDivElement>(null);
  const winRef = React.useRef<HTMLDivElement>(null);
  const idx = React.useRef(index);
  idx.current = index;
  /** True from the moment a mouse drag starts until just after it ends, so
      the click that ends a drag does not also pick the option under it. */
  const dragged = React.useRef(false);
  const clamp = React.useCallback(
    (i: number) => Math.min(items.length - 1, Math.max(0, i)),
    [items.length],
  );

  /** Turn to `i` and take hold of the dial, so the wheel and keys follow. */
  const pick = (i: number) => {
    onChange(clamp(i));
    winRef.current?.focus({ preventScroll: true });
  };

  React.useEffect(() => {
    const root = rootRef.current;
    const el = winRef.current;
    if (!root || !el) return;
    let acc = 0;
    let startY: number | null = null;
    let lastY = 0;
    let moving = false;

    const onWheel = (e: WheelEvent) => {
      // Not held: the wheel belongs to the page.
      if (!root.contains(document.activeElement)) return;
      const dir = Math.sign(e.deltaY);
      // Held but already at the end it is turning toward: let the page go.
      if (dir === 0 || clamp(idx.current + dir) === idx.current) {
        acc = 0;
        return;
      }
      e.preventDefault();
      acc += e.deltaY;
      if (Math.abs(acc) >= WHEEL_STEP) {
        onChange(clamp(idx.current + Math.sign(acc)));
        acc = 0;
      }
    };
    const onDown = (e: PointerEvent) => {
      // Touch scrolls the page; tapping a chevron or an option turns.
      if (e.pointerType === "touch") return;
      el.focus({ preventScroll: true });
      startY = e.clientY;
      lastY = e.clientY;
      moving = false;
    };
    const onMove = (e: PointerEvent) => {
      if (startY === null) return;
      if (!moving) {
        if (Math.abs(e.clientY - startY) < 6) return;
        // A real drag: hold the pointer so it keeps turning past the edge.
        moving = true;
        dragged.current = true;
        el.setPointerCapture(e.pointerId);
      }
      const dy = lastY - e.clientY;
      if (Math.abs(dy) >= DRAG_STEP) {
        onChange(clamp(idx.current + Math.sign(dy)));
        lastY = e.clientY;
      }
    };
    const onUp = () => {
      startY = null;
      if (moving) {
        moving = false;
        window.setTimeout(() => {
          dragged.current = false;
        }, 0);
      }
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
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") onChange(clamp(idx.current - 1));
    else if (e.key === "ArrowDown" || e.key === "ArrowRight") onChange(clamp(idx.current + 1));
    else if (e.key === "Home") onChange(0);
    else if (e.key === "End") onChange(items.length - 1);
    else return;
    e.preventDefault();
  };

  const current = items[index]!;

  return (
    <div ref={rootRef} className={cn("drum", className)}>
      <span className="drum__label">
        <span>{label}</span>
        {/* The next gesture, for the pointer in hand: "click" to take hold,
            then "scroll" while held; "tap" on touch. */}
        <span className="drum__hint" aria-hidden="true">
          <span className="drum__hint--fine">
            <span className="drum__hint-idle">click</span>
            <span className="drum__hint-held">scroll</span>
          </span>
          <span className="drum__hint--coarse">tap ▲▼</span>
        </span>
      </span>

      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={index === 0}
        onClick={() => pick(idx.current - 1)}
        className="drum__chev"
      >
        <Chevron up />
      </button>

      <div
        ref={winRef}
        role="spinbutton"
        tabIndex={0}
        aria-label={label}
        aria-valuenow={index}
        aria-valuemin={0}
        aria-valuemax={items.length - 1}
        aria-valuetext={current.sub ? `${current.text}, ${current.sub}` : current.text}
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
                onClick={() => {
                  if (dragged.current) return;
                  pick(i);
                }}
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
        onClick={() => pick(idx.current + 1)}
        className="drum__chev"
      >
        <Chevron />
      </button>
    </div>
  );
}

/* ── Rolling digits ──────────────────────────────────────────────────────── */

/* Unused until published rates return to the screen. Kept intact so the
   readout can come back without re-deriving the rolling-digit layout. */
/* eslint-disable @typescript-eslint/no-unused-vars */

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

/* eslint-enable @typescript-eslint/no-unused-vars */

/* ── The console ─────────────────────────────────────────────────────────── */

export function QuoteLock({ className }: { className?: string }) {
  const [g, setG] = React.useState(GPU_DEFAULT);
  const [c, setC] = React.useState(COUNT_DEFAULT);
  const [h, setH] = React.useState(HOURS_DEFAULT);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [phase, setPhase] = React.useState<Phase>("hold");

  // The intro: the dials sit a few turns off until the console is well
  // into view, then spin home — alternating directions, staggered. Then the
  // visitor has them.
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

  const gpu = QUOTE_GPUS[g]!;
  const count = QUOTE_COUNTS[c]!;
  const hours = QUOTE_HOURS[h]!;
  const href = planHref({ gpu, count, hours });

  /* The count dial reads in the GPU's own unit: slices for a MIG profile,
     cards (and a whole eight-card server) for a full GPU. */
  const countItems = QUOTE_COUNTS.map((n) => ({
    key: String(n),
    text: `× ${n}`,
    sub: gpu.slice
      ? n === 1
        ? "one slice"
        : `${n} slices`
      : n === 8
        ? "full server"
        : n === 1
          ? "one card"
          : "multi-gpu",
  }));

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
        <span className="hidden sm:inline">per-second billing · quoted in NPR</span>
      </div>

      <div className="console__body">
        {/* Dials. */}
        <div className="console__drums">
          <Drum
            label="gpu"
            items={QUOTE_GPUS.map((x) => ({ key: x.id, text: x.dial, sub: x.sub }))}
            index={g}
            onChange={setG}
            className="drum--gpu"
            phase={phase}
            spin={-720}
            delay={0}
          />
          <Drum
            label="count"
            items={countItems}
            index={c}
            onChange={setC}
            className="drum--count"
            phase={phase}
            spin={1080}
            delay={SPIN_STAGGER}
          />
          <Drum
            label="hours"
            items={QUOTE_HOURS.map((x) => ({ key: String(x.v), text: x.dial, sub: x.sub }))}
            index={h}
            onChange={setH}
            className="drum--hours"
            phase={phase}
            spin={-1440}
            delay={2 * SPIN_STAGGER}
          />
        </div>

        {/* Screen: the plan in words, whether it runs today, what comes
            back, and the button that carries it to the form. */}
        <div className="console__screen">
          <p className="console__eyebrow">your plan · np-ktm-1</p>
          <p className="console__plan">
            <span className="console__plan-main nums">
              {count}× {gpu.short}
            </span>
            <span className="console__plan-sub">for {hours.long}</span>
          </p>

          <dl className="console__rows">
            <div className="console__row">
              <dt className="console__key">status</dt>
              <dd
                className={cn(
                  "console__val console__status",
                  gpu.soon && "console__status--soon",
                )}
              >
                {gpu.soon ? "Coming soon · we'll tell you first" : "Available now · enterprise early access"}
              </dd>
            </div>
            <div className="console__row">
              <dt className="console__key">you get</dt>
              <dd className="console__val">
                {gpu.soon
                  ? "First word when it lands, plus an H200 plan if it fits"
                  : "A capacity plan and a firm NPR quote"}
              </dd>
            </div>
            <div className="console__row">
              <dt className="console__key">reply</dt>
              <dd className="console__val">
                {EARLY_ACCESS.replyTime.charAt(0).toUpperCase() + EARLY_ACCESS.replyTime.slice(1)}
              </dd>
            </div>
            <div className="console__row">
              <dt className="console__key">billing</dt>
              <dd className="console__val">Per second · 60 s minimum · in NPR</dd>
            </div>
          </dl>

          <div className="console__actions">
            <ButtonLink
              href={href}
              variant="primary"
              size="lg"
              iconRight={<Icon name="arrow-right" size={17} />}
            >
              {gpu.soon ? "Join the waitlist" : "Request this plan"}
            </ButtonLink>
            <span className="console__note">carries this configuration to the form</span>
          </div>
        </div>
      </div>
    </div>
  );
}
