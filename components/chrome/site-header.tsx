"use client";

/**
 * The site header (docs/revamp/03 §2) — the only glass on the site.
 *
 * Desktop (≥ 1280 px): logo · Products ▾ · Solutions ▾ · Platform ·
 * Infrastructure · Use cases · Pricing · Company ▾ · Docs ↗ · theme ·
 * Request access. A soft pill slides between nav items under the pointer;
 * Products, Solutions and Company open full-width panels that grow down
 * from the bar.
 *
 * Narrower: logo · Access · menu. The menu is a native <dialog> sheet that
 * rises from the bottom edge (thumb reach), with focus trapping, Escape and
 * scroll locking handled by the browser.
 *
 * The bar is transparent over the top of the page and turns to glass once
 * the page scrolls (an IntersectionObserver on #top, no scroll listener).
 * It keeps its place during page transitions (view-transition-name).
 */
import { AppLink } from "@/components/system/app-link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Brandmark, Wordmark } from "@/components/brand/logo";
import { NvidiaLogo } from "@/components/brand/partner-logos";
import { GpuArt } from "@/components/hardware/visuals";
import { Arrow, ButtonLink } from "@/components/system/button";
import { IndustryGlyph } from "@/components/solutions/industry-glyph";
import { DotGlyph } from "@/components/system/dot-glyph";
import { Status } from "@/components/system/status";
import { NAV, UI, type NavLink } from "@/copy/en/site";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./theme-toggle";
import { MotionSwitch } from "./pref-switch";

type PanelId = "products" | "solutions" | "company";

/** The page a link points to is this one. Links to a section of a page
    (/solutions#banking) are never "the current page". */
function isCurrent(pathname: string, href: string) {
  if (href.includes("#")) return false;
  const clean = href;
  if (clean === "/") return pathname === "/";
  return pathname === clean || pathname.startsWith(`${clean}/`);
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [panel, setPanel] = React.useState<PanelId | null>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const closeTimer = React.useRef<number | undefined>(undefined);
  const openTimer = React.useRef<number | undefined>(undefined);
  const headerRef = React.useRef<HTMLElement>(null);

  /* Glass once the page has scrolled. */
  React.useEffect(() => {
    const top = document.getElementById("top");
    if (!top) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e?.isIntersecting), {
      rootMargin: "8px 0px 0px 0px",
    });
    io.observe(top);
    return () => io.disconnect();
  }, []);

  /* A navigation closes any open panel. */
  const [lastPath, setLastPath] = React.useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setPanel(null);
  }

  /* Escape closes a panel and returns focus to its trigger. */
  React.useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      document.getElementById(`nav-trigger-${panel}`)?.focus();
      setPanel(null);
    };
    const onDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [panel]);

  const hoverOpen = (id: PanelId) => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => setPanel(id), panel ? 0 : 90);
  };
  const hoverClose = () => {
    window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => setPanel(null), 180);
  };
  const keepOpen = () => window.clearTimeout(closeTimer.current);

  const solid = scrolled || panel !== null;

  return (
    <>
      <header
        ref={headerRef}
        className="site-header fixed inset-x-0 top-0 z-50"
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") hoverClose();
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") keepOpen();
        }}
      >
        {/* The bar: a floating pill of liquid glass, a little more opaque
            once the page has scrolled (Chromium also bends the page through
            its rim: data-refract). */}
        <div className="px-2 pt-2 sm:px-[max(0.5rem,calc(var(--page-x)-0.875rem))] sm:pt-2.5">
          <div
            data-refract
            data-refract-bezel="16"
            className={cn(
              "lg-nav relative mx-auto flex h-[var(--header-h)] max-w-[calc(var(--content-max)+1.75rem)] items-center gap-4 rounded-[1.25rem] pr-2 pl-3 sm:pl-4 xl:gap-6",
              solid && "is-solid",
            )}
          >
            <AppLink
              href="/"
              transitionTypes={["page-up"]}
              aria-label="CoreValley — home"
              className="group/logo -ml-1 flex shrink-0 items-center gap-2.5 rounded-chip p-1"
            >
              <Brandmark className="w-8 transition-transform duration-[var(--dur-spring-smooth)] ease-spring group-hover/logo:scale-[1.06]" />
              <Wordmark className="w-[6.75rem] text-ink" />
            </AppLink>

            <DesktopNav
              pathname={pathname}
              panel={panel}
              onToggle={(id) => setPanel((p) => (p === id ? null : id))}
              onHoverOpen={hoverOpen}
            />

            <div className="ml-auto flex items-center gap-1 xl:gap-2">
              <a
                href={NAV.docs.href}
                className="group/btn type-small hidden h-9 items-center gap-1 rounded-pill px-3 text-ink-2 transition-colors duration-[var(--dur-short)] hover:bg-bg-sunken hover:text-ink xl:inline-flex"
              >
                {NAV.docs.label}
                <Arrow external />
                <span className="sr-only"> ({UI.external})</span>
              </a>
              <ThemeToggle />
              <ButtonLink href={NAV.cta.href} size="sm" className="ml-1 hidden sm:inline-flex" magnetic>
                {NAV.cta.label}
              </ButtonLink>
              <ButtonLink href={NAV.cta.href} size="sm" className="ml-1 px-3.5 sm:hidden">
                {NAV.cta.short}
              </ButtonLink>
              <MobileMenu pathname={pathname} />
            </div>
          </div>
        </div>

        <Panel id="products" open={panel === "products"} onEnter={keepOpen} onPick={() => setPanel(null)}>
          <ProductsPanel pathname={pathname} />
        </Panel>
        <Panel id="solutions" open={panel === "solutions"} onEnter={keepOpen} onPick={() => setPanel(null)}>
          <SolutionsPanel pathname={pathname} />
        </Panel>
        <Panel id="company" open={panel === "company"} onEnter={keepOpen} onPick={() => setPanel(null)}>
          <CompanyPanel pathname={pathname} />
        </Panel>
      </header>

      {/* Dim the page under an open panel. */}
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-[oklch(0.1_0.01_250/0.18)] backdrop-blur-[2px] transition-opacity duration-[var(--dur-base)] ease-out",
          panel ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
    </>
  );
}

