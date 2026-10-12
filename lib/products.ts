import type { IconName, TerminalLine } from "@/components/ui";

/**
 * The six things we sell. Drives /products, its detail pages, the homepage
 * bento and the sitemap.
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
  /** One line each for the "which one fits" table on /products. */
  compare: { billing: string; commitment: string; bestFor: string };
  features: { title: string; body: string }[];
  /** Products with nothing to type (services) leave this out. */
  terminal?: TerminalLine[];
  specs: { label: string; value: string }[];
}

export const PRODUCTS: ProductDef[] = [
  {
    slug: "reserved",
    icon: "node",
    name: "Reserved GPUs",
    tagline: "Whole servers, held for you alone.",
    summary:
      "Reserve H200 servers by the month or for a fixed term, as bare metal or a virtual machine. The capacity is yours for the whole term, at a lower rate than on-demand, and nobody else runs on it.",
    meta: "bare metal · kvm · reserved terms · ipmi",
    audience: "Banks, government and teams with steady workloads",
    compare: {
      billing: "Monthly rate",
      commitment: "1 month to 36 months",
      bestFor: "Steady training, regulated data",
    },
    features: [
      {
        title: "Capacity that is always there",
        body: "Your servers are held for the whole term. No queue, no waiting for cards to free up, no chance of being outbid.",
      },
      {
        title: "Nobody else on your server",
        body: "All eight GPUs, the NVLink connections between them and the local NVMe are yours. Nothing else runs on the machine.",
      },
      {
        title: "Lower rates for longer terms",
        body: "Reserve by the month, or commit for 6, 12 or 36 months for a lower rate. Your quote shows the rate for each term up front.",
      },
      {
        title: "Bare metal or a VM",
        body: "Bare metal for full performance and hardware-level access (IPMI), or a virtual machine (KVM) if you'd rather have snapshots and faster rebuilds.",
      },
      {
        title: "A private network",
        body: "Your servers sit on a private network that blocks everything by default (Cilium). You choose what may reach them, and you can peer it with your own network.",
      },
      {
        title: "Easier security reviews",
        body: "Dedicated hardware in Nepal makes the data-residency and tenancy questions on a security review simple to answer.",
      },
    ],
    terminal: [
      { prompt: "$", text: "corevalley nodes list" },
      { out: "  train-01 · 8x h200 · bare metal" },
      { out: "  term: 12 months · active" },
      { out: "  network: private · allow-list" },
      { comment: "reserved capacity · np-ktm-1" },
      { prompt: "$", text: "" },
    ],
    specs: [
      { label: "GPU", value: "H200 · coming soon" },
      { label: "Sizes", value: "4 or 8 GPUs per server" },
      { label: "Form", value: "bare metal · KVM VM" },
      { label: "Terms", value: "monthly · 6 · 12 · 36 months" },
      { label: "Network", value: "private, default-deny (Cilium)" },
    ],
  },
  {
    slug: "on-demand",
    icon: "zap",
    name: "On-demand GPUs",
    tagline: "Whole H200s, by the second.",
    summary:
      "Start a GPU container when you need one and stop it when you're done. Take one H200 or eight joined by NVLink, with root access and your own images, and pay only for the seconds it runs.",
    meta: "containers · ssh · per-second billing",
    audience: "ML engineers, startups and research teams",
    compare: {
      billing: "Per second, 60 s minimum",
      commitment: "None",
      bestFor: "Experiments, bursts, fine-tunes",
    },
    features: [
      {
        title: "Billed by the second",
        body: "You pay for GPU-seconds, with a 60-second minimum. Stop a pod and the meter stops with it: no rounding up to the hour.",
      },
      {
        title: "One card or eight",
        body: "Start on a single H200, or take a full server of eight joined by NVLink for distributed training.",
      },
      {
        title: "Ready-made images",
        body: "CUDA, PyTorch, TensorFlow, vLLM, DeepSpeed and the usual fine-tuning tools are installed from first boot. Or bring your own image.",
      },
      {
        title: "SSH and open ports",
        body: "Root inside your container, SSH with your own key, and open ports for TensorBoard, Jupyter or your own service.",
      },
      {
        title: "Your data stays put",
        body: "Attach a storage volume that outlives the pod, so you upload a dataset once, not every run.",
      },
      {
        title: "No commitment",
        body: "Nothing to reserve and no contract. When the work grows steady, move it to reserved servers for a lower rate.",
      },
    ],
    terminal: [
      { prompt: "$", text: "corevalley pods launch \\" },
      { out: "    --gpu h200 --count 1 \\" },
      { out: "    --image pytorch:2.5-cu124 \\" },
      { out: "    --volume datasets:/data" },
      { out: "→ 1x h200 · 141 GB" },
      { comment: "running in np-ktm-1 · per second" },
      { prompt: "$", text: "" },
    ],
    specs: [
      { label: "GPU", value: "H200 · 141 GB · coming soon" },
      { label: "Coming soon", value: "RTX PRO 6000 · 96 GB" },
      { label: "Sizes", value: "1x · 8x NVLink" },
      { label: "Billing", value: "per second, 60 s minimum" },
      { label: "Region", value: "np-ktm-1 (Kathmandu)" },
    ],
  },
  {
    slug: "inferencing",
    icon: "broadcast",
    name: "Inferencing",
    tagline: "Open models behind an API, in-country.",
    summary:
      "Call open AI models through an OpenAI-compatible API and pay per token, or have us serve your own model on capacity of its own. Every request stays inside Nepal, and you never manage a GPU.",
    meta: "vllm · litellm · openai-compatible",
    audience: "Product teams shipping AI features",
    compare: {
      billing: "Per million tokens",
      commitment: "None, or a dedicated endpoint",
      bestFor: "AI features in production",
    },
    features: [
      {
        title: "Works with the OpenAI SDK",
        body: "One OpenAI-compatible base URL for every model (a LiteLLM gateway). Point your existing SDK at it, change the model name, and you're done.",
      },
      {
        title: "Pay per token",
        body: "Input and output are priced separately, and repeated prompt prefixes cost less. Usage appears on the same rupee invoice as everything else.",
      },
      {
        title: "Steady under real load",
        body: "The serving engine (vLLM) batches requests continuously, so response times hold steady when many users arrive at once.",
      },
      {
        title: "Your own model, dedicated",
        body: "Bring fine-tuned weights and we serve them on GPUs reserved for your endpoint, behind the same API.",
      },
      {
        title: "Keys you control",
        body: "Issue a key per service, limit it to specific models, rotate it without downtime and revoke it instantly.",
      },
      {
        title: "Your prompts stay in Nepal",
        body: "Prompts and responses are processed and logged inside Nepal. Nothing goes to a foreign model provider.",
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
      { label: "Endpoints", value: "shared · dedicated" },
    ],
  },
  {
    slug: "mig-slicing",
    icon: "slice",
    name: "MIG slicing",
    tagline: "A slice of an H200, isolated in hardware.",
    summary:
      "Most jobs don't need 141 GB. Rent a hardware slice of an H200 — as little as a seventh — with its own memory and compute, and pay for that slice alone, by the second.",
    meta: "nvidia mig · hami · per-second billing",
    audience: "Fine-tuning, notebooks, classes and light inference",
    compare: {
      billing: "Per second, per slice",
      commitment: "None",
      bestFor: "Small models, notebooks, teaching",
    },
    features: [
      {
        title: "Up to seven slices per card",
        body: "An H200 splits into as many as seven isolated parts (NVIDIA MIG). Pick the size that fits the model, from 18 GB to the whole card.",
      },
      {
        title: "Isolated in hardware",
        body: "Each slice has its own memory and compute. If a neighbour's job crashes or runs out of memory, yours keeps running.",
      },
      {
        title: "Pay for the slice, not the card",
        body: "A slice costs a fraction of a whole H200, billed by the second like everything else.",
      },
      {
        title: "Cheaper shared slices",
        body: "When you don't need hardware isolation, take a share of a card instead (HAMi). It costs less, and we label the difference rather than hide it.",
      },
      {
        title: "Sized to the job",
        body: "Run notebooks, small fine-tunes and light inference on a slice that fits, so a whole card never sits half idle.",
      },
      {
        title: "Grow without moving",
        body: "Start on a slice, then move the same image and volumes to whole cards when the job outgrows it.",
      },
    ],
    terminal: [
      { prompt: "$", text: "corevalley slices list --gpu h200" },
      { out: "  1g.18gb   mig · 18 GB" },
      { out: "  2g.35gb   mig · 35 GB" },
      { out: "  3g.71gb   mig · 71 GB" },
      { out: "  7g.141gb  mig · 141 GB" },
      { comment: "hardware-isolated · per second" },
      { prompt: "$", text: "" },
    ],
    specs: [
      { label: "GPU", value: "H200 · coming soon" },
      { label: "MIG slices", value: "1g.18gb · 2g.35gb · 3g.71gb · 7g" },
      { label: "Shared slices", value: "HAMi · not fault-isolated" },
      { label: "Billing", value: "per second, 60 s minimum" },
    ],
  },
  {
    slug: "storage",
    icon: "storage",
    name: "Storage",
    tagline: "Your data, next to the GPUs, in Nepal.",
    summary:
      "Replicated volumes that outlive the job, fast local disks for scratch, and object storage for datasets and checkpoints. All of it in Kathmandu, beside the GPUs that read it.",
    meta: "block · object · nvme scratch",
    audience: "Anyone training, fine-tuning or serving",
    compare: {
      billing: "Per GB-month",
      commitment: "None",
      bestFor: "Datasets, checkpoints, weights",
    },
    features: [
      {
        title: "Volumes that outlive the pod",
        body: "Replicated network volumes survive restarts and pod shutdowns. Upload a dataset once and mount it in every run.",
      },
      {
        title: "Share across a project",
        body: "Mount the same volume in several pods at once, so a team works from one copy of the data.",
      },
      {
        title: "Fast local scratch",
        body: "Local NVMe on the node for temporary files and shuffles. It is cleared when the pod stops, and it costs less.",
      },
      {
        title: "Object storage",
        body: "Keep datasets, checkpoints and model weights in buckets, and pull them into any pod or endpoint.",
      },
      {
        title: "Close to the GPUs",
        body: "Storage sits in the same Kathmandu datacenter as the compute, so loading data doesn't cross a border or an ocean.",
      },
      {
        title: "Data stays in Nepal",
        body: "Nothing is copied abroad. The jurisdiction for your data is Nepal.",
      },
    ],
    terminal: [
      { prompt: "$", text: "corevalley volumes create \\" },
      { out: "    --name datasets --size 500gb" },
      { out: "→ network ssd · replicated" },
      { prompt: "$", text: "corevalley volumes list" },
      { out: "  datasets   500 GB · 2 pods" },
      { comment: "stored in np-ktm-1 · per GB-month" },
      { prompt: "$", text: "" },
    ],
    specs: [
      { label: "Volumes", value: "network SSD, replicated" },
      { label: "Scratch", value: "local NVMe, ephemeral" },
      { label: "Objects", value: "buckets for data and weights" },
      { label: "Billing", value: "per GB-month" },
      { label: "Location", value: "np-ktm-1 (Kathmandu)" },
    ],
  },
  {
    slug: "services",
    icon: "team",
    name: "Services & engineering",
    tagline: "Engineers in Kathmandu, on your project.",
    summary:
      "Help from the people who run the racks: planning capacity, moving workloads from another cloud, getting a model trained and into production, and setting up GPUs for a class or a lab.",
    meta: "architecture · migration · mlops · training",
    audience: "Enterprises, public sector and universities",
    compare: {
      billing: "Scoped and quoted in NPR",
      commitment: "Per engagement",
      bestFor: "Migrations, first deployments",
    },
    features: [
      {
        title: "Capacity planning",
        body: "Tell us the model, the data and the deadline. We size the GPUs, storage and term, and give you a firm rupee quote.",
      },
      {
        title: "Migration from another cloud",
        body: "We help move training jobs, data and endpoints from a foreign provider to Kathmandu, and check they run the same here.",
      },
      {
        title: "Training and fine-tuning help",
        body: "Hands-on help to get a fine-tune or training run working on our GPUs, from the container image to the first checkpoint.",
      },
      {
        title: "Deployment to production",
        body: "Put your model behind an API with keys, limits and monitoring, on shared or dedicated capacity.",
      },
      {
        title: "GPUs for teaching and research",
        body: "We set up GPU access for a class, a lab or a department, with per-person limits, so nobody has to run a server.",
      },
      {
        title: "A named engineer",
        body: "One engineer in Kathmandu who knows your deployment, reachable in Nepal business hours.",
      },
    ],
    specs: [
      { label: "Team", value: "engineers in Kathmandu" },
      { label: "Hours", value: "Nepal business hours" },
      { label: "Engagements", value: "planning · migration · mlops" },
      { label: "Billing", value: "scoped, quoted in NPR" },
    ],
  },
];

export function productBySlug(slug: string): ProductDef | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
