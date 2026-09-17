# 04 — Data Model & API Contract

**Owner:** Kaustuv

**Status:** ⚠️ **Partial** — the contract and the domain model are complete and
compile-enforced. There is no server implementing them.

| Artefact | Status |
|---|---|
| `lib/api/types.ts` — domain model, 40+ types | ✅ Implemented |
| `lib/api/client.ts` — `CoreValleyClient`, 71 methods | ✅ Implemented |
| `lib/api/mock.ts` — in-memory implementation | ✅ Implemented |
| `lib/api/http.ts` — REST implementation | ❌ 71 stubs, all throw `NotImplementedError` |
| Control-plane service | ❌ Does not exist |
| Persistent schema (DDL, migrations) | ❌ Does not exist |
| REST/GraphQL specification (OpenAPI, SDL) | ❌ Does not exist |

---

## 1. The contract

`CoreValleyClient` is the specification a control-plane API must satisfy. It was
written **before** either implementation so the interface stays honestly
implementable over HTTP.

### 1.1 Structural invariants

| Invariant | Enforced by | Consequence of breaking it |
|---|---|---|
| Every method returns a `Promise` | Interface signature | A synchronous read cannot survive a network boundary |
| No live object references escape | `mock.ts` deep-clones every return value | A screen could mutate the store and diverge from a real backend |
| Subscriptions return `Unsubscribe`, never a transport handle | `export type Unsubscribe = () => void` | Swapping `setInterval` for SSE would touch every screen |
| Both implementations stay in step | `satisfies CoreValleyClient` on `mockClient` **and** `httpClient` | Signature drift becomes a runtime surprise instead of a compile error |

```ts
export type Unsubscribe = () => void;

export interface UsageQuery {
  meterIds: MeterId[];
  window: UsageWindow;
  projectId?: string;
  subjectId?: string;
}
```

### 1.2 Implementation selection

```ts
export function getClient(): CoreValleyClient {
  return process.env.NEXT_PUBLIC_API_MODE === "http" ? httpClient : mockClient;
}
```

Static imports, not `require()` — `require` is unavailable in client bundles.
Because `NEXT_PUBLIC_API_MODE` is inlined at build time, the unused branch is dead
code and is eliminated from the production bundle.

```bash
NEXT_PUBLIC_API_MODE=http npm run build   # compiles against the real-backend stub
```

Verified counts:

```bash
$ sed -n '/^export interface CoreValleyClient/,/^}/p' lib/api/client.ts | grep -cE '^\s+[a-zA-Z]+(<[^>]*>)?\('
71
$ grep -c 'todo("' lib/api/http.ts
71
```

---

## 2. Method inventory (71)

Grouped as in `client.ts`. The **Proposed REST** column is ❌ **design intent** —
no such endpoint exists.

### Identity — 10

| Method | Signature | Proposed REST |
|---|---|---|
| `getCurrentUser` | `(): Promise<User>` | `GET /v1/me` |
| `getOrganization` | `(): Promise<Organization>` | `GET /v1/org` |
| `listUsers` | `(): Promise<User[]>` | `GET /v1/users` |
| `inviteUser` | `({ email, role }): Promise<User>` | `POST /v1/users/invitations` |
| `updateUserRole` | `(userId, role): Promise<User>` | `PATCH /v1/users/{id}` |
| `removeUser` | `(userId): Promise<void>` | `DELETE /v1/users/{id}` |
| `listProjects` | `(): Promise<Project[]>` | `GET /v1/projects` |
| `createProject` | `({ name, description }): Promise<Project>` | `POST /v1/projects` |
| `updateProject` | `(id, patch): Promise<Project>` | `PATCH /v1/projects/{id}` |
| `archiveProject` | `(id): Promise<void>` | `POST /v1/projects/{id}:archive` |

### Catalogue — 4

| Method | Signature | Proposed REST |
|---|---|---|
| `listGpuSkus` | `(): Promise<GpuSku[]>` | `GET /v1/catalog/skus` |
| `listRegions` | `(): Promise<Region[]>` | `GET /v1/catalog/regions` |
| `listSliceProfiles` | `(): Promise<SliceProfile[]>` | `GET /v1/catalog/slice-profiles` |
| `listCapacity` | `(): Promise<CapacityEntry[]>` | `GET /v1/capacity` |

