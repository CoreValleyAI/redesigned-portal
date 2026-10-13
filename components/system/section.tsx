/**
 * Page sections: one idea each, separated by space rather than lines
 * (05 §3). `Section` sets the vertical rhythm and the page column;
 * `SectionHead` is the kicker / headline / lead trio most sections open
 * with, in the Apple pattern: a short declarative line, optionally followed
 * by a grey continuation (04 §5).
 */
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Kicker } from "./kicker";

export function Section({
  children,
  className,
  inner,
  bleed = false,
  tight = false,
  ...props
}: ComponentProps<"section"> & {
  /** Classes for the inner page column. */
  inner?: string;
  /** Full width: no page column. */
  bleed?: boolean;
  /** Half the vertical rhythm. */
  tight?: boolean;
}) {
  return (
    <section
      className={cn(tight ? "py-[calc(var(--section-y)*0.5)]" : "section-y", "relative", className)}
      {...props}
    >
      {bleed ? children : <div className={cn("container-page", inner)}>{children}</div>}
    </section>
  );
}

export function SectionHead({
  kicker,
  title,
  continuation,
  lead,
  align = "start",
  as: As = "h2",
  size = "title-1",
  className,
  id,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  /** The grey second clause of the headline. */
  continuation?: ReactNode;
  lead?: ReactNode;
  align?: "start" | "center";
  as?: "h1" | "h2" | "h3";
  size?: "display-2" | "title-1" | "title-2";
  className?: string;
  id?: string;
}) {
  const sizeClass = { "display-2": "type-display-2", "title-1": "type-title-1", "title-2": "type-title-2" }[size];
  return (
    <header
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {kicker && <Kicker>{kicker}</Kicker>}
      <As id={id} className={cn(sizeClass, "max-w-[21ch]", align === "center" && "mx-auto")} data-reveal>
        {title}
        {continuation && (
          <>
            {" "}
            <span className="text-ink-3">{continuation}</span>
          </>
        )}
      </As>
      {lead && (
        <p
          className={cn("type-lead measure text-ink-2", align === "center" && "mx-auto")}
          data-reveal
          style={{ "--i": 1 } as React.CSSProperties}
        >
          {lead}
        </p>
      )}
    </header>
  );
}
