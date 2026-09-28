import type { DocKind, TemplateCategory, TemplateMeta } from "@/lib/types";
import { invoiceTemplates } from "./invoice";
import { quotationTemplates } from "./quotation";
import { receiptTemplates } from "./receipt";
import { cvTemplates } from "./cv";
import { cvStudioTemplates } from "./cv-studio";
import { contractTemplates, companyProfileTemplates, proposalTemplates, reportTemplates } from "./narrative";
import { deliveryNoteTemplates, purchaseOrderTemplates } from "./commercial";
import { businessCardTemplates, certificateTemplates, coverLetterTemplates } from "./personal";

/**
 * Seedwel template library. Original layouts and systematic Studio CV variants
 * share a registry — the single place
 * any surface (gallery, editor, marketing page) reads from.
 */
export const TEMPLATES: Record<DocKind, TemplateMeta[]> = {
  invoice: invoiceTemplates.map((tpl) => ({ ...tpl, kind: "invoice" as DocKind })),
  quotation: quotationTemplates.map((tpl) => ({ ...tpl, kind: "quotation" as DocKind })),
  receipt: receiptTemplates.map((tpl) => ({ ...tpl, kind: "receipt" as DocKind })),
  cv: [...cvTemplates, ...cvStudioTemplates].map((tpl) => ({ ...tpl, kind: "cv" as DocKind })),
  "purchase-order": purchaseOrderTemplates.map((tpl) => ({ ...tpl, kind: "purchase-order" as DocKind })),
  "delivery-note": deliveryNoteTemplates.map((tpl) => ({ ...tpl, kind: "delivery-note" as DocKind })),
  certificate: certificateTemplates.map((tpl) => ({ ...tpl, kind: "certificate" as DocKind })),
  "cover-letter": coverLetterTemplates.map((tpl) => ({ ...tpl, kind: "cover-letter" as DocKind })),
  proposal: proposalTemplates.map((tpl) => ({ ...tpl, kind: "proposal" as DocKind })),
  "company-profile": companyProfileTemplates.map((tpl) => ({ ...tpl, kind: "company-profile" as DocKind })),
  contract: contractTemplates.map((tpl) => ({ ...tpl, kind: "contract" as DocKind })),
  report: reportTemplates.map((tpl) => ({ ...tpl, kind: "report" as DocKind })),
  "business-card": businessCardTemplates.map((tpl) => ({ ...tpl, kind: "business-card" as DocKind })),
};

export const ALL_TEMPLATES: TemplateMeta[] = Object.values(TEMPLATES).flat();

export const templatesFor = (kind: DocKind): TemplateMeta[] => TEMPLATES[kind] ?? [];

export const templateById = (id: string): TemplateMeta | undefined => ALL_TEMPLATES.find((tpl) => tpl.id === id);

export const templateCountByKind = (kind: DocKind): number => templatesFor(kind).length;

export const totalTemplateCount = ALL_TEMPLATES.length;

export const categoryCounts = (kind: DocKind): Record<TemplateCategory, number> => {
  const base: Record<TemplateCategory, number> = { corporate: 0, modern: 0, executive: 0, minimal: 0, creative: 0, academic: 0 };
  for (const tpl of templatesFor(kind)) base[tpl.category] += 1;
  return base;
};

/** Stable default template per module — used when a user creates a document. */
export const defaultTemplateId: Record<DocKind, string> = {
  invoice: "invoice-corporate-01",
  quotation: "quotation-corporate-01",
  receipt: "receipt-corporate-01",
  cv: "cv-corporate-01",
  "purchase-order": "po-corporate-01",
  "delivery-note": "dn-corporate-01",
  certificate: "cert-classic-01",
  "cover-letter": "letter-classic-01",
  proposal: "proposal-corporate-01",
  "company-profile": "profile-corporate-01",
  contract: "contract-formal-01",
  report: "report-corporate-01",
  "business-card": "card-corporate-01",
};

export const isTemplateForKind = (id: string, kind: DocKind): boolean => templatesFor(kind).some((tpl) => tpl.id === id);

export { businessCardTemplates, certificateTemplates, companyProfileTemplates, contractTemplates, coverLetterTemplates, cvTemplates, deliveryNoteTemplates, invoiceTemplates, proposalTemplates, purchaseOrderTemplates, quotationTemplates, receiptTemplates, reportTemplates };
