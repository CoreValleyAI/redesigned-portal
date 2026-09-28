/**
 * Shared, mutable flight state. The DOM writes it (scroll, pointer, layout);
 * the render loop reads it every frame. It is deliberately not React state:
 * nothing here should re-render a component 60 times a second.
 *
 * Scrolling is smoothed by Lenis, so a mouse wheel's coarse steps become one
 * continuous glide: the pinned panels and the camera move together instead
 * of the page jumping while the camera eases. Under reduced motion the page
 * scrolls natively.
 */
import Lenis from "lenis";

let lenis: Lenis | null = null;

export const flight = {
  /** Scroll progress 0..1, as the page reports it. */
  target: 0,
  /** Progress the camera is actually at: `target`, through a spring (Director). */
  progress: 0,
  /** The spring's velocity, progress per second: + forward, − back. */
  velocity: 0,
  /** Pointer in normalised device coords (−1..1), and whether it is live. */
  pointer: { x: 0, y: 0, active: false, lastMove: 0 },
  /** Last click, in NDC, and when (seconds of scene time). */
  ping: { x: 0, y: 0, t: -100 },
  /** Progress at the centre of each section, measured from the DOM. */
  stops: [] as number[],
  /** Live telemetry for the HUD, written by the camera. */
  telemetry: { altitude: 0, heading: 0, speed: 0, fps: 60, z: 0 },
  reducedMotion: false,
};

function readScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  flight.target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

/** Measure where each section's centre sits in scroll progress. */
function measureStops() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return;
  flight.stops = Array.from(document.querySelectorAll<HTMLElement>("[data-station]")).map((el) => {
    const mid = el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2;
    return Math.min(1, Math.max(0, mid / max));
  });
}

export function bindFlight() {
  flight.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const onMove = (e: PointerEvent) => {
    flight.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    flight.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    flight.pointer.active = true;
    flight.pointer.lastMove = performance.now();
  };
  const onLeave = () => { flight.pointer.active = false; };
  const onResize = () => { measureStops(); readScroll(); };
  let raf = 0;
  if (!flight.reducedMotion) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.2 });
    lenis.on("scroll", readScroll);
    const loop = (t: number) => {
      lenis?.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }
  const ro = new ResizeObserver(onResize);
  ro.observe(document.body);
  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", onResize);
  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  onResize();
  return () => {
    cancelAnimationFrame(raf);
    lenis?.destroy();
    lenis = null;
    ro.disconnect();
    window.removeEventListener("scroll", readScroll);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
  };
}

/** Scroll the page so the camera lands on section `i`. */
export function flyTo(i: number) {
  const el = document.querySelectorAll<HTMLElement>("[data-station]")[i];
  if (!el) return;
  const top = el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2;
  if (lenis) lenis.scrollTo(top, { duration: 2.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top, behavior: "auto" });
}

/** Where `p` falls between the section stops: index of the stop below, and the blend to the next. */
export function stationAt(p: number): [number, number, number] {
  const s = flight.stops;
  if (s.length < 2) return [0, 0, 0];
  if (p <= s[0]!) return [0, 0, 0];
  for (let i = 0; i < s.length - 1; i++) {
    const a = s[i]!, b = s[i + 1]!;
    if (p <= b) {
      const t = b > a ? (p - a) / (b - a) : 0;
      return [i, i + 1, t];
    }
  }
  return [s.length - 1, s.length - 1, 0];
}
