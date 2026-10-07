import { Badge, Icon } from "@/components/ui";
import {
  MetricTile,
  Panel,
  PlaceholderPricingBadge,
  PortalPageHeader,
  TableScroll,
  Th,
  Tr,
} from "@/components/portal/primitives";
import { getClient } from "@/lib/api/client";
import { formatNpr } from "@/lib/money";
import { formatDateTime, formatDuration } from "@/lib/format";
import { JUPYTER_RATES } from "@/lib/catalog";

export const metadata = { title: "Notebooks" };

const STATUS_TONE = {
  running: "success",
  starting: "info",
  stopped: "neutral",
  culled: "warning",
} as const;

export default async function JupyterPage() {
  const cv = getClient();
  const [hub, servers, profiles] = await Promise.all([
    cv.getJupyterHub(),
    cv.listJupyterServers(),
    cv.listJupyterSpawnerProfiles(),
  ]);

  return (
    <>
      <PortalPageHeader
        eyebrow="compute / notebooks"
        title="Notebooks"
        description="Managed JupyterHub. Users pick a spawner profile; idle servers are culled automatically so a forgotten notebook does not bill overnight."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="active servers"
          value={hub.activeServers}
          sub={`of ${hub.totalUsers} users`}
          accent
        />
        <MetricTile label="hub version" value={hub.version} sub="JupyterHub" />
        <MetricTile
          label="idle culling"
          value={`${hub.idleCullMinutes}m`}
          sub="then the meter stops"
        />
        <MetricTile
          label="named servers"
          value={hub.namedServerLimit}
          sub="limit per user"
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-[15px] font-semibold tracking-tight text-ink-100">Servers</h2>
        <TableScroll minWidth="52rem">
          <thead>
            <tr>
              <Th>user</Th>
              <Th>profile</Th>
              <Th>status</Th>
              <Th>last activity</Th>
              <Th>runtime</Th>
              <Th align="right">cost this cycle</Th>
            </tr>
          </thead>
          <tbody>
            {servers.map((s, i) => {
              const profile = profiles.find((p) => p.id === s.spawnerProfileId);
              return (
                <Tr key={s.id} index={i}>
                  <td className="px-4 py-3.5">
                    <div className="text-[13.5px] text-ink-100">
                      {s.userName}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-ink-500">
                      {s.id}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[12.5px] text-ink-300">
                    {profile?.displayName ?? s.spawnerProfileId}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[12px] text-ink-400">
                    {formatDateTime(s.lastActivityAt)}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[12.5px] text-ink-400">
                    {formatDuration(s.billableSeconds)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-[12.5px] text-ink-200">
                    {formatNpr(s.costToDatePaisa, { compact: true })}
                  </td>
                </Tr>
              );
            })}
          </tbody>
        </TableScroll>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink-100">
            Spawner profiles
          </h2>
          <PlaceholderPricingBadge />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {profiles.map((p) => {
            const rate = JUPYTER_RATES.find((r) => r.spawnerProfileId === p.id);
            return (
              <Panel key={p.id} padding={20}>
                <div className="flex items-center gap-2.5">
                  <Icon
                    name={p.skuId ? "cpu" : "database"}
                    size={17}
                    className="text-hydro"
                  />
                  <span className="font-mono text-[13.5px] text-ink-100">
                    {p.displayName}
                  </span>
                </div>
                <p className="mt-3 text-[12.5px] leading-relaxed text-ink-400">
                  {p.description}
                </p>
                {rate ? (
                  <p className="mt-4 border-t border-line-subtle pt-3.5 font-mono text-[14px] text-hydro">
                    {formatNpr(rate.paisaPerHour)}
                    <span className="ml-1 text-[11px] text-ink-500">
                      per user-hour
                    </span>
                  </p>
                ) : null}
              </Panel>
            );
          })}
        </div>
      </section>
    </>
  );
}
