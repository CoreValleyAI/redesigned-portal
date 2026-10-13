/**
 * Chapter 1 — Valley Online (S1). The headline is server-rendered and
 * painted on the first frame; everything behind it is an enhancement:
 * the CSS dot-valley first, the WebGL valley when it is ready.
 */
import { Fragment } from "react";
import { ButtonLink } from "@/components/system/button";
import { Decode } from "@/components/motion/decode";
import { WordRise } from "@/components/motion/word-rise";
import { HOME } from "@/copy/en/home";
import { cn } from "@/lib/cn";
import { HeroValley } from "./hero-valley";

export function Hero() {
  const h = HOME.hero;
  return (
    <section id="hero" aria-labelledby="hero-title" className="group/hero relative isolate overflow-clip">
      <HeroValley />

      <div className="container-page relative flex min-h-[100svh] flex-col items-center justify-center pt-[calc(var(--header-h)+2rem)] pb-[clamp(9rem,22vh,14rem)] text-center">
        <p className="type-kicker flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-ink-2">
          {h.kicker.map((k, i) => (
            <Fragment key={k}>
              {i > 0 && (
                <span aria-hidden="true" className="text-ink-4">
                  ·
                </span>
              )}
              <Decode text={k.toUpperCase()} delay={150 + i * 220} />
            </Fragment>
          ))}
        </p>

        <h1 id="hero-title" className="type-display-1 mt-7 max-w-[13ch] md:mt-9 md:max-w-none">
          <WordRise text={h.title.line1} delay={120} />
          <br className="hidden sm:block" /> <WordRise text={h.title.line2} start={3} delay={120} />{" "}
          <span className="rise__w rise__w--open">
            <span className="rise__t online" style={{ "--i": 4, "--rise-delay": "120ms" } as React.CSSProperties}>
              {h.title.lit}
            </span>
          </span>
        </h1>

        <p
          className="type-lead mt-7 max-w-[36rem] text-ink-2 md:mt-9"
          style={{ animation: "cv-fade-in 900ms var(--ease-out) 650ms both" }}
        >
          {h.lead}
        </p>

        <div
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
          style={{ animation: "cv-fade-in 900ms var(--ease-out) 800ms both" }}
        >
          <ButtonLink href={h.primary.href} size="lg" magnetic>
            {h.primary.label}
          </ButtonLink>
          <ButtonLink href={h.secondary.href} variant="secondary" size="lg">
            {h.secondary.label}
          </ButtonLink>
        </div>
      </div>

      {/* The facts, on a pane of liquid glass: drawn by the valley itself
          once it is running (lib/gl/glass.ts), CSS glass until then. */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pb-[clamp(1rem,3.5vh,2.25rem)]"
        style={{ animation: "cv-fade-in 1100ms var(--ease-out) 1000ms both" }}
      >
        <div className="container-page">
          <ul aria-label="In short" data-glass-panel className="lg grid grid-cols-3 rounded-panel">
            {h.facts.map((f, i) => (
              <li
                key={f.value}
                className={cn(
                  "flex min-w-0 flex-col gap-0.5 px-3.5 py-3.5 sm:px-6 sm:py-5 md:px-8",
                  i > 0 && "border-l border-ink/10",
                )}
              >
                <span className="text-[0.875rem] leading-snug font-semibold text-ink sm:text-[1rem] md:text-[1.0625rem]">
                  {f.value}
                </span>
                <span className="type-caption leading-snug text-ink-2">{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
