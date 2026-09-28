import type { DocKind, DocStatus, FontKey, Plan, TemplateCategory } from "./types";

/* ── Documents ───────────────────────────────────────────────────────────── */
export interface DocKindMeta {
  kind: DocKind;
  label: string;
  plural: string;
  description: string;
  icon: string;
  group: "Sales & Money" | "People & Career" | "Business & Legal";
  prefixes: string;
  hasLineItems: boolean;
  hasClients: boolean;
  needsDueDate: boolean;
  templateCount: number;
  accent: string;
}

export const DOC_KINDS: DocKindMeta[] = [
  {
    kind: "invoice",
    label: "Invoice",
    plural: "Invoices",
    description: "Bill clients with tax, discounts, payment terms and a live balance.",
    icon: "receipt-text",
    group: "Sales & Money",
    prefixes: "INV",
    hasLineItems: true,
    hasClients: true,
    needsDueDate: true,
    templateCount: 24,
    accent: "#0e908f",
  },
  {
    kind: "quotation",
    label: "Quotation",
    plural: "Quotations",
    description: "Win work with priced, itemised offers that convert.",
    icon: "file-text",
    group: "Sales & Money",
    prefixes: "QT",
    hasLineItems: true,
    hasClients: true,
    needsDueDate: true,
    templateCount: 24,
    accent: "#1d4ed8",
  },
  {
    kind: "receipt",
    label: "Receipt",
    plural: "Receipts",
    description: "Confirm payment instantly with a clean, branded acknowledgement.",
    icon: "badge-check",
    group: "Sales & Money",
    prefixes: "RCT",
    hasLineItems: true,
    hasClients: true,
    needsDueDate: false,
    templateCount: 24,
    accent: "#047857",
  },
  {
    kind: "purchase-order",
    label: "Purchase Order",
    plural: "Purchase Orders",
    description: "Order goods and services from suppliers with full controls.",
    icon: "clipboard-list",
    group: "Sales & Money",
    prefixes: "PO",
    hasLineItems: true,
    hasClients: true,
    needsDueDate: true,
    templateCount: 6,
    accent: "#b45309",
  },
  {
    kind: "delivery-note",
    label: "Delivery Note",
    plural: "Delivery Notes",
    description: "Document dispatched goods, vehicles, drivers and sign-off.",
    icon: "truck",
    group: "Sales & Money",
    prefixes: "DN",
    hasLineItems: true,
    hasClients: true,
    needsDueDate: false,
    templateCount: 5,
    accent: "#0369a1",
  },
  {
    kind: "cv",
    label: "CV / Résumé",
    plural: "CVs & Résumés",
    description: "Interview-ready CVs with recruiter-friendly, ATS-clean structure.",
    icon: "user-round",
    group: "People & Career",
    prefixes: "CV",
    hasLineItems: false,
    hasClients: false,
    needsDueDate: false,
    templateCount: 24,
    accent: "#7c3aed",
  },
  {
    kind: "cover-letter",
    label: "Cover Letter",
    plural: "Cover Letters",
    description: "Tailored cover letters matched to the role and the hiring manager.",
    icon: "mail",
    group: "People & Career",
    prefixes: "CL",
    hasLineItems: false,
    hasClients: false,
    needsDueDate: false,
    templateCount: 5,
    accent: "#be185d",
  },
  {
    kind: "certificate",
    label: "Certificate",
    plural: "Certificates",
    description: "Awards, training and appreciation certificates with serials and seals.",
    icon: "award",
    group: "People & Career",
    prefixes: "CERT",
    hasLineItems: false,
    hasClients: false,
    needsDueDate: false,
    templateCount: 6,
    accent: "#a16207",
  },
  {
    kind: "proposal",
    label: "Business Proposal",
    plural: "Proposals",
    description: "Persuasive proposals: problem, approach, scope, pricing and timeline.",
    icon: "presentation",
    group: "Business & Legal",
    prefixes: "PROP",
    hasLineItems: true,
    hasClients: true,
    needsDueDate: true,
    templateCount: 6,
    accent: "#0f766e",
  },
  {
    kind: "company-profile",
    label: "Company Profile",
    plural: "Company Profiles",
    description: "Present your story, services, team and track record with confidence.",
    icon: "building-2",
    group: "Business & Legal",
    prefixes: "CP",
    hasLineItems: false,
    hasClients: false,
    needsDueDate: false,
    templateCount: 5,
    accent: "#1e3a8a",
  },
  {
    kind: "contract",
    label: "Contract",
    plural: "Contracts",
    description: "Agreements with parties, clauses, governing law and signature blocks.",
    icon: "scroll-text",
    group: "Business & Legal",
    prefixes: "AGR",
    hasLineItems: true,
    hasClients: true,
    needsDueDate: false,
    templateCount: 5,
    accent: "#4338ca",
  },
  {
    kind: "report",
    label: "Report",
    plural: "Reports",
    description: "Periodic business, project and financial reports with metrics.",
    icon: "chart-no-axes-column",
    group: "Business & Legal",
    prefixes: "RPT",
    hasLineItems: false,
    hasClients: false,
    needsDueDate: false,
    templateCount: 5,
    accent: "#0f172a",
  },
  {
    kind: "business-card",
    label: "Business Card",
    plural: "Business Cards",
    description: "Print-ready cards with QR contact sharing and brand polish.",
    icon: "id-card",
    group: "Business & Legal",
    prefixes: "BC",
    hasLineItems: false,
    hasClients: false,
    needsDueDate: false,
    templateCount: 5,
    accent: "#111827",
  },
];

