/**
 * Published content, schema version 1 — the files the CMS writes to the
 * CoreValleyAI/content repo. Mirrors corevalley-cms/src/publish/schema.ts.
 *
 * Readers ignore fields they don't know, so the CMS may add optional fields
 * without a version bump. A breaking change bumps the version; the site must
 * learn the new version before the CMS starts writing it (the build refuses
 * a newer version than SUPPORTED_SCHEMA).
 */

export const SUPPORTED_SCHEMA = 1;

export type Id = number | string;
export type IsoTime = string;

export type LexicalNode = {
  type: string;
  children?: LexicalNode[];
  [key: string]: unknown;
};
export type LexicalState = { root: LexicalNode };

export interface Manifest {
  schemaVersion: number;
  generator: string;
  payload: string;
  generatedAt: IsoTime;
  schedule: { path: string; from: IsoTime | null; until: IsoTime | null }[];
}

export interface MediaFile {
  file: string;
  width: number;
  height: number;
}

export interface MediaItem {
  id: Id;
  alt: string;
  caption?: string;
  credit?: string;
  width: number;
  height: number;
  focalX?: number;
  focalY?: number;
  sizes: Partial<Record<"thumb" | "card" | "wide" | "original", MediaFile>>;
}

export interface Author {
  id: Id;
  slug: string;
  name: string;
  title?: string;
  bio?: string;
  avatar?: Id;
  links: { website?: string; linkedin?: string; x?: string; github?: string };
}

export interface Category {
  id: Id;
  slug: string;
  name: string;
  description?: string;
  order: number;
}

export interface Tag {
  id: Id;
  slug: string;
  name: string;
}

export interface Team {
  id: Id;
  slug: string;
  name: string;
  description?: string;
  order: number;
}

export interface Location {
  id: Id;
  slug: string;
  name: string;
  city: string;
  region?: string;
  country: string;
  order: number;
}

export type WorkMode = "onsite" | "hybrid" | "remote";
export type EmploymentType = "full-time" | "part-time" | "contract" | "internship";

export interface Job {
  id: Id;
  slug: string;
  title: string;
  team: Id;
  locations: Id[];
  workMode: WorkMode;
  employmentType: EmploymentType;
  seniority?: string;
  summary: string;
  body: LexicalState | null;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  postedAt: IsoTime;
  closesAt: IsoTime | null;
  applyMode: "form" | "external";
  externalApplyUrl?: string;
  featured: boolean;
  updatedAt: IsoTime;
}

export interface SeoFields {
  title?: string;
  description?: string;
  image?: Id;
  canonical?: string;
  noindex: boolean;
}

export interface Post {
  id: Id;
  slug: string;
  title: string;
  excerpt: string;
  cover?: Id;
  body: LexicalState;
  authors: Id[];
  category?: Id;
  tags: Id[];
  publishAt: IsoTime;
  featured: boolean;
  featuredRank?: number;
  relatedPosts: Id[];
  seo: SeoFields;
  updatedAt: IsoTime;
}

export type LayoutBlock =
  | { blockType: "richTextSection"; id?: string; heading?: string; body: LexicalState | null }
  | { blockType: "valuesGrid"; id?: string; heading?: string; intro?: string; items: { title: string; body: string }[] }
  | { blockType: "benefitsList"; id?: string; heading?: string; intro?: string; items: { title: string; body?: string }[] }
  | { blockType: "processSteps"; id?: string; heading?: string; intro?: string; steps: { title: string; body?: string; duration?: string }[] }
  | { blockType: "stats"; id?: string; heading?: string; items: { value: string; label: string }[] }
  | { blockType: "quote"; id?: string; quote: string; name?: string; role?: string; photo?: Id }
  | { blockType: "image"; id?: string; image: Id; caption?: string }
  | { blockType: "faq"; id?: string; heading?: string; items: { question: string; answer: string }[] }
  | { blockType: "cta"; id?: string; heading: string; body?: string; label: string; href: string };

export interface CareersPage {
  hero: { eyebrow?: string; title: string; lead?: string };
  layout: LayoutBlock[];
  generalApplication: { enabled: boolean; title: string; summary: string };
  seo: SeoFields;
  updatedAt: IsoTime;
}

export interface Redirect {
  from: string;
  to: string;
}

/** Everything a renderer needs to resolve ids, in one bag. */
export interface Lookups {
  media: Map<string, MediaItem>;
  teams: Map<string, Team>;
  locations: Map<string, Location>;
  authors: Map<string, Author>;
  categories: Map<string, Category>;
  tags: Map<string, Tag>;
}

export const key = (id: Id | undefined | null) => (id === undefined || id === null ? "" : String(id));
