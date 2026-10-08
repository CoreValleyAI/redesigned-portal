"use client";

/**
 * Terminal decode: text resolves left to right the way a line lands in a
 * terminal, a block cursor riding the frontier and the next few characters
 * cycling through mono glyphs before they lock. The brand's icon language is
 * the terminal — the prompt, the flags, the block cursor — and this is that
 * language applied to a headline.
 *
 * Layout never shifts. Every character is rendered from the first paint:
 * resolved ones normally, the frontier ones as scrambled glyphs, the rest
 * invisible but still taking their width. The server renders the finished
 * string, so the effect is a progressive enhancement over correct markup.
 *
 * `prefers-reduced-motion` renders the finished text and nothing moves.
 */

import * as React from "react";
import { cn } from "@/lib/cn";

/** The glyphs a character cycles through before it locks. Terminal set. */
const GLYPHS = "01<>/\\|$#_-=+*:;[]{}";

export function DecodeText({
  text,
  delay = 0,
  /** ms per character, measured at the frontier. */
  speed = 34,
  /** Characters still scrambling ahead of the resolved run. */
  spread = 3,
  cursor = false,
  className,
  glyphClassName,
}: {
  text: string;
  delay?: number;
  speed?: number;
  spread?: number;
  /** Leave the block cursor blinking after the line has resolved. */
  cursor?: boolean;
  className?: string;
  glyphClassName?: string;
}) {
  const chars = React.useMemo(() => Array.from(text), [text]);
  /* -1 = not started (server + first client paint show the finished text so
     there is never a flash of missing copy); otherwise the count resolved. */
  const [resolved, setResolved] = React.useState(-1);
  const [scramble, setScramble] = React.useState<string[]>([]);
  const [done, setDone] = React.useState(true);
  /* The cursor rides the frontier only once this segment's own delay has
     elapsed — segments queued one after another must not each show a cursor
     while they wait their turn. */
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let start = 0;
    let last = 0;
    let began = false;
    setDone(false);
    setResolved(0);

    const tick = (now: number) => {
      if (!start) start = now + delay;
      if (now < start) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (!began) {
        began = true;
        setStarted(true);
      }
      const n = Math.min(chars.length, Math.floor((now - start) / speed));
      // Re-roll the scrambled frontier a few times per character, not every
      // frame: at 60fps a per-frame roll reads as noise, not as decoding.
      if (now - last > speed * 0.6) {
        last = now;
        setScramble(
          Array.from({ length: spread }, () => {
            const g = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
            return g;
          }),
        );
      }
      setResolved(n);
      if (n >= chars.length) {
        setDone(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [chars, delay, speed, spread]);

  const showAll = resolved < 0;

  return (
    <span className={cn("whitespace-pre-wrap", className)} aria-label={text}>
      {chars.map((ch, i) => {
        if (showAll || i < resolved) {
          return (
            <span key={i} aria-hidden="true">
              {ch}
            </span>
          );
        }
        const k = i - resolved;
        if (started && k < spread && ch !== " ") {
          return (
            <span
              key={i}
              aria-hidden="true"
              className={cn("font-mono text-hydro", glyphClassName)}
            >
              {scramble[k] ?? ch}
            </span>
          );
        }
        return (
          <span key={i} aria-hidden="true" className="invisible">
            {ch}
          </span>
        );
      })}
      {(cursor && done) || (started && !done) ? (
        <span
          aria-hidden="true"
          className={cn(
            "ml-[0.08em] inline-block h-[0.82em] w-[0.42em] translate-y-[0.06em] bg-hydro align-baseline shadow-glow-sm",
            done ? "animate-cursor" : "",
          )}
        />
      ) : null}
    </span>
  );
}
