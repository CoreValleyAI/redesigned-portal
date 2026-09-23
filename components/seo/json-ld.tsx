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
