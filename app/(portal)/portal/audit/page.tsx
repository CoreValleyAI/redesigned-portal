import { Badge, Icon } from "@/components/ui";
import {
  MetricTile,
  Panel,
  PortalPageHeader,
  TableScroll,
  Th,
  Tr,
} from "@/components/portal/primitives";
import { getClient } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Audit log" };

export default async function AuditPage() {
  const cv = getClient();
  const [entries, verification] = await Promise.all([
    cv.listAuditLog({ limit: 40 }),
    cv.verifyAuditChain(),
  ]);

  const denied = entries.filter((e) => e.outcome !== "success").length;

  return (
    <>
      <PortalPageHeader
        eyebrow="account / audit-log"
        title="Audit log"
        description="Append-only record of every control-plane action. Each entry commits to its predecessor's hash, so any edit or deletion breaks the chain and is detectable."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricTile
          label="entries"
          value={verification.entriesChecked}
          sub="in the verified chain"
        />
        <MetricTile
          label="non-success outcomes"
          value={denied}
          sub="denied or errored"
        />
        <MetricTile
          label="chain integrity"
          value={verification.verified ? "intact" : "broken"}
          sub={`verified ${formatDateTime(verification.verifiedAt)}`}
          accent={verification.verified}
        />
      </div>

      <Panel padding={18} className="mt-3">
        <div className="flex items-start gap-3">
          <Icon
            name={verification.verified ? "check-circle" : "warning"}
            size={18}
            weight="duotone"
            className={verification.verified ? "mt-0.5 shrink-0 text-hydro" : "mt-0.5 shrink-0 text-danger"}
          />
          <p className="text-[13px] leading-relaxed text-ink-400">
            {verification.verified
              ? `All ${verification.entriesChecked} entries verify against their predecessor hashes. Export the log as CSV for your own compliance evidence.`
              : `Chain verification failed at entry ${verification.brokenAtEntryId}. Contact support immediately.`}
          </p>
        </div>
      </Panel>

      <section className="mt-8">
        <TableScroll minWidth="60rem">
          <thead>
            <tr>
              <Th>time</Th>
              <Th>actor</Th>
              <Th>action</Th>
              <Th>resource</Th>
              <Th>source ip</Th>
              <Th>outcome</Th>
              <Th align="right">hash</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <Tr key={e.id} index={i}>
                <td className="px-4 py-3 font-mono text-[11.5px] whitespace-nowrap text-ink-500">
                  {formatDateTime(e.at)}
                </td>
                <td className="px-4 py-3 text-[13px] text-ink-300">
                  {e.actorName}
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-hydro">
                  {e.action}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-[12px] text-ink-300">
                    {e.resourceType}
                  </span>
                  <span className="ml-2 font-mono text-[11px] text-ink-500">
                    {e.resourceId}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-[11.5px] text-ink-500">
                  {e.sourceIp}
                </td>
                <td className="px-4 py-3">
                  {e.outcome === "success" ? (
                    <Badge tone="success">success</Badge>
                  ) : (
                    <Badge tone="danger">{e.outcome}</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[10.5px] text-ink-500">
                  {e.hash.slice(0, 10)}…
                </td>
              </Tr>
            ))}
          </tbody>
        </TableScroll>
      </section>
    </>
  );
}
