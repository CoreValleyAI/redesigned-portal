import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { LiquidFilters } from "@/components/fx/liquid-filter";
import "./globals.css";

/* Both faces are variable fonts: omitting `weight` ships one woff2 per family
   covering the whole range instead of N static instances. `fallback` carries
   the stack tokens/typography.css declares; next/font prepends a
   metric-adjusted local fallback to keep CLS at zero.

   Manrope and JetBrains Mono are the brand faces (Brand Guidelines v1.0,
   08 / Typography). They are rebound onto the design-system variable names in
   globals.css. */
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://corevalley.ai"),
  title: {
    default: "CoreValley — sovereign AI compute, hosted in Kathmandu",
    template: "%s · CoreValley",
  },
  description:
    "NVIDIA H100 and H200 capacity inside Nepal. Per-second GPU pods, JupyterHub for research teams, and OpenAI-compatible model endpoints — billed in NPR, with data that never crosses the border.",
  keywords: [
    "GPU cloud Nepal",
    "H100 Kathmandu",
    "sovereign AI infrastructure",
    "NPR GPU billing",
    "data residency Nepal",
  ],
  openGraph: {
    type: "website",
    siteName: "CoreValley",
    locale: "en_NP",
    title: "CoreValley — sovereign AI compute, hosted in Kathmandu",
    description:
      "NVIDIA H100 and H200 capacity inside Nepal. Billed in NPR, supported in Nepal time, with data residency by default.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoreValley — sovereign AI compute, hosted in Kathmandu",
    description:
      "NVIDIA H100 and H200 capacity inside Nepal. Billed in NPR, supported in Nepal time.",
  },
  robots: { index: true, follow: true },
};

/* Tells the UA to render scrollbars and form controls dark, and paints the
   mobile browser chrome Carbon so the status bar continues the ground. */
export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#05080D",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      {/* No bg/text utilities needed: design_system/tokens/base.css (imported
          into layer(base)) already sets --bg-base, --text-primary and the
          Manrope 300 / 1.6 body defaults. */}
      <body className="min-h-dvh antialiased">
        {/* Keyboard users land here first. Visually hidden until focused, at
            which point it becomes a real, fully styled control — a skip link
            that stays invisible when focused is worse than none. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-md focus:bg-hydro focus:px-4 focus:py-2.5 focus:font-mono focus:text-xs focus:tracking-label focus:text-carbon-900 focus:uppercase"
        >
          Skip to content
        </a>

        {/* The scroll-reveal system hides content until JS marks it shown. If
            scripting is off, the `.cv-js` gate in CSS never arms — but a user
            with JS disabled mid-session would still be left with blank
            sections, so this unhides them unconditionally. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>

        {/* Definitions-only SVG for the glass refraction pass. */}
        <LiquidFilters />

        {children}
      </body>
    </html>
  );
}
