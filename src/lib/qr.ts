"use client";

import QRCode from "qrcode";

/** QR helper — code is rendered as a PNG data URL and dropped into documents. */

export interface QrOptions {
  size?: number;
  margin?: number;
  color?: string;
  background?: string;
}

export const qrDataUrl = async (value: string, options: QrOptions = {}): Promise<string> => {
  if (!value.trim()) return "";
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: options.margin ?? 1,
    width: options.size ?? 220,
    color: { dark: options.color ?? "#101827", light: options.background ?? "#ffffff" },
  });
};

export const qrSvgString = async (value: string): Promise<string> => {
  if (!value.trim()) return "";
  return QRCode.toString(value, { type: "svg", margin: 1 });
};

/** What a QR on a document should point at when the user has not chosen. */
export const defaultQrTarget = (kind: string, number: string, business?: { website?: string } | null): string => {
  const base = business?.website?.startsWith("http") ? business.website : business?.website ? `https://${business.website}` : "";
  if (base) return `${base.replace(/\/$/, "")}/documents/${encodeURIComponent(number)}`;
  return `https://seedweloffice.com/verify/${kind}/${encodeURIComponent(number)}`;
};
