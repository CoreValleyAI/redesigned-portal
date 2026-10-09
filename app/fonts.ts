import { JetBrains_Mono, Manrope } from "next/font/google";

/* Both faces are variable fonts: omitting `weight` ships one woff2 per family
   covering the whole range instead of N static instances. `fallback` carries
   the stack tokens/typography.css declares; next/font prepends a
   metric-adjusted local fallback to keep CLS at zero.

   Manrope and JetBrains Mono are the brand faces (Brand Guidelines v1.0,
   08 / Typography). They are rebound onto the design-system variable names in
   globals.css. */
export const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});
