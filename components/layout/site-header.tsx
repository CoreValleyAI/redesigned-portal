"use client";

/**
 * Marketing navigation.
 *
 * Three changes from the previous bar, all of them about restraint:
 *
 *  1. IT IS NOT GLASS AT THE TOP. The bar starts fully transparent and only
 *     materialises once the page has scrolled past ~12px (or the drawer is
 *     open). A frosted slab sitting on top of the hero from the first frame
 *     flattens the one image the page gets to make a first impression with.
 *  2. THE ACTIVE ITEM IS A LIT RAIL, not a filled pill. The rail is a single
 *     shared element that slides between items, so navigation reads as one
 *     indicator moving rather than six independent states.
 *  3. ONE FILLED BUTTON. One Hydro primary, everything else quiet — and on a
 *     phone it stays in the bar, so the way to early access is never more
 *     than a thumb away, however far down the page the reader is.
 *
 * Phones: the bar holds the logo, the call to action and the menu button
 * (44×44). The theme switch moves into the drawer, where it has a label and
 * a full-size target instead of a 30px icon beside the menu.
 *
 * The drawer is `inert` while closed, so keyboard and screen-reader users
 * never land on links they cannot see; Escape closes it and returns focus to
 * the menu button.
 *
 * Client component because it owns the scroll state and the drawer. Sign-in
 * is not offered from the marketing site for now; the console is reached
 * directly at /portal.
 */
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ButtonLink, Icon } from "@/components/ui";
import { EARLY_ACCESS } from "@/lib/availability";
import { cn } from "@/lib/cn";
import { docsHref } from "@/lib/docs/href";
import { SHOW_STATUS, STATUS_URL } from "@/lib/site";
import { LogoLockup } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/products", label: "Products" },
  { href: "/pricing", label: "Pricing" },
  { href: "/platform", label: "Platform" },
  { href: "/use-cases", label: "Use cases" },
  { href: docsHref(), label: "Docs" },
  { href: "/company", label: "Company" },
  // The status page is its own static site on a separate host (see /status
  // in the repo), so this one is a plain external link.
  { href: STATUS_URL, label: "Status", external: true },
] as const;

/* Status is hidden until monitoring is integrated (SHOW_STATUS in lib/site.ts). */
const VISIBLE_NAV = NAV.filter((item) => SHOW_STATUS || item.label !== "Status");

const isExternal = (item: (typeof NAV)[number]) => "external" in item && item.external;

const drawerRow =
  "flex min-h-12 items-center justify-between rounded-md px-2 text-[15px] text-ink-300 transition-colors duration-fast ease-standard hover:bg-carbon-600 hover:text-ink-100";

