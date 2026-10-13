"use client";

/**
 * The use-case carousel (home and /use-cases): one card per story, each
 * with its live picture of the work. A native scroll-snap track, so a swipe
 * on a phone has the platform's own momentum; buttons, the progress marks
 * and the arrow keys move it too.
 *
 * It advances by itself every few seconds while it is on screen — never
 * with reduced motion, never while the pointer or focus is inside it, and
 * not for a while after the visitor has moved it. A pause button stops it
 * for good (WCAG 2.2.2). Cards ease back and dim a little as they slide out
 * of the reading position, so the row feels like one surface moving.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { AppLink } from "@/components/system/app-link";
import { Arrow } from "@/components/system/button";
import { PRODUCTS } from "@/copy/en/products";
import type { UseCase } from "@/copy/en/use-cases";
import { cn } from "@/lib/cn";
import { useMotionPref } from "@/lib/theme";
import { variantFor, Vignette } from "./vignettes";

const INTERVAL = 6500;
const RESUME_AFTER = 14000;

export function UseCaseCarousel({
  cases,
  label = "Use cases",
  size = "md",
  linkBase = "/use-cases",
}: {
  cases: UseCase[];
  label?: string;
  size?: "md" | "lg";
  /** Where a card's link goes (its #slug is appended). */
  linkBase?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false); // by the visitor, for good
  const [held, setHeld] = useState(false); // hover, focus or a recent swipe
  const [visible, setVisible] = useState(false);
  const reduced = useMotionPref() === "reduce";
  const resumeTimer = useRef(0);

  const cards = () => Array.from(track.current?.children ?? []) as HTMLElement[];

  const go = useCallback((i: number) => {
    const t = track.current;
    const list = Array.from(t?.children ?? []) as HTMLElement[];
    const card = list[(i + list.length) % list.length];
    if (!t || !card) return;
    const pad = parseFloat(getComputedStyle(t).scrollPaddingLeft) || 0;
    const reduce = document.documentElement.dataset.motion === "reduce";
    t.scrollTo({ left: card.offsetLeft - pad, behavior: reduce ? "auto" : "smooth" });
  }, []);

  // Which card is in the reading position, and how far each one is from it.
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    let raf = 0;
    const still = document.documentElement.dataset.motion === "reduce";
    const measure = () => {
      raf = 0;
      const pad = parseFloat(getComputedStyle(t).scrollPaddingLeft) || 0;
      const line = t.scrollLeft + pad;
      let best = 0;
      let bestD = Infinity;
      cards().forEach((c, i) => {
        const d = (c.offsetLeft - line) / Math.max(1, c.offsetWidth);
        // A card partly out of view eases back by how much of it is
        // hidden (never dimmed: its text keeps its contrast); cards wholly
        // in view stay as they are.
        if (!still) {
          const left = c.offsetLeft - t.scrollLeft;
          const shown = Math.min(left + c.offsetWidth, t.clientWidth) - Math.max(left, 0);
          const hidden = 1 - Math.max(0, Math.min(1, shown / c.offsetWidth));
          c.style.setProperty("--s", (1 - hidden * 0.06).toFixed(4));
          c.style.transformOrigin = left < 0 ? "right center" : "left center";
        }
        if (Math.abs(d) < bestD) {
          bestD = Math.abs(d);
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    t.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      t.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // On screen?
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(Boolean(e?.isIntersecting)), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = visible && !paused && !held && !reduced;

  // Advance.
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => go(active + 1), INTERVAL);
    return () => window.clearTimeout(timer);
  }, [running, active, go]);

  // A swipe or a click holds the carousel for a while, then lets it go.
  const hold = () => {
    setHeld(true);
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setHeld(false), RESUME_AFTER);
  };
  useEffect(() => () => window.clearTimeout(resumeTimer.current), []);

  const width = size === "lg" ? "w-[min(86vw,34rem)]" : "w-[min(84vw,27rem)]";

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="uc-carousel flex flex-col gap-8"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHeld(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(active + 1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(active - 1);
        }
      }}
    >
      <div
        ref={track}
        className="uc-track flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] md:gap-5 [&::-webkit-scrollbar]:hidden"
        onPointerDown={hold}
        onTouchStart={hold}
        onWheel={(e) => Math.abs(e.deltaX) > Math.abs(e.deltaY) && hold()}
      >
        {cases.map((u, i) => (
          <div
            key={u.slug}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${cases.length}: ${u.title}`}
            className={cn("uc-card shrink-0 snap-start", width)}
          >
            <article className="group relative flex h-full flex-col overflow-hidden rounded-panel border border-line bg-bg-raised transition-[border-color,box-shadow] duration-[var(--dur-short)] hover:border-line-strong">
              <Vignette
                art={u.art}
                variant={variantFor(u.slug)}
                className="aspect-[16/10] w-full border-b border-line"
              />
              <div className="flex flex-1 flex-col gap-3 p-6 md:p-7">
                <p className="type-kicker text-ink-3">{u.sector}</p>
                <h3 className="type-title-3 text-balance">
                  <AppLink
                    href={`${linkBase}#${u.slug}`}
                    className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                  >
                    {u.title}
                  </AppLink>
                </h3>
                <p className="type-small text-ink-2">{u.short}</p>
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-3">
                  {u.workloads.slice(0, 3).map((w) => (
                    <li
                      key={w}
                      className="type-caption rounded-pill border border-line px-2.5 py-1 font-mono text-ink-3"
                    >
                      {w}
                    </li>
                  ))}
                </ul>
                <p className="type-caption flex items-center gap-1.5 text-ink-3">
                  Runs on{" "}
                  {u.runsOn
                    .slice(0, 2)
                    .map((s) => PRODUCTS.find((p) => p.slug === s)!.name)
                    .join(" · ")}
                  <Arrow className="ml-auto text-ink-3 transition-transform duration-[var(--dur-spring-snappy)] ease-spring group-hover:translate-x-1 group-hover:text-ink" />
                </p>
              </div>
            </article>
          </div>
        ))}
      </div>

      <div className="container-page flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              hold();
              go(active - 1);
            }}
            aria-label="Previous"
            className="lg-button grid size-11 place-items-center rounded-full text-ink"
          >
            <Arrow className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => {
              hold();
              go(active + 1);
            }}
            aria-label="Next"
            className="lg-button grid size-11 place-items-center rounded-full text-ink"
          >
            <Arrow />
          </button>
        </div>
        {/* On a phone the marks are too narrow to tap: there they only show
            the progress, and the arrows, a swipe or the keys move it. */}
        <div aria-hidden="true" className="flex flex-1 items-center gap-1 md:hidden">
          {cases.map((u, i) => (
            <span key={u.slug} className="relative block h-1 flex-1 overflow-hidden rounded-full bg-line">
              <span
                key={i === active ? `on-${active}` : "off"}
                className={cn(
                  "uc-seg absolute inset-0 origin-left rounded-full bg-hydro",
                  i < active && "scale-x-100",
                  i > active && "scale-x-0",
                  i === active && (running ? "is-running" : "scale-x-100"),
                )}
                style={{ "--dur": `${INTERVAL}ms` } as React.CSSProperties}
              />
            </span>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {`Story ${active + 1} of ${cases.length}: ${cases[active]?.title ?? ""}`}
        </p>
        <ol className="hidden flex-1 items-center gap-1.5 md:flex" aria-label="Stories">
          {cases.map((u, i) => (
            <li key={u.slug} className="flex-1">
              <button
                type="button"
                onClick={() => {
                  hold();
                  go(i);
                }}
                aria-label={`${u.title}`}
                aria-current={i === active ? "true" : undefined}
                className="group/seg flex h-11 w-full items-center"
              >
                <span className="relative block h-1 w-full overflow-hidden rounded-full bg-line transition-colors group-hover/seg:bg-line-strong">
                  <span
                    key={i === active ? `on-${active}` : "off"}
                    className={cn(
                      "uc-seg absolute inset-0 origin-left rounded-full bg-hydro",
                      i < active && "scale-x-100",
                      i > active && "scale-x-0",
                      i === active && (running ? "is-running" : "scale-x-100"),
                    )}
                    style={{ "--dur": `${INTERVAL}ms` } as React.CSSProperties}
                  />
                </span>
              </button>
            </li>
          ))}
        </ol>
        {!reduced && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play the carousel" : "Pause the carousel"}
            className="lg-button grid size-11 place-items-center rounded-full text-ink"
          >
            {paused ? (
              <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden="true">
                <path d="M4 2.5v11l9-5.5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden="true">
                <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
