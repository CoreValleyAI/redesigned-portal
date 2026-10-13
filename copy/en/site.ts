/**
 * Site-wide copy: navigation, footer and the strings every page shares
 * (docs/revamp/03 §2). Typed so a later locale (copy/hi, copy/ne) has to
 * provide the same shape.
 */
import { PRODUCTS } from "./products";
import type { GlyphName } from "@/components/system/dot-glyph";
import { DOCS_URL, ORG, SHOW_STATUS, STATUS_URL } from "@/lib/site";

export interface NavLink {
  href: string;
  label: string;
  glyph?: GlyphName;
  description?: string;
}

export const NAV = {
  products: {
    label: "Products",
    ways: PRODUCTS.map<NavLink>((p) => ({
      href: `/products/${p.slug}`,
      label: p.name,
      glyph: p.glyph,
      description: p.promise,
    })),
    machines: [
      {
        href: "/hardware",
        label: "Hardware",
        glyph: "hardware",
        description: "NVIDIA H200 NVL, the cluster, and what comes next.",
      },
      {
        href: "/products#compare",
        label: "Compare products",
        glyph: "platform",
        description: "Billing, commitment and what each one is best for.",
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
      { href: "/trust", label: "Trust", glyph: "trust", description: "Security, data handling and compliance status." },
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
  credits: "Partners are named for identification; NVIDIA and HPE marks belong to their owners.",
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
