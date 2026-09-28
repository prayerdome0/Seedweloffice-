"use client";

import {
  AlignmentType, BorderStyle, Document, HeadingLevel, Packer, Paragraph, ShadingType, Table, TableCell, TableRow,
  TextRun, WidthType, convertInchesToTwip,
} from "docx";
import type { BusinessProfile, DocumentRecord, ExperienceItem, LineItem } from "@/lib/types";
import { docKindMeta } from "@/lib/constants";
import { formatDate, formatMoney, amountInWords } from "@/lib/utils";
import { computeTotals, docLabels } from "@/lib/documents/compute";
import { downloadBlob } from "@/lib/utils";

/**
 * Word (.docx) export.
 *
 * Word cannot reproduce the designed templates pixel-for-pixel, so this is an
 * honest, fully structured re-creation: real headings, real tables and real
 * paragraphs that a client can edit, red-line and return. The PDF export is
 * the fidelity-accurate one.
 */

const ACCENT = "0E908F";
const INK = "0F1C33";
const MUTED = "5B6B86";

const run = (text: string, opts: { bold?: boolean; italics?: boolean; size?: number; color?: string; caps?: boolean } = {}) =>
  new TextRun({
    text,
    bold: opts.bold,
    italics: opts.italics,
    size: (opts.size ?? 11) * 2,
    color: opts.color ?? "1F2937",
    allCaps: opts.caps,
    font: "Calibri",
  });

const para = (text: string, opts: { bold?: boolean; size?: number; color?: string; spaceAfter?: number; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; italics?: boolean; caps?: boolean } = {}) =>
  new Paragraph({
    alignment: opts.align,
    spacing: { after: opts.spaceAfter ?? 120, line: 300 },
    children: [run(text, opts)],
  });

const heading = (text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_2) =>
  new Paragraph({
    heading: level,
    spacing: { before: 280, after: 120 },
    children: [run(text, { bold: true, size: level === HeadingLevel.HEADING_1 ? 20 : 13, color: INK })],
  });

const rule = () =>
  new Paragraph({
    spacing: { before: 60, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "D8E0EC" } },
    children: [run("")],
  });

const cell = (text: string, opts: { bold?: boolean; width?: number; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; shade?: string; color?: string } = {}) =>
  new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shade ? { type: ShadingType.CLEAR, color: "auto", fill: opts.shade } : undefined,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: [
      new Paragraph({
        alignment: opts.align,
        children: [run(text, { bold: opts.bold, size: 10, color: opts.color ?? (opts.bold ? INK : "1F2937") })],
      }),
    ],
  });

const labelCell = (text: string, width?: number) => cell(text, { bold: true, shade: "F1F5F9", width, color: MUTED });

