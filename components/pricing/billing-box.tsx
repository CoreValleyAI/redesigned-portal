/**
 * How billing works, at a glance: four plain facts and the honest state of
 * the rates, with the way to a quote. It stands where a pricing summary is
 * wanted (home, /pricing, the on-demand product page); every value comes
 * from lib/facts.ts.
 */
import { ButtonLink } from "@/components/system/button";
import { TextLink } from "@/components/system/text-link";
import { cn } from "@/lib/cn";
import { v } from "@/lib/facts";

const CELLS = [
  {
    value: v("billing.unit"),
    label: "Billing",
    body: "GPU time and MIG slices are metered by the second they run.",
  },
  {
    value: "60 s",
    label: "Minimum",
    body: `${v("billing.minimum")} per run. Nothing is rounded up to the hour.`,
  },
  {
    value: "NPR",
    label: "Currency",
    body: "Invoiced in Nepalese rupees, so there is no exchange-rate margin.",
  },
  {
    value: "eSewa · Khalti",
    label: "Ways to pay",
    body: "Or bank transfer and invoice. VAT at the statutory rate.",
  },
] as const;

export function BillingBox({ className, more = false }: { className?: string; more?: boolean }) {
  return (
    <div data-refract data-refract-bezel="20" className={cn("lg overflow-hidden rounded-panel", className)}>
      <dl className="grid sm:grid-cols-2 lg:grid-cols-4">
        {CELLS.map((c, i) => (
          <div
            key={c.label}
            className={cn(
              "flex flex-col gap-3 border-line p-6 md:p-7",
              i > 0 && "border-t sm:border-t-0",
              i % 2 === 1 && "sm:border-l",
              i >= 2 && "sm:border-t lg:border-t-0",
              i === 2 && "lg:border-l",
            )}
            data-reveal
            style={{ "--i": i } as React.CSSProperties}
          >
            <dt className="type-kicker text-ink-3">{c.label}</dt>
            <dd className="flex flex-col gap-2">
              <span className="type-title-2 text-ink">{c.value}</span>
              <span className="type-small text-ink-2">{c.body}</span>
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-4 border-t border-line px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-7">
        <p className="type-small text-ink-2">
          <span className="font-semibold text-ink">Rates are {v("billing.rates").toLowerCase()}.</span> Every request
          gets a firm quote in rupees {v("contact.reply").toLowerCase()}.
        </p>
        <div className="flex shrink-0 items-center gap-5">
          {more ? (
            <TextLink href="/pricing" arrow>
              How billing works
            </TextLink>
          ) : null}
          <ButtonLink href="/pricing#quote" size="md">
            Get a quote
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
