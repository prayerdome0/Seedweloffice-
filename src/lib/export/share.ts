"use client";

import type { BusinessProfile, DocumentRecord } from "@/lib/types";
import { APP_URL } from "@/lib/config";
import { formatMoney } from "@/lib/utils";
import { computeTotals, docLabels } from "@/lib/documents/compute";
import { copyToClipboard } from "@/lib/utils";
import { docKindMeta } from "@/lib/constants";

/** Sharing, printing and messaging — the "send it to the client" path. */

export const shareUrl = (token: string): string => {
  const origin = typeof window !== "undefined" ? window.location.origin : APP_URL;
  return `${origin}/v/${token}`;
};

export const absoluteDocUrl = (id: string): string => {
  const origin = typeof window !== "undefined" ? window.location.origin : APP_URL;
  return `${origin}/app/documents/${id}`;
};

export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
}

export const buildEmailDraft = (doc: DocumentRecord, business: BusinessProfile | null, link?: string): EmailDraft => {
  const labels = docLabels(doc.kind);
  const meta = docKindMeta(doc.kind);
  const payload = doc.payload ?? {};
  const totals = computeTotals(payload, doc.kind);
  const currency = payload.currency ?? doc.currency;
  const recipient = payload.clientEmail ?? "";
  const subjectLine = payload.subject || doc.title.replace(/\s+/g, " ").trim();

  const greeting = payload.clientName ? `Dear ${payload.clientName},` : `Dear ${payload.clientCompany || "Colleague"},`;

  const summary =
    meta.hasLineItems && payload.items?.length
      ? `${totals.items} item${totals.items === 1 ? "" : "s"} totalling ${formatMoney(totals.total, currency)}, ${payload.paymentMethod ? `payable by ${String(payload.paymentMethod).toLowerCase()}` : "as set out in the document"}.`
      : `Please find ${doc.title} attached for your attention.`;

  const body = [
    greeting,
    "",
    `${summary}`,
    "",
    `${labels.numberLabel}: ${doc.number}`,
    `${labels.dateLabel}: ${doc.issueDate}`,
    doc.dueDate ? `${labels.dueLabel}: ${doc.dueDate}` : "",
    link ? `View it online: ${link}` : "",
    "",
    payload.notes ? String(payload.notes) : "",
    "",
    "Please let us know if anything needs adjusting — we are glad to help.",
    "",
    "Kind regards,",
    business?.signatureName ?? business?.name ?? "",
    business?.signatureRole ?? "",
    [business?.phone, business?.email].filter(Boolean).join(" · "),
  ]
    .filter((line) => line !== null && line !== undefined)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  return { to: recipient, subject: `${doc.number} · ${subjectLine}`, body };
};

export const mailtoHref = (draft: EmailDraft): string => {
  const params = new URLSearchParams();
  if (draft.subject) params.set("subject", draft.subject);
  if (draft.body) params.set("body", draft.body);
  return `mailto:${encodeURIComponent(draft.to)}?${params.toString().replace(/\+/g, "%20")}`;
};

export const whatsappHref = (doc: DocumentRecord, business: BusinessProfile | null, link: string): string => {
  const text = `${docKindMeta(doc.kind).label} ${doc.number} from ${business?.name ?? "us"}: ${link}`;
  const phone = (doc.payload.clientPhone ?? "").replace(/[^\d]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

export const copyShareLink = async (token: string): Promise<boolean> => copyToClipboard(shareUrl(token));

/** Native share sheet where available, clipboard elsewhere. */
export const nativeShare = async (doc: DocumentRecord, business: BusinessProfile | null, token?: string): Promise<"shared" | "copied" | "unsupported"> => {
  const url = token ? shareUrl(token) : absoluteDocUrl(doc.id);
  const text = `${docKindMeta(doc.kind).label} ${doc.number} — ${business?.name ?? ""}`.trim();
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: doc.title, text, url });
      return "shared";
    } catch {
      return "unsupported";
    }
  }
  const ok = await copyToClipboard(url);
  return ok ? "copied" : "unsupported";
};

export const printDocument = (): void => {
  if (typeof window === "undefined") return;
  window.print();
};

/** Embeddable HTML for a stakeholder who wants the document inside their site. */
export const embedSnippet = (token: string): string => {
  const url = shareUrl(token);
  return `<iframe src="${url}?embed=1" style="width:100%;height:900px;border:0" title="Seedwel document" loading="lazy"></iframe>`;
};

export const icsForDocument = (doc: DocumentRecord, business: BusinessProfile | null): string | null => {
  const due = doc.dueDate ?? doc.validUntil;
  if (!due) return null;
  const start = due.replace(/-/g, "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Seedwel Office//EN",
    "BEGIN:VEVENT",
    `UID:${doc.id}@seedweloffice`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `SUMMARY:${docKindMeta(doc.kind).label} ${doc.number} — ${doc.title}`.replace(/,/g, "\\,"),
    `DESCRIPTION:${(doc.payload.subject ?? doc.title).toString().replace(/\n/g, " ").replace(/,/g, "\\,")}`,
    `ORGANIZER;CN=${business?.name ?? "Seedwel Office"}:mailto:${business?.email ?? ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
};
