"use client";

/**
 * Open roles with search and filters, grouped by team.
 *
 * Every role is rendered on the server, so the full list is in the HTML for
 * search engines and for visitors without JavaScript. The filters are a
 * client island: state lives in the URL (?q=&team=&location=&mode=&type=),
 * read on mount with window.location (static export, so no useSearchParams)
 * and written back with history.replaceState, so a filtered list can be
 * shared. Roles whose closing time has passed since the last build are
 * hidden on the client too.
 */
import * as React from "react";
import { AppLink } from "@/components/system/app-link";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { EMPLOYMENT_LABEL, WORK_MODE_LABEL, formatDate } from "@/lib/content/format";
import type { JobListItem } from "@/lib/content/jobs";

type Filters = { q: string; team: string; location: string; mode: string; type: string };
const EMPTY: Filters = { q: "", team: "", location: "", mode: "", type: "" };
const KEYS = Object.keys(EMPTY) as (keyof Filters)[];

const selectClass =
  "type-small h-11 w-full appearance-none rounded-pill border border-line-strong/60 bg-bg pr-9 pl-4 text-ink outline-none transition-[border-color,box-shadow] duration-[var(--dur-short)] hover:border-line-strong focus:border-hydro focus:shadow-[0_0_0_4px_var(--hydro-wash)]";

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; count: number }[];
}) {
  return (
    <label className="relative block min-w-0">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        <option value="">All {label.toLowerCase()}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label} ({o.count})
          </option>
        ))}
      </select>
      <Icon
        name="arrow-right"
        size={13}
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rotate-90 text-ink-3"
      />
    </label>
  );
}

