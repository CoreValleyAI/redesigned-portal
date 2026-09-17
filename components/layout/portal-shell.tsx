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
      { href: "/portal", label: "overview", icon: "gauge" },
      { href: "/portal/pods", label: "pods", icon: "slice" },
      { href: "/portal/jupyter", label: "notebooks", icon: "notebook" },
      { href: "/portal/models", label: "models", icon: "broadcast" },
      { href: "/portal/dedicated", label: "dedicated", icon: "node" },
    ],
  },
  {
    heading: "platform",
    items: [
      { href: "/portal/clusters", label: "vclusters", icon: "cluster" },
      { href: "/portal/network", label: "network", icon: "certificate" },
      { href: "/portal/keys", label: "api keys", icon: "key" },
    ],
  },
  {
    heading: "account",
    items: [
      { href: "/portal/usage", label: "usage", icon: "chart" },
      { href: "/portal/billing", label: "billing", icon: "billing" },
      { href: "/portal/audit", label: "audit log", icon: "audit" },
      { href: "/portal/security", label: "security", icon: "compliance" },
      { href: "/portal/settings", label: "settings", icon: "settings" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/portal") return pathname === "/portal";
  return pathname.startsWith(href);
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  /* A failed token refresh means Keycloak has ended this session - the account
     was disabled, an admin logged it out, or the refresh token was revoked.
     Nothing expires the local cookie on its own, so an open console tab would
     otherwise keep rendering a revoked identity until the 8-hour session ran
     out. Middleware turns this into a redirect on the next navigation; this
     ends it on the tab that is already sitting here. */
  const sessionError = session?.error;
  React.useEffect(() => {
    if (sessionError === "RefreshAccessTokenError") {
      void signOut({ callbackUrl: "/?signin=1" });
    }
  }, [sessionError]);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh">
      {/* Scrim behind the mobile drawer. */}
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-carbon-900/75 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[15.5rem] flex-none flex-col px-3.5 py-4",
          "border-r border-line-subtle bg-carbon-900/80 backdrop-blur-xl",
          "transition-transform duration-slow ease-out lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-2 pb-5">
          <Link href="/" aria-label="CoreValley home">
            <LogoLockup size={17} />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-ink-400 transition-colors duration-fast hover:bg-carbon-600 hover:text-ink-100 lg:hidden"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto">
          {NAV.map((group) => (
            <div key={group.heading}>
              <p className="mb-1.5 px-2.5 font-mono text-[10px] tracking-label uppercase text-ink-600">
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
                        className={cn(
                          "relative flex items-center gap-2.5 rounded-md border px-2.5 py-2 font-mono text-[13px] font-medium",
                          "transition-colors duration-normal ease-standard",
                          on
                            ? "border-line bg-carbon-600 text-ink-100 before:absolute before:inset-y-1.5 before:-left-px before:w-0.5 before:rounded-pill before:bg-hydro before:content-['']"
                            : "border-transparent text-ink-400 hover:bg-carbon-600 hover:text-ink-200",
                        )}
                      >
                        <Icon
                          name={item.icon}
                          size={16}
                          weight={on ? "bold" : "regular"}
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

<<<<<<< Updated upstream
        <div className="mt-4 rounded-md border border-line bg-carbon-700 p-3">
=======
        <div className="lg lg--panel mt-4 rounded-lg p-3.5">
          <div className="flex items-center gap-2.5">
            <Avatar user={user} size={30} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-ink-100">
                {displayName}
              </p>
              <p className="truncate font-mono text-[10.5px] text-ink-500">
                {user?.org ?? user?.email ?? ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Sign out"
              aria-label="Sign out"
              className="rounded-md p-1.5 text-ink-500 transition-colors duration-fast hover:bg-carbon-600 hover:text-ink-100"
            >
              <Icon name="sign-out" size={15} />
            </button>
          </div>

          <div className="my-3 h-px bg-[var(--border-subtle)]" />

>>>>>>> Stashed changes
          <div className="flex items-center gap-2">
            <Icon name="region" size={14} className="text-ink-400" />
            <span className="font-mono text-[11px] tracking-wide text-ink-300">
              np-ktm-1
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="size-1.5 rounded-pill bg-hydro shadow-[0_0_6px_var(--hydro)]" />
              <span className="font-mono text-[10px] text-hydro">live</span>
            </span>
          </div>
          <p className="mt-2 text-[11.5px] leading-snug text-ink-500">
            Kathmandu · data residency in Nepal
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-nav sticky top-0 z-30 flex items-center gap-3 px-4 py-3 md:px-6">
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen(true)}
            className="rounded-md p-2 text-ink-300 transition-colors duration-fast hover:bg-carbon-600 hover:text-ink-100 lg:hidden"
          >
            <Icon name="menu" size={19} />
          </button>

          <div className="ml-auto hidden w-64 sm:block">
            <Input
              size="sm"
              placeholder="search pods, keys, invoices…"
              aria-label="Search"
              prefix={<Icon name="search" size={14} />}
            />
          </div>

          <IconButton
            size="sm"
            icon={<Icon name="bell" size={16} />}
            title="Notifications"
          />

          <Link
            href="/portal/settings"
            aria-label="Account settings"
            className="flex size-8 items-center justify-center rounded-pill border border-line bg-carbon-500 font-mono text-[12px] text-hydro"
          >
            as
          </Link>
        </header>

        {/* Skip-link target, matching the marketing layout. tabIndex -1 so the
            skip moves focus and not just scroll position. */}
        <main
          id="main"
          tabIndex={-1}
          className="flex-1 px-4 py-6 focus:outline-none md:px-6 md:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
<<<<<<< Updated upstream
=======

/** Keycloak profile picture when the realm supplies one, initials otherwise.
 *  A plain <img> rather than next/image: the URL is an arbitrary IdP origin,
 *  and next.config.ts runs images unoptimized anyway. */
function Avatar({
  user,
  size,
}: {
  user?: { name?: string | null; email?: string | null; image?: string | null };
  size: number;
}) {
  const label = initials(user?.name ?? user?.email);

  if (user?.image) {
    return (
      <img
        src={user.image}
        alt=""
        width={size}
        height={size}
        className="rounded-pill border border-line object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex flex-none items-center justify-center rounded-pill border border-line bg-carbon-600 font-mono text-ink-200"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {label}
    </span>
  );
}
>>>>>>> Stashed changes
