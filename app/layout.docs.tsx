import type { Metadata, Viewport } from "next";
import { DocsShell } from "@/components/docs/docs-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { SOCIAL_IMAGE } from "@/lib/seo";
import { THEME_BOOTSTRAP, THEME_COLOR } from "@/lib/theme";
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
  themeColor: THEME_COLOR.light,
};

export default function DocsRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">
        {/* Same theme bootstrap as the marketing site (lib/theme.ts). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-full focus:bg-zinc-900 focus:px-5 focus:py-2.5 focus:text-[10px] focus:font-bold focus:tracking-[0.2em] focus:text-white focus:uppercase"
        >
          Skip to content
        </a>

        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>

        <div className="flex min-h-dvh flex-col bg-bg-base">
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex-1 pt-2 focus:outline-none md:pt-3">
            <DocsShell>{children}</DocsShell>
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
