# NPR payments

How CoreValley meters usage, produces invoices and accepts payment — in Nepali rupees, through the rails you already use.

!!! info "In progress"
    Billing reference content is being written, and rates are not published yet. During early access every customer gets a firm NPR quote and a capacity plan within one working day — contact [info@corevalley.ai](mailto:info@corevalley.ai).

## What we can say today

- **Currency** — everything is quoted and invoiced in Nepali rupees. No USD invoices, no exchange-rate spread.
- **Metering** — GPU time is metered per second, with a 60-second minimum per pod. Nothing is charged while a pod waits in the queue, and the meter stops when you stop the pod.
- **Payment methods** — eSewa, Khalti, bank transfer, and corporate invoices on net terms.

## What this page will cover

- **Metering in detail** — per-second metering for pods and dedicated servers, per-user-hour for notebooks, per-token for shared endpoints, and where to read usage as it accrues.
- **Invoices** — the monthly invoice in NPR, VAT, and how invoice lines reconcile with the usage screens.
- **Commitments** — on-demand versus monthly reserved and custom enterprise terms.
- **Academic and cohort pricing** — how institutions and courses will be billed once access opens to them.
- **Spend controls** — caps, alerts and what happens when a cap is reached.

## Related

- [How billing works](https://corevalley.ai/pricing/)
- [Quickstart](../guides/quickstart.md)
- [SLA & contact](../support/sla-and-contact.md)
