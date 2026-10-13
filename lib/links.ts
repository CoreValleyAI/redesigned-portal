/**
 * Link helpers shared by every component that renders an <a>.
 */

/** Absolute URLs, mail and phone links leave the site (and get ↗). */
export function isExternal(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href);
}

/** Static files under public/ need the base path added by hand
    (next/link only prefixes routes). */
export function asset(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
