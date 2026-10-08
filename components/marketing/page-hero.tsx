import Link from "next/link";
import { Reveal } from "@/components/fx/reveal";
import { cn } from "@/lib/cn";

/**
 * Shared hero for interior marketing pages: a dark, grained 2.5rem slab with
 * the copy set low, under the floating nav.
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
    <section className="shell">
      <div className="cv-dark surface-dark grain flex min-h-[64vh] flex-col justify-end px-6 pt-36 pb-12 md:min-h-[68vh] md:px-14 md:pt-44 md:pb-16">
        <div className="max-w-[64rem]">
          {status ? (
            <Reveal>
              <div className="mb-6">{status}</div>
            </Reveal>
          ) : null}
          <Reveal>
            <p className="label">{eyebrow}</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="display mt-5 max-w-[18ch] text-[clamp(2.5rem,6vw,5.25rem)] text-balance text-white">
              {title}
            </h1>
          </Reveal>
          {lead ? (
            <Reveal delay={160}>
              <p className="mt-6 max-w-[56ch] text-[clamp(1rem,1.3vw,1.175rem)] leading-relaxed font-light text-pretty text-white/60">
                {lead}
              </p>
            </Reveal>
          ) : null}
          {children ? <Reveal delay={240}>{children}</Reveal> : null}
        </div>
      </div>
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
        className={cn(
          "h-px w-8 shrink-0",
          tone === "live" ? "bg-hydro" : "bg-ink-500",
        )}
      />
      {children}
    </>
  );
  const cls = cn(
    "inline-flex min-h-8 items-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase",
    tone === "live" ? "text-ink-300" : "text-ink-400",
    href && "transition-colors duration-300 hover:text-ink-100",
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
 * Light sections sit straight on the zinc page. `alt` sections become dark
 * 2.5rem slabs (zinc-900 gradient, grain, grid lineart), so a long page
 * alternates light and dark the way the home page does.
 *
 * `id` makes the section an in-page anchor.
 */
export function Section({
  id,
  eyebrow,
  title,
  lead,
  alt = false,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  /** A dark slab instead of the light page, for alternating bands. */
  alt?: boolean;
  /** Kept for API compatibility; the redesign draws no section rules. */
  divider?: boolean;
  children: React.ReactNode;
}) {
  const hasHeading = Boolean(eyebrow || title || lead);
  const body = (
    <div className="px-6 md:px-14">
      {hasHeading ? (
        <div className="max-w-[62ch]">
          {eyebrow ? (
            <Reveal>
              <p className="cv-label">{eyebrow}</p>
            </Reveal>
          ) : null}
          {title ? (
            <Reveal delay={60}>
              <h2 className="display mt-4 text-[clamp(2.25rem,4vw,3.25rem)] text-balance">
                {title}
              </h2>
            </Reveal>
          ) : null}
          {lead ? (
            <Reveal delay={120}>
              <p className="mt-5 text-[1.0625rem] leading-relaxed font-light text-pretty text-ink-500">
                {lead}
              </p>
            </Reveal>
          ) : null}
        </div>
      ) : null}
      <div className={hasHeading ? "mt-10 md:mt-14" : ""}>{children}</div>
    </div>
  );

  if (alt) {
    return (
      <section id={id} className="shell relative my-3 scroll-mt-24">
        <div className="cv-dark surface-zinc grain py-20 md:py-28">
          <div
            aria-hidden="true"
            className="lineart pointer-events-none absolute inset-0 -z-10"
          />
          {body}
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="shell relative isolate py-16 md:py-24">
      {body}
    </section>
  );
}