const itemsTable = (items: LineItem[], currency: string, showTax: boolean): Table => {
  const header = new TableRow({
    tableHeader: true,
    children: [
      cell("Description", { bold: true, width: showTax ? 46 : 52, shade: ACCENT, color: "FFFFFF" }),
      cell("Qty", { bold: true, width: 10, align: AlignmentType.RIGHT, shade: ACCENT, color: "FFFFFF" }),
      cell("Unit", { bold: true, width: 14, align: AlignmentType.RIGHT, shade: ACCENT, color: "FFFFFF" }),
      cell("Rate", { bold: true, width: 15, align: AlignmentType.RIGHT, shade: ACCENT, color: "FFFFFF" }),
      ...(showTax ? [cell("Tax", { bold: true, width: 9, align: AlignmentType.RIGHT, shade: ACCENT, color: "FFFFFF" })] : []),
      cell("Amount", { bold: true, width: 14, align: AlignmentType.RIGHT, shade: ACCENT, color: "FFFFFF" }),
    ],
  });

  const rows = items.map((item) => {
    const amount = item.qty * item.rate;
    const description = [item.description, item.detail].filter(Boolean).join(" — ");
    return new TableRow({
      children: [
        cell(description, { width: showTax ? 46 : 52 }),
        cell(String(item.qty), { width: 10, align: AlignmentType.RIGHT }),
        cell(item.unit || "unit", { width: 14, align: AlignmentType.RIGHT }),
        cell(formatMoney(item.rate, currency), { width: 15, align: AlignmentType.RIGHT }),
        ...(showTax ? [cell(`${item.taxRate ?? 0}%`, { width: 9, align: AlignmentType.RIGHT })] : []),
        cell(formatMoney(amount, currency), { width: 14, align: AlignmentType.RIGHT, bold: true }),
      ],
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [header, ...rows],
  });
};

const totalsTable = (doc: DocumentRecord): Table => {
  const totals = computeTotals(doc.payload ?? {}, doc.kind);
  const currency = doc.payload?.currency ?? doc.currency;
  const rows: TableRow[] = [
    new TableRow({ children: [labelCell("Subtotal", 55), cell(formatMoney(totals.subtotal, currency), { align: AlignmentType.RIGHT, width: 45 })] }),
  ];
  if (totals.discount > 0) rows.push(new TableRow({ children: [labelCell("Discount", 55), cell(`- ${formatMoney(totals.discount, currency)}`, { align: AlignmentType.RIGHT, width: 45 })] }));
  if (totals.tax > 0) rows.push(new TableRow({ children: [labelCell(`${doc.payload?.taxLabel ?? "VAT"} ${doc.payload?.taxRate ?? 0}%`, 55), cell(formatMoney(totals.tax, currency), { align: AlignmentType.RIGHT, width: 45 })] }));
  if (totals.shipping > 0) rows.push(new TableRow({ children: [labelCell("Shipping / handling", 55), cell(formatMoney(totals.shipping, currency), { align: AlignmentType.RIGHT, width: 45 })] }));
  rows.push(new TableRow({ children: [labelCell("Total", 55), cell(formatMoney(totals.total, currency), { align: AlignmentType.RIGHT, width: 45, bold: true })] }));
  if (totals.paid > 0) {
    rows.push(new TableRow({ children: [labelCell("Amount paid", 55), cell(formatMoney(totals.paid, currency), { align: AlignmentType.RIGHT, width: 45 })] }));
    rows.push(new TableRow({ children: [labelCell("Balance due", 55), cell(formatMoney(totals.balance, currency), { align: AlignmentType.RIGHT, width: 45, bold: true })] }));
  }
  return new Table({ width: { size: 62, type: WidthType.PERCENTAGE }, alignment: AlignmentType.RIGHT, rows });
};

const listParagraphs = (headingText: string, values: string[]): Paragraph[] => {
  if (!values?.length) return [];
  return [heading(headingText), ...values.map((value) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 80 }, children: [run(value, { size: 10.5 })] }))];
};

const experienceBlocks = (items: ExperienceItem[]): Paragraph[] => {
  const out: Paragraph[] = [];
  for (const item of items) {
    out.push(
      new Paragraph({
        spacing: { before: 140, after: 40 },
        children: [run(`${item.role}`, { bold: true, size: 11.5, color: INK }), run(item.company ? ` · ${item.company}` : "", { size: 11, color: MUTED })],
      }),
    );
    out.push(para(`${item.start} — ${item.current ? "Present" : item.end}${item.location ? ` · ${item.location}` : ""}`, { size: 9.5, color: MUTED, spaceAfter: 60 }));
    for (const highlight of item.highlights ?? []) {
      out.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [run(highlight, { size: 10.5 })] }));
    }
  }
  return out;
};

