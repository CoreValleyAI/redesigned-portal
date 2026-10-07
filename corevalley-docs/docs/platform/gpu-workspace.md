# GPU pods & dedicated servers

Full GPU environments with root access: containerised pods on a whole card or a slice of one, and dedicated servers when a workload needs a machine to itself. These were previously grouped as GPU Workspace.

!!! info "In progress"
    Reference content for GPU pods and dedicated servers is being written. The outline below is what it will cover. Early access is open to enterprises on NVIDIA H200 today — to launch a workload now, contact [info@corevalley.ai](mailto:info@corevalley.ai).

## What this page will cover

- **Pods** — launching a container on a whole NVIDIA H200, a hardware slice of one (MIG, fault-isolated) or a shared software slice (HAMi, cheaper but not fault-isolated), and what the difference means for isolation and price.
- **Images** — the pre-built stack (CUDA, cuDNN, PyTorch, TensorFlow, vLLM, DeepSpeed) and custom images.
- **Storage** — persistent replicated volumes, ephemeral local NVMe scratch, and sharing a volume across pods in a project.
- **Access** — SSH with your own key, exposed ports for TensorBoard or Jupyter, and environment variables and secrets.
- **Multi-GPU** — eight H200s joined by NVLink in one server, for distributed training.
- **Dedicated servers** — reserved bare-metal or VM servers in your own private Kubernetes cluster (vCluster), their terms and how they are metered.
- **Lifecycle and billing** — per-second metering with a 60-second minimum, stop versus terminate, and what happens to volumes.

## Related

- [Quickstart](../guides/quickstart.md)
- [GPU & instance specs](../hardware/specs.md)
- [Model endpoints & API](inference.md)
