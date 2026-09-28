/** Production configuration: Firebase is required for accounts and documents. */

export const APP_NAME = "Seedwel Office";
export const APP_TAGLINE = "Documents that win business.";
export const APP_DESCRIPTION =
  "Create invoices, quotations, receipts, CVs, proposals, contracts and more with a template library built for African business.";
const DEFAULT_APP_URL = "https://seedweloffice.com";
const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

/**
 * Keep URL-based metadata and links valid even when a deployment platform
 * injects NEXT_PUBLIC_APP_URL as an empty or malformed value.
 */
export const APP_URL = (() => {
  if (!configuredAppUrl) return DEFAULT_APP_URL;

  try {
    const url = new URL(configuredAppUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return DEFAULT_APP_URL;
    return url.origin;
  } catch {
    return DEFAULT_APP_URL;
  }
})();

export const SUPPORT_EMAIL = "support@seedweloffice.com";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

/** Web Push VAPID key (FCM). Required to subscribe to push notifications. */
export const firebaseVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "";

export const hasFirebaseConfig = (): boolean =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

export const hasPushConfig = (): boolean => hasFirebaseConfig() && Boolean(firebaseVapidKey);

/** Data engine in use, resolved on the client. */
export type DataMode = "firebase" | "unavailable";

export const resolveDataMode = (): DataMode => (hasFirebaseConfig() ? "firebase" : "unavailable");

/* ── Plans ──────────────────────────────────────────────────────────────── */

export { PLANS, planById } from "./constants";

/* ── Limits ──────────────────────────────────────────────────────────────── */

export const LIMITS = {
  logoBytes: 512 * 1024,
  signatureBytes: 256 * 1024,
  stampBytes: 256 * 1024,
  maxAttachmentBytes: 5 * 1024 * 1024,
  maxDocuments: 5000,
} as const;

export const TEMPLATE_TOTAL = 180;

export const isConfigured = {
  firebase: hasFirebaseConfig(),
};

export const envNote = hasFirebaseConfig()
  ? "Cloud sync is active: your documents follow you to any device."
  : "Service unavailable: Firebase configuration is required.";
