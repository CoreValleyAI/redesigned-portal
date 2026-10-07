"use client";

/**
 * Early-access request form.
 *
 * Posts to the FormSubmit relay the previous site already used, so no backend
 * is required. On success the form resets and shows a confirmation. If the
 * AJAX call is rejected it falls back to a native POST rather than losing the
 * message; `_next` brings that POST back here as /contact/?sent=1, which
 * shows the same confirmation. Offline, nothing is sent and the visitor is
 * told so, with everything they typed still in place.
 *
 * A plan from the homepage quote console arrives as ?gpu=&count=&hours= and
 * is read back on mount (static export: window.location, not
 * useSearchParams): it preselects the interest, opens the message with the
 * plan in words, and shows as a "Your plan" chip.
 */
import * as React from "react";
import Link from "next/link";
import { Button, Card, Icon, Input } from "@/components/ui";
import { EARLY_ACCESS } from "@/lib/availability";
import { describePlan, parsePlan, type QuotePlan } from "./quote-plan";

const INBOX = "info@corevalley.ai";
const ENDPOINT = `https://formsubmit.co/ajax/${INBOX}`;
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* Grouped by what is open today. Each value is the readable label with its
   group, because FormSubmit mails the raw value to the inbox. */
const GROUPS: { label: string; options: string[] }[] = [
  {
    label: "Open now — enterprise early access on H200",
    options: [
      "GPU pods for training or fine-tuning",
      "Model endpoints (an OpenAI-compatible API)",
      "Dedicated H200 servers",
      "JupyterHub for a team",
    ],
  },
  {
    label: "Coming soon — join the list",
    options: [
      "H100, Blackwell or another GPU",
      "A university or research lab",
      "A startup or small team",
    ],
  },
];
const value = (group: string, option: string) =>
  `${group.startsWith("Open") ? "Early access" : "Join the list"}: ${option}`;
const DEFAULT_INTEREST = value(GROUPS[0]!.label, GROUPS[0]!.options[0]!);
const WAITLIST_GPU = value(GROUPS[1]!.label, GROUPS[1]!.options[0]!);
const DEDICATED = value(GROUPS[0]!.label, GROUPS[0]!.options[2]!);
const EXPLORING = "Just exploring";

/** The interest a console plan implies. */
function interestFor(plan: QuotePlan): string {
  if (plan.gpu.soon) return WAITLIST_GPU;
  // A whole eight-card server held for a week or more is a dedicated node.
  if (!plan.gpu.slice && plan.count === 8 && (plan.hours?.v ?? 0) >= 168) return DEDICATED;
  return DEFAULT_INTEREST;
}

type Status = "idle" | "sending" | "sent" | "offline";

function Label({
  htmlFor,
  required = false,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-[13.5px] font-medium text-ink-200">
      {children}
      {required ? (
        <span aria-hidden="true" className="ml-0.5 text-hydro">
          *
        </span>
      ) : null}
    </label>
  );
}

/** Roomy on a desktop, but a phone keeps its width for the fields. */
const CARD_PADDING: React.CSSProperties = { padding: "clamp(1.25rem, 5vw, 2rem)" };

const fieldClass =
  "w-full rounded-md border border-line bg-surface-input px-3 text-[14px] text-ink-100 outline-none transition-[border-color,box-shadow] duration-fast hover:border-line-strong focus:border-hydro focus:shadow-[0_0_0_3px_rgb(var(--hydro-rgb)/0.12)]";

