import type { IconName, TerminalLine } from "@/components/ui";

/**
 * The four ways to buy compute. Drives /products, its detail pages and nav.
 *
 * Copy rule: the tagline, summary and feature titles say what the reader
 * gets, in plain words. The engineering names (MIG, HAMi, vLLM, Cilium…)
 * live in `meta`, the feature bodies' parentheses, the specs and the
 * terminal — where the people who want them will look.
 *
 * Terminal lines stay under ~38 characters so they fit a phone-width pane
 * without wrapping mid-flag. No timings or throughput figures: nothing here
 * may read as a measurement we have not published.
 */
export interface ProductDef {
  slug: string;
  icon: IconName;
  name: string;
  tagline: string;
  summary: string;
  meta: string;
  audience: string;
  features: { title: string; body: string }[];
  terminal: TerminalLine[];
  specs: { label: string; value: string }[];
}

export const PRODUCTS: ProductDef[] = [
  {
    slug: "gpu-pods",
    icon: "slice",
    name: "GPU pods",
    tagline: "A whole H200, or just the slice you need.",
    summary:
      "Run your own containers on NVIDIA H200 GPUs. Take a whole card, a hardware slice or a cheaper shared slice, and pay by the second either way. H100s are coming soon.",
    meta: "mig · hami · per-second billing",
    audience: "ML engineers, startups and research teams",
    features: [
      {
        title: "Hardware slices (MIG)",
        body: "Split an H200 into as many as seven isolated parts, each with its own memory and compute. If a neighbour's job crashes or runs out of memory, yours keeps running.",
      },
      {
        title: "Shared slices (HAMi)",
        body: "When you don't need hardware isolation, take a share of a card's memory and compute instead. It packs more work onto each GPU, so it costs less, and we label the difference rather than hide it.",
      },
      {
        title: "Billed by the second",
        body: "You pay for GPU-seconds, with a 60-second minimum. Stop a pod and the meter stops with it: no rounding up to the hour, no charges after it ends.",
      },
      {
        title: "Ready-made images",
        body: "CUDA, PyTorch, TensorFlow, vLLM, DeepSpeed and the usual fine-tuning tools are installed from first boot. Or bring your own image.",
      },
      {
        title: "Storage that outlives the pod",
        body: "Attach a replicated network volume that survives restarts, or use fast local NVMe for scratch. Mount the same volume in every pod in a project.",
      },
      {
        title: "SSH and open ports",
        body: "Root inside your container, SSH with your own key, and open ports for TensorBoard, Jupyter or your own service.",
      },
    ],
    terminal: [
      { prompt: "$", text: "corevalley pods launch \\" },
      { out: "    --gpu h200 --slice 2g.35gb \\" },
      { out: "    --image pytorch:2.5-cu124 \\" },
      { out: "    --volume datasets:/data" },
      { out: "→ h200 · mig 2g.35gb · 35 GB" },
      { comment: "running in np-ktm-1 · per second" },
      { prompt: "$", text: "" },
    ],
    specs: [
      { label: "GPU", value: "H200 · 141 GB · available now" },
      { label: "Coming soon", value: "H100 · 80 GB" },
      { label: "Ways to rent", value: "whole card · MIG · HAMi" },
      { label: "Billing", value: "per second, 60 s minimum" },
      { label: "Region", value: "np-ktm-1 (Kathmandu)" },
    ],
  },
  {
    slug: "jupyterhub",
    icon: "notebook",
    name: "JupyterHub",
    tagline: "Notebooks for a whole department.",
    summary:
      "Managed GPU notebooks for a whole class or lab. Everyone gets a real slice of an H200, nobody has to administer a server, and notebooks left idle stop billing.",
    meta: "multi-user · spawner profiles · idle culling",
    audience: "Universities, bootcamps and R&D teams",
    features: [
      {
        title: "Pick-a-size profiles",
        body: "Offer a CPU-only profile for data prep and H200 slices for training. Users choose from a list; they never see a node or a scheduler.",
      },
      {
        title: "Idle notebooks shut down",
        body: "Notebooks left open overnight stop billing. You set the idle limit per organisation; by default a server stops after 60 idle minutes.",
      },
      {
        title: "Fair limits per person",
        body: "Cap servers, memory and GPU share per user, so one runaway notebook can't use up a department's quota.",
      },
      {
        title: "Shared and personal storage",
        body: "A private volume per user plus a shared, read-only dataset mount, so a class of forty works from one copy of the data, not forty.",
      },
      {
        title: "Course-ready access",
        body: "Invite a whole cohort at once, hand out a profile, and remove access when term ends. No cloud accounts, no credit cards, no foreign billing.",
      },
      {
        title: "Know where the budget went",
        body: "Every notebook-hour is metered to the user and the project, so a department can see exactly where its money went.",
      },
    ],
    terminal: [
      { prompt: "$", text: "corevalley jupyter profiles" },
      { out: "  cpu only       4 vcpu · 16 gb" },
      { out: "  h200 1g.18gb   mig · 18 gb" },
      { out: "  h200 2g.35gb   mig · 35 gb" },
      { comment: "idle notebooks stop after 60 min" },
      { prompt: "$", text: "" },
    ],
    specs: [
      { label: "Hub version", value: "JupyterHub 5.2" },
      { label: "Profiles", value: "CPU · H200 MIG 1g · MIG 2g" },
      { label: "Billing", value: "per user-hour, metered per second" },
      { label: "Idle shutdown", value: "configurable, 60 min default" },
    ],
  },
  {
    slug: "model-endpoints",
    icon: "broadcast",
    name: "Model endpoints",
    tagline: "Open models, per token, in-country.",
    summary:
      "Use open AI models through an OpenAI-compatible API. Pay per token, keep every request inside Nepal, and never manage a GPU.",
    meta: "vllm · litellm · openai-compatible",
    audience: "Product teams shipping AI features",
    features: [
      {
        title: "Steady under real load",
        body: "The serving engine (vLLM) batches requests continuously, so response times hold steady when many users arrive at once, not just in a benchmark.",
      },
      {
        title: "Works with the OpenAI SDK",
        body: "One OpenAI-compatible base URL for every model (a LiteLLM gateway). Point your existing SDK at it, change the model name, and you're done.",
      },
      {
        title: "Pay per token",
        body: "Input and output are priced separately, and repeated prompt prefixes cost less. Usage appears on the same rupee invoice as your GPU time.",
      },
      {
        title: "Keys you control",
        body: "Issue a key per service, limit it to specific models, rotate it without downtime and revoke it instantly. A key is shown once, when you create it.",
      },
      {
        title: "Your prompts stay in Nepal",
        body: "Prompts and responses are processed and logged inside Nepal. Nothing goes to a foreign model provider, because there isn't one.",
      },
      {
        title: "Tools and images",
        body: "Function calling across the catalogue, and image input on the models that support it.",
      },
    ],
    terminal: [
      { prompt: "$", text: "export CV=https://api.corevalley.ai" },
      { prompt: "$", text: "curl $CV/v1/chat/completions \\" },
      { out: '  -H "Authorization: Bearer $KEY" \\' },
      { out: "  -d '{\"model\":\"llama-3.3-70b\"," },
      { out: '       "messages":[{"role":"user",' },
      { out: '         "content":"नमस्ते"}]}\'' },
      { comment: "served from np-ktm-1 · per token" },
      { prompt: "$", text: "" },
    ],
    specs: [
      { label: "API", value: "OpenAI-compatible (LiteLLM)" },
      { label: "Engines", value: "vLLM · SGLang" },
      { label: "Billing", value: "per million tokens, in and out" },
      { label: "Models", value: "Llama · Qwen · DeepSeek · Mistral" },
    ],
  },
  {
    slug: "dedicated",
    icon: "node",
    name: "Dedicated & bare metal",
    tagline: "A whole server, and no neighbours.",
    summary:
      "Whole H200 servers reserved for you alone, as bare metal or a virtual machine. For banks, government and anyone whose security review needs hardware that nobody else touches.",
    meta: "bare metal · reserved terms · ipmi",
    audience: "Banks, government and regulated enterprises",
    features: [
      {
        title: "Nobody else on your server",
        body: "The whole server is yours: all eight GPUs, the NVLink connections between them and the local NVMe. Nothing else runs on it for the length of your term.",
      },
      {
        title: "Bare metal or a VM",
        body: "Bare metal for maximum performance and hardware-level access (IPMI), or a virtual machine (KVM) if you'd rather have snapshots and faster rebuilds.",
      },
      {
        title: "Reserved terms",
        body: "Reserve by the month, or commit for 6, 12 or 36 months for a lower rate. Your quote shows the rate for each term up front.",
      },
      {
        title: "A private network",
        body: "Your server sits on a private network that blocks everything by default (Cilium). You choose what may reach it, and you can peer it with your own network.",
      },
      {
        title: "Easier security reviews",
        body: "Dedicated hardware in Nepal makes the data-residency and tenancy questions on a bank's security review simple to answer.",
      },
      {
        title: "A named engineer",
        body: "A named engineer in Kathmandu, reachable in Nepal business hours, who knows your deployment.",
      },
    ],
    terminal: [
      { prompt: "$", text: "corevalley nodes list" },
      { out: "  kyc-dedicated-01 · 8x h200" },
      { out: "  bare metal · active" },
      { out: "  term: 12 months · renews in 225d" },
      { out: "  network: private · allow-list" },
      { comment: "hardware access (ipmi) · np-ktm-1" },
      { prompt: "$", text: "" },
    ],
    specs: [
      { label: "GPU", value: "H200 · available now" },
      { label: "Form", value: "bare metal · KVM VM" },
      { label: "Sizes", value: "4 or 8 GPUs per server" },
      { label: "Terms", value: "monthly · 6 · 12 · 36 months" },
      { label: "Network", value: "private, default-deny (Cilium)" },
    ],
  },
];

export function productBySlug(slug: string): ProductDef | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
