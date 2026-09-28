"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AppUser } from "./types";
import { hasFirebaseConfig, resolveDataMode, type DataMode } from "./config";

/**
 * Authentication.
 *
 * Firebase Authentication is required for email/password and Google sign-in.
 */

export interface AuthResult {
  ok: boolean;
  message?: string;
  /** Set when the account exists but the address has not been verified. */
  needsVerification?: boolean;
}

export interface AuthContextValue {
  user: AppUser | null;
  mode: DataMode;
  cloud: boolean;
  ready: boolean;
  busy: boolean;
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(input: { name: string; email: string; password: string; company?: string; country?: string }): Promise<AuthResult>;
  signInWithGoogle(): Promise<AuthResult>;
  sendReset(email: string): Promise<AuthResult>;
  resendVerification(): Promise<AuthResult>;
  signOut(): Promise<void>;
  updateUser(patch: Partial<AppUser>): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Roles come only from the top-level Firestore profile. Never use a workspace
// copy or a client-side update as an authorization source.
async function resolveCloudUser(fbUser: import("firebase/auth").User): Promise<AppUser> {
  const { mapFirebaseUser } = await import("./firebase-auth");
  const { getFirebaseApp } = await import("./firebase-app");
  const { getFirestore, doc, getDoc, setDoc } = await import("firebase/firestore");
  const db = getFirestore(await getFirebaseApp());
  const ref = doc(db, "users", fbUser.uid);
  const profile = await getDoc(ref);
  if (!profile.exists()) {
    await setDoc(ref, { name: fbUser.displayName ?? "", email: fbUser.email ?? "", role: "user", createdAt: Date.now(), lastLoginAt: Date.now() });
  } else {
    await setDoc(ref, { lastLoginAt: Date.now() }, { merge: true });
  }
  return { ...mapFirebaseUser(fbUser), role: profile.data()?.role === "admin" ? "admin" : "user" };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const mode = useMemo(() => resolveDataMode(), []);
  const cloud = useMemo(() => hasFirebaseConfig(), []);
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  const persistUser = useCallback((next: AppUser | null) => {
    setUser(next);

  }, []);

  /* Restore session ------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!cloud) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const { getFirebaseAuth } = await import("./firebase-app");
        const { onAuthStateChanged } = await import("./firebase-auth");
        const auth = await getFirebaseAuth();
        unsubRef.current = onAuthStateChanged(auth, (fbUser) => {
          if (cancelled) return;
          if (!fbUser) { setUser(null); setReady(true); return; }
          setReady(false);
          void resolveCloudUser(fbUser).then((profile) => {
            if (!cancelled) setUser(profile);
          }).catch((error) => {
            console.warn("[seedwel] Could not load account role", error);
            if (!cancelled) setUser(null);
          }).finally(() => { if (!cancelled) setReady(true); });
        });
      } catch (error) {
        console.warn("[seedwel] Firebase authentication unavailable", error);
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
      unsubRef.current?.();
    };
  }, [cloud, persistUser]);

  /* Actions --------------------------------------------------------------- */

  const signIn = useCallback<AuthContextValue["signIn"]>(
    async (email, password) => {
      setBusy(true);
      try {
        if (cloud) {
          const { getFirebaseAuth } = await import("./firebase-app");
          const fb = await import("./firebase-auth");
          const auth = await getFirebaseAuth();
          const credential = await fb.signIn(auth, email.trim(), password);
          if (!credential.user.emailVerified) {
            persistUser(await resolveCloudUser(credential.user));
            return { ok: false, needsVerification: true, message: "Please verify your email address — we sent you a link when you signed up." };
          }
          persistUser(await resolveCloudUser(credential.user));
          return { ok: true };
        }
        return { ok: false, message: "Service unavailable. Firebase must be configured before signing in." };
      } catch (error) {
        return { ok: false, message: friendlyAuthError(error) };
      } finally {
        setBusy(false);
      }
    },
    [cloud, persistUser],
  );

  const signUp = useCallback<AuthContextValue["signUp"]>(
    async ({ name, email, password, company, country }) => {
      setBusy(true);
      try {
        const cleanEmail = email.trim().toLowerCase();
        if (cloud) {
          const { getFirebaseAuth } = await import("./firebase-app");
          const fb = await import("./firebase-auth");
          const auth = await getFirebaseAuth();
          const credential = await fb.signUp(auth, cleanEmail, password, name, { company: company ?? "", country: country ?? "" });
          await fb.sendVerification(auth);
          persistUser(await resolveCloudUser(credential.user));
          return { ok: true, message: "Account created. Check your inbox for a verification link." };
        }
        return { ok: false, message: "Service unavailable. Firebase must be configured before creating accounts." };
      } catch (error) {
        return { ok: false, message: friendlyAuthError(error) };
      } finally {
        setBusy(false);
      }
    },
    [cloud, persistUser],
  );

  const signInWithGoogle = useCallback<AuthContextValue["signInWithGoogle"]>(async () => {
    setBusy(true);
    try {
      if (!cloud) {
        return {
          ok: false,
          message: "Google sign-in requires Firebase configuration.",
        };
      }
      const { getFirebaseAuth } = await import("./firebase-app");
      const fb = await import("./firebase-auth");
      const auth = await getFirebaseAuth();
      const credential = await fb.signInWithGoogle(auth);
      persistUser(await resolveCloudUser(credential.user));
      return { ok: true };
    } catch (error) {
      return { ok: false, message: friendlyAuthError(error) };
    } finally {
      setBusy(false);
    }
  }, [cloud, persistUser]);

  const sendReset = useCallback<AuthContextValue["sendReset"]>(
    async (email) => {
      if (!cloud) return { ok: false, message: "Firebase is not configured." };
      try {
        const { getFirebaseAuth } = await import("./firebase-app");
        const fb = await import("./firebase-auth");
        const auth = await getFirebaseAuth();
        await fb.sendReset(auth, email.trim());
        return { ok: true, message: `If ${email} matches an account, a reset link is on its way.` };
      } catch (error) {
        return { ok: false, message: friendlyAuthError(error) };
      }
    },
    [cloud],
  );

  const resendVerification = useCallback<AuthContextValue["resendVerification"]>(async () => {
    if (!cloud) return { ok: false, message: "Firebase is not configured." };
    try {
      const { getFirebaseAuth } = await import("./firebase-app");
      const fb = await import("./firebase-auth");
      const auth = await getFirebaseAuth();
      await fb.sendVerification(auth);
      return { ok: true, message: "Verification email sent." };
    } catch (error) {
      return { ok: false, message: friendlyAuthError(error) };
    }
  }, [cloud]);

  const signOut = useCallback(async () => {
    if (cloud) {
      try {
        const { getFirebaseAuth } = await import("./firebase-app");
        const fb = await import("./firebase-auth");
        await fb.signOut(await getFirebaseAuth());
      } catch {
        /* The local session is cleared even if the network is unavailable. */
      }
    }
    persistUser(null);
  }, [cloud, persistUser]);

  const updateUser = useCallback<AuthContextValue["updateUser"]>(
    (patch) => {
      setUser((current) => (current ? { ...current, ...patch, role: current.role } : current));
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, mode, cloud, ready, busy, signIn, signUp, signInWithGoogle, sendReset, resendVerification, signOut, updateUser }),
    [user, mode, cloud, ready, busy, signIn, signUp, signInWithGoogle, sendReset, resendVerification, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

const friendlyAuthError = (error: unknown): string => {
  const code = (error as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email and password combination did not work.";
    case "auth/email-already-in-use":
      return "An account already exists with that email address.";
    case "auth/weak-password":
      return "Choose a password with at least eight characters.";
    case "auth/invalid-email":
      return "That email address does not look right.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a minute and try again.";
    case "auth/popup-closed-by-user":
      return "The Google sign-in window was closed before finishing.";
    case "auth/network-request-failed":
      return "Network problem — check your connection and try again.";
    default:
      return (error as { message?: string })?.message ?? "Something went wrong. Please try again.";
  }
};
