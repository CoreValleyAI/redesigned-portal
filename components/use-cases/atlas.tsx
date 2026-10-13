"use client";

/**
 * The use-case atlas (S16, first form): every story as a card with its own
 * contour print, filterable by the product it runs on. Each card is an
 * anchor (#slug) so the home page can link straight to a story. Filtering
 * uses a view transition where the browser has one, so cards glide into
 * their new places instead of jumping.
 */
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ContourCover } from "@/components/art/contour-cover";
import { AppLink } from "@/components/system/app-link";
import { PRODUCTS, type ProductSlug } from "@/copy/en/products";
import type { UseCase } from "@/copy/en/use-cases";
import { cn } from "@/lib/cn";

export function Atlas({ cases }: { cases: UseCase[] }) {
  const [filter, setFilter] = useState<ProductSlug | "all">("all");
  const listRef = useRef<HTMLUListElement>(null);
  const shown = filter === "all" ? cases : cases.filter((c) => c.runsOn.includes(filter));

  const choose = (f: ProductSlug | "all") => {
    const update = () => flushSync(() => setFilter(f));
    const list = listRef.current;
    if (list && document.startViewTransition && document.documentElement.dataset.motion !== "reduce") {
      // Cards get transition names only for this filter change (see
      // .atlas-cards in app/styles/motion.css), so page navigations are
      // not affected.
      list.dataset.vt = "on";
      document.startViewTransition(update).finished.finally(() => {
        delete list.dataset.vt;
      });
    } else update();
  };

  return (
    <div className="flex flex-col gap-10">
      <div
        role="radiogroup"
        aria-label="Filter by product"
        className="-mx-[var(--page-x)] flex gap-2 overflow-x-auto px-[var(--page-x)] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {[{ slug: "all" as const, name: "All stories" }, ...PRODUCTS].map((p) => (
          <button
            key={p.slug}
            type="button"
            role="radio"
            aria-checked={filter === p.slug}
            onClick={() => choose(p.slug)}
            className={cn(
              "type-small h-10 shrink-0 rounded-pill border px-4 font-medium transition-[background-color,border-color,color,transform] duration-[var(--dur-spring-snappy)] ease-spring active:scale-[0.97]",
              filter === p.slug
                ? "border-ink bg-ink text-bg"
                : "border-line text-ink-2 hover:border-line-strong hover:text-ink",
            )}
          >
            {p.name}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="sr-only">
        {shown.length} stories shown
      </p>

      <ul ref={listRef} className="atlas-cards grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((u) => (
          <li key={u.slug} id={u.slug} className="scroll-mt-[calc(var(--header-h)+1.5rem)]">
            <article className="flex h-full flex-col overflow-hidden rounded-panel border border-line bg-bg-raised target:border-hydro">
              <ContourCover seed={u.slug} className="aspect-[16/9] w-full" />
              <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
                <p className="type-kicker text-ink-3">{u.sector}</p>
                <h3 className="type-title-3">{u.title}</h3>
                <p className="type-body text-ink">
                  <span
                    className={cn(
                      !u.verified && "underline decoration-warn decoration-dotted decoration-2 underline-offset-4",
                    )}
                    title={u.verified ? undefined : "To verify before launch"}
                  >
                    {u.fact}
                  </span>{" "}
                  <span className="type-caption text-ink-3">
                    —{" "}
                    {u.source.url ? (
                      <a
                        href={u.source.url}
                        className="underline decoration-line-strong underline-offset-2 hover:text-ink"
                      >
                        {u.source.name}
                      </a>
                    ) : (
                      u.source.name
                    )}
                  </span>
                </p>
                <dl className="flex flex-col gap-3 border-t border-line pt-4">
                  <div>
                    <dt className="type-kicker text-ink-3">What AI does</dt>
                    <dd className="type-small mt-1 text-ink-2">{u.ai}</dd>
                  </div>
                  <div>
                    <dt className="type-kicker text-ink-3">Why in Nepal</dt>
                    <dd className="type-small mt-1 text-ink-2">{u.why}</dd>
                  </div>
                  <div>
                    <dt className="type-kicker text-ink-3">Built for</dt>
                    <dd className="type-small mt-1 text-ink-2">{u.who}</dd>
                  </div>
                </dl>
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {u.runsOn.map((slug) => {
                    const p = PRODUCTS.find((x) => x.slug === slug)!;
                    return (
                      <li key={slug}>
                        <AppLink
                          href={`/products/${slug}`}
                          className="type-caption inline-flex rounded-pill bg-bg-sunken px-3 py-1.5 text-ink-2 transition-colors hover:text-ink"
                        >
                          {p.name}
                        </AppLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
