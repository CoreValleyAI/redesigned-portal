/**
 * Breadcrumbs for pages two levels deep (03 §2): a quiet mono line above
 * the title, plus BreadcrumbList JSON-LD. Links going up the hierarchy use
 * the "page-up" transition, so the page settles down instead of rising.
 */
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { cn } from "@/lib/cn";
import { absoluteUrl } from "@/lib/site";

export interface Crumb {
  href: string;
  label: string;
}

export function Breadcrumbs({ trail, className }: { trail: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("type-kicker text-ink-3", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-ink-2">
                  {c.label}
                </span>
              ) : (
                <>
                  <Link
                    href={c.href}
                    transitionTypes={["page-up"]}
                    className="rounded-[2px] transition-colors duration-[var(--dur-short)] hover:text-ink"
                  >
                    {c.label}
                  </Link>
                  <span aria-hidden="true" className="text-ink-4">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd
        data={{
          "@type": "BreadcrumbList",
          itemListElement: trail.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: absoluteUrl(c.href),
          })),
        }}
      />
    </nav>
  );
}
