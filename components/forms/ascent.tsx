"use client";

/**
 * The Ascent (S11) — the request form as a short climb, one question per
 * step. Only "Run AI workloads" takes the full route; partners, press and
 * support answer one question; careers goes straight to the open roles.
 *
 *  · Progress is an altitude line with a camp per step. Forward steps rise
 *    into place, going back settles down (spatially consistent, 06 §2).
 *  · Answers arriving from other pages (?intent, ?product, ?count,
 *    ?duration, ?topic) are pre-filled, so nothing is asked twice.
 *  · Enter advances; focus moves to each new question; errors say how to
 *    fix them and are announced. Drafts survive a reload (sessionStorage).
 *  · While the request is in flight the card wears the Glow — the only
 *    place it appears, because a machine really is working.
 *  · Delivery: FormSubmit's AJAX endpoint, falling back to a native POST
 *    that returns to /contact/?sent=1. Honeypot and a minimum fill time
 *    instead of a CAPTCHA. Without scripting the page shows a plain form.
 */
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/system/button";
import { DotGlyph, type GlyphName } from "@/components/system/dot-glyph";
import { CONTACT, type RouteId } from "@/copy/en/contact";
import { PRODUCTS, type ProductSlug } from "@/copy/en/products";
import { cn } from "@/lib/cn";

type Step = "route" | "run" | "size" | "data" | "message" | "you" | "review";
type Status = "idle" | "sending" | "sent" | "error" | "offline";

interface Draft {
  route: RouteId | null;
  workload: string[];
  details: string;
  product: ProductSlug | "unsure";
  count: number;
  duration: string;
  needs: string[];
  message: string;
  name: string;
  email: string;
  org: string;
  phone: string;
  time: string;
}

const EMPTY: Draft = {
  route: null,
  workload: [],
  details: "",
  product: "unsure",
  count: 1,
  duration: "Not sure yet",
  needs: [],
  message: "",
  name: "",
  email: "",
  org: "",
  phone: "",
  time: "Any time",
};

const DRAFT_KEY = "cv-ascent";
const ENDPOINT = `https://formsubmit.co/ajax/${CONTACT.inbox}`;
const FALLBACK = `https://formsubmit.co/${CONTACT.inbox}`;
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function pathFor(route: RouteId | null): Step[] {
  if (route === "workloads") return ["route", "run", "size", "data", "you", "review"];
  if (route === "partner" || route === "press" || route === "support") return ["route", "message", "you", "review"];
  return ["route"];
}

const STEP_LABEL: Record<Step, string> = {
  route: "Start",
  run: "Workload",
  size: "Size",
  data: "Data",
  message: "Message",
  you: "You",
  review: "Send",
};

/** Milliseconds since a moment captured with now(). */
const now = () => Date.now();
const since = (t: number) => Date.now() - t;

/** Read fresh each time: TypeScript would otherwise narrow it after one check. */
const offline = () => typeof navigator !== "undefined" && navigator.onLine === false;

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

function makeReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `CV-${s}`;
}

/* ── Small field components ─────────────────────────────────────────────── */