export const docKindMeta = (kind: DocKind): DocKindMeta =>
  DOC_KINDS.find((d) => d.kind === kind) ?? DOC_KINDS[0];

export const DOC_GROUPS = ["Sales & Money", "People & Career", "Business & Legal"] as const;

export const STATUS_META: Record<DocStatus, { label: string; tone: "neutral" | "info" | "success" | "warning" | "danger" | "brand" }> = {
  draft: { label: "Draft", tone: "neutral" },
  sent: { label: "Sent", tone: "info" },
  paid: { label: "Paid", tone: "success" },
  partial: { label: "Part paid", tone: "warning" },
  overdue: { label: "Overdue", tone: "danger" },
  accepted: { label: "Accepted", tone: "success" },
  declined: { label: "Declined", tone: "danger" },
  expired: { label: "Expired", tone: "warning" },
  final: { label: "Final", tone: "brand" },
};

/* ── Templates ───────────────────────────────────────────────────────────── */
export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string; description: string }[] = [
  { id: "corporate", label: "Corporate", description: "Structured, dependable layouts for established businesses." },
  { id: "modern", label: "Modern", description: "Clean grids, generous type and contemporary colour blocking." },
  { id: "executive", label: "Executive", description: "Serif elegance and quiet authority for premium work." },
  { id: "minimal", label: "Minimal", description: "Maximum clarity, minimum ink — print-cheap and timeless." },
  { id: "creative", label: "Creative", description: "Bold colour, geometric shapes and expressive detail." },
  { id: "academic", label: "Academic", description: "Research, qualifications and credentials in a clear reading order." },
];

export const FONTS: { key: FontKey; label: string; stack: string; kind: "sans" | "serif" | "mono" }[] = [
  { key: "inter", label: "Inter", stack: "'Inter'", kind: "sans" },
  { key: "jakarta", label: "Plus Jakarta Sans", stack: "'Plus Jakarta Sans'", kind: "sans" },
  { key: "playfair", label: "Playfair Display", stack: "'Playfair Display'", kind: "serif" },
  { key: "lora", label: "Lora", stack: "'Lora'", kind: "serif" },
  { key: "georgia", label: "Georgia", stack: "Georgia, 'Times New Roman', serif", kind: "serif" },
  { key: "times", label: "Times", stack: "'Times New Roman', Times, serif", kind: "serif" },
  { key: "mono", label: "JetBrains Mono", stack: "'JetBrains Mono'", kind: "mono" },
  { key: "system", label: "System UI", stack: "system-ui, -apple-system, 'Segoe UI', sans-serif", kind: "sans" },
];