### Pods — 12

| Method | Signature | Proposed REST |
|---|---|---|
| `listPods` | `(filter?: { status?, projectId? }): Promise<Pod[]>` | `GET /v1/pods?status=&project_id=` |
| `getPod` | `(id): Promise<Pod>` | `GET /v1/pods/{id}` |
| `estimatePod` | `(input): Promise<PodEstimate>` | `POST /v1/pods:estimate` |
| `launchPod` | `(input: LaunchPodInput): Promise<Pod>` | `POST /v1/pods` |
| `stopPod` | `(id): Promise<Pod>` | `POST /v1/pods/{id}:stop` |
| `startPod` | `(id): Promise<Pod>` | `POST /v1/pods/{id}:start` |
| `terminatePod` | `(id): Promise<void>` | `DELETE /v1/pods/{id}` |
| `getPodLogs` | `(id, limit?): Promise<LogLine[]>` | `GET /v1/pods/{id}/logs?limit=` |
| `getPodTelemetrySeries` | `(id, minutes): Promise<TimeSeriesPoint[]>` | `GET /v1/pods/{id}/telemetry?minutes=` |
| `subscribePod` | `(id, cb): Unsubscribe` | `GET /v1/pods/{id}/events` (SSE) |
| `subscribePodTelemetry` | `(id, cb): Unsubscribe` | `GET /v1/pods/{id}/telemetry/stream` (SSE) |

### JupyterHub — 6

`getJupyterHub` · `listJupyterSpawnerProfiles` · `listJupyterServers` ·
`startJupyterServer(spawnerProfileId)` · `stopJupyterServer(id)` ·
`updateIdleCulling(minutes)`

Proposed: `GET /v1/jupyter`, `GET /v1/jupyter/profiles`, `GET /v1/jupyter/servers`,
`POST /v1/jupyter/servers`, `DELETE /v1/jupyter/servers/{id}`,
`PATCH /v1/jupyter` .

### Model endpoints and API keys — 7

`listModelEndpoints` · `getModelEndpoint(id)` · `testCompletion({ endpointId, prompt })` ·
`listApiKeys` · `createApiKey({ name, scopedEndpointIds })` · `rotateApiKey(id)` ·
`revokeApiKey(id)`

### Dedicated — 3

`listDedicatedNodes` · `getDedicatedNode(id)` · `requestDedicatedQuote(input)`

### vClusters and networking — 10

`listVClusters` · `getVCluster(id)` · `createVCluster({ name, projectId })` ·
`deleteVCluster(id)` · `getKubeconfig(id)` · `scaleNodePool(vclusterId, poolId, replicas)` ·
`listNetworkPolicies(filter?)` · `getNetworkPolicy(id)` ·
`setNetworkPolicyMode(id, mode)` · `getFlowSummary()`

### Metering and billing — 12

`listMeters` · `getUsageSeries(query)` · `getUsageBreakdown(groupBy)` ·
`listUsageEvents(limit?)` · `getCurrentSpend` · `getDraftInvoice` · `listInvoices` ·
`getInvoice(id)` · `payInvoice(id, paymentMethodId)` · `listPaymentMethods` ·
`setSpendCap(paisa \| null)` · `addCredit(paisa)`

### Audit, compliance, keys — 8

`listAuditLog(filter?)` · `verifyAuditChain` · `exportAuditLog` ·
`getComplianceState` · `listCertificates` · `listSshKeys` ·
`addSshKey({ name, publicKey })` · `removeSshKey(id)`

---

## 3. Domain model

Source of truth: `lib/api/types.ts`. Reproduced here with the invariants that are
not obvious from the type alone.

### 3.1 Identity

```ts
export type OrgTier  = "starter" | "team" | "dedicated" | "sovereign";
export type UserRole = "owner" | "admin" | "engineer" | "billing" | "viewer";

export interface Organization {
  id: string;
  name: string;
  tier: OrgTier;
  panNumber: string;              // VAT / PAN, printed on invoices
  createdAt: string;
  spendCapPaisa: Paisa | null;    // null = uncapped
  creditBalancePaisa: Paisa;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  vclusterId: string;             // 1:1 — a project is isolated in a vCluster
  createdAt: string;
  archived: boolean;
}
```

