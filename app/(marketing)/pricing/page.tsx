import { Badge, ButtonLink, Card, Icon } from "@/components/ui";
import type { IconName } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import { Reveal, RevealGroup } from "@/components/fx/reveal";
import { FaqList } from "@/components/marketing/faq-list";
import { PricingTables } from "@/components/marketing/pricing-tables";
import { CATALOG } from "@/lib/catalog";
import { AVAILABLE_GPUS, EARLY_ACCESS, SOON_GPUS } from "@/lib/availability";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, faqJsonLd } from "@/components/seo/json-ld";

export const metadata = pageMetadata({
  title: "Pricing — Per-Second GPU Billing in Nepali Rupees",
  description:
    "How CoreValley bills GPU compute in Nepal: per second with a 60-second minimum, invoiced in NPR and paid by eSewa, Khalti, bank transfer or invoice. Enterprise early access on NVIDIA H200 is open now, with a firm quote within one working day.",
  path: "/pricing",
});

/* Rates are published only once they are commercially approved. While the
   catalogue's rates are placeholders (CATALOG.meta.pricingIsPlaceholder),
   the rate tables stay out of the page entirely: the public page explains
   how billing works and offers a firm quote instead. Flip the flag in
   lib/catalog.ts and the tables appear above the explainer. */
const SHOW_RATES = !CATALOG.meta.pricingIsPlaceholder;

const list = new Intl.ListFormat("en-GB", { style: "long", type: "conjunction" });
const short = (name: string) => name.replace(/^NVIDIA /, "");
const NOW = list.format(AVAILABLE_GPUS.map((s) => s.name));
const SOON = list.format(SOON_GPUS.map((s) => short(s.name)));

const METERS: { icon: IconName; title: string; unit: string; body: string }[] = [
  {
    icon: "slice",
    title: "GPU time",
    unit: "per second",
    body: "Pods and notebooks are metered from the moment they're running, with a 60-second minimum. Whole cards and slices each have their own rate.",
  },
  {
    icon: "broadcast",
    title: "Model endpoints",
    unit: "per token",
    body: "Input and output tokens are priced separately, and repeated prompt prefixes cost less.",
  },
  {
    icon: "node",
    title: "Dedicated servers",
    unit: "per month",
    body: "Reserved by the month, with lower rates for 6, 12 and 36-month terms.",
  },
  {
    icon: "storage",
    title: "Storage",
    unit: "per GB-month",
    body: "Volumes that outlive a pod, billed for the space you keep.",
  },
];

const NEVER: { title: string; body: string }[] = [
  {
    title: "Time in the queue",
    body: "The meter starts when your container is running, not when you press launch.",
  },
  {
    title: "Time after you stop",
    body: "Stop a pod and the meter stops with it. Nothing accrues after it ends.",
  },
  {
    title: "Hourly rounding",
    body: "After the 60-second minimum, you pay for the seconds you use.",
  },
  {
    title: "Exchange-rate spread",
    body: "Quoted, invoiced and paid in rupees. No USD card, no FX.",
  },
];

const PAY_WITH = ["eSewa", "Khalti", "Bank transfer", "Corporate invoice on net terms"];

const WAYS: {
  badge: string;
  tone: "hydro" | "info" | "neutral";
  title: string;
  body: string;
  bestFor: string;
}[] = [
  {
    badge: "whole card",
    tone: "hydro",
    title: "A whole card",
    body: "The entire GPU: all 141 GB on an H200. No neighbours, full speed.",
    bestFor: "Large training runs and production serving.",
  },
  {
    badge: "mig",
    tone: "info",
    title: "A hardware slice (MIG)",
    body: "A walled-off part of the card with its own memory and compute. A neighbour's crash can't reach you.",
    bestFor: "Fine-tuning and steady work that needs isolation.",
  },
  {
    badge: "hami",
    tone: "neutral",
    title: "A shared slice (HAMi)",
    body: "A share of a card's memory and compute. The cheapest way in, but you share the card, so it isn't fault-isolated.",
    bestFor: "Notebooks, experiments and light inference.",
  },
];

const COMPARISON: { aspect: string; buy: string; rent: string }[] = [
  { aspect: "Upfront cost", buy: "A large capital purchase", rent: "None" },
  {
    aspect: "Power, cooling, maintenance",
    buy: "Your responsibility",
    rent: "Included, on hydropower",
  },
  {
    aspect: "Time to first experiment",
    buy: "Weeks to months of procurement",
    rent: "Days, not months",
  },
  { aspect: "Scaling", buy: "Limited to what you own", rent: "Up or down as your work needs" },
  {
    aspect: "Technology refresh",
    buy: "You carry the obsolescence risk",
    rent: "New GPUs as they land",
  },
  { aspect: "Billing", buy: "Often USD, plus import duty", rent: "NPR, on local payment rails" },
  { aspect: "Support", buy: "Your own staff", rent: "Engineers in Kathmandu, on Nepal time" },
];