function Field({
  label,
  hint,
  error,
  children,
  id,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  id: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="type-kicker text-ink-3">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="type-caption text-ink-3">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="type-caption text-danger"
          style={{ animation: "cv-shake 280ms var(--ease-out)" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "type-body h-13 w-full rounded-card border border-line-strong/60 bg-bg px-4 text-ink outline-none transition-[border-color,box-shadow] duration-[var(--dur-short)] placeholder:text-ink-4 hover:border-line-strong focus:border-hydro focus:shadow-[0_0_0_4px_var(--hydro-wash)] aria-[invalid=true]:border-danger";

function Chip({
  checked,
  onChange,
  children,
  type = "checkbox",
  name,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
  type?: "checkbox" | "radio";
  name: string;
}) {
  return (
    <label
      className={cn(
        "type-small inline-flex cursor-pointer items-center gap-2 rounded-pill border px-4 py-2.5 transition-[background-color,border-color,color,transform] duration-[var(--dur-spring-snappy)] ease-spring has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-hydro active:scale-[0.97]",
        checked ? "border-ink bg-ink text-bg" : "border-line text-ink-2 hover:border-line-strong hover:text-ink",
      )}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full transition-colors", checked ? "bg-hydro" : "bg-line-strong")}
      />
      {children}
    </label>
  );
}

/* ── The Ascent ─────────────────────────────────────────────────────────── */

export function Ascent() {
  const router = useRouter();
  const uid = useId();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [step, setStep] = useState<Step>("route");
  const [dir, setDir] = useState<1 | -1>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [reference, setReference] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const startedAt = useRef(0);
  const firstRender = useRef(true);
  const hydrated = useRef(false);

  const path = pathFor(draft.route);
  const index = path.indexOf(step);

  /* Restore a draft, then apply anything the URL brings. Browser-only
     state (the query string, sessionStorage) can only be read after
     hydration, so this effect sets state on purpose. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    startedAt.current = now();
    const q = new URLSearchParams(window.location.search);
    if (q.get("sent") === "1") {
      setStatus("sent");
      return;
    }
    let next: Draft = EMPTY;
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) next = { ...EMPTY, ...JSON.parse(saved) };
    } catch {
      /* no storage */
    }
    const intent = q.get("intent");
    const product = q.get("product");
    const count = Number(q.get("count"));
    const duration = q.get("duration");
    const topic = q.get("topic");
    if (intent && CONTACT.routes.some((r) => r.id === intent)) next = { ...next, route: intent as RouteId };
    if (product && PRODUCTS.some((p) => p.slug === product)) next = { ...next, product: product as ProductSlug };
    if (count > 0 && count <= 56) next = { ...next, count };
    if (duration && (CONTACT.durations as readonly string[]).includes(duration)) next = { ...next, duration };
    if (topic === "security" && !next.details)
      next = { ...next, details: "We'd like to talk about security and data residency for a review." };
    if (topic === "use-case" && !next.details) next = { ...next, details: "We have a use case we'd like to discuss." };
    hydrated.current = true;
    setDraft(next);
    if (intent && next.route && next.route !== "careers") setStep(pathFor(next.route)[1] ?? "route");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* Keep the draft through a reload. */
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* no storage */
    }
  }, [draft]);

  /* Focus the new question (not on first load). */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step, status]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key as string]) setErrors((e) => ({ ...e, [key as string]: "" }));
  };
  const toggle = (key: "workload" | "needs", value: string) =>
    setDraft((d) => ({ ...d, [key]: d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value] }));

  const validate = (s: Step): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === "route" && !draft.route) e.route = "Choose one to continue.";
    if (s === "run" && !draft.workload.length) e.workload = "Pick at least one — or “Something else”.";
    if (s === "message" && draft.message.trim().length < 10)
      e.message = "A sentence or two, please — at least 10 characters.";
    if (s === "you") {
      if (!draft.name.trim()) e.name = "Your name, so we know who to reply to.";
      if (!emailOk(draft.email)) e.email = "An email address like name@company.com.";
      if ((draft.route === "workloads" || draft.route === "partner") && !draft.org.trim())
        e.org = "Your organisation, or “Independent”.";
    }
    return e;
  };

  const go = (to: Step, d: 1 | -1) => {
    setDir(d);
    setStep(to);
  };

  const next = () => {
    const e = validate(step);
    if (Object.values(e).some(Boolean)) {
      setErrors(e);
      return;
    }
    if (step === "route" && draft.route === "careers") {
      router.push("/jobs");
      return;
    }
    const to = path[index + 1];
    if (to) go(to, 1);
  };
  const back = () => {
    const to = path[index - 1];
    if (to) go(to, -1);
  };

  const submit = async () => {
    for (const s of path) {
      const e = validate(s);
      if (Object.values(e).some(Boolean)) {
        setErrors(e);
        go(s, -1);
        return;
      }
    }
    // Spam guard: a human takes more than a couple of seconds.
    if (since(startedAt.current) < 2500) return;
    if (offline()) {
      setStatus("offline");
      return;
    }
    const ref = makeReference();
    setReference(ref);
    setStatus("sending");
    const body = buildForm(draft, ref);
    try {
      const res = await fetch(ENDPOINT, { method: "POST", headers: { Accept: "application/json" }, body });
      const data: { success?: string | boolean } = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false || data.success === "false") throw new Error("rejected");
      // Let the Glow be seen for a breath before the answer.
      await new Promise((r) => setTimeout(r, 450));
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* no storage */
      }
      setStatus("sent");
    } catch {
      if (offline()) {
        setStatus("offline");
        return;
      }
      nativePost(body);
    }
  };

  const product = PRODUCTS.find((p) => p.slug === draft.product);
  const route = CONTACT.routes.find((r) => r.id === draft.route);

  /* ── Sent ── */
  if (status === "sent") {
    return (
      <div
        className="rounded-panel border border-line bg-bg-raised p-7 md:p-10"
        style={{ animation: "cv-rise-in 600ms var(--ease-expo) both" }}
      >
        <div className="flex flex-col gap-6">
          <DotGlyph name="contact" className="size-12" on />
          <h2 ref={headingRef} tabIndex={-1} className="type-title-1 outline-none">
            {CONTACT.done.title}
          </h2>
          <p className="type-lead text-ink-2">{CONTACT.done.lead}</p>
          {reference && (
            <p className="type-mono rounded-card bg-bg-sunken px-4 py-3 text-ink">
              Reference · <span className="font-semibold">{reference}</span>
            </p>
          )}
          <ol className="flex flex-col gap-3 border-t border-line pt-6">
            {CONTACT.done.next.map((s, i) => (
              <li key={s} className="type-body flex gap-4 text-ink-2">
                <span className="type-kicker mt-1 text-hydro-ink light:text-hydro">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  const camps = path.length > 1 ? path : (["route", "run", "size", "data", "you", "review"] as Step[]);

  return (
    <div className="grid gap-8 lg:grid-cols-[11rem_1fr] lg:gap-12">
      {/* The altitude line. */}
      <ol aria-label="Progress" className="flex gap-2 lg:flex-col lg:gap-0">
        {camps.map((s, i) => {
          const done = i < index;
          const here = i === index;
          return (
            <li key={s} className="flex flex-1 items-center gap-3 lg:flex-none lg:py-3">
              <span
                aria-hidden="true"
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-[var(--dur-base)] lg:size-3 lg:flex-none",
                  done ? "bg-hydro" : here ? "bg-ink" : "bg-line",
                )}
              />
              <span
                className={cn("type-kicker hidden lg:inline", here ? "text-ink" : done ? "text-ink-2" : "text-ink-4")}
              >
                {STEP_LABEL[s]}
                <span className="sr-only">{done ? " (done)" : here ? " (current)" : ""}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step === "review") void submit();
          else next();
        }}
        className="glow-frame rounded-panel"
        data-glow={status === "sending" ? "on" : undefined}
      >
        <div className="relative overflow-hidden rounded-panel border border-line bg-bg-raised p-6 md:p-10">
          {/* Honeypot: invisible to people, tempting to bots. */}
          <input
            type="text"
            name="_honey"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-px w-px opacity-0"
          />

          <fieldset
            key={step}
            className="flex min-w-0 flex-col gap-8"
            style={{ animation: `${dir === 1 ? "cv-step-up" : "cv-step-down"} 520ms var(--ease-expo) both` }}
          >
            <legend className="contents">
              <h2 ref={headingRef} tabIndex={-1} className="type-title-2 outline-none">
                {question(step, draft.route)}
              </h2>
            </legend>

            {step === "route" && (
              <div className="flex flex-col gap-3">
                <div role="radiogroup" aria-label="Route" className="grid gap-3 sm:grid-cols-2">
                  {CONTACT.routes.map((r) => (
                    <label
                      key={r.id}
                      className={cn(
                        "group flex cursor-pointer items-start gap-4 rounded-card border p-4 transition-[border-color,background-color,transform] duration-[var(--dur-spring-snappy)] ease-spring has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-hydro active:scale-[0.98]",
                        draft.route === r.id ? "border-hydro bg-hydro-wash" : "border-line hover:border-line-strong",
                      )}
                    >
                      <input
                        type="radio"
                        name={`${uid}-route`}
                        checked={draft.route === r.id}
                        onChange={() => set("route", r.id)}
                        className="sr-only"
                      />
                      <DotGlyph name={r.glyph as GlyphName} className="size-8" on={draft.route === r.id} />
                      <span className="flex flex-col gap-0.5">
                        <span className="type-body font-semibold text-ink">{r.title}</span>
                        <span className="type-small text-ink-2">{r.body}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {errors.route && <p className="type-caption text-danger">{errors.route}</p>}
              </div>
            )}

            {step === "run" && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap gap-2">
                  {CONTACT.workloads.map((w) => (
                    <Chip
                      key={w}
                      name={`${uid}-workload`}
                      checked={draft.workload.includes(w)}
                      onChange={() => toggle("workload", w)}
                    >
                      {w}
                    </Chip>
                  ))}
                </div>
                {errors.workload && <p className="type-caption text-danger">{errors.workload}</p>}
                <Field
                  id={`${uid}-details`}
                  label="Anything else? (optional)"
                  hint="The model, the data, the deadline — a sentence is plenty."
                >
                  <textarea
                    id={`${uid}-details`}
                    rows={3}
                    value={draft.details}
                    onChange={(e) => set("details", e.target.value)}
                    className={cn(inputClass, "h-auto min-h-[6rem] resize-y py-3")}
                  />
                </Field>
              </div>
            )}

            {step === "size" && (
              <div className="flex flex-col gap-7">
                <Field id={`${uid}-product`} label="Product">
                  <select
                    id={`${uid}-product`}
                    value={draft.product}
                    onChange={(e) => set("product", e.target.value as Draft["product"])}
                    className={inputClass}
                  >
                    <option value="unsure">Not sure — help me choose</option>
                    {PRODUCTS.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="grid gap-7 sm:grid-cols-2">
                  <Field
                    id={`${uid}-count`}
                    label={draft.product === "mig-slicing" ? "How many slices" : "How many GPUs"}
                  >
                    <input
                      id={`${uid}-count`}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={draft.product === "mig-slicing" ? 56 : 8}
                      value={draft.count}
                      onChange={(e) => set("count", Math.max(1, Math.min(56, Number(e.target.value) || 1)))}
                      className={inputClass}
                    />
                  </Field>
                  <Field id={`${uid}-duration`} label="For how long">
                    <select
                      id={`${uid}-duration`}
                      value={draft.duration}
                      onChange={(e) => set("duration", e.target.value)}
                      className={inputClass}
                    >
                      {CONTACT.durations.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <p className="type-small rounded-card bg-bg-sunken p-4 text-ink-2">
                  {product ? product.name : "Not sure yet"} · {draft.count} ×{" "}
                  {draft.product === "mig-slicing" ? "slice" : "NVIDIA H200 NVL"} · {draft.duration.toLowerCase()}
                </p>
              </div>
            )}

            {step === "data" && (
              <div className="flex flex-col gap-4">
                <p className="type-body text-ink-2">
                  Tick any that apply — it helps us plan where and how your data is held.
                </p>
                <div className="flex flex-wrap gap-2">
                  {CONTACT.needs.map((n) => (
                    <Chip
                      key={n.id}
                      name={`${uid}-needs`}
                      checked={draft.needs.includes(n.label)}
                      onChange={() => toggle("needs", n.label)}
                    >
                      {n.label}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {step === "message" && (
              <Field id={`${uid}-message`} label="Your message" error={errors.message}>
                <textarea
                  id={`${uid}-message`}
                  rows={5}
                  value={draft.message}
                  onChange={(e) => set("message", e.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? `${uid}-message-error` : undefined}
                  className={cn(inputClass, "h-auto min-h-[9rem] resize-y py-3")}
                />
              </Field>
            )}

            {step === "you" && (
              <div className="grid gap-6 sm:grid-cols-2">
                <Field id={`${uid}-name`} label="Name" error={errors.name}>
                  <input
                    id={`${uid}-name`}
                    autoComplete="name"
                    value={draft.name}
                    onChange={(e) => set("name", e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? `${uid}-name-error` : undefined}
                    className={inputClass}
                  />
                </Field>
                <Field id={`${uid}-email`} label="Work email" error={errors.email}>
                  <input
                    id={`${uid}-email`}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={draft.email}
                    onChange={(e) => set("email", e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? `${uid}-email-error` : undefined}
                    className={inputClass}
                  />
                </Field>
                <Field id={`${uid}-org`} label="Organisation" error={errors.org}>
                  <input
                    id={`${uid}-org`}
                    autoComplete="organization"
                    value={draft.org}
                    onChange={(e) => set("org", e.target.value)}
                    aria-invalid={Boolean(errors.org)}
                    aria-describedby={errors.org ? `${uid}-org-error` : undefined}
                    className={inputClass}
                  />
                </Field>
                <Field id={`${uid}-phone`} label="Phone (optional)">
                  <input
                    id={`${uid}-phone`}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={draft.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field id={`${uid}-time`} label="Best time to reach you">
                  <select
                    id={`${uid}-time`}
                    value={draft.time}
                    onChange={(e) => set("time", e.target.value)}
                    className={inputClass}
                  >
                    {CONTACT.times.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            {step === "review" && (
              <dl className="flex flex-col">
                {summary(draft, product?.name, route?.title).map(([k, v, to]) => (
                  <div
                    key={k}
                    className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 border-t border-line py-4 sm:grid-cols-[9rem_1fr_auto]"
                  >
                    <dt className="type-kicker text-ink-3">{k}</dt>
                    <dd className="type-body col-span-2 row-start-2 text-ink sm:col-span-1 sm:row-start-1">
                      {v || "—"}
                    </dd>
                    <dd className="row-start-1 sm:col-start-3">
                      <button
                        type="button"
                        onClick={() => go(to, -1)}
                        className="type-small text-ink-2 underline decoration-line-strong underline-offset-4 hover:text-ink"
                      >
                        Edit<span className="sr-only"> {k}</span>
                      </button>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </fieldset>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            {index > 0 ? (
              <Button variant="ghost" onClick={back}>
                Back
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" size="lg" disabled={status === "sending"} magnetic>
              {step === "review"
                ? status === "sending"
                  ? "Sending…"
                  : "Send request"
                : step === "route" && draft.route === "careers"
                  ? "See open roles"
                  : "Continue"}
            </Button>
          </div>

          <div aria-live="polite" className="type-small mt-4 min-h-[1.5em] text-ink-2">
            {status === "offline" && "You seem to be offline. Nothing was sent; your answers are still here."}
            {status === "error" && "That didn't go through. Try again, or write to " + CONTACT.inbox + "."}
          </div>
          <p className="type-caption mt-2 text-ink-3">{CONTACT.disclosure}</p>
        </div>
      </form>
    </div>
  );
}

function question(step: Step, route: RouteId | null): string {
  if (step === "message") {
    return route === "partner" || route === "press" || route === "support"
      ? CONTACT.steps.message[route]
      : CONTACT.steps.you;
  }
  return CONTACT.steps[step];
}

function summary(d: Draft, productName?: string, routeTitle?: string): [string, string, Step][] {
  const rows: [string, string, Step][] = [["Here for", routeTitle ?? "", "route"]];
  if (d.route === "workloads") {
    rows.push(["Workload", [d.workload.join(", "), d.details].filter(Boolean).join(" — "), "run"]);
    rows.push(["Size", `${productName ?? "Not sure yet"} · ${d.count} · ${d.duration}`, "size"]);
    rows.push(["Data", d.needs.join(", ") || "No special needs", "data"]);
  } else {
    rows.push(["Message", d.message, "message"]);
  }
  rows.push(["You", [d.name, d.email, d.org, d.phone].filter(Boolean).join(" · "), "you"]);
  return rows;
}

function buildForm(d: Draft, reference: string): FormData {
  const f = new FormData();
  const product = PRODUCTS.find((p) => p.slug === d.product)?.name ?? "Not sure yet";
  const route = CONTACT.routes.find((r) => r.id === d.route)?.title ?? "";
  f.set("_subject", `${route} — ${d.org || d.name} (${reference})`);
  f.set("_template", "table");
  f.set("_captcha", "false");
  f.set("_next", `${window.location.origin}${BASE}/contact/?sent=1`);
  f.set("Reference", reference);
  f.set("Route", route);
  if (d.route === "workloads") {
    f.set("Workload", d.workload.join(", "));
    if (d.details) f.set("Details", d.details);
    f.set("Product", product);
    f.set("Size", String(d.count));
    f.set("Duration", d.duration);
    f.set("Data needs", d.needs.join(", ") || "None given");
  } else {
    f.set("Message", d.message);
  }
  f.set("Name", d.name);
  f.set("Email", d.email);
  if (d.org) f.set("Organisation", d.org);
  if (d.phone) f.set("Phone", d.phone);
  f.set("Best time", d.time);
  f.set("_replyto", d.email);
  return f;
}

/** The relay refused the AJAX call: post the same fields natively instead. */
function nativePost(body: FormData) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = FALLBACK;
  form.style.display = "none";
  for (const [k, v] of body.entries()) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    input.value = String(v);
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}
