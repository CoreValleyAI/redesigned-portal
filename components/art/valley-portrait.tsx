"use client";

/**
 * The real Kathmandu Valley, contoured (lib/art/valley.ts), drawn with the
 * contour print's plotter trace (on the valley-floor line) and pointer light,
 * in their light-weight forms: the print has a couple of hundred lines. Decorative; the page
 * says what it shows in a caption.
 */
import { valleyArt } from "@/lib/art/valley";
import { ContourCover } from "./contour-cover";

export function ValleyPortrait({ className }: { className?: string }) {
  return <ContourCover load={valleyArt} draw trace="accent" light="overlay" className={className} />;
}
