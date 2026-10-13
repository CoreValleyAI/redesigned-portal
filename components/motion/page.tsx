/**
 * The page-level view transition (the DOM half of the "Fog pass", 06 §8).
 * Every page wraps its content in <Page>. Links tagged "page" (the default
 * for ButtonLink/TextLink/AppLink) lift the old page out and rise the new
 * one in; "page-up" (breadcrumbs, "all products") settles down instead.
 * Untyped navigations — the browser's back button, iOS swipe-back — get no
 * extra animation, so they never fight the browser's own.
 */
import { ViewTransition, type ReactNode } from "react";

const MAP = { page: "page", "page-up": "page-up", default: "none" };

export function Page({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={MAP} exit={MAP} default="none">
      <div className="page">{children}</div>
    </ViewTransition>
  );
}
