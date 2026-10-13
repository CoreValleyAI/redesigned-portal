/**
 * Use cases — what people in Nepal can build, each grounded in one sourced
 * fact (docs/revamp/04 §6). The only home of this subject is /use-cases;
 * the home page shows the featured ones in a carousel, in the owner's order:
 * startups and IT exporters, then banks and wallets, then universities,
 * then voice, language models and training.
 *
 * Every story follows one template: the problem (one fact with a source) →
 * what AI does → why it belongs in Nepal → who builds it → the workloads →
 * a typical setup → what it runs on. Each has a picture of the work itself
 * (components/use-cases/vignettes.tsx): a ledger being scored, speech
 * becoming text, a GPU shared by a class — never stock imagery.
 * `verified: false` facts render with the staging marker until checked
 * against the source (they are secondary-sourced in the plan).
 *
 * Guardrails (04 §4): no named customers or partners, no "AI predicts
 * earthquakes", no clinical claims beyond triage and decision support, no
 * disaster casualty figures as hooks, "124 mother tongues" (not 123).
 */
import type { ProductSlug } from "./products";

export type Sector =
  | "Startups"
  | "Banking"
  | "Education"
  | "Voice AI"
  | "LLM inference"
  | "Model training"
  | "Language"
  | "Government"
  | "Energy"
  | "Climate"
  | "Health"
  | "Agriculture"
  | "Migration"
  | "Telecom"
  | "Law"
  | "Media"
  | "Heritage"
  | "Tourism";

/** The picture of the work (components/use-cases/vignettes.tsx). */
export type Art =
  | "api"
  | "ledger"
  | "slices"
  | "voice"
  | "assistant"
  | "training"
  | "tokens"
  | "ocr"
  | "forecast"
  | "radar"
  | "xray"
  | "vision";

export interface UseCase {
  slug: string;
  sector: Sector;
  title: string;
  /** One line for the carousel. */
  short: string;
  /** The problem, in one sentence with one number. */
  fact: string;
  source: { name: string; url?: string };
  verified: boolean;
  /** What AI does here. */
  ai: string;
  /** Why it belongs in Nepal, on compute in Nepal. */
  why: string;
  /** Who builds it ("built for", never named customers). */
  who: string;
  /** The workloads, in the words engineers use. */
  workloads: string[];
  /** A typical setup on CoreValley. */
  setup: string;
  art: Art;
  runsOn: ProductSlug[];
}

const CENSUS = {
  name: "National Population and Housing Census 2021",
  url: "https://en.wikipedia.org/wiki/Languages_of_Nepal",
};
const NVIDIA_H200 = { name: "NVIDIA H200 datasheet", url: "https://www.nvidia.com/en-us/data-center/h200/" };

