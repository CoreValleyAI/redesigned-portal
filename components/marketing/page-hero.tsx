import Link from "next/link";
import { Reveal } from "@/components/fx/reveal";
import { cn } from "@/lib/cn";

/**
 * Shared hero for interior marketing pages.
 *
 * The ridgeline band is deliberately NOT repeated here. The design system
 * casts it as a footer band, section break or low-opacity backdrop; the
 * footer already carries it on every page, and the home CTA carries it once
 * more. A third impression per page turns a signature device into wallpaper.
 *
 * The h1 is fluid from a 390px phone (≈2.2rem, two or three lines for a
 * typical title) to desktop (4.2rem), and balanced so a title never leaves
 * one word alone on its last line. `status` is an optional slot above the
 * eyebrow for a <StatusPill>; `children` sits under the lead (CTAs).
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  status,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Optional pill above the eyebrow, e.g. <StatusPill>. */
  status?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-page-xl px-5 pt-14 pb-10 md:px-10 md:pt-28 md:pb-16">
        {status ? (
          <Reveal>
            <div className="mb-6">{status}</div>
          </Reveal>
        ) : null}
        <Reveal>
          <p className="cv-label">{eyebrow}</p>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="display mt-4 max-w-[19ch] text-[clamp(2.15rem,5.2vw+0.9rem,4.2rem)] text-balance">
            {title}
          </h1>
        </Reveal>
        {lead ? (
          <Reveal delay={120}>
            <p className="mt-5 max-w-[58ch] text-md leading-relaxed text-pretty text-ink-400 md:mt-6">
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
 * A status line, set as an editorial kicker: a short static rule and a line
 * of mono caps. "H200 available now", "Coming soon", and so on. Deliberately
 * NOT a pill and NOT a dot — no container, no glow, nothing that blinks; the
 * words carry the status. Pass `href` to make the line a link. (The export
 * keeps its old name so existing imports still resolve.)
 */
export function StatusPill({
  children,
  tone = "live",
  href,
  className,
}: {
  children: React.ReactNode;
  /** live = Hydro rule and text (available now) · soon = neutral (on the way). */
  tone?: "live" | "soon";
  href?: string;
  className?: string;
}) {
  const body = (
    <>
      <span
        aria-hidden="true"
        className={cn("h-px w-8 shrink-0", tone === "live" ? "bg-hydro" : "bg-ink-500")}
      />
      {children}
    </>
  );
  const cls = cn(
    "inline-flex min-h-8 items-center gap-3 font-mono text-[11.5px] tracking-label uppercase",
    tone === "live" ? "text-ink-300" : "text-ink-400",
    href && "transition-colors duration-normal ease-standard hover:text-ink-100",
    className,
  );
  return href ? (
    <Link href={href} className={cls}>
      {body}
    </Link>
  ) : (
    <span className={cls}>{body}</span>
  );
}

/**
 * Section wrapper with the standard rhythm and optional heading block.
 *
 * The top border is a centre-weighted `rule-fade` rather than a full-bleed
 * hairline: an edge-to-edge rule chops a dark page into visible horizontal
 * stripes, which is the fastest way to make a long page look like a stack of
 * unrelated slabs.
 *
 * `id` makes the section an in-page anchor (the sticky header's height is
 * already taken care of by `scroll-padding-top` on <html>).
 */
export function Section({
  id,
  eyebrow,
  title,
  lead,
  alt = false,
  divider = true,
  children,
}: {
  id?: string;
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
    <section id={id} className="relative isolate py-16 md:py-28">
      {divider ? (
        <hr className="rule-fade absolute inset-x-0 top-0 mx-auto max-w-page-xl" />
      ) : null}
      {alt ? (
        /* A wash rather than a solid band: a hard-edged `bg-carbon-800`
           stripe draws two seams on Carbon, while a masked Ink gradient lifts
           the middle and dissolves at the edges. */
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(85%_60%_at_50%_50%,rgb(var(--ink-rgb)/0.02),transparent_72%)]"
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
                <h2 className="display mt-4 text-[clamp(1.9rem,3.6vw,2.9rem)] text-balance">
                  {title}
                </h2>
              </Reveal>
            ) : null}
            {lead ? (
              <Reveal delay={120}>
                <p className="mt-5 leading-relaxed text-pretty text-ink-400">{lead}</p>
              </Reveal>
            ) : null}
          </div>
        ) : null}
        <div className={hasHeading ? "mt-10 md:mt-14" : ""}>{children}</div>
      </div>
    </section>
  );
}
