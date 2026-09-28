"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useWorkspace } from "@/store/workspace";
import { resumePush } from "@/lib/firebase-messaging";

/**
 * Keeps the workspace store and the auth session in step.
 * Hydrates once per signed-in user; clears the store on sign-out.
 */
export function WorkspaceSync() {
  const { user, ready } = useAuth();
  const hydrate = useWorkspace((s) => s.hydrate);
  const unload = useWorkspace((s) => s.unload);
  const status = useWorkspace((s) => s.status);
  const [loadedUid, setLoadedUid] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      if (loadedUid) {
        unload();
        setLoadedUid(null);
      }
      return;
    }
    if (loadedUid === user.uid && status !== "idle") return;
    setLoadedUid(user.uid);
    void hydrate(user);
  }, [ready, user, loadedUid, status, hydrate, unload]);

  // Refresh the device's web-push token once the session is live (no-op
  // unless the user previously opted in on this device).
  useEffect(() => {
    if (!user || status !== "ready") return;
    void resumePush(user.uid);
  }, [user, status]);

  return null;
}
