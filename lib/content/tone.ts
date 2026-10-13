/**
 * A blog category's colour in the contour prints: fixed for the two we
 * start with, then a stable pick for any category an editor adds. Shared by
 * the cards (components/blog/post-parts.tsx) and the link-preview images
 * (app/(marketing)/blog/[slug]/og.png).
 */
export type ContourTone = "hydro" | "glow-2" | "glow-3";

const TONES: ContourTone[] = ["hydro", "glow-2", "glow-3"];

export function toneFor(category: { slug: string } | null | undefined): ContourTone {
  const slug = category?.slug ?? "";
  if (slug === "engineering" || !slug) return "hydro";
  if (slug === "company") return "glow-2";
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length]!;
}
