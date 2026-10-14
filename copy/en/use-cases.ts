/**
 * Use cases — what people in Nepal can build, each grounded in one sourced
 * fact (docs/revamp/04 §6). The only home of this subject is /use-cases;
 * the home page shows the featured ones in a carousel, in the owner's order:
 * startups and IT exporters, then banks and wallets, then universities,
 * then voice, language models and training.
 *
 * Owner review, 14 Oct 2026: keep it simple. Each story is the problem (one
 * fact with a source), what AI does and who it is for, in plain words, with
 * one calm picture of the outcome (components/use-cases/vignettes.tsx) — a
 * river forecast, a payment flagged, a GPU shared by a class. No pipelines,
 * tool chains, readouts or cluster details, and no "in the valley".
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

/** The picture of the outcome (components/use-cases/vignettes.tsx). */
export type Art =
  | "reach"
  | "payments"
  | "classroom"
  | "voice"
  | "assistant"
  | "training"
  | "languages"
  | "records"
  | "forecast"
  | "lakes"
  | "xray"
  | "leaf";

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
  /** What AI does here, in plain words. */
  ai: string;
  /** Why it is worth running close to home. */
  why: string;
  /** Who builds it ("built for", never named customers). */
  who: string;
  /** A few plain words for what the work covers. */
  workloads: string[];
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
    short: "Build AI into your product and serve customers at home and abroad, billed in rupees.",
    fact: "Nepal's IT services exports are estimated at about one billion US dollars a year.",
    source: { name: "Industry estimate (NAS-IT)" },
    verified: false,
    ai: "Chat, search, summaries and smart features inside your product, on models tuned for your customers.",
    why: "Pay in rupees, by the second, without a foreign card or exchange-rate surprises.",
    who: "Product startups, AI agencies and IT exporters.",
    workloads: ["Chat and search", "Fine-tuning", "Smart features"],
    art: "reach",
    runsOn: ["on-demand", "inferencing", "mig-slicing", "reserved"],
  },
  {
    slug: "fraud-and-kyc",
    sector: "Banking",
    title: "Fraud, AML and KYC for banks and wallets",
    short: "Check every payment as it happens and send the suspicious ones for review.",
    fact: "Nepal counts about 30 million mobile-banking accounts and 28 million digital-wallet accounts.",
    source: { name: "Nepal Rastra Bank payment statistics, mid-May 2026" },
    verified: false,
    ai: "Flags unusual payments as they happen, spots linked mule accounts and reads KYC documents in Nepali and English.",
    why: "Financial data is among the most sensitive there is. It is kept safe with us, close to home.",
    who: "Banks, wallets, remittance companies and their technology partners.",
    workloads: ["Fraud checks", "Mule accounts", "KYC documents"],
    art: "payments",
    runsOn: ["reserved", "inferencing", "storage", "services"],
  },
  {
    slug: "universities",
    sector: "Education",
    title: "Universities and AI skills",
    short: "One GPU, shared fairly by a whole class: a private slice for every student.",
    fact: "Nepal's National AI Policy sets a goal of training 5,000 AI professionals.",
    source: { name: "National Artificial Intelligence Policy, Government of Nepal" },
    verified: false,
    ai: "Courses, theses and research on real GPUs, with a slice for each student and whole GPUs when the lab needs them.",
    why: "Students learn on the kind of hardware they will build careers on, paid for in rupees.",
    who: "Universities, colleges and training institutes.",
    workloads: ["Classes", "Theses", "Research"],
    art: "classroom",
    runsOn: ["mig-slicing", "on-demand", "services"],
  },
  {
    slug: "voice-ai",
    sector: "Voice AI",
    title: "Voice AI in Nepali",
    short: "Turn Nepali speech into text and answer callers in their own language.",
    fact: "Nepali is the first language of 44.86 % of people in Nepal, and a second language for many more.",
    source: CENSUS,
    verified: true,
    ai: "Understands callers speaking Nepali, writes down what they said and answers them in a natural voice.",
    why: "Customer calls carry personal data. Recordings and transcripts are kept safe with us.",
    who: "Banks, telecom operators, contact centres and the companies that build their systems.",
    workloads: ["Speech to text", "Text to speech", "Call centres"],
    art: "voice",
    runsOn: ["inferencing", "mig-slicing", "reserved"],
  },
  {
    slug: "private-llm",
    sector: "LLM inference",
    title: "Private language models on your documents",
    short: "Ask questions of your own documents and get answers that show where they came from.",
    fact: "One NVIDIA H200 NVL has 141 GB of memory: room for large open models on a single GPU.",
    source: NVIDIA_H200,
    verified: true,
    ai: "An assistant that reads your files and answers in Nepali or English, pointing to the page each answer came from.",
    why: "Your prompts and documents are not sent to a model abroad. They are kept safe with us.",
    who: "Banks, insurers, law firms, ministries and product teams.",
    workloads: ["Assistants", "Document search", "Answers with sources"],
    art: "assistant",
    runsOn: ["inferencing", "reserved", "storage"],
  },
  {
    slug: "model-training",
    sector: "Model training",
    title: "Training and fine-tuning",
    short: "Teach open models your own data and language, and keep what they learn.",
    fact: "Each NVIDIA H200 NVL carries 141 GB of HBM3e memory, read at 4.8 TB/s.",
    source: NVIDIA_H200,
    verified: true,
    ai: "Fine-tunes open models on your data, or trains them further on Nepali text, so they know your work and your language.",
    why: "Training data is often the most sensitive data you have. It, and the models you make from it, are kept safe with us.",
    who: "AI teams, research labs, universities and product companies.",
    workloads: ["Fine-tuning", "Training", "Your own models"],
    art: "training",
    runsOn: ["reserved", "on-demand", "storage"],
  },
  {
    slug: "hydropower-forecasting",
    sector: "Energy",
    title: "Hydropower and grid forecasting",
    short: "See river flow and power demand coming, hours and days ahead.",
    fact: "Hydropower makes up most of Nepal's installed electricity capacity.",
    source: { name: "Nepal Rastra Bank, FY2025/26" },
    verified: false,
    ai: "Forecasts river flow, generation and demand from years of records, so plants and the grid can plan ahead.",
    why: "The rivers, the plants and the grid data are all here, and so is the team that has to act on a forecast at 3 a.m.",
    who: "Power producers, the grid operator, energy traders and researchers.",
    workloads: ["River flow", "Demand", "Planning"],
    art: "forecast",
    runsOn: ["reserved", "inferencing", "storage", "services"],
  },
  {
    slug: "language-ai",
    sector: "Language",
    title: "Language AI for 124 mother tongues",
    short: "Models, speech and translation for Nepali, Maithili, Bhojpuri, Tamang, Nepal Bhasa and more.",
    fact: "Nepal's 2021 census recorded 124 mother tongues; Nepali is the first language of 44.86 % of people.",
    source: CENSUS,
    verified: true,
    ai: "Language models, speech and translation for the languages of Nepal, and reading text written in Devanagari.",
    why: "Models built close to the speakers can be checked by the speakers.",
    who: "Universities, language technologists, government digital teams and product companies.",
    workloads: ["Translation", "Speech", "Reading Devanagari"],
    art: "languages",
    runsOn: ["reserved", "inferencing", "mig-slicing", "storage", "services"],
  },
  {
    slug: "public-records",
    sector: "Government",
    title: "Government services and records",
    short: "Turn handwritten records into searchable text and answer citizens in plain Nepali.",
    fact: "Nepal's National AI Policy names the Nagarik App as a channel for AI-assisted public services.",
    source: { name: "National Artificial Intelligence Policy, Government of Nepal" },
    verified: false,
    ai: "Reads handwritten Devanagari records, searches circulars and acts, and answers citizens' questions in plain Nepali.",
    why: "Public records belong at home. A realistic first step is public, non-sensitive data while certifications progress.",
    who: "Ministries, municipalities and the companies that build their systems.",
    workloads: ["Handwritten records", "Search", "Citizen help"],
    art: "records",
    runsOn: ["reserved", "inferencing", "storage", "services"],
  },
  {
    slug: "health-triage",
    sector: "Health",
    title: "Healthcare triage and decision support",
    short: "Put the chest X-rays that most need a doctor at the top of the list.",
    fact: "WHO estimates tens of thousands of TB cases in Nepal each year, many of them missed.",
    source: { name: "World Health Organization, Global TB Report 2025" },
    verified: false,
    ai: "Flags chest X-rays for a radiologist to look at first — support for clinicians, never a diagnosis.",
    why: "Patient data is kept safe with us, and tools can be checked on the people they serve.",
    who: "Hospitals, health-tech teams and public-health programmes.",
    workloads: ["X-ray triage", "Clinical notes"],
    art: "xray",
    runsOn: ["mig-slicing", "on-demand", "storage"],
  },
  {
    slug: "himalayan-hazards",
    sector: "Climate",
    title: "Himalayan hazard science",
    short: "Watch glacial lakes and slopes from satellite images, season after season.",
    fact: "Researchers have identified 21 potentially dangerous glacial lakes in Nepal.",
    source: { name: "ICIMOD, 2020" },
    verified: false,
    ai: "Reads satellite images for changes in glacial lakes and slopes, and runs flood simulations faster.",
    why: "Scientists in Nepal can run heavy models at home instead of queueing for compute abroad.",
    who: "Research institutes, universities and disaster-risk agencies.",
    workloads: ["Satellite images", "Glacial lakes", "Flood models"],
    art: "lakes",
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
    ai: "Spots crop disease from a phone photo and answers farmers' questions by voice, in their language.",
    why: "The crops, climates and languages are local; the models should learn from them.",
    who: "Agri-tech companies, cooperatives and development programmes.",
    workloads: ["Crop photos", "Voice advice"],
    art: "leaf",
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
    ai: "Reads job offers and contracts in many languages and flags the warning signs of recruitment fraud.",
    why: "Workers' documents and identities deserve care, and are kept safe with us.",
    who: "Remittance companies, recruitment regulators and civil society.",
    workloads: ["Contract checks", "Fraud warnings", "Translation"],
    art: "records",
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
    ai: "Voice and chat support in Nepali, early warnings of network trouble, and filters for scam calls and messages.",
    why: "Subscriber data is sensitive, and the customers speak the languages of Nepal.",
    who: "Telecom operators and their technology partners.",
    workloads: ["Voice support", "Scam filtering"],
    art: "voice",
    runsOn: ["inferencing", "reserved"],
  },
  {
    slug: "legal-research",
    sector: "Law",
    title: "Courts and legal research",
    short: "Search rulings in Nepali and summarise long filings.",
    fact: "Nepal's precedents and statutes are written in Nepali.",
    source: { name: "Supreme Court of Nepal" },
    verified: false,
    ai: "Searches rulings in Nepali and summarises long filings — tools for lawyers and clerks, never deciding cases.",
    why: "Court records are sensitive and written in Nepali; both point to compute close to home.",
    who: "Courts, law firms and legal-tech teams.",
    workloads: ["Legal search", "Summaries"],
    art: "assistant",
    runsOn: ["inferencing", "storage", "services"],
  },
  {
    slug: "media",
    sector: "Media",
    title: "Media and information integrity",
    short: "Transcribe archives and catch fake audio in local languages.",
    fact: "Elections draw floods of synthetic and misleading media.",
    source: { name: "Election Commission of Nepal" },
    verified: false,
    ai: "Transcribes and searches archives, and helps spot synthetic audio and video in local languages.",
    why: "Newsrooms need tools tuned to Nepali voices and faces, run close to home.",
    who: "Newsrooms, fact-checkers and archives.",
    workloads: ["Transcripts", "Archive search", "Fake media checks"],
    art: "voice",
    runsOn: ["inferencing", "on-demand"],
  },
  {
    slug: "heritage",
    sector: "Heritage",
    title: "Manuscripts and cultural heritage",
    short: "Read Devanagari, Newar and Tibetan scripts from old scans and microfilm.",
    fact: "Around 180,000 manuscripts from Nepal have been microfilmed for preservation.",
    source: { name: "Nepal-German Manuscript Preservation Project" },
    verified: false,
    ai: "Reads Devanagari, Newar and Tibetan scripts so old manuscripts can be searched and studied.",
    why: "Heritage collections are national treasures; their digital copies deserve a home here too.",
    who: "Archives, museums, universities and researchers.",
    workloads: ["Manuscripts", "Archive search"],
    art: "records",
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
    why: "Answers come back quickly from close by, and the bill is in rupees.",
    who: "Tour operators, booking platforms and the tourism board.",
    workloads: ["Visitor assistants", "Translation"],
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
  "hydropower-forecasting",
  "language-ai",
  "public-records",
  "health-triage",
] as const;

export function findUseCase(slug: string) {
  return NEPAL.find((u) => u.slug === slug);
}
