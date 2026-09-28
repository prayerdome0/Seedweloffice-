"use client";

import type { AppUser, ActivityLog, AppNotification, BusinessProfile, DocumentRecord, InvoiceRecord, Subscription, UserSettings } from "./types";
import { buildDemoWorkspace, type Workspace } from "./seed";
import { hasFirebaseConfig, type DataMode } from "./config";

/**
 * Persistence layer.
 *
 * Two interchangeable engines behind one interface:
 *   • `local`    — browser storage. Zero configuration, offline by nature.
 *   • `firebase` — Firestore through the client SDK, loaded lazily so the SDK
 *                  is never shipped to visitors who are not signed in.
 */

export type CollectionName = "documents" | "businesses" | "activity" | "notifications";

const VERSION = "v1";
const key = (uid: string, collection: string) => `seedwel.${VERSION}.${uid}.${collection}`;

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const isBrowser = () => typeof window !== "undefined";

/* ── Local engine ────────────────────────────────────────────────────────── */

const localEngine = {
  async read<T>(uid: string, collection: string, fallback: T): Promise<T> {
    if (!isBrowser()) return fallback;
    return safeParse<T>(window.localStorage.getItem(key(uid, collection)), fallback);
  },
  async write(uid: string, collection: string, value: unknown): Promise<void> {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(key(uid, collection), JSON.stringify(value));
    } catch {
      /* quota exceeded — the store surfaces a friendly warning */
      throw new Error("storage-full");
    }
  },
  async clear(uid: string): Promise<void> {
    if (!isBrowser()) return;
    for (const collection of ["documents", "businesses", "activity", "notifications", "settings", "subscription", "invoices", "user"]) {
      window.localStorage.removeItem(key(uid, collection));
    }
  },
};

/* ── Firestore engine ───────────────────────────────────────────────────── */

async function importFirestore() {
  const [fs, appMod] = await Promise.all([import("firebase/firestore"), import("./firebase-app")]);
  const app = await appMod.getFirebaseApp();
  return { firestore: fs.getFirestore(app), fs };
}

const firestoreEngine = {
  async read<T>(uid: string, collection: string, fallback: T): Promise<T> {
    try {
      const { firestore, fs } = await importFirestore();
      const snap = await fs.getDocs(fs.collection(firestore, "users", uid, collection));
      const rows = snap.docs.map((d) => d.data());
      return (rows.length ? rows : fallback) as T;
    } catch (error) {
      console.warn("[seedwel] Firestore read failed, using local copy", error);
      return localEngine.read<T>(uid, collection, fallback);
    }
  },
  async write(uid: string, collection: string, value: unknown): Promise<void> {
    await localEngine.write(uid, collection, value);
    try {
      const { firestore, fs } = await importFirestore();
      const rows = Array.isArray(value) ? value : Object.values(value as Record<string, unknown>);
      const batch = fs.writeBatch(firestore);
      for (const row of rows) {
        const item = row as { id?: string };
        if (!item?.id) continue;
        batch.set(fs.doc(firestore, "users", uid, collection, item.id), item as Record<string, unknown>, { merge: true });
      }
      await batch.commit();
    } catch (error) {
      console.warn("[seedwel] Firestore write failed — changes are kept locally", error);
    }
  },
  async readSingleton<T>(uid: string, field: string, fallback: T): Promise<T> {
    try {
      const { firestore, fs } = await importFirestore();
      const snap = await fs.getDoc(fs.doc(firestore, "users", uid));
      const data = snap.data() as Record<string, unknown> | undefined;
      const value = data?.[field];
      return (value ? { ...(fallback as object), ...(value as object) } : fallback) as T;
    } catch {
      return fallback;
    }
  },
  async writeSingleton(uid: string, field: string, value: unknown): Promise<void> {
    await localEngine.write(uid, field, value);
    try {
      const { firestore, fs } = await importFirestore();
      await fs.setDoc(fs.doc(firestore, "users", uid), { [field]: value }, { merge: true });
    } catch (error) {
      console.warn("[seedwel] Firestore profile write failed", error);
    }
  },
};

/* ── Public engine ──────────────────────────────────────────────────────── */

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

