import type { Metadata, Viewport } from "next";
import { GlassRefraction } from "@/components/motion/glass-refraction";
import { ParallaxObserver } from "@/components/motion/parallax-observer";
import { PointerFx } from "@/components/motion/pointer-fx";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { JsonLd, organizationJsonLd, webSiteJsonLd } from "@/components/seo/json-ld";
import { UI } from "@/copy/en/site";
import { NOINDEX, ORG, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import { SOCIAL_IMAGE } from "@/lib/seo";
import { PREFERENCE_BOOTSTRAP, THEME_COLOR } from "@/lib/theme";
import { inter, jetbrainsMono } from "./fonts";
import "./globals.css";

/* Search-console verification tokens are read from the environment so the
   repo never carries them. */
const verification: Metadata["verification"] = {
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : {}),
  ...(process.env.NEXT_PUBLIC_BING_VERIFICATION
    ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION } }
    : {}),
};

/* Site-wide defaults. Every page overrides title, description and canonical
   through lib/seo.ts → pageMetadata. */
export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: ORG.name, url: `${SITE_URL}/` }],
  creator: ORG.name,
  publisher: ORG.legalName,
  category: "technology",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: `${SITE_URL}/`,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE.url],
  },
  // Staging builds (/preview, /revamp) are full copies of the site: keep
  // them out of search.
  robots: NOINDEX
    ? { index: false, follow: false }
    : {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
      },
  ...(Object.keys(verification).length ? { verification } : {}),
};

/* Browser chrome follows the theme: dark by default, the visitor's saved
   choice once they make one (the bootstrap and lib/theme.ts rewrite it). */
export const viewport: Viewport = {
  themeColor: THEME_COLOR.dark,
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme, motion and engineer-mode preferences, stamped on <html>
            before the first paint (lib/theme.ts). */}
        <script dangerouslySetInnerHTML={{ __html: PREFERENCE_BOOTSTRAP }} />
      </head>
      <body>
        {/* A marker at the very top of the document: the header watches it
            to know when the page has scrolled. */}
        <div id="top" aria-hidden="true" className="pointer-events-none absolute top-0 left-0 h-px w-px" />

        <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />

        <a
          href="#main"
          className="type-small fixed top-3 left-3 z-[100] -translate-y-20 rounded-pill bg-ink px-5 py-2.5 font-medium text-bg transition-transform duration-[var(--dur-spring-snappy)] ease-spring focus-visible:translate-y-0"
        >
          {UI.skip}
        </a>

        {children}

        <RevealObserver />
        <ParallaxObserver />
        <GlassRefraction />
        <PointerFx />
      </body>
    </html>
  );
}
