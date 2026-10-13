/**
 * From snow to token (S4). A chain of beats, one number each, from Himalayan
 * snow to an answer inside the valley. On wide screens a sticky rail on the
 * left carries the light down the chain as you read and each beat lights its
 * station. Home shows the short chain; /infrastructure the full one.
 */
import { DotGlyph } from "@/components/system/dot-glyph";
import { F, NoteRef, type Notes } from "@/components/system/fact";
import { SectionHead } from "@/components/system/section";
import { TextLink } from "@/components/system/text-link";
import type { Beat } from "@/copy/en/home";
import { JourneyRail } from "./journey-rail";

export function Journey({
  id = "journey",
  kicker,
  title,
  continuation,
  beats,
  link,
  notes,
}: {
  id?: string;
  kicker: string;
  title: string;
  continuation?: string;
  beats: Beat[];
  link?: { href: string; label: string };
  notes: Notes;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="section-y relative scroll-mt-[var(--header-h)]">
      <div className="container-page">
        <SectionHead id={`${id}-title`} kicker={kicker} title={title} continuation={continuation} />

        <div className="mt-12 grid gap-x-16 lg:mt-16 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
          <JourneyRail
            listId={`${id}-beats`}
            beats={beats.map((b) => ({ id: b.id, glyph: b.glyph, label: b.label }))}
          />

          <ol id={`${id}-beats`} className="relative">
            {beats.map((b, i) => (
              <li
                key={b.id}
                data-beat={i}
                className="flex flex-col justify-center gap-5 border-t border-line py-10 first:border-t-0 lg:min-h-[64svh] lg:border-t-0 lg:py-16"
              >
                <div className="flex items-center gap-4">
                  <DotGlyph name={b.glyph} className="size-9 lg:hidden" on />
                  <p className="type-kicker text-ink-3">
                    {String(i + 1).padStart(2, "0")} · {b.label}
                  </p>
                </div>
                <h3 className="type-title-1 max-w-[16ch]" data-reveal>
                  {b.title}
                </h3>
                <p className="type-lead measure text-ink-2" data-reveal style={{ "--i": 1 } as React.CSSProperties}>
                  {b.body}
                </p>
                {b.metric && (
                  <p
                    className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1"
                    data-reveal
                    style={{ "--i": 2 } as React.CSSProperties}
                  >
                    <span className="type-display-2 tabular text-ink">
                      <F id={b.metric.fact} />
                      <NoteRef notes={notes} id={b.metric.fact} />
                    </span>
                    <span className="type-body text-ink-3">{b.metric.label}</span>
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>

        {link && (
          <div className="mt-6 lg:mt-0">
            <TextLink href={link.href} arrow>
              {link.label}
            </TextLink>
          </div>
        )}
      </div>
    </section>
  );
}
