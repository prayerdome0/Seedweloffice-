"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "@/components/ui/toast";
import { Splash } from "@/components/app/splash";
import { WorkspaceSync } from "@/components/app/workspace-sync";

/** Everything the app needs, in the right order. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceSync />
        <Splash />
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
