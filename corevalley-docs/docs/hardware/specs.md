# GPU & instance specifications

The NVIDIA hardware behind CoreValley, what you can run on it today, and the shapes it is offered in.

!!! info "Early access"
    The NVIDIA H200 is available now through enterprise early access. The H100 and the RTX PRO 6000 Blackwell are coming soon, with the L40S and L4 after them. Full specification tables are still being prepared; for capacity questions contact [info@corevalley.ai](mailto:info@corevalley.ai).

## GPU models

| GPU | Memory | Bandwidth | Status |
|---|---|---|---|
| NVIDIA H200 (Hopper) | 141 GB HBM3e | 4.8 TB/s | **Available now** |
| NVIDIA H100 (Hopper) | 80 GB HBM3 | 3.35 TB/s | Coming soon |
| NVIDIA RTX PRO 6000 (Blackwell) | 96 GB GDDR7 | 1.6 TB/s | Coming soon |
| NVIDIA L40S (Ada Lovelace) | 48 GB GDDR6 | 864 GB/s | Coming soon |
| NVIDIA L4 (Ada Lovelace) | 24 GB GDDR6 | 300 GB/s | Coming soon |

## Ways to rent an H200

- **Whole card** — all 141 GB of one H200. Exclusive: no neighbours.
- **Eight-GPU server** — eight H200s joined by NVLink. Exclusive.
- **Hardware slice (MIG)** — `1g.18gb`, `2g.35gb`, `3g.71gb` or `7g.141gb`: a fixed share of the card's compute and memory. Fault-isolated, so a neighbour's crash cannot reach your slice.
- **Shared slice (HAMi)** — a 10%, 25% or 50% share of a card's compute, with a memory limit. The cheapest way in, but not fault-isolated.

## What this page will cover

- **Throughput** — FP8 and other precisions per model, and interconnect per instance shape.
- **Instance shapes** — CPU and system memory per slice and per card, and dedicated bare-metal or VM servers.
- **Storage** — replicated network SSD volumes and local NVMe scratch.
- **Networking** — tenant isolation, private networking and outbound (egress) controls.
- **Region** — `np-ktm-1`: our hydro-powered datacenter in Kathmandu, with under 5 ms latency inside the city.

## Related

- [GPU pods & dedicated](../platform/gpu-workspace.md)
- [JupyterHub](../platform/ai-lab.md)
- [NPR payments](../billing/npr-payments.md)
