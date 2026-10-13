import { Inter, JetBrains_Mono } from "next/font/google";

/* The two faces of the site (docs/revamp/05 §2), self-hosted by next/font
   at build time — no request ever goes to Google from a visitor's browser.

   Inter carries everything: display, UI, body and numbers. Its optical-size
   axis (opsz 14–32) tightens the large headlines and opens the small text,
   the way SF Pro does; `font-optical-sizing: auto` in app/styles/base.css
   selects it from the font size. JetBrains Mono is for data: kickers, spec
   readouts, code and terminals. Shared by the site and the docs layouts. */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
  variable: "--font-inter",
  adjustFontFallback: true,
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  adjustFontFallback: true,
});
