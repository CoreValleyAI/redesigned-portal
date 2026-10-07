import { AVAILABLE_GPUS, FACTS } from "@/lib/availability";

/**
 * A continuous strip of fleet and platform facts, running between the hero
 * and the first section.
 *
 * WHY A TICKER AND NOT A LOGO WALL
 * The usual thing here is a row of grey customer logos. CoreValley is early
 * enough that the honest version of that row would be short, and a padded one
 * would be a lie. Facts are what this audience actually reads, and these are
 * true: the live GPU line comes from the catalogue (only what is available
 * today), the rest from lib/availability.ts.
 *
 * The loop is CSS-only: the list is rendered twice and the track is
 * translated by exactly -50%, which is the only construction that repeats
 * without a visible seam at an arbitrary viewport width. A server component,
 * so none of it reaches the client bundle.
 *
 * Hover pauses it (see .marquee in app/glass.css) and reduced motion stops it
 * outright, because a permanently moving element is the accessibility problem
 * that rule exists for.
 */

const PLATFORM_FACTS = [
  "available now: h200",
  `${FACTS.latency} in kathmandu`,
  "per-second billing",
  "gpu slices from 18 gb",
  "a private network per customer",
  "openai-compatible api",
  "invoices in npr",
  "hydro-powered datacenter",
  "append-only audit log",
  "h100 + blackwell coming soon",
];

export function SpecTicker() {
  const items = [
    ...AVAILABLE_GPUS.map(
      (s) => `${s.name} · ${s.memoryGb} GB ${s.memoryType} · ${s.bandwidth}`,
    ),
    ...PLATFORM_FACTS,
  ];

  return (
    <section
      aria-label="CoreValley at a glance"
      className="relative overflow-hidden border-y border-line-subtle py-5 md:py-6"
    >
      <div className="edge-fade">
        <div className="marquee gap-0" style={{ "--marquee-duration": "62s" } as React.CSSProperties}>
          {/* Two identical passes. The second is aria-hidden so a screen
              reader is not read the same facts twice. */}
          {[0, 1].map((pass) => (
            <ul
              key={pass}
              className="flex shrink-0 items-center"
              aria-hidden={pass === 1 ? "true" : undefined}
            >
              {items.map((item) => (
                <li
                  key={item}
                  className="flex shrink-0 items-center gap-6 px-6 font-mono text-[11.5px] tracking-wide whitespace-nowrap text-ink-400"
                >
                  {item}
                  {/* A diamond rather than a bullet or a slash: a small,
                      non-typographic mark reads as a system separator instead
                      of as punctuation someone forgot to style. */}
                  <span
                    aria-hidden="true"
                    className="size-1 rotate-45 bg-ink-700"
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
