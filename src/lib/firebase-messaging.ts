"use client";

/**
 * Firebase Cloud Messaging — web push.
 *
 * Follows the repo's lazy-loading rule: `firebase/messaging` is imported only
 * inside functions, so pages that never opt in never download the SDK.
 *
 * Delivery path (custom service worker):
 *   • push arrives at `/sw.js`
 *     → app window visible → forwarded here, shown as an in-app toast
 *     → otherwise         → system notification (click opens the app)
 *   • the device token is kept in localStorage and mirrored to
 *     `users/{uid}/pushTokens/{id}` in Firestore (best effort) so a sender
 *     (Cloud Function, console test message, …) can target this device.
 *
 * Foreground handling is done by our own service worker + message listener
 * instead of the SDK's `onMessage`, because FCM foreground delivery requires
 * the firebase compat script inside the worker — we ship our own worker for
 * the offline shell.
 */

import { firebaseVapidKey, hasPushConfig } from "./config";
import { toast } from "@/components/ui/toast";

const STORE_KEY = "seedwel.push.subscription";

export interface PushRecord {
  token: string;
  uid?: string;
  createdAt: number;
}

export type PushEnableResult =
  | { ok: true; token: string }
  | { ok: false; reason: "unconfigured" | "unsupported" | "denied" | "error"; message?: string };

/* ── Local record ─────────────────────────────────────────────────────────── */

const readRecord = (): PushRecord | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as PushRecord) : null;
  } catch {
    return null;
  }
};

const writeRecord = (record: PushRecord): void => {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(record));
  } catch {
    /* private mode — push still works for this session */
  }
};

const clearRecord = (): void => {
  try {
    window.localStorage.removeItem(STORE_KEY);
  } catch {
    /* ignore */
  }
};

/** The current device's saved push subscription, if any. */
export const getPushRecord = readRecord;

/** True when this device opted in and permission is still granted. */
export const isPushEnabled = (): boolean =>
  Boolean(readRecord()) && typeof Notification !== "undefined" && Notification.permission === "granted";

/** Browser + configuration support (async: the messaging SDK probes the UA). */
export async function isPushSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!hasPushConfig()) return false;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return false;
  try {
    const { isSupported } = await import("firebase/messaging");
    return await isSupported();
  } catch {
    return false;
  }
}

/* ── Firebase (lazy) ──────────────────────────────────────────────────────── */

type Messaging = import("firebase/messaging").Messaging;

let messagingPromise: Promise<Messaging | null> | null = null;

const getMessagingClient = async (): Promise<Messaging | null> => {
  if (!messagingPromise) {
    messagingPromise = (async () => {
      if (!hasPushConfig() || !(await isPushSupported())) return null;
      const { getMessaging } = await import("firebase/messaging");
      const { getFirebaseApp } = await import("./firebase-app");
      return getMessaging(await getFirebaseApp());
    })();
  }
  return messagingPromise;
};

/** Register `/sw.js` and wait until it is active (bounded — never hang). */
const readyRegistration = async (timeoutMs = 5000): Promise<ServiceWorkerRegistration | null> => {
  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => window.setTimeout(() => resolve(null), timeoutMs)),
    ]);
  } catch {
    return null;
  }
};

/* ── Firestore mirror (best effort) ───────────────────────────────────────── */

const tokenDocId = (token: string) => encodeURIComponent(token);

