# GPU & instance specifications

The NVIDIA hardware behind CoreValley, and the shapes it is offered in.

!!! info "In progress"
    Full specification tables are being prepared. The outline below is what this page will cover. Current availability is summarised on the [products page](https://corevalley.ai/products/); for capacity questions contact [info@corevalley.ai](mailto:info@corevalley.ai).

## What this page will cover

- **GPU models** — NVIDIA H200 (141 GB HBM3e) and H100 (80 GB HBM3) today, with RTX PRO 6000 Blackwell, L40S and L4 on the roadmap. Memory, bandwidth, FP8 throughput and interconnect per model.
- **Slice profiles** — MIG instances (hardware partitions with dedicated compute and memory) and HAMi slices (software-scheduled shares), with the memory and vCPU each shape includes.
- **Instance shapes** — single card, multi-GPU NVLink nodes, and dedicated bare-metal or VM nodes.
- **Storage** — replicated network SSD volumes and local NVMe scratch.
- **Networking** — tenant isolation, private networking and egress controls.
- **Region** — `np-ktm-1`, Kathmandu.

## Related

- [GPU Workspace](../platform/gpu-workspace.md)
- [AI Lab](../platform/ai-lab.md)
- [NPR payments](../billing/npr-payments.md)
