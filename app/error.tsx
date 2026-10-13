"use client";

/**
 * A page failed to render. Say so plainly, offer the retry that usually
 * works, and give the reference an engineer would need.
 */
import { Brandmark, Wordmark } from "@/components/brand/logo";
import { Button, ButtonLink } from "@/components/system/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="container-page flex min-h-dvh max-w-[40rem] flex-col justify-center gap-8 py-20">
      <span className="flex items-center gap-2.5">
        <Brandmark className="w-8" />
        <Wordmark className="w-[6.75rem] text-ink" />
      </span>
      <p className="type-kicker text-ink-3">Something went wrong</p>
      <h1 className="type-title-1">This page didn&apos;t load.</h1>
      <p className="type-lead text-ink-2">
        Trying again usually fixes it. If it keeps happening, send us the reference below and an engineer in Kathmandu will trace it.
      </p>
      {error.digest && (
        <p className="type-mono rounded-card bg-bg-sunken px-4 py-3 text-ink">
          Reference · <span className="font-semibold select-all">{error.digest}</span>
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
        <ButtonLink href="/" variant="secondary" size="lg">
          Home
        </ButtonLink>
      </div>
    </main>
  );
}
