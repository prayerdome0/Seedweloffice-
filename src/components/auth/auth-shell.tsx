"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, BadgeCheck, Check, ShieldCheck, Sparkles } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";
import { useTheme } from "@/components/providers/theme-provider";
import { Moon, Sun, SunMoon } from "lucide-react";

/** Shared frame for the sign-in, sign-up and reset screens. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  highlights,
}: {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  highlights?: string[];
}) {
  const { mode, setMode, resolved } = useTheme();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr]" style={{ background: "var(--canvas)" }}>
      {/* Brand panel -------------------------------------------------- */}
      <aside className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex" style={{ background: "linear-gradient(155deg, #071022 0%, #0b1a33 45%, #0d2c3c 100%)" }}>
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30" style={{ background: "radial-gradient(circle, #38d0c9, transparent 70%)" }} />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #f0a90e, transparent 70%)" }} />

        <Link href="/" className="relative flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mark-mono-white.svg" alt="" width={34} height={34} />
          <span className="text-[1rem] font-semibold tracking-tight text-white">{APP_NAME}</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-white">
            {APP_TAGLINE}
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/60">
            Invoices, quotations, receipts, CVs, proposals, contracts and more — 180 designs, thirteen modules, one workspace that
            looks like your business means it.
          </p>
          <ul className="mt-7 space-y-3">
            {(highlights ?? [
              "180 professional designs across 13 modules",
              "PDF, Word, print and share links in one tap",
              "AI drafting that works without an internet round-trip",
              "Multi-business profiles with logos, stamps and signatures",
            ]).map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[0.875rem] text-white/75">
                <Check size={16} className="mt-0.5 shrink-0" style={{ color: "#71e6dd" }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-6 text-[0.75rem] text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} /> Private by default
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles size={14} /> Local-first drafting
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BadgeCheck size={14} /> No card to start
          </span>
        </div>
      </aside>

      {/* Form panel --------------------------------------------------- */}
      <main className="flex min-h-screen flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-[0.8125rem] font-medium text-fg-muted hover:text-fg">
            <ArrowLeft size={15} /> Back to site
          </Link>
          <button
            type="button"
            onClick={() => setMode(mode === "light" ? "dark" : mode === "dark" ? "system" : "light")}
            className="btn btn-ghost btn-icon btn-sm"
            aria-label={`Theme: ${mode}`}
          >
            {mode === "system" ? <SunMoon size={16} /> : resolved === "dark" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-[420px]">
            <div className="mb-6 flex items-center gap-2.5 lg:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/mark.svg" alt="" width={32} height={32} />
              <span className="text-[1rem] font-semibold tracking-tight text-fg">{APP_NAME}</span>
            </div>
            <h1 className="text-[1.5rem] font-semibold tracking-tight text-fg">{title}</h1>
            <p className="mt-1.5 text-[0.875rem] leading-relaxed text-fg-muted">{subtitle}</p>
            <div className="mt-6">{children}</div>
            {footer ? <div className="mt-5 text-center text-[0.8125rem] text-fg-muted">{footer}</div> : null}
          </div>
        </div>

        <p className="text-center text-[0.6875rem] text-fg-subtle">
          © {new Date().getFullYear()} {APP_NAME} ·{" "}
          <Link href="/legal/privacy" className="underline decoration-from-font underline-offset-2">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/legal/terms" className="underline decoration-from-font underline-offset-2">
            Terms
          </Link>
        </p>
      </main>
    </div>
  );
}
