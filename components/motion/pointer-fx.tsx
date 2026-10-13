"use client";

/**
 * Dew: the cursor's companion, and magnetic buttons (docs/revamp/06 §5).
 *
 * The native cursor always stays. Beside it, a small soft dot follows the
 * pointer closely and a ring trails it a little behind, so the cursor
 * reads as fluid rather than as an arrow on glass. Over a button or link
 * the ring lets go of the pointer and settles around the target, the way
 * an iPad's pointer becomes the button it is over; a [data-magnetic]
 * button also leans toward the pointer, up to 8 px. A [data-cursor]
 * element (a thing to drag, say) turns the ring into a small label. Over
 * text fields and frames the layer steps aside: the caret is enough.
 *
 * Fine pointers only, and never with reduced motion (the site's toggle or
 * the OS): the layer is created and removed as either changes. One element
 * tree, moved with transforms on the site's single frame clock; layout is
 * read only when the target changes or the page scrolls.
 */
import { useEffect } from "react";
import { onFrame, wake } from "@/lib/motion/clock";
import { damp } from "@/lib/motion/spring";
import { readMotion, subscribePrefs } from "@/lib/theme";

const HUG = 'a[href], button:not([disabled]), [role="button"], summary, label[for], [data-cursor]';
const STEP_ASIDE =
  'input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, select, [contenteditable="true"], iframe';
/** Targets bigger than this are areas, not controls: the ring stays free. */
const HUG_MAX = { w: 340, h: 76 };
const MAGNET = 8;

export function PointerFx() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let stop: (() => void) | null = null;
    const sync = () => {
      const want = fine.matches && readMotion() === "full";
      if (want && !stop) stop = start();
      else if (!want && stop) {
        stop();
        stop = null;
      }
    };
    sync();
    const offPrefs = subscribePrefs(sync);
    fine.addEventListener("change", sync);
    return () => {
      offPrefs();
      fine.removeEventListener("change", sync);
      stop?.();
    };
  }, []);
  return null;
}

