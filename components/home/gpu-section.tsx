/**
 * "141 GB on every GPU": the H200 NVL's headline numbers beside the card
 * itself, which answers the pointer or a finger (components/hardware/
 * gpu-live.tsx). Values and labels come from lib/facts.ts; Tensor Core
 * figures carry their sparsity footnote.
 */
import { GpuLive } from "@/components/hardware/gpu-live";
import { F, NoteRef, type Notes } from "@/components/system/fact";
import { SectionHead } from "@/components/system/section";
import { TextLink } from "@/components/system/text-link";
import { HOME } from "@/copy/en/home";
import { fact } from "@/lib/facts";

export function GpuSection({ notes }: { notes: Notes }) {
  const g = HOME.gpu;
  return (
    <section id="gpu" aria-labelledby="gpu-title" className="section-y scroll-mt-[var(--header-h)]">
      <div className="container-page grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="flex flex-col gap-10">
          <SectionHead id="gpu-title" kicker={g.kicker} title={g.title} continuation={g.continuation} lead={g.lead} />
          <dl className="grid grid-cols-2 gap-x-8 gap-y-7">
            {g.specs.map((id, i) => {
              const f = fact(id);
              return (
                <div
                  key={id}
                  className="flex flex-col gap-1.5 border-t border-line pt-4"
                  data-reveal
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <dt className="type-caption order-2 text-ink-3">{f.label}</dt>
                  <dd className="order-1 text-[1.5rem] leading-tight font-semibold tracking-[-0.02em] tabular text-ink sm:type-title-2">
                    <F id={id} />
                    {f.footnote ? <NoteRef notes={notes} id={id} /> : null}
                  </dd>
                </div>
              );
            })}
          </dl>
          <div>
            <TextLink href={g.link.href} arrow>
              {g.link.label}
            </TextLink>
          </div>
        </div>
        <div data-parallax="0.06">
          <GpuLive />
        </div>
      </div>
    </section>
  );
}
