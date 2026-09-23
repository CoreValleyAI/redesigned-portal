# CoreValley Documentation

Guides and reference for running AI workloads on CoreValley, Nepal's sovereign GPU cloud. Everything here describes the platform as it ships; sections that are still being written say so.

!!! info "Documentation in progress"
    The platform is in early access and these pages are being written alongside it. Each section below describes what it will cover. For anything you need now, email [info@corevalley.ai](mailto:info@corevalley.ai) — an engineer in Kathmandu answers.

---

## Start here

<div class="grid cards" markdown>

- :material-rocket-outline:{ .lg .middle } **Quickstart**

    ---

    From an invitation to a running GPU pod, notebook or endpoint.

    [:octicons-arrow-right-24: Read the quickstart](guides/quickstart.md)

- :material-flash:{ .lg .middle } **AI Lab**

    ---

    Managed JupyterHub on GPUs for teams, labs and courses.

    [:octicons-arrow-right-24: AI Lab](platform/ai-lab.md)

- :material-cloud:{ .lg .middle } **GPU Workspace**

    ---

    Full GPU environments with root access, images and volumes.

    [:octicons-arrow-right-24: GPU Workspace](platform/gpu-workspace.md)

- :material-chip:{ .lg .middle } **Inference API**

    ---

    OpenAI-compatible endpoints and API keys.

    [:octicons-arrow-right-24: Inference API](platform/inference.md)

- :material-memory:{ .lg .middle } **Hardware**

    ---

    GPU models, slice profiles and instance shapes.

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
| **Platform** | The three service lines — AI Lab (notebooks), GPU Workspace (pods and dedicated nodes) and the Inference API — and how they share projects, storage and keys. |
| **Hardware** | Which NVIDIA GPUs are available, MIG and HAMi slice profiles, memory, bandwidth and networking. |
| **Billing** | How usage is metered, how invoices are produced and how to pay in NPR. |
| **Guides** | Task-oriented walkthroughs, starting with the quickstart. |
| **Support** | Service levels, maintenance windows and how to reach the team. |

Conventions used throughout: commands are shown for the `corevalley` CLI and the console side by side where both exist; times are Nepal Time (UTC+05:45) unless marked UTC; the region is referred to as `np-ktm-1`.
