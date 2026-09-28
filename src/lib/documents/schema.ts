import type { DocKind } from "../types";
import { uid } from "../utils";

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "number"
  | "money"
  | "email"
  | "tel"
  | "url"
  | "select"
  | "switch"
  | "tags";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
  span?: 1 | 2;
  rows?: number;
  ai?: string;
}

export interface SectionDef {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  columns?: 1 | 2;
  fields: FieldDef[];
}

export interface ListDef {
  key: string;
  label: string;
  description?: string;
  icon?: string;
  /**
   * Renders a row as `label|secondary` so the editor can show a compact
   * summary without knowing each list's shape.
   */
  summarize: (item: Record<string, unknown>) => [string, string];
  fields: FieldDef[];
  blank: () => Record<string, unknown>;
  aiAssist?: boolean;
}

export interface KindSchema {
  kind: DocKind;
  client?: { label: string; description: string };
  items?: { label: string; description: string; unitOptions: string[]; showTax: boolean };
  sections: SectionDef[];
  lists: ListDef[];
}

/* ── Re-usable field groups ──────────────────────────────────────────────── */
const CLIENT_CORE: FieldDef[] = [
  { key: "clientName", label: "Contact name", type: "text", placeholder: "e.g. Grace Banda", ai: "clientName" },
  { key: "clientCompany", label: "Company", type: "text", placeholder: "e.g. Banda Logistics Ltd" },
  { key: "clientEmail", label: "Email", type: "email", placeholder: "accounts@company.com" },
  { key: "clientPhone", label: "Phone", type: "tel", placeholder: "+260 97 000 0000" },
  { key: "clientAddress", label: "Address", type: "textarea", rows: 2, span: 2, placeholder: "Plot 24, Cairo Road\nLusaka, Zambia" },
  { key: "clientTaxId", label: "Tax / VAT number", type: "text", placeholder: "TPIN 1000000000", span: 2 },
];

const ITEM_FIELDS: FieldDef[] = [
  { key: "description", label: "Description", type: "text", span: 2, placeholder: "Website design — 5 pages", ai: "itemDescription" },
  { key: "detail", label: "Detail", type: "text", span: 2, placeholder: "Optional supporting line" },
  { key: "qty", label: "Qty", type: "number", placeholder: "1" },
  { key: "unit", label: "Unit", type: "text", placeholder: "unit" },
  { key: "rate", label: "Rate", type: "money", placeholder: "0.00" },
  { key: "taxRate", label: "Tax %", type: "number", placeholder: "16" },
];

const COMMERCIAL: SectionDef = {
  id: "commercial",
  label: "Taxes, discounts & payment",
  description: "Totals recalculate live as you type.",
  icon: "calculator",
  columns: 2,
  fields: [
    { key: "currency", label: "Currency", type: "select", options: [] },
    { key: "taxLabel", label: "Tax label", type: "text", placeholder: "VAT" },
    { key: "taxRate", label: "Tax rate %", type: "number", placeholder: "16" },
    {
      key: "discountType",
      label: "Discount type",
      type: "select",
      options: [
        { value: "percent", label: "Percentage" },
        { value: "fixed", label: "Fixed amount" },
      ],
    },
    { key: "discountValue", label: "Discount value", type: "number", placeholder: "0" },
    { key: "shipping", label: "Shipping / handling", type: "money", placeholder: "0.00" },
    { key: "amountPaid", label: "Amount paid", type: "money", placeholder: "0.00" },
    {
      key: "paymentMethod",
      label: "Payment method",
      type: "select",
      options: [
        { value: "", label: "Not specified" },
        { value: "Bank transfer", label: "Bank transfer" },
        { value: "Mobile money", label: "Mobile money" },
        { value: "Cash", label: "Cash" },
        { value: "Card", label: "Card" },
        { value: "Cheque", label: "Cheque" },
      ],
    },
  ],
};

