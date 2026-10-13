/**
 * The one call to action a page ends with (03 §5: never two stacked). A
 * quiet closing statement, not a banner: headline, a line, one primary
 * button and at most one text link.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ButtonLink } from "./button";
import { TextLink } from "./text-link";

export function Cta({
  title,
  continuation,
  lead,
  action,
  secondary,
  className,
}: {
  title: ReactNode;
  continuation?: ReactNode;
  lead?: ReactNode;
  action: { href: string; label: string };
  secondary?: { href: string; label: string };
  className?: string;
}) {
  return (
    <section aria-label="Next step" className={cn("section-y", className)}>
      <div className="container-page">
        <div className="flex flex-col items-start gap-8 border-t border-line pt-12 md:flex-row md:items-end md:justify-between md:pt-16">
          <div className="flex max-w-[40rem] flex-col gap-4">
            <h2 className="type-title-1" data-reveal>
              {title}
              {continuation && (
                <>
                  {" "}
                  <span className="text-ink-3">{continuation}</span>
                </>
              )}
            </h2>
            {lead && (
              <p className="type-lead text-ink-2" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
                {lead}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-6">
            {secondary && (
              <TextLink href={secondary.href} arrow>
                {secondary.label}
              </TextLink>
            )}
            <ButtonLink href={action.href} size="lg" magnetic>
              {action.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
