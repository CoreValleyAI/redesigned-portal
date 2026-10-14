"use client";

/**
 * /platform: "The Iceberg" (brought back from the preview site). A
 * scroll-driven dive through a point-cloud iceberg: the GPU on the tip, the
 * waterline, one lit stratum per platform layer, then the whole berg with
 * every layer pinned.
 *
 * Every caption is ordinary HTML here, so the page reads (and indexes)
 * without WebGL; iceberg-engine.ts only moves them, and is loaded on mount
 * with a dynamic import. Without WebGL2 the captions fall back to a plain
 * stacked page.
 */

import * as React from "react";
import { ButtonLink } from "@/components/system/button";
import { Status } from "@/components/system/status";
import { DIVE_STEPS, PLATFORM } from "@/copy/en/platform";
import { cn } from "@/lib/cn";

const D = PLATFORM.dive;
const pad = (n: number) => String(n).padStart(2, "0");
const NB = D.layers.length;

const GAUGE = [
  { s: 1, t: D.gauge.gpu },
  { s: 2, t: D.gauge.waterline },
  ...D.layers.map((l, i) => ({ s: i + 3, t: l.title })),
  { s: DIVE_STEPS, t: D.gauge.whole },
];

function hasWebGL2() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export function IcebergDive() {
  const root = React.useRef<HTMLDivElement>(null);
  const [noGl, setNoGl] = React.useState(false);

  React.useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!hasWebGL2()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- capability probe, once on mount
      setNoGl(true);
      return;
    }
    const q = <T extends Element>(s: string) => el.querySelector<T>(s)!;

    /* End the scene where the dive ends from the first frame. The engine
       keeps --ib-out in step once it runs, but it takes a moment to load,
       and a visitor can land (or reload) below the dive. */
    const stage = q<HTMLElement>(".ib-stage");
    const track = q<HTMLElement>(".ib-track");
    const syncOut = () => {
      const r = track.getBoundingClientRect();
      const out = Math.min(1, Math.max(0, (window.innerHeight - r.bottom) / window.innerHeight));
      stage.style.setProperty("--ib-out", out.toFixed(3));
    };
    syncOut();
    window.addEventListener("scroll", syncOut, { passive: true });
    window.addEventListener("resize", syncOut);

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import("./iceberg-engine")
      .then(({ startIceberg }) => {
        if (cancelled) return;
        cleanup = startIceberg(q<HTMLCanvasElement>(".ib-gl"), {
          layers: D.layers.map((l) => l.title),
          surface: D.gauge.surface,
          els: {
            track,
            stage,
            sky: q(".ib-sky"),
            caps: Array.from(el.querySelectorAll<HTMLElement>(".ib-cap")),
            pins: q(".ib-pins"),
            leader: q<SVGElement>(".ib-leader g"),
            leaderPath: q<SVGPathElement>(".ib-leader__path"),
            leaderHalo: q<SVGPathElement>(".ib-leader__halo"),
            leaderDot: q<SVGCircleElement>(".ib-leader circle"),
            gaugeFill: q(".ib-gauge__fill"),
            gaugeNow: q(".ib-gauge__now"),
            gaugeRead: q(".ib-gauge__read"),
            gaugeButtons: Array.from(el.querySelectorAll<HTMLButtonElement>(".ib-gauge button")),
          },
        });
      })
      .catch((err: unknown) => {
        if (process.env.NODE_ENV !== "production") console.error("[iceberg] failed to start", err);
        if (!cancelled) setNoGl(true);
      });
    return () => {
      cancelled = true;
      window.removeEventListener("scroll", syncOut);
      window.removeEventListener("resize", syncOut);
      cleanup?.();
    };
  }, []);

  return (
    <div ref={root} className={cn("ib", noGl && "ib--nogl")}>
      <div className="ib-stage">
        <div className="ib-sky" aria-hidden="true" />
        <canvas className="ib-gl" aria-hidden="true" />
        <svg className="ib-leader" aria-hidden="true">
          <g>
            <path className="ib-leader__halo" d="" />
            <path className="ib-leader__path" d="" />
            <circle r="3" />
          </g>
        </svg>
        <div className="ib-pins" aria-hidden="true" />

        <div className="ib-caps">
          <section className="ib-cap ib-cap--intro is-live" style={{ opacity: 1 }}>
            <Status className="ib-status" />
            <p className="ib-cap__eyebrow">{D.intro.kicker}</p>
            <h1 className="ib-cap__title">
              {D.intro.title} <em>{D.intro.lit}</em>
            </h1>
            <p className="ib-cap__body">{D.intro.body}</p>
            <p className="ib-cue" aria-hidden="true">
              <i />
              {D.intro.cue}
            </p>
          </section>

          <section className="ib-cap">
            <p className="ib-cap__eyebrow">{D.gpu.kicker}</p>
            <h2 className="ib-cap__title">{D.gpu.title}</h2>
            <p className="ib-cap__body">{D.gpu.body}</p>
            <p className="ib-cap__tags">{D.gpu.tags}</p>
          </section>

          <section className="ib-cap">
            <p className="ib-cap__eyebrow">{D.waterline.kicker}</p>
            <h2 className="ib-cap__title">
              {D.waterline.title} <em>{D.waterline.lit}</em>
            </h2>
            <p className="ib-cap__body">{D.waterline.body}</p>
          </section>

          {D.layers.map((l, i) => (
            <section key={l.title} className="ib-cap">
              <span className="ib-cap__num" aria-hidden="true">
                {pad(i + 1)}
              </span>
              <p className="ib-cap__eyebrow">
                Layer {pad(i + 1)} / {pad(NB)}
              </p>
              <h2 className="ib-cap__title">{l.title}.</h2>
              <p className="ib-cap__body">{l.body}</p>
              <p className="ib-cap__tags">{l.tags}</p>
            </section>
          ))}

          <section className="ib-cap">
            <p className="ib-cap__eyebrow">{D.whole.kicker}</p>
            <h2 className="ib-cap__title">
              {D.whole.title} <em>{D.whole.lit}</em>
            </h2>
            <p className="ib-cap__body">{D.whole.body}</p>
            <div className="ib-ctas">
              <ButtonLink href={D.whole.primary.href} size="lg" arrow>
                {D.whole.primary.label}
              </ButtonLink>
              <ButtonLink href={D.whole.secondary.href} size="lg" variant="secondary">
                {D.whole.secondary.label}
              </ButtonLink>
            </div>
          </section>
        </div>

        <nav className="ib-gauge" aria-label="Platform layers">
          <div className="ib-gauge__rail" />
          <div className="ib-gauge__fill" />
          <div className="ib-gauge__now" />
          <div className="ib-gauge__read" aria-hidden="true">
            {D.gauge.surface}
          </div>
          <ol>
            {GAUGE.map((g) => (
              <li key={g.s} style={{ top: `${(g.s / DIVE_STEPS) * 100}%` }}>
                <button type="button" data-s={g.s}>
                  {g.t}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
      <div className="ib-track" aria-hidden="true" />
    </div>
  );
}
