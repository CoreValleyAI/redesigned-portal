# 09 — Security & Compliance

**Owner:** Kaustuv

**Status:** ⚠️ **Partial** — authentication is implemented to a production-grade
standard (confidential client, PKCE, federated logout, token refresh).
Authorisation, secret management, transport security and telemetry are **not**.

> This document describes the security posture of a **pre-production**
> system. Every ⚠ and ❌ below is a real, currently-present condition, not a
> hypothetical.

---

## 1. Authentication posture

### ✅ What is done correctly

| Control | Implementation |
|---|---|
| Confidential OIDC client | `publicClient: false`, client secret held server-side only |
| PKCE | `S256` enforced by the realm; verified in the authorization redirect |
| No credential handling in the app | The auth modal has no email or password field. Passwords never reach the Next.js process. |
| Server-side token exchange | Code-for-token happens in the Auth.js handler with the client secret |
| Encrypted session | Auth.js JWE session cookie, `HttpOnly`, `SameSite=Lax`, `Path=/` |
| Refresh tokens never exposed | `idToken`, `refreshToken`, `expiresAt` stay inside the encrypted JWT and are never serialised into `/api/auth/session` |
| Federated logout | RP-initiated logout with `id_token_hint`; verified to terminate the SSO session |
| Open-redirect defence | `safePath()` rejects anything not a same-site path, including `//evil.com` |
| Brute-force protection | `bruteForceProtected: true` on the realm |
| Fail-closed role derivation | Missing/malformed `realm_access.roles` yields `member`, never `admin` |

### The session cookie

```
authjs.session-token.0   HttpOnly · SameSite=Lax · Path=/
authjs.session-token.1   (chunked when the JWE exceeds the 4 KB cookie limit)
authjs.csrf-token        HttpOnly
authjs.callback-url      HttpOnly
```

⚠ **`Secure` is absent locally** because the local stack is HTTP. Auth.js sets the
`__Secure-` cookie prefix automatically when the resolved URL is HTTPS, so this
corrects itself under TLS — but only if `NEXTAUTH_URL` / the inferred origin is
actually `https://`.

---

## 2. Critical risks

Ordered by severity. Items marked ✅ have been fixed; the rest are present
**today**.

### ✅ R-1 — An unset `KEYCLOAK_ISSUER` granted everyone `admin` — **fixed**

Mode selection is still by variable presence:

```ts
export const isKeycloakEnabled = KEYCLOAK_ISSUER.length > 0;
```

Previously, an empty or missing `KEYCLOAK_ISSUER` in a deployed environment fell
back to the mock Credentials provider, whose `authorize()` performs **no
verification** and returned a user with `role: "admin"` — and to a **hard-coded
signing secret** committed to the repository, with which anyone could forge a
session JWT for any environment running in that state.

**Mitigation (✅ implemented in `lib/auth.ts`):** the fallback is gone. Mock mode
is opt-in and development-only, and a build that can reach no valid mode throws at
import time rather than starting with authentication disabled.

```ts
export const isMockEnabled =
  !isKeycloakEnabled &&
  !STATIC_EXPORT &&
  process.env.NODE_ENV !== "production" &&
  process.env.AUTH_ALLOW_MOCK === "true";

if (!isKeycloakEnabled && !STATIC_EXPORT) {
  if (process.env.NODE_ENV === "production") throw new Error(/* … */);
  if (!isMockEnabled) throw new Error(/* … */);
}
```

`AUTH_SECRET` now has **no fallback** and is required for every server build,
including mock mode. A per-process random value is not used deliberately:
middleware (Edge) and the route handler (Node) are separate runtimes and would
derive different keys. `MOCK_USER.role` is also `member` rather than `admin` — the
one identity nobody authenticates to reach gets the lower role.

The static export is exempt from both guards: it has no server, no route handler,
no middleware and no cookie, and registers no providers at all.

Verified: a server build with no auth config fails with the guard's error; the CI
static export (`NEXT_STATIC_EXPORT=true`, no auth env) builds clean; `next dev`
without `AUTH_ALLOW_MOCK` returns 500 with the guard's error; with it, only the
`mock` provider registers.

### 🔴 R-2 — Committed secrets

| Secret | Location | Exposure |
|---|---|---|
| Client secret `corevalley-portal-dev-secret` | `keycloak/corevalley-realm.json`, `.env.example`, `KeyCloak_Readme.md` | Public repository |
| Keycloak admin `admin` / `admin` | `docker-compose.yml` | Public repository |
| Test passwords `kaustuv123`, `beta123` | `keycloak/corevalley-realm.json` | Public repository |
| ~~Mock signing secret~~ | ~~`lib/auth.ts`~~ | **Removed** — `AUTH_SECRET` has no fallback (R-1) |
| PostgreSQL password `keycloak_dev_pw` | `docker-compose.yml` | Public repository |

