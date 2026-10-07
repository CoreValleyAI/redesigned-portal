"use client";

/**
 * /platform: "The Iceberg". A scroll-driven dive through a 3D point-cloud
 * iceberg: the GPU on the tip, the waterline, nine lit strata of the platform
 * underneath, then the whole berg with every layer pinned.
 *
 * Every caption is rendered here as ordinary HTML, so the page reads (and
 * indexes) without WebGL; iceberg-engine.ts only moves them. Three.js is
 * loaded on mount with a dynamic import, so no other page pays for it.
 * Without WebGL the captions fall back to a plain stacked page.
 *
 * IcebergPreview is the same scene in a card, for the homepage teaser.
 */

import * as React from "react";
import { ButtonLink, Icon } from "@/components/ui";
import { DIVE_STEPS, PLATFORM_LAYERS } from "@/lib/platform-layers";
import { EARLY_ACCESS } from "@/lib/availability";
import { cn } from "@/lib/cn";

const pad = (n: number) => String(n).padStart(2, "0");
const NB = PLATFORM_LAYERS.length;

const GAUGE = [
  { s: 1, t: "The GPU" },
  { s: 2, t: "Waterline" },
  ...PLATFORM_LAYERS.map((l, i) => ({ s: i + 3, t: l.title })),
  { s: DIVE_STEPS, t: "Whole iceberg" },
];

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
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
    if (!hasWebGL()) {
      setNoGl(true);
      return;
    }
    const q = <T extends Element>(s: string) => el.querySelector<T>(s)!;

    /* End the scene where the page ends from the first frame. The engine
       keeps --ib-out in step once it runs, but three.js takes a moment to
       load, and a visitor can land (or reload) at the foot of the page: the
       stage must not show through the footer's glass in the meantime. */
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
          mode: "dive",
          els: {
            track: q(".ib-track"),
            stage: q(".ib-stage"),
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
      .catch(() => {
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
            <p className="ib-status">
              {EARLY_ACCESS.pill} · enterprise early access
            </p>
            <p className="ib-cap__eyebrow">The platform under the GPU</p>
            <h1 className="ib-cap__title">
              You rent the GPU.<em>We run the rest.</em>
            </h1>
            <p className="ib-cap__body">
              You bring the model and the data. We run the network, storage,
              power, security and billing under the card, all in Kathmandu.
            </p>
            <p className="ib-cue">
              <i />
              Scroll to dive
            </p>
          </section>

          <section className="ib-cap">
            <p className="ib-cap__eyebrow">What you see</p>
            <h2 className="ib-cap__title">The GPU.</h2>
            <p className="ib-cap__body">
              An NVIDIA H200 with 141 GB of memory, available now and billed
              by the second in rupees. It&apos;s the part everyone compares,
              and the smallest part of the job.
            </p>
            <p className="ib-cap__tags">h200 · available now — h100 · rtx pro 6000 · coming soon</p>
          </section>

          <section className="ib-cap">
            <p className="ib-cap__eyebrow">Below the waterline</p>
            <h2 className="ib-cap__title">
              Nine layers you <em>never operate.</em>
            </h2>
            <p className="ib-cap__body">
              Everything that turns a card into a service you can count on.
              Keep scrolling, one layer at a time.
            </p>
          </section>

          {PLATFORM_LAYERS.map((l, i) => (
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
            <p className="ib-cap__eyebrow">The whole iceberg</p>
            <h2 className="ib-cap__title">
              All of it, <em>in Nepal.</em>
            </h2>
            <p className="ib-cap__body">
              We run all nine layers in Kathmandu, so you only think about
              your model. H200s are available now through enterprise early
              access.
            </p>
            <div className="ib-ctas">
              <ButtonLink
                href="/contact"
                size="lg"
                iconRight={<Icon name="arrow-right" size={17} />}
              >
                Get early access
              </ButtonLink>
              <ButtonLink href="/pricing" size="lg" variant="secondary">
                How billing works
              </ButtonLink>
            </div>
            <p className="ib-promise">{EARLY_ACCESS.promise}</p>
          </section>
        </div>

        <nav className="ib-gauge" aria-label="Platform layers">
          <div className="ib-gauge__rail" />
          <div className="ib-gauge__fill" />
          <div className="ib-gauge__now" />
          <div className="ib-gauge__read" aria-hidden="true">
            surface
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

/**
 * The same scene in a card: slowly turning, a scan lighting the strata.
 *
 * `hint` adds the interaction hint in the card's corner, worded for the
 * visitor's input: a mouse can drag the berg and click a ping; a finger can
 * only tap (dragging on a phone scrolls the page, as it should).
 */
export function IcebergPreview({
  className,
  hint = false,
}: {
  className?: string;
  hint?: boolean;
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !hasWebGL()) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import("./iceberg-engine")
      .then(({ startIceberg }) => {
        if (!cancelled) cleanup = startIceberg(canvas, { mode: "preview" });
      })
      .catch((err: unknown) => {
        // The card simply stays empty in production; in development, say why.
        if (process.env.NODE_ENV !== "production") console.error("[iceberg] preview failed to start", err);
      });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <>
      <canvas ref={ref} className={cn("ib-gl ib-gl--preview", className)} aria-hidden="true" />
      {hint ? (
        <p className="ib-hint" aria-hidden="true">
          <span className="ib-hint__fine">drag to turn · click to ping</span>
          <span className="ib-hint__coarse">tap to send a ping</span>
        </p>
      ) : null}
    </>
  );
}
