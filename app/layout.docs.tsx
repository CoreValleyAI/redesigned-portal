import type { Metadata, Viewport } from "next";
import { DocsShell } from "@/components/docs/docs-shell";
import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteHeader } from "@/components/chrome/site-header";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { SOCIAL_IMAGE } from "@/lib/seo";
import { PREFERENCE_BOOTSTRAP, THEME_COLOR } from "@/lib/theme";
import { inter, jetbrainsMono } from "./fonts";
import "./globals.css";

/**
 * Root layout of the docs site (docs.corevalley.ai), the build with
 * NEXT_PUBLIC_BUILD_TARGET=docs; see next.config.ts. The same chrome as the
 * marketing site (header, footer, theme), whose links point back to
 * corevalley.ai, around the documentation shell.
 */
const DESCRIPTION =
  "CoreValley documentation: platform guides, hardware specs, billing in NPR and support.";

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: {
    default: `Documentation · ${SITE_NAME}`,
    template: `%s · ${SITE_NAME} Docs`,
  },
  description: DESCRIPTION,
  applicationName: `${SITE_NAME} Docs`,
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    type: "website",
    siteName: `${SITE_NAME} Docs`,
    locale: "en_US",
    url: `${SITE_URL}/`,
    title: `Documentation · ${SITE_NAME}`,
    description: DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR.dark },
  ],
  colorScheme: "light dark",
};

export default function DocsRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Same preference bootstrap as the site (lib/theme.ts). */}
        <script dangerouslySetInnerHTML={{ __html: PREFERENCE_BOOTSTRAP }} />
      </head>
      <body>
        <div id="top" aria-hidden="true" className="pointer-events-none absolute top-0 left-0 h-px w-px" />
        <a
          href="#main"
          className="type-small fixed top-3 left-3 z-[100] -translate-y-20 rounded-pill bg-ink px-5 py-2.5 font-medium text-bg transition-transform duration-[var(--dur-spring-snappy)] ease-spring focus-visible:translate-y-0"
        >
          Skip to content
        </a>

        <div className="flex min-h-dvh flex-col">
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex-1 pt-[var(--header-h)] focus:outline-none">
            <DocsShell>{children}</DocsShell>
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
