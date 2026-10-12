/**
 * Client-safe helpers for content: labels, dates, media URLs. No fs here, so
 * client islands (filters, live preview) can import it.
 */
import type { EmploymentType, Id, MediaItem, WorkMode } from "./types";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const WORK_MODE_LABEL: Record<WorkMode, string> = {
  onsite: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};

export const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kathmandu",
});
const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kathmandu",
});

/** "12 October 2026", in Kathmandu time. */
export const formatDate = (iso: string) => DATE.format(new Date(iso));
/** "12 Oct 2026, 17:00" NPT. */
export const formatDateTime = (iso: string) => `${DATE_TIME.format(new Date(iso))} NPT`;

export const isClosed = (closesAt: string | null, now: string) => Boolean(closesAt && closesAt <= now);

/** Published files live under /media/; the live preview passes absolute CMS URLs instead. */
const fileUrl = (file: string) => (/^https?:\/\//.test(file) ? file : `${BASE}/media/${file}`);

/** Public URL of a media size, with a graceful fall-back to the next size up or down. */
export function mediaSrc(
  item: MediaItem | undefined,
  prefer: "thumb" | "card" | "wide" | "original" = "card",
): { src: string; width: number; height: number } | null {
  if (!item) return null;
  const order = {
    thumb: ["thumb", "card", "wide", "original"],
    card: ["card", "wide", "original", "thumb"],
    wide: ["wide", "original", "card", "thumb"],
    original: ["original", "wide", "card", "thumb"],
  }[prefer] as ("thumb" | "card" | "wide" | "original")[];
  for (const size of order) {
    const f = item.sizes[size];
    if (f) return { src: fileUrl(f.file), width: f.width, height: f.height };
  }
  return null;
}

/** srcset across the sizes a media item has. */
export function mediaSrcSet(item: MediaItem | undefined): string | undefined {
  if (!item) return undefined;
  const parts = (["thumb", "card", "wide", "original"] as const)
    .map((s) => item.sizes[s])
    .filter((f): f is NonNullable<typeof f> => Boolean(f))
    .sort((a, b) => a.width - b.width)
    .filter((f, i, all) => i === 0 || f.width !== all[i - 1]!.width)
    .map((f) => `${fileUrl(f.file)} ${f.width}w`);
  return parts.length ? parts.join(", ") : undefined;
}

export const objectPosition = (item: MediaItem | undefined) =>
  item && typeof item.focalX === "number" && typeof item.focalY === "number"
    ? `${item.focalX}% ${item.focalY}%`
    : undefined;

export const idEq = (a: Id | undefined, b: Id | undefined) => a !== undefined && b !== undefined && String(a) === String(b);
