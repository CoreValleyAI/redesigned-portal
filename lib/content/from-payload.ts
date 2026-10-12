/**
 * Live preview only: turn a draft as the CMS sends it (relations populated,
 * media with CMS URLs) into the shapes the site's components render. The
 * published path never uses this; it reads the exported files instead.
 * Client-safe.
 */
import { plainText, readingMinutes, headings } from "./lexical";
import type {
  Author,
  CareersPage,
  Category,
  Job,
  LayoutBlock,
  LexicalNode,
  LexicalState,
  Location,
  MediaItem,
  Tag,
  Team,
} from "./types";

type Doc = Record<string, unknown>;

const obj = (v: unknown): Doc | null => (v && typeof v === "object" ? (v as Doc) : null);
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
const iso = (v: unknown) => (typeof v === "string" && v ? new Date(v).toISOString().replace(/\.\d{3}Z$/, "Z") : null);

export class PreviewLookups {
  media = new Map<string, MediaItem>();

  constructor(private cms: string) {}

  /** Register a populated media doc and return its id. */
  addMedia(v: unknown): string | undefined {
    const m = obj(v);
    if (!m) return v === null || v === undefined ? undefined : String(v);
    const abs = (u: unknown) => (typeof u === "string" ? (u.startsWith("http") ? u : `${this.cms}${u}`) : undefined);
    const sizes: MediaItem["sizes"] = {};
    const raw = (obj(m.sizes) ?? {}) as Record<string, Doc>;
    for (const name of ["thumb", "card", "wide"] as const) {
      const s = raw[name];
      const url = abs(s?.url);
      if (url && s?.width && s?.height) sizes[name] = { file: url, width: Number(s.width), height: Number(s.height) };
    }
    const orig = abs(m.url);
    if (orig && m.width && m.height) sizes.original = { file: orig, width: Number(m.width), height: Number(m.height) };
    const id = String(m.id);
    this.media.set(id, {
      id,
      alt: String(m.alt ?? ""),
      caption: str(m.caption),
      credit: str(m.credit),
      width: Number(m.width ?? 0),
      height: Number(m.height ?? 0),
      focalX: typeof m.focalX === "number" ? m.focalX : undefined,
      focalY: typeof m.focalY === "number" ? m.focalY : undefined,
      sizes,
    });
    return id;
  }

  /** Lexical with uploads registered and internal links turned into site paths. */
  lexical(v: unknown): LexicalState | null {
    const state = obj(v) as LexicalState | null;
    if (!state?.root) return null;
    const walk = (n: LexicalNode): LexicalNode => {
      if (n.type === "upload") return { ...n, value: this.addMedia(n.value) };
      if (n.type === "link" || n.type === "autolink") {
        const f = (obj(n.fields) ?? {}) as Doc;
        if (f.linkType === "internal") {
          const doc = obj(f.doc);
          const target = obj(doc?.value);
          const base = doc?.relationTo === "jobs" ? "/jobs/" : "/blog/";
          const url = target?.slug ? `${base}${String(target.slug)}/` : "#";
          return { ...n, fields: { ...f, linkType: "custom", url }, children: n.children?.map(walk) };
        }
      }
      return n.children ? { ...n, children: n.children.map(walk) } : n;
    };
    return { root: walk(state.root) };
  }
}

const points = (v: unknown) =>
  Array.isArray(v) ? v.map((r) => str(obj(r)?.text)).filter((x): x is string => Boolean(x)) : [];

