import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Aurora } from "@/components/fx/aurora";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* The moving ground: a shader gradient fixed behind every marketing
          page. Fixed and at z -10, so sections paint over it. */}
      <Aurora />
      <SiteHeader />
      {/* id="main" is the skip link's target (see app/layout.tsx). tabIndex
          -1 makes it programmatically focusable so the skip actually moves
          keyboard focus, not just the scroll position. */}
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