/* ── Desktop navigation ─────────────────────────────────────────────────── */

function DesktopNav({
  pathname,
  panel,
  onToggle,
  onHoverOpen,
}: {
  pathname: string;
  panel: PanelId | null;
  onToggle: (id: PanelId) => void;
  onHoverOpen: (id: PanelId) => void;
}) {
  const navRef = React.useRef<HTMLDivElement>(null);
  const pillRef = React.useRef<HTMLSpanElement>(null);
  const shown = React.useRef(false);

  /* The hover pill: moved with transforms, measured only on hover. */
  const point = (el: HTMLElement) => {
    const pill = pillRef.current;
    if (!pill) return;
    const instant = !shown.current;
    pill.style.transitionDuration = instant ? "0ms" : "";
    pill.style.setProperty("--x", `${el.offsetLeft}px`);
    pill.style.setProperty("--w", `${el.offsetWidth}px`);
    pill.style.opacity = "1";
    shown.current = true;
  };
  const hide = () => {
    const pill = pillRef.current;
    if (!pill) return;
    pill.style.transitionDuration = "";
    pill.style.opacity = "0";
    shown.current = false;
  };

  const item =
    "type-small relative z-10 inline-flex h-9 shrink-0 items-center gap-1 rounded-pill px-3 whitespace-nowrap text-ink-2 2xl:px-3.5 transition-colors duration-[var(--dur-short)] hover:text-ink aria-[current=page]:text-ink aria-expanded:text-ink";

  const trigger = (id: PanelId, label: string, paths: string[]) => (
    <button
      id={`nav-trigger-${id}`}
      type="button"
      aria-expanded={panel === id}
      aria-controls={`nav-panel-${id}`}
      className={cn(item, paths.some((p) => isCurrent(pathname, p)) && "text-ink")}
      onClick={() => onToggle(id)}
      onPointerEnter={(e) => {
        point(e.currentTarget);
        if (e.pointerType === "mouse") onHoverOpen(id);
      }}
      onFocus={(e) => point(e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (panel !== id) onToggle(id);
          requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>(`#nav-panel-${id} a`)?.focus());
        }
      }}
    >
      {label}
      <svg
        viewBox="0 0 12 12"
        aria-hidden="true"
        className={cn(
          "size-3 transition-transform duration-[var(--dur-spring-snappy)] ease-spring",
          panel === id && "rotate-180",
        )}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3 4.5 3 3 3-3" />
      </svg>
    </button>
  );

  return (
    <nav aria-label="Main" className="ml-4 hidden xl:block">
      <div
        ref={navRef}
        className="relative flex items-center"
        onPointerLeave={hide}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) hide();
        }}
      >
        <span
          ref={pillRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 h-9 w-[var(--w,0px)] translate-x-[var(--x,0px)] rounded-pill bg-bg-sunken opacity-0 transition-[transform,width,opacity] duration-[var(--dur-spring-smooth)] ease-spring dark:bg-bg-elevated"
        />
        {trigger("products", NAV.products.label, ["/products", "/hardware"])}
        {trigger("solutions", NAV.solutions.label, ["/solutions"])}
        {NAV.primary.map((l) => (
          <AppLink
            key={l.href}
            href={l.href}
            transitionTypes={["page"]}
            aria-current={isCurrent(pathname, l.href) ? "page" : undefined}
            className={item}
            onPointerEnter={(e) => point(e.currentTarget)}
            onFocus={(e) => point(e.currentTarget)}
          >
            {l.label}
          </AppLink>
        ))}
        {trigger("company", NAV.company.label, ["/company", "/jobs", "/blog", "/trust"])}
      </div>
    </nav>
  );
}

