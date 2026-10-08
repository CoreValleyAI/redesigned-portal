import Link from "next/link";
import { Badge, ButtonLink, Card, Icon } from "@/components/ui";
import { PageHero, Section } from "@/components/marketing/page-hero";
import { PRODUCTS } from "@/lib/products";
import { GPU_SKUS } from "@/lib/catalog";
import { AVAILABLE_GPUS, EARLY_ACCESS, SOON_GPUS, statusLabel } from "@/lib/availability";
import { RevealGroup } from "@/components/fx/reveal";
import { pageMetadata } from "@/lib/seo";
import type { GpuSku } from "@/lib/api/types";

export const metadata = pageMetadata({
  title: "GPU Cloud Products — GPU Pods, JupyterHub, Model Endpoints, Dedicated Servers",
  description:
    "Four ways to use NVIDIA H200 GPUs in Kathmandu: per-second GPU pods, managed JupyterHub notebooks, OpenAI-compatible model endpoints and dedicated servers. Billed in NPR, with data that stays in Nepal. Blackwell coming soon.",
  path: "/products",
});

const list = new Intl.ListFormat("en-GB", { style: "long", type: "conjunction" });
const NOW = list.format(AVAILABLE_GPUS.map((s) => s.name));
const SOON = list.format(SOON_GPUS.map((s) => s.name.replace(/^NVIDIA /, "")));

/** How a card can be rented, in plain words. */
const waysToRent = (s: GpuSku) => (s.migCapable ? "whole card or slices" : "whole card");

function StatusBadge({ sku }: { sku: GpuSku }) {
  return sku.status === "available" ? (
    <Badge tone="hydro">
      {statusLabel(sku)}
    </Badge>
  ) : (
    <Badge tone="neutral">{statusLabel(sku)}</Badge>
  );
}

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Four ways to use a GPU."
        lead="One account and one rupee invoice for all of them. Start on a slice of an H200, move to whole cards, serve your model as an API or reserve a server of your own — without changing provider, currency or country."
      >
        {/* What is on offer, read before the button that acts on it. */}
        <p className="mt-6 max-w-[62ch] text-[14px] leading-relaxed text-ink-300">
          {EARLY_ACCESS.line} We reply {EARLY_ACCESS.replyTime}.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-4">
          <ButtonLink
            href="/contact"
            variant="primary"
            size="lg"
            iconRight={<Icon name="arrow-right" size={17} />}
          >
            Get early access
          </ButtonLink>
          <Link
            href="/pricing"
            className="group inline-flex min-h-11 items-center gap-2 text-[14px] font-medium text-ink-300 transition-colors duration-300 hover:text-ink-100"
          >
            How billing works
            <Icon
              name="arrow-right"
              size={14}
              className="transition-transform duration-normal ease-out group-hover:translate-x-1"
            />
          </Link>
        </div>
      </PageHero>

      <Section>
        <RevealGroup step={90} className="grid gap-4 md:grid-cols-2">
          {PRODUCTS.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="group">
              <Card
                padding={28}
                className="flex h-full flex-col transition-[border-color,transform] duration-normal ease-standard group-hover:-translate-y-px group-hover:border-line-strong"
              >
                <span className="inline-flex self-start rounded-lg border border-line bg-carbon-600 p-2.5">
                  <Icon name={p.icon} size={20} weight="duotone" className="text-ink-100" />
                </span>
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink-100">
                  {p.name}
                </h2>
                <p className="mt-1 text-[15px] font-medium text-ink-200">{p.tagline}</p>
                <p className="mt-3 text-[14.5px] leading-relaxed text-ink-400">{p.summary}</p>
                <div className="mt-auto pt-5">
                  <div className="flex items-center justify-between gap-4 border-t border-line-subtle pt-4">
                    <span className="font-mono text-[11.5px] tracking-wide text-ink-500">
                      {p.meta}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-ink-300 transition-colors duration-300 group-hover:text-ink-100">
                      Learn more
                      <Icon
                        name="arrow-right"
                        size={14}
                        className="transition-transform duration-normal ease-out group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </RevealGroup>
      </Section>

      <Section
        id="hardware"
        eyebrow="Hardware"
        title="What the pods and servers run on."
        lead={`${NOW} today. ${SOON} coming soon.`}
      >
        {/* Phones: a card per GPU, so nothing scrolls sideways. */}
        <ul className="flex flex-col gap-3 md:hidden">
          {GPU_SKUS.map((s) => (
            <li key={s.id} className="rounded-lg border border-line bg-surface-card px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[15px] font-semibold text-ink-100">{s.name}</p>
                <StatusBadge sku={s} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                <div>
                  <dt className="text-[12px] text-ink-500">Memory</dt>
                  <dd className="font-mono text-[13px] text-ink-200">
                    {s.memoryGb} GB {s.memoryType}
                  </dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-500">Memory speed</dt>
                  <dd className="font-mono text-[13px] text-ink-200">{s.bandwidth}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-500">Generation</dt>
                  <dd className="font-mono text-[13px] text-ink-300">{s.architecture}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-500">Ways to rent</dt>
                  <dd className="text-[13.5px] text-ink-300">{waysToRent(s)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto rounded-lg border border-line md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-carbon-800/60">
                {["GPU", "Generation", "Memory", "Memory speed", "Ways to rent", "Status"].map(
                  (h) => (
                    <th key={h} className="cv-label px-4 py-3 text-left text-[10px]">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {GPU_SKUS.map((s) => (
                <tr key={s.id} className="border-t border-line-subtle">
                  <th
                    scope="row"
                    className="px-4 py-3.5 text-left text-sm font-semibold text-ink-100"
                  >
                    {s.name}
                  </th>
                  <td className="px-4 py-3.5 font-mono text-[13px] text-ink-400">
                    {s.architecture}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[13px] text-ink-300">
                    {s.memoryGb} GB {s.memoryType}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[13px] text-ink-400">{s.bandwidth}</td>
                  <td className="px-4 py-3.5 text-[13.5px] text-ink-400">{waysToRent(s)}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge sku={s} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
