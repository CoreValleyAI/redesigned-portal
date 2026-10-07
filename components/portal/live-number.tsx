"use client";

/**
 * A number that glides to each new value instead of snapping — for figures
 * that change while you watch (a price estimate, live telemetry). Unlike
 * CountUp it never starts from zero: the first render is the real value, and
 * only later changes animate. Reduced motion snaps.
 */
import * as React from "react";
import { cn } from "@/lib/cn";

export function LiveNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 650,
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
  const shown = React.useRef(value);

  const format = React.useCallback(
    (n: number) =>
      `${prefix}${n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`,
    [prefix, suffix, decimals],
  );

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = shown.current;
    if (from === value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shown.current = value;
      el.textContent = format(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const k = 1 - Math.pow(1 - t, 3);
      shown.current = from + (value - from) * k;
      el.textContent = format(t === 1 ? value : shown.current);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, format]);

  return (
    <span ref={ref} className={cn("nums", className)} suppressHydrationWarning>
      {format(value)}
    </span>
  );
}
