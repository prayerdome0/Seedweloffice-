"use client";

import { useEffect } from "react";

/**
 * Registers the PWA service worker so the app installs on Android, iOS and
 * desktop, and so the shell (fonts, icons, brand marks) loads instantly on
 * repeat visits — important on metered connections.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline shell is a bonus, never a blocker */
      });
    };

    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
