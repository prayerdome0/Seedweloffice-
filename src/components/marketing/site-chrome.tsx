"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Moon, Sun, SunMoon, X } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui";
import { useTheme } from "@/components/providers/theme-provider";
import { useAuth } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";

export const MARKETING_NAV = [
  { href: "/templates", label: "Templates" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { mode, setMode, resolved } = useTheme();
  const { user, ready } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className="sticky top-0 z-50 border-b transition-colors"
      style={{
        borderColor: scrolled ? "var(--border)" : "transparent",
        background: scrolled ? "var(--glass)" : "transparent",
        backdropFilter: scrolled ? "saturate(180%) blur(14px)" : undefined,
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mark.svg" alt="" width={30} height={30} />
          <span className="text-[0.9375rem] font-semibold tracking-tight text-fg">{APP_NAME}</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-[0.8125rem] font-medium transition-colors"
              style={{
                color: pathname === item.href ? "var(--fg)" : "var(--fg-muted)",
                background: pathname === item.href ? "var(--surface-3)" : "transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode(mode === "light" ? "dark" : mode === "dark" ? "system" : "light")}
            className="btn btn-ghost btn-icon btn-sm"
            aria-label={`Theme: ${mode}`}
          >
            {mode === "system" ? <SunMoon size={16} /> : resolved === "dark" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          {ready && user ? (
            <ButtonLink href="/app" variant="brand" size="sm" trailingIcon={<ArrowRight size={14} />}>
              Open workspace
            </ButtonLink>
          ) : (
            <>
              <Link href="/sign-in" className="hidden text-[0.8125rem] font-medium text-fg-muted hover:text-fg sm:block">
                Sign in
              </Link>
              <ButtonLink href="/sign-up" variant="brand" size="sm">
                Start free
              </ButtonLink>
            </>
          )}
          <Button variant="ghost" size="icon" className="btn-sm lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X size={17} /> : <Menu size={17} />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="animate-fade-in border-t lg:hidden" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <nav className="mx-auto grid max-w-6xl gap-1 px-4 py-3">
            {MARKETING_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2.5 text-[0.875rem] font-medium text-fg">
                {item.label}
              </Link>
            ))}
            <Link href="/sign-in" className="rounded-lg px-3 py-2.5 text-[0.875rem] font-medium text-fg-muted">
              Sign in
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mark.svg" alt="" width={28} height={28} />
            <span className="text-[0.9375rem] font-semibold tracking-tight text-fg">{APP_NAME}</span>
          </Link>
          <p className="mt-3 max-w-xs text-[0.8125rem] leading-relaxed text-fg-muted">
            Business documents that win business — built for African SMEs, NGOs, schools and consultants, and fast enough for a phone on
            a slow connection.
          </p>
        </div>

        <FooterColumn
          title="Product"
          links={[
            { href: "/features", label: "Features" },
            { href: "/templates", label: "Template library" },
            { href: "/pricing", label: "Pricing" },
            { href: "/sign-up", label: "Create an account" },
            { href: "/app", label: "Open workspace" },
          ]}
        />
        <FooterColumn
          title="Documents"
          links={[
            { href: "/templates/invoice", label: "Invoices" },
            { href: "/templates/quotation", label: "Quotations" },
            { href: "/templates/receipt", label: "Receipts" },
            { href: "/templates/cv", label: "CVs" },
            { href: "/templates/proposal", label: "Proposals" },
            { href: "/templates/contract", label: "Contracts" },
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            { href: "/about", label: "About us" },
            { href: "/contact", label: "Contact & support" },
            { href: "/legal/privacy", label: "Privacy policy" },
            { href: "/legal/terms", label: "Terms of service" },
            { href: "/legal/cookies", label: "Cookie policy" },
          ]}
        />
      </div>

      <div className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-[0.75rem] text-fg-subtle sm:px-6">
          <span>© {year} Seedwel Office. All rights reserved.</span>
          <span>Made for business owners who care how their documents look.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-fg-subtle">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-[0.8125rem] text-fg-muted transition-colors hover:text-fg">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
