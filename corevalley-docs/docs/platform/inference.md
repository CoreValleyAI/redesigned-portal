# Model endpoints & API

OpenAI-compatible endpoints for serving open-weight models from inside Nepal, and the API keys that control access to everything on the platform. This was previously called the Inference API.

!!! info "In progress"
    The API reference is being written. The outline below is what it will cover. During early access, endpoints are set up with you by the team on NVIDIA H200 — contact [info@corevalley.ai](mailto:info@corevalley.ai).

## What this page will cover

- **API keys** — creating, scoping and rotating keys in the console; project and organisation scope.
- **Endpoints** — deploying a model behind a shared or dedicated endpoint, autoscaling, and choosing a GPU.
- **Compatibility** — the OpenAI-style request and response shapes, so an existing client works by changing the base URL.
- **Metering** — per-token billing for shared endpoints and per-second billing for dedicated ones.
- **Limits and errors** — rate limits, timeouts and the error format.
- **Data handling** — where prompts and outputs are processed (in Kathmandu), and what is retained.

## Related

- [Quickstart](../guides/quickstart.md)
- [GPU pods & dedicated](gpu-workspace.md)
- [NPR payments](../billing/npr-payments.md)
