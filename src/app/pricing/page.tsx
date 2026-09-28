import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Info, Minus, ShieldCheck } from "lucide-react";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { PLANS } from "@/lib/constants";
import { totalTemplateCount } from "@/templates";

export const metadata: Metadata = {
  title: "Pricing — free to start, paid by volume",
  description:
    "Seedwel Office pricing: a free tier with 20 documents a month, then Starter, Professional, Business and Enterprise. Every plan includes all thirteen modules and all designs.",
  alternates: { canonical: "/pricing" },
};

const COMPARISON: { label: string; values: (string | boolean)[] }[] = [
  { label: "Documents per month", values: PLANS.map((plan) => (plan.documents === "unlimited" ? "Unlimited" : String(plan.documents))) },
  { label: "All 13 document modules", values: PLANS.map(() => true) },
  { label: `All ${totalTemplateCount} designs, no watermark`, values: PLANS.map(() => true) },
  { label: "PDF, Word, print, download & share links", values: PLANS.map(() => true) },
  { label: "Business profiles", values: ["1", "1", "5", "25", "Unlimited"] },
  { label: "Team seats", values: PLANS.map((plan) => String(plan.seats)) },
  { label: "Storage for logos, stamps & signatures", values: PLANS.map((plan) => `${plan.storageGb} GB`) },
  { label: "AI writing credits per month", values: PLANS.map((plan) => (plan.aiCredits === 0 ? false : String(plan.aiCredits))) },
  { label: "Custom colours, fonts & watermarks", values: [false, true, true, true, true] },
  { label: "Recurring invoices & reminders", values: [false, false, true, true, true] },
  { label: "Shared brand kits & approval workflow", values: [false, false, false, true, true] },
  { label: "Audit log & data retention controls", values: [false, false, false, true, true] },
  { label: "Support", values: ["Community", "Email, 1 working day", "Priority, same day", "Dedicated manager", "Dedicated manager + SLA"] },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="border-b" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h1 className="max-w-3xl text-[1.875rem] font-semibold leading-tight tracking-tight text-fg sm:text-[2.5rem]">
            Pay for volume and seats — never for templates
          </h1>
          <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-fg-muted">
            Every plan, including the free one, unlocks all thirteen modules and all {totalTemplateCount} designs. Prices are in US
            dollars; local-currency billing is available on request. VAT or withholding tax may apply where required by law.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-5">
          {PLANS.map((plan) => (
            <Card key={plan.id} className="flex flex-col p-5" interactive>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[1rem] font-semibold text-fg">{plan.name}</h2>
                {plan.highlight ? <Badge tone="brand">Most popular</Badge> : null}
              </div>
              <p className="mt-1.5 min-h-[3rem] text-[0.75rem] leading-relaxed text-fg-muted">{plan.tagline}</p>
              <div className="mt-3 flex items-baseline gap-1">
                {plan.monthly === 0 ? (
                  <span className="text-[1.75rem] font-semibold text-fg">Free</span>
                ) : (
                  <>
                    <span className="text-[1.75rem] font-semibold text-fg">${plan.monthly}</span>
                    <span className="text-[0.75rem] text-fg-subtle">/month</span>
                  </>
                )}
              </div>
              {plan.monthly > 0 ? (
                <p className="mt-1 text-[0.6875rem] text-fg-subtle">
                  or ${plan.yearly} billed yearly — two months free
                </p>
              ) : (
                <p className="mt-1 text-[0.6875rem] text-fg-subtle">No card, no trial clock</p>
              )}
              <ul className="mt-4 flex-1 space-y-1.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[0.75rem] leading-relaxed text-fg-muted">
                    <Check size={13} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
                    {feature}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/sign-up" variant={plan.highlight ? "brand" : "outline"} className="mt-5" block trailingIcon={<ArrowRight size={14} />}>
                {plan.monthly === 0 ? "Start free" : `Choose ${plan.name}`}
              </ButtonLink>
            </Card>
          ))}
        </div>

        <Card className="mt-6 flex flex-wrap items-start gap-3 p-4" as="section">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--surface-3)", color: "var(--brand)" }}>
            <Info size={17} />
          </span>
          <div className="min-w-0 flex-1 text-[0.8125rem] leading-relaxed text-fg-muted">
            <strong className="text-fg">How billing works today.</strong> You can create a free workspace immediately and use every module
            at the free limits. Paid plans are switched from the subscription page inside your workspace, where the price, interval and
            resulting limits are shown before you confirm. Live card checkout runs through a PCI-compliant processor and is enabled once a
            payment account is connected for your workspace — until then no card details are ever requested or stored by Seedwel Office.
          </div>
        </Card>
      </section>

      <section className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="text-[1.25rem] font-semibold tracking-tight text-fg">Full comparison</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-[0.8125rem]">
              <thead>
                <tr>
                  <th className="border-b px-3 py-2.5 text-left font-semibold text-fg-muted" style={{ borderColor: "var(--border)" }}>
                    Feature
                  </th>
                  {PLANS.map((plan) => (
                    <th key={plan.id} className="border-b px-3 py-2.5 text-center font-semibold text-fg" style={{ borderColor: "var(--border)" }}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.label}>
                    <td className="border-b px-3 py-2.5 text-fg-muted" style={{ borderColor: "var(--border)" }}>
                      {row.label}
                    </td>
                    {row.values.map((value, index) => (
                      <td key={`${row.label}-${index}`} className="border-b px-3 py-2.5 text-center text-fg" style={{ borderColor: "var(--border)" }}>
                        {value === true ? (
                          <Check size={15} className="mx-auto" style={{ color: "var(--brand)" }} />
                        ) : value === false ? (
                          <Minus size={15} className="mx-auto text-fg-subtle" />
                        ) : (
                          <span className="tabular-nums">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              { q: "What counts as a document?", a: "Anything you create and can export: an invoice, a CV, a contract, a business card. Drafts you delete within 24 hours do not count against your monthly limit." },
              { q: "Can I downgrade?", a: "Yes. Plan changes take effect immediately from the subscription page, and you keep every document you have already created — only new-document limits change." },
              { q: "Do you offer NGO or education pricing?", a: "Yes. Registered non-profits, schools and churches qualify for a discount — write to support from your organisation address and we will apply it." },
              { q: "Is there a contract?", a: "No lock-in on monthly plans. Yearly plans are paid up front and can be cancelled at renewal, with export available at any time." },
              { q: "What happens if I stop paying?", a: "Your workspace moves to the free limits. Nothing is deleted, and your documents remain exportable." },
              { q: "Do you offer local currency billing?", a: "Where a payment processor supports it, yes — including ZMW, ZAR, NGN, KES and GHS." },
            ].map((item) => (
              <Card key={item.q} className="p-4">
                <h3 className="text-[0.875rem] font-semibold text-fg">{item.q}</h3>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-fg-muted">{item.a}</p>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="inline-flex items-center gap-2 text-[0.8125rem] text-fg-muted">
              <ShieldCheck size={15} style={{ color: "var(--brand)" }} /> No card required to start · cancel or export at any time
            </p>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/sign-up" variant="brand" trailingIcon={<ArrowRight size={15} />}>
                Start free
              </ButtonLink>
              <Link href="/contact" className="btn btn-outline">
                Ask a question
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
