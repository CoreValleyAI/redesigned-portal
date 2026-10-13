/**
 * Text links. The underline draws in from the left on hover and retracts to
 * the right on leave (06 §9). `inline` links inside running text keep a
 * faint underline at rest so they never rely on colour alone.
 */
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { isExternal } from "@/lib/links";
import { MAIN_URL, siteHref } from "@/lib/site";
import { Arrow } from "./button";

const draw =
  "bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-[length:0%_1px] bg-[position:100%_100%] " +
  "transition-[background-size,color] duration-[var(--dur-base)] ease-out " +
  "hover:bg-[length:100%_1px] hover:bg-[position:0%_100%] focus-visible:bg-[length:100%_1px]";

export function TextLink({
  href,
  children,
  className,
  inline = false,
  arrow = false,
  transitionTypes,
  ...props
}: Omit<ComponentProps<"a">, "href"> & {
  href: string;
  children: ReactNode;
  /** Inside running text: underlined at rest. */
  inline?: boolean;
  /** Show → (or ↗ for external links). */
  arrow?: boolean;
  transitionTypes?: string[];
}) {
  /* In the docs build, marketing paths become absolute links to the site;
     those are not "another site", so they get no ↗. */
  const resolved = href.startsWith("/") ? siteHref(href) : href;
  const external = isExternal(resolved) && !resolved.startsWith(MAIN_URL);
  const plain = isExternal(resolved);
  const cls = cn(
    "group/btn inline-flex items-baseline gap-1 rounded-[2px] pb-px",
    inline
      ? "inline text-ink underline decoration-line-strong decoration-1 underline-offset-[0.2em] transition-[text-decoration-color] duration-[var(--dur-short)] hover:decoration-hydro"
      : cn("font-medium text-ink", draw),
    className,
  );
  const body = (
    <>
      {children}
      {(arrow || (external && !inline)) && <Arrow external={external} className="translate-y-[0.1em]" />}
    </>
  );
  if (plain) {
    return (
      <a href={resolved} className={cls} {...props}>
        {body}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} transitionTypes={transitionTypes ?? ["page"]} {...props}>
      {body}
    </Link>
  );
}
