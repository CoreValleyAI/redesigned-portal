"use client";

/**
 * Marketing navigation: a floating glass pill.
 *
 * One rounded-full bar, 20px blur, 1.5 (6px) inner padding, fixed over the
 * page so it rides on top of each page's dark hero slab. It is a dark island
 * (`cv-dark`), so it reads the same over the dark hero and the light page.
 * Links are white/80 and pick up a white/10 pill on hover; the active route
 * keeps that pill.
 *
 * Phones: the pill holds the logo, the call to action and a menu button; the
 * links open in a glass sheet below it. The sheet is `inert` while closed;
 * Escape closes it and returns focus to the menu button.
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

const NAV = [
  { href: "/products", label: "Products" },
  { href: "/pricing", label: "Pricing" },
  { href: "/platform", label: "Platform" },
  { href: "/use-cases", label: "Use cases" },
  { href: docsHref(), label: "Docs" },
  { href: "/company", label: "Company" },
  { href: STATUS_URL, label: "Status", external: true },
] as const;

const VISIBLE_NAV = NAV.filter((item) => SHOW_STATUS || item.label !== "Status");

const isExternal = (item: (typeof NAV)[number]) => "external" in item && item.external;

const pillLink =
  "inline-flex items-center gap-1 rounded-full px-4 py-2 text-[13.5px] font-medium text-white/80 transition-colors duration-300 hover:bg-white/10 hover:text-white";

const drawerRow =
  "flex min-h-12 items-center justify-between rounded-2xl px-4 text-[15px] font-medium text-white/80 transition-colors duration-300 hover:bg-white/10 hover:text-white";

export function SiteHeader() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [lifted, setLifted] = React.useState(false);
  const menuRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

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

  React.useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setLifted(window.scrollY > 24);
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

  const isActive = (href: string) => pathname.startsWith(href.replace(/\/$/, ""));

  return (
    <header className="cv-dark pointer-events-none fixed inset-x-0 top-0 z-50 !bg-transparent">
      <div className="mx-auto max-w-[1600px] px-4 pt-4 md:px-7 md:pt-5">
        <div
          className={cn(
            "glass-strong pointer-events-auto mx-auto flex items-center gap-2 rounded-full p-1.5 transition-[box-shadow,background-color] duration-300",
            lifted && "shadow-[0_20px_50px_-20px_rgb(0_0_0/0.6)]",
          )}
        >
          <Link
            href="/"
            aria-label="CoreValley home"
            className="flex h-10 shrink-0 items-center rounded-full pr-3 pl-3.5 transition-colors duration-300 hover:bg-white/10"
          >
            <LogoLockup size={15} className="md:hidden" />
            <LogoLockup size={17} className="hidden md:inline-flex" />
          </Link>

          <nav aria-label="Main" className="mx-auto hidden items-center gap-0.5 lg:flex">
            {VISIBLE_NAV.map((item) => {
              if (isExternal(item)) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={pillLink}
                  >
                    {item.label}
                    <Icon name="external" size={12} className="text-white/50" />
                  </a>
                );
              }
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(pillLink, active && "bg-white/10 text-white")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <ButtonLink
              href="/contact"
              variant="primary"
              size="sm"
              className="h-10 max-[359px]:hidden"
              iconRight={<Icon name="arrow-right" size={13} />}
            >
              <span className="md:hidden">Access</span>
              <span className="hidden md:inline">Get early access</span>
            </ButtonLink>

            <button
              ref={menuRef}
              type="button"
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={drawerOpen}
              aria-controls="site-drawer"
              onClick={() => setDrawerOpen((v) => !v)}
              className="inline-flex size-10 items-center justify-center rounded-full text-white/80 transition-colors duration-300 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <Icon name={drawerOpen ? "x" : "menu"} size={20} />
            </button>
          </div>
        </div>

        <div
          id="site-drawer"
          inert={!drawerOpen}
          className={cn(
            "pointer-events-auto mt-2 grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden",
            drawerOpen ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <nav aria-label="Main" className="glass-strong flex flex-col gap-0.5 rounded-[2rem] p-2">
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
                    <Icon name="external" size={14} className="text-white/50" />
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(drawerRow, isActive(item.href) && "bg-white/10 text-white")}
                  >
                    {item.label}
                    <Icon
                      name="arrow-right"
                      size={14}
                      className={isActive(item.href) ? "text-hydro" : "text-white/40"}
                    />
                  </Link>
                ),
              )}
              <ButtonLink
                href="/contact"
                variant="primary"
                size="lg"
                fullWidth
                className="mt-2 justify-between hover:scale-[1.02]"
                onClick={() => setDrawerOpen(false)}
                iconRight={<Icon name="arrow-right" size={16} />}
              >
                Get early access
              </ButtonLink>
              <p className="mt-2.5 mb-1.5 text-center text-[12.5px] text-white/50">
                {EARLY_ACCESS.pill} · we reply {EARLY_ACCESS.replyTime}
              </p>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
