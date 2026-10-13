"use client";

/**
 * "Pay for the seconds you use" (S8 teaser). Start a demo job and a meter
 * counts the seconds it runs (shown 12× faster than real time, and labelled
 * so); stop it and the count halts on the same frame. Beside it, the same
 * job under hourly rounding. The 60-second minimum is shown honestly: stop
 * before a minute and the bill says 60 s.
 *
 * No prices: rates are not published yet. Numbers update through
 * NumberFlow-like DOM writes on the shared clock, not React state.
 */
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/system/button";
import { cn } from "@/lib/cn";
import { onFrame } from "@/lib/motion/clock";

const SPEED = 12;
const JOB = 90;
const MINIMUM = 60;
const HOUR = 3600;

type Phase = "idle" | "running" | "stopped";

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

export function MeterTeaser() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [billed, setBilled] = useState(0);
  const [ran, setRan] = useState(0);
  const clockRef = useRef<HTMLSpanElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    if (phase !== "running") return;
    return onFrame((_, dt) => {
      elapsed.current = Math.min(JOB, elapsed.current + dt * SPEED);
      const s = elapsed.current;
      if (clockRef.current) clockRef.current.textContent = fmt(s);
      dialRef.current?.style.setProperty("--turn", `${(s / 60) % 1}`);
      if (s >= JOB) {
        setBilled(JOB);
        setRan(JOB);
        setPhase("stopped");
        return false;
      }
      return true;
    });
  }, [phase]);

  const start = () => {
    // With reduced motion the job "runs" instantly: the numbers, no meter.
    if (document.documentElement.dataset.motion === "reduce") {
      elapsed.current = JOB;
      if (clockRef.current) clockRef.current.textContent = fmt(JOB);
      setBilled(JOB);
      setRan(JOB);
      setPhase("stopped");
      return;
    }
    elapsed.current = 0;
    if (clockRef.current) clockRef.current.textContent = fmt(0);
    setBilled(0);
    setPhase("running");
  };
  const stop = () => {
    const s = Math.floor(elapsed.current);
    setRan(s);
    setBilled(Math.max(MINIMUM, s));
    setPhase("stopped");
  };

  const ratio = billed ? Math.round(HOUR / billed) : 0;

  return (
    <div className="grid gap-6 rounded-panel border border-line bg-bg-raised p-6 md:grid-cols-[auto_1fr] md:gap-10 md:p-10">
      <div className="flex items-center gap-6 md:flex-col md:items-start">
        <div
          ref={dialRef}
          aria-hidden="true"
          className="relative grid size-28 shrink-0 place-items-center rounded-full border border-line [--r:3rem] md:size-36 md:[--r:3.95rem]"
        >
          {Array.from({ length: 60 }, (_, i) => (
            <span
              key={i}
              className={cn("absolute top-1/2 left-1/2 -mt-0.5 -ml-0.5 size-1 rounded-full", i % 5 === 0 ? "bg-ink-2" : "bg-dot-off")}
              style={{ transform: `rotate(${i * 6}deg) translateY(calc(-1 * var(--r)))` }}
            />
          ))}
          <span
            className="absolute top-1/2 left-1/2 h-[42%] w-0.5 origin-bottom rounded-full bg-hydro"
            style={{ transform: "translate(-50%, -100%) rotate(calc(var(--turn, 0) * 1turn))" }}
          />
          <span className="absolute size-2.5 rounded-full bg-hydro" />
        </div>
        <div>
          <p className="type-kicker text-ink-3">Demo job · shown {SPEED}× faster</p>
          <p className="type-display-2 tabular mt-2 text-ink">
            <span ref={clockRef}>00:00</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-6">
        <dl className="grid grid-cols-2 gap-4">
          <div className="rounded-card bg-bg-sunken p-4">
            <dt className="type-kicker text-ink-3">Billed by CoreValley</dt>
            <dd className="type-title-2 tabular mt-2 text-hydro-ink light:text-hydro">
              {phase === "stopped" ? `${billed} s` : "—"}
            </dd>
          </div>
          <div className="rounded-card bg-bg-sunken p-4">
            <dt className="type-kicker text-ink-3">Rounded to the hour</dt>
            <dd className="type-title-2 tabular mt-2 text-ink-2">{phase === "stopped" ? `${HOUR.toLocaleString("en")} s` : "—"}</dd>
          </div>
        </dl>
        <p aria-live="polite" className="type-small min-h-[2.8em] text-ink-2">
          {phase === "stopped"
            ? ran < MINIMUM
              ? `The job ran ${ran} s; the 60-second minimum applies, so you pay for 60 s — still ${ratio}× less than an hour.`
              : `The job ran ${billed} s and you pay for ${billed} s — ${ratio}× less than an hour.`
            : phase === "running"
              ? "The meter runs only while the job does."
              : "Start the job, then stop it whenever you like."}
        </p>
        <div className="flex flex-wrap gap-3">
          {phase === "running" ? (
            <Button onClick={stop} size="lg">
              Stop the job
            </Button>
          ) : (
            <Button onClick={start} size="lg" variant={phase === "stopped" ? "secondary" : "primary"}>
              {phase === "stopped" ? "Run it again" : "Start a 90-second job"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
