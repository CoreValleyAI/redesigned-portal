/**
 * Interior page hero and titled section — the plain, editorial opening most
 * pages without a signature visual use (careers, blog, legal): a kicker, a
 * display headline, a lead and optional actions, set under the floating
 * header. Signature pages (home, hardware, infrastructure…) build their own.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Kicker } from "./kicker";

export function PageHero({
  eyebrow,
  title,
  lead,
  status,
  children,
  aside,
  className,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  status?: ReactNode;
  /** Actions or meta under the lead. */
  children?: ReactNode;
  /** A visual beside the copy on wide screens. */
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("relative pt-[calc(var(--header-h)+clamp(3.5rem,9vw,8rem))] pb-[clamp(3rem,7vw,6rem)]", className)}
    >
      <div className={cn("container-page", aside && "grid items-end gap-12 lg:grid-cols-[1.4fr_1fr]")}>
        <div className="flex max-w-[60rem] flex-col gap-6">
          {status}
          <Kicker>{eyebrow}</Kicker>
          <h1 className="type-display-2 max-w-[16ch]">{title}</h1>
          {lead && <p className="type-lead measure text-ink-2">{lead}</p>}
          {children && <div className="mt-2">{children}</div>}
        </div>
        {aside && <div className="hidden lg:block">{aside}</div>}
      </div>
    </section>
  );
}

export function TitledSection({
  id,
  eyebrow,
  title,
  lead,
  children,
  className,
}: {
  id?: string;
  eyebrow?: ReactNode;
  title?: ReactNode;
  lead?: ReactNode;
  /** Accepted for compatibility; the site has no alternating bands. */
  alt?: boolean;
  divider?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const head = Boolean(eyebrow || title || lead);
  return (
    <section id={id} className={cn("section-y relative scroll-mt-24", className)}>
      <div className="container-page">
        {head && (
          <header className="mb-10 flex max-w-[44rem] flex-col gap-4 md:mb-14">
            {eyebrow && <Kicker>{eyebrow}</Kicker>}
            {title && (
              <h2 className="type-title-1" data-reveal>
                {title}
              </h2>
            )}
            {lead && (
              <p className="type-lead text-ink-2" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
                {lead}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
