/**
 * The line a section starts on.
 *
 * Deliberately quiet: the same centre-weighted hairline (`.rule-fade`) that
 * opens every section on the interior pages, so the home page separates its
 * scenes the way the rest of the site does. It used to carry a dot-matrix
 * band, a left-to-right sweep of light and a "02 / name" index; all three
 * were cut as visual noise. The props stay so call sites need no change, and
 * ride along as data attributes for anyone inspecting the page.
 *
 * A server component with no motion and nothing to hydrate.
 */

export function Horizon({ index, label }: { index: string; label: string }) {
  return (
    <hr
      aria-hidden="true"
      data-section={`${index} ${label}`}
      className="rule-fade pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-page-xl"
    />
  );
}