const NOTES: SectionDef = {
  id: "notes",
  label: "Notes & terms",
  icon: "notebook-pen",
  columns: 1,
  fields: [
    { key: "notes", label: "Notes to the client", type: "textarea", rows: 3, ai: "notes", placeholder: "Thank you for your business…" },
    { key: "terms", label: "Terms & conditions", type: "textarea", rows: 3, ai: "terms", placeholder: "Payment due within 30 days…" },
  ],
};

const commercialWithCurrency = (): SectionDef => ({
  ...COMMERCIAL,
  fields: COMMERCIAL.fields.map((f) =>
    f.key === "currency"
      ? {
          ...f,
          options: [
            "ZMW", "USD", "EUR", "GBP", "ZAR", "NGN", "KES", "GHS", "TZS", "UGX", "MWK", "BWP", "INR", "AED", "CAD",
            "AUD", "CNY", "JPY", "BRL",
          ].map((c) => ({ value: c, label: c })),
        }
      : f
  ),
});

/* ── Schemas ─────────────────────────────────────────────────────────────── */
const LINE_ITEM_GENERAL = {
  items: {
    label: "Line items",
    description: "Add as many lines as you need — descriptions can be written for you.",
    unitOptions: ["unit", "hour", "day", "week", "month", "kg", "litre", "page", "session", "package", "km", "box"],
    showTax: true,
  },
};

