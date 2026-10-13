/**
 * Buttons (05 §7). One primary action per view, in hydro; everything else
 * is secondary (outlined) or quiet (ghost).
 *
 * Press feedback is CSS only: the button sinks to 0.97 on pointer-down and
 * springs back on release, from wherever it is mid-press. Fine pointers get
 * a slight magnetic pull from components/motion/pointer-fx.tsx, which looks
 * for [data-magnetic].
 *
 * <ButtonLink> is the same look on a link. Internal links go through
 * next/link (base path, prefetch, view transitions); external ones get ↗.
 */
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { isExternal } from "@/lib/links";
import { MAIN_URL, siteHref } from "@/lib/site";

type Variant = "primary" | "secondary" | "ghost" | "inverse";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-pill font-medium " +
  "transition-[transform,background-color,color,border-color,box-shadow] duration-[var(--dur-spring-snappy)] ease-spring " +
  "active:scale-[0.97] active:duration-75 disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hydro";

const variants: Record<Variant, string> = {
  primary: "bg-hydro text-on-hydro hover:bg-hydro-ink",
  secondary: "border border-line-strong/70 bg-transparent text-ink hover:border-ink hover:bg-bg-sunken",
  ghost: "text-ink-2 hover:bg-bg-sunken hover:text-ink",
  inverse: "bg-ink text-bg hover:bg-ink-2",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.875rem] tracking-[-0.006em]",
  md: "h-11 px-5 text-[0.9375rem] tracking-[-0.01em]",
  lg: "h-13 px-7 text-[1.0625rem] tracking-[-0.012em]",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

/** The arrow that leads a call to action; it nudges forward on hover. */
export function Arrow({ external = false, className }: { external?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn(
        "size-[0.95em] shrink-0 transition-transform duration-[var(--dur-spring-snappy)] ease-spring",
        external
          ? "group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
          : "group-hover/btn:translate-x-0.5",
        className,
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {external ? <path d="M5 11 11 5M6 5h5v5" /> : <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" />}
    </svg>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  magnetic = false,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size; magnetic?: boolean }) {
  return (
    <button
      type="button"
      data-magnetic={magnetic || undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  arrow = false,
  magnetic = false,
  transitionTypes,
  ...props
}: Omit<ComponentProps<"a">, "href"> & {
  href: string;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  magnetic?: boolean;
  transitionTypes?: string[];
  children: ReactNode;
}) {
  /* In the docs build, marketing paths become absolute links to the site;
     those are not "another site", so they get no ↗. */
  const resolved = href.startsWith("/") ? siteHref(href) : href;
  const external = isExternal(resolved) && !resolved.startsWith(MAIN_URL);
  const plain = isExternal(resolved);
  const cls = buttonClasses(variant, size, className);
  const content = (
    <>
      {children}
      {(arrow || external) && <Arrow external={external} />}
    </>
  );
  if (plain) {
    return (
      <a href={resolved} className={cls} data-magnetic={magnetic || undefined} {...props}>
        {content}
        {external && <span className="sr-only"> (opens another site)</span>}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={cls}
      data-magnetic={magnetic || undefined}
      transitionTypes={transitionTypes ?? ["page"]}
      {...props}
    >
      {content}
    </Link>
  );
}
