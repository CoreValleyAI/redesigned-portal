"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { NavGroup } from "@/lib/docs/content";

/**
 * The docs sidebar. Groups come from mkdocs.yml's `nav`, so the order and
 * labels match the MkDocs build. Client component only for the active state
 * and the mobile disclosure.
 */
export function DocsNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const current = pathname.replace(/\/?$/, "/");

  // Close the mobile list whenever the route changes.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const list = (
    <nav aria-label="Documentation" className="space-y-6">
      {groups.map((group, gi) => (
        <div key={group.title ?? `top-${gi}`}>
          {group.title ? (
            <p className="mb-2 px-2.5 font-mono text-[10px] tracking-label text-ink-600 uppercase">
              {group.title}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = current === item.url;
              return (
                <li key={item.url}>
                  <Link
                    href={item.url}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-md border-l-2 px-2.5 py-1.5 text-[13.5px] transition-colors duration-fast",
                      active
                        ? "border-l-hydro bg-hydro/10 text-ink-100"
                        : "border-l-transparent text-ink-400 hover:bg-carbon-600 hover:text-ink-100",
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile: a disclosure, opened on grid-template-rows like the header
          drawer so it grows to its own height. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="docs-nav-mobile"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md border border-line bg-carbon-700 px-3 py-2.5 text-[13.5px] text-ink-200 lg:hidden"
      >
        Browse the docs
        <Icon
          name="caret-down"
          size={14}
          className={cn("text-ink-500 transition-transform duration-normal", open && "rotate-180")}
        />
      </button>
      <div
        id="docs-nav-mobile"
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-slow ease-out lg:hidden",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 pt-4">{list}</div>
      </div>

      <div className="hidden lg:block">{list}</div>
    </>
  );
}