export const SCHEMAS: Record<DocKind, KindSchema> = {
  invoice: {
    kind: "invoice",
    client: { label: "Billed to", description: "Who is paying this invoice?" },
    items: LINE_ITEM_GENERAL.items,
    sections: [
      {
        id: "details",
        label: "Invoice details",
        icon: "file-text",
        columns: 2,
        fields: [
          { key: "title", label: "Document title", type: "text", placeholder: "Tax Invoice" },
          { key: "reference", label: "Reference", type: "text", placeholder: "Project or PO reference" },
          { key: "subject", label: "Subject line", type: "text", span: 2, placeholder: "Website design and hosting — March 2026" },
        ],
      },
      commercialWithCurrency(),
      NOTES,
    ],
    lists: [],
  },
  quotation: {
    kind: "quotation",
    client: { label: "Prepared for", description: "The prospect receiving your quotation." },
    items: LINE_ITEM_GENERAL.items,
    sections: [
      {
        id: "details",
        label: "Quotation details",
        icon: "file-text",
        columns: 2,
        fields: [
          { key: "title", label: "Document title", type: "text", placeholder: "Quotation" },
          { key: "reference", label: "Reference", type: "text", placeholder: "RFQ reference" },
          { key: "subject", label: "Scope summary", type: "text", span: 2, placeholder: "Supply and installation of solar equipment" },
          { key: "intro", label: "Introduction", type: "textarea", rows: 3, span: 2, ai: "quotationIntro" },
        ],
      },
      commercialWithCurrency(),
      {
        id: "validity",
        label: "Validity & acceptance",
        icon: "shield-check",
        columns: 1,
        fields: [
          { key: "notes", label: "Notes", type: "textarea", rows: 3, ai: "notes" },
          { key: "terms", label: "Terms & conditions", type: "textarea", rows: 3, ai: "terms" },
          { key: "deliverables", label: "Deliverables", type: "tags", span: 2, help: "Press Enter after each deliverable." },
        ],
      },
    ],
    lists: [],
  },
  receipt: {
    kind: "receipt",
    client: { label: "Received from", description: "The client who made the payment." },
    items: LINE_ITEM_GENERAL.items,
    sections: [
      {
        id: "details",
        label: "Payment details",
        icon: "badge-check",
        columns: 2,
        fields: [
          { key: "title", label: "Document title", type: "text", placeholder: "Official Receipt" },
          { key: "receivedFrom", label: "Received from", type: "text", placeholder: "Client or payer name" },
          { key: "paymentReference", label: "Payment reference", type: "text", placeholder: "Txn / cheque number" },
          { key: "subject", label: "Payment for", type: "text", span: 2, placeholder: "Consulting services — February 2026" },
        ],
      },
      commercialWithCurrency(),
      { ...NOTES, fields: [{ key: "notes", label: "Notes", type: "textarea", rows: 3, ai: "receiptNotes" }] },
    ],
    lists: [],
  },
  "purchase-order": {
    kind: "purchase-order",
    client: { label: "Supplier", description: "Who is fulfilling this order?" },
    items: { ...LINE_ITEM_GENERAL.items, label: "Order items" },
    sections: [
      {
        id: "details",
        label: "Order details",
        icon: "clipboard-list",
        columns: 2,
        fields: [
          { key: "title", label: "Document title", type: "text", placeholder: "Purchase Order" },
          { key: "reference", label: "Internal reference", type: "text", placeholder: "Requisition number" },
          { key: "deliveryAddress", label: "Deliver to", type: "textarea", rows: 2, span: 2, placeholder: "Warehouse address" },
          { key: "paymentMethod", label: "Payment terms", type: "text", placeholder: "30 days from invoice" },
        ],
      },
      commercialWithCurrency(),
      NOTES,
    ],
    lists: [],
  },
  "delivery-note": {
    kind: "delivery-note",
    client: { label: "Deliver to", description: "Receiving party and delivery address." },
    items: { ...LINE_ITEM_GENERAL.items, label: "Items delivered", showTax: false },
    sections: [
      {
        id: "details",
        label: "Dispatch details",
        icon: "truck",
        columns: 2,
        fields: [
          { key: "title", label: "Document title", type: "text", placeholder: "Delivery Note" },
          { key: "poNumber", label: "Order / PO number", type: "text", placeholder: "PO-2026-014" },
          { key: "deliveryAddress", label: "Delivery address", type: "textarea", rows: 2, span: 2 },
          { key: "driverName", label: "Driver", type: "text", placeholder: "Driver name" },
          { key: "vehicleNumber", label: "Vehicle", type: "text", placeholder: "ABC 1234" },
          { key: "receivedBy", label: "Received by", type: "text", placeholder: "Name of person signing" },
          { key: "notes", label: "Handling notes", type: "textarea", rows: 2, span: 2, ai: "notes" },
        ],
      },
    ],
    lists: [],
  },
  cv: {
    kind: "cv",
    sections: [
      {
        id: "personal",
        label: "Personal details",
        icon: "user-round",
        columns: 2,
        fields: [
          { key: "fullName", label: "Full name", type: "text", placeholder: "Chanda Mwale" },
          { key: "headline", label: "Professional title", type: "text", placeholder: "Senior Software Engineer" },
          { key: "email", label: "Email", type: "email", placeholder: "you@email.com" },
          { key: "phone", label: "Phone", type: "tel", placeholder: "+260 97 000 0000" },
          { key: "location", label: "Location", type: "text", placeholder: "Lusaka, Zambia" },
          { key: "website", label: "Portfolio / website", type: "url", placeholder: "yoursite.com" },
          { key: "linkedin", label: "LinkedIn", type: "url", span: 2, placeholder: "linkedin.com/in/yourname" },
        ],
      },
      {
        id: "summary",
        label: "Professional summary",
        icon: "sparkles",
        columns: 1,
        fields: [
          { key: "summary", label: "Summary", type: "textarea", rows: 5, ai: "cvSummary" },
          { key: "skills", label: "Core skills", type: "tags", span: 2, ai: "cvSkills" },
          { key: "languages", label: "Languages", type: "tags", span: 2 },
        ],
      },
      {
        id: "extras",
        label: "References & interests",
        icon: "link",
        columns: 2,
        fields: [
          { key: "referee", label: "Referee name", type: "text" },
          { key: "refereeTitle", label: "Referee title", type: "text" },
          { key: "refereeContact", label: "Referee contact", type: "text", span: 2 },
          { key: "interests", label: "Interests", type: "tags", span: 2 },
        ],
      },
    ],
    lists: [
      {
        key: "experience",
        label: "Work experience",
        description: "Most recent role first.",
        icon: "briefcase",
        summarize: (i) => [String(i.role ?? ""), `${i.company ?? ""}${i.start ? ` · ${i.start}–${i.current ? "Present" : i.end}` : ""}`],
        fields: [
          { key: "role", label: "Job title", type: "text", placeholder: "Senior Software Engineer" },
          { key: "company", label: "Company", type: "text", placeholder: "TechZambia Ltd" },
          { key: "location", label: "Location", type: "text", placeholder: "Lusaka, Zambia" },
          { key: "start", label: "From", type: "text", placeholder: "Jan 2022" },
          { key: "end", label: "To", type: "text", placeholder: "Dec 2024" },
          { key: "current", label: "Current role", type: "switch" },
          { key: "highlights", label: "Achievements", type: "tags", span: 2, ai: "cvExperience" },
        ],
        blank: () => ({ id: uid("exp"), role: "", company: "", location: "", start: "", end: "", current: false, highlights: [] }),
        aiAssist: true,
      },
      {
        key: "education",
        label: "Education",
        icon: "graduation-cap",
        summarize: (i) => [String(i.qualification ?? ""), `${i.institution ?? ""}${i.end ? ` · ${i.end}` : ""}`],
        fields: [
          { key: "qualification", label: "Qualification", type: "text", placeholder: "BSc Computer Science" },
          { key: "institution", label: "Institution", type: "text", placeholder: "University of Zambia" },
          { key: "location", label: "Location", type: "text" },
          { key: "start", label: "From", type: "text" },
          { key: "end", label: "To", type: "text", placeholder: "2018" },
          { key: "grade", label: "Grade / class", type: "text", placeholder: "Distinction" },
        ],
        blank: () => ({ id: uid("edu"), qualification: "", institution: "", location: "", start: "", end: "", grade: "" }),
      },
      {
        key: "projects",
        label: "Projects",
        icon: "folder-kanban",
        summarize: (i) => [String(i.name ?? ""), String(i.role ?? i.description ?? "")],
        fields: [
          { key: "name", label: "Project", type: "text" },
          { key: "role", label: "Your role", type: "text" },
          { key: "description", label: "Description", type: "textarea", rows: 3, span: 2, ai: "projectDescription" },
          { key: "link", label: "Link", type: "url", span: 2 },
        ],
        blank: () => ({ id: uid("prj"), name: "", role: "", description: "", link: "" }),
        aiAssist: true,
      },
      {
        key: "certifications",
        label: "Certifications",
        icon: "award",
        summarize: (i) => [String(i.name ?? ""), String(i.role ?? "")],
        fields: [
          { key: "name", label: "Certification", type: "text" },
          { key: "role", label: "Issuer & year", type: "text", placeholder: "Cisco · 2024" },
        ],
        blank: () => ({ id: uid("crt"), name: "", role: "" }),
      },
    ],
  },
  "cover-letter": {
    kind: "cover-letter",
    sections: [
      {
        id: "recipient",
        label: "Application details",
        icon: "mail",
        columns: 2,
        fields: [
          { key: "fullName", label: "Your name", type: "text", placeholder: "Chanda Mwale" },
          { key: "email", label: "Your email", type: "email" },
          { key: "phone", label: "Your phone", type: "tel" },
          { key: "location", label: "Your location", type: "text" },
          { key: "position", label: "Position applied for", type: "text", span: 2, placeholder: "Backend Engineer" },
          { key: "recipientName", label: "Hiring manager", type: "text", placeholder: "Ms. Mutinta Phiri" },
          { key: "recipientTitle", label: "Their title", type: "text", placeholder: "Head of Engineering" },
          { key: "companyName", label: "Company", type: "text", span: 2 },
          { key: "companyAddress", label: "Company address", type: "textarea", rows: 2, span: 2 },
        ],
      },
      {
        id: "letter",
        label: "The letter",
        icon: "pen-line",
        columns: 1,
        fields: [
          { key: "opening", label: "Opening", type: "textarea", rows: 3, ai: "coverOpening" },
          { key: "bodyParagraphs", label: "Body paragraphs", type: "tags", help: "One paragraph per entry — use the AI assistant to write them.", ai: "coverBody" },
          { key: "closing", label: "Closing", type: "textarea", rows: 3, ai: "coverClosing" },
        ],
      },
    ],
    lists: [],
  },
  certificate: {
    kind: "certificate",
    sections: [
      {
        id: "award",
        label: "Certificate details",
        icon: "award",
        columns: 2,
        fields: [
          { key: "title", label: "Certificate title", type: "text", span: 2, placeholder: "Certificate of Achievement" },
          { key: "recipient", label: "Recipient", type: "text", placeholder: "Grace Banda" },
          { key: "award", label: "Award / programme", type: "text", placeholder: "Advanced Project Management" },
          { key: "ceremonyDate", label: "Date awarded", type: "date" },
          { key: "serial", label: "Serial number", type: "text", placeholder: "SOC-2026-0001" },
          { key: "description", label: "Citation", type: "textarea", rows: 3, span: 2, ai: "certificateCitation" },
        ],
      },
      {
        id: "signatures",
        label: "Sign-off",
        icon: "pen-tool",
        columns: 2,
        fields: [
          { key: "signatories", label: "Signatories", type: "tags", span: 2, help: "Add signatory names, one per line." },
        ],
      },
    ],
    lists: [],
  },
  proposal: {
    kind: "proposal",
    client: { label: "Prepared for", description: "The organisation you are pitching." },
    items: LINE_ITEM_GENERAL.items,
    sections: [
      {
        id: "overview",
        label: "Proposal overview",
        icon: "presentation",
        columns: 2,
        fields: [
          { key: "title", label: "Proposal title", type: "text", span: 2, placeholder: "Digital Transformation Proposal" },
          { key: "reference", label: "Reference", type: "text" },
          { key: "subject", label: "One-line summary", type: "text", placeholder: "A 12-week rollout of a unified sales platform" },
          { key: "intro", label: "Executive summary", type: "textarea", rows: 5, span: 2, ai: "proposalSummary" },
        ],
      },
      {
        id: "approach",
        label: "Problem & approach",
        icon: "target",
        columns: 1,
        fields: [
          { key: "problem", label: "The challenge", type: "textarea", rows: 4, ai: "proposalProblem" },
          { key: "approach", label: "Our approach", type: "textarea", rows: 4, ai: "proposalApproach" },
          { key: "scope", label: "Scope of work", type: "tags", span: 2, ai: "proposalScope" },
          { key: "deliverables", label: "Deliverables", type: "tags", span: 2, ai: "proposalDeliverables" },
          { key: "whyUs", label: "Why us", type: "textarea", rows: 4, ai: "proposalWhyUs" },
        ],
      },
      commercialWithCurrency(),
      {
        id: "close",
        label: "Closing",
        icon: "flag",
        columns: 1,
        fields: [
          { key: "conclusion", label: "Next steps", type: "textarea", rows: 3, ai: "proposalConclusion" },
          { key: "terms", label: "Terms", type: "textarea", rows: 3, ai: "terms" },
        ],
      },
    ],
    lists: [
      {
        key: "timeline",
        label: "Timeline",
        description: "Phases with durations.",
        icon: "calendar-clock",
        summarize: (i) => [String(i.phase ?? ""), String(i.duration ?? "")],
        fields: [
          { key: "phase", label: "Phase", type: "text", placeholder: "Discovery & audit" },
          { key: "duration", label: "Duration", type: "text", placeholder: "Week 1–2" },
          { key: "details", label: "What happens", type: "textarea", rows: 2, span: 2, ai: "timelineDetails" },
        ],
        blank: () => ({ id: uid("tlm"), phase: "", duration: "", details: "" }),
        aiAssist: true,
      },
    ],
  },
  "company-profile": {
    kind: "company-profile",
    sections: [
      {
        id: "identity",
        label: "Company identity",
        icon: "building-2",
        columns: 2,
        fields: [
          { key: "title", label: "Profile title", type: "text", span: 2, placeholder: "Company Profile 2026" },
          { key: "tagline", label: "Tagline", type: "text", span: 2, placeholder: "Engineering the future of Zambian logistics" },
          { key: "about", label: "About the company", type: "textarea", rows: 5, span: 2, ai: "companyAbout" },
          { key: "mission", label: "Mission", type: "textarea", rows: 3, ai: "companyMission" },
          { key: "vision", label: "Vision", type: "textarea", rows: 3, ai: "companyVision" },
          { key: "values", label: "Core values", type: "tags", span: 2, ai: "companyValues" },
        ],
      },
      {
        id: "capability",
        label: "Capability statement",
        icon: "badge-check",
        columns: 1,
        fields: [
          { key: "intro", label: "Introductory statement", type: "textarea", rows: 4, ai: "companyIntro" },
          { key: "accreditations", label: "Accreditations", type: "tags", span: 2 },
          { key: "whyUs", label: "Why clients choose us", type: "textarea", rows: 4, ai: "companyWhyUs" },
        ],
      },
    ],
    lists: [
      {
        key: "services",
        label: "Services",
        icon: "layers",
        summarize: (i) => [String(i.name ?? ""), String(i.description ?? "")],
        fields: [
          { key: "name", label: "Service", type: "text" },
          { key: "description", label: "Description", type: "textarea", rows: 3, span: 2, ai: "serviceDescription" },
        ],
        blank: () => ({ id: uid("svc"), name: "", description: "" }),
        aiAssist: true,
      },
      {
        key: "stats",
        label: "Track record",
        icon: "trending-up",
        summarize: (i) => [String(i.value ?? ""), String(i.label ?? "")],
        fields: [
          { key: "value", label: "Value", type: "text", placeholder: "120+" },
          { key: "label", label: "Label", type: "text", placeholder: "Projects delivered" },
        ],
        blank: () => ({ id: uid("stt"), value: "", label: "" }),
      },
      {
        key: "team",
        label: "Leadership team",
        icon: "users",
        summarize: (i) => [String(i.name ?? ""), String(i.role ?? "")],
        fields: [
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role", type: "text" },
          { key: "contact", label: "Contact", type: "text", span: 2 },
        ],
        blank: () => ({ id: uid("tm"), name: "", role: "", contact: "" }),
      },
    ],
  },
  contract: {
    kind: "contract",
    client: { label: "Counterparty", description: "The second party to this agreement." },
    items: { ...LINE_ITEM_GENERAL.items, label: "Fees & schedule", showTax: true },
    sections: [
      {
        id: "details",
        label: "Agreement details",
        icon: "scroll-text",
        columns: 2,
        fields: [
          { key: "title", label: "Agreement title", type: "text", span: 2, placeholder: "Service Agreement" },
          { key: "reference", label: "Reference", type: "text" },
          { key: "subject", label: "Subject", type: "text", placeholder: "Website maintenance retainer" },
          { key: "intro", label: "Recitals", type: "textarea", rows: 4, span: 2, ai: "contractRecitals" },
        ],
      },
      commercialWithCurrency(),
      {
        id: "legal",
        label: "Legal terms",
        icon: "scale",
        columns: 2,
        fields: [
          { key: "terms", label: "Term & termination", type: "textarea", rows: 3, span: 2, ai: "contractTerm" },
          { key: "notes", label: "Additional provisions", type: "textarea", rows: 3, span: 2, ai: "contractProvisions" },
        ],
      },
    ],
    lists: [
      {
        key: "parties",
        label: "Parties",
        icon: "users",
        summarize: (i) => [String(i.name ?? ""), String(i.role ?? "")],
        fields: [
          { key: "role", label: "Role in agreement", type: "text", placeholder: "The Service Provider" },
          { key: "name", label: "Legal name", type: "text" },
          { key: "company", label: "Company", type: "text" },
          { key: "address", label: "Address", type: "textarea", rows: 2, span: 2 },
          { key: "email", label: "Email", type: "email" },
          { key: "signatory", label: "Authorised signatory", type: "text" },
        ],
        blank: () => ({ id: uid("pty"), role: "", name: "", company: "", address: "", email: "", signatory: "" }),
      },
    ],
  },
  report: {
    kind: "report",
    sections: [
      {
        id: "cover",
        label: "Report cover",
        icon: "clipboard-list",
        columns: 2,
        fields: [
          { key: "title", label: "Report title", type: "text", span: 2, placeholder: "Quarterly Performance Report" },
          { key: "periodStart", label: "Period from", type: "date" },
          { key: "periodEnd", label: "Period to", type: "date" },
          { key: "preparedFor", label: "Prepared for", type: "text" },
          { key: "preparedBy", label: "Prepared by", type: "text" },
          { key: "intro", label: "Executive summary", type: "textarea", rows: 5, span: 2, ai: "reportSummary" },
        ],
      },
      {
        id: "body",
        label: "Analysis & recommendations",
        icon: "chart-no-axes-column",
        columns: 1,
        fields: [
          { key: "about", label: "Methodology", type: "textarea", rows: 4, ai: "reportMethodology" },
          { key: "conclusion", label: "Conclusion & recommendations", type: "textarea", rows: 4, ai: "reportConclusion" },
        ],
      },
    ],
    lists: [
      {
        key: "metrics",
        label: "Key metrics",
        icon: "gauge",
        summarize: (i) => [String(i.value ?? ""), String(i.label ?? "")],
        fields: [
          { key: "value", label: "Value", type: "text", placeholder: "K1.2M" },
          { key: "label", label: "Metric", type: "text", placeholder: "Revenue" },
        ],
        blank: () => ({ id: uid("mtr"), value: "", label: "" }),
      },
      {
        key: "sections",
        label: "Sections",
        icon: "list",
        summarize: (i) => [String(i.heading ?? ""), String(i.body ?? "").slice(0, 60)],
        fields: [
          { key: "heading", label: "Heading", type: "text" },
          { key: "body", label: "Body", type: "textarea", rows: 4, span: 2, ai: "reportSection" },
        ],
        blank: () => ({ id: uid("sec"), heading: "", body: "" }),
        aiAssist: true,
      },
    ],
  },
  "business-card": {
    kind: "business-card",
    sections: [
      {
        id: "identity",
        label: "Card details",
        icon: "id-card",
        columns: 2,
        fields: [
          { key: "fullName", label: "Full name", type: "text", placeholder: "Chanda Mwale" },
          { key: "headline", label: "Job title", type: "text", placeholder: "Managing Director" },
          { key: "companyName", label: "Company", type: "text", placeholder: "Seedwel Ltd" },
          { key: "tagline", label: "Tagline", type: "text", span: 2, placeholder: "Business documents in minutes" },
          { key: "email", label: "Email", type: "email" },
          { key: "phone", label: "Phone", type: "tel" },
          { key: "website", label: "Website", type: "url" },
          { key: "linkedin", label: "LinkedIn", type: "url" },
          { key: "location", label: "Office address", type: "textarea", rows: 2, span: 2 },
        ],
      },
    ],
    lists: [],
  },
};

export const schemaFor = (kind: DocKind): KindSchema => SCHEMAS[kind];

/**
 * Seeds a brand-new document with realistic, editable defaults so no user ever
 * meets an empty canvas — but nothing here is un-editable filler.
 */
export function blankPayload(kind: DocKind): Record<string, unknown> {
  const schema = SCHEMAS[kind];
  const payload: Record<string, unknown> = {};
  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.type === "tags") payload[field.key] = [];
      else if (field.type === "switch") payload[field.key] = false;
      else if (field.type === "money" || field.type === "number") payload[field.key] = 0;
      else payload[field.key] = "";
    }
  }
  for (const list of schema.lists) payload[list.key] = [];
  return payload;
}
