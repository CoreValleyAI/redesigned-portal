// Server component — the design-system original was already hook-free.
// Ported from design_system/components/terminal/Terminal.jsx; its inline
// <style> keyframes now live in app/globals.css as `animate-cursor`.
//
// The brand's signature surface: hero device, empty states, CLI previews.
// Solid sunken Carbon, as in the original — not glass. A terminal is read,
// and the block cursor is the only thing on it that should glow.
import * as React from "react";
import { cn } from "@/lib/cn";

export type TerminalLine =
  | { prompt?: string; text: string; out?: never; comment?: never }
  | { out: string; prompt?: never; text?: never; comment?: never }
  | { comment: string; prompt?: never; text?: never; out?: never };

export interface TerminalProps extends React.ComponentPropsWithRef<"div"> {
  lines?: TerminalLine[];
  title?: string;
  /** Blinking block cursor on the last command line. */
  cursor?: boolean;
}

export function Terminal({
  lines = [],
  title = "",
  cursor = true,
  className,
  ...rest
}: TerminalProps) {
  return (
    <div
      className={cn(
        "cv-terminal relative overflow-hidden rounded-lg border border-line bg-carbon-800 font-mono shadow-lg",
        className,
      )}
      {...rest}
    >
      {title ? (
        <div className="flex items-center gap-2 border-b border-line-subtle bg-carbon-700 px-3.5 py-2.5">
          {/* Window dots. Terminal.jsx paints them #2A2F38, which has no token;
              ink-700 (#333944) is the nearest step on the Ink scale. */}
          <span className="size-2.25 rounded-pill bg-ink-700" />
          <span className="size-2.25 rounded-pill bg-ink-700" />
          <span className="size-2.25 rounded-pill bg-ink-700" />
          <span className="ml-2 text-xs tracking-[0.02em] text-fg-muted">
            {title}
          </span>
        </div>
      ) : null}

      {/* 13.5px is the design system's value and is not on its type scale.
          overflow-x-auto so a long command scrolls inside the pane instead of
          widening the page — the usual cause of horizontal body scroll. */}
      <div className="overflow-x-auto px-4.5 py-4 text-[13.5px] leading-[1.9]">
        {lines.map((l, i) => {
          const last = i === lines.length - 1;
          if (l.comment !== undefined) {
            return (
              <div key={i} className="text-ink-600">
                # {l.comment}
              </div>
            );
          }
          if (l.out !== undefined) {
            return (
              <div key={i} className="whitespace-pre-wrap text-ink-400">
                {l.out}
              </div>
            );
          }
          return (
            <div key={i} className="whitespace-pre-wrap text-ink-200">
              <span className="mr-2 text-hydro">{l.prompt || "$"}</span>
              {l.text}
              {last && cursor ? (
                <span className="animate-cursor ml-1 inline-block h-4 w-2 -translate-y-px bg-hydro align-[-3px] shadow-[0_0_8px_rgb(var(--hydro-rgb)/0.5)]" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