const INCLUDED: { title: string; body: string }[] = [
  {
    title: "A ready AI stack",
    body: "CUDA, PyTorch, TensorFlow, Jupyter, vLLM and DeepSpeed, installed from first boot.",
  },
  {
    title: "Help in Nepal time",
    body: "Engineers in Kathmandu who know the platform and the local context, working in Nepal time.",
  },
  {
    title: "Data that stays in Nepal",
    body: "Compute and storage stay in Kathmandu, so regulated and sensitive work stays in the country.",
  },
  {
    title: "A meter you can check",
    body: "Usage shows up as it accrues, and the same numbers appear on your invoice.",
  },
];

const FAQ = [
  {
    q: "When will you publish rates?",
    a: "Soon. We're finalising rates for general availability. Until then, every early-access customer gets a firm NPR quote within one working day, based on the workload you describe.",
  },
  {
    q: "Which GPUs can I get today?",
    a: `${NOW}, through enterprise early access. ${SOON} are coming soon.`,
  },
  {
    q: "Can I pay in NPR?",
    a: "Yes. Everything is quoted and invoiced in Nepali rupees. Pay by eSewa, Khalti, bank transfer or a corporate invoice on net terms.",
  },
  {
    q: "What's the difference between a hardware slice and a shared slice?",
    a: "A hardware slice (MIG) is a walled-off part of the GPU with its own memory and compute, so a neighbour's crash can't reach you. A shared slice (HAMi) shares the card in software. It packs more work onto each GPU, so it costs less, but it isn't fault-isolated.",
  },
  {
    q: "How precisely is GPU time billed?",
    a: "Per second, with a 60-second minimum per pod. The meter starts when your container is running and stops when you stop it. No hourly rounding, and nothing after it ends.",
  },
  {
    q: "Do you offer academic pricing?",
    a: "University access is coming soon. Early access is open to enterprises first; universities and labs can join the list now, and we'll be in touch when it opens.",
  },
  {
    q: "Is there a minimum commitment?",
    a: "No commitment for pods, notebooks or model endpoints: you pay for what you use. Dedicated servers are reserved for a term, and longer terms cost less.",
  },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(FAQ)} />
      <PageHero
        eyebrow="Pricing"
        title="Billed by the second, in rupees."
        lead="Rates for general availability are being finalised. Enterprise early access on NVIDIA H200 is open now — tell us your workload and we'll send a firm NPR quote within one working day."
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
          <ButtonLink
            href="/contact"
            variant="primary"
            size="lg"
            iconRight={<Icon name="arrow-right" size={17} />}
          >
            Get early access
          </ButtonLink>
          <a
            href="#billing"
            className="group inline-flex min-h-11 items-center gap-2 font-mono text-[13px] tracking-wide text-ink-300 transition-colors duration-normal hover:text-ink-100"
          >
            how billing works
            <Icon
              name="arrow-right"
              size={14}
              className="rotate-90 transition-transform duration-normal ease-out group-hover:translate-y-0.5"
            />
          </a>
        </div>
        <p className="mt-6 flex items-start gap-2.5 text-[13.5px] leading-relaxed text-ink-400">
          <span
            aria-hidden="true"
            className="mt-[7px] size-1.5 shrink-0 rounded-pill bg-hydro shadow-glow-sm"
          />
          <span>
            {NOW} available now. {SOON} coming soon.
          </span>
        </p>
      </PageHero>

      {SHOW_RATES ? (
        <Section>
          <PricingTables />
        </Section>
      ) : null}

      {/* ── How billing works ──────────────────────────────────────────── */}
      <Section
        eyebrow="How billing works"
        title="You pay for what runs. Nothing else."
        lead="Four things are metered. Everything is quoted, invoiced and paid in Nepali rupees."
      >
        <div id="billing" className="scroll-mt-28">
          <RevealGroup step={70} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METERS.map((m) => (
              <Card key={m.title} padding={24} className="h-full">
                <Icon name={m.icon} size={20} weight="duotone" className="text-ink-100" />
                <h3 className="mt-4 text-base font-semibold tracking-tight text-ink-100">
                  {m.title}
                </h3>
                <p className="mt-1 font-mono text-[12.5px] tracking-wide text-hydro">{m.unit}</p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-400">{m.body}</p>
              </Card>
            ))}
          </RevealGroup>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
            <Reveal>
              <Card surface="solid" padding={28} className="h-full">
                <h3 className="text-base font-semibold tracking-tight text-ink-100">
                  How you pay
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
                  In Nepali rupees, on the rails you already use. No dollar card and no
                  approval to pay a foreign provider.
                </p>
                <ul className="mt-5 grid gap-2.5">
                  {PAY_WITH.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-[14px] text-ink-200">
                      <Icon name="check" size={14} className="shrink-0 text-hydro" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
            <Reveal delay={80}>
              <Card surface="solid" padding={28} className="h-full">
                <h3 className="text-base font-semibold tracking-tight text-ink-100">
                  What you never pay for
                </h3>
                <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {NEVER.map((n) => (
                    <div key={n.title}>
                      <dt className="flex items-center gap-2 text-[14px] font-semibold text-ink-200">
                        <Icon name="x" size={13} className="shrink-0 text-danger" />
                        {n.title}
                      </dt>
                      <dd className="mt-1 pl-[21px] text-[13.5px] leading-relaxed text-ink-400">
                        {n.body}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Card>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* ── Three ways to rent a GPU ───────────────────────────────────── */}
      <Section
        eyebrow="Ways to rent a GPU"
        title="Pick the slice that fits the job."
        lead="Every option is billed by the second. The difference is how much of the card is yours."
        alt
      >
        <RevealGroup step={80} className="grid gap-4 md:grid-cols-3">
          {WAYS.map((w) => (
            <Card key={w.title} padding={26} className="flex h-full flex-col">
              <Badge tone={w.tone} className="self-start">
                {w.badge}
              </Badge>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink-100">{w.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-400">{w.body}</p>
              <p className="mt-auto border-t border-line-subtle pt-4 text-[13.5px] leading-relaxed text-ink-300">
                <span className="font-semibold text-ink-200">Best for: </span>
                {w.bestFor}
              </p>
            </Card>
          ))}
        </RevealGroup>
      </Section>

      {/* ── Rent vs buy ────────────────────────────────────────────────── */}
      <Section
        eyebrow="Rent vs buy"
        title="Why teams rent rather than buy."
        lead="Enterprise GPUs carry capital cost, power, cooling and maintenance. Renting removes all four, and the support comes from Kathmandu."
      >
        {/* Phones: one card per row of the comparison, so nothing scrolls
            sideways. Tablets and up: the table. */}
        <ul className="flex flex-col gap-3 md:hidden">
          {COMPARISON.map((c) => (
            <li key={c.aspect} className="rounded-lg border border-line bg-surface-card px-5 py-4">
              <p className="text-[15px] font-semibold text-ink-100">{c.aspect}</p>
              <p className="mt-2.5 flex items-start gap-2 text-[14px] text-ink-400">
                <Icon name="x" size={14} className="mt-[3px] shrink-0 text-danger" />
                <span>
                  <span className="sr-only">Buying hardware: </span>
                  {c.buy}
                </span>
              </p>
              <p className="mt-1.5 flex items-start gap-2 text-[14px] text-ink-200">
                <Icon name="check" size={14} className="mt-[3px] shrink-0 text-hydro" />
                <span>
                  <span className="sr-only">CoreValley: </span>
                  {c.rent}
                </span>
              </p>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto rounded-lg border border-line md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-carbon-800/60">
                <th className="cv-label px-5 py-3.5 text-left text-[10px]">
                  <span className="sr-only">Aspect</span>
                </th>
                <th className="cv-label px-5 py-3.5 text-left text-[10px]">Buying hardware</th>
                <th className="cv-label px-5 py-3.5 text-left text-[10px]">CoreValley</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((c) => (
                <tr key={c.aspect} className="border-t border-line-subtle">
                  <th scope="row" className="px-5 py-3.5 text-left text-sm font-semibold text-ink-200">
                    {c.aspect}
                  </th>
                  <td className="px-5 py-3.5">
                    <span className="flex items-start gap-2 text-[14px] text-ink-400">
                      <Icon name="x" size={14} className="mt-[3px] shrink-0 text-danger" />
                      {c.buy}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-start gap-2 text-[14px] text-ink-200">
                      <Icon name="check" size={14} className="mt-[3px] shrink-0 text-hydro" />
                      {c.rent}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── Always included ────────────────────────────────────────────── */}
      <Section eyebrow="Always included" title="In every plan." alt>
        <RevealGroup step={70} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INCLUDED.map((i) => (
            <Card key={i.title} padding={22} className="h-full">
              <Icon name="check-circle" size={20} weight="duotone" className="text-hydro" />
              <h3 className="mt-3.5 text-base font-semibold tracking-tight text-ink-100">
                {i.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-400">{i.body}</p>
            </Card>
          ))}
        </RevealGroup>
      </Section>

      {/* ── Questions ──────────────────────────────────────────────────── */}
      <Section eyebrow="Questions" title="Common questions.">
        <FaqList items={FAQ} />
      </Section>

      {/* ── Quote ──────────────────────────────────────────────────────── */}
      <Section>
        <Reveal kind="scale">
          <Card padding={40} className="text-center">
            <h2 className="display text-[clamp(1.6rem,3vw,2.1rem)]">Get an NPR quote.</h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-300">
              Tell us the GPU hours you expect, your model sizes and what you want to run.
              Within one working day you get a capacity plan and a firm price in rupees.
            </p>
            <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-ink-400">
              {EARLY_ACCESS.line}
            </p>
            <div className="mt-7 flex justify-center">
              <ButtonLink
                href="/contact"
                variant="primary"
                size="lg"
                iconRight={<Icon name="arrow-right" size={17} />}
              >
                Get early access
              </ButtonLink>
            </div>
          </Card>
        </Reveal>
      </Section>
    </>
  );
}