⚠ **`UserRole` (5 values) does not match the Keycloak-derived auth role (2
values).** No mapping function exists. See
[03 §8.2](03-keycloak-identity.md#82-two-role-vocabularies-exist-and-do-not-match).

### 3.2 Hardware and slicing

```ts
export type GpuModelId =
  | "h200-sxm-141" | "h100-sxm-80"
  | "rtx-pro-6000-blackwell-96" | "l40s-48" | "l4-24";

export type SliceIsolation = "exclusive" | "mig" | "hami";

export interface SliceProfile {
  id: string;
  label: string;              // "1g.18gb" (MIG) · "25%" (HAMi) · "1x" (whole card)
  skuId: GpuModelId;
  isolation: SliceIsolation;
  gpuMemoryGb: number;
  computePercent: number;     // 1-100
  vcpus: number;
  systemMemoryGb: number;
  faultIsolated: boolean;     // ← load-bearing, see below
  description: string;
}
```

**The MIG / HAMi distinction is a product distinction, not an implementation
detail.** From the source comment:

> MIG partitions a GPU in hardware: each slice gets dedicated SMs, L2 and memory,
> with real fault isolation between tenants. HAMi slices in software via the
> device plugin: memory limits and a compute percentage, scheduled onto a shared
> card. Cheaper, denser, but tenants are **NOT** fault-isolated from each other.
> These are genuinely different products and are priced and labelled as such — do
> not collapse them.

`faultIsolated: false` surfaces as a `not fault-isolated` warning in the launch
wizard, and HAMi is priced below the comparable MIG tier because of it. Any schema
or API that loses this field is wrong.

### 3.3 Pods

```ts
export type PodStatus =
  | "queued" | "provisioning" | "pulling-image" | "running"
  | "stopping" | "stopped" | "failed" | "terminated";

export interface Pod {
  id: string;
  name: string;
  projectId: string;
  vclusterId: string;
  regionId: string;
  skuId: GpuModelId;
  profileId: string;
  gpuCount: number;
  image: string;
  status: PodStatus;
  statusDetail: string | null;   // human-readable transition detail
  createdAt: string;
  startedAt: string | null;
  stoppedAt: string | null;
  billableSeconds: number;       // wall-clock seconds billable
  costToDatePaisa: Paisa;
  ratePaisaPerHour: Paisa;
  sshCommand: string;
  exposedPorts: number[];
}
```

⚠ **There is no organisation/tenant field on `Pod`.** Attribution stops at
`projectId`. A multi-tenant control plane must add one — a domain-model change, not
just an infrastructure change.

### 3.4 Metering and billing

```ts
export type MeterId =
  | "gpu_seconds" | "tokens_in" | "tokens_out"
  | "storage_gb_hours" | "egress_gb" | "dedicated_months";

export interface UsageEvent {
  id: string;
  at: string;
  meterId: MeterId;
  subjectId: string;       // pod / endpoint / server / node
  subjectLabel: string;
  projectId: string;
  quantity: number;
  costPaisa: Paisa;
}

export interface Invoice {
  id: string;
  number: string;                    // "CV-2026-09"
  status: "draft" | "open" | "paid" | "overdue" | "void";
  periodStart: string;  periodEnd: string;
  issuedAt: string | null;  dueAt: string | null;  paidAt: string | null;
  lineItems: InvoiceLineItem[];
  subtotalPaisa: Paisa;
  vatPaisa: Paisa;
  creditAppliedPaisa: Paisa;
  totalPaisa: Paisa;
  pricingIsPlaceholder: boolean;     // propagates from the catalogue
}

export type PaymentRail = "esewa" | "khalti" | "bank-transfer" | "corporate-invoice";
```

Payment rails are Nepal-specific (eSewa, Khalti) plus bank transfer and corporate
invoicing. There is no card rail in the model. Full billing treatment in
[05](05-billing-and-metering.md).

### 3.5 Audit

```ts
export interface AuditLogEntry {
  id: string;
  at: string;
  actorId: string;  actorName: string;
  action: string;              // "pod.launch", "apikey.revoke", "user.login", …
  resourceType: string;  resourceId: string;
  sourceIp: string;
  outcome: "success" | "denied" | "error";
  hash: string;                // commits to its predecessor
  previousHash: string;
}
```

A hash chain: each entry commits to the previous one, so tampering is detectable.
⚠ The hash function is **not cryptographic** — see [09](09-security-and-compliance.md).

### 3.6 Full type index

| Group | Types |
|---|---|
| Identity | `OrgTier`, `UserRole`, `Organization`, `User`, `Project` |
| Hardware | `GpuModelId`, `FleetStatus`, `GpuSku`, `Region`, `CapacityEntry` |
| Slicing | `SliceIsolation`, `SliceProfile` |
| Pods | `PodStatus`, `Pod`, `PodTelemetry`, `TimeSeriesPoint`, `LogLine`, `LaunchPodInput`, `PodEstimate` |
| Jupyter | `JupyterServerStatus`, `JupyterSpawnerProfile`, `JupyterServer`, `JupyterHubState` |
| Models | `ModelEndpoint`, `ApiKey`, `CreatedApiKey`, `CompletionResult` |
| Dedicated | `DedicatedNode`, `DedicatedQuoteInput`, `DedicatedQuote` |
| vClusters | `VCluster`, `NodePool` |
| Networking | `NetworkPolicyMode`, `NetworkPolicy`, `NetworkRule`, `FlowSummary` |
| Billing | `MeterId`, `Meter`, `UsageWindow`, `UsageSeries`, `UsageEvent`, `UsageBreakdownRow`, `CurrentSpend`, `InvoiceLineItem`, `InvoiceStatus`, `Invoice`, `PaymentRail`, `PaymentMethod` |
| Compliance | `AuditLogEntry`, `AuditChainVerification`, `Certificate`, `ComplianceControl`, `ComplianceState`, `SshKey` |

---

## 4. Representative payloads

Produced by the mock; these are the shapes a real API must return.

### `POST /v1/pods:estimate` → `PodEstimate`

```jsonc
{
  "profileId": "h200-1g.18gb",
  "gpuCount": 1,
  "ratePaisaPerHour": 7200,
  "ratePaisaPerSecond": 2,
  "estimatedMonthlyPaisa": 5256000,
  "minimumBillableSeconds": 60,
  "ratePlaceholder": true,
  "cliPreview": "corevalley pods launch --name nepali-7b-sft --gpu h200 --slice 1g.18gb --region np-ktm-1"
}
```

`ratePaisaPerSecond` is **derived** from the hourly rate in the catalogue, never
stated independently, so display and meter cannot drift.

### `POST /v1/pods` → `Pod`

```jsonc
{
  "id": "pod_4a1f2c",
  "name": "nepali-7b-sft",
  "projectId": "prj_nepali_llm",
  "vclusterId": "vc_research",
  "regionId": "np-ktm-1",
  "skuId": "h200-sxm-141",
  "profileId": "h200-1g.18gb",
  "gpuCount": 1,
  "image": "corevalley/pytorch:2.5-cu124",
  "status": "queued",
  "statusDetail": "Queued for scheduling",
  "createdAt": "2026-09-04T18:22:10.441Z",
  "startedAt": null,
  "stoppedAt": null,
  "billableSeconds": 0,
  "costToDatePaisa": 0,
  "ratePaisaPerHour": 7200,
  "sshCommand": "ssh nepali-7b-sft@np-ktm-1.corevalley.ai",
  "exposedPorts": [8888]
}
```

### `POST /v1/api-keys` → `CreatedApiKey`

```jsonc
{
  "id": "key_a3f1",
  "name": "prod-inference",
  "prefix": "cv_live_a3f1",
  "createdAt": "2026-09-04T18:25:02.118Z",
  "lastUsedAt": null,
  "scopedEndpointIds": ["llama-3.3-70b-instruct"],
  "revoked": false,
  "secret": "cv_live_a3f1…xR7QpL2mT9"   // returned exactly once
}
```

`ApiKey` (the persisted shape) has **no** `secret` field. `CreatedApiKey extends
ApiKey` adds it, and only the creation and rotation responses use that type.

### `GET /v1/audit:verify` → `AuditChainVerification`

```jsonc
{
  "verified": true,
  "entriesChecked": 60,
  "brokenAtEntryId": null,
  "verifiedAt": "2026-09-04T18:26:44.902Z"
}
```

---

## 5. Error handling

### 5.1 As-built

| Surface | Mechanism |
|---|---|
| Unimplemented transport | `NotImplementedError` carrying the method name and remediation |
| Mock domain errors | `throw new Error("pod not found" / "key not found" / "server not found")` |
| Catalogue integrity | `rateForProfile` / `skuById` / `profileById` throw on unknown IDs |
| Route not-found | `getPod(id).catch(() => null)` then `notFound()` |
| Render errors | `app/error.tsx` App Router boundary |
| Auth errors | `?error=<code>` mapped to human text in `auth-modal.tsx` |

**Catalogue lookups fail loud on purpose.** Returning a default rate would price a
workload at zero and silently under-bill:

```ts
export function rateForProfile(profileId: string): HourlyRate {
  const r = GPU_HOURLY.find((x) => x.profileId === profileId)
         ?? JUPYTER_RATES.find((x) => x.profileId === profileId);
  if (!r) throw new Error(`no catalog rate for profile ${profileId}`);
  return r;
}
```

### 5.2 What is missing

❌ None of the following exists:

| Missing | Why it matters |
|---|---|
| Typed error union on the interface | Callers cannot distinguish "not found" from "quota exceeded" from "transport failure" |
| HTTP status → domain error mapping | `http.ts` has no fetch wrapper at all |
| Correlation / request IDs | No way to tie a browser error to a server log |
| Retry and backoff policy | A transient 503 currently has no defined behaviour |
| User-facing error surface | No toast or banner system; failures are silent or throw to the error boundary |
| Idempotency keys on mutations | `launchPod` retried after a timeout would create two pods |

### 5.3 Proposed error envelope

❌ **PROPOSED — not implemented.** Recorded so the first endpoint sets the
precedent rather than inventing one.

```jsonc
{
  "error": {
    "code": "pod.quota_exceeded",
    "message": "Launching this pod would exceed the organisation's GPU quota.",
    "status": 409,
    "requestId": "req_01JQ8ZK3M4",
    "details": { "requested": 4, "available": 2 }
  }
}
```

```ts
// PROPOSED
export type CoreValleyErrorCode =
  | "auth.unauthenticated" | "auth.forbidden"
  | "resource.not_found" | "resource.conflict"
  | "quota.exceeded" | "validation.failed"
  | "billing.spend_cap_reached" | "transport.unavailable";
```

| Domain error | HTTP | Retryable |
|---|---|---|
| `auth.unauthenticated` | 401 | No — re-authenticate |
| `auth.forbidden` | 403 | No |
| `resource.not_found` | 404 | No |
| `resource.conflict` | 409 | No |
| `quota.exceeded` | 409 | No |
| `validation.failed` | 422 | No |
| `billing.spend_cap_reached` | 402 | No |
| `transport.unavailable` | 502/503/504 | Yes — backoff with jitter |

---

## 6. Implementing the HTTP client

The work required to make `NEXT_PUBLIC_API_MODE=http` functional.

```ts
// lib/api/http.ts — current placeholder
const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/** Placeholder for the eventual fetch wrapper (auth headers, error mapping). */
function todo(method: string): never {
  void base;
  throw new NotImplementedError(method);
}
```

Ordered checklist:

1. **Build the fetch wrapper** — base URL, `Authorization: Bearer` from
   `session.accessToken`, JSON encode/decode, error-envelope mapping, timeout,
   retry with jitter for 5xx, request ID propagation.
2. **Decide server-side vs. browser-side calls.** RSCs run on the server, so the
   access token must be read via `auth()` and attached there. `NEXT_PUBLIC_*`
   variables are browser-visible; the API base URL may need a server-only twin.
3. **Implement read methods first**, screen by screen, keeping the mock as the
   default so the console stays usable.
4. **Implement the two `subscribe*` methods over SSE**, returning an `Unsubscribe`
   that closes the `EventSource`.
5. **Add `force-dynamic` to the portal layout** before any of the above ships —
   see [01 §4](01-platform-architecture.md#4-rendering-model). Without it, every
   tenant is served build-time data.
6. **Add idempotency keys** to `launchPod`, `createVCluster`, `createApiKey`,
   `payInvoice`.
7. **Add the tenant dimension** to every list query. The interface currently has
   no tenant parameter anywhere, because the mock has exactly one organisation.

Keep `satisfies CoreValleyClient` at the bottom of the file throughout. It is the
only thing preventing the two implementations from diverging.
