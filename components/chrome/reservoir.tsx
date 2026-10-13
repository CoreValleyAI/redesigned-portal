/**
 * The Reservoir (S3), CSS edition: the CoreValley wordmark drawn as a dot
 * matrix, with hydro "water" rising through it as the footer scrolls into
 * view — full exactly when the page ends. One element, two masks (the
 * wordmark and the water line) and a scroll-driven animation; no script.
 * Browsers without scroll-driven animations show it full.
 *
 * The WebGL Reservoir (cursor and touch ripples) mounts over this when
 * the GL runtime is available; this stays as its poster.
 */
import { asset } from "@/lib/links";

export function Reservoir() {
  const mask = `url("${asset("/brand/wordmark-mask.svg")}")`;
  return (
    <div aria-hidden="true" className="container-page select-none pt-12 pb-6 md:pt-20">
      <div className="reservoir" style={{ "--mask": mask } as React.CSSProperties}>
        <div className="reservoir__dots" />
        <div className="reservoir__water" />
      </div>
    </div>
  );
}
