/**
 * Use cases — what people in Nepal can build, each grounded in one sourced
 * fact (docs/revamp/04 §6). The only home of this subject is /use-cases;
 * the home page shows three of these stories.
 *
 * Every story follows one template: the problem (one fact with a source) →
 * what AI does → why it belongs in Nepal → who builds it → what it runs on.
 * `verified: false` facts render with the staging marker until checked
 * against the source (they are secondary-sourced in the plan).
 *
 * Guardrails (04 §4): no named customers or partners, no "AI predicts
 * earthquakes", no clinical claims beyond triage and decision support, no
 * disaster casualty figures as hooks, "124 mother tongues" (not 123).
 */
import type { ProductSlug } from "./products";

export type Sector =
  | "Language"
  | "Finance"
  | "Government"
  | "Energy"
  | "Climate"
  | "Health"
  | "Education"
  | "Startups"
  | "Agriculture"
  | "Migration"
  | "Telecom"
  | "Law"
  | "Media"
  | "Heritage"
  | "Tourism";

export interface UseCase {
  slug: string;
  sector: Sector;
  title: string;
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
  runsOn: ProductSlug[];
}

export const NEPAL: UseCase[] = [
  {
    slug: "language-ai",
    sector: "Language",
    title: "Language AI for 124 mother tongues",
    fact: "Nepal's 2021 census recorded 124 mother tongues; Nepali is the first language of 44.86 % of people.",
    source: {
      name: "National Population and Housing Census 2021",
      url: "https://en.wikipedia.org/wiki/Languages_of_Nepal",
    },
    verified: true,
    ai: "Language models, speech recognition and translation for Nepali, Maithili, Bhojpuri, Tamang, Nepal Bhasa and more — and OCR that reads Devanagari.",
    why: "The text and voices are here, and many of them should stay here. Models trained close to the speakers can be checked by the speakers.",
    who: "Universities, language technologists, government digital teams, product companies.",
    runsOn: ["reserved", "inferencing", "mig-slicing", "storage", "services"],
  },
  {
    slug: "fraud-and-kyc",
    sector: "Finance",
    title: "Fraud, AML and KYC for banks and wallets",
    fact: "Nepal counts about 30 million mobile-banking accounts and 28 million digital-wallet accounts.",
    source: { name: "Nepal Rastra Bank payment statistics, mid-May 2026" },
    verified: false,
    ai: "Transaction scoring, document checks and name matching across scripts — models that learn the patterns of Nepali payments.",
    why: "Financial data is among the most sensitive there is. Training and scoring it inside the country keeps it under Nepal's jurisdiction.",
    who: "Banks, wallets, remittance companies and their technology partners.",
    runsOn: ["reserved", "inferencing", "storage", "services"],
  },
  {
    slug: "public-records",
    sector: "Government",
    title: "Government services and records",
    fact: "Nepal's National AI Policy names the Nagarik App as a channel for AI-assisted public services.",
    source: { name: "National Artificial Intelligence Policy, Government of Nepal" },
    verified: false,
    ai: "Reading handwritten Devanagari records, searching circulars and acts, and assistants that answer citizens in plain Nepali.",
    why: "Public records belong in the country. A realistic first step is public and non-sensitive data while certifications progress.",
    who: "Ministries, municipalities and the companies that build their systems.",
    runsOn: ["reserved", "inferencing", "storage", "services"],
  },
  {
    slug: "hydropower-forecasting",
    sector: "Energy",
    title: "Hydropower and grid forecasting",
    fact: "Hydropower makes up most of Nepal's installed electricity capacity.",
    source: { name: "Nepal Rastra Bank, FY2025/26" },
    verified: false,
    ai: "Forecasting river inflow, demand and cross-border trade; spotting sediment and faults from sensor and image data.",
    why: "The rivers, the plants and the grid data are all here; so is the team that has to act on a forecast at 3 a.m.",
    who: "Power producers, the grid operator, energy traders and researchers.",
    runsOn: ["reserved", "inferencing", "storage", "services"],
  },
  {
    slug: "himalayan-hazards",
    sector: "Climate",
    title: "Himalayan hazard science",
    fact: "Researchers have identified 21 potentially dangerous glacial lakes in Nepal.",
    source: { name: "ICIMOD, 2020" },
    verified: false,
    ai: "Reading satellite radar and imagery for ground movement, glacial lakes and landslide risk; running flood simulations faster.",
    why: "The mountains are here. Scientists in Nepal can run heavy models in-country instead of queueing for compute abroad.",
    who: "Research institutes, universities and disaster-risk agencies.",
    runsOn: ["on-demand", "reserved", "storage"],
  },
  {
    slug: "health-triage",
    sector: "Health",
    title: "Healthcare triage and decision support",
    fact: "WHO estimates tens of thousands of TB cases in Nepal each year, many of them missed.",
    source: { name: "World Health Organization, Global TB Report 2025" },
    verified: false,
    ai: "Flagging chest X-rays for a radiologist to review first, and structuring clinical notes — support for clinicians, never a diagnosis.",
    why: "Patient data should stay in the country, and tools should be validated on the people they serve.",
    who: "Hospitals, health-tech teams and public-health programmes.",
    runsOn: ["mig-slicing", "on-demand", "storage"],
  },
  {
    slug: "universities",
    sector: "Education",
    title: "Universities and AI skills",
    fact: "Nepal's National AI Policy sets a goal of training 5,000 AI professionals.",
    source: { name: "National Artificial Intelligence Policy, Government of Nepal" },
    verified: false,
    ai: "Courses, theses and research on real GPUs: an isolated slice for every student, whole GPUs for the lab's big runs.",
    why: "Students learn on the infrastructure they will build careers on — in rupees, without a foreign card.",
    who: "Universities, colleges and training institutes.",
    runsOn: ["mig-slicing", "on-demand", "services"],
  },
  {
    slug: "startups",
    sector: "Startups",
    title: "Startups and IT exporters",
    fact: "Nepal's IT services exports are estimated at about one billion US dollars a year.",
    source: { name: "Industry estimate (NAS-IT)" },
    verified: false,
    ai: "Fine-tuning and serving models for products sold at home and abroad, without paying for GPUs with foreign currency.",
    why: "Billing in rupees removes the card limits and currency friction of foreign clouds.",
    who: "Product startups, AI agencies and IT exporters.",
    runsOn: ["on-demand", "inferencing", "mig-slicing", "reserved"],
  },
  {
    slug: "agriculture",
    sector: "Agriculture",
    title: "Agriculture advice in Nepali",
    fact: "Most Nepali households farm.",
    source: { name: "National Statistics Office" },
    verified: false,
    ai: "Spotting crop disease from a phone photo and answering farmers' questions by voice, in their language.",
    why: "The crops, climates and languages are local; the models should be trained on them.",
    who: "Agri-tech companies, cooperatives and development programmes.",
    runsOn: ["on-demand", "inferencing", "mig-slicing"],
  },
  {
    slug: "migrant-workers",
    sector: "Migration",
    title: "Safer work abroad",
    fact: "Remittances equal roughly a third of Nepal's economy.",
    source: { name: "Nepal Rastra Bank, FY2025/26" },
    verified: false,
    ai: "Checking job offers and contracts in many languages, and flagging recruitment fraud before someone pays a fee.",
    why: "Workers' documents and identities deserve to stay in their own country.",
    who: "Remittance companies, recruitment regulators and civil society.",
    runsOn: ["inferencing", "reserved", "storage"],
  },
  {
    slug: "telecom",
    sector: "Telecom",
    title: "Telecom care and network intelligence",
    fact: "Nepal has more than 30 million broadband subscriptions.",
    source: { name: "Nepal Telecommunications Authority" },
    verified: false,
    ai: "Voice and chat support in Nepali, network-anomaly detection, and filtering scam calls and messages.",
    why: "Subscriber data is regulated and local, and so are the languages the customers speak.",
    who: "Telecom operators and their technology partners.",
    runsOn: ["inferencing", "reserved"],
  },
  {
    slug: "legal-research",
    sector: "Law",
    title: "Courts and legal research",
    fact: "Nepal's precedents and statutes are written in Nepali.",
    source: { name: "Supreme Court of Nepal" },
    verified: false,
    ai: "Digitising records, searching precedents in Nepali and summarising long filings — tools for lawyers and clerks, never deciding cases.",
    why: "Court records are sensitive and in Nepali; both point to compute in Nepal.",
    who: "Courts, law firms and legal-tech teams.",
    runsOn: ["inferencing", "storage", "services"],
  },
  {
    slug: "media",
    sector: "Media",
    title: "Media and information integrity",
    fact: "Elections draw floods of synthetic and misleading media.",
    source: { name: "Election Commission of Nepal" },
    verified: false,
    ai: "Transcribing and searching archives, and detecting synthetic audio and video in local languages.",
    why: "Newsrooms need tools tuned to Nepali voices and faces, run close to home.",
    who: "Newsrooms, fact-checkers and archives.",
    runsOn: ["inferencing", "on-demand"],
  },
  {
    slug: "heritage",
    sector: "Heritage",
    title: "Manuscripts and cultural heritage",
    fact: "Around 180,000 manuscripts from Nepal have been microfilmed for preservation.",
    source: { name: "Nepal-German Manuscript Preservation Project" },
    verified: false,
    ai: "Reading Devanagari, Newar and Tibetan scripts, and building 3D records of monuments.",
    why: "Heritage collections are national treasures; their digital copies belong at home too.",
    who: "Archives, museums, universities and researchers.",
    runsOn: ["on-demand", "storage", "services"],
  },
  {
    slug: "tourism",
    sector: "Tourism",
    title: "Multilingual trek and heritage guides",
    fact: "More than a million international visitors came to Nepal in 2025.",
    source: { name: "Nepal Tourism Board" },
    verified: false,
    ai: "Assistants that answer trekkers and visitors in their own languages, with local knowledge.",
    why: "The case here is cost and closeness rather than residency: local inference is fast and billed in rupees.",
    who: "Tour operators, booking platforms and the tourism board.",
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
    { title: "Shared rivers", body: "Flood and glacial-lake science for shared basins such as the Koshi, as research compute." },
    { title: "Power trade", body: "Forecasting cross-border electricity trade from the Nepal side and public market data." },
    { title: "Nepal subsidiaries", body: "Indian companies' operations in Nepal, with their Nepal data." },
    { title: "Shared heritage", body: "Manuscript and archive projects with research partners." },
    { title: "Overflow capacity", body: "Reserved capacity for non-personal workloads — open data, synthetic data, simulation and rendering." },
  ],
} as const;

/** The three stories on the home page. */
export const HOME_STORIES = ["language-ai", "himalayan-hazards", "universities"] as const;

export function findUseCase(slug: string) {
  return NEPAL.find((u) => u.slug === slug);
}
