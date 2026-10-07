# CoreValley Documentation

Guides and reference for running AI workloads on CoreValley, Nepal's sovereign GPU cloud. Everything here describes the platform as it ships; sections that are still being written say so.

!!! info "Early access — documentation in progress"
    Early access is open to enterprises on NVIDIA H200. More GPUs, and access for more teams, are coming soon. These pages are being written alongside the platform, and each section below describes what it will cover. For anything you need now, email [info@corevalley.ai](mailto:info@corevalley.ai) — an engineer in Kathmandu answers within one working day.

---

## Start here

<div class="grid cards" markdown>

- :material-rocket-outline:{ .lg .middle } **Quickstart**

    ---

    From an invitation to a running GPU pod, notebook or endpoint.

    [:octicons-arrow-right-24: Read the quickstart](guides/quickstart.md)

- :material-cloud:{ .lg .middle } **GPU pods & dedicated**

    ---

    Containers on a whole H200 or a slice of one, and dedicated servers when a workload needs a machine to itself.

    [:octicons-arrow-right-24: GPU pods & dedicated](platform/gpu-workspace.md)

- :material-flash:{ .lg .middle } **JupyterHub**

    ---

    Managed GPU notebooks for teams, labs and courses.

    [:octicons-arrow-right-24: JupyterHub](platform/ai-lab.md)

- :material-chip:{ .lg .middle } **Model endpoints & API**

    ---

    OpenAI-compatible endpoints and the API keys that control access.

    [:octicons-arrow-right-24: Model endpoints & API](platform/inference.md)

- :material-memory:{ .lg .middle } **Hardware**

    ---

    GPU models, what is available now, slice profiles and instance shapes.

    [:octicons-arrow-right-24: GPU & instance specs](hardware/specs.md)

- :material-cash:{ .lg .middle } **Billing**

    ---

    Metering, invoices and paying in Nepali rupees.

    [:octicons-arrow-right-24: NPR payments](billing/npr-payments.md)

</div>

---

## How the documentation is organised

| Section | What it covers |
|---|---|
| **Platform** | The four products — GPU pods, JupyterHub, Model endpoints and Dedicated servers — and how they share projects, storage and keys. They were previously called GPU Workspace, AI Lab and Inference API. |
| **Hardware** | Which NVIDIA GPUs are available (H200 today; H100, RTX PRO 6000 Blackwell, L40S and L4 coming soon), slice profiles, memory, bandwidth and networking. |
| **Billing** | How usage is metered, how invoices are produced and how to pay in NPR. |
| **Guides** | Task-oriented walkthroughs, starting with the quickstart. |
| **Support** | Service levels, maintenance windows and how to reach the team. |

Conventions used throughout: commands are shown for the `corevalley` CLI and the console side by side where both exist; times are Nepal Time (UTC+05:45) unless marked UTC; the region — our hydro-powered datacenter in Kathmandu — is referred to as `np-ktm-1`.
