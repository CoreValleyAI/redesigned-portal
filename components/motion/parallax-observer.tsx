"use client";

/**
 * Scroll parallax for [data-parallax] elements (06 §3): each drifts against
 * the scroll by its factor (data-parallax="0.06" moves it 6 % of its
 * distance from the middle of the viewport), so pictures and text slide at
 * slightly different speeds and the page reads in depth — on a phone as
 * much as with a mouse, since it follows the scroll itself.
 *
 * It writes the `translate` property only, so it composes with the reveal
 * (which animates `transform`) and stays on the compositor. Geometry is
 * measured on resize, not per frame; only elements near the viewport are
 * moved, and they ease toward their place on the site spring rather than
 * snapping with each wheel step. With reduced motion, nothing moves.
 */
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { onFrame, wake } from "@/lib/motion/clock";
import { damp } from "@/lib/motion/spring";

interface Item {
  el: HTMLElement;
  factor: number;
  top: number;
  height: number;
  value: number;
  near: boolean;
}

export function ParallaxObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.motion === "reduce") return;
    const items: Item[] = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]")).map((el) => ({
      el,
      factor: parseFloat(el.dataset.parallax || "0.05") || 0.05,
      top: 0,
      height: 0,
      value: 0,
      near: false,
    }));
    if (!items.length) return;

    let vh = window.innerHeight;
    const measure = () => {
      vh = window.innerHeight;
      const y = window.scrollY;
      for (const it of items) {
        // The element's own translate is excluded from its measured place.
        const r = it.el.getBoundingClientRect();
        it.top = r.top + y - it.value;
        it.height = r.height;
      }
      wake();
    };
    measure();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const it = items.find((x) => x.el === e.target);
          if (it) it.near = e.isIntersecting;
        }
        wake();
      },
      { rootMargin: "25% 0px" },
    );
    for (const it of items) io.observe(it.el);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    const onScroll = () => wake();
    window.addEventListener("scroll", onScroll, { passive: true });

    const off = onFrame((_, dt) => {
      const mid = window.scrollY + vh / 2;
      let moving = false;
      for (const it of items) {
        if (!it.near) continue;
        const target = -(it.top + it.height / 2 - mid) * it.factor;
        const next = damp(it.value, target, 0.07, dt);
        if (Math.abs(next - target) > 0.05) moving = true;
        if (Math.abs(next - it.value) > 0.01) {
          it.value = next;
          it.el.style.translate = `0 ${next.toFixed(2)}px`;
        }
      }
      return moving;
    });

    return () => {
      off();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      for (const it of items) it.el.style.translate = "";
    };
  }, [pathname]);
  return null;
}
