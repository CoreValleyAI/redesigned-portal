"use client";

/**
 * Job application form.
 *
 * Like the contact form, it posts to FormSubmit, so no backend is needed:
 * the application and the CV arrive by email in the hiring inbox. On an AJAX
 * failure it falls back to a native multipart POST, and `_next` brings the
 * visitor back to this role with ?applied=1. Offline, nothing is sent and
 * everything typed stays in place. The CV is checked in the browser first
 * (type and size), because FormSubmit caps a submission at 10 MB.
 *
 * When the CMS moves to a server in Nepal, applications move there too and
 * this component posts to it instead.
 */
import * as React from "react";
import { Arrow, Button } from "@/components/system/button";
import { Icon } from "@/components/ui";

const INBOX = process.env.NEXT_PUBLIC_APPLY_INBOX || "info@corevalley.ai";
const ENDPOINT = `https://formsubmit.co/ajax/${INBOX}`;
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type Status = "idle" | "sending" | "sent" | "offline";

/** Read fresh each time: the connection can drop while a request is in flight. */
const offline = () => typeof navigator !== "undefined" && navigator.onLine === false;

/* The contact form's fields (components/forms/ascent.tsx), so the two
   forms on the site feel the same. */
const fieldClass =
  "type-body w-full rounded-card border border-line-strong/60 bg-bg px-4 text-ink outline-none transition-[border-color,box-shadow] duration-[var(--dur-short)] placeholder:text-ink-4 hover:border-line-strong focus:border-hydro focus:shadow-[0_0_0_4px_var(--hydro-wash)] aria-[invalid=true]:border-danger";
const inputClass = `h-12 ${fieldClass}`;

const panel = "rounded-panel border border-line bg-bg-raised p-[clamp(1.25rem,5vw,2rem)]";

function Label({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="type-small mb-2 block font-medium text-ink">
      {children}
      {required ? (
        <span aria-hidden="true" className="ml-0.5 text-hydro">
          *
        </span>
      ) : null}
    </label>
  );
}

