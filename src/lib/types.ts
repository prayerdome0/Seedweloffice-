/**
 * Seedwel Office — domain types.
 * These interfaces are the single source of truth for both the local
 * (browser) data engine and the Firebase/Firestore backend, so a project can
 * be migrated between them without touching a single component.
 */

export type DocKind =
  | "invoice"
  | "quotation"
  | "receipt"
  | "cv"
  | "proposal"
  | "company-profile"
  | "contract"
  | "purchase-order"
  | "delivery-note"
  | "certificate"
  | "cover-letter"
  | "business-card"
  | "report";

export type DocStatus = "draft" | "sent" | "paid" | "partial" | "overdue" | "accepted" | "declined" | "expired" | "final";

export type TemplateCategory = "corporate" | "modern" | "executive" | "minimal" | "creative" | "academic";

export type FontKey = "inter" | "jakarta" | "playfair" | "lora" | "mono" | "system" | "georgia" | "times";

export type PlanId = "free" | "starter" | "professional" | "business" | "enterprise";

export interface LineItem {
  id: string;
  description: string;
  detail?: string;
  qty: number;
  unit: string;
  rate: number;
  taxRate?: number;
  discount?: number;
}

export interface DesignSettings {
  templateId: string;
  accent: string;
  accentSoft: string;
  fontHeading: FontKey;
  fontBody: FontKey;
  fontScale: number;
  density: "comfortable" | "compact";
  paperSize: "a4" | "letter";
  showLogo: boolean;
  showQr: boolean;
  showSignature: boolean;
  showStamp: boolean;
  showWatermark: boolean;
  watermarkText: string;
  showBankDetails: boolean;
  showSocial: boolean;
  showNotes: boolean;
  logoDataUrl?: string;
  signatureDataUrl?: string;
  stampDataUrl?: string;
  signatureName?: string;
  signatureRole?: string;
  qrValue?: string;
}

export interface DocumentPayload {
  /* shared */
  title?: string;
  subject?: string;
  reference?: string;
  notes?: string;
  terms?: string;
  /* parties */
  clientName?: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientTaxId?: string;
  /* commercial */
  items?: LineItem[];
  currency?: string;
  discountValue?: number;
  discountType?: "percent" | "fixed";
  taxLabel?: string;
  taxRate?: number;
  shipping?: number;
  amountPaid?: number;
  paymentMethod?: string;
  paymentReference?: string;
  receivedFrom?: string;
  poNumber?: string;
  /* logistics */
  deliveryAddress?: string;
  deliveryDate?: string;
  driverName?: string;
  vehicleNumber?: string;
  receivedBy?: string;
  /* CV / cover letter */
  fullName?: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  summary?: string;
  cvPhotoDataUrl?: string;
  cvSignatureDataUrl?: string;
  cvSections?: { id: string; title: string; content: string }[];
  cvSectionOrder?: string[];
  skills?: string[];
  languages?: string[];
  certifications?: CertificationItem[];
  interests?: string[];
  experience?: ExperienceItem[];
  education?: EducationItem[];
  projects?: ProjectItem[];
  referee?: string;
  refereeTitle?: string;
  refereeContact?: string;
  /* narrative documents */
  intro?: string;
  problem?: string;
  approach?: string;
  scope?: string[];
  deliverables?: string[];
  timeline?: TimelineItem[];
  whyUs?: string;
  conclusion?: string;
  about?: string;
  mission?: string;
  vision?: string;
  values?: string[];
  services?: ServiceItem[];
  stats?: StatItem[];
  team?: TeamItem[];
  parties?: PartyItem[];
  clauses?: ClauseItem[];
  sections?: SectionItem[];
  recipientName?: string;
  recipientTitle?: string;
  companyName?: string;
  companyAddress?: string;
  position?: string;
  opening?: string;
  bodyParagraphs?: string[];
  closing?: string;
  /* certificate */
  recipient?: string;
  award?: string;
  ceremonyDate?: string;
  serial?: string;
  description?: string;
  signatories?: string[];
  /* business card */
  tagline?: string;
  cardStyle?: string;
  /* report */
  periodStart?: string;
  periodEnd?: string;
  preparedFor?: string;
  preparedBy?: string;
  metrics?: StatItem[];
  /* meta */
  [key: string]: unknown;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location?: string;
  start: string;
  end: string;
  current?: boolean;
  highlights?: string[];
}

export interface EducationItem {
  id: string;
  qualification: string;
  institution: string;
  location?: string;
  start?: string;
  end: string;
  grade?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  role?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role?: string;
  description: string;
  link?: string;
}

export interface TimelineItem {
  id: string;
  phase: string;
  duration: string;
  details?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
}

export interface TeamItem {
  id: string;
  name: string;
  role: string;
  contact?: string;
}

export interface PartyItem {
  id: string;
  role: string;
  name: string;
  company?: string;
  address?: string;
  email?: string;
  signatory?: string;
}

export interface ClauseItem {
  id: string;
  heading: string;
  body: string;
}

export interface SectionItem {
  id: string;
  heading: string;
  body: string;
}