export function JobsBoard({ jobs, generalHref }: { jobs: JobListItem[]; generalHref?: string }) {
  const [f, setF] = React.useState<Filters>(EMPTY);
  const [now, setNow] = React.useState<string | null>(null);

  React.useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setF(Object.fromEntries(KEYS.map((k) => [k, p.get(k) ?? ""])) as Filters);
    setNow(new Date().toISOString());
  }, []);

  const update = (patch: Partial<Filters>) => {
    setF((prev) => {
      const next = { ...prev, ...patch };
      const p = new URLSearchParams(window.location.search);
      for (const k of KEYS) {
        if (next[k]) p.set(k, next[k]);
        else p.delete(k);
      }
      const qs = p.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
      return next;
    });
  };

  const open = React.useMemo(() => (now ? jobs.filter((j) => !j.closesAt || j.closesAt > now) : jobs), [jobs, now]);

  const count = <T extends string>(pick: (j: JobListItem) => T[]) => {
    const m = new Map<T, number>();
    for (const j of open) for (const v of pick(j)) m.set(v, (m.get(v) ?? 0) + 1);
    return m;
  };

  const teamOpts = React.useMemo(() => {
    const seen = new Map<string, { label: string; order: number }>();
    for (const j of open) seen.set(j.teamSlug, { label: j.team, order: j.teamOrder });
    const c = count((j) => [j.teamSlug]);
    return [...seen]
      .sort((a, b) => a[1].order - b[1].order)
      .map(([value, v]) => ({ value, label: v.label, count: c.get(value) ?? 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const locationOpts = React.useMemo(() => {
    const names = new Map<string, string>();
    for (const j of open) for (const l of j.locations) names.set(l.slug, l.name);
    const c = count((j) => j.locations.map((l) => l.slug));
    return [...names].map(([value, label]) => ({ value, label, count: c.get(value) ?? 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const modeOpts = React.useMemo(() => {
    const c = count((j) => [j.workMode]);
    return (Object.keys(WORK_MODE_LABEL) as (keyof typeof WORK_MODE_LABEL)[])
      .filter((m) => c.get(m))
      .map((m) => ({ value: m, label: WORK_MODE_LABEL[m], count: c.get(m)! }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const typeOpts = React.useMemo(() => {
    const c = count((j) => [j.employmentType]);
    return (Object.keys(EMPLOYMENT_LABEL) as (keyof typeof EMPLOYMENT_LABEL)[])
      .filter((t) => c.get(t))
      .map((t) => ({ value: t, label: EMPLOYMENT_LABEL[t], count: c.get(t)! }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const q = f.q.trim().toLowerCase();
  const shown = open.filter(
    (j) =>
      (!f.team || j.teamSlug === f.team) &&
      (!f.location || j.locations.some((l) => l.slug === f.location)) &&
      (!f.mode || j.workMode === f.mode) &&
      (!f.type || j.employmentType === f.type) &&
      (!q || `${j.title} ${j.summary} ${j.team} ${j.seniority ?? ""}`.toLowerCase().includes(q)),
  );

  const groups = React.useMemo(() => {
    const m = new Map<string, { name: string; order: number; jobs: JobListItem[] }>();
    for (const j of shown) {
      const g = m.get(j.teamSlug) ?? { name: j.team, order: j.teamOrder, jobs: [] };
      g.jobs.push(j);
      m.set(j.teamSlug, g);
    }
    return [...m.values()].sort((a, b) => a.order - b.order);
  }, [shown]);

  const filtered = KEYS.some((k) => f[k]);

  if (!open.length) {
    return (
      <div className="rounded-panel border border-dashed border-line px-6 py-14 text-center md:px-10">
        <Icon name="search" size={26} weight="duotone" className="mx-auto text-ink-2" />
        <h3 className="type-title-3 mt-4">No open roles right now.</h3>
        <p className="type-body mx-auto mt-2 max-w-[46ch] text-ink-2">
          We still want to hear from people who’d like to build Nepal’s AI infrastructure.
        </p>
        {generalHref ? (
          <AppLink
            href={generalHref}
            className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-ink underline decoration-hydro/50 underline-offset-4"
          >
            Send a general application
            <Icon name="arrow-right" size={14} />
          </AppLink>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]">
        <label className="relative block">
          <span className="sr-only">Search roles</span>
          <Icon
            name="search"
            size={16}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-3"
          />
          <input
            type="search"
            value={f.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search roles"
            className={cn(selectClass, "pl-10")}
          />
        </label>
        <Select label="Teams" value={f.team} onChange={(team) => update({ team })} options={teamOpts} />
        <Select
          label="Locations"
          value={f.location}
          onChange={(location) => update({ location })}
          options={locationOpts}
        />
        <Select label="Work modes" value={f.mode} onChange={(mode) => update({ mode })} options={modeOpts} />
        <Select label="Types" value={f.type} onChange={(type) => update({ type })} options={typeOpts} />
      </div>

      <div className="type-small mt-5 flex min-h-8 items-center justify-between gap-4 text-ink-3">
        <p aria-live="polite">
          {shown.length} {shown.length === 1 ? "role" : "roles"}
          {filtered ? ` of ${open.length}` : ""}
        </p>
        {filtered ? (
          <button
            type="button"
            onClick={() => update(EMPTY)}
            className="text-ink-2 underline decoration-line underline-offset-4 transition-colors hover:text-ink"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {groups.length ? (
        <div className="mt-4 flex flex-col gap-10">
          {groups.map((g) => (
            <section key={g.name} aria-labelledby={`team-${g.name}`}>
              <h3
                id={`team-${g.name}`}
                className="type-kicker flex items-baseline gap-3 border-b border-line pb-3 text-ink-3"
              >
                {g.name}
                <span className="tabular-nums">{g.jobs.length}</span>
              </h3>
              <ul>
                {g.jobs.map((j) => (
                  <li key={j.slug} className="border-b border-line">
                    <AppLink
                      href={`/jobs/${j.slug}/`}
                      className="group grid gap-1.5 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8"
                    >
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[1.125rem] font-semibold tracking-[-0.012em] text-ink transition-colors group-hover:text-hydro-ink">
                          {j.title}
                          {j.featured ? (
                            <span className="font-mono text-[10.5px] font-normal tracking-[0.14em] text-hydro uppercase">
                              Featured
                            </span>
                          ) : null}
                        </p>
                        <p className="type-small mt-1 line-clamp-2 max-w-[70ch] text-ink-2">{j.summary}</p>
                      </div>
                      <div className="type-small flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-3 md:justify-end">
                        <span>{j.locations.map((l) => l.name).join(", ") || "Nepal"}</span>
                        <span>{WORK_MODE_LABEL[j.workMode]}</span>
                        <span>{EMPLOYMENT_LABEL[j.employmentType]}</span>
                        {j.closesAt ? <span>Closes {formatDate(j.closesAt)}</span> : null}
                        <Icon
                          name="arrow-right"
                          size={15}
                          className="hidden text-ink-2 transition-transform duration-300 group-hover:translate-x-1 md:block"
                        />
                      </div>
                    </AppLink>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-card border border-dashed border-line px-6 py-10 text-center">
          <p className="text-[15px] text-ink-2">No roles match those filters.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[14px]">
            <button type="button" onClick={() => update(EMPTY)} className="text-ink underline underline-offset-4">
              Clear filters
            </button>
            {generalHref ? (
              <AppLink href={generalHref} className="text-ink underline underline-offset-4">
                Send a general application
              </AppLink>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
