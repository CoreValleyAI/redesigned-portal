"use client";

/**
 * A number that counts to its value the first time it scrolls into view.
 *
 * Two things make this not-annoying:
 *  · It runs once. Re-counting on every scroll-past is noise.
 *  · The server renders the FINAL value, not zero. Search engines, RSS
 *    readers and anyone without JS see the real figure, and the animation is
 *    a progressive enhancement applied on top of correct markup.
 *
 * The easing is expo-out, so nine tenths of the distance is covered in the
 * first third of the duration — the number lands rather than creeps.
 */

import * as React from "react";
import { cn } from "@/lib/cn";

export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1400,
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const format = (n: number) =>
      `${prefix}${n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;

    let frame = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(2, -10 * t);
          el.textContent = format(value * (t === 1 ? 1 : eased));
          if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, decimals, prefix, suffix, duration]);

  return (
    /* `nums` pins tabular figures — without it every digit swap changes the
       string's width and the whole stat block jitters for a second and a
       half. suppressHydrationWarning because the effect may have already
       overwritten the text by the time React reconciles. */
    <span ref={ref} className={cn("nums", className)} suppressHydrationWarning>
      {prefix}
      {value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
