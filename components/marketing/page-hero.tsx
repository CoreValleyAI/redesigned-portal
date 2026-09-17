import { Reveal } from "@/components/fx/reveal";

/**
 * Shared hero for interior marketing pages.
 *
 * The ridgeline band is deliberately NOT repeated here. The design system
 * casts it as a footer band, section break or low-opacity backdrop; the
 * footer already carries it on every page, and the home CTA carries it once
 * more. A third impression per page turns a signature device into wallpaper.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-page-xl px-5 pt-20 pb-12 md:px-10 md:pt-28 md:pb-16">
        <Reveal>
          <p className="cv-label">{eyebrow}</p>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="display mt-4 max-w-[19ch] text-[clamp(2.4rem,6vw,4.2rem)]">
            {title}
          </h1>
        </Reveal>
        {lead ? (
          <Reveal delay={120}>
            <p className="mt-6 max-w-[58ch] text-md leading-relaxed text-ink-400">
              {lead}
            </p>
          </Reveal>
        ) : null}
        {children ? <Reveal delay={180}>{children}</Reveal> : null}
      </div>
      <hr className="rule-fade mx-auto max-w-page-xl" />
    </section>
  );
}

/**
 * Section wrapper with the standard rhythm and optional heading block.
 *
 * The top border is a centre-weighted `rule-fade` rather than a full-bleed
 * hairline: an edge-to-edge rule chops a dark page into visible horizontal
 * stripes, which is the fastest way to make a long page look like a stack of
 * unrelated slabs.
 */
export function Section({
  eyebrow,
  title,
  lead,
  alt = false,
  divider = true,
  children,
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  /** Slightly lifted ground, for alternating bands. */
  alt?: boolean;
  divider?: boolean;
  children: React.ReactNode;
}) {
  const hasHeading = Boolean(eyebrow || title || lead);
  return (
    <section className="relative isolate py-20 md:py-28">
      {divider ? (
        <hr className="rule-fade absolute inset-x-0 top-0 mx-auto max-w-page-xl" />
      ) : null}
      {alt ? (
        /* A wash rather than a solid band: a hard-edged `bg-carbon-800`
           stripe draws two seams on Carbon, while a masked Ink gradient lifts
           the middle and dissolves at the edges. */
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(85% 60% at 50% 50%, rgb(232 236 239 / 0.02), transparent 72%)",
          }}
        />
      ) : null}

      <div className="mx-auto max-w-page-xl px-5 md:px-10">
        {hasHeading ? (
          <div className="max-w-[62ch]">
            {eyebrow ? (
              <Reveal>
                <p className="cv-label">{eyebrow}</p>
              </Reveal>
            ) : null}
            {title ? (
              <Reveal delay={60}>
                <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)]">
                  {title}
                </h2>
              </Reveal>
            ) : null}
            {lead ? (
              <Reveal delay={120}>
                <p className="mt-5 leading-relaxed text-ink-400">{lead}</p>
              </Reveal>
            ) : null}
          </div>
        ) : null}
        <div className={hasHeading ? "mt-14" : ""}>{children}</div>
      </div>
    </section>
  );
}
