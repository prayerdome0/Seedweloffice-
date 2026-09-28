"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type {
  ActivityAction, ActivityLog, AppNotification, AppUser, BusinessProfile, DocumentRecord, DocKind, InvoiceRecord,
  Subscription, UserSettings,
} from "@/lib/types";
import { createEngine, type DataEngine } from "@/lib/repository";
import { resolveDataMode } from "@/lib/config";
import { defaultSettings, defaultSubscription } from "@/lib/defaults";
import { createDraft, nextDocNumber } from "@/lib/documents/compute";
import { blankPayload } from "@/lib/documents/schema";
import { defaultTemplateId } from "@/templates";
import { shareToken, uid } from "@/lib/utils";

export type Status = "idle" | "loading" | "ready" | "error";

interface WorkspaceState {
  status: Status;
  engine: DataEngine;
  cloud: boolean;
  user: AppUser | null;
  businesses: BusinessProfile[];
  documents: DocumentRecord[];
  activity: ActivityLog[];
  notifications: AppNotification[];
  settings: UserSettings;
  subscription: Subscription;
  invoices: InvoiceRecord[];
  error?: string;

  hydrate: (user: AppUser) => Promise<void>;
  unload: () => void;

  createDocument: (kind: DocKind, options?: { businessId?: string; templateId?: string; title?: string }) => DocumentRecord;
  saveDocument: (doc: DocumentRecord, options?: { silent?: boolean; detail?: string }) => void;
  patchDocument: (id: string, patch: Partial<DocumentRecord>) => void;
  deleteDocument: (id: string) => void;
  duplicateDocument: (id: string) => DocumentRecord | null;
  toggleStar: (id: string) => void;
  toggleArchive: (id: string) => void;
  setDocumentStatus: (id: string, status: DocumentRecord["status"]) => void;
  recordPayment: (id: string, amount: number) => void;
  attachShareLink: (id: string) => string;

  saveBusiness: (profile: BusinessProfile) => void;
  deleteBusiness: (id: string) => void;
  setDefaultBusiness: (id: string) => void;

  updateSettings: (patch: Partial<UserSettings>) => void;
  updateProfile: (patch: Partial<AppUser>) => void;
  updateSubscription: (patch: Partial<Subscription>) => void;

  recordActivity: (action: ActivityAction, entityId?: string, entityName?: string, detail?: string) => void;
  markNotificationsRead: () => void;
  toggleNotificationRead: (id: string) => void;
  dismissNotification: (id: string) => void;

  resetWorkspace: () => void;
}

const engine = createEngine(resolveDataMode());

const MAX_ACTIVITY = 160;
const MAX_NOTIFICATIONS = 60;



