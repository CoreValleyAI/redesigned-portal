import { Icon } from "@/components/ui";
import { RevealGroup } from "@/components/fx/reveal";

/**
 * Click-to-open questions, one column. Used on the company and use-cases
 * pages so both look and behave the same.
 *
 * Native <details>: keyboard and screen-reader accessible with no script,
 * and every answer stays in the HTML for search engines. The open/close
 * height animation is CSS (`.faq` in app/theme.css).
 */
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <RevealGroup step={60} className="mx-auto flex max-w-[52rem] flex-col gap-3">
      {items.map((f) => (
        <details key={f.q} className="faq group rounded-xl border border-line bg-surface-card shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 md:px-7 md:py-6">
            <h3 className="text-lg font-semibold tracking-tight text-ink-100 md:text-[1.2rem]">{f.q}</h3>
            <span className="faq__icon inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-300">
              <Icon name="plus" size={15} />
            </span>
          </summary>
          <p className="px-6 pb-6 text-[15.5px] leading-relaxed text-ink-400 md:px-7 md:pb-7 md:text-base">
            {f.a}
          </p>
        </details>
      ))}
    </RevealGroup>
  );
}