const saveFirestoreToken = async (uid: string, token: string): Promise<void> => {
  const { getFirebaseApp } = await import("./firebase-app");
  const { getFirestore, doc, setDoc } = await import("firebase/firestore");
  const db = getFirestore(await getFirebaseApp());
  await setDoc(
    doc(db, "users", uid, "pushTokens", tokenDocId(token)),
    {
      token,
      uid,
      platform: "web",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    { merge: true },
  );
};

const deleteFirestoreToken = async (uid: string, token: string): Promise<void> => {
  const { getFirebaseApp } = await import("./firebase-app");
  const { getFirestore, doc, deleteDoc } = await import("firebase/firestore");
  const db = getFirestore(await getFirebaseApp());
  await deleteDoc(doc(db, "users", uid, "pushTokens", tokenDocId(token)));
};

/* ── Public API ───────────────────────────────────────────────────────────── */

/** Ask for permission, subscribe this device and persist the FCM token. */
export async function enablePush(uid?: string): Promise<PushEnableResult> {
  if (typeof window === "undefined") return { ok: false, reason: "unsupported" };
  if (!hasPushConfig()) return { ok: false, reason: "unconfigured", message: "Firebase push keys are missing." };
  if (!(await isPushSupported())) {
    return { ok: false, reason: "unsupported", message: "This browser does not support web push." };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        ok: false,
        reason: permission === "denied" ? "denied" : "error",
        message:
          permission === "denied"
            ? "Notifications are blocked for this site. Allow them in your browser settings and try again."
            : "Permission was not granted.",
      };
    }

    const registration = await readyRegistration();
    if (!registration) return { ok: false, reason: "error", message: "The service worker is unavailable." };

    const messaging = await getMessagingClient();
    if (!messaging) return { ok: false, reason: "error", message: "Messaging is unavailable." };

    const { getToken } = await import("firebase/messaging");
    const token = await getToken(messaging, {
      vapidKey: firebaseVapidKey,
      serviceWorkerRegistration: registration,
    });
    if (!token) return { ok: false, reason: "error", message: "No registration token was issued." };

    const previous = readRecord();
    writeRecord({ token, uid: uid ?? previous?.uid, createdAt: Date.now() });

    // Move/refresh the Firestore record — best effort, push works regardless.
    try {
      if (previous?.uid && (previous.token !== token || previous.uid !== uid)) {
        await deleteFirestoreToken(previous.uid, previous.token);
      }
      if (uid) await saveFirestoreToken(uid, token);
    } catch (error) {
      console.warn("[seedwel] could not save the push token to Firestore", error);
    }

    return { ok: true, token };
  } catch (error) {
    console.warn("[seedwel] enablePush failed", error);
    return {
      ok: false,
      reason: "error",
      message: error instanceof Error ? error.message : "Unknown error while enabling push.",
    };
  }
}

/** Unsubscribe this device and remove the saved token everywhere. */
export async function disablePush(): Promise<void> {
  const record = readRecord();
  if (!record) return;

  try {
    const messaging = await getMessagingClient();
    if (messaging) {
      const { deleteToken } = await import("firebase/messaging");
      await deleteToken(messaging);
    }
  } catch {
    /* token may already be gone */
  }

  // Belt and braces: drop the underlying push subscription so nothing can
  // arrive after the user opted out. Re-enabling simply creates a new one.
  try {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription) await subscription.unsubscribe();
  } catch {
    /* ignore */
  }

  clearRecord();
  if (record.uid && record.token) {
    try {
      await deleteFirestoreToken(record.uid, record.token);
    } catch (error) {
      console.warn("[seedwel] could not remove the push token from Firestore", error);
    }
  }
}

/**
 * Called after sign-in: refreshes a rotated token and re-syncs the Firestore
 * record. Quietly no-ops when the user never opted in or revoked permission.
 */
export async function resumePush(uid?: string): Promise<void> {
  const record = readRecord();
  if (!record) return;
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    clearRecord();
    return;
  }
  if (!(await isPushSupported())) return;

  try {
    const registration = await readyRegistration();
    if (!registration) return;
    const messaging = await getMessagingClient();
    if (!messaging) return;

    const { getToken } = await import("firebase/messaging");
    const token = await getToken(messaging, {
      vapidKey: firebaseVapidKey,
      serviceWorkerRegistration: registration,
    });
    if (!token) return;

    const changed = token !== record.token || Boolean(uid && record.uid !== uid);
    if (changed) writeRecord({ token, uid: uid ?? record.uid, createdAt: Date.now() });
    if (uid && changed) {
      try {
        await saveFirestoreToken(uid, token);
      } catch (error) {
        console.warn("[seedwel] could not refresh the push token in Firestore", error);
      }
    }
  } catch (error) {
    console.warn("[seedwel] resumePush failed", error);
  }
}

/* ── Foreground delivery ──────────────────────────────────────────────────── */

interface ForwardedPush {
  title?: string;
  body?: string;
  url?: string;
}

/**
 * Listen for pushes the service worker forwards while this tab is visible
 * and surface them as in-app toasts. Returns an unsubscribe function.
 */
export function startPushListener(): () => void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return () => {};

  const handler = (event: MessageEvent) => {
    const data = event.data as { seedwelPush?: ForwardedPush } | null;
    if (!data || typeof data !== "object" || !("seedwelPush" in data)) return;
    const push = data.seedwelPush ?? {};
    const title = push.title?.trim();
    const body = push.body?.trim();
    if (!title && !body) return;
    toast.raw({
      title: title ?? "Seedwel Office",
      description: body || undefined,
      tone: "info",
      duration: 6000,
      action: push.url
        ? { label: "Open", onClick: () => window.location.assign(push.url as string) }
        : undefined,
    });
  };

  navigator.serviceWorker.addEventListener("message", handler);
  return () => navigator.serviceWorker.removeEventListener("message", handler);
}
