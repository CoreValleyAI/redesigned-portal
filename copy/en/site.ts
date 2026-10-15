/**
 * Site-wide copy: navigation, footer and the strings every page shares
 * (docs/revamp/03 §2). Typed so a later locale (copy/hi, copy/ne) has to
 * provide the same shape.
 */
import { PRODUCT_CATALOG, PRODUCTS } from "./products";
import { v } from "@/lib/facts";
import { SOLUTIONS } from "./solutions";
import type { IndustryGlyphName } from "@/components/solutions/industry-glyph";
import type { GlyphName } from "@/components/system/dot-glyph";
import { DOCS_URL, ORG, SHOW_STATUS, STATUS_URL } from "@/lib/site";

export interface NavLink {
  href: string;
  label: string;
  glyph?: GlyphName;
  /** An industry pictogram, in place of `glyph`. */
  industry?: IndustryGlyphName;
  description?: string;
}

/** One line per offering, short enough for the Products panel. */
const CATALOG_SHORT: Record<string, string> = {
  "serverless-apis": "Hosted open models, one API call away",
  "managed-inference": "Your models behind a dedicated endpoint",
  "fine-tuning": "Adapt open models to your own data",
  "platform-as-a-service": "A managed AI workspace, run by us",
  orchestration: "Pipelines with Kubeflow, Airflow and Ray",
  applications: "JupyterLab, Spark, Superset and more",
  modelops: "MLflow tracking and registry, Katib tuning",
  engineering: "Our engineers on your project",
  "gpu-as-a-service": "Whole H200 NVL GPUs, on demand or reserved",
  "mig-slices": `Up to ${v("gpu.migCount")} isolated GPUs from one`,
  "infrastructure-as-a-service": "Compute, network and storage, set up for you",
  "network-as-a-service": `Private networking, ${v("place.latency")} in the valley`,
  storage: "S3-compatible object and file storage",
};

export interface NavGroup {
  name: string;
  line: string;
  items: NavLink[];
}

export const NAV = {
  products: {
    label: "Products",
    /** The Products panel: Run, Build, Scale. */
    groups: PRODUCT_CATALOG.map<NavGroup>((g) => ({
      name: g.name,
      line: `${g.title} ${g.continuation}`,
      items: g.items.map((i) => ({
        href: `/products#${i.id}`,
        label: i.name,
        glyph: i.glyph,
        description: CATALOG_SHORT[i.id] ?? i.line,
      })),
    })),
    all: { href: "/products", label: "All products" },
    featured: {
      href: "/hardware",
      title: "Powered by NVIDIA",
      body: `H200 NVL · ${v("gpu.memory")} ${v("gpu.memoryType")} on every GPU`,
    },
    footer: [
      { href: "/products#compare", label: "Compare products" },
      { href: "/pricing", label: "Pricing" },
      { href: "/contact?intent=workloads", label: "Talk to us" },
    ] satisfies NavLink[],
  },
  solutions: {
    label: "Solutions",
    industries: SOLUTIONS.industries.items.map<NavLink>((i) => ({
      href: `/solutions#${i.id}`,
      label: i.name,
      industry: i.glyph,
      description: i.promise,
    })),
    more: [
      {
        href: "/solutions",
        label: "All solutions",
        glyph: "platform",
        description: "Six industries, the work they run and what fits.",
      },
      {
        href: "/solutions#why",
        label: "Why CoreValley",
        glyph: "trust",
        description: "Six reasons, plainly.",
      },
    ] satisfies NavLink[],
  },
  primary: [
    { href: "/platform", label: "Platform" },
    { href: "/infrastructure", label: "Infrastructure" },
    { href: "/use-cases", label: "Use cases" },
    { href: "/pricing", label: "Pricing" },
  ] satisfies NavLink[],
  company: {
    label: "Company",
    items: [
      { href: "/company", label: "About", glyph: "company", description: "Who we are and where we're going." },
      { href: "/jobs", label: "Careers", glyph: "careers", description: "Build Nepal's AI infrastructure with us." },
      { href: "/blog", label: "Blog", glyph: "blog", description: "Notes from Kathmandu." },
      { href: "/trust", label: "Trust", glyph: "trust", description: "Security and data handling." },
    ] satisfies NavLink[],
  },
  docs: { href: DOCS_URL, label: "Docs" },
  cta: { href: "/contact", label: "Request access", short: "Access" },
} as const;

export const FOOTER = {
  columns: [
    {
      title: "Products",
      links: PRODUCTS.map<NavLink>((p) => ({ href: `/products/${p.slug}`, label: p.name })),
    },
    {
      title: "Machines & place",
      links: [
        { href: "/hardware", label: "Hardware" },
        { href: "/infrastructure", label: "Infrastructure" },
        { href: "/platform", label: "Platform" },
        { href: "/solutions", label: "Solutions" },
        { href: "/use-cases", label: "Use cases" },
        { href: "/pricing", label: "Pricing" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/company", label: "About" },
        { href: "/jobs", label: "Careers" },
        { href: "/blog", label: "Blog" },
        { href: "/trust", label: "Trust" },
      ],
    },
    {
      title: "Help",
      links: [
        { href: DOCS_URL, label: "Documentation" },
        { href: "/contact", label: "Contact" },
        ...(SHOW_STATUS ? [{ href: STATUS_URL, label: "Status" }] : []),
        { href: `mailto:${ORG.email}`, label: ORG.email },
      ],
    },
  ],
  legal: [
    { href: "/legal/privacy", label: "Privacy" },
    { href: "/legal/terms", label: "Terms" },
    { href: "/legal/data-residency", label: "Data residency" },
  ],
  copyright: `© ${new Date().getFullYear()} ${ORG.legalName}, Kathmandu`,
  credits: "Partners are named for identification; NVIDIA marks belong to their owner.",
} as const;

export const UI = {
  skip: "Skip to content",
  menu: { open: "Open menu", close: "Close menu" },
  theme: {
    label: "Theme",
    light: "Light",
    dark: "Dark",
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
  },
  motion: { label: "Reduce motion", on: "On", off: "Off" },
  engineer: { label: "Engineer mode" },
  external: "opens another site",
  valleyTime: { place: "Kathmandu", zone: "NPT" },
} as const;