export function previewJob(d: Doc, L: PreviewLookups) {
  const team = obj(d.team) as (Team & Doc) | null;
  const locations = (Array.isArray(d.locations) ? d.locations : []).map(obj).filter(Boolean) as (Location & Doc)[];
  const job: Job = {
    id: String(d.id ?? "draft"),
    slug: String(d.slug ?? "draft"),
    title: String(d.title ?? "Untitled role"),
    team: String(team?.id ?? ""),
    locations: locations.map((l) => String(l.id)),
    workMode: (d.workMode as Job["workMode"]) ?? "onsite",
    employmentType: (d.employmentType as Job["employmentType"]) ?? "full-time",
    seniority: str(d.seniority),
    summary: String(d.summary ?? ""),
    body: L.lexical(d.body),
    responsibilities: points(d.responsibilities),
    requirements: points(d.requirements),
    niceToHave: points(d.niceToHave),
    postedAt: iso(d.postedAt) ?? new Date().toISOString(),
    closesAt: iso(d.closesAt),
    applyMode: d.applyMode === "external" ? "external" : "form",
    externalApplyUrl: str(d.externalApplyUrl),
    featured: Boolean(d.featured),
    updatedAt: iso(d.updatedAt) ?? new Date().toISOString(),
  };
  return {
    ...job,
    teamInfo: team ? { id: String(team.id), slug: String(team.slug ?? ""), name: String(team.name ?? ""), order: Number(team.order ?? 100) } : null,
    locationInfo: locations.map((l) => ({
      id: String(l.id),
      slug: String(l.slug ?? ""),
      name: String(l.name ?? ""),
      city: String(l.city ?? ""),
      region: str(l.region),
      country: String(l.country ?? "NP"),
      order: Number(l.order ?? 100),
    })),
    closed: false,
  };
}

export function previewPost(d: Doc, L: PreviewLookups) {
  const authors = (Array.isArray(d.authors) ? d.authors : []).map(obj).filter(Boolean) as Doc[];
  const category = obj(d.category);
  const tags = (Array.isArray(d.tags) ? d.tags : []).map(obj).filter(Boolean) as Doc[];
  const body = L.lexical(d.body) ?? { root: { type: "root", children: [] } };
  const cover = L.addMedia(d.cover);
  return {
    slug: String(d.slug ?? "draft"),
    title: String(d.title ?? "Untitled post"),
    excerpt: String(d.excerpt ?? ""),
    cover,
    body,
    publishAt: iso(d.publishAt) ?? new Date().toISOString(),
    updatedAt: iso(d.updatedAt) ?? new Date().toISOString(),
    authorInfo: authors.map(
      (a): Author => ({
        id: String(a.id),
        slug: String(a.slug ?? ""),
        name: String(a.name ?? ""),
        title: str(a.title),
        bio: str(a.bio),
        avatar: L.addMedia(a.avatar),
        links: {},
      }),
    ),
    categoryInfo: category
      ? ({ id: String(category.id), slug: String(category.slug ?? ""), name: String(category.name ?? ""), order: 0 } as Category)
      : null,
    tagInfo: tags.map((t): Tag => ({ id: String(t.id), slug: String(t.slug ?? ""), name: String(t.name ?? "") })),
    minutes: readingMinutes(body),
    words: plainText(body).split(/\s+/).filter(Boolean).length,
    toc: headings(body),
  };
}

export function previewCareers(d: Doc, L: PreviewLookups): CareersPage {
  const hero = obj(d.hero) ?? {};
  const ga = obj(d.generalApplication) ?? {};
  const rows = (v: unknown) => (Array.isArray(v) ? (v as Doc[]) : []);
  const layout = rows(d.layout).map((b): LayoutBlock => {
    switch (b.blockType) {
      case "richTextSection":
        return { blockType: "richTextSection", heading: str(b.heading), body: L.lexical(b.body) };
      case "quote":
        return { blockType: "quote", quote: String(b.quote ?? ""), name: str(b.name), role: str(b.role), photo: L.addMedia(b.photo) };
      case "image":
        return { blockType: "image", image: L.addMedia(b.image) ?? "", caption: str(b.caption) };
      default:
        return b as unknown as LayoutBlock;
    }
  });
  return {
    hero: { eyebrow: str(hero.eyebrow), title: String(hero.title ?? ""), lead: str(hero.lead) },
    layout,
    generalApplication: {
      enabled: ga.enabled !== false,
      title: String(ga.title ?? "General application"),
      summary: String(ga.summary ?? ""),
    },
    seo: { noindex: false },
    updatedAt: iso(d.updatedAt) ?? new Date().toISOString(),
  };
}
