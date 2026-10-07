"use client";

/**
 * Live pod panel: subscribes to status transitions and telemetry.
 *
 * Both subscriptions come back as Unsubscribe functions, so the transport
 * (setInterval in the mock, SSE against a real backend) never leaks in here.
 * While a pod is starting, a four-stage track shows where it is; telemetry
 * values glide between samples rather than snapping.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Icon } from "@/components/ui";
import { MetricTile, Panel, PodStatusPill, UtilBar } from "./primitives";
import { LiveNumber } from "./live-number";
import { getClient } from "@/lib/api/client";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Pod, PodStatus, PodTelemetry } from "@/lib/api/types";

const STAGES: { status: PodStatus; label: string }[] = [
  { status: "queued", label: "queued" },
  { status: "provisioning", label: "allocating slice" },
  { status: "pulling-image", label: "pulling image" },
  { status: "running", label: "running" },
];

/** Where a starting pod is on the way to running; -1 when it isn't starting. */
function stageIndex(status: PodStatus) {
  return STAGES.findIndex((s) => s.status === status);
}

function LaunchTrack({ status }: { status: PodStatus }) {
  const at = stageIndex(status);
  return (
    <Panel padding={20} className="pt-in mb-4">
      <ol className="grid grid-cols-4 gap-3">
        {STAGES.map((s, i) => {
          const done = i < at;
          const current = i === at;
          return (
            <li key={s.status} className="min-w-0">
              <div className="h-1 overflow-hidden rounded-pill bg-carbon-500">
                <div
                  className="h-full rounded-pill bg-hydro transition-[width] duration-slow ease-out"
                  style={{ width: done || (current && s.status === "running") ? "100%" : current ? "55%" : "0%" }}
                />
              </div>
              <p
                className={cn(
                  "mt-2.5 flex items-center gap-1.5 font-mono text-[11.5px]",
                  done || current ? "text-ink-100" : "text-ink-500",
                )}
              >
                {done ? <Icon name="check" size={12} className="text-hydro" /> : null}
                {s.label}
              </p>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

export function PodLivePanel({ initial }: { initial: Pod }) {
  const router = useRouter();
  const [pod, setPod] = React.useState(initial);
  const [telemetry, setTelemetry] = React.useState<PodTelemetry | null>(null);
  const [busy, setBusy] = React.useState(false);
  // Show the track only for pods we watched start, not ones already running.
  const [watchedStart] = React.useState(() => stageIndex(initial.status) >= 0 && initial.status !== "running");

  React.useEffect(() => {
    const cv = getClient();
    const offPod = cv.subscribePod(initial.id, setPod);
    const offTel = cv.subscribePodTelemetry(initial.id, setTelemetry);
    return () => {
      offPod();
      offTel();
    };
  }, [initial.id]);

  const live = pod.status === "running";

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    await fn();
    setBusy(false);
    router.refresh();
  }

  const cv = getClient();
  const util = telemetry?.gpuUtilPercent ?? 0;

  return (
    <>
      <div className="pt-in mb-5 flex flex-wrap items-center gap-3">
        <PodStatusPill status={pod.status} />
        {pod.statusDetail ? (
          <span key={pod.statusDetail} className="pt-in text-[13.5px] text-ink-400">
            {pod.statusDetail}
          </span>
        ) : null}

        <div className="ml-auto flex gap-2">
          {live ? (
            <Button
              variant="secondary"
              size="sm"
              mono
              disabled={busy}
              onClick={() => act(() => cv.stopPod(pod.id))}
              iconLeft={<Icon name="pause" size={14} />}
            >
              stop
            </Button>
          ) : pod.status === "stopped" || pod.status === "failed" ? (
            <Button
              variant="primary"
              size="sm"
              mono
              disabled={busy}
              onClick={() => act(() => cv.startPod(pod.id))}
              iconLeft={<Icon name="play" size={14} />}
            >
              start
            </Button>
          ) : null}
          <Button
            variant="danger"
            size="sm"
            mono
            disabled={busy || pod.status === "terminated"}
            onClick={() => act(() => cv.terminatePod(pod.id))}
          >
            terminate
          </Button>
        </div>
      </div>

      {watchedStart || (stageIndex(pod.status) >= 0 && !live) ? (
        <LaunchTrack status={pod.status} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          index={0}
          label="gpu utilisation"
          value={<LiveNumber value={util} suffix="%" />}
          sub={<UtilBar value={util} width={120} />}
          accent={live}
        />
        <MetricTile
          index={1}
          label="gpu memory"
          value={<LiveNumber value={telemetry?.gpuMemoryUsedGb ?? 0} decimals={1} />}
          unit="GB"
          sub="allocated of slice"
        />
        <MetricTile
          index={2}
          label="temperature"
          value={<LiveNumber value={telemetry?.gpuTempC ?? 0} suffix="°C" />}
          sub={
            <>
              <LiveNumber value={telemetry?.gpuPowerW ?? 0} /> W draw
            </>
          }
        />
        <MetricTile
          index={3}
          label="uptime"
          value={formatDuration(pod.billableSeconds)}
          sub="billable seconds"
        />
      </div>

      {live ? (
        <Panel padding={16} className="pt-in mt-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="cv-label text-[10px]">host</span>
            <code className="font-mono text-[12.5px] font-medium text-hydro">
              {pod.sshCommand}
            </code>
            {pod.exposedPorts.length > 0 ? (
              <>
                <span className="cv-label text-[10px]">ports</span>
                <span className="font-mono text-[12.5px] text-ink-200">
                  {pod.exposedPorts.join(" · ")}
                </span>
              </>
            ) : null}
          </div>
        </Panel>
      ) : null}
    </>
  );
}
