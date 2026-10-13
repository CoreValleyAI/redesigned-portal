/**
 * AppLink — the link every piece of chrome uses. One component that works
 * in both builds from this repository:
 *
 *  · the site: internal paths go through next/link (base path, prefetch,
 *    the "page" view transition by default);
 *  · the docs site (NEXT_PUBLIC_BUILD_TARGET=docs): paths of marketing
 *    pages become absolute links to corevalley.ai (lib/site → siteHref).
 *
 * Mail and absolute URLs render a plain <a>.
 */
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { siteHref } from "@/lib/site";

export function AppLink({
  href,
  children,
  transitionTypes = ["page"],
  ...props
}: Omit<ComponentProps<"a">, "href"> & {
  href: string;
  children: ReactNode;
  transitionTypes?: string[];
}) {
  const resolved = href.startsWith("/") ? siteHref(href) : href;
  if (!resolved.startsWith("/")) {
    return (
      <a href={resolved} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={resolved} transitionTypes={transitionTypes} {...props}>
      {children}
    </Link>
  );
}
