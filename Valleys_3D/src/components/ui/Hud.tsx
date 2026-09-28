/**
 * The instruments over the flight: the bar (brand, stations, live telemetry,
 * the theme toggle and the way in), a rail of stations to jump between, and
 * the veil that lifts while the range rises on load.
 *
 * Telemetry is written straight to the DOM from a rAF loop at a few hertz;
 * only the active station goes through React state, and only when it changes.
 */
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { flight, flyTo } from "../../lib/flight";
import { SITE } from "../../lib/content";
import { STATIONS } from "../../lib/stations";
import { toggleTheme, useTheme } from "../../lib/theme";
import type { Quality } from "../../lib/quality";
import { IconMoon, IconPulse, IconSun } from "./icons";

const TIER = ["low", "medium", "high"] as const;

function ThemeToggle() {
  const theme = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="icon-btn relative overflow-hidden"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={theme}
          initial={{ y: 14, opacity: 0, rotate: -40 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 40 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="grid place-items-center"
        >
          {dark ? <IconSun size={16} /> : <IconMoon size={16} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function Hud({ quality, dots }: { quality: Quality; dots: number }) {
  const [active, setActive] = React.useState(0);
  const alt = React.useRef<HTMLSpanElement>(null);
  const hdg = React.useRef<HTMLSpanElement>(null);
  const fps = React.useRef<HTMLSpanElement>(null);
  const bar = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    let raf = 0, last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (bar.current) bar.current.style.transform = `scaleY(${flight.progress.toFixed(4)})`;
      if (now - last < 150) return;
      last = now;
      const t = flight.telemetry;
      if (alt.current) alt.current.textContent = Math.round(t.altitude).toLocaleString("en-US");
      if (hdg.current) hdg.current.textContent = String(Math.round(t.heading)).padStart(3, "0");
      if (fps.current) fps.current.textContent = String(Math.min(999, Math.round(t.fps)));
      let best = 0, bd = Infinity;
      flight.stops.forEach((s, i) => {
        const d = Math.abs(s - flight.progress);
        if (d < bd) { bd = d; best = i; }
      });
      setActive((a) => (a === best ? a : best));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 px-3 pt-3 md:px-5" data-ui>
        <div
          className="mx-auto flex h-13 max-w-[1440px] items-center gap-5 rounded-full border border-line px-3 pl-4 md:px-4 md:pl-5"
          style={{
            background: "var(--surface-2)",
            backdropFilter: "blur(22px) saturate(1.6)",
            WebkitBackdropFilter: "blur(22px) saturate(1.6)",
            boxShadow: "inset 0 1px 0 var(--inset), var(--shadow)",
          }}
        >
          <a href={SITE} className="flex shrink-0 items-center gap-2.5" aria-label="CoreValley">
            <img src="./brand/cv-brandmark.svg" alt="" className="h-[22px]" />
            <span className="hidden sm:block">
              <img src="./brand/cv-wordmark-white.svg" alt="CoreValley" className="only-dark h-[15px]" />
              <img src="./brand/cv-wordmark-carbon.svg" alt="" aria-hidden="true" className="only-light h-[15px]" />
            </span>
          </a>
          <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex" aria-label="Stations">
            {STATIONS.slice(1).map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => flyTo(i + 1)}
                className={`relative rounded-full px-3 py-1.5 text-[13px] tracking-[-0.01em] transition-colors ${active === i + 1 ? "text-fg" : "text-fg-3 hover:text-fg"}`}
              >
                {active === i + 1 ? (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full border border-line"
                    style={{ background: "var(--surface)" }}
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                ) : null}
                {s.label}
              </button>
            ))}
          </nav>
          <div
            className="eyebrow hidden shrink-0 items-center gap-3 text-[10px] xl:flex"
            title={`${dots.toLocaleString("en-US")} dots · gpu tier ${TIER[quality.tier]}`}
          >
            <IconPulse size={14} className="text-accent" />
            <span>
              alt <span ref={alt} className="metric text-fg">1,350</span> m
            </span>
            <span>
              hdg <span ref={hdg} className="metric text-fg">000</span>°
            </span>
            <span>
              <span ref={fps} className="metric text-fg">60</span> fps
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <ThemeToggle />
            <a href={`${SITE}/contact/`} className="btn btn-primary h-9 px-4 text-[13.5px]">
              Get early access
            </a>
          </div>
        </div>
      </header>

      <nav className="fixed top-1/2 right-4 z-20 hidden -translate-y-1/2 md:block" aria-label="Flight progress" data-ui>
        <div className="relative flex flex-col gap-3.5 py-1 pr-3">
          <span className="absolute top-0 right-0 bottom-0 w-px bg-line-2" />
          <span
            ref={bar}
            className="absolute top-0 right-0 bottom-0 w-px origin-top bg-gradient-to-b from-accent to-accent-2"
            style={{ transform: "scaleY(0)" }}
          />
          {STATIONS.map((s, i) => (
            <button key={s.id} type="button" onClick={() => flyTo(i)} className="group flex items-center justify-end gap-3" aria-label={s.label}>
              <span
                className={`eyebrow text-[9.5px] transition-all duration-300 ${
                  active === i ? "text-fg opacity-100" : "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                }`}
              >
                {s.label}
              </span>
              <span
                className={`relative -mr-[3.5px] size-[7px] rounded-full transition-all duration-300 ${
                  active === i ? "scale-125 bg-accent shadow-[0_0_0_4px_rgb(var(--accent-rgb)/0.18)]" : "bg-fg-4"
                }`}
              />
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

/** Covers the first moments while the GPU compiles shaders and the range rises. */
export function Veil({ ready, dots }: { ready: boolean; dots: number }) {
  return (
    <AnimatePresence>
      {!ready ? (
        <motion.div
          key="veil"
          className="fixed inset-0 z-50 grid place-items-center bg-bg"
          exit={{ opacity: 0, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } }}
        >
          <div className="flex flex-col items-center gap-5">
            <img src="./brand/cv-brandmark.svg" alt="" className="h-9" />
            <p className="eyebrow text-[10px]">Raising the range · {dots.toLocaleString("en-US")} dots</p>
            <span className="relative h-px w-36 overflow-hidden bg-line-2">
              <motion.span
                className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-accent to-accent-2"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
