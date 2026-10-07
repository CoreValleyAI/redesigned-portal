import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Icon } from "@/components/ui";
import {
  Panel,
  PlaceholderPricingBadge,
  PortalPageHeader,
  SectionHeading,
} from "@/components/portal/primitives";
import { PodLivePanel } from "@/components/portal/pod-live";
import { UsageChart } from "@/components/portal/usage-chart";
import { getClient } from "@/lib/api/client";
import { formatNpr } from "@/lib/money";
import { formatDateTime } from "@/lib/format";
import { profileById, skuById } from "@/lib/catalog";

export const metadata = { title: "Pod" };

export function generateStaticParams() {
  return [
    { id: "pod_9f3a21" },
    { id: "pod_7b1c40" },
    { id: "pod_3a8d77" },
    { id: "pod_1e5f09" },
    { id: "pod_6c2b13" },
    { id: "pod_2d9a55" },
  ];
}

export default async function PodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cv = getClient();

  const pod = await cv.getPod(id).catch(() => null);
  if (!pod) notFound();

  const [logs, telemetrySeries, projects] = await Promise.all([
    cv.getPodLogs(pod.id, 24),
    cv.getPodTelemetrySeries(pod.id, 60),
    cv.listProjects(),
  ]);

  const profile = profileById(pod.profileId);
  const sku = skuById(pod.skuId);
  const project = projects.find((p) => p.id === pod.projectId);

  return (
    <>
      <Link
        href="/portal/pods"
        className="group mb-5 inline-flex items-center gap-1.5 font-mono text-[12px] tracking-wide text-ink-500 transition-colors duration-fast hover:text-hydro"
      >
        <Icon name="caret-right" size={12} className="rotate-180 transition-transform duration-normal ease-out group-hover:-translate-x-0.5" />
        all pods
      </Link>

      <PortalPageHeader
        eyebrow="compute / pods"
        mono
        title={pod.name}
        description={`${pod.id} · ${project?.name ?? "no project"} · ${pod.regionId}`}
      />

      <PodLivePanel initial={pod} />

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <Panel padding={24} className="pt-in" style={{ "--pt-d": "320ms" } as React.CSSProperties}>
          <UsageChart
            label="gpu utilisation · last 60 min"
            unit="%"
            points={telemetrySeries}
            live={pod.status === "running"}
          />
        </Panel>

        <Panel padding={0} className="pt-in" style={{ "--pt-d": "380ms" } as React.CSSProperties}>
          <div className="flex items-center justify-between border-b border-line-subtle px-5 py-4">
            <span className="text-[14px] font-semibold tracking-tight text-ink-100">Configuration</span>
            <Badge
              tone={
                profile.isolation === "exclusive"
                  ? "hydro"
                  : profile.isolation === "mig"
                    ? "info"
                    : "neutral"
              }
            >
              {profile.isolation}
            </Badge>
          </div>
          <dl>
            {[
              ["GPU", `${pod.gpuCount > 1 ? `${pod.gpuCount}x ` : ""}${sku.name}`],
              ["Slice", `${profile.label} · ${profile.gpuMemoryGb} GB`],
              ["Compute share", `${profile.computePercent}%`],
              ["Fault isolated", profile.faultIsolated ? "yes" : "no — shared card"],
              ["vCPU / RAM", `${profile.vcpus} · ${profile.systemMemoryGb} GB`],
              ["Image", pod.image],
              ["vCluster", pod.vclusterId],
              ["Created", formatDateTime(pod.createdAt)],
            ].map(([k, v], i) => (
              <div
                key={k}
                className={`flex items-start justify-between gap-4 px-5 py-3 ${
                  i > 0 ? "border-t border-line-subtle" : ""
                }`}
              >
                <dt className="cv-label text-[10px]">{k}</dt>
                <dd className="text-right font-mono text-[12.5px] font-medium text-ink-100">
                  {v}
                </dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 border-t border-line-subtle px-5 py-3">
              <dt className="cv-label text-[10px]">Rate</dt>
              <dd className="flex items-center gap-2">
                <PlaceholderPricingBadge />
                <span className="nums font-mono text-[12.5px] font-medium text-hydro">
                  {formatNpr(pod.ratePaisaPerHour)}/hr
                </span>
              </dd>
            </div>
          </dl>
        </Panel>
      </div>

      <section className="mt-10">
        <SectionHeading
          aside={
            <span className="font-mono text-[11px] tracking-wide text-ink-500">
              streaming · last {logs.length} lines
            </span>
          }
        >
          Logs
        </SectionHeading>
        {/* The Terminal's surface: .cv-terminal remaps carbon and ink to the
            pale-teal console palette on paper, so the pane reads as a screen
            in both themes. */}
        <div className="cv-terminal pt-in max-h-96 overflow-y-auto rounded-xl border border-line bg-carbon-800 px-5 py-4">
          {logs.map((l, i) => (
            <div key={i} className="flex gap-3 py-0.5 font-mono text-[12px]">
              <span className="nums shrink-0 text-ink-500">
                {formatDateTime(l.at).slice(11)}
              </span>
              <span
                className={
                  l.stream === "stderr" ? "text-danger" : "text-ink-300"
                }
              >
                {l.message}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
