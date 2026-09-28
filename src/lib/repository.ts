"use client";

import type { AppUser, ActivityLog, AppNotification, BusinessProfile, DocumentRecord, InvoiceRecord, Subscription, UserSettings } from "./types";
import type { Workspace } from "./seed";
import { defaultSettings, defaultSubscription } from "./defaults";
import type { DataMode } from "./config";
import { getFirebaseApp } from "./firebase-app";

async function db() {
  const fs = await import("firebase/firestore");
  return { fs, database: fs.getFirestore(await getFirebaseApp()) };
}

type CollectionName = "documents" | "businesses" | "activity" | "notifications";
async function readRows<T>(uid: string, collection: CollectionName): Promise<T[]> {
  const { fs, database } = await db();
  const snapshot = await fs.getDocs(fs.collection(database, "users", uid, collection));
  return snapshot.docs.map(row => row.data() as T);
}
const writeQueue = new Map<string, Promise<void>>();
async function writeRows<T extends { id: string }>(uid: string, collection: CollectionName, rows: T[]) {
  const key = `${uid}/${collection}`;
  const previousWrite = writeQueue.get(key) ?? Promise.resolve();
  const work = previousWrite.catch(() => undefined).then(() => commitRows(uid, collection, rows));
  writeQueue.set(key, work);
  try { await work; } finally { if (writeQueue.get(key) === work) writeQueue.delete(key); }
}
async function commitRows<T extends { id: string }>(uid: string, collection: CollectionName, rows: T[]) {
  const { fs, database } = await db();
  const ref = fs.collection(database, "users", uid, collection);
  const previous = await fs.getDocs(ref);
  const existing = new Set(rows.map(row => row.id));
  // Keep batches below Firestore's 500-write limit. Each invocation is awaited;
  // errors propagate to the UI instead of silently treating local data as saved.
  let batch = fs.writeBatch(database);
  let count = 0;
  const flush = async () => { if (count) { await batch.commit(); batch = fs.writeBatch(database); count = 0; } };
  for (const row of previous.docs) {
    if (!existing.has(row.id)) { batch.delete(row.ref); if (++count >= 400) await flush(); }
  }
  for (const row of rows) {
    batch.set(fs.doc(ref, row.id), JSON.parse(JSON.stringify(row))); if (++count >= 400) await flush();
  }
  await flush();
}
async function updateProfile(uid: string, fields: Record<string, unknown>) {
  const { fs, database } = await db();
  await fs.setDoc(fs.doc(database, "users", uid), JSON.parse(JSON.stringify(fields)), { merge: true });
}

export interface DataEngine {
  mode: DataMode;
  cloud: boolean;
  load(uid: string, seedIfEmpty: boolean): Promise<Workspace>;
  saveDocuments(uid: string, docs: DocumentRecord[]): Promise<void>;
  saveBusinesses(uid: string, businesses: BusinessProfile[]): Promise<void>;
  saveActivity(uid: string, activity: ActivityLog[]): Promise<void>;
  saveNotifications(uid: string, notifications: AppNotification[]): Promise<void>;
  saveSettings(uid: string, settings: UserSettings): Promise<void>;
  saveSubscription(uid: string, subscription: Subscription): Promise<void>;
  saveInvoices(uid: string, invoices: InvoiceRecord[]): Promise<void>;
  saveUser(uid: string, user: AppUser): Promise<void>;
  reset(uid: string, user: AppUser): Promise<Workspace>;
}

export const createEngine = (_mode: DataMode): DataEngine => ({
  mode: "firebase", cloud: true,
  async load(uid) {
    const { fs, database } = await db();
    const [profile, documents, businesses, activity, notifications] = await Promise.all([
      fs.getDoc(fs.doc(database, "users", uid)),
      readRows<DocumentRecord>(uid, "documents"), readRows<BusinessProfile>(uid, "businesses"),
      readRows<ActivityLog>(uid, "activity"), readRows<AppNotification>(uid, "notifications"),
    ]);
    if (!profile.exists()) throw new Error("Your account profile is unavailable. Please sign in again.");
    const data = profile.data();
    return {
      user: (data.user as AppUser | undefined) ?? { uid, email: data.email ?? "", displayName: data.name ?? "", role: data.role === "admin" ? "admin" : "user", timezone: "Africa/Lusaka", language: "en", emailVerified: true, provider: "password", createdAt: data.createdAt ?? Date.now() },
      documents, businesses, activity, notifications,
      settings: { ...defaultSettings(), ...(data.settings ?? {}) },
      subscription: { ...defaultSubscription(uid), ...(data.subscription ?? {}) },
      invoices: data.invoices ?? [],
    };
  },
  saveDocuments: (uid, docs) => writeRows(uid, "documents", docs),
  saveBusinesses: (uid, rows) => writeRows(uid, "businesses", rows),
  saveActivity: (uid, rows) => writeRows(uid, "activity", rows),
  saveNotifications: (uid, rows) => writeRows(uid, "notifications", rows),
  saveSettings: (uid, value) => updateProfile(uid, { settings: value }),
  saveSubscription: (uid, value) => updateProfile(uid, { subscription: value }),
  saveInvoices: (uid, value) => updateProfile(uid, { invoices: value }),
  saveUser: (uid, value) => { const { role: _role, ...safe } = value; return updateProfile(uid, { user: safe }); },
  async reset(uid, user) {
    await writeRows(uid, "documents", []);
    await writeRows(uid, "businesses", []);
    await writeRows(uid, "activity", []);
    await writeRows(uid, "notifications", []);
    const settings = defaultSettings();
    const subscription = defaultSubscription(uid);
    await updateProfile(uid, { settings, subscription, invoices: [] });
    return { user, settings, subscription, documents: [], businesses: [], activity: [], notifications: [], invoices: [] };
  },
});
