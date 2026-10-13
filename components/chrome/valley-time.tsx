"use client";

/**
 * Valley Time (S12): the time in Kathmandu, which keeps its own clock
 * (UTC+05:45), on a small dot-matrix face whose colon blinks the seconds.
 * The static page cannot know the visitor's time, so the face renders
 * blank and fills in on the client: no layout shift, and never a wrong
 * time from the build.
 */
import * as React from "react";
import { DotText } from "@/components/system/dot-text";
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
    <p className={cn("flex items-center gap-3.5", className)}>
      <time className="flex">
        {time !== "--:--" && <span className="sr-only">{time}</span>}
        <DotText
          text={time}
          className="h-7 w-auto"
          litClassName="text-hydro-ink light:text-hydro"
          charClassName={(c) => (c === ":" ? "dt-blink" : undefined)}
        />
      </time>
      <span className="type-small text-ink-3">
        {UI.valleyTime.place} · {UI.valleyTime.zone} (UTC+05:45)
      </span>
    </p>
  );
}
