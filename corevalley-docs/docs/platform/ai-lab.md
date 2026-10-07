# JupyterHub

Managed GPU notebooks on CoreValley: notebooks for a team, a lab or a whole course, without anyone looking after a shared server. JupyterHub was previously called AI Lab.

!!! info "In progress"
    Reference content for JupyterHub is being written. The outline below is what it will cover. Early access is open to enterprises on NVIDIA H200 today; access for universities and labs is coming soon — contact [info@corevalley.ai](mailto:info@corevalley.ai) to join the list or to set up a working session.

## What this page will cover

- **Spawner profiles** — the CPU-only and GPU-backed profiles a user can choose from (whole H200s and slices of one), and how an organisation defines its own.
- **Users and cohorts** — inviting a class or a team in bulk, roles, and removing access at the end of a term.
- **Storage** — the private volume every user gets, shared read-only dataset mounts, and what persists between sessions.
- **Idle shutdown and limits** — how notebooks left open stop billing on their own, and per-user caps on servers, memory and GPU share.
- **Images** — the pre-built CUDA, PyTorch and TensorFlow environments, and bringing your own.
- **Accounting** — how notebook hours are metered to the user and the project.

## Who it is for

Universities and research labs, bootcamps, and R&D teams that want GPU notebooks with a login rather than a cluster to run.

## Related

- [Quickstart](../guides/quickstart.md)
- [GPU pods & dedicated](gpu-workspace.md)
- [GPU & instance specs](../hardware/specs.md)
- [NPR payments](../billing/npr-payments.md)