export const createEngine = (mode: DataMode): DataEngine => {
  const cloud = mode === "firebase" && hasFirebaseConfig();
  const store = cloud
    ? {
        documents: (uid: string, v: DocumentRecord[]) => firestoreEngine.write(uid, "documents", v),
        businesses: (uid: string, v: BusinessProfile[]) => firestoreEngine.write(uid, "businesses", v),
        activity: (uid: string, v: ActivityLog[]) => firestoreEngine.write(uid, "activity", v),
        notifications: (uid: string, v: AppNotification[]) => firestoreEngine.write(uid, "notifications", v),
        settings: (uid: string, v: UserSettings) => firestoreEngine.writeSingleton(uid, "settings", v),
        subscription: (uid: string, v: Subscription) => firestoreEngine.writeSingleton(uid, "subscription", v),
        invoices: (uid: string, v: InvoiceRecord[]) => firestoreEngine.writeSingleton(uid, "invoices", v),
      }
    : {
        documents: (uid: string, v: DocumentRecord[]) => localEngine.write(uid, "documents", v),
        businesses: (uid: string, v: BusinessProfile[]) => localEngine.write(uid, "businesses", v),
        activity: (uid: string, v: ActivityLog[]) => localEngine.write(uid, "activity", v),
        notifications: (uid: string, v: AppNotification[]) => localEngine.write(uid, "notifications", v),
        settings: (uid: string, v: UserSettings) => localEngine.write(uid, "settings", v),
        subscription: (uid: string, v: Subscription) => localEngine.write(uid, "subscription", v),
        invoices: (uid: string, v: InvoiceRecord[]) => localEngine.write(uid, "invoices", v),
      };

  return {
    mode,
    cloud,
    async load(uid, seedIfEmpty) {
      const demo = buildDemoWorkspace(uid);
      if (!isBrowser()) return demo;

      const hasLocal = window.localStorage.getItem(key(uid, "documents")) !== null;
      const cache: Partial<Workspace> = {
        documents: await localEngine.read<DocumentRecord[]>(uid, "documents", []),
        businesses: await localEngine.read<BusinessProfile[]>(uid, "businesses", []),
        activity: await localEngine.read<ActivityLog[]>(uid, "activity", []),
        notifications: await localEngine.read<AppNotification[]>(uid, "notifications", []),
        settings: await localEngine.read<UserSettings>(uid, "settings", demo.settings),
        subscription: await localEngine.read<Subscription>(uid, "subscription", demo.subscription),
        invoices: await localEngine.read<InvoiceRecord[]>(uid, "invoices", []),
      };

      const empty = !hasLocal && !(cache.documents ?? []).length;

      if (cloud) {
        const [documents, businesses, activity, notifications, settings, subscription, invoices] = await Promise.all([
          firestoreEngine.read<DocumentRecord[]>(uid, "documents", []),
          firestoreEngine.read<BusinessProfile[]>(uid, "businesses", []),
          firestoreEngine.read<ActivityLog[]>(uid, "activity", []),
          firestoreEngine.read<AppNotification[]>(uid, "notifications", []),
          firestoreEngine.readSingleton<UserSettings>(uid, "settings", demo.settings),
          firestoreEngine.readSingleton<Subscription>(uid, "subscription", demo.subscription),
          firestoreEngine.readSingleton<InvoiceRecord[]>(uid, "invoices", []),
        ]);
        const merged: Workspace = {
          user: await firestoreEngine.readSingleton<AppUser>(uid, "user", demo.user),
          documents: documents.length ? documents : cache.documents ?? [],
          businesses: businesses.length ? businesses : cache.businesses ?? [],
          activity: activity.length ? activity : cache.activity ?? [],
          notifications: notifications.length ? notifications : cache.notifications ?? [],
          settings: { ...demo.settings, ...settings },
          subscription: { ...demo.subscription, ...subscription },
          invoices: invoices.length ? invoices : cache.invoices ?? [],
        };
        if (!merged.documents.length) return buildDemoWorkspace(uid, merged.user.displayName, merged.user.email);
        return merged;
      }

      if (empty && seedIfEmpty) return demo;
      if (empty) return { ...demo, documents: [], activity: [], notifications: [], invoices: [] };

      return {
        user: await localEngine.read<AppUser>(uid, "user", demo.user),
        documents: cache.documents ?? [],
        businesses: (cache.businesses ?? []).length ? cache.businesses! : demo.businesses,
        activity: cache.activity ?? [],
        notifications: cache.notifications ?? [],
        settings: { ...demo.settings, ...(cache.settings ?? {}) },
        subscription: { ...demo.subscription, ...(cache.subscription ?? {}) },
        invoices: (cache.invoices ?? []).length ? cache.invoices! : demo.invoices,
      };
    },
    async reset(uid, user) {
      await localEngine.clear(uid);
      const fresh = buildDemoWorkspace(uid, user.displayName, user.email);
      if (!cloud) return fresh;
      await Promise.all([
        store.documents(uid, fresh.documents),
        store.businesses(uid, fresh.businesses),
        store.activity(uid, fresh.activity),
        store.notifications(uid, fresh.notifications),
        store.invoices(uid, fresh.invoices),
        store.settings(uid, fresh.settings),
        store.subscription(uid, fresh.subscription),
      ]);
      return fresh;
    },
    saveDocuments: (uid, v) => store.documents(uid, v),
    saveBusinesses: (uid, v) => store.businesses(uid, v),
    saveActivity: (uid, v) => store.activity(uid, v),
    saveNotifications: (uid, v) => store.notifications(uid, v),
    saveSettings: (uid, v) => store.settings(uid, v),
    saveSubscription: (uid, v) => store.subscription(uid, v),
    saveInvoices: (uid, v) => store.invoices(uid, v),
    saveUser: (uid, v) => (cloud ? firestoreEngine.writeSingleton(uid, "user", v) : localEngine.write(uid, "user", v)),
  };
};
