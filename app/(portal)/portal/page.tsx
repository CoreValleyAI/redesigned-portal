import Link from "next/link";
import { Badge, ButtonLink, Icon } from "@/components/ui";
import {
  MetricTile,
  Panel,
  PlaceholderPricingBadge,
  PodStatusPill,
  PortalPageHeader,
  SectionHeading,
  SectionLink,
  TableScroll,
  Th,
  Tr,
  UtilBar,
} from "@/components/portal/primitives";
import { UsageChart } from "@/components/portal/usage-chart";
import { getClient } from "@/lib/api/client";
import { formatNpr } from "@/lib/money";
import { formatDuration } from "@/lib/format";
import { profileById, skuById } from "@/lib/catalog";
import { usageAt } from "@/lib/api/synthetic";
import { cn } from "@/lib/cn";

export const metadata = { title: "Overview" };

const delay = (ms: number) => ({ "--pt-d": `${ms}ms` }) as React.CSSProperties;

export default async function OverviewPage() {
  const cv = getClient();
  const [org, pods, spend, capacity, usage, audit, clusters] =
    await Promise.all([
      cv.getOrganization(),
      cv.listPods(),
      cv.getCurrentSpend(),
      cv.listCapacity(),
      cv.getUsageSeries({ meterIds: ["gpu_seconds"], window: "hour" }),
      cv.listAuditLog({ limit: 6 }),
      cv.listVClusters(),
    ]);

  const running = pods.filter((p) => p.status === "running");
  const gpusAllocated = running.reduce((a, p) => a + p.gpuCount, 0);
  const gpuSeries = usage[0];
  const readyClusters = clusters.filter((c) => c.status === "ready").length;

  return (
    <>
      <PortalPageHeader
        eyebrow="compute / overview"
        title="Overview"
        description={`${org.name} · ${org.tier} tier · np-ktm-1, Kathmandu`}
        actions={
          <ButtonLink
            href="/portal/pods/new"
            variant="primary"
            size="sm"
            mono
            iconLeft={<Icon name="plus" size={15} />}
          >
            launch pod
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          index={0}
          accent
          label="pods running"
          count={{ value: running.length }}
          unit={`/ ${pods.length}`}
          sub={`${gpusAllocated} GPUs allocated`}
        />
        <MetricTile
          index={1}
          label="spend month-to-date"
          count={{ value: Math.round(spend.totalPaisa / 100), prefix: "NPR " }}
          sub={`projected ${formatNpr(spend.projectedTotalPaisa, { compact: true })}`}
        />
        <MetricTile
          index={2}
          label="gpu hours this cycle"
          count={{ value: Math.round((gpuSeries?.total ?? 0) / 3600) }}
          unit="h"
          sub="metered per second"
        />
        <MetricTile
          index={3}
          label="vclusters"
          count={{ value: readyClusters }}
          unit="ready"
          sub="all network-isolated"
        />
      </div>

      {spend.spendCapPaisa
        ? /* The bar is TONED BY THRESHOLD, not always green.
           It previously painted hydro at every value and clamped the width at
           100%, so an account 795% through its cap rendered as a full, healthy
           green bar — the single most misleading state this page can show.
           Green below 75, amber to 100, red past it; the figure itself is never
           clamped, only the bar's width. */
          (() => {
            const pct = (spend.totalPaisa / spend.spendCapPaisa) * 100;
            const over = pct >= 100;
            const near = pct >= 75;
            const barTone = over
              ? "bg-danger shadow-[0_0_10px_rgb(var(--danger-rgb)/0.45)] light:shadow-none"
              : near
                ? "bg-warning"
                : "bg-hydro";
            return (
              <Panel padding={20} className="pt-in mt-4" style={delay(280)}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Icon
                      name={over ? "warning" : "cost"}
                      size={16}
                      className={over ? "text-danger" : "text-ink-400"}
                    />
                    <span className="text-[14px] font-semibold tracking-tight text-ink-100">
                      Spend cap{" "}
                      <span className="nums font-mono font-medium">
                        {formatNpr(spend.spendCapPaisa, { compact: true })}
                      </span>
                    </span>
                    <PlaceholderPricingBadge />
                  </div>
                  <span
                    className={cn(
                      "nums font-mono text-[12px]",
                      over
                        ? "text-danger"
                        : near
                          ? "text-warning"
                          : "text-ink-500",
                    )}
                  >
                    {Math.round(pct)}% used{over ? " · over cap" : ""}
                  </span>
                </div>
                <div className="mt-3.5 h-1.5 overflow-hidden rounded-pill bg-carbon-500">
                  <div
                    className={cn("pt-bar h-full rounded-pill", barTone)}
                    style={{ width: `${Math.min(100, pct)}%`, ...delay(420) }}
                  />
                </div>
              </Panel>
            );
          })()
        : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Panel padding={24} className="pt-in" style={delay(340)}>
          <UsageChart
            label="gpu-seconds · last 24h"
            unit={gpuSeries?.unit}
            points={gpuSeries?.points ?? []}
            live
          />
        </Panel>

        <Panel padding={0} className="pt-in" style={delay(400)}>
          <div className="flex items-center gap-2.5 border-b border-line-subtle px-5 py-4">
            <span className="flex size-7 items-center justify-center rounded-md border border-line bg-carbon-600 text-hydro">
              <Icon name="cpu" size={14} />
            </span>
            <span className="text-[14px] font-semibold tracking-tight text-ink-100">Capacity</span>
            <span className="ml-auto font-mono text-[10.5px] tracking-wide text-hydro">np-ktm-1</span>
          </div>
          {capacity.map((c, i) => {
            const sku = skuById(c.skuId);
            const pct = Math.round((c.allocatedGpus / c.totalGpus) * 100);
            return (
              <div
                key={c.skuId}
                className={`px-5 py-4 ${i > 0 ? "border-t border-line-subtle" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[13px] font-medium text-ink-100">
                    {sku.shortName}
                    <span className="ml-2 text-[11px] font-normal text-ink-500">
                      {sku.memoryGb} GB
                    </span>
                  </span>
                  <span className="nums font-mono text-[12px] text-ink-500">
                    <span className="text-ink-200">{c.allocatedGpus}</span>/{c.totalGpus} GPUs
                  </span>
                </div>
                <div className="mt-2.5">
                  <UtilBar value={pct} width={180} delay={500 + i * 120} />
                </div>
              </div>
            );
          })}
        </Panel>
      </div>

      <section className="mt-10">
        <SectionHeading aside={<SectionLink href="/portal/pods">all pods</SectionLink>}>
          Active pods
        </SectionHeading>

        <TableScroll>
          <thead>
            <tr>
              <Th>name</Th>
              <Th>slice</Th>
              <Th>status</Th>
              <Th>utilisation</Th>
              <Th>uptime</Th>
              <Th align="right">cost to date</Th>
            </tr>
          </thead>
          <tbody>
            {pods.slice(0, 6).map((pod, i) => {
              const profile = profileById(pod.profileId);
              const sku = skuById(pod.skuId);
              const util =
                pod.status === "running"
                  ? Math.round(usageAt(pod.id, "telemetry", 3) * 96)
                  : 0;
              return (
                <Tr key={pod.id} index={i}>
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/portal/pods/${pod.id}`}
                      className="font-mono text-[13px] font-medium text-ink-100 transition-colors duration-fast hover:text-hydro"
                    >
                      {pod.name}
                    </Link>
                    <div className="mt-0.5 font-mono text-[11px] text-ink-500">
                      {pod.id}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-[12.5px] text-ink-300">
                      {pod.gpuCount > 1 ? `${pod.gpuCount}x ` : ""}
                      {sku.shortName} · {profile.label}
                    </span>
                    <div className="mt-0.5">
                      <span className="font-mono text-[10.5px] text-ink-500">
                        {profile.isolation}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <PodStatusPill status={pod.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <UtilBar value={util} delay={300 + i * 60} />
                  </td>
                  <td className="nums px-4 py-3.5 font-mono text-[12.5px] text-ink-400">
                    {formatDuration(pod.billableSeconds)}
                  </td>
                  <td className="nums px-4 py-3.5 text-right font-mono text-[12.5px] text-ink-100">
                    {formatNpr(pod.costToDatePaisa, { compact: true })}
                  </td>
                </Tr>
              );
            })}
          </tbody>
        </TableScroll>
      </section>

      <section className="mt-10">
        <SectionHeading aside={<SectionLink href="/portal/audit">audit log</SectionLink>}>
          Recent activity
        </SectionHeading>
        <Panel padding={0} className="pt-in">
          {audit.map((entry, i) => (
            <div
              key={entry.id}
              className={`pt-in flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 ${
                i > 0 ? "border-t border-line-subtle" : ""
              }`}
              style={delay(200 + i * 50)}
            >
              <span
                className={cn(
                  "size-1.5 rounded-pill",
                  entry.outcome === "success" ? "bg-hydro" : "bg-danger",
                )}
                aria-hidden="true"
              />
              <span className="font-mono text-[12.5px] font-medium text-ink-100">
                {entry.action}
              </span>
              <span className="text-[13px] text-ink-400">
                {entry.actorName}
              </span>
              <span className="font-mono text-[11.5px] text-ink-500">
                {entry.resourceId}
              </span>
              <span className="ml-auto flex items-center gap-3">
                {entry.outcome !== "success" ? (
                  <Badge tone="danger">{entry.outcome}</Badge>
                ) : null}
                <span className="font-mono text-[11px] text-ink-500">
                  {entry.sourceIp}
                </span>
              </span>
            </div>
          ))}
        </Panel>
      </section>
    </>
  );
}
