/**
 * The footer (docs/revamp/03 §2): the Living Mark (the brand mark in dots
 * that fly together and part around the pointer) beside the link columns,
 * Valley Time, the visitor's preferences, then the Reservoir: the
 * CoreValley wordmark drawn in dots, filling with hydro from the bottom like
 * water as the page reaches its end (S3). No call-to-action block: every
 * page ends with its own.
 */
import { LivingMark } from "@/components/brand/living-mark";
import { AppLink } from "@/components/system/app-link";
import { Reservoir } from "@/components/chrome/reservoir";
import { FOOTER } from "@/copy/en/site";
import { isExternal } from "@/lib/links";
import { MotionSwitch } from "./pref-switch";
import { ThemeToggle } from "./theme-toggle";
import { ValleyTime } from "./valley-time";

export function SiteFooter() {
  return (
    <footer id="site-footer" className="relative mt-auto overflow-hidden border-t border-line bg-bg">
      <div className="container-page pt-16 md:pt-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(17rem,1fr)_2fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <LivingMark pointerTarget="site-footer" className="w-60 md:w-72" />
            <p className="type-small max-w-[22ch] text-ink-2">Nepal&apos;s GPU cloud, in the Kathmandu Valley.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {FOOTER.columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="type-kicker mb-4 text-ink-3">{col.title}</h2>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      {isExternal(l.href) ? (
                        <a
                          href={l.href}
                          className="type-small text-ink-2 transition-colors duration-[var(--dur-short)] hover:text-ink"
                        >
                          {l.label}
                        </a>
                      ) : (
                        <AppLink
                          href={l.href}
                          transitionTypes={["page"]}
                          className="type-small text-ink-2 transition-colors duration-[var(--dur-short)] hover:text-ink"
                        >
                          {l.label}
                        </AppLink>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
          <ValleyTime />
          <div className="flex items-center gap-6">
            <MotionSwitch className="gap-3" />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <Reservoir />

      <div className="container-page flex flex-col gap-3 pb-8 pt-2 md:flex-row md:items-center md:justify-between">
        <p className="type-caption text-ink-3">{FOOTER.copyright}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {FOOTER.legal.map((l) => (
            <li key={l.href}>
              <AppLink
                href={l.href}
                transitionTypes={["page"]}
                className="type-caption text-ink-3 transition-colors hover:text-ink"
              >
                {l.label}
              </AppLink>
            </li>
          ))}
        </ul>
      </div>
      <p className="container-page type-caption pb-8 text-ink-3">{FOOTER.credits}</p>
    </footer>
  );
}
