"use client";

/**
 * Marketing navigation.
 *
 * Three changes from the previous bar, all of them about restraint:
 *
 *  1. IT IS NOT GLASS AT THE TOP. The bar starts fully transparent and only
 *     materialises once the page has scrolled past ~12px. A frosted slab
 *     sitting on top of the hero from the first frame flattens the one image
 *     the page gets to make a first impression with.
 *  2. THE ACTIVE ITEM IS A LIT RAIL, not a filled pill. The rail is a single
 *     shared element that slides between items, so navigation reads as one
 *     indicator moving rather than six independent states.
 *  3. ONE FILLED BUTTON. The old bar had Contact Sales, Sign In and Sign Up
 *     competing at the same weight, two of them filled green. Now: one Hydro
 *     primary, everything else quiet.
 *
 * Client component because it owns the scroll state and the drawer. Sign-in
 * is not offered from the marketing site for now; the console is reached
 * directly at /portal.
 */
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { docsUrl } from "@/lib/docs";
import { LogoLockup } from "./logo";

/* Docs is the MkDocs site under public/docs/, not a Next route: it needs a
   plain anchor and a full navigation, so it is flagged `plain`. */
const NAV = [
  { href: "/products", label: "Products" },
  { href: "/use-cases", label: "Use cases" },
  { href: docsUrl(), label: "Docs", plain: true },
  { href: "/company", label: "Company" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [lifted, setLifted] = React.useState(false);

  const navRef = React.useRef<HTMLElement>(null);
  const [rail, setRail] = React.useState<{ x: number; w: number } | null>(null);

  // Close the drawer whenever the route changes.
  React.useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

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

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-slow ease-standard",
          lifted
            ? "lg lg--nav lg-refract"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-page-xl items-center gap-8 px-5 md:px-10">
          <Link href="/" aria-label="CoreValley home" className="shrink-0">
            <LogoLockup size={19} />
          </Link>

          <nav ref={navRef} className="relative hidden items-center lg:flex">
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
            {NAV.map((item) => {
              const plain = "plain" in item && item.plain;
              const active = !plain && pathname.startsWith(item.href);
              const className = cn(
                "px-3.5 py-2 text-[13.5px] font-medium transition-colors duration-normal",
                active ? "text-ink-100" : "text-ink-400 hover:text-ink-100",
              );
              return plain ? (
                <a key={item.href} href={item.href} className={className}>
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active}
                  aria-current={active ? "page" : undefined}
                  className={className}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <Link href="/contact" className="hidden md:block">
              <Button variant="primary" size="sm">
                Talk to sales
              </Button>
            </Link>

            <button
              type="button"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={drawerOpen}
              aria-controls="site-drawer"
              onClick={() => setDrawerOpen((v) => !v)}
              className="ml-1 rounded-md p-2 text-ink-300 transition-colors duration-fast hover:bg-carbon-600 hover:text-ink-100 lg:hidden"
            >
              <Icon name={drawerOpen ? "x" : "menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile drawer. Animated on grid-template-rows so it opens from its
            own content height without a hardcoded max-height guess, which is
            the usual source of a drawer that either clips or over-runs. */}
        <div
          id="site-drawer"
          className={cn(
            "grid overflow-hidden transition-[grid-template-rows,opacity] duration-slow ease-out lg:hidden",
            drawerOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0">
            <nav className="mx-auto flex max-w-page-xl flex-col gap-0.5 border-t border-line-subtle px-5 py-4 md:px-10">
              {NAV.map((item) => {
                const className =
                  "flex items-center justify-between rounded-md px-2 py-3 text-[15px] text-ink-300 transition-colors duration-fast hover:bg-carbon-600 hover:text-ink-100";
                const inner = (
                  <>
                    {item.label}
                    <Icon name="arrow-right" size={14} className="text-ink-600" />
                  </>
                );
                return "plain" in item && item.plain ? (
                  <a key={item.href} href={item.href} className={className}>
                    {inner}
                  </a>
                ) : (
                  <Link key={item.href} href={item.href} className={className}>
                    {inner}
                  </Link>
                );
              })}
              <Link href="/contact" className="mt-3">
                <Button variant="primary" size="md" fullWidth>
                  Talk to sales
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
