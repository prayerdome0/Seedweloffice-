"use client";

import type { Auth, User } from "firebase/auth";
import type { AppUser } from "./types";

/**
 * Thin, typed wrappers around the Firebase Auth SDK. Kept separate from the
 * React provider so the SDK is loaded only when a cloud project is configured.
 */

export const signIn = async (auth: Auth, email: string, password: string) => {
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (auth: Auth, email: string, password: string, name: string, extra: { company: string; country: string }) => {
  const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(credential.user, { displayName: name });
  return credential;
};

export const signInWithGoogle = async (auth: Auth) => {
  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
};

export const sendReset = async (auth: Auth, email: string) => {
  const { sendPasswordResetEmail } = await import("firebase/auth");
  return sendPasswordResetEmail(auth, email);
};

export const sendVerification = async (auth: Auth) => {
  const { sendEmailVerification } = await import("firebase/auth");
  if (!auth.currentUser) return;
  const { APP_NAME, APP_URL } = await import("./config");
  return sendEmailVerification(auth.currentUser, {
    url: `${APP_URL}/app`,
    handleCodeInApp: false,
  }).catch(() => sendEmailVerification(auth.currentUser!));
};

export const signOut = async (auth: Auth) => {
  const { signOut: fbSignOut } = await import("firebase/auth");
  return fbSignOut(auth);
};

export const onAuthStateChanged = (auth: Auth, callback: (user: User | null) => void) => {
  let unsubscribe: (() => void) | null = null;
  let active = true;
  import("firebase/auth").then(({ onAuthStateChanged: watch }) => {
    if (!active) return;
    unsubscribe = watch(auth, callback);
  });
  return () => {
    active = false;
    unsubscribe?.();
  };
};

export const mapFirebaseUser = (user: User): AppUser => ({
  uid: user.uid,
  email: user.email ?? "",
  displayName: user.displayName ?? (user.email ? user.email.split("@")[0] : "Seedwel user"),
  photoURL: user.photoURL ?? undefined,
  country: "Zambia",
  timezone: "Africa/Lusaka",
  language: "en",
  emailVerified: user.emailVerified,
  provider: user.providerData[0]?.providerId === "google.com" ? "google" : "password",
  createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now(),
  lastLoginAt: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : Date.now(),
});
