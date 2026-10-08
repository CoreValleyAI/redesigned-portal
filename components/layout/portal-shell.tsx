"use client";

/**
 * Portal chrome: a fixed sidebar, a glass topbar and the scrolling content
 * area. Client component because it owns the mobile sidebar and marks the
 * active route.
 */
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, IconButton, Input } from "@/components/ui";
import type { IconName } from "@/components/ui";
import { cn } from "@/lib/cn";
import { LogoLockup } from "./logo";

const NAV: { heading: string; items: { href: string; label: string; icon: IconName }[] }[] = [
  {
    heading: "compute",
    items: [
      { href: "/portal", label: "Overview", icon: "gauge" },
      { href: "/portal/pods", label: "Pods", icon: "slice" },
      { href: "/portal/jupyter", label: "Notebooks", icon: "notebook" },
      { href: "/portal/models", label: "Models", icon: "broadcast" },
      { href: "/portal/dedicated", label: "Dedicated", icon: "node" },
    ],
  },
  {
    heading: "platform",
    items: [
      { href: "/portal/clusters", label: "vClusters", icon: "cluster" },
      { href: "/portal/network", label: "Network", icon: "certificate" },
      { href: "/portal/keys", label: "API keys", icon: "key" },
    ],
  },
  {
    heading: "account",
    items: [
      { href: "/portal/usage", label: "Usage", icon: "chart" },
      { href: "/portal/billing", label: "Billing", icon: "billing" },
      { href: "/portal/audit", label: "Audit log", icon: "audit" },
      { href: "/portal/security", label: "Security", icon: "compliance" },
      { href: "/portal/settings", label: "Settings", icon: "settings" },
    ],
  },
];

/** The console path as the CLI would print it: "console / pods / new". */
function crumbs(pathname: string): string[] {
  const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  return parts.map((p, i) => (i === 0 ? "console" : decodeURIComponent(p)));
}

