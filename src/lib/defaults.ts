import type { Subscription, UserSettings } from "./types";

// Account defaults are configuration, never fabricated transactions or trials.
export const defaultSubscription = (ownerId: string): Subscription => ({
  id: `free-${ownerId}`, ownerId, plan: "free", status: "active", seats: 1,
  interval: "monthly", startedAt: Date.now(), renewsAt: 0,
  amount: 0, currency: "USD",
});

export const defaultSettings = (): UserSettings => ({
  theme: "system",
  accent: "#0e908f",
  density: "comfortable",
  language: "en",
  dateFormat: "dd MMM yyyy",
  currency: "ZMW",
  numberFormat: "comma",
  emailUpdates: true,
  productNews: false,
  invoiceReminders: true,
  paymentAlerts: true,
  weeklyDigest: true,
  twoFactor: false,
  sessionAlerts: true,
  autoSave: true,
  defaultTemplate: {},
  onboardingDone: false,
});