function start(): () => void {
  const root = document.createElement("div");
  root.className = "dew";
  root.setAttribute("aria-hidden", "true");
  const ring = document.createElement("div");
  ring.className = "dew__ring";
  const label = document.createElement("span");
  label.className = "dew__label";
  ring.append(label);
  const dot = document.createElement("div");
  dot.className = "dew__dot";
  root.append(ring, dot);
  document.body.append(root);

  // The pointer, the dot and the ring (centre, size, corner radius).
  let px = -200;
  let py = -200;
  let dx = px;
  let dy = py;
  let rx = px;
  let ry = py;
  let rw = 30;
  let rh = 30;
  let rr = 15;
  let shown = 0;
  let want = 0;
  let aside = false;
  let press = 0;
  let down = false;

  // What the ring is settled on, if anything.
  let target: HTMLElement | null = null;
  let base: { cx: number; cy: number; w: number; h: number; r: number } | null = null;
  let labelW = 0;
  let mode: "free" | "hug" | "label" = "free";

  // The magnetic button currently leaning, and its offset.
  let magnet: HTMLElement | null = null;
  let mx = 0;
  let my = 0;

  const measure = () => {
    if (!target) {
      base = null;
      return;
    }
    const r = target.getBoundingClientRect();
    const radius = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 8;
    // The rect includes the magnetic lean; take it out to get the resting box.
    const lean = target === magnet;
    base = {
      cx: r.left + r.width / 2 - (lean ? mx : 0),
      cy: r.top + r.height / 2 - (lean ? my : 0),
      w: r.width,
      h: r.height,
      r: Math.min(radius, r.height / 2),
    };
  };

  const setTarget = (el: HTMLElement | null) => {
    if (el === target) return;
    target = el;
    const text = el?.dataset.cursor ?? "";
    if (text) {
      label.textContent = text;
      labelW = label.offsetWidth;
      mode = "label";
    } else {
      measure();
      mode = base && base.w <= HUG_MAX.w && base.h <= HUG_MAX.h ? "hug" : "free";
    }
    const nextMagnet = el?.closest<HTMLElement>("[data-magnetic]") ?? null;
    if (nextMagnet !== magnet) {
      if (magnet) release(magnet);
      magnet = nextMagnet;
    }
  };

  // Magnetic buttons on their way home after the pointer has left them.
  const leaving = new Map<HTMLElement, { x: number; y: number }>();
  const release = (el: HTMLElement) => {
    leaving.set(el, { x: mx, y: my });
    mx = 0;
    my = 0;
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    px = e.clientX;
    py = e.clientY;
    if (!want) {
      want = 1;
      if (shown < 0.01) {
        dx = rx = px;
        dy = ry = py;
      }
    }
    wake();
  };
  const onOver = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const t = e.target instanceof Element ? e.target : null;
    aside = Boolean(t?.closest(STEP_ASIDE));
    setTarget(aside ? null : (t?.closest<HTMLElement>(HUG) ?? null));
    wake();
  };
  const onOut = (e: PointerEvent) => {
    if (!e.relatedTarget) {
      want = 0;
      setTarget(null);
      wake();
    }
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    down = true;
    wake();
  };
  const onUp = () => {
    down = false;
    wake();
  };
  const onScroll = () => {
    if (target) measure();
    wake();
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerover", onOver, { passive: true });
  document.addEventListener("pointerout", onOut, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true, capture: true });
  window.addEventListener("resize", onScroll, { passive: true });

  const off = onFrame((_now, dt) => {
    let moving = false;
    const step = (a: number, b: number, half: number) => {
      const v = damp(a, b, half, dt);
      if (Math.abs(v - b) > 0.05) moving = true;
      return v;
    };

    shown = step(shown, aside ? 0 : want, 0.06);
    press = step(press, down ? 1 : 0, 0.04);

    // Settle on the target only while the pointer is actually near it: a
    // card's stretched link covers the card, but its box is the title.
    const hug =
      mode === "hug" &&
      base !== null &&
      Math.abs(px - base.cx) <= base.w / 2 + 24 &&
      Math.abs(py - base.cy) <= base.h / 2 + 24;
    const look = hug ? "hug" : mode === "label" ? "label" : "free";
    if (root.dataset.mode !== look) root.dataset.mode = look;

    // The magnetic lean, and any button still springing home.
    if (magnet && base && hug) {
      const tx = Math.max(-MAGNET, Math.min(MAGNET, (px - base.cx) * 0.24));
      const ty = Math.max(-MAGNET, Math.min(MAGNET, (py - base.cy) * 0.3));
      mx = step(mx, tx, 0.07);
      my = step(my, ty, 0.07);
      magnet.style.translate = `${mx.toFixed(2)}px ${my.toFixed(2)}px`;
    }
    for (const [el, o] of leaving) {
      o.x = step(o.x, 0, 0.09);
      o.y = step(o.y, 0, 0.09);
      if (Math.abs(o.x) < 0.05 && Math.abs(o.y) < 0.05) {
        el.style.translate = "";
        leaving.delete(el);
      } else el.style.translate = `${o.x.toFixed(2)}px ${o.y.toFixed(2)}px`;
    }

    // Where the ring wants to be.
    let tx = px;
    let ty = py;
    let tw = 30;
    let th = 30;
    let tr = 15;
    if (hug && base) {
      const lean = target === magnet;
      tx = base.cx + (lean ? mx : 0);
      ty = base.cy + (lean ? my : 0);
      tw = base.w + 12;
      th = base.h + 10;
      tr = base.r + 5;
    } else if (mode === "label") {
      tw = labelW + 30;
      th = 34;
      tr = 17;
    }
    const k = 1 - press * 0.08;
    rx = step(rx, tx, hug ? 0.06 : 0.09);
    ry = step(ry, ty, hug ? 0.06 : 0.09);
    rw = step(rw, tw * k, 0.06);
    rh = step(rh, th * k, 0.06);
    rr = step(rr, tr, 0.06);
    dx = step(dx, px, 0.018);
    dy = step(dy, py, 0.018);

    root.style.opacity = shown.toFixed(3);
    ring.style.transform = `translate3d(${(rx - rw / 2).toFixed(2)}px, ${(ry - rh / 2).toFixed(2)}px, 0)`;
    ring.style.width = `${rw.toFixed(2)}px`;
    ring.style.height = `${rh.toFixed(2)}px`;
    ring.style.borderRadius = `${rr.toFixed(2)}px`;
    const dotScale = look === "free" ? 1 - press * 0.4 : 0;
    dot.style.transform = `translate3d(${(dx - 4).toFixed(2)}px, ${(dy - 4).toFixed(2)}px, 0) scale(${dotScale})`;

    return moving || leaving.size > 0;
  });

  return () => {
    off();
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerover", onOver);
    document.removeEventListener("pointerout", onOut);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("scroll", onScroll, { capture: true });
    window.removeEventListener("resize", onScroll);
    if (magnet) magnet.style.translate = "";
    for (const el of leaving.keys()) el.style.translate = "";
    root.remove();
  };
}
