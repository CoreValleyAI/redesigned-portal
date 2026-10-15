/**
 * One offering in the /products catalogue (Run · Build · Scale): its dot
 * glyph and service-model tag, a one-line promise, what is included and
 * where to read more. A pane of liquid glass; wide items span two columns
 * and set their inclusions in two.
 */
import { DotGlyph } from "@/components/system/dot-glyph";
import { TextLink } from "@/components/system/text-link";
import type { CatalogItem } from "@/copy/en/products";
import { cn } from "@/lib/cn";

export function CatalogCard({ item, i }: { item: CatalogItem; i: number }) {
  return (
    <li
      id={item.id}
      className={cn(
        "lg lg-card group flex scroll-mt-[calc(var(--header-h)+1.5rem)] flex-col gap-7 rounded-panel p-6 md:p-7",
        item.wide && "lg:col-span-2",
      )}
      data-reveal
      style={{ "--i": i % 3 } as React.CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <DotGlyph name={item.glyph} className="size-10" />
        {item.tag && (
          <span className="type-kicker rounded-pill bg-hydro-wash px-2.5 py-1 normal-case text-hydro-ink light:text-hydro">
            {item.tag}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="type-title-3 text-ink">{item.name}</h3>
        <p className={cn("type-small text-ink-2", item.wide && "max-w-[46ch]")}>{item.line}</p>
      </div>
      <ul className={cn("grid gap-x-8 gap-y-2.5 border-t border-line pt-5", item.wide && "sm:grid-cols-2")}>
        {item.includes.map((inc) => (
          <li key={inc} className="type-small flex items-baseline gap-3 text-ink-2">
            <span aria-hidden="true" className="size-1.5 shrink-0 translate-y-[-0.15rem] rounded-full bg-hydro" />
            {inc}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-1">
        {item.links.map((l) => (
          <TextLink key={l.href} href={l.href} arrow className="type-small">
            {l.label}
          </TextLink>
        ))}
      </div>
    </li>
  );
}
