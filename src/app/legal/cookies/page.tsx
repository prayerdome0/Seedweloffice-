import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Cookie and storage policy",
  description: "What Seedwel Office stores in your browser: theme preferences, drafts, session state — and what it does not store.",
  alternates: { canonical: "/legal/cookies" },
};

const ROWS = [
  {
    name: "seedwel-theme",
    type: "Browser storage",
    purpose: "Remembers whether you chose light, dark or system, so the app does not flash the wrong colours on load.",
    optional: "No — required for correct theming",
  },
  {
    name: "seedwel-workspace",
    type: "Browser storage",
    purpose: "Holds your local workspace: documents, business profiles, clients, templates defaults, activity and settings when no cloud project is connected.",
    optional: "No — this is your data in local mode",
  },
  {
    name: "seedwel-session",
    type: "Browser storage",
    purpose: "Keeps you signed in between page loads when cloud authentication is enabled.",
    optional: "No — required to stay signed in",
  },
  {
    name: "Service worker cache",
    type: "Browser cache",
    purpose: "Stores the app shell and fonts so the workspace opens when you are offline or on a slow connection.",
    optional: "No — required for offline use",
  },
  {
    name: "Firebase session tokens",
    type: "First-party cookie / storage",
    purpose: "Set by Firebase Authentication only when a cloud project is connected, to keep authenticated requests valid.",
    optional: "Only present when cloud sync is configured",
  },
  {
    name: "Payment processor cookies",
    type: "Third-party cookies",
    purpose: "Set by the payment processor during card checkout, for fraud prevention and payment completion. Not present until a processor is connected and you begin a checkout.",
    optional: "Only during payment flows",
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Badge tone="neutral">Legal</Badge>
        <h1 className="mt-4 text-[1.875rem] font-semibold tracking-tight text-fg sm:text-[2.25rem]">Cookie and storage policy</h1>
        <p className="mt-2 text-[0.8125rem] text-fg-subtle">Last updated 27 September 2026</p>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-fg-muted">
          Seedwel Office runs no advertising or cross-site tracking scripts. Everything we store in your browser is either required for the
          product to work or keeps your data available to you in local mode. This page lists it precisely.
        </p>

        <Card className="mt-6 overflow-hidden">
          <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-[1rem] font-semibold text-fg">What is stored in your browser</h2>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {ROWS.map((row) => (
              <div key={row.name} className="px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[0.75rem] font-semibold text-fg">{row.name}</span>
                  <Badge tone="neutral">{row.type}</Badge>
                </div>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-fg-muted">{row.purpose}</p>
                <p className="mt-1 text-[0.75rem] text-fg-subtle">{row.optional}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-4 p-5">
          <h2 className="text-[1rem] font-semibold text-fg">Managing or clearing these</h2>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-fg-muted">
            You can clear everything from inside the product, which is the safe route because it removes records in the right order: open{" "}
            <strong className="text-fg">Settings → Data controls</strong> and choose to clear the activity log, reset settings, or delete the
            entire workspace. Export a JSON backup first if you want to keep your documents.
          </p>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-fg-muted">
            Clearing your browser's site data achieves the same result but without the warnings, so exported backups are your responsibility in
            that case.
          </p>
        </Card>

        <Card className="mt-4 p-5">
          <h2 className="text-[1rem] font-semibold text-fg">Questions</h2>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-fg-muted">
            Write to <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[var(--brand)]">{SUPPORT_EMAIL}</a> if something appears
            to be stored that is not listed here. See also the <Link href="/legal/privacy" className="font-semibold text-[var(--brand)]">privacy policy</Link>.
          </p>
        </Card>
      </section>
      <SiteFooter />
    </div>
  );
}
