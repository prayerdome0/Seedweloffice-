"use client";

import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import { firebaseConfig, hasFirebaseConfig } from "./config";

/**
 * Lazy Firebase bootstrap.
 *
 * The SDK is imported only inside functions so that a visitor who never signs
 * in never downloads it — important on the low-bandwidth connections this
 * product is built for.
 */

let appPromise: Promise<FirebaseApp> | null = null;

export const getFirebaseApp = async (): Promise<FirebaseApp> => {
  if (!hasFirebaseConfig()) throw new Error("firebase-not-configured");
  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp, getApps, getApp } = await import("firebase/app");
      return getApps().length ? getApp() : initializeApp(firebaseConfig);
    })();
  }
  return appPromise;
};

let authPromise: Promise<Auth> | null = null;

export const getFirebaseAuth = async (): Promise<Auth> => {
  if (!authPromise) {
    authPromise = (async () => {
      const { getAuth } = await import("firebase/auth");
      return getAuth(await getFirebaseApp());
    })();
  }
  return authPromise;
};

export const isFirebaseReady = hasFirebaseConfig;
