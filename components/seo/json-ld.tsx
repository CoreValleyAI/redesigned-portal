/**
 * Structured data (schema.org JSON-LD) for the marketing pages.
 *
 * Server components: the script tag renders into the static HTML, which is
 * what search engines read. Builders return plain objects so a page can
 * combine several graphs in one <JsonLd>. Every field is a fact the page
 * already shows; nothing is added for the crawler alone.
 */
import { absoluteUrl, logoUrl, ORG, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

type Graph = Record<string, unknown>;

export function JsonLd({ data }: { data: Graph | Graph[] }) {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : { "@context": "https://schema.org", ...data };
  return (
    <script
      type="application/ld+json"
      // `<` is escaped so a value can never close the script element.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationJsonLd(): Graph {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORG.name,
    legalName: ORG.legalName,
    url: `${SITE_URL}/`,
    logo: logoUrl(),
    email: ORG.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: ORG.locality,
      addressRegion: ORG.region,
      addressCountry: ORG.country,
    },
    areaServed: { "@type": "Country", name: ORG.countryName },
    sameAs: [ORG.linkedin, ORG.github],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: ORG.email,
        availableLanguage: ["en", "ne"],
        areaServed: ORG.country,
      },
    ],
  };
}

export function webSiteJsonLd(): Graph {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function webPageJsonLd(opts: { path: string; name: string; description: string }): Graph {
  return {
    "@type": "WebPage",
    "@id": `${absoluteUrl(opts.path)}#webpage`,
    url: absoluteUrl(opts.path),
    name: opts.name,
    description: opts.description,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Graph {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]): Graph {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** A product page. Compute is a service, so `Service`, offered by the org. */
export function serviceJsonLd(opts: {
  path: string;
  name: string;
  description: string;
  audience: string;
}): Graph {
  return {
    "@type": "Service",
    "@id": `${absoluteUrl(opts.path)}#service`,
    name: `${opts.name} — ${SITE_NAME}`,
    serviceType: "GPU cloud computing",
    description: opts.description,
    url: absoluteUrl(opts.path),
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: ORG.countryName },
    audience: { "@type": "Audience", audienceType: opts.audience },
  };
}

const EMPLOYMENT_TYPE: Record<string, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACTOR",
  internship: "INTERN",
};

/**
 * A job listing, for Google's job search. Only for open roles: a closed role
 * keeps its page but drops this markup. `TELECOMMUTE` only when the role is
 * fully remote, with the country applicants must be in.
 */
export function jobPostingJsonLd(opts: {
  path: string;
  title: string;
  descriptionHtml: string;
  datePosted: string;
  validThrough: string | null;
  employmentType: string;
  remote: boolean;
  locations: { city: string; region?: string; country: string }[];
  team?: string;
}): Graph {
  const places = opts.locations.length ? opts.locations : [{ city: ORG.locality, region: ORG.region, country: ORG.country }];
  return {
    "@type": "JobPosting",
    "@id": `${absoluteUrl(opts.path)}#job`,
    title: opts.title,
    description: opts.descriptionHtml,
    datePosted: opts.datePosted,
    ...(opts.validThrough ? { validThrough: opts.validThrough } : {}),
    employmentType: EMPLOYMENT_TYPE[opts.employmentType] ?? "OTHER",
    hiringOrganization: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: ORG.name,
      sameAs: `${SITE_URL}/`,
      logo: logoUrl(),
    },
    jobLocation: places.map((l) => ({
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: l.city,
        ...(l.region ? { addressRegion: l.region } : {}),
        addressCountry: l.country,
      },
    })),
    ...(opts.remote
      ? {
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: { "@type": "Country", name: ORG.countryName },
        }
      : {}),
    ...(opts.team ? { occupationalCategory: opts.team } : {}),
    directApply: true,
    url: absoluteUrl(opts.path),
  };
}

export function personJsonLd(opts: { path: string; name: string; jobTitle?: string; sameAs?: string[] }): Graph {
  return {
    "@type": "Person",
    "@id": `${absoluteUrl(opts.path)}#person`,
    name: opts.name,
    url: absoluteUrl(opts.path),
    ...(opts.jobTitle ? { jobTitle: opts.jobTitle } : {}),
    ...(opts.sameAs?.length ? { sameAs: opts.sameAs } : {}),
    worksFor: { "@id": `${SITE_URL}/#organization` },
  };
}

export function blogPostingJsonLd(opts: {
  path: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  image?: string;
  authors: { name: string; path: string }[];
  section?: string;
  keywords?: string[];
  wordCount?: number;
}): Graph {
  return {
    "@type": "BlogPosting",
    "@id": `${absoluteUrl(opts.path)}#article`,
    headline: opts.title,
    description: opts.description,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    ...(opts.image ? { image: [opts.image] } : {}),
    author: opts.authors.map((a) => ({ "@type": "Person", name: a.name, url: absoluteUrl(a.path) })),
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(opts.path) },
    ...(opts.section ? { articleSection: opts.section } : {}),
    ...(opts.keywords?.length ? { keywords: opts.keywords.join(", ") } : {}),
    ...(opts.wordCount ? { wordCount: opts.wordCount } : {}),
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}