All are development-only by intent. **They must never appear in an environment
reachable from the internet.** There is no secret manager, no sealed-secrets
mechanism and no rotation procedure beyond
[SOP-8](08-operations-runbook.md#sop-8--rotate-the-keycloak-client-secret).

### 🟠 R-3 — No authorisation enforcement

`session.user.role` is mapped, typed and displayed. **Nothing checks it.** No
route, page, layout or server action gates on role. A `member` sees the identical
console to an `admin`, including billing, audit and security screens.

Compounding this: two role vocabularies exist and do not match —
`admin | member` from Keycloak, and `owner | admin | engineer | billing | viewer`
in `lib/api/types.ts`. See
[03 §8.2](03-keycloak-identity.md#82-two-role-vocabularies-exist-and-do-not-match).

### 🟠 R-4 — No tenant isolation

One realm, one `Organization` fixture, no tenant dimension in any query. There is
no code path that could scope data by tenant, because the data layer has no tenant
concept. Multi-tenancy is a data-model change, not a configuration change. See
[03 §2](03-keycloak-identity.md#2-multi-tenant-realm-strategy).

The identifier that would key it, `session.user.org`, is now administrator-assigned
rather than self-service: the realm's `org` attribute is `permissions.edit:
["admin"]` with `unmanagedAttributePolicy: ADMIN_EDIT`, so a self-registered user
can no longer claim another organisation before any code starts trusting the claim.

⚠ One user-influenced path remains by design: `orgFromProfile()` falls back to the
**email domain** when the `org` claim is absent, and the realm has
`verifyEmail: false`, so a self-registered user can still influence that fallback
string. It is display-only today. **Remove the fallback (or enable `verifyEmail`)
before `session.user.org` gates anything.**

### 🟠 R-5 — Transport security is off

| Setting | Value | Impact |
|---|---|---|
| Realm `sslRequired` | `none` | Keycloak accepts plaintext HTTP |
| Keycloak run mode | `start-dev` | Relaxed hostname checks, dev profile |
| `KC_HOSTNAME_STRICT` | `"false"` | Host header is trusted |
| App `trustHost` | `true` | Auth.js trusts the `Host` header to build callback URLs |

`trustHost: true` is **required** behind a reverse proxy and is **dangerous
without one** — a forged `Host` header can redirect the OIDC callback. It must be
paired with a proxy that overwrites `Host`/`X-Forwarded-Host`, or with an explicit
`NEXTAUTH_URL`.

### 🟠 R-6 — Redirect URI wildcard

The client registers `http://localhost:3000/*` alongside the exact callback. The
wildcard exists so `/api/auth/callback/keycloak-register` resolves without a second
entry. In production, register both callbacks explicitly and **remove the
wildcard** — a broad wildcard weakens the primary defence against authorization-code
interception.

### 🟡 R-7 — Open self-registration, unverified email

`registrationAllowed: true` with `verifyEmail: false` and no SMTP configured.
Anyone can create an account with an address they do not control. For a closed
beta, disable registration and invite users, or gate on email domain.

Password reset is enabled but **cannot deliver** without SMTP.

### 🟡 R-8 — Access token exposed to the browser

`session.accessToken` is serialised into the `/api/auth/session` response and is
therefore readable by any script on the page.

```ts
session.accessToken = token.accessToken;
```

Today this is inert — no consumer uses it and there is no resource server to
attack. It becomes a real risk the moment a control-plane API accepts it. Before
then, either remove it from the session and attach it server-side, or accept it
deliberately with a documented XSS threat model.

### 🟡 R-9 — Customer data through a third-party relay

`components/marketing/contact-form.tsx` posts names, work emails, organisations
and workload descriptions to `formsubmit.co`. No DPA. `_captcha=false` disables the
relay's own CAPTCHA, leaving only a honeypot field.

For a platform whose value proposition is in-country data residency, routing
customer enquiries through an offshore third party is a contradiction worth
resolving before launch.

### 🟡 R-10 — No security headers

No CSP, no HSTS, no `X-Frame-Options`, no `Referrer-Policy`, no
`Permissions-Policy`. `next.config.ts` sets only a cache header for `/brand/*`, and
`poweredByHeader: false`.

⚠ Any headers added via `next.config.ts` `headers()` are **ignored in the static
export** — Next.js warns about this during the Pages build.

### 🟡 R-11 — Single-flight refresh is not implemented

Concurrent requests inside the refresh window each call `refreshAccessToken()`.
Harmless today. If Keycloak is configured with `revokeRefreshToken: true`, a
double-refresh invalidates the token family and both requests fail. **Fix before
enabling refresh-token rotation.**

---

## 3. Audit chain

`lib/api/types.ts` models a tamper-evident hash chain, and `verifyAuditChain()`
walks it:

```ts
export interface AuditLogEntry {
  // …
  hash: string;          // commits to its predecessor
  previousHash: string;
}
```

```ts
verifyAuditChain: async () => {
  let previousHash = "0000000000000000";
  for (const e of [...AUDIT_LOG].reverse()) {
    const payload = `${e.at}|${e.actorId}|${e.action}|${e.resourceId}|${e.outcome}`;
    if (chainHash(previousHash, payload) !== e.hash) { broken = e.id; break; }
    previousHash = e.hash;
  }
  // …
}
```

⚠ **The hash function is explicitly not cryptographic.** From the source:

```ts
/**
 * Cheap, stable content hash for the audit chain. Not cryptographic — it
 * demonstrates the tamper-evident structure without pulling in a crypto
 * dependency for demo data.
 */
export function chainHash(previousHash: string, payload: string): string { … }
```

It is two FNV-1a rounds. It demonstrates the **structure**; it provides no
tamper resistance. A real audit chain needs SHA-256 (or an HMAC with a
server-held key), append-only storage, and ideally periodic anchoring.

Also note: **the audit log is generated demo data**, not a record of real activity.
Do not use `/portal/audit` for incident reconstruction — see
[08 §3.2](08-operations-runbook.md).

---

## 4. Compliance surface

`/portal/security` renders a `ComplianceState` with 10 `ComplianceControl`
fixtures. It is **UI backed by fixtures**, not an attestation.

One deliberate correctness note is carried in the type definition and must not be
lost when this becomes real:

```ts
export interface ComplianceState {
  framework: string;
  /** Type I attests design of controls at a point in time, not operating
   *  effectiveness over a period — the copy must not overstate this. */
  posture: string;
  // …
}
```

`Certificate` models auto-renewal and expiry status; `listCertificates()` returns
fixtures. There is no certificate lifecycle integration.

---

## 5. Dependency posture

| | |
|---|---|
| Direct dependencies | 8 runtime, 11 dev |
| `next-auth` | `5.0.0-beta.32` — **a beta release on the critical auth path** |
| Automated dependency scanning | ❌ None (no Dependabot, no `npm audit` in CI) |
| Lockfile | `package-lock.json`, committed; CI uses `npm ci` |

⚠ Auth.js v5 is pre-release. Breaking changes between betas are expected. Pin the
exact version (currently `^5.0.0-beta.32` — a caret on a beta range) and review the
changelog before upgrading.

---

## 6. Threat model summary

| Threat | Mitigated? | By what |
|---|---|---|
| Credential theft from the app | ✅ | The app never sees a password |
| Authorization-code interception | ✅ | PKCE `S256` |
| CSRF on auth endpoints | ✅ | Auth.js CSRF token + `SameSite=Lax` |
| Session cookie theft via JS | ✅ | `HttpOnly` |
| Open redirect via `callbackUrl` | ✅ | `safePath()` |
| Session fixation after logout | ✅ | Federated logout |
| Brute-force password guessing | ✅ | Keycloak brute-force protection |
| Privilege escalation | ❌ | No authorisation checks exist |
| Cross-tenant data access | ❌ | No tenant boundary exists |
| Session forgery | ⚠ | Only if the app runs in mock mode with the committed secret |
| Network interception | ❌ | No TLS in the local stack |
| XSS → token exfiltration | ⚠ | No CSP; `accessToken` is browser-readable |
| Supply-chain compromise | ❌ | No scanning, beta dependency on the auth path |
| Data exfiltration via the contact form | ❌ | Third-party relay, no DPA |

---

## 7. Production gate

**Do not deploy to an internet-reachable environment until every item is closed.**

### Blocking

- [ ] **R-1** — Fail startup in production when `KEYCLOAK_ISSUER` is unset.
- [ ] **R-2** — Rotate every committed secret; move to a secret manager; remove the
      working client secret from `.env.example`.
- [ ] **R-5** — TLS everywhere. Realm `sslRequired: external`; Keycloak `start`
      (not `start-dev`); `KC_HOSTNAME` set with `KC_HOSTNAME_STRICT=true`.
- [ ] **R-5** — Put the app behind a reverse proxy that overwrites `Host`, or set
      `NEXTAUTH_URL` explicitly.
- [ ] **R-6** — Remove the redirect-URI wildcard; register both callbacks.
- [ ] **`AUTH_SECRET`** — generated per environment, never reused.
- [ ] **Portal rendering** — add `force-dynamic` before any real backend, or every
      tenant is served build-time data ([07 §3](07-build-deploy-and-environments.md)).

### Required before customer data exists

- [ ] **R-3** — Enforce authorisation; reconcile the two role vocabularies.
- [ ] **R-4** — Tenant isolation in the data model and every query.
- [ ] **R-7** — Close self-registration or gate it; configure SMTP; enable
      `verifyEmail`.
- [ ] **R-8** — Decide the access-token exposure model.
- [ ] **R-9** — Replace or contract the contact-form relay.
- [ ] **R-10** — CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`,
      `Permissions-Policy`.
- [ ] **Audit chain** — SHA-256 or HMAC; append-only storage; real events.
- [ ] **Keycloak backups** — the `kc-pgdata` volume has none.
- [ ] **MFA** — add OTP as a required action or a conditional browser flow.
- [ ] **Telemetry** — auth failure rates, refresh failures, error reporting.
- [ ] **R-11** — Single-flight refresh before enabling rotation.
- [ ] **R-12** — Dependency scanning; pin `next-auth` exactly.

### Product gate

- [ ] **Placeholder pricing** — 24 rates require commercial approval before any
      figure is shown to a customer. See [05](05-billing-and-metering.md).
