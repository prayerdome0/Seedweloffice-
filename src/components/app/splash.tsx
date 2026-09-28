"use client";

import { useEffect, useState } from "react";
import { APP_NAME } from "@/lib/config";

/**
 * First-paint splash. Shown once per browser session, skipped entirely when the
 * visitor prefers reduced motion, and never blocks interaction for more than
 * about a second.
 */
export function Splash() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = window.sessionStorage.getItem("seedwel.splash");
    if (reduced || seen) return;
    setVisible(true);
    const hide = window.setTimeout(() => setLeaving(true), 1050);
    const remove = window.setTimeout(() => {
      setVisible(false);
      window.sessionStorage.setItem("seedwel.splash", "1");
    }, 1500);
    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(remove);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 transition-opacity duration-500"
      style={{
        background: "linear-gradient(160deg, #071022 0%, #0b1a33 55%, #0e2c3f 100%)",
        opacity: leaving ? 0 : 1,
        pointerEvents: leaving ? "none" : "auto",
      }}
      aria-hidden={leaving}
    >
      <div className="animate-scale-in flex flex-col items-center gap-5">
        <div className="relative h-20 w-20">
          <span className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(135deg, #17b3af, #0e908f)" }} />
          <span className="absolute inset-0 rounded-3xl opacity-60 animate-pulse-soft" style={{ boxShadow: "0 0 0 16px rgba(23,179,175,0.12)" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mark-mono-white.svg" alt="" className="relative h-20 w-20 p-4" />
        </div>
        <div className="text-center">
          <div className="text-[1.0625rem] font-semibold tracking-tight text-white">{APP_NAME}</div>
          <div className="mt-1 text-[0.75rem] uppercase tracking-[0.28em] text-white/50">Documents that win business</div>
        </div>
      </div>
      <div className="h-0.5 w-40 overflow-hidden rounded-full bg-white/15">
        <div className="h-full w-1/2 rounded-full" style={{ background: "linear-gradient(90deg, transparent, #38d0c9, transparent)", animation: "shimmer 1.4s infinite" }} />
      </div>
    </div>
  );
}