export const FONT_STACK = (key: FontKey): string =>
  FONTS.find((f) => f.key === key)?.stack ?? "'Inter'";

/* ── Currencies ──────────────────────────────────────────────────────────── */
export interface CurrencyMeta { code: string; label: string; symbol: string; decimals: number }

export const CURRENCIES: CurrencyMeta[] = [
  { code: "ZMW", label: "Zambian Kwacha", symbol: "K", decimals: 2 },
  { code: "USD", label: "US Dollar", symbol: "$", decimals: 2 },
  { code: "EUR", label: "Euro", symbol: "€", decimals: 2 },
  { code: "GBP", label: "British Pound", symbol: "£", decimals: 2 },
  { code: "ZAR", label: "South African Rand", symbol: "R", decimals: 2 },
  { code: "NGN", label: "Nigerian Naira", symbol: "₦", decimals: 2 },
  { code: "KES", label: "Kenyan Shilling", symbol: "KSh", decimals: 2 },
  { code: "GHS", label: "Ghanaian Cedi", symbol: "GH₵", decimals: 2 },
  { code: "TZS", label: "Tanzanian Shilling", symbol: "TSh", decimals: 0 },
  { code: "UGX", label: "Ugandan Shilling", symbol: "USh", decimals: 0 },
  { code: "MWK", label: "Malawian Kwacha", symbol: "MK", decimals: 2 },
  { code: "BWP", label: "Botswana Pula", symbol: "P", decimals: 2 },
  { code: "INR", label: "Indian Rupee", symbol: "₹", decimals: 2 },
  { code: "AED", label: "UAE Dirham", symbol: "AED", decimals: 2 },
  { code: "CAD", label: "Canadian Dollar", symbol: "C$", decimals: 2 },
  { code: "AUD", label: "Australian Dollar", symbol: "A$", decimals: 2 },
  { code: "CNY", label: "Chinese Yuan", symbol: "¥", decimals: 2 },
  { code: "JPY", label: "Japanese Yen", symbol: "¥", decimals: 0 },
  { code: "BRL", label: "Brazilian Real", symbol: "R$", decimals: 2 },
];

export const currencyMeta = (code: string): CurrencyMeta =>
  CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

/* ── Localisation ────────────────────────────────────────────────────────── */
export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "en-GB", label: "English (United Kingdom)", native: "English (UK)" },
  { code: "fr", label: "French", native: "Français" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "sw", label: "Swahili", native: "Kiswahili" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "zh", label: "Chinese", native: "中文" },
];

export const DATE_FORMATS = [
  { id: "d MMM yyyy", label: "12 Mar 2026" },
  { id: "dd/MM/yyyy", label: "12/03/2026" },
  { id: "MM/dd/yyyy", label: "03/12/2026" },
  { id: "yyyy-MM-dd", label: "2026-03-12" },
  { id: "d MMMM yyyy", label: "12 March 2026" },
  { id: "EEE, d MMM yyyy", label: "Thu, 12 Mar 2026" },
];

export const COUNTRIES = [
  "Zambia", "South Africa", "Zimbabwe", "Malawi", "Botswana", "Namibia", "Mozambique", "Tanzania", "Kenya", "Uganda",
  "Nigeria", "Ghana", "Rwanda", "Ethiopia", "Egypt", "Morocco", "United States", "Canada", "United Kingdom", "Ireland",
  "Germany", "France", "Netherlands", "Spain", "Italy", "Portugal", "Sweden", "Norway", "United Arab Emirates",
  "Saudi Arabia", "India", "Pakistan", "Singapore", "Malaysia", "China", "Japan", "Australia", "New Zealand", "Brazil",
  "Mexico", "Argentina",
];

