"use client";

/**
 * Valley Time (S12): the time in Kathmandu, which keeps its own clock
 * (UTC+05:45). The static page cannot know the visitor's time, so the
 * digits render as a fixed-width placeholder and fill in on the client —
 * no layout shift, and never a wrong time from the build.
 */
import * as React from "react";
import { cn } from "@/lib/cn";
import { UI } from "@/copy/en/site";

const OFFSET_MIN = 5 * 60 + 45;

function nptNow(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const npt = new Date(utc + OFFSET_MIN * 60_000);
  return `${String(npt.getHours()).padStart(2, "0")}:${String(npt.getMinutes()).padStart(2, "0")}`;
}

function subscribe(cb: () => void) {
  let timer = 0;
  const tick = () => {
    cb();
    // Wake at the top of the next minute.
    timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
  };
  timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
  return () => window.clearTimeout(timer);
}

export function ValleyTime({ className }: { className?: string }) {
  const time = React.useSyncExternalStore(subscribe, nptNow, () => "--:--");
  return (
    <p className={cn("flex items-baseline gap-3", className)}>
      <time
        className="type-title-3 tabular font-mono font-medium tracking-[-0.02em] text-ink"
        aria-label={time === "--:--" ? undefined : `${time} in ${UI.valleyTime.place}`}
      >
        {time}
      </time>
      <span className="type-small text-ink-3">
        {UI.valleyTime.place} · {UI.valleyTime.zone} (UTC+05:45)
      </span>
    </p>
  );
}
