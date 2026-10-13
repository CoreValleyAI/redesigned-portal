/**
 * FAQ — native <details> elements, so they work without script and with
 * find-in-page. The answer's height animates where the browser supports
 * ::details-content (see app/styles/motion.css); elsewhere it opens at once.
 * Emits FAQPage JSON-LD only where the page owns the topic (03 §3).
 */
import { JsonLd } from "@/components/seo/json-ld";
import { cn } from "@/lib/cn";

export interface QA {
  q: string;
  a: string;
}

export function Faq({
  items,
  className,
  jsonLd = true,
}: {
  items: QA[];
  className?: string;
  jsonLd?: boolean;
}) {
  return (
    <div className={cn("border-t border-line", className)}>
      {items.map((item) => (
        <details key={item.q} name="faq" className="faq group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
            <span className="type-title-3 font-medium">{item.q}</span>
            <span
              aria-hidden="true"
              className="relative grid size-8 shrink-0 place-items-center rounded-full border border-line transition-colors duration-[var(--dur-short)] group-hover:border-line-strong"
            >
              <span className="absolute h-px w-3 bg-ink" />
              <span className="absolute h-3 w-px bg-ink transition-transform duration-[var(--dur-spring-snappy)] ease-spring group-open:scale-y-0" />
            </span>
          </summary>
          <p className="type-body measure pb-6 text-ink-2">{item.a}</p>
        </details>
      ))}
      {jsonLd && (
        <JsonLd
          data={{
            "@type": "FAQPage",
            mainEntity: items.map((i) => ({
              "@type": "Question",
              name: i.q,
              acceptedAnswer: { "@type": "Answer", text: i.a },
            })),
          }}
        />
      )}
    </div>
  );
}
