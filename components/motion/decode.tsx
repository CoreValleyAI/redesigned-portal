"use client";

/**
 * Decode — text resolves left to right the way a line lands in a terminal:
 * the next few characters cycle through mono glyphs before they lock
 * (06 §4). The server renders the finished text, every character keeps its
 * width throughout (no layout shift), and the effect writes straight to the
 * DOM — no React state per frame. Reduced motion shows the final text.
 */
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

const GLYPHS = "0123456789ABCDEF·/<>_";

export function Decode({
  text,
  delay = 0,
  /** Milliseconds per character at the resolving edge. */
  speed = 22,
  /** Characters scrambling ahead of the resolved run. */
  spread = 4,
  className,
}: {
  text: string;
  delay?: number;
  speed?: number;
  spread?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || document.documentElement.dataset.motion === "reduce") return;
    const chars = Array.from(text);
    let raf = 0;
    let start = 0;
    let lastRoll = 0;
    let scramble: string[] = [];

    const render = (resolved: number) => {
      let out = "";
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i]!;
        if (i < resolved || c === " ") out += c;
        else if (i < resolved + spread) out += scramble[i - resolved] ?? c;
        else out += " ";
      }
      el.textContent = out;
    };

    const tick = (now: number) => {
      if (!start) start = now + delay;
      if (now < start) {
        render(0);
        raf = requestAnimationFrame(tick);
        return;
      }
      const resolved = Math.min(chars.length, Math.floor((now - start) / speed));
      if (now - lastRoll > speed * 1.5) {
        lastRoll = now;
        scramble = Array.from({ length: spread }, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]!);
      }
      render(resolved);
      if (resolved < chars.length) raf = requestAnimationFrame(tick);
      else el.textContent = text;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [text, delay, speed, spread]);

  return (
    <span className={cn("relative inline-block whitespace-pre", className)}>
      {/* Assistive tech reads the plain text once; the visible copies are a
          hidden one that holds the width and the animated one on top. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="invisible">
        {text}
      </span>
      <span ref={ref} aria-hidden="true" className="absolute inset-0">
        {text}
      </span>
    </span>
  );
}
