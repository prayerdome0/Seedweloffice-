"use client";

import { downloadBlob } from "@/lib/utils";
import { APP_NAME } from "@/lib/config";

/**
 * PDF export.
 *
 * The on-screen document is rendered at 2× device resolution by html2canvas
 * (the `-pro` fork, which understands modern colour functions) and sliced
 * across A4 pages with jsPDF. What you see in the preview is exactly what the
 * customer receives, down to the last rule.
 */

export interface PdfExportOptions {
  filename?: string;
  title?: string;
  /** Adds a discreet footer to every page. */
  footer?: string;
  scale?: number;
  onProgress?: (stage: "rendering" | "writing" | "done") => void;
}

const A4 = { width: 595.28, height: 841.89 };

export async function exportElementToPdf(element: HTMLElement, options: PdfExportOptions = {}): Promise<void> {
  const { filename = "document.pdf", title, footer, scale: requestedScale, onProgress } = options;
  onProgress?.("rendering");

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);

  const scale = requestedScale ?? Math.min(2, Math.max(1.4, (typeof window !== "undefined" ? window.devicePixelRatio : 1.5) * 1.2));

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait", compress: true });
  if (title) pdf.setProperties({ title, creator: APP_NAME, subject: title });

  const pageWidthPx = canvas.width / scale;
  const pageHeightPx = Math.floor((A4.height / A4.width) * pageWidthPx);
  const pages = Math.max(1, Math.ceil(canvas.height / pageHeightPx));

  const slice = document.createElement("canvas");
  const ctx = slice.getContext("2d");
  if (!ctx) throw new Error("Could not prepare the PDF canvas.");

  for (let page = 0; page < pages; page += 1) {
    const offsetY = page * pageHeightPx;
    const height = Math.min(pageHeightPx, canvas.height - offsetY);
    slice.width = canvas.width;
    slice.height = height;
    ctx.clearRect(0, 0, slice.width, slice.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, offsetY, canvas.width, height, 0, 0, canvas.width, height);

    const image = slice.toDataURL("image/jpeg", 0.94);
    const renderHeight = (height / pageWidthPx) * A4.width;

    if (page > 0) pdf.addPage();
    pdf.addImage(image, "JPEG", 0, 0, A4.width, renderHeight, undefined, "FAST");

    if (footer) {
      pdf.setFontSize(7.5);
      pdf.setTextColor(148, 163, 184);
      pdf.text(footer, A4.width / 2, A4.height - 16, { align: "center" });
    }
  }

  onProgress?.("writing");
  pdf.save(filename);
  onProgress?.("done");
}

/** Convenience wrapper that finds the printable element on the page. */
export async function exportDocumentPdf(options: PdfExportOptions & { selector?: string } = {}): Promise<void> {
  const target = document.querySelector<HTMLElement>(options.selector ?? ".print-root .paper, .paper");
  if (!target) throw new Error("Open a document preview to export a PDF.");
  await exportElementToPdf(target, options);
}

export async function buildPdfBlob(element: HTMLElement, options: PdfExportOptions = {}): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);
  const canvas = await html2canvas(element, { scale: options.scale ?? 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
  const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageWidthPx = canvas.width / (options.scale ?? 2);
  const pageHeightPx = Math.floor((A4.height / A4.width) * pageWidthPx);
  const pages = Math.max(1, Math.ceil(canvas.height / pageHeightPx));
  const slice = document.createElement("canvas");
  const ctx = slice.getContext("2d");
  if (!ctx) throw new Error("Could not prepare the PDF canvas.");
  for (let page = 0; page < pages; page += 1) {
    const offsetY = page * pageHeightPx;
    const height = Math.min(pageHeightPx, canvas.height - offsetY);
    slice.width = canvas.width;
    slice.height = height;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, offsetY, canvas.width, height, 0, 0, canvas.width, height);
    if (page > 0) pdf.addPage();
    pdf.addImage(slice.toDataURL("image/jpeg", 0.94), "JPEG", 0, 0, A4.width, (height / pageWidthPx) * A4.width, undefined, "FAST");
  }
  return pdf.output("blob");
}

export async function downloadPdf(element: HTMLElement, filename: string): Promise<void> {
  const blob = await buildPdfBlob(element);
  downloadBlob(blob, filename);
}