export const buildDocumentDocx = async (doc: DocumentRecord, business: BusinessProfile | null): Promise<Blob> => {
  const labels = docLabels(doc.kind);
  const payload = doc.payload ?? {};
  const meta = docKindMeta(doc.kind);
  const children: (Paragraph | Table)[] = [];

  /* Letterhead ------------------------------------------------------------ */
  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [run(business?.name ?? "Your business", { bold: true, size: 20, color: INK })],
    }),
  );
  if (business?.tagline) children.push(para(business.tagline, { size: 10, color: MUTED, spaceAfter: 60 }));
  const contact = [business?.addressLine1, business?.city, business?.phone, business?.email, business?.website].filter(Boolean).join(" · ");
  if (contact) children.push(para(contact, { size: 9, color: MUTED, spaceAfter: 60 }));
  if (business?.taxId) children.push(para(`${business.taxLabel ?? "Tax"}: ${business.taxId}`, { size: 9, color: MUTED, spaceAfter: 60 }));
  children.push(rule());

  /* Title ----------------------------------------------------------------- */
  children.push(new Paragraph({ spacing: { after: 60 }, children: [run((payload.title ?? labels.title).toUpperCase(), { bold: true, size: 20, color: INK, caps: true })] }));
  children.push(para(`${labels.numberLabel}: ${doc.number}`, { size: 10.5, color: INK }));
  children.push(para(`${labels.dateLabel}: ${formatDate(doc.issueDate, "dd MMMM yyyy")}`, { size: 10.5, color: MUTED }));
  if (doc.dueDate) children.push(para(`${labels.dueLabel}: ${formatDate(doc.dueDate, "dd MMMM yyyy")}`, { size: 10.5, color: MUTED }));
  if (doc.validUntil) children.push(para(`${labels.validLabel}: ${formatDate(doc.validUntil, "dd MMMM yyyy")}`, { size: 10.5, color: MUTED }));

  /* Parties --------------------------------------------------------------- */
  const partyRows: TableRow[] = [];
  const party = (label: string, name?: string, lines: (string | undefined)[] = []) => {
    const body = [name, ...lines].filter(Boolean).join("\n");
    partyRows.push(new TableRow({ children: [labelCell(label, 30), cell(body || "—", { width: 70 })] }));
  };
  if (meta.hasClients) {
    party(labels.billTo, payload.clientCompany || payload.clientName, [payload.clientAddress, payload.clientEmail, payload.clientPhone]);
  }
  if (meta.kind === "cover-letter" || meta.kind === "cv") {
    party("Candidate", payload.fullName, [payload.headline, payload.email, payload.phone, payload.location]);
  }
  if (meta.kind === "certificate") {
    party("Recipient", payload.recipient, [payload.award, payload.serial]);
  }
  if (partyRows.length) children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: partyRows }));

  /* Narrative ------------------------------------------------------------- */
  const narrative: [string, string | undefined][] = [
    ["Subject", payload.subject],
    ["Executive summary", payload.intro],
    ["The challenge", payload.problem],
    ["Our approach", payload.approach],
    ["Overview", payload.about],
    ["Mission", payload.mission],
    ["Vision", payload.vision],
    ["Why us", payload.whyUs],
    ["Summary", payload.summary],
  ];
  for (const [title, body] of narrative) {
    if (typeof body === "string" && body.trim()) {
      children.push(heading(title));
      for (const block of body.split(/\n{2,}/)) children.push(para(block, { spaceAfter: 140 }));
    }
  }

  /* Item table ------------------------------------------------------------ */
  if (meta.hasLineItems && payload.items?.length) {
    children.push(heading(labels.itemsHeading));
    children.push(itemsTable(payload.items, payload.currency ?? doc.currency, true));
    children.push(rule());
    children.push(totalsTable(doc));
    children.push(para(`Amount in words: ${amountInWords(computeTotals(payload, doc.kind).total, payload.currency ?? doc.currency)}`, { size: 9.5, color: MUTED }));
  }

  /* Kind-specific lists --------------------------------------------------- */
  children.push(...listParagraphs("Scope of work", (payload.scope as string[] | undefined) ?? []));
  children.push(...listParagraphs("Deliverables", (payload.deliverables as string[] | undefined) ?? []));
  children.push(...listParagraphs("Core values", (payload.values as string[] | undefined) ?? []));
  children.push(...listParagraphs("Skills", payload.skills ?? []));
  children.push(...listParagraphs("Languages", payload.languages ?? []));
  children.push(...listParagraphs("Accreditations", (payload.accreditations as string[] | undefined) ?? []));

  if (payload.experience?.length) {
    children.push(heading("Experience"));
    children.push(...experienceBlocks(payload.experience));
  }
  if (payload.education?.length) {
    children.push(heading("Education"));
    for (const item of payload.education) {
      children.push(para(`${item.qualification} — ${item.institution}${item.end ? ` (${item.end})` : ""}${item.grade ? ` · ${item.grade}` : ""}`, { size: 10.5, spaceAfter: 80 }));
    }
  }
  if (payload.certifications?.length) {
    children.push(heading("Certifications"));
    for (const cert of payload.certifications) children.push(para(`${cert.name}${cert.role ? ` — ${cert.role}` : ""}`, { size: 10.5, spaceAfter: 80 }));
  }
  if (payload.projects?.length) {
    children.push(heading("Projects"));
    for (const project of payload.projects) {
      children.push(para(`${project.name}${project.role ? ` · ${project.role}` : ""}`, { bold: true, size: 10.5, spaceAfter: 40, color: INK }));
      children.push(para(project.description, { size: 10.5, spaceAfter: 100 }));
    }
  }
  if (payload.metrics?.length) {
    children.push(heading("Key figures"));
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: payload.metrics.map((m) => labelCell(m.label, Math.floor(100 / (payload.metrics?.length || 1)))) })],
      }),
    );
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: payload.metrics.map((m) => cell(m.value, { bold: true, align: AlignmentType.CENTER, width: Math.floor(100 / (payload.metrics?.length || 1)) })) })],
      }),
    );
  }
  if (payload.sections?.length) {
    for (const section of payload.sections) {
      children.push(heading(section.heading));
      children.push(para(section.body, { spaceAfter: 140 }));
    }
  }
  if (payload.timeline?.length) {
    children.push(heading("Timeline"));
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [labelCell("Phase", 26), labelCell("Duration", 18), labelCell("Details", 56)] }),
          ...payload.timeline.map(
            (phase) => new TableRow({ children: [cell(phase.phase, { width: 26 }), cell(phase.duration, { width: 18 }), cell(phase.details ?? "", { width: 56 })] }),
          ),
        ],
      }),
    );
  }
  if (payload.clauses?.length) {
    children.push(heading("Clauses"));
    payload.clauses.forEach((clause, index) => {
      children.push(para(`${index + 1}. ${clause.heading}`, { bold: true, size: 11, color: INK, spaceAfter: 60 }));
      children.push(para(clause.body, { size: 10.5, spaceAfter: 140 }));
    });
  }
  if (payload.parties?.length) {
    children.push(heading("Parties"));
    for (const item of payload.parties) {
      children.push(para(`${item.role}: ${item.name}${item.address ? ` — ${item.address.replace(/\n/g, ", ")}` : ""}`, { size: 10.5, spaceAfter: 80 }));
    }
  }
  if (payload.services?.length) {
    children.push(heading("Services"));
    for (const service of payload.services) children.push(para(`${service.name} — ${service.description}`, { size: 10.5, spaceAfter: 80 }));
  }
  if (payload.team?.length) {
    children.push(heading("Team"));
    for (const member of payload.team) children.push(para(`${member.name} — ${member.role}${member.contact ? ` · ${member.contact}` : ""}`, { size: 10.5, spaceAfter: 80 }));
  }
  if (payload.bodyParagraphs?.length) {
    for (const block of payload.bodyParagraphs) children.push(para(block, { spaceAfter: 140 }));
  }

  /* Notes, terms, signature ---------------------------------------------- */
  if (payload.notes) {
    children.push(heading("Notes"));
    children.push(para(payload.notes, { size: 10.5, spaceAfter: 140 }));
  }
  if (payload.terms) {
    children.push(heading("Terms"));
    children.push(para(payload.terms, { size: 10, color: MUTED, spaceAfter: 140 }));
  }
  if (business && (business.bankName || business.bankAccountNumber)) {
    children.push(heading("Payment details"));
    const rows = [
      ["Bank", business.bankName],
      ["Account name", business.bankAccountName ?? business.name],
      ["Account number", business.bankAccountNumber],
      ["Branch", business.bankBranch],
      ["SWIFT", business.bankSwift],
      ["Mobile money", business.mobileMoney],
    ].filter(([, value]) => Boolean(value)) as [string, string][];
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: rows.map(([key, value]) => new TableRow({ children: [labelCell(key, 32), cell(value, { width: 68 })] })),
      }),
    );
  }

  children.push(rule());
  children.push(para(business?.signatureName ?? "", { bold: true, size: 10.5, color: INK, spaceAfter: 20 }));
  if (business?.signatureRole) children.push(para(business.signatureRole, { size: 9.5, color: MUTED }));
  children.push(para(business?.footerNote ?? `${business?.name ?? ""} · ${business?.phone ?? ""} · ${business?.email ?? ""}`, { size: 9, color: MUTED }));

  const wordDocument = new Document({
    creator: business?.name ?? "Seedwel Office",
    title: `${doc.title} (${doc.number})`,
    description: `${meta.label} ${doc.number}`,
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
        heading1: { run: { font: "Calibri", size: 40, bold: true, color: INK } },
        heading2: { run: { font: "Calibri", size: 26, bold: true, color: INK } },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: { top: convertInchesToTwip(0.7), bottom: convertInchesToTwip(0.7), left: convertInchesToTwip(0.75), right: convertInchesToTwip(0.75) } },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(wordDocument);
};