export const NEPAL: UseCase[] = [
  {
    slug: "startups",
    sector: "Startups",
    title: "Startups and IT exporters",
    short: "Fine-tune and serve models for products sold at home and abroad, paid for in rupees.",
    fact: "Nepal's IT services exports are estimated at about one billion US dollars a year.",
    source: { name: "Industry estimate (NAS-IT)" },
    verified: false,
    ai: "Fine-tuning and serving models behind your product's API — chat, search, summaries, extraction — for clients at home and abroad.",
    why: "Billing in rupees removes the card limits and currency friction of foreign clouds, and the bill follows your traffic second by second.",
    who: "Product startups, AI agencies and IT exporters.",
    workloads: ["LLM inference", "Fine-tuning", "Embeddings", "Batch jobs"],
    setup: "On-demand GPUs to fine-tune, Inferencing to serve, billed per second in NPR.",
    art: "api",
    runsOn: ["on-demand", "inferencing", "mig-slicing", "reserved"],
  },
  {
    slug: "fraud-and-kyc",
    sector: "Banking",
    title: "Fraud, AML and KYC for banks and wallets",
    short: "Score every transaction, find mule rings and read KYC documents — without the data leaving Nepal.",
    fact: "Nepal counts about 30 million mobile-banking accounts and 28 million digital-wallet accounts.",
    source: { name: "Nepal Rastra Bank payment statistics, mid-May 2026" },
    verified: false,
    ai: "Real-time transaction scoring, graph analytics that surface linked mule accounts, document checks and name matching across Devanagari and Latin scripts.",
    why: "Financial data is among the most sensitive there is. Training and scoring it inside the country keeps it under Nepal's jurisdiction.",
    who: "Banks, wallets, remittance companies and their technology partners.",
    workloads: ["Transaction scoring", "Graph analytics", "Document OCR", "Name matching"],
    setup:
      "Reserved GPUs held for your institution, models served from Inferencing, data on all-flash storage in Nepal.",
    art: "ledger",
    runsOn: ["reserved", "inferencing", "storage", "services"],
  },
  {
    slug: "universities",
    sector: "Education",
    title: "Universities and AI skills",
    short: "An isolated GPU slice for every student, whole GPUs for the lab's big runs.",
    fact: "Nepal's National AI Policy sets a goal of training 5,000 AI professionals.",
    source: { name: "National Artificial Intelligence Policy, Government of Nepal" },
    verified: false,
    ai: "Courses, theses and research on real GPUs: JupyterLab on a MIG slice for each student, and whole H200 NVL GPUs when the lab needs them.",
    why: "Students learn on the infrastructure they will build careers on — in rupees, without a foreign card.",
    who: "Universities, colleges and training institutes.",
    workloads: ["JupyterLab", "MIG slices", "Course notebooks", "Thesis runs"],
    setup: "MIG slices in JupyterLab, one isolated slice per student; on-demand GPUs for the lab's big runs.",
    art: "slices",
    runsOn: ["mig-slicing", "on-demand", "services"],
  },
  {
    slug: "voice-ai",
    sector: "Voice AI",
    title: "Voice AI in Nepali",
    short: "Speech to text and back again, in Nepali, for call centres, IVR and voice assistants.",
    fact: "Nepali is the first language of 44.86 % of people in Nepal, and a second language for many more.",
    source: CENSUS,
    verified: true,
    ai: "Speech recognition and synthesis in Nepali, streamed in real time: transcripts, the caller's intent and a spoken reply.",
    why: "Customer calls carry personal data. Transcribing and answering them inside the country keeps the recordings in Nepal.",
    who: "Banks, telecom operators, contact centres and the companies that build their systems.",
    workloads: ["Speech-to-text", "Text-to-speech", "Intent detection", "Streaming"],
    setup: "Speech models served from Inferencing on MIG slices; reserved GPUs to train on your own call data.",
    art: "voice",
    runsOn: ["inferencing", "mig-slicing", "reserved"],
  },
  {
    slug: "private-llm",
    sector: "LLM inference",
    title: "Private language models on your documents",
    short: "Assistants and search over your own documents, with answers that cite their sources.",
    fact: "One H200 NVL holds 141 GB of HBM3e: enough for a 70-billion-parameter model's 8-bit weights, with room left for long contexts.",
    source: NVIDIA_H200,
    verified: true,
    ai: "Retrieval-augmented generation over your files, served through NVIDIA NIM: answers in Nepali or English that point to the page they came from.",
    why: "Prompts and documents stay inside the valley. Nothing is sent to a model abroad.",
    who: "Banks, insurers, law firms, ministries and product teams.",
    workloads: ["RAG", "NVIDIA NIM", "Embeddings", "Citations"],
    setup: "NVIDIA NIM on Inferencing; documents in S3-compatible storage beside the GPUs.",
    art: "assistant",
    runsOn: ["inferencing", "reserved", "storage"],
  },
  {
    slug: "model-training",
    sector: "Model training",
    title: "Training and fine-tuning, in Nepal",
    short: "Fine-tune open models on Nepali data and keep the checkpoints in the country.",
    fact: "The first cluster's eight H200 NVL GPUs hold 1,128 GB of HBM3e between them.",
    source: NVIDIA_H200,
    verified: true,
    ai: "Fine-tuning (LoRA and full), continued pre-training on Nepali text, and hyperparameter search with Kubeflow and Katib in HPE AI Essentials.",
    why: "Training data is often the most sensitive data you have. It never has to leave the country to become a model.",
    who: "AI teams, research labs, universities and product companies.",
    workloads: ["LoRA / QLoRA", "Continued pre-training", "Katib tuning", "Checkpoints to S3"],
    setup: "Reserved or on-demand H200 NVL GPUs; datasets and checkpoints on all-flash storage in Nepal.",
    art: "training",
    runsOn: ["reserved", "on-demand", "storage"],
  },
  {
    slug: "language-ai",
    sector: "Language",
    title: "Language AI for 124 mother tongues",
    short: "Models, speech and translation for Nepali, Maithili, Bhojpuri, Tamang, Nepal Bhasa and more.",
    fact: "Nepal's 2021 census recorded 124 mother tongues; Nepali is the first language of 44.86 % of people.",
    source: CENSUS,
    verified: true,
    ai: "Language models, speech recognition and translation for Nepali, Maithili, Bhojpuri, Tamang, Nepal Bhasa and more — and OCR that reads Devanagari.",
    why: "The text and voices are here, and many of them should stay here. Models trained close to the speakers can be checked by the speakers.",
    who: "Universities, language technologists, government digital teams, product companies.",
    workloads: ["Tokenizers", "Translation", "Speech", "Devanagari OCR"],
    setup: "Reserved GPUs to train, Inferencing to serve, MIG slices for speech models.",
    art: "tokens",
    runsOn: ["reserved", "inferencing", "mig-slicing", "storage", "services"],
  },
  {
    slug: "public-records",
    sector: "Government",
    title: "Government services and records",
    short: "Read handwritten Devanagari records and answer citizens in plain Nepali.",
    fact: "Nepal's National AI Policy names the Nagarik App as a channel for AI-assisted public services.",
    source: { name: "National Artificial Intelligence Policy, Government of Nepal" },
    verified: false,
    ai: "Reading handwritten Devanagari records, searching circulars and acts, and assistants that answer citizens in plain Nepali.",
    why: "Public records belong in the country. A realistic first step is public and non-sensitive data while certifications progress.",
    who: "Ministries, municipalities and the companies that build their systems.",
    workloads: ["Handwriting OCR", "Search", "Assistants", "Translation"],
    setup: "Reserved GPUs for digitisation runs; assistants served from Inferencing.",
    art: "ocr",
    runsOn: ["reserved", "inferencing", "storage", "services"],
  },
  {
    slug: "health-triage",
    sector: "Health",
    title: "Healthcare triage and decision support",
    short: "Put the chest X-rays that most need a radiologist at the top of the list.",
    fact: "WHO estimates tens of thousands of TB cases in Nepal each year, many of them missed.",
    source: { name: "World Health Organization, Global TB Report 2025" },
    verified: false,
    ai: "Flagging chest X-rays for a radiologist to review first, and structuring clinical notes — support for clinicians, never a diagnosis.",
    why: "Patient data should stay in the country, and tools should be validated on the people they serve.",
    who: "Hospitals, health-tech teams and public-health programmes.",
    workloads: ["Imaging triage", "Clinical NLP", "Inference on MIG"],
    setup: "Models served on MIG slices; on-demand GPUs to validate on local data.",
    art: "xray",
    runsOn: ["mig-slicing", "on-demand", "storage"],
  },
  {
    slug: "hydropower-forecasting",
    sector: "Energy",
    title: "Hydropower and grid forecasting",
    short: "Forecast river inflow and demand, hours and days ahead.",
    fact: "Hydropower makes up most of Nepal's installed electricity capacity.",
    source: { name: "Nepal Rastra Bank, FY2025/26" },
    verified: false,
    ai: "Forecasting river inflow, demand and cross-border trade; spotting sediment and faults from sensor and image data.",
    why: "The rivers, the plants and the grid data are all here; so is the team that has to act on a forecast at 3 a.m.",
    who: "Power producers, the grid operator, energy traders and researchers.",
    workloads: ["Time-series forecasting", "Anomaly detection", "Image inspection"],
    setup: "Reserved GPUs for training seasons of data; forecasts served from Inferencing.",
    art: "forecast",
    runsOn: ["reserved", "inferencing", "storage", "services"],
  },
  {
    slug: "himalayan-hazards",
    sector: "Climate",
    title: "Himalayan hazard science",
    short: "Read satellite radar for ground movement, glacial lakes and landslide risk.",
    fact: "Researchers have identified 21 potentially dangerous glacial lakes in Nepal.",
    source: { name: "ICIMOD, 2020" },
    verified: false,
    ai: "Reading satellite radar and imagery for ground movement, glacial lakes and landslide risk; running flood simulations faster.",
    why: "The mountains are here. Scientists in Nepal can run heavy models in-country instead of queueing for compute abroad.",
    who: "Research institutes, universities and disaster-risk agencies.",
    workloads: ["InSAR", "Satellite imagery", "Flood simulation"],
    setup: "On-demand GPUs in bursts, reserved for the monsoon season; imagery on all-flash storage.",
    art: "radar",
    runsOn: ["on-demand", "reserved", "storage"],
  },
  {
    slug: "agriculture",
    sector: "Agriculture",
    title: "Agriculture advice in Nepali",
    short: "Spot crop disease from a phone photo and answer farmers by voice.",
    fact: "Most Nepali households farm.",
    source: { name: "National Statistics Office" },
    verified: false,
    ai: "Spotting crop disease from a phone photo and answering farmers' questions by voice, in their language.",
    why: "The crops, climates and languages are local; the models should be trained on them.",
    who: "Agri-tech companies, cooperatives and development programmes.",
    workloads: ["Crop vision", "Voice in Nepali", "Advisory assistants"],
    setup: "Vision and speech models served from Inferencing on MIG slices.",
    art: "vision",
    runsOn: ["on-demand", "inferencing", "mig-slicing"],
  },
  {
    slug: "migrant-workers",
    sector: "Migration",
    title: "Safer work abroad",
    short: "Check job offers and contracts before anyone pays a recruitment fee.",
    fact: "Remittances equal roughly a third of Nepal's economy.",
    source: { name: "Nepal Rastra Bank, FY2025/26" },
    verified: false,
    ai: "Checking job offers and contracts in many languages, and flagging recruitment fraud before someone pays a fee.",
    why: "Workers' documents and identities deserve to stay in their own country.",
    who: "Remittance companies, recruitment regulators and civil society.",
    workloads: ["Contract OCR", "Fraud detection", "Translation"],
    setup: "Document models on Inferencing; reserved capacity for training on local data.",
    art: "ocr",
    runsOn: ["inferencing", "reserved", "storage"],
  },
  {
    slug: "telecom",
    sector: "Telecom",
    title: "Telecom care and network intelligence",
    short: "Voice and chat support in Nepali, and scam calls filtered before they ring.",
    fact: "Nepal has more than 30 million broadband subscriptions.",
    source: { name: "Nepal Telecommunications Authority" },
    verified: false,
    ai: "Voice and chat support in Nepali, network-anomaly detection, and filtering scam calls and messages.",
    why: "Subscriber data is regulated and local, and so are the languages the customers speak.",
    who: "Telecom operators and their technology partners.",
    workloads: ["Voice assistants", "Anomaly detection", "Scam filtering"],
    setup: "Speech and language models on Inferencing; reserved GPUs to train on network data.",
    art: "voice",
    runsOn: ["inferencing", "reserved"],
  },
  {
    slug: "legal-research",
    sector: "Law",
    title: "Courts and legal research",
    short: "Search precedents in Nepali and summarise long filings.",
    fact: "Nepal's precedents and statutes are written in Nepali.",
    source: { name: "Supreme Court of Nepal" },
    verified: false,
    ai: "Digitising records, searching precedents in Nepali and summarising long filings — tools for lawyers and clerks, never deciding cases.",
    why: "Court records are sensitive and in Nepali; both point to compute in Nepal.",
    who: "Courts, law firms and legal-tech teams.",
    workloads: ["Legal search", "Summaries", "OCR"],
    setup: "Assistants on Inferencing; records in all-flash storage in Nepal.",
    art: "assistant",
    runsOn: ["inferencing", "storage", "services"],
  },
  {
    slug: "media",
    sector: "Media",
    title: "Media and information integrity",
    short: "Transcribe archives and detect synthetic audio in local languages.",
    fact: "Elections draw floods of synthetic and misleading media.",
    source: { name: "Election Commission of Nepal" },
    verified: false,
    ai: "Transcribing and searching archives, and detecting synthetic audio and video in local languages.",
    why: "Newsrooms need tools tuned to Nepali voices and faces, run close to home.",
    who: "Newsrooms, fact-checkers and archives.",
    workloads: ["Transcription", "Archive search", "Synthetic media detection"],
    setup: "Speech models on Inferencing; on-demand GPUs for archive runs.",
    art: "voice",
    runsOn: ["inferencing", "on-demand"],
  },
  {
    slug: "heritage",
    sector: "Heritage",
    title: "Manuscripts and cultural heritage",
    short: "Read Devanagari, Newar and Tibetan scripts from microfilm and scans.",
    fact: "Around 180,000 manuscripts from Nepal have been microfilmed for preservation.",
    source: { name: "Nepal-German Manuscript Preservation Project" },
    verified: false,
    ai: "Reading Devanagari, Newar and Tibetan scripts, and building 3D records of monuments.",
    why: "Heritage collections are national treasures; their digital copies belong at home too.",
    who: "Archives, museums, universities and researchers.",
    workloads: ["Manuscript OCR", "3D capture", "Archive search"],
    setup: "On-demand GPUs for digitisation runs; scans and models on all-flash storage.",
    art: "ocr",
    runsOn: ["on-demand", "storage", "services"],
  },
  {
    slug: "tourism",
    sector: "Tourism",
    title: "Multilingual trek and heritage guides",
    short: "Assistants that answer visitors in their own languages, with local knowledge.",
    fact: "More than a million international visitors came to Nepal in 2025.",
    source: { name: "Nepal Tourism Board" },
    verified: false,
    ai: "Assistants that answer trekkers and visitors in their own languages, with local knowledge.",
    why: "The case here is cost and closeness rather than residency: local inference is fast and billed in rupees.",
    who: "Tour operators, booking platforms and the tourism board.",
    workloads: ["Multilingual assistants", "Translation"],
    setup: "Assistants served from Inferencing, billed in NPR.",
    art: "assistant",
    runsOn: ["inferencing", "on-demand"],
  },
];

