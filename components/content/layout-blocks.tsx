/**
 * The careers page's drag-and-drop sections, in the site's own design.
 * Isomorphic (no hooks, no fs) so the live preview renders them too.
 */
import * as React from "react";
import { Card, Icon, StatBlock } from "@/components/ui";
import { TitledSection as Section } from "@/components/system/page-hero";
import { Faq } from "@/components/system/faq";
import { RevealGroup } from "@/components/motion/reveal";
import { mediaSrc, mediaSrcSet, objectPosition } from "@/lib/content/format";
import { key, type LayoutBlock, type MediaItem } from "@/lib/content/types";
import { RichText } from "./rich-text";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SAFE_URL = /^(\/(?!\/)|https?:\/\/|mailto:)/i;

export function LayoutBlocks({
  blocks,
  media,
}: {
  blocks: LayoutBlock[];
  media: Map<string, MediaItem>;
}) {
  return (
    <>
      {blocks.map((b, i) => (
        <LayoutBlockView key={b.id ?? `${b.blockType}-${i}`} block={b} media={media} index={i} />
      ))}
    </>
  );
}

function LayoutBlockView({
  block: b,
  media,
  index,
}: {
  block: LayoutBlock;
  media: Map<string, MediaItem>;
  index: number;
}) {
  switch (b.blockType) {
    case "richTextSection":
      return (
        <Section title={b.heading}>
          <RichText state={b.body} media={media} className="max-w-[68ch]" />
        </Section>
      );

    case "valuesGrid":
      return (
        <Section title={b.heading} lead={b.intro}>
          <RevealGroup step={70} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {b.items.map((it, i) => (
              <Card key={it.title} padding={26} className="h-full">
                <span className="font-mono text-[12px] tracking-wide text-ink-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink-100">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{it.body}</p>
              </Card>
            ))}
          </RevealGroup>
        </Section>
      );

    case "benefitsList":
      return (
        <Section title={b.heading} lead={b.intro} alt={index % 2 === 1}>
          <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {b.items.map((it) => (
              <li key={it.title} className="flex gap-3">
                <Icon name="check" size={16} className="mt-1 shrink-0 text-hydro" />
                <div>
                  <p className="text-[15px] font-medium text-ink-100">{it.title}</p>
                  {it.body ? <p className="mt-1 text-sm leading-relaxed text-ink-400">{it.body}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      );

    case "processSteps":
      return (
        <Section title={b.heading} lead={b.intro}>
          <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {b.steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-line bg-surface-card p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-[12px] text-ink-500">{String(i + 1).padStart(2, "0")}</span>
                  {s.duration ? <span className="font-mono text-[11.5px] text-ink-500">{s.duration}</span> : null}
                </div>
                <h3 className="mt-3 text-[17px] font-semibold tracking-tight text-ink-100">{s.title}</h3>
                {s.body ? <p className="mt-2 text-sm leading-relaxed text-ink-400">{s.body}</p> : null}
              </li>
            ))}
          </ol>
        </Section>
      );

    case "stats":
      return (
        <Section title={b.heading}>
          <Card padding={32}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-4">
              {b.items.map((s) => (
                <StatBlock key={s.label} value={s.value} label={s.label} size="sm" />
              ))}
            </div>
          </Card>
        </Section>
      );

    case "quote": {
      const photo = mediaSrc(b.photo !== undefined ? media.get(key(b.photo)) : undefined, "thumb");
      return (
        <Section>
          <figure className="mx-auto max-w-[52rem] text-center">
            <blockquote className="display text-[clamp(1.6rem,3vw,2.4rem)] leading-snug text-balance text-ink-100">
              “{b.quote}”
            </blockquote>
            {b.name ? (
              <figcaption className="mt-6 flex items-center justify-center gap-3 text-[14px] text-ink-400">
                {photo ? (
                  <img src={photo.src} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
                ) : null}
                <span>
                  <span className="font-medium text-ink-200">{b.name}</span>
                  {b.role ? ` · ${b.role}` : null}
                </span>
              </figcaption>
            ) : null}
          </figure>
        </Section>
      );
    }

    case "image": {
      const item = media.get(key(b.image));
      const img = mediaSrc(item, "wide");
      if (!img || !item) return null;
      return (
        <Section>
          <figure>
            <img
              src={img.src}
              srcSet={mediaSrcSet(item)}
              sizes="100vw"
              width={img.width}
              height={img.height}
              alt={item.alt}
              loading="lazy"
              decoding="async"
              style={{ objectPosition: objectPosition(item) }}
              className="max-h-[36rem] w-full rounded-[2rem] object-cover"
            />
            {b.caption ?? item.caption ? (
              <figcaption className="mt-3 text-[13px] text-ink-500">{b.caption ?? item.caption}</figcaption>
            ) : null}
          </figure>
        </Section>
      );
    }

    case "faq":
      return (
        <Section title={b.heading}>
          <Faq jsonLd={false} items={b.items.map((f) => ({ q: f.question, a: f.answer }))} />
        </Section>
      );

    case "cta": {
      const href = SAFE_URL.test(b.href) ? b.href : "/contact/";
      return (
        <Section>
          <div className="cv-dark surface-dark grain flex flex-col items-start gap-6 !rounded-[2rem] p-8 md:flex-row md:items-end md:justify-between md:p-12">
            <div className="max-w-[44ch]">
              <h2 className="display text-3xl text-white md:text-4xl">{b.heading}</h2>
              {b.body ? <p className="mt-3 text-[15px] leading-relaxed text-white/60">{b.body}</p> : null}
            </div>
            <a
              href={href.startsWith("/") ? `${BASE}${href}` : href}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-medium text-zinc-900 transition-transform duration-300 hover:scale-[1.02]"
            >
              {b.label}
              <Icon name="arrow-right" size={16} />
            </a>
          </div>
        </Section>
      );
    }

    default:
      return null;
  }
}
