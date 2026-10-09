import { Inter, JetBrains_Mono } from "next/font/google";

/* Inter carries the whole interface; JetBrains Mono is kept for code only
   (terminals, docs code blocks), rebound in globals.css. Shared by the root
   layout and the docs site's (app/layout.docs.tsx). */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});