/** Across the border: framed carefully (04 §6, guardrail 10). */
export const INDIA = {
  title: "Across the border",
  lead: "Some work spans Nepal and India. We can help with what can lawfully run in Nepal — and we say plainly what we will not host.",
  boundary: "We do not host Indian payment, securities or government data.",
  items: [
    { title: "Shared languages", body: "Nepali, Maithili and Bhojpuri models, trained in Nepal on Nepal-origin data." },
    {
      title: "Shared rivers",
      body: "Flood and glacial-lake science for shared basins such as the Koshi, as research compute.",
    },
    {
      title: "Power trade",
      body: "Forecasting cross-border electricity trade from the Nepal side and public market data.",
    },
    { title: "Nepal subsidiaries", body: "Indian companies' operations in Nepal, with their Nepal data." },
    { title: "Shared heritage", body: "Manuscript and archive projects with research partners." },
    {
      title: "Overflow capacity",
      body: "Reserved capacity for non-personal workloads — open data, synthetic data, simulation and rendering.",
    },
  ],
} as const;

/** The home page's carousel, in the owner's order (13 Oct 2026). */
export const HOME_STORIES = [
  "startups",
  "fraud-and-kyc",
  "universities",
  "voice-ai",
  "private-llm",
  "model-training",
  "language-ai",
  "public-records",
  "health-triage",
  "hydropower-forecasting",
] as const;

export function findUseCase(slug: string) {
  return NEPAL.find((u) => u.slug === slug);
}