/** Writes are fire-and-forget: the UI stays instant, storage catches up. */
export const useWorkspace = create<WorkspaceState>((set, get) => {
  const persistDocuments = (documents: DocumentRecord[]) => {
    const user = get().user;
    if (user) void get().engine.saveDocuments(user.uid, documents).catch((error) => set({ error: `Could not sync documents: ${String(error)}` }));
  };
  const persistBusinesses = (businesses: BusinessProfile[]) => {
    const user = get().user;
    if (user) void get().engine.saveBusinesses(user.uid, businesses).catch((error) => set({ error: `Could not sync businesses: ${String(error)}` }));
  };
  const persistActivity = (activity: ActivityLog[]) => {
    const user = get().user;
    if (user) void get().engine.saveActivity(user.uid, activity).catch((error) => set({ error: `Could not sync activity: ${String(error)}` }));
  };
  const persistNotifications = (notifications: AppNotification[]) => {
    const user = get().user;
    if (user) void get().engine.saveNotifications(user.uid, notifications).catch((error) => set({ error: `Could not sync notifications: ${String(error)}` }));
  };

  return {
    status: "idle",
    engine,
    cloud: engine.cloud,
    user: null,
    businesses: [],
    documents: [],
    activity: [],
    notifications: [],
    settings: defaultSettings(),
    subscription: defaultSubscription(""),
    invoices: [],

    async hydrate(user) {
      set({ status: "loading", error: undefined });
      try {
        const workspace = await get().engine.load(user.uid, false);
        set({
          status: "ready",
          user: { ...workspace.user, ...user },
          businesses: workspace.businesses,
          documents: workspace.documents,
          activity: workspace.activity,
          notifications: workspace.notifications,
          settings: workspace.settings,
          subscription: workspace.subscription,
          invoices: workspace.invoices,
        });
      } catch (error) {
        set({ status: "error", error: (error as Error)?.message ?? "Could not load your workspace." });
      }
    },

    unload() {
      set({ status: "idle", user: null, documents: [], businesses: [], activity: [], notifications: [], invoices: [] });
    },

    createDocument(kind, options) {
      const { documents, businesses, settings } = get();
      const business = businesses.find((b) => b.id === options?.businessId) ?? businesses.find((b) => b.isDefault) ?? businesses[0] ?? null;
      const templateId = options?.templateId || settings.defaultTemplate?.[kind] || defaultTemplateId[kind];
      const payload = blankPayload(kind);
      const draft = createDraft(kind, {
        business,
        existing: documents,
        templateId,
        payload: options?.title ? { ...payload, title: options.title } : payload,
        ownerId: get().user?.uid ?? "local",
      });
      const documents2 = [draft, ...documents];
      set({ documents: documents2 });
      persistDocuments(documents2);
      get().recordActivity("document.created", draft.id, draft.number, `Started ${draft.title}`);
      return draft;
    },

    saveDocument(doc, options) {
      const next: DocumentRecord = { ...doc, updatedAt: Date.now() };
      const documents = get().documents.some((d) => d.id === doc.id)
        ? get().documents.map((d) => (d.id === doc.id ? next : d))
        : [next, ...get().documents];
      set({ documents });
      persistDocuments(documents);
      if (!options?.silent) {
        get().recordActivity("document.updated", next.id, next.number, options?.detail ?? `Updated ${next.title}`);
      }
    },

    patchDocument(id, patch) {
      const documents = get().documents.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d));
      set({ documents });
      persistDocuments(documents);
    },

    deleteDocument(id) {
      const doc = get().documents.find((d) => d.id === id);
      const documents = get().documents.filter((d) => d.id !== id);
      set({ documents });
      persistDocuments(documents);
      if (doc?.shareToken) void (async () => {
        try {
          const [{ getFirebaseApp }, fs] = await Promise.all([import("@/lib/firebase-app"), import("firebase/firestore")]);
          await fs.deleteDoc(fs.doc(fs.getFirestore(await getFirebaseApp()), "publicShares", doc.shareToken!));
        } catch (error) { set({ error: `Could not revoke public link: ${String(error)}` }); }
      })();
      if (doc) get().recordActivity("document.deleted", undefined, doc.number, `Deleted ${doc.title}`);
    },

    duplicateDocument(id) {
      const doc = get().documents.find((d) => d.id === id);
      if (!doc) return null;
      const copy: DocumentRecord = {
        ...doc,
        id: uid("doc"),
        number: nextDocNumber(get().documents, doc.kind, get().businesses.find((b) => b.id === doc.businessId)?.invoicePrefix),
        title: `${doc.title} (copy)`,
        status: "draft",
        shareToken: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const documents = [copy, ...get().documents];
      set({ documents });
      persistDocuments(documents);
      get().recordActivity("document.duplicated", copy.id, copy.number, `Duplicated ${doc.title}`);
      return copy;
    },

    toggleStar(id) {
      const documents = get().documents.map((d) => (d.id === id ? { ...d, starred: !d.starred, updatedAt: Date.now() } : d));
      set({ documents });
      persistDocuments(documents);
    },

    toggleArchive(id) {
      const doc = get().documents.find((d) => d.id === id);
      const documents = get().documents.map((d) => (d.id === id ? { ...d, archived: !d.archived, updatedAt: Date.now() } : d));
      set({ documents });
      persistDocuments(documents);
      if (doc) get().recordActivity("document.updated", doc.id, doc.number, doc.archived ? `Restored ${doc.title}` : `Archived ${doc.title}`);
    },

    setDocumentStatus(id, status) {
      const doc = get().documents.find((d) => d.id === id);
      const documents = get().documents.map((d) => (d.id === id ? { ...d, status, updatedAt: Date.now() } : d));
      set({ documents });
      persistDocuments(documents);
      if (doc) get().recordActivity("document.status", doc.id, doc.number, `Marked ${doc.number} as ${status}`);
    },

    recordPayment(id, amount) {
      const documents = get().documents.map((d) => {
        if (d.id !== id) return d;
        const paid = Math.min((d.payload.amountPaid ?? 0) + amount, Number.MAX_SAFE_INTEGER);
        return { ...d, payload: { ...d.payload, amountPaid: paid }, updatedAt: Date.now() };
      });
      set({ documents });
      persistDocuments(documents);
      const doc = get().documents.find((d) => d.id === id);
      if (doc) get().recordActivity("document.updated", doc.id, doc.number, `Recorded a payment against ${doc.number}`);
    },

    attachShareLink(id) {
      const existing = get().documents.find((d) => d.id === id)?.shareToken;
      if (existing) return existing;
      const token = shareToken();
      const documents = get().documents.map((d) => (d.id === id ? { ...d, shareToken: token, updatedAt: Date.now() } : d));
      set({ documents });
      persistDocuments(documents);
      const doc = get().documents.find((d) => d.id === id);
      if (doc) get().recordActivity("document.shared", doc.id, doc.number, `Created a share link for ${doc.number}`);
      return token;
    },

    saveBusiness(profile) {
      const businesses = get().businesses.some((b) => b.id === profile.id)
        ? get().businesses.map((b) => (b.id === profile.id ? { ...profile, updatedAt: Date.now() } : b))
        : [...get().businesses, profile];
      const normalised = profile.isDefault ? businesses.map((b) => ({ ...b, isDefault: b.id === profile.id })) : businesses;
      set({ businesses: normalised });
      persistBusinesses(normalised);
      get().recordActivity("business.updated", profile.id, profile.name, `Saved the ${profile.name} profile`);
    },

    deleteBusiness(id) {
      const profile = get().businesses.find((b) => b.id === id);
      const businesses = get().businesses.filter((b) => b.id !== id);
      const documents = get().documents.map((d) => (d.businessId === id ? { ...d, businessId: businesses[0]?.id ?? "" } : d));
      set({ businesses, documents });
      persistBusinesses(businesses);
      persistDocuments(documents);
      if (profile) get().recordActivity("business.updated", undefined, profile.name, `Removed the ${profile.name} profile`);
    },

    setDefaultBusiness(id) {
      const businesses = get().businesses.map((b) => ({ ...b, isDefault: b.id === id }));
      set({ businesses });
      persistBusinesses(businesses);
      const profile = businesses.find((b) => b.id === id);
      if (profile) get().recordActivity("business.updated", id, profile.name, `${profile.name} is now the default profile`);
    },

    updateSettings(patch) {
      const settings = { ...get().settings, ...patch };
      set({ settings });
      const user = get().user;
      if (user) void get().engine.saveSettings(user.uid, settings);
      get().recordActivity("settings.updated", undefined, undefined, "Updated your preferences");
    },

    updateProfile(patch) {
      const current = get().user;
      if (!current) return;
      const user: AppUser = { ...current, ...patch, uid: patch.uid ?? current.uid };
      set({ user });
      void get().engine.saveUser(user.uid, user);
    },

    updateSubscription(patch) {
      const subscription = { ...get().subscription, ...patch };
      set({ subscription });
      const user = get().user;
      if (user) void get().engine.saveSubscription(user.uid, subscription);
      get().recordActivity("subscription.updated", undefined, undefined, `Subscription set to ${subscription.plan}`);
    },

    recordActivity(action, entityId, entityName, detail) {
      const user = get().user;
      if (!user) return;
      const entry: ActivityLog = { id: uid("act"), ownerId: user.uid, action, entityId, entityName, detail, createdAt: Date.now() };
      const activity = [entry, ...get().activity].slice(0, MAX_ACTIVITY);
      set({ activity });
      persistActivity(activity);
    },

    markNotificationsRead() {
      const notifications = get().notifications.map((n) => ({ ...n, read: true }));
      set({ notifications });
      persistNotifications(notifications);
    },

    toggleNotificationRead(id) {
      const notifications = get().notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n));
      set({ notifications });
      persistNotifications(notifications);
    },

    dismissNotification(id) {
      const notifications = get().notifications.filter((n) => n.id !== id);
      set({ notifications });
      persistNotifications(notifications);
    },

    resetWorkspace() {
      const user = get().user;
      if (!user) return;
      void (async () => {
        const fresh = await get().engine.reset(user.uid, user);
        set({
          businesses: fresh.businesses,
          documents: fresh.documents,
          activity: fresh.activity,
          notifications: fresh.notifications,
          invoices: fresh.invoices,
          settings: fresh.settings,
          subscription: fresh.subscription,
        });
      })();
    },
  };
});

/* ── Selectors ──────────────────────────────────────────────────────────── */

export const useActiveDocuments = () => useWorkspace(useShallow((s) => s.documents.filter((d) => !d.archived)));

export const useDocument = (id: string) => useWorkspace((s) => s.documents.find((d) => d.id === id));

export const useBusiness = (id?: string) =>
  useWorkspace((s) => s.businesses.find((b) => b.id === id) ?? s.businesses.find((b) => b.isDefault) ?? s.businesses[0] ?? null);

export const useDefaultBusiness = () => useWorkspace((s) => s.businesses.find((b) => b.isDefault) ?? s.businesses[0] ?? null);

export const useUnreadCount = () => useWorkspace((s) => s.notifications.filter((n) => !n.read).length);

export const useDocumentsByKind = (kind: DocKind) =>
  useWorkspace(useShallow((s) => s.documents.filter((d) => d.kind === kind && !d.archived)));

export const useBusinessDocuments = (businessId?: string) =>
  useWorkspace(useShallow((s) => s.documents.filter((d) => !d.archived && (!businessId || d.businessId === businessId))));