export const TIMEZONES = [
  "Africa/Lusaka", "Africa/Johannesburg", "Africa/Harare", "Africa/Blantyre", "Africa/Nairobi", "Africa/Lagos",
  "Africa/Accra", "Africa/Cairo", "Africa/Casablanca", "Europe/London", "Europe/Dublin", "Europe/Berlin",
  "Europe/Paris", "Europe/Madrid", "Europe/Amsterdam", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "America/Sao_Paulo", "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore", "Asia/Shanghai",
  "Asia/Tokyo", "Australia/Sydney",
];

/* ── Plans ───────────────────────────────────────────────────────────────── */
export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "For trying the full product on real work — no card, no watermark.",
    monthly: 0,
    yearly: 0,
    currency: "USD",
    documents: 20,
    seats: 1,
    storageGb: 0.5,
    aiCredits: 20,
    features: [
      "20 documents per month",
      "All 13 document modules",
      "180 templates, no watermark",
      "PDF, Word, print, download & share links",
      "1 business profile with logo and signature",
      "QR codes on every document",
      "20 AI writing credits per month",
      "Community support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "For sole traders who quote and invoice every week.",
    monthly: 6,
    yearly: 60,
    currency: "USD",
    documents: 100,
    seats: 1,
    storageGb: 2,
    aiCredits: 100,
    features: [
      "100 documents per month",
      "All 13 document modules",
      "180 templates, no watermark",
      "PDF, Word, print, download & share links",
      "1 business profile",
      "QR codes, signatures and stamps",
      "Email support within one working day",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "For growing SMEs and consultants with several trading names.",
    monthly: 12,
    yearly: 120,
    currency: "USD",
    documents: 1000,
    seats: 5,
    storageGb: 20,
    aiCredits: 600,
    highlight: true,
    features: [
      "1,000 documents per month",
      "Everything in Starter",
      "AI writing assistant (600 credits)",
      "5 business profiles and 5 seats",
      "Custom colours, fonts and watermarks",
      "Recurring invoices and payment reminders",
      "20 GB for logos, signatures and stamps",
      "Priority support with same-day replies",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "For companies running multiple entities and staff.",
    monthly: 29,
    yearly: 290,
    currency: "USD",
    documents: "unlimited",
    seats: 10,
    storageGb: 60,
    aiCredits: 2000,
    features: [
      "Unlimited documents",
      "Everything in Professional",
      "25 business profiles and 10 seats",
      "Brand kits shared across the team",
      "Roles, permissions and audit trail",
      "CSV and accounting exports",
      "AI assistant (2,000 credits)",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "For corporates, NGOs, schools and church networks.",
    monthly: 79,
    yearly: 759,
    currency: "USD",
    documents: "unlimited",
    seats: 25,
    storageGb: 250,
    aiCredits: 10000,
    features: [
      "Unlimited everything",
      "Everything in Business",
      "25 seats, extendable on request",
      "Approval workflows for invoices and contracts",
      "SSO-ready account management",
      "Dedicated onboarding and staff training",
      "99.9% uptime commitment and account manager",
    ],
  },
];

export const planById = (id: string): Plan => PLANS.find((p) => p.id === id) ?? PLANS[0];

/* ── Numbering ───────────────────────────────────────────────────────────── */
export const CURRENCY_SYMBOLS = new Set(CURRENCIES.map((c) => c.symbol));

export const STORAGE_LIMIT_BYTES: Record<string, number> = {
  free: 512 * 1024 * 1024,
  starter: 1 * 1024 * 1024 * 1024,
  professional: 10 * 1024 * 1024 * 1024,
  business: 50 * 1024 * 1024 * 1024,
  enterprise: 250 * 1024 * 1024 * 1024,
};

export const AVATAR_COLORS = [
  "#0e908f", "#1d4ed8", "#7c3aed", "#be185d", "#b45309", "#047857", "#0369a1", "#4338ca", "#0f766e", "#9d174d",
];
