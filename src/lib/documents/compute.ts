import { DOC_KINDS, docKindMeta, planById } from "../constants";
import type {
  BusinessProfile,
  DesignSettings,
  DocKind,
  DocLabels,
  DocumentPayload,
  DocumentRecord,
  DocTotals,
  LineItem,
} from "../types";
import { addDaysISO, todayISO, uid } from "../utils";

/* ── Totals ──────────────────────────────────────────────────────────────── */
export function computeTotals(payload: DocumentPayload, kind: DocKind): DocTotals {
  const meta = docKindMeta(kind);
  const items: LineItem[] = meta.hasLineItems ? payload.items ?? [] : [];
  const subtotal = items.reduce((acc, item) => acc + (item.qty || 0) * (item.rate || 0), 0);

  const discountType = payload.discountType ?? "percent";
  const discountValue = payload.discountValue ?? 0;
  const discount = discountType === "percent" ? (subtotal * discountValue) / 100 : Math.min(discountValue, subtotal);

  const taxable = Math.max(0, subtotal - discount);
  const rate = payload.taxRate ?? 0;
  const tax = (taxable * rate) / 100;
  const shipping = payload.shipping ?? 0;
  const total = taxable + tax + shipping;
  const paid = payload.amountPaid ?? 0;

  const itemTax = items.reduce((acc, item) => acc + ((item.qty || 0) * (item.rate || 0) * (item.taxRate ?? 0)) / 100, 0);
  const effectiveTax = itemTax > 0 && rate === 0 ? itemTax : tax;

  return {
    subtotal: round2(subtotal),
    discount: round2(discount),
    taxable: round2(taxable),
    tax: round2(effectiveTax),
    shipping: round2(shipping),
    total: round2(taxable + effectiveTax + shipping),
    paid: round2(paid),
    balance: round2(taxable + effectiveTax + shipping - paid),
    items: items.length,
    quantity: items.reduce((acc, item) => acc + (item.qty || 0), 0),
  };
}

export const round2 = (n: number): number => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;

/* ── Copy labels per module ──────────────────────────────────────────────── */
export function docLabels(kind: DocKind, payload: DocumentPayload = {}): DocLabels {
  const base: DocLabels = {
    title: payload.title || docKindMeta(kind).label.toUpperCase(),
    numberLabel: "Number",
    dateLabel: "Issue date",
    dueLabel: "Due date",
    validLabel: "Valid until",
    billTo: "Billed to",
    from: "From",
    itemsHeading: "Description",
    description: "Description",
    qty: "Qty",
    unit: "Unit",
    rate: "Rate",
    amount: "Amount",
    subtotal: "Subtotal",
    discount: "Discount",
    tax: payload.taxLabel || "Tax",
    shipping: "Shipping",
    total: "Total",
    paid: "Amount paid",
    balance: "Balance due",
    notes: "Notes",
    terms: "Terms & conditions",
    bank: "Payment details",
    signature: "Signature",
    authorized: "Authorised signatory",
    thankYou: "Thank you for your business.",
    qrHint: "Scan to verify this document",
  };

  switch (kind) {
    case "invoice":
      return { ...base, title: payload.title || "TAX INVOICE", total: "Total due", notes: "Notes", thankYou: "Thank you for your business." };
    case "quotation":
      return {
        ...base,
        title: payload.title || "QUOTATION",
        billTo: "Prepared for",
        dueLabel: "Valid until",
        total: "Quoted total",
        balance: "Total",
        thankYou: "We look forward to working with you.",
        notes: "Notes & inclusions",
      };
    case "receipt":
      return {
        ...base,
        title: payload.title || "OFFICIAL RECEIPT",
        billTo: "Received from",
        itemsHeading: "Payment for",
        qty: "Qty",
        rate: "Rate",
        total: "Amount received",
        paid: "Amount received",
        balance: "Balance",
        terms: "Conditions",
        thankYou: "Payment received with thanks.",
        notes: "Notes",
      };
    case "purchase-order":
      return {
        ...base,
        title: payload.title || "PURCHASE ORDER",
        billTo: "Supplier",
        dateLabel: "Order date",
        itemsHeading: "Item",
        total: "Order total",
        terms: "Supply terms",
        thankYou: "Please confirm receipt of this order.",
      };
    case "delivery-note":
      return {
        ...base,
        title: payload.title || "DELIVERY NOTE",
        billTo: "Deliver to",
        itemsHeading: "Item delivered",
        qty: "Qty",
        rate: "Unit price",
        amount: "Value",
        total: "Total value",
        paid: "Delivered",
        balance: "Outstanding",
        terms: "Handling instructions",
        thankYou: "Goods received in good order unless noted above.",
      };
    case "contract":
      return {
        ...base,
        title: payload.title || "SERVICE AGREEMENT",
        billTo: "Counterparty",
        itemsHeading: "Fee schedule",
        total: "Contract value",
        terms: "Term & termination",
        thankYou: "Executed as an agreement between the parties.",
      };
    case "proposal":
      return {
        ...base,
        title: payload.title || "BUSINESS PROPOSAL",
        billTo: "Prepared for",
        itemsHeading: "Investment breakdown",
        total: "Total investment",
        paid: "Paid to date",
        balance: "Balance",
        terms: "Commercial terms",
        thankYou: "We would be delighted to partner with you.",
      };
    default:
      return base;
  }
}

