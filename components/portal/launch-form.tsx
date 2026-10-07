"use client";

/**
 * Pod launch wizard. GPU -> slice profile -> image -> count, with a live CLI
 * preview and NPR estimate that recompute from the catalogue on every change.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Icon, Input, Terminal } from "@/components/ui";
import { Panel, PlaceholderPricingBadge } from "./primitives";
import { LiveNumber } from "./live-number";
import { getClient } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import type {
  GpuSku,
  PodEstimate,
  Project,
  SliceProfile,
} from "@/lib/api/types";

const IMAGES = [
  { id: "corevalley/pytorch:2.5-cu124", label: "PyTorch 2.5 · CUDA 12.4" },
  { id: "corevalley/vllm:0.6.3", label: "vLLM 0.6.3" },
  { id: "corevalley/tensorflow:2.17", label: "TensorFlow 2.17" },
  { id: "corevalley/base:cuda12.4", label: "Bare CUDA 12.4" },
];

const ISOLATION_NOTE: Record<string, string> = {
  exclusive: "A whole card. No neighbours, full bandwidth.",
  mig: "Hardware-partitioned. Fault-isolated from other tenants.",
  hami: "Software slice on a shared card. Cheaper, not fault-isolated.",
};

/** A numbered step heading: a Hydro index chip, then the step name. */
function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="nums flex size-6 items-center justify-center rounded-pill border border-line-hydro bg-hydro/10 font-mono text-[11px] font-medium text-hydro">
        {n}
      </span>
      <h2 className="text-[15px] font-semibold tracking-tight text-ink-100">{children}</h2>
    </div>
  );
}

const enter = (i: number) => ({ "--pt-d": `${80 + i * 70}ms` }) as React.CSSProperties;