export function ContactForm() {
  const [status, setStatus] = React.useState<Status>("idle");
  const [plan, setPlan] = React.useState<QuotePlan | null>(null);
  const [interest, setInterest] = React.useState(DEFAULT_INTEREST);
  const [message, setMessage] = React.useState("");
  const [nextUrl, setNextUrl] = React.useState("");
  const doneRef = React.useRef<HTMLHeadingElement>(null);

  // Read the query once: a plan from the console, or the return from a
  // native POST (?sent=1). Also work out where that native POST should
  // come back to, which needs the live origin.
  React.useEffect(() => {
    setNextUrl(`${window.location.origin}${BASE}/contact/?sent=1`);
    const params = new URLSearchParams(window.location.search);
    if (params.get("sent") === "1") {
      setStatus("sent");
      params.delete("sent");
      const rest = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${rest ? `?${rest}` : ""}`);
      return;
    }
    const p = parsePlan(window.location.search);
    if (!p) return;
    setPlan(p);
    setInterest(interestFor(p));
    setMessage(`${describePlan(p)}\n\n`);
  }, []);

  // Move focus to the confirmation so a screen reader announces it.
  React.useEffect(() => {
    if (status === "sent") doneRef.current?.focus();
  }, [status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setStatus("offline");
      return;
    }

    setStatus("sending");
    const body = new FormData(form);

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
      });
      const data: { success?: string | boolean; message?: string } = await res
        .json()
        .catch(() => ({}));
      if (!res.ok || data.success === false || data.success === "false") {
        throw new Error(data.message ?? "send failed");
      }
      form.reset();
      setMessage("");
      setInterest(DEFAULT_INTEREST);
      setPlan(null);
      setStatus("sent");
    } catch {
      if (navigator.onLine === false) {
        setStatus("offline");
        return;
      }
      // The relay rejected the AJAX call — fall back to a native POST so the
      // message is still delivered rather than silently dropped. `_next`
      // brings the visitor back to /contact/?sent=1.
      form.method = "POST";
      form.action = `https://formsubmit.co/${INBOX}`;
      form.submit();
    }
  }

  if (status === "sent") {
    return (
      <Card style={CARD_PADDING} aria-live="polite">
        <Icon name="check-circle" size={28} weight="duotone" className="text-hydro" />
        <h2
          ref={doneRef}
          tabIndex={-1}
          className="mt-4 text-xl font-semibold tracking-tight text-ink-100 outline-none"
        >
          Request received.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-400">
          We will reply {EARLY_ACCESS.replyTime} with a capacity plan and a firm
          rupee quote — from Kathmandu, in Nepal business hours.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => setStatus("idle")}>
          Send another
        </Button>
      </Card>
    );
  }

  const subject = plan
    ? `CoreValley — early-access request (${plan.count}× ${plan.gpu.short})`
    : "CoreValley — early-access request";

  return (
    <Card style={CARD_PADDING}>
      <h2 className="text-xl font-semibold tracking-tight text-ink-100">
        Request early access
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-400">
        Tell us the shape of the workload. We reply {EARLY_ACCESS.replyTime}{" "}
        with a capacity plan and a firm NPR quote.
      </p>

      {plan ? (
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-line bg-carbon-800/60 px-3.5 py-2.5">
          <span className="font-mono text-[10.5px] tracking-label text-ink-500 uppercase">
            Your plan
          </span>
          <span className="font-mono text-[13px] text-ink-100">
            {plan.count}× {plan.gpu.short}
            {plan.hours ? ` · ${plan.hours.long}` : ""}
          </span>
          <span
            className={`font-mono text-[11px] ${plan.gpu.soon ? "text-warning" : "text-hydro"}`}
          >
            {plan.gpu.soon ? "coming soon" : "available now"}
          </span>
          <Link
            href="/#contact"
            className="ml-auto text-[13px] text-hydro underline decoration-hydro/40 underline-offset-4 transition-colors duration-normal hover:text-hydro-300"
          >
            Edit plan
          </Link>
        </div>
      ) : null}

      <p className="mt-5 text-[12.5px] text-ink-500">
        Fields marked <span className="text-hydro">*</span> are required.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <input type="hidden" name="_subject" value={subject} />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_captcha" value="false" />
        {nextUrl ? <input type="hidden" name="_next" value={nextUrl} /> : null}
        {plan ? (
          <input type="hidden" name="quote_console_plan" value={describePlan(plan)} />
        ) : null}
        {/* Honeypot: bots fill it, humans never see it. */}
        <input
          type="text"
          name="_honey"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name" required>
              Full name
            </Label>
            <Input
              id="name"
              name="name"
              required
              autoComplete="name"
              placeholder="Your name"
              className="placeholder:text-ink-500"
            />
          </div>
          <div>
            <Label htmlFor="email" required>
              Work email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@organisation.com.np"
              className="placeholder:text-ink-500"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="organisation">Organisation</Label>
            <Input
              id="organisation"
              name="organisation"
              autoComplete="organization"
              placeholder="Company, bank, ministry or university"
              className="placeholder:text-ink-500"
            />
          </div>
          <div>
            <Label htmlFor="interest">What are you after?</Label>
            <select
              id="interest"
              name="interest"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              className={`h-10 ${fieldClass}`}
            >
              {GROUPS.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.options.map((o) => (
                    <option key={o} value={value(g.label, o)}>
                      {o}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value={EXPLORING}>{EXPLORING}</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="gpu_hours">Expected GPU hours per month</Label>
          <Input
            id="gpu_hours"
            name="gpu_hours"
            mono
            placeholder="e.g. 400 — or “not sure yet”"
            className="placeholder:text-ink-500"
          />
        </div>

        <div>
          <Label htmlFor="message" required>
            Tell us about the workload
          </Label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Which models, how much data, your timeline, any data-residency rules…"
            className={`resize-y py-2.5 leading-relaxed placeholder:text-ink-500 ${fieldClass}`}
          />
        </div>

        {status === "offline" ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/8 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink-200"
          >
            <Icon name="warning" size={16} weight="fill" className="mt-0.5 shrink-0 text-warning" />
            You seem to be offline, so nothing was sent. Everything you typed is
            still here — try again once you are connected.
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={status === "sending"}
          iconRight={<Icon name="arrow-right" size={16} />}
        >
          {status === "sending" ? "Sending…" : "Request early access"}
        </Button>

        <p className="text-center text-[12.5px] leading-relaxed text-ink-500">
          Sent to our inbox through FormSubmit, a third-party form service. Keep
          confidential details for a secure channel — we&rsquo;ll set one up.
          Or email{" "}
          <a
            href={`mailto:${INBOX}`}
            className="text-hydro underline decoration-hydro/40 underline-offset-4 transition-colors duration-normal hover:text-hydro-300"
          >
            {INBOX}
          </a>{" "}
          directly.
        </p>
      </form>
    </Card>
  );
}
