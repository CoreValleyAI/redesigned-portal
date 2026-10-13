/**
 * The careers page's drag-and-drop sections, in the site's own design.
 * Isomorphic (no hooks, no fs) so the live preview renders them too.
 */
import * as React from "react";
import { buttonClasses, Arrow } from "@/components/system/button";
import { Faq } from "@/components/system/faq";
import { Metric } from "@/components/system/metric";
import { TitledSection as Section } from "@/components/system/page-hero";
import { mediaSrc, mediaSrcSet, objectPosition } from "@/lib/content/format";
import { key, type LayoutBlock, type MediaItem } from "@/lib/content/types";
import { RichText } from "./rich-text";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SAFE_URL = /^(\/(?!\/)|https?:\/\/|mailto:)/i;

export function LayoutBlocks({ blocks, media }: { blocks: LayoutBlock[]; media: Map<string, MediaItem> }) {
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {b.items.map((it, i) => (
              <div
                key={it.title}
                data-reveal
                style={{ "--i": i % 3 } as React.CSSProperties}
                className="flex h-full flex-col gap-3 rounded-panel border border-line bg-bg-raised p-6 md:p-7"
              >
                <span aria-hidden="true" className="type-kicker text-hydro-ink tabular-nums light:text-hydro">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="type-title-3">{it.title}</h3>
                <p className="type-small text-ink-2">{it.body}</p>
              </div>
            ))}
          </div>
        </Section>
      );

    case "benefitsList":
      return (
        <Section title={b.heading} lead={b.intro} alt={index % 2 === 1}>
          <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {b.items.map((it) => (
              <li key={it.title} className="flex gap-3.5">
                <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-hydro" />
                <div>
                  <p className="type-body font-medium text-ink">{it.title}</p>
                  {it.body ? <p className="type-small mt-1 text-ink-2">{it.body}</p> : null}
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
              <li key={s.title} className="rounded-panel border border-line bg-bg-raised p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="type-kicker text-hydro-ink tabular-nums light:text-hydro">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.duration ? <span className="type-caption font-mono text-ink-3">{s.duration}</span> : null}
                </div>
                <h3 className="type-title-3 mt-3">{s.title}</h3>
                {s.body ? <p className="type-small mt-2 text-ink-2">{s.body}</p> : null}
              </li>
            ))}
          </ol>
        </Section>
      );

    case "stats":
      return (
        <Section title={b.heading}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 md:grid-cols-4">
            {b.items.map((s) => (
              <Metric key={s.label} value={s.value} caption={s.label} size="title-1" />
            ))}
          </div>
        </Section>
      );

    case "quote": {
      const photo = mediaSrc(b.photo !== undefined ? media.get(key(b.photo)) : undefined, "thumb");
      return (
        <Section>
          <figure className="mx-auto max-w-[52rem] text-center">
            <blockquote className="type-title-1 text-balance">“{b.quote}”</blockquote>
            {b.name ? (
              <figcaption className="type-small mt-6 flex items-center justify-center gap-3 text-ink-2">
                {photo ? (
                  <img src={photo.src} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
                ) : null}
                <span>
                  <span className="font-medium text-ink">{b.name}</span>
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
              className="max-h-[36rem] w-full rounded-panel object-cover"
            />
            {(b.caption ?? item.caption) ? (
              <figcaption className="type-caption mt-3 text-ink-3">{b.caption ?? item.caption}</figcaption>
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
          <div className="flex flex-col items-start gap-6 rounded-panel border border-line bg-bg-sunken p-8 md:flex-row md:items-end md:justify-between md:p-12">
            <div className="flex max-w-[44ch] flex-col gap-3">
              <h2 className="type-title-1">{b.heading}</h2>
              {b.body ? <p className="type-body text-ink-2">{b.body}</p> : null}
            </div>
            <a href={href.startsWith("/") ? `${BASE}${href}` : href} className={buttonClasses("primary", "lg")}>
              {b.label}
              <Arrow />
            </a>
          </div>
        </Section>
      );
    }

    default:
      return null;
  }
}
