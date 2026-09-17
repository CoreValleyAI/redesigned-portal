"use client";

/**
 * Sign in / Sign up dialogs.
 *
 * Rendered with the native <dialog> element so focus trapping, Escape and
 * inertness come from the platform rather than a hand-rolled implementation.
 * The scrim is styled through ::backdrop.
 *
 * Submitting sets a demo session cookie and routes to /portal. There is no
 * real authentication here — the portal runs on the mock data layer.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Icon, Input } from "@/components/ui";
import { LogoLockup } from "./logo";

export type AuthMode = "signin" | "signup";

const COPY = {
  signin: {
    eyebrow: "Console access",
    title: "Sign in to CoreValley",
    body: "Use your work email and we will match you to an organisation.",
    cta: "Continue",
    alt: "New to CoreValley?",
    altAction: "Create an account",
  },
  signup: {
    eyebrow: "Request access",
    title: "Create your account",
    body: "GPU capacity in Kathmandu, billed in NPR. We will confirm your organisation before provisioning.",
    cta: "Create account",
    alt: "Already have an account?",
    altAction: "Sign in",
  },
} as const;

export function AuthModal({
  mode,
  open,
  onClose,
  onSwitchMode,
}: {
  mode: AuthMode;
  open: boolean;
  onClose: () => void;
  onSwitchMode: (m: AuthMode) => void;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const copy = COPY[mode];

  React.useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    if (email === "kaustuv@corevalley.ai" && password === "kaustuv123") {
      document.cookie = "cv_demo_session=1; path=/; max-age=86400; SameSite=Lax";
      router.push("/portal");
    } else {
      setSubmitting(false);
      alert("Invalid credentials. Please try again.");
    }
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="auth-title"
      className="glass-modal m-auto w-[min(27rem,calc(100vw-2rem))] rounded-lg p-0 text-fg backdrop:bg-carbon-900/80 backdrop:backdrop-blur-md"
    >
      <form onSubmit={submit} className="p-7">
        <LogoLockup size={19} />

        <p className="cv-label mt-6 mb-1.5">{copy.eyebrow}</p>
        <h2
          id="auth-title"
          className="display text-[23px]"
        >
          {copy.title}
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-400">
          {copy.body}
        </p>

<<<<<<< Updated upstream
        <div className="mt-6 space-y-4">
          {mode === "signup" ? (
            <div>
              <label htmlFor="auth-org" className="cv-label mb-2 block">
                Organisation
              </label>
              <Input
                id="auth-org"
                name="organisation"
                required
                placeholder="Himal Analytics"
                prefix={<Icon name="building" size={15} />}
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="auth-email" className="cv-label mb-2 block">
              Work email
            </label>
            <Input
              id="auth-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com.np"
              prefix={<Icon name="user" size={15} />}
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="cv-label mb-2 block">
              Password
            </label>
            <Input
              id="auth-password"
              name="password"
              type="password"
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder="••••••••••••"
              prefix={<Icon name="lock" size={15} />}
            />
          </div>
        </div>
=======
        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-danger"
          >
            {error}
          </p>
        ) : null}
>>>>>>> Stashed changes

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={submitting}
          className="mt-6"
          iconRight={<Icon name="arrow-right" size={16} />}
        >
          {submitting ? "Signing in…" : copy.cta}
        </Button>

        <div className="my-5 flex items-center gap-2.5">
          <span className="h-px flex-1 bg-[var(--border-subtle)]" />
          <span className="font-mono text-[10px] tracking-[0.1em] text-ink-600">
            OR
          </span>
          <span className="h-px flex-1 bg-[var(--border-subtle)]" />
        </div>

<<<<<<< Updated upstream
        <Button
          type="submit"
          variant="secondary"
          mono
          fullWidth
          iconLeft={<Icon name="terminal" size={15} />}
        >
          continue with sso
        </Button>

        <p className="mt-6 text-center font-body text-[13px] font-light text-ink-400">
=======
        <p className="mt-5 text-center text-[13px] text-ink-400">
>>>>>>> Stashed changes
          {copy.alt}{" "}
          <button
            type="button"
            onClick={() => onSwitchMode(mode === "signin" ? "signup" : "signin")}
            className="text-hydro underline decoration-hydro/40 underline-offset-4 transition-colors duration-normal hover:text-hydro-300"
          >
            {copy.altAction}
          </button>
        </p>
      </form>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 cursor-pointer rounded-md p-1.5 text-ink-500 hover:bg-carbon-600 hover:text-ink-200"
      >
        <Icon name="x" size={16} />
      </button>
    </dialog>
  );
}
<<<<<<< Updated upstream
=======

/* -------------------------------------------------------------------------- */

/** Reads a query parameter from the live URL. Client-only by construction. */
function readParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

/** Accepts only same-origin paths. `?callbackUrl=` is attacker-controllable and
 *  a leading-"/" test is not enough to keep a value on this origin: the URL
 *  parser treats "\" as a path separator and strips tab/CR/LF before parsing,
 *  so "/\evil.com" and "/<TAB>/evil.com" both resolve to another host the same
 *  way the protocol-relative "//evil.com" does. Resolve the value and compare
 *  origins rather than pattern-matching the string. */
function safePath(value: string | null): string | null {
  if (!value || typeof window === "undefined") return null;
  if (!value.startsWith("/")) return null;
  /* Reject the separators the parser rewrites or discards outright; anything
     that needs them is not a path we are willing to navigate to. */
  if (/[\\\t\r\n]/.test(value)) return null;
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

const COPY = (keycloak: boolean, staticDemo: boolean) =>
  ({
    signin: {
      eyebrow: "Console access",
      title: "Sign in to CoreValley",
      body: staticDemo
        ? "This is a static preview of the CoreValley console. Continue to explore it with sample data."
        : keycloak
          ? "You will be redirected to the CoreValley identity provider to enter your credentials."
          : "Keycloak is not configured, so the console signs in with a seeded development account.",
      cta: keycloak ? "Continue with SSO" : "Enter the console",
      alt: "New to CoreValley?",
      altAction: "Create an account",
    },
    signup: {
      eyebrow: "Request access",
      title: "Create your account",
      body: staticDemo
        ? "Account creation needs the hosted console. Continue to explore the preview with sample data."
        : keycloak
          ? "Registration, password reset and multi-factor enrolment are handled by the CoreValley identity provider."
          : "Keycloak is not configured. Start it with `docker compose up -d` to register a real account.",
      cta: keycloak ? "Register with SSO" : "Enter the console",
      alt: "Already have an account?",
      altAction: "Sign in",
    },
  }) as const;

/** Auth.js error codes that can land back on `/?error=…`. */
const ERRORS: Record<string, string> = {
  Configuration:
    "The identity provider is misconfigured. Check KEYCLOAK_ISSUER and the client secret.",
  AccessDenied: "That account is not permitted to access this console.",
  Verification: "The sign-in link has expired. Please try again.",
  OAuthCallbackError:
    "The identity provider rejected the callback. Check the client's redirect URIs.",
  Default: "Sign-in failed. Please try again.",
};
>>>>>>> Stashed changes
