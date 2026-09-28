"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AppUser } from "./types";
import { hasFirebaseConfig, resolveDataMode, type DataMode } from "./config";
import { DEMO_USER, buildDemoWorkspace } from "./seed";
import { sleep, uid } from "./utils";

/**
 * Authentication.
 *
 * With Firebase configured this is real email/password + Google sign-in with
 * verification and password reset emails. Without it, accounts are created in
 * this browser so the whole product still works; the UI is explicit about which
 * mode is active and never pretends an email was sent.
 */

const ACCOUNTS_KEY = "seedwel.v1.accounts";
const SESSION_KEY = "seedwel.v1.session";

interface LocalAccount {
  uid: string;
  email: string;
  displayName: string;
  secret: string;
  createdAt: number;
}

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
  signInAsDemo(): Promise<AuthResult>;
  sendReset(email: string): Promise<AuthResult>;
  resendVerification(): Promise<AuthResult>;
  signOut(): Promise<void>;
  updateUser(patch: Partial<AppUser>): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const hash = (value: string): string => {
  // Light obfuscation only — local mode keeps data in the browser and is not a
  // security boundary. Firebase mode performs real credential checks.
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
};

const readAccounts = (): LocalAccount[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(ACCOUNTS_KEY) ?? "[]") as LocalAccount[];
  } catch {
    return [];
  }
};

const writeAccounts = (accounts: LocalAccount[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
};

const readSession = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_KEY);
};

const writeSession = (value: string | null) => {
  if (typeof window === "undefined") return;
  if (value) window.localStorage.setItem(SESSION_KEY, value);
  else window.localStorage.removeItem(SESSION_KEY);
};

const localAccountToUser = (account: LocalAccount): AppUser => {
  const workspace = buildDemoWorkspace(account.uid, account.displayName, account.email);
  const stored = (() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(window.localStorage.getItem(`seedwel.v1.${account.uid}.user`) ?? "null") as AppUser | null;
    } catch {
      return null;
    }
  })();
  return { ...workspace.user, ...(stored ?? {}), uid: account.uid, email: account.email, displayName: account.displayName };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const mode = useMemo(() => resolveDataMode(), []);
  const cloud = useMemo(() => hasFirebaseConfig(), []);
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  const persistUser = useCallback((next: AppUser | null) => {
    setUser(next);
    if (next) writeSession(next.uid);
    else writeSession(null);
  }, []);

  /* Restore session ------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    const bootstrapLocal = () => {
      const session = readSession();
      if (!session || cancelled) return;
      if (session === DEMO_USER.uid) {
        const workspace = buildDemoWorkspace();
        persistUser({ ...workspace.user, email: DEMO_USER.email });
        return;
      }
      const account = readAccounts().find((a) => a.uid === session);
      if (account) persistUser(localAccountToUser(account));
      else writeSession(null);
    };

    (async () => {
      if (!cloud) {
        await sleep(120);
        bootstrapLocal();
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const { getFirebaseAuth } = await import("./firebase-app");
        const { onAuthStateChanged, mapFirebaseUser } = await import("./firebase-auth");
        const auth = await getFirebaseAuth();
        unsubRef.current = onAuthStateChanged(auth, (fbUser) => {
          if (cancelled) return;
          setUser(fbUser ? mapFirebaseUser(fbUser) : null);
          setReady(true);
        });
      } catch (error) {
        console.warn("[seedwel] Firebase auth unavailable, falling back to local accounts", error);
        bootstrapLocal();
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
            persistUser(fb.mapFirebaseUser(credential.user));
            return { ok: false, needsVerification: true, message: "Please verify your email address — we sent you a link when you signed up." };
          }
          persistUser(fb.mapFirebaseUser(credential.user));
          return { ok: true };
        }
        const account = readAccounts().find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
        if (!account) return { ok: false, message: "No account found for that email address in this browser." };
        if (account.secret !== hash(password)) return { ok: false, message: "That password does not match our records." };
        persistUser(localAccountToUser(account));
        return { ok: true };
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
          persistUser(fb.mapFirebaseUser(credential.user));
          return { ok: true, message: "Account created. Check your inbox for a verification link." };
        }
        const accounts = readAccounts();
        if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
          return { ok: false, message: "An account with that email already exists in this browser. Try signing in instead." };
        }
        const account: LocalAccount = { uid: `u_${uid("").slice(-10)}`, email: cleanEmail, displayName: name || cleanEmail.split("@")[0], secret: hash(password), createdAt: Date.now() };
        writeAccounts([...accounts, account]);
        const next = localAccountToUser(account);
        if (company || country) {
          const patched: AppUser = { ...next, jobTitle: next.jobTitle, country: country || next.country };
          if (typeof window !== "undefined") window.localStorage.setItem(`seedwel.v1.${account.uid}.user`, JSON.stringify(patched));
          persistUser(patched);
        } else {
          persistUser(next);
        }
        return { ok: true };
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
          message: "Google sign-in needs a Firebase project. Create the demo workspace below, or connect Firebase keys in your environment.",
        };
      }
      const { getFirebaseAuth } = await import("./firebase-app");
      const fb = await import("./firebase-auth");
      const auth = await getFirebaseAuth();
      const credential = await fb.signInWithGoogle(auth);
      persistUser(fb.mapFirebaseUser(credential.user));
      return { ok: true };
    } catch (error) {
      return { ok: false, message: friendlyAuthError(error) };
    } finally {
      setBusy(false);
    }
  }, [cloud, persistUser]);

  const signInAsDemo = useCallback<AuthContextValue["signInAsDemo"]>(async () => {
    setBusy(true);
    try {
      await sleep(180);
      const workspace = buildDemoWorkspace();
      const existing = readAccounts();
      if (!existing.some((a) => a.uid === DEMO_USER.uid)) {
        writeAccounts([
          ...existing,
          { uid: DEMO_USER.uid, email: DEMO_USER.email, displayName: DEMO_USER.displayName, secret: hash("seedwel-demo"), createdAt: Date.now() },
        ]);
      }
      persistUser(workspace.user);
      return { ok: true };
    } finally {
      setBusy(false);
    }
  }, [persistUser]);

  const sendReset = useCallback<AuthContextValue["sendReset"]>(
    async (email) => {
      if (!cloud) {
        const account = readAccounts().find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
        if (!account) return { ok: false, message: "No account found for that email address in this browser." };
        return {
          ok: false,
          message: "Password reset emails need a connected email service. This workspace stores accounts in this browser — sign in with your password or create a new workspace.",
        };
      }
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
    if (!cloud) return { ok: true, message: "Local workspaces do not require email verification." };
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
        /* ignore — local state still clears */
      }
    }
    persistUser(null);
  }, [cloud, persistUser]);

  const updateUser = useCallback<AuthContextValue["updateUser"]>(
    (patch) => {
      setUser((current) => (current ? { ...current, ...patch } : current));
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, mode, cloud, ready, busy, signIn, signUp, signInWithGoogle, signInAsDemo, sendReset, resendVerification, signOut, updateUser }),
    [user, mode, cloud, ready, busy, signIn, signUp, signInWithGoogle, signInAsDemo, sendReset, resendVerification, signOut, updateUser],
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