/* ── Numbering ───────────────────────────────────────────────────────────── */
export function nextDocNumber(existing: DocumentRecord[], kind: DocKind, prefix?: string): string {
  const meta = docKindMeta(kind);
  const head = (prefix && prefix.trim()) || meta.prefixes;
  const year = new Date().getFullYear();
  const scoped = existing.filter((d) => d.kind === kind);
  let sequence = 1;
  for (const doc of scoped) {
    const match = /(\d+)\s*$/.exec(doc.number ?? "");
    if (match) sequence = Math.max(sequence, Number(match[1]) + 1);
  }
  return `${head}-${year}-${String(sequence).padStart(3, "0")}`;
}

/* ── Status ──────────────────────────────────────────────────────────────── */
export function deriveStatus(doc: DocumentRecord): DocumentRecord["status"] {
  if (doc.status === "draft" || doc.status === "declined" || doc.status === "accepted" || doc.status === "final") return doc.status;
  if (doc.kind === "invoice" && doc.dueDate) {
    const totals = computeTotals(doc.payload, doc.kind);
    const today = todayISO();
    if (totals.paid > 0 && totals.balance > 0.01) return "partial";
    if (totals.balance <= 0.01 && totals.total > 0) return "paid";
    if (doc.dueDate < today && totals.balance > 0.01) return "overdue";
  }
  if (doc.kind === "quotation" && doc.validUntil && doc.validUntil < todayISO() && doc.status === "sent") return "expired";
  return doc.status;
}

/* ── Defaults ────────────────────────────────────────────────────────────── */
export function defaultDesign(business?: BusinessProfile | null, templateId = "invoice-corporate-01"): DesignSettings {
  const accent = business?.primaryColor ?? "#0e908f";
  return {
    templateId,
    accent,
    accentSoft: accent,
    fontHeading: "jakarta",
    fontBody: "inter",
    fontScale: 1,
    density: "comfortable",
    paperSize: "a4",
    showLogo: true,
    showQr: true,
    showSignature: true,
    showStamp: false,
    showWatermark: false,
    watermarkText: "DRAFT",
    showBankDetails: true,
    showSocial: true,
    showNotes: true,
    logoDataUrl: business?.logoDataUrl,
    signatureDataUrl: business?.signatureDataUrl,
    stampDataUrl: business?.stampDataUrl,
    signatureName: business?.signatureName ?? "",
    signatureRole: business?.signatureRole ?? "",
    qrValue: "",
  };
}

export function blankLineItem(unit = "unit"): LineItem {
  return { id: uid("itm"), description: "", detail: "", qty: 1, unit, rate: 0, taxRate: 0, discount: 0 };
}

export function createDraft(kind: DocKind, opts: {
  ownerId: string;
  business?: BusinessProfile | null;
  existing?: DocumentRecord[];
  templateId: string;
  payload: DocumentPayload;
  dueInDays?: number;
  validInDays?: number;
}): DocumentRecord {
  const { ownerId, business, existing = [], templateId, payload } = opts;
  const meta = docKindMeta(kind);
  const design = defaultDesign(business, templateId);
  const now = Date.now();
  const items = meta.hasLineItems ? payload.items ?? [] : [];
  return {
    id: uid("doc"),
    ownerId,
    kind,
    number: nextDocNumber(existing, kind, business?.invoicePrefix),
    title: payload.title || meta.label,
    status: "draft",
    businessId: business?.id ?? null,
    currency: business?.currency ?? "USD",
    issueDate: todayISO(),
    dueDate: meta.needsDueDate ? addDaysISO(opts.dueInDays ?? business?.paymentTerms ?? 30) : undefined,
    validUntil: kind === "quotation" ? addDaysISO(opts.validInDays ?? 14) : undefined,
    clientName: payload.clientName || payload.clientCompany || payload.fullName || payload.recipient || "",
    tags: [],
    starred: false,
    archived: false,
    design,
    payload: { ...payload, items, currency: business?.currency ?? "USD", taxLabel: business?.taxLabel ?? "VAT", taxRate: payload.taxRate ?? business?.taxRate ?? 0 },
    createdAt: now,
    updatedAt: now,
  };
}

/* ── Plan usage ──────────────────────────────────────────────────────────── */
export interface UsageSnapshot {
  documentsThisMonth: number;
  documentLimit: number | "unlimited";
  storageUsed: number;
  storageLimit: number;
  aiCreditsUsed: number;
  aiCreditLimit: number;
  seats: number;
}

export function usageSnapshot(docs: DocumentRecord[], planId: string, storageUsed: number, aiUsed: number): UsageSnapshot {
  const plan = planById(planId);
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const documentsThisMonth = docs.filter((d) => d.createdAt >= start.getTime()).length;
  return {
    documentsThisMonth,
    documentLimit: plan.documents,
    storageUsed,
    storageLimit: plan.storageGb * 1024 * 1024 * 1024,
    aiCreditsUsed: aiUsed,
    aiCreditLimit: plan.aiCredits,
    seats: plan.seats,
  };
}

export function usageRatio(used: number, limit: number | "unlimited"): number {
  if (limit === "unlimited") return 0;
  if (!limit) return 0;
  return Math.min(1, used / limit);
}

/* ── Search / filter helpers ─────────────────────────────────────────────── */
export function documentSearchText(doc: DocumentRecord): string {
  const payload = doc.payload ?? {};
  const parts = [
    doc.number,
    doc.title,
    doc.clientName,
    doc.kind,
    doc.status,
    ...(doc.tags ?? []),
    String(payload.clientCompany ?? ""),
    String(payload.subject ?? ""),
    String(payload.reference ?? ""),
    String(payload.fullName ?? ""),
    String(payload.headline ?? ""),
    String(payload.award ?? ""),
    ...(payload.items ?? []).map((i) => i.description),
    ...(payload.experience ?? []).map((e) => `${e.role} ${e.company}`),
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
}

export const ALL_KINDS = DOC_KINDS.map((k) => k.kind);
