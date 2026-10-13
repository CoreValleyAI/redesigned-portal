/**
 * Scroll progress without layout reads per frame.
 *
 * Element geometry (document-relative top and height) is measured once and
 * re-measured only when the page's size changes (ResizeObserver on <body>,
 * window resize). Each frame then derives progress from window.scrollY
 * alone. Progress is "damped" (06 §3): the value an animation uses chases
 * the true scroll position with a short half-life, so stepped wheel input
 * still produces liquid motion — while the page's real scroll position is
 * never touched.
 */
import { onFrame, wake } from "./clock";
import { damp } from "./spring";

interface Tracked {
  el: HTMLElement;
  top: number;
  height: number;
  mode: Mode;
  value: number;
  target: number;
  halfLife: number;
  cb: (p: number) => void;
}

/**
 *  "pin"      a tall section with a sticky stage: 0 when its top reaches the
 *             viewport top, 1 when its bottom reaches the viewport bottom.
 *  "through"  from the element's top entering at the bottom of the viewport
 *             to its bottom leaving at the top.
 *  "enter"    from its top at the viewport bottom to its top at the viewport
 *             top (how far it has risen into view).
 *  "center"   from its top crossing the middle of the viewport to its
 *             bottom crossing it (a reading line through a long list).
 *  "leave"    from its top at the viewport top to its bottom there (how far
 *             a full-screen section has scrolled away).
 *  "end"      from its top entering at the bottom of the viewport to the
 *             page scrolled to its very end (the footer filling up).
 */
export type Mode = "pin" | "through" | "enter" | "center" | "leave" | "end";

const tracked = new Set<Tracked>();
let vh = 0;
let docH = 0;
let observing = false;
let stop: (() => void) | null = null;

function measure(t: Tracked) {
  const r = t.el.getBoundingClientRect();
  t.top = r.top + window.scrollY;
  t.height = r.height;
}

function measureAll() {
  vh = window.innerHeight;
  docH = document.documentElement.scrollHeight;
  for (const t of tracked) measure(t);
  wake();
}

function targetOf(t: Tracked, y: number) {
  let p: number;
  if (t.mode === "pin") p = (y - t.top) / Math.max(1, t.height - vh);
  else if (t.mode === "through") p = (y + vh - t.top) / (t.height + vh);
  else if (t.mode === "center") p = (y + vh / 2 - t.top) / Math.max(1, t.height);
  else if (t.mode === "leave") p = (y - t.top) / Math.max(1, t.height);
  else if (t.mode === "end") p = (y + vh - t.top) / Math.max(1, docH - t.top);
  else p = (y + vh - t.top) / vh;
  return Math.min(1, Math.max(0, p));
}

function tick(_: number, dt: number) {
  const y = window.scrollY;
  let moving = false;
  for (const t of tracked) {
    t.target = targetOf(t, y);
    const next = damp(t.value, t.target, t.halfLife, dt);
    if (Math.abs(next - t.target) < 0.0005) {
      if (t.value !== t.target) {
        t.value = t.target;
        t.cb(t.value);
      }
    } else {
      t.value = next;
      t.cb(next);
      moving = true;
    }
  }
  return moving;
}

function start() {
  if (observing) return;
  observing = true;
  vh = window.innerHeight;
  docH = document.documentElement.scrollHeight;
  const ro = new ResizeObserver(measureAll);
  ro.observe(document.body);
  const onScroll = () => wake();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measureAll);
  const off = onFrame(tick);
  stop = () => {
    ro.disconnect();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", measureAll);
    off();
    observing = false;
  };
}

/**
 * Call `cb` with the element's progress (0–1) whenever it changes.
 * `halfLife` (seconds) sets the damping; 0 follows scroll exactly.
 * Under reduced motion progress still updates, undamped, so pages can
 * switch states — they must not animate continuously with it.
 */
export function trackScroll(el: HTMLElement, mode: Mode, cb: (p: number) => void, halfLife = 0.08): () => void {
  const reduced = document.documentElement.dataset.motion === "reduce";
  const t: Tracked = { el, top: 0, height: 0, mode, value: 0, target: 0, halfLife: reduced ? 0 : halfLife, cb };
  tracked.add(t);
  start();
  measure(t);
  t.value = t.target = targetOf(t, window.scrollY);
  cb(t.value);
  return () => {
    tracked.delete(t);
    if (!tracked.size) stop?.();
  };
}

/** Map p from [a, b] to [0, 1], clamped. */
export function segment(p: number, a: number, b: number): number {
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}

export const ease = {
  out: (t: number) => 1 - (1 - t) ** 3,
  inOut: (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  expo: (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
};