export function LaunchForm({
  skus,
  profiles,
  projects,
}: {
  skus: GpuSku[];
  profiles: SliceProfile[];
  projects: Project[];
}) {
  const router = useRouter();
  const available = skus.filter((s) => s.status === "available");
  // Shown so the roadmap is visible, but never selectable: only live SKUs launch.
  const soon = skus.filter((s) => s.status === "coming-soon");

  const [name, setName] = React.useState("");
  const [skuId, setSkuId] = React.useState(available[0]?.id ?? "h200-sxm-141");
  const [profileId, setProfileId] = React.useState("");
  const [image, setImage] = React.useState(IMAGES[0]!.id);
  const [projectId, setProjectId] = React.useState(projects[0]?.id ?? "");
  const [count, setCount] = React.useState(1);
  const [estimate, setEstimate] = React.useState<PodEstimate | null>(null);
  const [launching, setLaunching] = React.useState(false);

  const skuProfiles = React.useMemo(
    () => profiles.filter((p) => p.skuId === skuId),
    [profiles, skuId],
  );

  // Keep the selected profile valid whenever the GPU changes.
  React.useEffect(() => {
    if (!skuProfiles.some((p) => p.id === profileId)) {
      setProfileId(skuProfiles[0]?.id ?? "");
    }
  }, [skuProfiles, profileId]);

  const profile = profiles.find((p) => p.id === profileId);
  const exclusive = profile?.isolation === "exclusive";

  // Re-estimate on every meaningful change. estimatePod is a pure catalogue
  // lookup in the mock, and a cheap call against a real backend.
  React.useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    getClient()
      .estimatePod({
        profileId,
        gpuCount: exclusive ? count : 1,
        skuId: skuId as GpuSku["id"],
        regionId: "np-ktm-1",
        name,
      })
      .then((e) => {
        if (!cancelled) setEstimate(e);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId, count, skuId, name, exclusive]);

  async function launch() {
    if (!profileId || !name) return;
    setLaunching(true);
    const pod = await getClient().launchPod({
      name,
      projectId,
      skuId: skuId as GpuSku["id"],
      profileId,
      gpuCount: exclusive ? count : 1,
      image,
      regionId: "np-ktm-1",
    });
    router.push(`/portal/pods/${pod.id}`);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_23rem] lg:items-start">
      <div className="space-y-5">
        {/* Name and project */}
        <Panel padding={24} className="pt-in" style={enter(0)}>
          <Step n={1}>Identity</Step>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pod-name" className="cv-label mb-2 block text-[10px]">
                Pod name
              </label>
              <Input
                id="pod-name"
                mono
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="nepali-7b-sft"
              />
            </div>
            <div>
              <label htmlFor="pod-project" className="cv-label mb-2 block text-[10px]">
                Project
              </label>
              <select
                id="pod-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="pt-select h-10 w-full cursor-pointer rounded-md border border-line bg-surface-input px-3 font-mono text-[13px] font-medium text-ink-100 outline-none transition-[border-color,box-shadow] duration-fast hover:border-line-strong focus:border-hydro focus:shadow-[0_0_0_3px_rgb(var(--hydro-rgb)/0.12)]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Panel>

        {/* GPU */}
        <Panel padding={24} className="pt-in" style={enter(1)}>
          <Step n={2}>GPU</Step>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {available.map((s) => {
              const on = skuId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSkuId(s.id)}
                  aria-pressed={on}
                  data-on={on ? "" : undefined}
                  className="pt-option flex cursor-pointer items-center gap-3.5 px-4 py-3.5 text-left"
                >
                  <span
                    className={cn(
                      "flex size-10 flex-none items-center justify-center rounded-lg border border-line bg-carbon-600",
                      on ? "text-hydro" : "text-ink-500",
                    )}
                  >
                    <Icon name="cpu" size={19} weight={on ? "duotone" : "regular"} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold tracking-tight text-ink-100">
                      {s.name}
                    </span>
                    <span className="mt-0.5 block font-mono text-[11.5px] text-ink-500">
                      {s.memoryGb} GB {s.memoryType} · {s.architecture}
                    </span>
                  </span>
                  {on ? <Icon name="check" size={15} className="ml-auto text-hydro" /> : null}
                </button>
              );
            })}
            {soon.map((s) => (
              <div
                key={s.id}
                aria-disabled="true"
                className="flex items-center gap-3.5 rounded-lg border border-dashed border-line px-4 py-3.5"
              >
                <span className="flex size-10 flex-none items-center justify-center rounded-lg border border-line text-ink-500">
                  <Icon name="cpu" size={19} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold tracking-tight text-ink-400">
                    {s.name}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11.5px] text-ink-500">
                    {s.memoryGb} GB {s.memoryType} · {s.architecture}
                  </span>
                </span>
                <Badge tone="neutral" className="ml-auto shrink-0">
                  coming soon
                </Badge>
              </div>
            ))}
          </div>
          {soon.length ? (
            <p className="mt-3.5 text-[12.5px] text-ink-500">
              Early access runs on the H200. The rest launch from here as they
              land, starting with the RTX PRO 6000 Blackwell.
            </p>
          ) : null}
        </Panel>

        {/* Slice */}
        <Panel padding={24} className="pt-in" style={enter(2)}>
          <Step n={3}>Slice profile</Step>
          <div className="space-y-2">
            {skuProfiles.map((p) => {
              const on = p.id === profileId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProfileId(p.id)}
                  aria-pressed={on}
                  data-on={on ? "" : undefined}
                  className="pt-option flex w-full cursor-pointer items-center gap-3.5 px-4 py-3 text-left"
                >
                  <Icon
                    name={p.isolation === "exclusive" ? "cpu" : "slice"}
                    size={18}
                    className={on ? "text-hydro" : "text-ink-500"}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[13.5px] font-medium text-ink-100">
                        {p.label}
                      </span>
                      <Badge
                        tone={
                          p.isolation === "exclusive"
                            ? "hydro"
                            : p.isolation === "mig"
                              ? "info"
                              : "neutral"
                        }
                      >
                        {p.isolation}
                      </Badge>
                      {!p.faultIsolated ? (
                        <span className="font-mono text-[10px] text-warning">
                          not fault-isolated
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block font-mono text-[11px] text-ink-500">
                      {p.gpuMemoryGb} GB · {p.computePercent}% compute ·{" "}
                      {p.vcpus} vCPU
                    </span>
                  </span>
                  {/* Compute share, drawn: how much of the card this slice gets. */}
                  <span className="hidden w-24 flex-none sm:block" aria-hidden="true">
                    <span className="block h-1 overflow-hidden rounded-pill bg-carbon-500">
                      <span
                        className={cn("block h-full rounded-pill", on ? "bg-hydro" : "bg-ink-600")}
                        style={{ width: `${p.computePercent}%` }}
                      />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {profile ? (
            <p key={profile.isolation} className="pt-in mt-3.5 flex items-center gap-2 text-[12.5px] leading-relaxed text-ink-400">
              <Icon name="info" size={14} className="flex-none text-ink-500" />
              {ISOLATION_NOTE[profile.isolation]}
            </p>
          ) : null}
        </Panel>

        {/* Image and count */}
        <Panel padding={24} className="pt-in" style={enter(3)}>
          <Step n={4}>Image and scale</Step>
          <div className="space-y-2">
            {IMAGES.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setImage(img.id)}
                aria-pressed={image === img.id}
                data-on={image === img.id ? "" : undefined}
                className="pt-option flex w-full cursor-pointer flex-col items-start gap-0.5 px-4 py-2.5 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                {/* An image reference never breaks mid-tag: on a phone the
                    label drops below it instead. */}
                <span className="max-w-full overflow-x-auto font-mono text-[12.5px] font-medium whitespace-nowrap text-ink-100">
                  {img.id}
                </span>
                <span className="text-[12px] text-ink-500">
                  {img.label}
                </span>
              </button>
            ))}
          </div>

          {exclusive ? (
            <div className="mt-5">
              <p className="cv-label mb-2.5 text-[10px]">GPU count</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="size-11 px-0"
                  onClick={() => setCount((c) => Math.max(1, c - 1))}
                  aria-label="Decrease GPU count"
                >
                  <Icon name="minus" size={14} />
                </Button>
                <span className="nums w-10 text-center font-mono text-xl font-medium text-ink-100">
                  {count}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="size-11 px-0"
                  onClick={() => setCount((c) => Math.min(8, c + 1))}
                  aria-label="Increase GPU count"
                >
                  <Icon name="plus" size={14} />
                </Button>
                <span className="text-[12.5px] text-ink-500">
                  whole cards
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-[12.5px] text-ink-500">
              Sliced profiles run one instance per pod. Launch several pods to
              scale out.
            </p>
          )}
        </Panel>
      </div>

      {/* Summary */}
      <div className="pt-in space-y-4 lg:sticky lg:top-24" style={enter(1)}>
        <Terminal
          title="command preview"
          cursor={false}
          lines={[
            { prompt: "$", text: estimate?.cliPreview ?? "…" },
            { out: `--image ${image}` },
          ]}
        />

        <Panel padding={24} accent>
          <div className="flex items-center justify-between">
            <p className="cv-label text-[10px]">Estimate</p>
            <PlaceholderPricingBadge />
          </div>

          {estimate ? (
            <>
              <p className="mt-5 font-mono text-[34px] leading-none font-medium tracking-tight text-hydro">
                <LiveNumber value={estimate.ratePaisaPerHour / 100} decimals={2} prefix="NPR " />
              </p>
              <p className="mt-2 font-mono text-[11px] tracking-wide text-ink-500">
                per hour · metered per second
              </p>

              <dl className="pt-well mt-5 space-y-2.5 px-4 py-3.5">
                <div className="flex justify-between gap-3">
                  <dt className="text-[12.5px] text-ink-400">
                    If left running a month
                  </dt>
                  <dd className="font-mono text-[12.5px] font-medium text-ink-100">
                    <LiveNumber
                      value={Math.round(estimate.estimatedMonthlyPaisa / 100)}
                      prefix="NPR "
                    />
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[12.5px] text-ink-400">
                    Minimum billable
                  </dt>
                  <dd className="font-mono text-[12.5px] font-medium text-ink-100">
                    {estimate.minimumBillableSeconds}s
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[12.5px] text-ink-400">
                    Region
                  </dt>
                  <dd className="font-mono text-[12.5px] font-medium text-ink-100">
                    np-ktm-1
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="mt-4 font-mono text-[13px] text-ink-500">
              Select a slice profile…
            </p>
          )}

          <Button
            variant="primary"
            fullWidth
            mono
            className="mt-6"
            disabled={!name || !profileId || launching}
            onClick={launch}
            iconLeft={<Icon name="zap" size={15} />}
          >
            {launching ? "launching…" : "launch pod"}
          </Button>
          {!name ? (
            <p className="mt-2.5 text-center text-[12px] text-ink-500">
              Give the pod a name to continue.
            </p>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}
