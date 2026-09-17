# CoreValley Platform Engineering Wiki

Internal technical documentation for the CoreValley multi-tenant AI cloud —
customer control plane, identity, billing and platform surfaces.

**Audience:** senior engineers, DevOps and backend developers joining the team.
Assumes fluency in TypeScript, React Server Components, OIDC and Kubernetes.

---

## Reading order

New joiners should read 01 → 02 → 03. Everything else is reference.

| # | Document | Covers |
|---|---|---|
| [01](01-platform-architecture.md) | **Platform Architecture** | System context, repo topology, runtime topology, rendering model, boundaries |
| [02](02-web-portal-control-plane.md) | **Web Portal & Customer Control Plane** | Frontend stack, state management, service layers, workflows, API contracts, runbook |
| [03](03-keycloak-identity.md) | **Keycloak Authentication & Identity** | Realm strategy, OIDC flow, claim mapping, SSO integration matrix, token lifecycle |
| [04](04-data-model-and-api-contract.md) | **Data Model & API Contract** | Domain entities, the 71-method client interface, proposed REST surface, error strategy |
| [05](05-billing-and-metering.md) | **Billing & Metering** | Integer-paisa arithmetic, rate catalogue, meters, invoice derivation, pricing controls |
| [06](06-design-system-and-frontend.md) | **Design System & Frontend** | Token architecture, cascade layers, component inventory, hydration determinism |
| [07](07-build-deploy-and-environments.md) | **Build, Deploy & Environments** | Dual build targets, environment matrix, CI/CD, static-export mechanics |
| [08](08-operations-runbook.md) | **Operations Runbook** | Health checks, telemetry, local stack operations, incident playbooks |
| [09](09-security-and-compliance.md) | **Security & Compliance** | Threat model, secret handling, audit chain, production gates |
| [10](10-implementation-status.md) | **Implementation Status** | As-built vs. designed vs. absent — the authoritative gap register |

---

## Status legend

Every major section carries a status banner. It is not decoration — treat it as
load-bearing metadata.

| Badge | Meaning |
|---|---|
| ✅ **Implemented** | Code exists in this repo, builds, and has been exercised. Described as-built. |
| ⚠️ **Partial** | Some of it exists. The banner states precisely which part. |
| ❌ **Not implemented** | No code exists. Any configuration shown is labelled **PROPOSED** and is design intent only. |

**Rule for contributors:** never describe a `PROPOSED` block as though it were
deployed, and never remove a `❌` banner without landing the code and a
verification record in [08](08-operations-runbook.md).

---

## Ownership

| Domain | Owner | Support |
|---|---|---|
| Web Portal & Customer Control Plane | Kaustuv | Abhigyan |
| Keycloak Authentication & Identity | Kaustuv | — |
| Billing & Metering (catalogue, invoice derivation) | Kaustuv | — |
| Design System integration | Kaustuv | — |
| Commercial pricing approval | **Unassigned — blocking** | — |

---

## Repository

| | |
|---|---|
| Repo | `CoreValleyAI/client-portal` |
| Default branch | `main` |
| Runtime | Node ≥ 20.9 |
| Package name | `corevalley-web-portal` |

### Related documents outside this folder

| Path | Purpose |
|---|---|
| [`../README.md`](../README.md) | Repository README — product-facing overview and quick start |
| [`../KeyCloak_Readme.md`](../KeyCloak_Readme.md) | Hands-on Keycloak setup guide. [03](03-keycloak-identity.md) is the architectural treatment; that file is the operator's manual. |

---

## Documentation conventions

- **Money** is always written as integer paisa in code and as `NPR x,xxx.xx` in
  prose. Never use floats for money — see [05](05-billing-and-metering.md).
- **Rates** quoted anywhere in this wiki are engineering placeholders. They carry
  no commercial approval. Do not quote them to a customer.
- **Code blocks** are copied from the repository verbatim, or explicitly marked
  `PROPOSED`.
- **Verification records** state the command that was run and its actual output.
  A claim without one is a claim, not a fact.

---

## Global blockers

Three items gate production launch. All are tracked in
[10 — Implementation Status](10-implementation-status.md).

| Blocker | Owner | Detail |
|---|---|---|
| **Placeholder pricing** | Unassigned | 24 NPR rate literals in `lib/catalog.ts` have no commercial approval. `CATALOG.meta.pricingIsPlaceholder` is `true`. |
| **No backend** | Kaustuv | The portal runs entirely on an in-memory mock. `lib/api/http.ts` has 71 stubs, all throwing `NotImplementedError`. |
| **Single-realm identity** | Kaustuv | Keycloak works, but there is one shared realm. No per-tenant realm provisioning exists. |
