/**
 * Full datasheet specifications for the GPUs on the home-page comparison.
 *
 * Source: NVIDIA H100 and H200 Tensor Core GPU datasheets, SXM5 form factor.
 * Tensor figures marked `sparse` are NVIDIA's with-sparsity numbers, as the
 * datasheets quote them; the page footnotes that.
 *
 * H100 and H200 share the same Hopper compute. The differences are memory
 * (capacity, type, bandwidth) and the MIG slice size that memory allows.
 */

export type Precision = "FP64" | "FP64 TC" | "TF32" | "BF16" | "FP16" | "FP8" | "INT8";

export interface GpuSpec {
  id: string;
  name: string;
  short: string;
  tagline: string;
  formFactor: string;
  architecture: string;
  memoryGb: number;
  memoryType: string;
  /** Physical HBM stacks on the package (active). */
  hbmStacks: number;
  bandwidthTbs: number;
  /** TFLOPS (TOPS for INT8). */
  tensor: Record<Precision, { value: number; sparse: boolean }>;
  nvlinkGbs: number;
  pcie: string;
  tdpW: number;
  migSlices: number;
  migSliceGb: number;
  decoders: string;
}

const HOPPER_TENSOR: GpuSpec["tensor"] = {
  FP64: { value: 34, sparse: false },
  "FP64 TC": { value: 67, sparse: false },
  TF32: { value: 989, sparse: true },
  BF16: { value: 1979, sparse: true },
  FP16: { value: 1979, sparse: true },
  FP8: { value: 3958, sparse: true },
  INT8: { value: 3958, sparse: true },
};

export const GPU_SPECS: GpuSpec[] = [
  {
    id: "h200",
    name: "NVIDIA H200",
    short: "H200",
    tagline: "Large-model training and long-context inference",
    formFactor: "SXM5",
    architecture: "Hopper",
    memoryGb: 141,
    memoryType: "HBM3e",
    hbmStacks: 6,
    bandwidthTbs: 4.8,
    tensor: HOPPER_TENSOR,
    nvlinkGbs: 900,
    pcie: "Gen5 · 128 GB/s",
    tdpW: 700,
    migSlices: 7,
    migSliceGb: 18,
    decoders: "7 NVDEC · 7 JPEG",
  },
  {
    id: "h100",
    name: "NVIDIA H100",
    short: "H100",
    tagline: "LLM fine-tuning and multi-GPU training",
    formFactor: "SXM5",
    architecture: "Hopper",
    memoryGb: 80,
    memoryType: "HBM3",
    hbmStacks: 5,
    bandwidthTbs: 3.35,
    tensor: HOPPER_TENSOR,
    nvlinkGbs: 900,
    pcie: "Gen5 · 128 GB/s",
    tdpW: 700,
    migSlices: 7,
    migSliceGb: 10,
    decoders: "7 NVDEC · 7 JPEG",
  },
];

export const PRECISIONS: Precision[] = ["FP64", "FP64 TC", "TF32", "BF16", "FP16", "FP8", "INT8"];
