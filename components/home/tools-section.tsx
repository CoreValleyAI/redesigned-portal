/**
 * "The tools you already use": what customers work in — HPE AI Essentials
 * on HPE Private Cloud AI, with NVIDIA AI Enterprise — grouped the way a
 * team uses them. Only tools named in the HPE briefing (docs/revamp/04 §2).
 */
import { SectionHead } from "@/components/system/section";
import { TextLink } from "@/components/system/text-link";
import { HOME } from "@/copy/en/home";

export function ToolsSection() {
  const t = HOME.tools;
  return (
    <section aria-labelledby="tools-title" className="section-y">
      <div className="container-page grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-20">
        <div className="flex flex-col gap-8">
          <SectionHead id="tools-title" kicker={t.kicker} title={t.title} continuation={t.continuation} lead={t.lead} />
          <div>
            <TextLink href={t.link.href} arrow>
              {t.link.label}
            </TextLink>
          </div>
        </div>
        <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {t.groups.map((g, i) => (
            <div
              key={g.name}
              className="flex flex-col gap-4 border-t border-line pt-5"
              data-reveal
              style={{ "--i": i } as React.CSSProperties}
            >
              <h3 className="type-kicker text-ink-3">{g.name}</h3>
              <ul className="flex flex-wrap gap-2">
                {g.tools.map((tool) => (
                  <li
                    key={tool}
                    className="type-small rounded-pill border border-line bg-bg-raised px-3.5 py-1.5 font-medium text-ink"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
