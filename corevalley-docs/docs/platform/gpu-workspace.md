# GPU Workspace

Full GPU environments with root access: containerised pods on whole cards or slices, and dedicated nodes when a workload needs a machine to itself.

!!! info "In progress"
    Reference content for GPU Workspace is being written. The outline below is what it will cover; for launching a workload today, contact [info@corevalley.ai](mailto:info@corevalley.ai).

## What this page will cover

- **Pods** — launching a container on an exclusive H100 or H200, a hardware-partitioned MIG instance, or a software-scheduled HAMi slice, and what the difference means for isolation and price.
- **Images** — the pre-built stack (CUDA, cuDNN, PyTorch, TensorFlow, vLLM, DeepSpeed) and custom images.
- **Storage** — persistent replicated volumes, ephemeral local NVMe scratch, and sharing a volume across pods in a project.
- **Access** — SSH with your own key, exposed ports for TensorBoard or Jupyter, and environment variables and secrets.
- **Multi-GPU** — NVLink nodes for distributed training.
- **Dedicated nodes** — reserved bare-metal or VM nodes on a private vCluster, terms and how they are metered.
- **Lifecycle and billing** — per-second metering, stop versus terminate, and what happens to volumes.

## Related

- [Quickstart](../guides/quickstart.md)
- [GPU & instance specs](../hardware/specs.md)
- [Inference API](inference.md)
