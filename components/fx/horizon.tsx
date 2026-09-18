/**
 * The line a section starts on. When the section crosses into view, a head
 * of Hydro light sweeps along the rule from left to right, drawing it, and
 * the section's index and name resolve at the right-hand end in mono — the
 * page marking a change of scene the way a terminal marks a new command.
 *
 * A server component: the trigger is <Reveal>'s `data-shown`, the motion is
 * keyframes in glass.css. Replaces the plain `.rule-fade` at a section's top.
 */

import { Reveal } from "./reveal";

export function Horizon({ index, label }: { index: string; label: string }) {
  return (
    <Reveal
      kind="horizon"
      aria-hidden="true"
      className="horizon pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-page-xl px-5 md:px-10"
    >
      <span className="horizon__line">
        <span className="horizon__head" />
      </span>
      <span className="horizon__label">
        <span className="text-hydro">{index}</span> / {label}
      </span>
    </Reveal>
  );
}
