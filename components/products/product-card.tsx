/**
 * A product card: the dot glyph (which morphs into the product page's hero
 * glyph through a shared view transition), the name, the promise and what
 * it is best for. The whole card is the link.
 */
import { ViewTransition } from "react";
import { AppLink } from "@/components/system/app-link";
import { Arrow } from "@/components/system/button";
import { DotGlyph } from "@/components/system/dot-glyph";
import type { Product } from "@/copy/en/products";
import { cn } from "@/lib/cn";

export function ProductCard({
  product,
  detail = false,
  highlight = false,
  morph = true,
  className,
}: {
  product: Product;
  /** Also show "best for" and the billing line. */
  detail?: boolean;
  highlight?: boolean;
  /** Share the glyph with the product page (only one card per product per page may). */
  morph?: boolean;
  className?: string;
}) {
  const glyph = <DotGlyph name={product.glyph} className="size-11" on={highlight} />;
  return (
    <AppLink
      href={`/products/${product.slug}`}
      className={cn(
        "group flex h-full flex-col gap-10 rounded-panel border bg-bg-raised p-6 transition-[border-color,background-color,transform,box-shadow] duration-[var(--dur-spring-smooth)] ease-spring hover:-translate-y-0.5 md:p-7 dark:hover:bg-bg-elevated",
        highlight ? "border-hydro shadow-[0_0_0_1px_var(--hydro)]" : "border-line hover:border-line-strong",
        className,
      )}
    >
      {morph ? (
        <ViewTransition name={`product-glyph-${product.slug}`} share="morph" default="none">
          {glyph}
        </ViewTransition>
      ) : (
        glyph
      )}
      <span className="mt-auto flex flex-col gap-2">
        <span className="type-title-3 flex items-center justify-between gap-3 text-ink">
          {product.name}
          <Arrow className="text-ink-3 transition-transform duration-[var(--dur-spring-snappy)] ease-spring group-hover:translate-x-1 group-hover:text-ink" />
        </span>
        <span className="type-small text-ink-2">{product.promise}</span>
        {detail && (
          <span className="mt-3 flex flex-col gap-1 border-t border-line pt-4">
            <span className="type-caption text-ink-3">
              <span className="text-ink-2">Best for</span> · {product.bestFor}
            </span>
            <span className="type-caption text-ink-3">
              <span className="text-ink-2">Billing</span> · {product.billing}
            </span>
          </span>
        )}
      </span>
    </AppLink>
  );
}