export function SiteHeader() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [lifted, setLifted] = React.useState(false);

  const navRef = React.useRef<HTMLElement>(null);
  const menuRef = React.useRef<HTMLButtonElement>(null);
  const [rail, setRail] = React.useState<{ x: number; w: number } | null>(null);

  // Close the drawer whenever the route changes.
  React.useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Escape closes the drawer and hands focus back to the button that opened it.
  React.useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setDrawerOpen(false);
      menuRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  /* Materialise the bar on scroll. Read from a rAF rather than on every
     scroll event, and only write state when the boolean actually flips —
     otherwise this re-renders the header sixty times a second. */
  React.useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setLifted(window.scrollY > 12);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /* Measure the active item so the rail can slide to it. Recomputed on route
     change and on resize, because the nav reflows and a cached x would leave
     the rail under the wrong word. */
  React.useLayoutEffect(() => {
    const measure = () => {
      const nav = navRef.current;
      if (!nav) return;
      const active = nav.querySelector<HTMLElement>("[data-active='true']");
      if (!active) return setRail(null);
      setRail({ x: active.offsetLeft, w: active.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    /* Web fonts land after first paint and change every label's width. Without
       this the rail is measured against fallback metrics and sits a few pixels
       off for the rest of the session. */
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [pathname]);

  const isActive = (href: string) => pathname.startsWith(href.replace(/\/$/, ""));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-slow ease-standard",
        lifted || drawerOpen
          ? "lg lg--nav lg-refract"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-page-xl items-center gap-2 px-4 sm:px-5 md:gap-8 md:px-10">
        <Link href="/" aria-label="CoreValley home" className="shrink-0 rounded-md">
          {/* Two sizes rather than a transform: a scaled lockup would still
              take its full width in the bar, which is what a phone is short of. */}
          <LogoLockup size={16} className="md:hidden" />
          <LogoLockup size={19} className="hidden md:inline-flex" />
        </Link>

        <nav ref={navRef} aria-label="Main" className="relative hidden items-center lg:flex">
          {/* The rail. One element, absolutely positioned, animated between
              measured offsets — not a border on each item. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px h-px bg-hydro shadow-glow-sm transition-[transform,width,opacity] duration-slow ease-out"
            style={{
              width: rail?.w ?? 0,
              opacity: rail ? 1 : 0,
              transform: `translate3d(${rail?.x ?? 0}px,0,0)`,
            }}
          />
          {VISIBLE_NAV.map((item) => {
            if (isExternal(item)) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-[13.5px] font-medium text-ink-400 transition-colors duration-normal ease-standard hover:text-ink-100 xl:px-3.5"
                >
                  {item.label}
                  <Icon name="external" size={12} className="text-ink-600" />
                </a>
              );
            }
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors duration-normal ease-standard xl:px-3.5",
                  active ? "text-ink-100" : "text-ink-400 hover:text-ink-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Phones: a full 44px target in the bar, so the call to action
              travels with the reader. Very narrow phones (<360px) get it in
              the drawer only. */}
          <ButtonLink
            href="/contact"
            variant="primary"
            size="sm"
            className="h-11 px-3.5 text-[13px] max-[359px]:hidden md:hidden"
          >
            Early access
          </ButtonLink>
          <ButtonLink href="/contact" variant="primary" size="sm" className="hidden md:inline-flex">
            Get early access
          </ButtonLink>

          <ThemeToggle className="ml-1 hidden md:inline-flex" />

          <button
            ref={menuRef}
            type="button"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
            aria-controls="site-drawer"
            onClick={() => setDrawerOpen((v) => !v)}
            className="inline-flex size-11 items-center justify-center rounded-md text-ink-300 transition-colors duration-fast ease-standard hover:bg-carbon-600 hover:text-ink-100 md:ml-1 lg:hidden"
          >
            <Icon name={drawerOpen ? "x" : "menu"} size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer. Animated on grid-template-rows so it opens from its
          own content height without a hardcoded max-height guess, which is
          the usual source of a drawer that either clips or over-runs. `inert`
          while closed takes the collapsed links out of the tab order and the
          accessibility tree. */}
      <div
        id="site-drawer"
        inert={!drawerOpen}
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-slow ease-out lg:hidden",
          drawerOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0">
          <nav
            aria-label="Main"
            className="mx-auto flex max-w-page-xl flex-col gap-0.5 border-t border-line-subtle px-4 py-3 sm:px-5 md:px-10"
          >
            {VISIBLE_NAV.map((item) =>
              isExternal(item) ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={drawerRow}
                >
                  {item.label}
                  <Icon name="external" size={14} className="text-ink-600" />
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(drawerRow, isActive(item.href) && "text-ink-100")}
                >
                  {item.label}
                  <Icon
                    name="arrow-right"
                    size={14}
                    className={isActive(item.href) ? "text-hydro" : "text-ink-600"}
                  />
                </Link>
              ),
            )}

            {/* Phones only: the theme switch lives here, labelled. */}
            <ThemeToggle labelled className={cn(drawerRow, "md:hidden")} />

            <ButtonLink
              href="/contact"
              variant="primary"
              size="lg"
              fullWidth
              className="mt-3"
              onClick={() => setDrawerOpen(false)}
            >
              Get early access
            </ButtonLink>
            <p className="mt-2.5 mb-1 text-center text-[12.5px] text-ink-500">
              {EARLY_ACCESS.pill} · we reply {EARLY_ACCESS.replyTime}
            </p>
          </nav>
        </div>
      </div>
    </header>
  );
}
