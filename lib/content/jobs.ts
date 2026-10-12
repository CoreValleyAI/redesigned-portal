/**
 * The job board's view of published content. Server-only (reads the store).
 */
import { contentNow, loadContent } from "./source";
import { isClosed, WORK_MODE_LABEL, EMPLOYMENT_LABEL } from "./format";
import { key, type CareersPage, type Job, type Location, type Team } from "./types";

/** Reserved slug for the always-present general application page. */
export const GENERAL_APPLICATION = "general-application";

export interface JobView extends Job {
  teamInfo: Team | null;
  locationInfo: Location[];
  closed: boolean;
}

export interface JobListItem {
  slug: string;
  title: string;
  summary: string;
  team: string;
  teamSlug: string;
  teamOrder: number;
  locations: { slug: string; name: string }[];
  workMode: Job["workMode"];
  employmentType: Job["employmentType"];
  seniority?: string;
  closesAt: string | null;
  postedAt: string;
  featured: boolean;
}

function view(job: Job, now: string): JobView {
  const store = loadContent();
  return {
    ...job,
    teamInfo: store.teams.get(key(job.team)) ?? null,
    locationInfo: job.locations
      .map((l) => store.locations.get(key(l)))
      .filter((l): l is Location => Boolean(l))
      .sort((a, b) => a.order - b.order),
    closed: isClosed(job.closesAt, now),
  };
}

/** Every published job, open or closed (closed ones keep a page that says so). */
export function allJobs(): JobView[] {
  const now = contentNow();
  return loadContent().jobs.map((j) => view(j, now));
}

/** Open roles, featured first, then by team order, then newest. */
export function openJobs(): JobView[] {
  return allJobs()
    .filter((j) => !j.closed)
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        (a.teamInfo?.order ?? 999) - (b.teamInfo?.order ?? 999) ||
        b.postedAt.localeCompare(a.postedAt),
    );
}

export function jobBySlug(slug: string): JobView | undefined {
  return allJobs().find((j) => j.slug === slug);
}

export function toListItem(j: JobView): JobListItem {
  return {
    slug: j.slug,
    title: j.title,
    summary: j.summary,
    team: j.teamInfo?.name ?? "CoreValley",
    teamSlug: j.teamInfo?.slug ?? "other",
    teamOrder: j.teamInfo?.order ?? 999,
    locations: j.locationInfo.map((l) => ({ slug: l.slug, name: l.name })),
    workMode: j.workMode,
    employmentType: j.employmentType,
    seniority: j.seniority,
    closesAt: j.closesAt,
    postedAt: j.postedAt,
    featured: j.featured,
  };
}

/** Up to three other open roles: same team first, then the rest. */
export function similarJobs(job: JobView, limit = 3): JobView[] {
  const others = openJobs().filter((j) => j.slug !== job.slug);
  const same = others.filter((j) => key(j.team) === key(job.team));
  const rest = others.filter((j) => key(j.team) !== key(job.team));
  return [...same, ...rest].slice(0, limit);
}

/** "Kathmandu · Hybrid · Full-time" */
export function jobMetaLine(j: Pick<JobView, "locationInfo" | "workMode" | "employmentType">): string {
  const where = j.locationInfo.map((l) => l.name).join(", ") || "Nepal";
  return [where, WORK_MODE_LABEL[j.workMode], EMPLOYMENT_LABEL[j.employmentType]].join(" · ");
}

const DEFAULT_CAREERS: CareersPage = {
  hero: {
    eyebrow: "Careers",
    title: "Build Nepal’s AI infrastructure.",
    lead: "We are a small team in Kathmandu building the country’s own GPU cloud — racks, power, scheduling and the API on top. Come and build it with us.",
  },
  layout: [],
  generalApplication: {
    enabled: true,
    title: "General application",
    summary: "Don’t see your role? Tell us what you’d like to work on and send your CV. We read every application.",
  },
  seo: { noindex: false },
  updatedAt: "2026-10-12T00:00:00Z",
};

/** The careers page as published, or a sensible default before the first publish. */
export function careersPage(): CareersPage {
  return loadContent().careers ?? DEFAULT_CAREERS;
}