export const exportDocumentDocx = async (doc: DocumentRecord, business: BusinessProfile | null, filename: string): Promise<void> => {
  const blob = await buildDocumentDocx(doc, business);
  downloadBlob(blob, filename);
};

export const plainTextExport = (doc: DocumentRecord, business: BusinessProfile | null): string => {
  const labels = docLabels(doc.kind);
  const payload = doc.payload ?? {};
  const totals = computeTotals(payload, doc.kind);
  const currency = payload.currency ?? doc.currency;
  const lines = [
    (business?.name ?? "").toUpperCase(),
    business ? [business.addressLine1, business.city, business.phone, business.email].filter(Boolean).join(" · ") : "",
    "",
    `${(payload.title ?? labels.title).toUpperCase()} ${doc.number}`,
    `${labels.dateLabel}: ${formatDate(doc.issueDate, "dd MMM yyyy")}`,
    doc.dueDate ? `${labels.dueLabel}: ${formatDate(doc.dueDate, "dd MMM yyyy")}` : "",
    "",
    payload.clientCompany || payload.clientName ? `To: ${[payload.clientCompany, payload.clientName].filter(Boolean).join(" — ")}` : "",
    payload.clientAddress ?? "",
    "",
    ...(payload.items ?? []).map((item) => `${item.qty} × ${item.unit} — ${item.description} @ ${formatMoney(item.rate, currency)} = ${formatMoney(item.qty * item.rate, currency)}`),
    "",
    `Subtotal: ${formatMoney(totals.subtotal, currency)}`,
    totals.tax ? `${payload.taxLabel ?? "Tax"}: ${formatMoney(totals.tax, currency)}` : "",
    totals.discount ? `Discount: -${formatMoney(totals.discount, currency)}` : "",
    `Total: ${formatMoney(totals.total, currency)}`,
    `In words: ${amountInWords(totals.total, currency)}`,
    "",
    payload.notes ? `Notes: ${payload.notes}` : "",
    payload.terms ? `Terms: ${payload.terms}` : "",
  ].filter((line) => line !== undefined && line !== null);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
};