export interface DocumentRecord {
  id: string;
  ownerId: string;
  kind: DocKind;
  number: string;
  title: string;
  status: DocStatus;
  businessId: string | null;
  currency: string;
  issueDate: string;
  dueDate?: string;
  validUntil?: string;
  clientName?: string;
  total?: number;
  tags: string[];
  starred: boolean;
  archived: boolean;
  design: DesignSettings;
  payload: DocumentPayload;
  shareToken?: string;
  aiGenerated?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BusinessProfile {
  id: string;
  ownerId: string;
  name: string;
  legalName?: string;
  tagline?: string;
  industry?: string;
  registrationNumber?: string;
  taxId?: string;
  taxLabel?: string;
  email: string;
  phone: string;
  altPhone?: string;
  website?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
  logoDataUrl?: string;
  stampDataUrl?: string;
  signatureDataUrl?: string;
  signatureName?: string;
  signatureRole?: string;
  primaryColor: string;
  accentColor: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  bankSwift?: string;
  mobileMoney?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
  whatsapp?: string;
  currency: string;
  invoicePrefix: string;
  taxRate: number;
  paymentTerms: number;
  footerNote?: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AppUser {
  role?: "admin" | "user";
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  jobTitle?: string;
  country?: string;
  timezone: string;
  language: string;
  emailVerified: boolean;
  provider: "password" | "google" | "demo";
  createdAt: number;
  lastLoginAt?: number;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  accent: string;
  density: "comfortable" | "compact";
  language: string;
  dateFormat: string;
  currency: string;
  numberFormat: "comma" | "space" | "none";
  emailUpdates: boolean;
  productNews: boolean;
  invoiceReminders: boolean;
  paymentAlerts: boolean;
  weeklyDigest: boolean;
  twoFactor: boolean;
  sessionAlerts: boolean;
  autoSave: boolean;
  defaultTemplate: Partial<Record<DocKind, string>>;
  onboardingDone: boolean;
  /** Assistant credits consumed so far — persisted with the rest of settings. */
  aiUsed?: number;
  /** Extra preferences stored for forward compatibility with newer releases. */
  [key: string]: unknown;
}

export interface Subscription {
  id: string;
  ownerId: string;
  plan: PlanId;
  status: "trialing" | "active" | "past_due" | "canceled";
  seats: number;
  interval: "monthly" | "yearly";
  startedAt: number;
  renewsAt: number;
  trialEndsAt?: number;
  amount: number;
  currency: string;
  paymentMethod?: { brand: string; last4: string; expiry: string };
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  currency: string;
  documents: number | "unlimited";
  seats: number;
  storageGb: number;
  aiCredits: number;
  features: string[];
  highlight?: boolean;
}

export interface InvoiceRecord {
  id: string;
  ownerId: string;
  number: string;
  date: number;
  amount: number;
  currency: string;
  status: "paid" | "open" | "void";
  plan: string;
  period: string;
}

export type ActivityAction =
  | "document.created"
  | "document.updated"
  | "document.exported"
  | "document.shared"
  | "document.deleted"
  | "document.duplicated"
  | "document.status"
  | "ai.generated"
  | "template.applied"
  | "business.created"
  | "business.updated"
  | "auth.signin"
  | "auth.signout"
  | "auth.signup"
  | "auth.reset"
  | "settings.updated"
  | "subscription.updated";

export interface ActivityLog {
  id: string;
  ownerId: string;
  action: ActivityAction;
  entityId?: string;
  entityName?: string;
  detail?: string;
  meta?: Record<string, unknown>;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  ownerId: string;
  title: string;
  body: string;
  tone: "info" | "success" | "warning" | "danger";
  href?: string;
  read: boolean;
  createdAt: number;
}

export interface TemplateMeta {
  id: string;
  kind: DocKind;
  name: string;
  category: TemplateCategory;
  description: string;
  tags: string[];
  premium?: boolean;
  render: (ctx: TemplateContext) => React.ReactNode;
}

/** Everything a template needs to draw a document. */
export interface TemplateContext {
  doc: DocumentRecord;
  payload: DocumentPayload;
  business: BusinessProfile | null;
  design: DesignSettings;
  totals: DocTotals;
  qr?: string;
  labels: DocLabels;
  preview?: boolean;
}

export interface DocTotals {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  shipping: number;
  total: number;
  paid: number;
  balance: number;
  items: number;
  quantity: number;
}

export interface DocLabels {
  title: string;
  numberLabel: string;
  dateLabel: string;
  dueLabel: string;
  validLabel: string;
  billTo: string;
  from: string;
  itemsHeading: string;
  description: string;
  qty: string;
  unit: string;
  rate: string;
  amount: string;
  subtotal: string;
  discount: string;
  tax: string;
  shipping: string;
  total: string;
  paid: string;
  balance: string;
  notes: string;
  terms: string;
  bank: string;
  signature: string;
  authorized: string;
  thankYou: string;
  qrHint: string;
}

export interface ExportOptions {
  fileName: string;
  paperSize: "a4" | "letter";
}
