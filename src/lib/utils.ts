import { currencyMeta } from "./constants";

/* ── Class names ─────────────────────────────────────────────────────────── */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ── Ids ─────────────────────────────────────────────────────────────────── */
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

export function uid(prefix = ""): string {
  const bytes = new Uint8Array(12);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  const stamp = Date.now().toString(36);
  return `${prefix}${prefix ? "_" : ""}${stamp}${out}`;
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function shareToken(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/* ── Numbers & money ─────────────────────────────────────────────────────── */
export function formatMoney(value: number, code = "USD", opts: { compact?: boolean; decimals?: number } = {}): string {
  const meta = currencyMeta(code);
  const decimals = opts.decimals ?? meta.decimals;
  const n = Number.isFinite(value) ? value : 0;
  if (opts.compact && Math.abs(n) >= 1000) {
    const units: [number, string][] = [
      [1e9, "B"],
      [1e6, "M"],
      [1e3, "K"],
    ];
    for (const [size, suffix] of units) {
      if (Math.abs(n) >= size) {
        const scaled = n / size;
        return `${meta.symbol}${(Math.round(scaled * 10) / 10).toFixed(scaled % 1 === 0 ? 0 : 1)}${suffix}`;
      }
    }
  }
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
  return `${meta.symbol}${formatted}`;
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(
    Number.isFinite(value) ? value : 0
  );
}

export function parseAmount(value: string): number {
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/* ── Dates ───────────────────────────────────────────────────────────────── */
export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export function addDaysISO(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDate(value: string | number | Date | undefined, pattern = "dd MMM yyyy"): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : typeof value === "number" ? new Date(value) : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthsLong = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
  ];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return pattern
    .replace("yyyy", String(date.getFullYear()))
    .replace("MMMM", monthsLong[date.getMonth()])
    .replace("MMM", monthsShort[date.getMonth()])
    .replace("MM", mm)
    .replace("dd", dd)
    .replace("d", String(date.getDate()))
    .replace("EEE", days[date.getDay()].slice(0, 3));
}

export function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < 45_000) return "just now";
  if (diff < hour) return `${Math.round(diff / minute)}m ago`;
  if (diff < day) return `${Math.round(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.round(diff / day)}d ago`;
  if (diff < 30 * day) return `${Math.round(diff / (7 * day))}w ago`;
  return formatDate(timestamp, "d MMM yyyy");
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ── Text ────────────────────────────────────────────────────────────────── */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "SO";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export function titleCase(value: string): string {
  return value.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

export function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

export function pluralise(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}

/** Friendly word count used by the AI panel. */
export function wordCount(value: string | undefined): number {
  if (!value) return 0;
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function amountInWords(amount: number, code = "USD"): string {
  const meta = currencyMeta(code);
  const names: Record<string, string> = {
    USD: "Dollars", EUR: "Euros", GBP: "Pounds", ZMW: "Kwacha", ZAR: "Rand", NGN: "Naira", KES: "Shillings",
    GHS: "Cedis", TZS: "Shillings", UGX: "Shillings", MWK: "Kwacha", BWP: "Pula", INR: "Rupees", AED: "Dirhams",
    CAD: "Dollars", AUD: "Dollars", CNY: "Yuan", JPY: "Yen", BRL: "Reais",
  };
  const ones = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen",
    "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
  ];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const under1000 = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return `${tens[Math.floor(n / 10)]}${n % 10 ? `-${ones[n % 10]}` : ""}`;
    return `${ones[Math.floor(n / 100)]} hundred${n % 100 ? ` and ${under1000(n % 100)}` : ""}`;
  };
  const toWords = (n: number): string => {
    if (n === 0) return "zero";
    const scales: [number, string][] = [
      [1e9, "billion"],
      [1e6, "million"],
      [1e3, "thousand"],
    ];
    let rest = Math.floor(n);
    const parts: string[] = [];
    for (const [size, label] of scales) {
      if (rest >= size) {
        parts.push(`${under1000(Math.floor(rest / size))} ${label}`);
        rest %= size;
      }
    }
    if (rest > 0) parts.push(under1000(rest));
    return parts.join(" ");
  };
  const whole = Math.floor(Math.abs(amount));
  const cents = Math.round((Math.abs(amount) - whole) * 100);
  const words = toWords(whole);
  const centsLabel = cents > 0 ? ` and ${toWords(cents)} ${meta.decimals === 0 ? "" : "cents"}`.trimEnd() : "";
  return `${meta.symbol}${formatNumber(whole)}${cents > 0 ? `.${String(cents).padStart(2, "0")}` : ""} — ${titleCase(words)}${centsLabel} ${names[code] ?? code} only`;
}

/* ── Files ───────────────────────────────────────────────────────────────── */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsText(file);
  });
}

export interface ImageLimits {
  maxWidth: number;
  maxHeight: number;
  maxBytes: number;
}

/**
 * Downscales and compresses an uploaded logo / signature / stamp so documents
 * stay light for slow connections and low-end devices.
 */
export async function optimiseImage(file: File, limits: ImageLimits = { maxWidth: 900, maxHeight: 900, maxBytes: 600_000 }): Promise<{ dataUrl: string; bytes: number }> {
  const dataUrl = await fileToDataUrl(file);
  if (typeof document === "undefined") return { dataUrl, bytes: dataUrl.length };
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Unsupported image"));
      img.src = dataUrl;
    });
    const ratio = Math.min(1, limits.maxWidth / image.width, limits.maxHeight / image.height);
    // SVG or already-tiny files are used as-is.
    if (ratio === 1 && file.type !== "image/png" && dataUrl.length < limits.maxBytes) {
      return { dataUrl, bytes: dataUrl.length };
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * ratio));
    canvas.height = Math.max(1, Math.round(image.height * ratio));
    const ctx = canvas.getContext("2d");
    if (!ctx) return { dataUrl, bytes: dataUrl.length };
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const keepAlpha = file.type === "image/png" || file.type === "image/svg+xml";
    const out = canvas.toDataURL(keepAlpha ? "image/png" : "image/jpeg", keepAlpha ? undefined : 0.9);
    return { dataUrl: out.length < dataUrl.length ? out : dataUrl, bytes: Math.min(out.length, dataUrl.length) };
  } catch {
    return { dataUrl, bytes: dataUrl.length };
  }
}

export function dataUrlBytes(dataUrl: string | undefined): number {
  if (!dataUrl) return 0;
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.round((base64.length * 3) / 4);
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadText(text: string, fileName: string, mime = "text/plain"): void {
  downloadBlob(new Blob([text], { type: `${mime};charset=utf-8` }), fileName);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

/* ── Hooks helpers ───────────────────────────────────────────────────────── */
export function debounce<T extends (...args: never[]) => void>(fn: T, ms = 350) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function sum<T>(items: T[], pick: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (pick(item) || 0), 0);
}

export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Deterministic pseudo-random pick so demo data never shifts between renders. */
export function seededPick<T>(items: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  return items[hash % items.length];
}

export function accentSoft(hex: string, amount = 0.1): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * (1 - amount));
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export function readableOn(hex: string): "#ffffff" | "#111827" {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.62 ? "#111827" : "#ffffff";
}

export function shade(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const nums = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  const target = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  return `#${nums
    .map((c) => Math.round(c + (target - c) * t).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
