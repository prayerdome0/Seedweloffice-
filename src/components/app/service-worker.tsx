"use client";

import { useEffect } from "react";
import { startPushListener } from "@/lib/firebase-messaging";

/**
 * Registers the PWA service worker so the app installs on Android, iOS and
 * desktop, and so the shell (fonts, icons, brand marks) loads instantly on
 * repeat visits — important on metered connections.
 *
 * Also keeps the foreground Web Push listener alive: pushes that arrive
 * while this tab is visible are forwarded by the worker and toasted here.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const stopPushListener = startPushListener();

    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      return stopPushListener;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline shell is a bonus, never a blocker */
      });
    };

    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      window.removeEventListener("load", register);
      stopPushListener();
    };
  }, []);

  return null;
}