function Panel({
  id,
  open,
  onEnter,
  onPick,
  children,
}: {
  id: PanelId;
  open: boolean;
  onEnter: () => void;
  /** A link was chosen: close, even when it only moves within this page. */
  onPick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      id={`nav-panel-${id}`}
      role="region"
      aria-labelledby={`nav-trigger-${id}`}
      inert={!open}
      onPointerEnter={onEnter}
      onClick={(e) => {
        if ((e.target as Element).closest("a")) onPick();
      }}
      className={cn(
        "absolute inset-x-0 top-full hidden px-[max(0.5rem,calc(var(--page-x)-0.875rem))] pt-2 xl:block",
        "origin-top transition-[clip-path,opacity] duration-[var(--dur-spring-smooth)] ease-spring",
        open ? "[clip-path:inset(0_0_0_0)] opacity-100" : "pointer-events-none [clip-path:inset(0_0_100%_0)] opacity-0",
      )}
    >
      <div
        className={cn(
          "lg-nav is-solid is-panel mx-auto max-w-[calc(var(--content-max)+1.75rem)] rounded-[1.25rem] px-8 py-8 transition-[transform,opacity] duration-[var(--dur-spring-smooth)] ease-spring",
          open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function PanelLink({
  link,
  pathname,
  i,
  compact = false,
}: {
  link: NavLink;
  pathname: string;
  i: number;
  /** Tighter, for the Products panel's rows. */
  compact?: boolean;
}) {
  return (
    <AppLink
      href={link.href}
      transitionTypes={["page"]}
      aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
      className={cn(
        "group flex items-start rounded-card transition-colors duration-[var(--dur-short)] hover:bg-bg-sunken dark:hover:bg-bg-elevated",
        compact ? "-mx-2.5 gap-3.5 p-2.5" : "-mx-3 gap-4 p-3",
      )}
      style={{ "--i": i } as React.CSSProperties}
    >
      {link.industry ? (
        <IndustryGlyph name={link.industry} className="mt-0.5 size-8" />
      ) : (
        link.glyph && <DotGlyph name={link.glyph} className={cn("mt-0.5 shrink-0", compact ? "size-7" : "size-8")} />
      )}
      <span className={cn("flex flex-col", compact ? "gap-0.5" : "gap-1")}>
        <span className={cn("font-medium text-ink", compact ? "type-small" : "type-body")}>{link.label}</span>
        {link.description && (
          <span className={cn("text-ink-3", compact ? "type-caption" : "type-small")}>{link.description}</span>
        )}
      </span>
    </AppLink>
  );
}

/** Products: Run, Build and Scale as rows — the group named on the left,
    its offerings across — with NVIDIA's card in the Scale row and a way
    to the whole catalogue at the foot. */
function ProductsPanel({ pathname }: { pathname: string }) {
  const p = NAV.products;
  let n = 0;
  return (
    <div className="flex flex-col">
      {p.groups.map((g, gi) => (
        <div
          key={g.name}
          className="grid grid-cols-[10rem_1fr] gap-8 border-t 2xl:grid-cols-[12.5rem_1fr] 2xl:gap-10 border-line py-5 first:border-t-0 first:pt-0"
        >
          <div className="flex flex-col gap-1.5 pt-2.5">
            <p className="type-title-3 text-ink">{g.name}</p>
            <p className="type-small text-ink-3">{g.line}</p>
          </div>
          <div className="grid grid-cols-3 gap-x-6 gap-y-0.5">
            {g.items.map((l) => (
              <PanelLink key={l.href} link={l} pathname={pathname} i={n++} compact />
            ))}
            {gi === p.groups.length - 1 && (
              <AppLink
                href={p.featured.href}
                transitionTypes={["page"]}
                className="lg lg-card group flex items-center gap-4 rounded-card p-2.5 pr-4"
              >
                <span className="grid h-[4.25rem] w-[6.5rem] shrink-0 place-items-center overflow-hidden rounded-chip bg-bg-sunken">
                  <GpuArt className="w-[7.5rem]" />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <NvidiaLogo className="h-3.5 self-start text-ink" />
                  <span className="type-small font-medium text-ink">{p.featured.title}</span>
                  <span className="type-caption text-ink-3">{p.featured.body}</span>
                </span>
              </AppLink>
            )}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between gap-8 border-t border-line pt-5">
        <div className="flex items-center gap-7">
          <AppLink
            href={p.all.href}
            transitionTypes={["page"]}
            className="type-small group inline-flex items-center gap-2 font-semibold text-ink"
          >
            {p.all.label}
            <Arrow className="transition-transform duration-[var(--dur-spring-snappy)] ease-spring group-hover:translate-x-1" />
          </AppLink>
          {p.footer.map((l) => (
            <AppLink
              key={l.href}
              href={l.href}
              transitionTypes={["page"]}
              className="type-small text-ink-3 transition-colors duration-[var(--dur-short)] hover:text-ink"
            >
              {l.label}
            </AppLink>
          ))}
        </div>
        <Status />
      </div>
    </div>
  );
}

function SolutionsPanel({ pathname }: { pathname: string }) {
  return (
    <div className="grid grid-cols-[2fr_1fr] gap-12">
      <div>
        <p className="type-kicker mb-4 text-ink-3">By industry</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          {NAV.solutions.industries.map((l, i) => (
            <PanelLink key={l.href} link={l} pathname={pathname} i={i} />
          ))}
        </div>
      </div>
      <div className="border-l border-line pl-12">
        <p className="type-kicker mb-4 text-ink-3">Solutions</p>
        <div className="flex flex-col gap-1">
          {NAV.solutions.more.map((l, i) => (
            <PanelLink key={l.href} link={l} pathname={pathname} i={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CompanyPanel({ pathname }: { pathname: string }) {
  return (
    <div className="grid grid-cols-4 gap-6">
      {NAV.company.items.map((l, i) => (
        <PanelLink key={l.href} link={l} pathname={pathname} i={i} />
      ))}
    </div>
  );
}

/* ── Mobile menu ────────────────────────────────────────────────────────── */

function MobileMenu({ pathname }: { pathname: string }) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const [open, setOpen] = React.useState(false);

  const show = () => {
    ref.current?.showModal();
    setOpen(true);
  };
  const hide = React.useCallback(() => {
    ref.current?.close();
  }, []);

  /* Close on navigation. */
  const [lastPath, setLastPath] = React.useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }
  React.useEffect(() => {
    if (!open) ref.current?.close();
  }, [open]);

  const row = "flex min-h-14 items-center justify-between border-b border-line py-3 type-title-3 font-medium text-ink";

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label={UI.menu.open}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="grid size-10 place-items-center rounded-full text-ink transition-[background-color,transform] duration-[var(--dur-spring-snappy)] ease-spring hover:bg-bg-sunken active:scale-[0.94] xl:hidden"
      >
        <svg
          viewBox="0 0 20 20"
          className="size-5"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M3 7h14M3 13h14" />
        </svg>
      </button>

      <dialog
        ref={ref}
        aria-label="Menu"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) hide();
        }}
        className={cn(
          // Liquid glass over the page it came from: the sheet blurs what is behind it.
          "glass fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none p-0 text-ink",
          "translate-y-full transition-[transform,display,overlay] transition-discrete duration-[var(--dur-spring-gentle)] ease-spring",
          "open:translate-y-0 starting:open:translate-y-full backdrop:bg-transparent",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="container-page flex h-[var(--header-h)] shrink-0 items-center justify-between">
            <AppLink
              href="/"
              onClick={hide}
              aria-label="CoreValley — home"
              className="flex items-center gap-2.5 rounded-chip p-1"
            >
              <Brandmark className="w-8" />
              <Wordmark className="w-[6.75rem] text-ink" />
            </AppLink>
            <button
              type="button"
              onClick={hide}
              aria-label={UI.menu.close}
              className="grid size-10 place-items-center rounded-full transition-colors hover:bg-bg-sunken"
            >
              <svg
                viewBox="0 0 20 20"
                className="size-5"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <path d="m5 5 10 10M15 5 5 15" />
              </svg>
            </button>
          </div>

          <nav aria-label="Main" className="container-page flex-1 overflow-y-auto overscroll-contain pb-6">
            <details name="menu" className="group/acc border-b border-line">
              <summary className={cn(row, "cursor-pointer list-none border-b-0 [&::-webkit-details-marker]:hidden")}>
                {NAV.products.label}
                <Chevron />
              </summary>
              <div className="flex flex-col gap-5 pb-5">
                <AppLink
                  href={NAV.products.all.href}
                  onClick={hide}
                  className="type-body flex items-center justify-between rounded-card bg-bg-sunken px-4 py-3 font-semibold text-ink"
                >
                  {NAV.products.all.label}
                  <Arrow className="text-ink-3" />
                </AppLink>
                {NAV.products.groups.map((g) => (
                  <div key={g.name} className="flex flex-col gap-1">
                    <p className="type-kicker text-ink-3">{g.name}</p>
                    <ul className="flex flex-col">
                      {g.items.map((l) => (
                        <li key={l.href}>
                          <AppLink href={l.href} onClick={hide} className="flex items-center gap-3 rounded-chip py-2">
                            {l.glyph && <DotGlyph name={l.glyph} className="size-6" />}
                            <span className="type-body text-ink-2">{l.label}</span>
                          </AppLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <AppLink href="/hardware" onClick={hide} className="flex items-center gap-3 rounded-chip py-2">
                  <DotGlyph name="hardware" className="size-6" />
                  <span className="type-body text-ink-2">Hardware · NVIDIA H200 NVL</span>
                </AppLink>
              </div>
            </details>
            <details name="menu" className="group/acc border-b border-line">
              <summary className={cn(row, "cursor-pointer list-none border-b-0 [&::-webkit-details-marker]:hidden")}>
                {NAV.solutions.label}
                <Chevron />
              </summary>
              <ul className="flex flex-col gap-1 pb-4">
                {[...NAV.solutions.industries, ...NAV.solutions.more].map((l: NavLink) => (
                  <li key={l.href}>
                    <AppLink href={l.href} onClick={hide} className="flex items-center gap-3 rounded-chip py-2.5">
                      {l.industry ? (
                        <IndustryGlyph name={l.industry} className="size-6" />
                      ) : (
                        l.glyph && <DotGlyph name={l.glyph} className="size-6" on={isCurrent(pathname, l.href)} />
                      )}
                      <span className="type-body text-ink-2">{l.label}</span>
                    </AppLink>
                  </li>
                ))}
              </ul>
            </details>
            {NAV.primary.map((l) => (
              <AppLink
                key={l.href}
                href={l.href}
                onClick={hide}
                aria-current={isCurrent(pathname, l.href) ? "page" : undefined}
                className={row}
              >
                {l.label}
                <Arrow className="text-ink-3" />
              </AppLink>
            ))}
            <details name="menu" className="group/acc border-b border-line">
              <summary className={cn(row, "cursor-pointer list-none border-b-0 [&::-webkit-details-marker]:hidden")}>
                {NAV.company.label}
                <Chevron />
              </summary>
              <ul className="flex flex-col gap-1 pb-4">
                {NAV.company.items.map((l) => (
                  <li key={l.href}>
                    <AppLink href={l.href} onClick={hide} className="flex items-center gap-3 rounded-chip py-2.5">
                      {l.glyph && <DotGlyph name={l.glyph} className="size-6" />}
                      <span className="type-body text-ink-2">{l.label}</span>
                    </AppLink>
                  </li>
                ))}
              </ul>
            </details>
            <a href={NAV.docs.href} className={row}>
              {NAV.docs.label}
              <Arrow external className="text-ink-3" />
            </a>

            <div className="mt-6 flex flex-col gap-5 rounded-card bg-bg-sunken p-5">
              <div className="flex items-center justify-between">
                <span className="type-small text-ink">{UI.theme.label}</span>
                <ThemeToggle />
              </div>
              <MotionSwitch />
            </div>
          </nav>

          <div className="container-page shrink-0 border-t border-line py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <ButtonLink href={NAV.cta.href} className="w-full" size="lg" onClick={hide}>
              {NAV.cta.label}
            </ButtonLink>
          </div>
        </div>
      </dialog>
    </>
  );
}

function Chevron() {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className="size-4 text-ink-3 transition-transform duration-[var(--dur-spring-snappy)] ease-spring group-open/acc:rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 4.5 3 3 3-3" />
    </svg>
  );
}
