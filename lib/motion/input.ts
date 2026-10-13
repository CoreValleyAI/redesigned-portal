/**
 * Two page-wide signals for everything that moves with the visitor
 * (docs/revamp/06, "touch is a first-class pointer"):
 *
 *  · scroll velocity: px/s, damped, positive while the page moves down;
 *  · the finger: where the last touch is on screen and whether it is down.
 *    Touch events keep arriving while the page scrolls under a held finger
 *    (pointer events are cancelled the moment scrolling starts), so a scene
 *    can light where the finger is through a whole swipe.
 *
 * One set of passive listeners for the page, attached on first use. Readings
 * are plain fields, cheap to poll from a frame task.
 */
import { onFrame, wake } from "./clock";
import { damp } from "./spring";

export interface Finger {
  /** Client (viewport) px of the first touch. */
  x: number;
  y: number;
  down: boolean;
  /** performance.now() of the last touch event; −1 before the first. */
  t: number;
}

const finger: Finger = { x: 0, y: 0, down: false, t: -1 };
let velocity = 0;
let lastY = 0;
let started = false;

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  lastY = window.scrollY;
  window.addEventListener("scroll", () => wake(), { passive: true });
  const onTouch = (e: TouchEvent) => {
    const t = e.touches[0];
    if (t) {
      finger.x = t.clientX;
      finger.y = t.clientY;
      finger.down = true;
    } else {
      finger.down = false;
    }
    finger.t = performance.now();
    wake();
  };
  for (const type of ["touchstart", "touchmove", "touchend", "touchcancel"] as const) {
    window.addEventListener(type, onTouch, { passive: true });
  }
  onFrame((_, dt) => {
    const y = window.scrollY;
    const raw = (y - lastY) / Math.max(dt, 1 / 240);
    lastY = y;
    velocity = damp(velocity, raw, 0.05, dt);
    if (Math.abs(velocity) < 2) velocity = 0;
    return velocity !== 0;
  });
}

/** Damped scroll velocity, px/s (positive: scrolling down). */
export function scrollVelocity(): number {
  start();
  return velocity;
}

/** The finger on screen (touch devices). The same object every call. */
export function readFinger(): Readonly<Finger> {
  start();
  return finger;
}
