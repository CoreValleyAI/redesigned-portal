"use client";

/**
 * The real Kathmandu Valley, contoured (lib/art/valley.ts), drawn with the
 * contour print's plotter trace and pointer light. Decorative; the page
 * says what it shows in a caption.
 */
import { valleyArt } from "@/lib/art/valley";
import { ContourCover } from "./contour-cover";

export function ValleyPortrait({ className }: { className?: string }) {
  return <ContourCover load={valleyArt} draw light className={className} />;
}
