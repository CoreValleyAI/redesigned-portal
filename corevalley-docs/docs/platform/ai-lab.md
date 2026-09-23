# AI Lab

Managed JupyterHub on CoreValley GPUs: notebooks for a team, a lab or a whole course, without anyone administering a shared server.

!!! info "In progress"
    Reference content for AI Lab is being written. The outline below is what it will cover; for a working session today, contact [info@corevalley.ai](mailto:info@corevalley.ai).

## What this page will cover

- **Spawner profiles** — the CPU-only and GPU-backed profiles a user can choose from, and how an organisation defines its own.
- **Users and cohorts** — inviting a class or a team in bulk, roles, and removing access at the end of a term.
- **Storage** — the private volume every user gets, shared read-only dataset mounts, and what persists between sessions.
- **Idle culling and limits** — how notebooks left open stop billing, and per-user caps on servers, memory and GPU share.
- **Images** — the pre-built CUDA, PyTorch and TensorFlow environments, and bringing your own.
- **Accounting** — how notebook hours are metered to the user and the project.

## Who it is for

Universities and research labs, bootcamps, and R&D teams that want GPU notebooks with a login rather than a cluster to run.

## Related

- [Quickstart](../guides/quickstart.md)
- [GPU & instance specs](../hardware/specs.md)
- [NPR payments](../billing/npr-payments.md)
