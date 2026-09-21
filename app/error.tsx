"use client";

import Link from "next/link";
import { Button, Icon } from "@/components/ui";
import { LogoLockup } from "@/components/layout/logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-6 py-20">
      <LogoLockup size={20} />

      <p className="cv-label mt-14">error · render failed</p>

      <h1 className="display mt-4 text-[clamp(2rem,7vw,3rem)]">
        This page didn&rsquo;t load.
      </h1>
      <p className="mt-5 leading-relaxed text-ink-400">
        Something in the page failed while rendering. Retrying usually fixes
        it. If it keeps happening, send us the reference below and we will
        trace it.
      </p>

      {/* The digest is the only thing that makes a support email actionable,
          so it is presented as something to copy — not as fine print. */}
      {error.digest ? (
        <div className="lg lg--panel mt-8 rounded-lg px-4 py-3.5">
          <p className="cv-label text-[10px]">Reference</p>
          <p className="nums mt-1.5 font-mono text-[13px] break-all text-ink-200 select-all">
            {error.digest}
          </p>
        </div>
      ) : null}

      <div className="mt-9 flex flex-wrap gap-3">
        <Button
          variant="primary"
          onClick={reset}
          iconLeft={<Icon name="rotate" size={15} />}
        >
          Try again
        </Button>
        <Link href="/">
          <Button variant="secondary">Back to home</Button>
        </Link>
      </div>

      <p className="mt-8 font-mono text-[11.5px] tracking-wide text-ink-600">
        still broken?{" "}
        <a
          href="mailto:info@corevalley.ai"
          className="text-hydro underline decoration-hydro/40 underline-offset-4 transition-colors duration-normal hover:text-hydro-300"
        >
          info@corevalley.ai
        </a>
      </p>
    </main>
  );
}
