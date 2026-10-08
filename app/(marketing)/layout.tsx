import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-base">
      <SiteHeader />
      {/* id="main" is the skip link's target (see app/layout.tsx). The page's
          first slab starts at the top; the glass nav floats over it. */}
      <main id="main" tabIndex={-1} className="flex-1 pt-2 focus:outline-none md:pt-3">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
