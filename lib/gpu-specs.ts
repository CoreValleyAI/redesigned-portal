/**
 * Datasheet specifications for the GPUs on the home-page comparison.
 *
 * Sources:
 *   · H200: NVIDIA H200 Tensor Core GPU datasheet, SXM5 form factor.
 *   · RTX PRO 6000 Blackwell Server Edition: NVIDIA product page
 *     (nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/)
 *     and Server Edition datasheet (doc 3850600, Apr 2025).
 *
 * Throughput is as NVIDIA publishes it. H200 tensor figures are with
 * sparsity. NVIDIA publishes the RTX PRO 6000's tensor figures without a
 * dense/sparse label; they are shown as published and footnoted on the page.
 * `null` means NVIDIA does not publish that figure (or the GPU lacks it).
 */

export type Precision = "FP4" | "FP8" | "FP16 / BF16" | "TF32" | "FP32" | "FP64";

export interface Throughput {
  /** TFLOPS, or null when not published / not supported. */
  value: number | null;
  /** Tensor-core figure quoted with sparsity. */
  sparse?: boolean;
  /** Why value is null. */
  note?: string;
}

export interface GpuSpec {
  id: string;
  name: string;
  short: string;
  tagline: string;
  architecture: string;
  chip: string;
  formFactor: string;
  memoryGb: number;
  memoryType: string;
  /** How the memory is drawn: HBM stacks on the package, or GDDR channels. */
  memoryLayout: { kind: "hbm"; units: number; label: string } | { kind: "gddr"; units: number; label: string };
  bandwidthTbs: number;
  throughput: Record<Precision, Throughput>;
  interconnect: string;
  host: string;
  maxPower: string;
  migSlices: number;
  migSliceGb: number;
  cores: string;
  media: string;
  extras: string;
}

export const PRECISIONS: Precision[] = ["FP4", "FP8", "FP16 / BF16", "TF32", "FP32", "FP64"];

export const GPU_SPECS: GpuSpec[] = [
  {
    id: "h200",
    name: "NVIDIA H200",
    short: "H200",
    tagline: "Large-model training and long-context inference",
    architecture: "Hopper",
    chip: "GH100",
    formFactor: "SXM5",
    memoryGb: 141,
    memoryType: "HBM3e",
    memoryLayout: { kind: "hbm", units: 6, label: "6 HBM3e stacks" },
    bandwidthTbs: 4.8,
    throughput: {
      FP4: { value: null, note: "not supported" },
      FP8: { value: 3958, sparse: true },
      "FP16 / BF16": { value: 1979, sparse: true },
      TF32: { value: 989, sparse: true },
      FP32: { value: 67 },
      FP64: { value: 34 },
    },
    interconnect: "NVLink 900 GB/s",
    host: "PCIe Gen5",
    maxPower: "up to 700 W",
    migSlices: 7,
    migSliceGb: 18,
    cores: "Hopper tensor cores (4th gen)",
    media: "7 NVDEC · 7 JPEG",
    extras: "Confidential computing",
  },
  {
    id: "rtx-pro-6000",
    name: "NVIDIA RTX PRO 6000 Blackwell",
    short: "RTX PRO 6000",
    tagline: "Inference, fine-tuning, rendering and visual AI",
    architecture: "Blackwell",
    chip: "GB202",
    formFactor: "PCIe · Server Edition",
    memoryGb: 96,
    memoryType: "GDDR7 ECC",
    memoryLayout: { kind: "gddr", units: 16, label: "512-bit bus" },
    bandwidthTbs: 1.6,
    throughput: {
      FP4: { value: 4000 },
      FP8: { value: 2000 },
      "FP16 / BF16": { value: 1000 },
      TF32: { value: 234 },
      FP32: { value: 120 },
      FP64: { value: null, note: "not published" },
    },
    interconnect: "PCIe Gen5 x16 (no NVLink)",
    host: "PCIe Gen5 x16",
    maxPower: "up to 600 W, configurable",
    migSlices: 4,
    migSliceGb: 24,
    cores: "24,064 CUDA · 752 tensor (5th gen) · 188 RT",
    media: "4 NVENC · 4 NVDEC · 4 JPEG",
    extras: "Confidential computing · 4× DisplayPort 2.1",
  },
];
