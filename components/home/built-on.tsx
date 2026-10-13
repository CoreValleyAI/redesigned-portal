/**
 * "Built on": the partners' own marks under the hero, and what each one
 * contributes, in one quiet band. Names are for identification; no partner
 * designation is claimed (docs/revamp/04 §4).
 */
import { HpeLogo, NvidiaLogo } from "@/components/brand/partner-logos";
import { HOME } from "@/copy/en/home";

export function BuiltOn() {
  const b = HOME.builtOn;
  return (
    <section aria-label={b.label} className="border-y border-line bg-bg-sunken/50">
      <div className="container-page flex flex-col items-center gap-6 py-9 text-center md:flex-row md:justify-between md:gap-10 md:text-left">
        <p className="type-kicker text-ink-3">{b.label}</p>
        <div className="flex items-center gap-8 text-ink md:gap-12" data-reveal>
          <NvidiaLogo className="h-7 md:h-8" />
          <span aria-hidden="true" className="h-8 w-px bg-line-strong" />
          <HpeLogo className="h-6 md:h-7" />
        </div>
        <p className="type-small max-w-[36ch] text-ink-2 md:text-right">{b.line}</p>
      </div>
    </section>
  );
}