function isActive(pathname: string, href: string) {
  if (href === "/portal") return pathname === "/portal";
  return pathname.startsWith(href);
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLButtonElement>(null);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* The drawer only exists below lg. Crossing into the desktop layout closes
     it, so the content column is never left inert behind a sidebar that is
     now permanently on screen. */
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* While open: focus moves into the drawer and Escape closes it. Closing by
     hand returns focus to the menu button — but only once the page behind is
     no longer inert, so it happens in the effect after the state commits,
     not in the handler (an inert button silently refuses focus). A close
     caused by navigation leaves focus to the new page. */
  const returnFocus = React.useRef(false);
  React.useEffect(() => {
    if (!open) {
      if (returnFocus.current) menuRef.current?.focus();
      returnFocus.current = false;
      return;
    }
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      returnFocus.current = true;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    returnFocus.current = true;
    setOpen(false);
  };

  return (
    <div className="flex min-h-dvh bg-carbon-900 lg:gap-3 lg:p-3">
      {/* Scrim behind the mobile drawer. */}
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={close}
          className="fixed inset-0 z-40 bg-carbon-900/70 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      {/* Closed on a phone, the drawer is `invisible` as well as off-canvas:
          visibility takes it out of the tab order and the accessibility tree.
          Closing transitions visibility with the transform, so the slide-out
          stays visible until it ends; opening does not, so the drawer is
          visible at once and can take focus in the same frame. */}
      <aside
        id="portal-nav"
        className={cn(
          "cv-dark surface-dark grain fixed inset-y-2 left-2 z-50 flex w-[15rem] flex-none flex-col !rounded-[2rem] px-3.5 py-5 lg:!rounded-[2.5rem]",
          "lg:visible lg:sticky lg:top-3 lg:h-[calc(100dvh-1.5rem)]",
          "duration-normal ease-standard lg:translate-x-0",
          open
            ? "visible translate-x-0 transition-transform"
            : "invisible -translate-x-full transition-[transform,visibility]",
        )}
      >
        <div className="flex items-center justify-between px-2 pt-1 pb-6">
          <Link href="/" aria-label="CoreValley home">
            <LogoLockup size={17} />
          </Link>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="-mr-2 flex size-11 cursor-pointer items-center justify-center rounded-md text-ink-400 hover:bg-carbon-600 hover:text-ink-100 lg:hidden"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <nav aria-label="Console" className="flex-1 space-y-5 overflow-y-auto">
          {NAV.map((group) => (
            <div key={group.heading}>
              <p className="cv-label mb-2 px-2.5 text-[10px] text-ink-500">
                {group.heading}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const on = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={on ? "page" : undefined}
                        data-active={on ? "" : undefined}
                        className={cn(
                          "pt-nav-link flex items-center gap-2.5 rounded-md px-2.5 py-3 text-[13.5px] lg:py-[7px]",
                          on
                            ? "font-semibold"
                            : "font-medium text-ink-400 hover:bg-carbon-500/60 hover:text-ink-100",
                        )}
                      >
                        <Icon
                          name={item.icon}
                          size={16}
                          weight={on ? "duotone" : "regular"}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="pt-card mt-4 p-3.5">
          <div className="flex items-center gap-2">
            <Icon name="region" size={14} className="text-hydro" />
            <span className="font-mono text-[11.5px] tracking-wide text-ink-200">
              np-ktm-1
            </span>
            <span className="ml-auto font-mono text-[10px] tracking-wide text-hydro">live</span>
          </div>
          <p className="mt-2 text-[12px] leading-snug text-ink-500">
            Kathmandu · data stays in Nepal
          </p>
        </div>
      </aside>

      {/* With the drawer open on a phone, the page behind it is inert, so
          focus stays in the drawer until it closes. */}
      <div inert={open} className="flex min-w-0 flex-1 flex-col">
        <header className="cv-dark glass-strong sticky top-2 z-30 mx-2 mt-2 flex items-center gap-2 rounded-full py-1.5 pr-2 pl-4 md:gap-3 lg:top-3 lg:mx-0 lg:mt-0 lg:pl-5">
          <button
            ref={menuRef}
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="portal-nav"
            onClick={() => setOpen(true)}
            className="-ml-2 flex size-11 cursor-pointer items-center justify-center rounded-md text-ink-300 hover:bg-carbon-600 hover:text-ink-100 lg:hidden"
          >
            <Icon name="menu" size={20} />
          </button>

          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 font-mono text-[12px] md:flex">
            <span aria-hidden="true" className="text-hydro">&gt;</span>
            {crumbs(pathname).map((c, i, all) => (
              <React.Fragment key={i}>
                {i > 0 ? (
                  <span aria-hidden="true" className="text-ink-500">
                    /
                  </span>
                ) : null}
                <span className={cn("truncate", i === all.length - 1 ? "text-ink-100" : "text-ink-500")}>
                  {c}
                </span>
              </React.Fragment>
            ))}
          </nav>

          {/* The console runs on the mock data layer. Say so on every screen,
              so a visitor never reads the sample organisation, its spend or
              its capacity as a real account. */}
          <span
            title="This console runs on sample data. Nothing here is a live account."
            className="inline-flex shrink-0 items-center gap-2 font-mono text-[11px] tracking-wide whitespace-nowrap text-warning uppercase"
          >
            <span aria-hidden="true" className="h-px w-3 shrink-0 bg-warning" />
            <span className="sm:hidden">demo data</span>
            <span className="hidden sm:inline">demo · sample data</span>
          </span>

          <div className="ml-auto hidden w-64 sm:block [&_input]:rounded-full">
            <Input
              size="sm"
              placeholder="search pods, keys, invoices…"
              aria-label="Search"
              prefix={<Icon name="search" size={14} />}
              suffix={<kbd className="pt-kbd">⌘K</kbd>}
            />
          </div>

          <IconButton
            size="sm"
            className="ml-auto size-11 rounded-full sm:ml-0 lg:size-9"
            icon={<Icon name="bell" size={16} />}
            title="Notifications"
          />

          {/* A 44px target around the 32px avatar, so the circle keeps its
              size on a phone while the tap area meets the touch minimum. */}
          <Link
            href="/portal/settings"
            aria-label="Account settings"
            className="group -mr-1.5 flex size-11 shrink-0 items-center justify-center rounded-pill lg:mr-0 lg:size-8"
          >
            <span className="flex size-8 items-center justify-center rounded-pill border border-line-hydro bg-hydro/10 font-mono text-[12px] font-medium text-hydro transition-colors duration-fast group-hover:bg-hydro/15">
              as
            </span>
          </Link>
        </header>

        <main className="pt-ground flex-1 px-4 py-7 md:px-8 md:py-10">
          <div className="mx-auto w-full max-w-page-xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
