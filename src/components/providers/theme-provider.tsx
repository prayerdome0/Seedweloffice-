"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ACCENT_KEY, THEME_KEY, accentById, applyAccent, type ThemeMode } from "@/lib/theme";

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: "light" | "dark";
  accent: string;
  accentId: string;
  setMode: (mode: ThemeMode) => void;
  setAccentId: (id: string) => void;
  cycleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");
  const [accentId, setAccentIdState] = useState("seedwel-teal");

  /* Hydrate from storage ------------------------------------------------ */
  useEffect(() => {
    const storedMode = (window.localStorage.getItem(THEME_KEY) as ThemeMode | null) ?? "system";
    const storedAccent = window.localStorage.getItem(ACCENT_KEY) ?? "seedwel-teal";
    setModeState(storedMode);
    setAccentIdState(storedAccent);
    const dark = storedMode === "dark" || (storedMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setResolved(dark ? "dark" : "light");
    applyAccent(accentById(storedAccent).hex, dark);
  }, []);

  /* Follow the system preference when in system mode -------------------- */
  useEffect(() => {
    if (mode !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = query.matches;
      setResolved(dark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", dark);
      applyAccent(accentById(accentId).hex, dark);
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [mode, accentId]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    window.localStorage.setItem(THEME_KEY, next);
    const dark = next === "dark" || (next === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setResolved(dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
    applyAccent(accentById(localStorage.getItem(ACCENT_KEY) ?? "seedwel-teal").hex, dark);
  }, []);

  const setAccentId = useCallback((id: string) => {
    setAccentIdState(id);
    window.localStorage.setItem(ACCENT_KEY, id);
    const dark = document.documentElement.classList.contains("dark");
    applyAccent(accentById(id).hex, dark);
  }, []);

  const cycleMode = useCallback(() => {
    const order: ThemeMode[] = ["light", "dark", "system"];
    setMode(order[(order.indexOf(mode) + 1) % order.length]);
  }, [mode, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolved, accent: accentById(accentId).hex, accentId, setMode, setAccentId, cycleMode }),
    [mode, resolved, accentId, setMode, setAccentId, cycleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