export function ApplicationForm({
  role,
  team,
  slug,
}: {
  /** Role title, or "General application". */
  role: string;
  team?: string;
  slug: string;
}) {
  const [status, setStatus] = React.useState<Status>("idle");
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [nextUrl, setNextUrl] = React.useState("");
  const [pageUrl, setPageUrl] = React.useState("");
  const doneRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    const here = `${window.location.origin}${BASE}/jobs/${slug}/`;
    setPageUrl(here);
    setNextUrl(`${here}?applied=1#apply`);
    const params = new URLSearchParams(window.location.search);
    if (params.get("applied") === "1") {
      setStatus("sent");
      params.delete("applied");
      const rest = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${rest ? `?${rest}` : ""}#apply`);
    }
  }, [slug]);

  React.useEffect(() => {
    if (status === "sent") doneRef.current?.focus();
  }, [status]);

  function checkFile(input: HTMLInputElement): boolean {
    const file = input.files?.[0];
    let msg: string | null = null;
    if (!file) msg = "Please attach your CV.";
    else if (!/\.(pdf|docx?|DOCX?|PDF)$/.test(file.name)) msg = "Please attach a PDF or Word file.";
    else if (file.size > MAX_BYTES) msg = "That file is over 5 MB. Please send a smaller PDF.";
    setFileError(msg);
    input.setCustomValidity(msg ?? "");
    return !msg;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const cv = form.elements.namedItem("attachment") as HTMLInputElement | null;
    if (cv && !checkFile(cv)) {
      cv.reportValidity();
      return;
    }
    if (!form.reportValidity()) return;
    if (offline()) {
      setStatus("offline");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const data: { success?: string | boolean; message?: string } = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false || data.success === "false") throw new Error(data.message ?? "send failed");
      form.reset();
      setStatus("sent");
    } catch {
      if (offline()) {
        setStatus("offline");
        return;
      }
      // Fall back to a native multipart POST so the application (and its
      // file) still arrives; `_next` brings the visitor back here.
      form.method = "POST";
      form.enctype = "multipart/form-data";
      form.action = `https://formsubmit.co/${INBOX}`;
      form.submit();
    }
  }

  if (status === "sent") {
    return (
      <div className={panel} aria-live="polite">
        <Icon name="check-circle" size={28} weight="duotone" className="text-hydro" />
        <h3 ref={doneRef} tabIndex={-1} className="type-title-3 mt-4 outline-none">
          Application received.
        </h3>
        <p className="type-body mt-2 max-w-[52ch] text-ink-2">
          Thank you. A person on the hiring team reads every application, and we reply to everyone — usually within two
          weeks.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => setStatus("idle")}>
          Send another
        </Button>
      </div>
    );
  }

  const subject = `Application: ${role}${team ? ` (${team})` : ""}`;

  return (
    <div className={panel}>
      <form onSubmit={onSubmit} encType="multipart/form-data" className="space-y-5">
        <input type="hidden" name="_subject" value={subject} />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_captcha" value="false" />
        {nextUrl ? <input type="hidden" name="_next" value={nextUrl} /> : null}
        <input type="hidden" name="role" value={role} />
        {team ? <input type="hidden" name="team" value={team} /> : null}
        {pageUrl ? <input type="hidden" name="role_page" value={pageUrl} /> : null}
        <input type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

        <p className="type-caption text-ink-3">
          Fields marked <span className="text-hydro">*</span> are required.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ap-name" required>
              Full name
            </Label>
            <input id="ap-name" name="name" required autoComplete="name" className={inputClass} />
          </div>
          <div>
            <Label htmlFor="ap-email" required>
              Email
            </Label>
            <input id="ap-email" name="email" type="email" required autoComplete="email" className={inputClass} />
          </div>
          <div>
            <Label htmlFor="ap-phone">Phone</Label>
            <input id="ap-phone" name="phone" type="tel" autoComplete="tel" placeholder="+977" className={inputClass} />
          </div>
          <div>
            <Label htmlFor="ap-city">Where you’re based</Label>
            <input
              id="ap-city"
              name="city"
              autoComplete="address-level2"
              placeholder="e.g. Kathmandu"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="ap-links">LinkedIn, GitHub or portfolio</Label>
          <input id="ap-links" name="links" type="url" placeholder="https://" className={inputClass} />
        </div>

        <div>
          <Label htmlFor="ap-cv" required>
            CV
          </Label>
          <input
            id="ap-cv"
            name="attachment"
            type="file"
            required
            accept={ACCEPT}
            onChange={(e) => checkFile(e.currentTarget)}
            aria-describedby="ap-cv-help"
            className={`${fieldClass} h-auto py-2.5 file:mr-3 file:rounded-pill file:border-0 file:bg-bg-sunken file:px-3.5 file:py-1.5 file:text-[0.8125rem] file:text-ink`}
          />
          <p id="ap-cv-help" className={`type-caption mt-1.5 ${fileError ? "text-warn" : "text-ink-3"}`}>
            {fileError ?? "PDF or Word, up to 5 MB."}
          </p>
        </div>

        <div>
          <Label htmlFor="ap-note">Why this role?</Label>
          <textarea
            id="ap-note"
            name="message"
            rows={5}
            placeholder="A few lines about you and what you’d like to work on."
            className={`resize-y py-3 ${fieldClass}`}
          />
        </div>

        <label className="type-small flex items-start gap-3 text-ink-2">
          <input
            type="checkbox"
            name="consent"
            value="yes"
            required
            className="mt-1 size-4 shrink-0 accent-[var(--hydro)]"
          />
          <span>
            I agree that CoreValley may keep my application for up to 12 months to consider me for this and similar
            roles. It is sent to our inbox through a third-party form service.
          </span>
        </label>

        {status === "offline" ? (
          <p
            role="alert"
            className="type-small flex items-start gap-2 rounded-card border border-warn/30 bg-warn/10 px-4 py-3 text-ink"
          >
            <Icon name="warning" size={16} weight="fill" className="mt-0.5 shrink-0 text-warn" />
            You seem to be offline, so nothing was sent. Everything you entered is still here.
          </p>
        ) : null}

        <Button type="submit" size="lg" className="w-full" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Submit application"}
          <Arrow />
        </Button>
      </form>
    </div>
  );
}
