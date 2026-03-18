import {
  faBoltLightning,
  faDatabase,
  faLink,
  faMobile,
  faUserDoctor,
} from "@fortawesome/free-solid-svg-icons";
import { TFeatureItem } from "./types";

export const FEATURES_DATA: TFeatureItem[] = [
  {
    title: "Autonomous Agent Cycle",
    description:
      "Runs a continuous Perceive -> Reason -> Act -> Explain loop that identifies the highest-risk farm issue and responds without waiting for manual prompts.",
    icon: faBoltLightning,
  },
  {
    title: "Explainable AI Decisions",
    description:
      "Each decision is logged with plain-language reasoning so farmers and extension officers understand what happened and why.",
    src: "https://img.icons8.com/ios-filled/100/064E3B/sparkling--v1.png",
    alt: "Stars sparkling",
  },
  {
    title: "Farm State Intelligence",
    description:
      "Tracks flock health, mortality, feed and water levels, egg production, and environmental signals to detect risk earlier.",
    icon: faDatabase,
  },
  {
    title: "Real-Time Dashboard",
    description:
      "Live GraphQL subscription updates keep the dashboard in sync with agent actions, threshold breaches, and active alerts.",
    icon: faMobile,
  },
  {
    title: "Voice-First Logging",
    description:
      "Supports voice capture (English - Kenya) so farmers can log observations quickly in the field with minimal typing.",
    icon: faUserDoctor,
  },
  {
    title: "Revenue-Aware Actions",
    description:
      "Recommends practical next steps such as sale windows, disease escalation alerts, and intervention priorities to protect margins.",
    icon: faLink,
  },
];

export const PARTNERSHIPS_DATA = [
  { src: "/assets/images/nasa.svg", alt: "NASA logo", name: "NASA" },
  { src: "/assets/images/meta.svg", alt: "Meta logo", name: "Meta" },
  { src: "/assets/images/openai.svg", alt: "OpenAI logo", name: "OpenAI" },
  {
    src: "/assets/images/microsoft.svg",
    alt: "Microsoft logo",
    name: "Microsoft",
  },
  { src: "/assets/images/google.svg", alt: "Google logo", name: "Google" },
];

export const FAQ_DATA = [
  {
    key: "1",
    title: "How does KukuSmart work?",
    content: `KukuSmart continuously monitors farm data, identifies the most critical issue,
              executes the next best action, and records a plain-language explanation.
              It is designed as an autonomous agent, not just a reporting dashboard.`,
  },
  {
    key: "2",
    title: "Who is this app targeting?",
    content: `The app targets smallholder poultry farmers in Kenya (50-2,000 birds),
              extension officers supporting multiple farms, and cooperative managers
              who need consolidated visibility across flocks.`,
  },
  {
    key: "3",
    title: "When does KukuSmart trigger automatically?",
    content: `The agent auto-triggers on critical thresholds like low water levels,
              high house temperature, and unusual mortality trends so risks are handled
              early before they become expensive losses.`,
  },
  {
    key: "4",
    title: "What technology stack powers KukuSmart?",
    content: `Frontend is React with Apollo Client, backend is Node.js with Apollo Server,
              and data is served through GraphQL with PostgreSQL for persistent farm
              history and audit trails.`,
  },
];

export const TESTIMONIALS_DATA = [
  {
    quote:
      "Before KukuSmart, we only reacted after birds started dying. Now alerts come early, and the recommended actions are clear. We reduced avoidable losses and made decisions with confidence.",
    name: "Peter Mwangi",
    title: "Layer Farmer, Kiambu",
  },
  {
    quote:
      "As an extension officer, I can see risk trends across multiple farms and intervene faster. The decision logs make every recommendation explainable and easier to trust.",
    name: "Faith Njeri",
    title: "Agricultural Extension Officer",
  },
  {
    quote:
      "The voice logging is practical for field work. I record observations quickly and KukuSmart keeps the farm history structured, which helps when planning feed and treatment cycles.",
    name: "Martha Atieno",
    title: "Broiler Farmer, Kisumu",
  },
  {
    quote:
      "KukuSmart gives our cooperative one source of truth for flock performance. Better timing on sales and faster response to disease pressure improved outcomes across member farms.",
    name: "Daniel Kiprotich",
    title: "Poultry Cooperative Manager",
  },
];

// each product object should have name, supplier, price, image, location and description
export const TEMP_PRODUCT_DATA = [
 {
  id: "1",
  name: "Starter Chick Mash 70kg",
  supplier: "KukuFeeds Hub",
  price: "3200",
  location: "Nairobi",
  description: "Balanced high-protein starter feed for day-old to 8-week chicks to support stronger early growth and reduced stress in high-density housing."
 },
 {
  id: "2",
  name: "Layer Pellet 70kg",
  supplier: "FarmGate Poultry Supplies",
  price: "3650",
  location: "Mombasa",
  description: "High-calcium layer feed formulated for consistent shell quality and egg yield during long production cycles."
 },
 {
  id: "3",
  name: "Vitamin-Electrolyte Booster",
  supplier: "VetAgro Chemshop",
  price: "850",
  location: "Mombasa",
  description: "Water-soluble supplement for heat stress periods to stabilize flock hydration and support recovery after transport or vaccination."
 },
 {
  id: "4",
  name: "Newcastle Vaccine Pack",
  supplier: "Landmark Vet Stores",
  price: "1450",
  location: "Malindi",
  description: "Cold-chain vaccine pack for scheduled disease prevention in broiler and layer operations with handling guidance included."
 },
 {
  id: "5",
  name: "Automatic Nipple Drinker Set",
  supplier: "Grocer Farm Tech",
  price: "2100",
  location: "Kwale",
  description: "Low-waste water line kit for medium flocks that helps maintain cleaner litter and reduces dehydration risk during hot days."
 },
 {
  id: "6",
  name: "Brooder Heat Lamp 250W",
  supplier: "Happy Farm Poultry",
  price: "1350",
  location: "Kisauni",
  description: "Durable brooder heat lamp assembly designed for early chick warmth, better feed intake, and lower first-week mortality.",
 }
]


