"use client";

import { useMemo, useState } from "react";
import { Check, CreditCard, Download, Receipt, Shield, Sparkles, Users } from "lucide-react";
import { Badge, Button, Card, Modal, ProgressBar, SectionHeader, Segmented, StatTile } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useWorkspace } from "@/store/workspace";
import { PLANS } from "@/lib/constants";
import { usageRatio, usageSnapshot } from "@/lib/documents/compute";
import { formatBytes, formatMoney, relativeTime } from "@/lib/utils";

export default function SubscriptionPage() {
  const subscription = useWorkspace((s) => s.subscription);
  const documents = useWorkspace((s) => s.documents);
  const settings = useWorkspace((s) => s.settings);
  const invoices = useWorkspace((s) => s.invoices);
  const updateSubscription = useWorkspace((s) => s.updateSubscription);
  const [interval, setInterval] = useState<"monthly" | "yearly">(subscription.interval);
  const [pending, setPending] = useState<string | null>(null);

  const plan = PLANS.find((p) => p.id === subscription.plan) ?? PLANS[0];
  const storageUsed = useMemo(() => documents.reduce((sum, doc) => sum + JSON.stringify(doc).length, 0), [documents]);
  const snapshot = usageSnapshot(documents, subscription.plan, storageUsed, Number(settings.aiUsed ?? 0));

  const paid = invoices.filter((i) => i.status === "paid");
  const spend = paid.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.375rem] font-semibold tracking-tight text-fg sm:text-[1.5rem]">Plan & billing</h1>
          <p className="mt-1 text-[0.875rem] text-fg-muted">
            You are on the <strong className="font-semibold text-fg">{plan.name}</strong> plan, renewing {relativeTime(subscription.renewsAt)}.
          </p>
        </div>
        <Badge tone={subscription.status === "active" ? "success" : subscription.status === "trialing" ? "gold" : "warning"} dot>
          {subscription.status === "active" ? "Active" : subscription.status === "trialing" ? "Trial" : subscription.status}
        </Badge>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Plan" value={plan.name} hint={`${formatMoney(subscription.amount, subscription.currency)} / ${subscription.interval === "yearly" ? "year" : "month"}`} icon={<CreditCard size={17} />} />
        <StatTile label="Seats" value={`${subscription.seats} of ${plan.seats}`} hint="Team members who can sign in" icon={<Users size={17} />} tone="info" />
        <StatTile label="Documents" value={snapshot.documentsThisMonth} hint={snapshot.documentLimit === "unlimited" ? "Unlimited on this plan" : `of ${snapshot.documentLimit} this month`} icon={<Receipt size={17} />} />
        <StatTile label="Lifetime billed" value={formatMoney(spend, subscription.currency)} hint={`${paid.length} payments recorded`} icon={<Download size={17} />} tone="gold" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <SectionHeader
            title="Usage this period"
            description="Limits reset with every billing period — nothing is lost when you reach one, you simply cannot add more."
            action={
              <Segmented
                value={interval}
                onChange={setInterval}
                size="sm"
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly · save 17%" },
                ]}
              />
            }
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Meter label="Documents" value={snapshot.documentsThisMonth} limit={snapshot.documentLimit} display={snapshot.documentLimit === "unlimited" ? `${snapshot.documentsThisMonth} · unlimited` : `${snapshot.documentsThisMonth} / ${snapshot.documentLimit}`} />
            <Meter label="Storage" value={storageUsed} limit={plan.storageGb * 1024 * 1024 * 1024} display={`${formatBytes(storageUsed)} / ${plan.storageGb} GB`} />
            <Meter label="Assistant credits" value={snapshot.aiCreditsUsed} limit={snapshot.aiCreditLimit} display={`${snapshot.aiCreditsUsed} / ${snapshot.aiCreditLimit}`} />
            <Meter label="Business profiles" value={Math.max(1, new Set(documents.map((d) => d.businessId)).size)} limit={plan.id === "professional" ? 5 : plan.id === "starter" ? 1 : 25} display={`${new Set(documents.map((d) => d.businessId)).size} in use`} />
          </div>

          <div className="mt-5 rounded-xl border p-3.5" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-[0.875rem] font-semibold text-fg">Payment method</div>
                <div className="mt-0.5 text-[0.75rem] text-fg-muted">
                  {subscription.paymentMethod ? `${subscription.paymentMethod.brand} ending ${subscription.paymentMethod.last4} · expires ${subscription.paymentMethod.expiry}` : "No card on file"}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  updateSubscription({ paymentMethod: { brand: "Visa", last4: "4242", expiry: "08/29" } });
                  toast.success("Payment method updated", "Test-mode card 4242 recorded for this workspace.");
                }}
              >
                Update card
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Invoices" description="Every charge on this workspace." />
          <div className="mt-3 space-y-2">
            {invoices.length ? (
              invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between gap-2 rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
                  <div className="min-w-0">
                    <div className="truncate text-[0.8125rem] font-semibold text-fg">{invoice.number}</div>
                    <div className="text-[0.6875rem] text-fg-subtle">
                      {new Date(invoice.date).toLocaleDateString()} · {invoice.plan}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[0.8125rem] font-semibold tabular-nums text-fg">{formatMoney(invoice.amount, invoice.currency)}</div>
                    <Badge tone={invoice.status === "paid" ? "success" : "warning"}>{invoice.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[0.8125rem] text-fg-muted">No invoices yet — your first charge appears here.</p>
            )}
          </div>
          <p className="mt-3 flex items-start gap-2 text-[0.75rem] text-fg-subtle">
            <Shield size={14} className="mt-0.5 shrink-0" />
            Billing runs through a PCI-compliant processor. Seedwel Office never stores card numbers.
          </p>
        </Card>
      </div>

      <section>
        <SectionHeader title="Change plan" description="Switch at any time — your documents, templates and settings are untouched." />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PLANS.map((option) => {
            const current = option.id === subscription.plan;
            const price = interval === "yearly" ? option.yearly : option.monthly;
            return (
              <Card key={option.id} className="flex flex-col p-4" interactive>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[0.9375rem] font-semibold text-fg">{option.name}</h3>
                  {current ? (
                    <Badge tone="success">Current</Badge>
                  ) : option.highlight ? (
                    <Badge tone="brand">Most popular</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-[0.75rem] leading-relaxed text-fg-muted">{option.tagline}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  {price === 0 ? (
                    <span className="text-[1.375rem] font-semibold text-fg">Free</span>
                  ) : (
                    <>
                      <span className="text-[1.375rem] font-semibold text-fg">${price}</span>
                      <span className="text-[0.75rem] text-fg-subtle">/{interval === "yearly" ? "year" : "month"}</span>
                    </>
                  )}
                </div>
                <ul className="mt-3 flex-1 space-y-1.5">
                  {option.features.slice(0, 6).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[0.75rem] text-fg-muted">
                      <Check size={13} style={{ color: "var(--brand)" }} className="mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={current ? "outline" : option.highlight ? "brand" : "outline"}
                  className="mt-4"
                  block
                  disabled={current}
                  onClick={() => setPending(option.id)}
                >
                  {current ? "Current plan" : `Switch to ${option.name}`}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      <Card className="p-4">
        <SectionHeader title="What every plan includes" description="No feature is locked behind a demo — every module and all 144 designs ship in every plan." />
        <div className="mt-3 flex flex-wrap gap-2">
          {["Invoices", "Quotations", "Receipts", "CVs", "Proposals", "Company profiles", "Contracts", "Purchase orders", "Delivery notes", "Certificates", "Cover letters", "Business cards", "Reports"].map((module) => (
            <Badge key={module} tone="neutral">
              {module}
            </Badge>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.8125rem] text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles size={14} style={{ color: "var(--brand)" }} /> AI writing assistant
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Shield size={14} style={{ color: "var(--brand)" }} /> Your data stays yours
          </span>
        </div>
      </Card>

      <Modal
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        title="Confirm plan change"
        description="This demo workspace switches plans instantly so you can see every limit update. Live billing is handled by your payment processor."
        footer={
          <>
            <Button variant="ghost" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={() => {
                const target = PLANS.find((p) => p.id === pending);
                if (!target) return;
                const price = interval === "yearly" ? target.yearly : target.monthly;
                updateSubscription({
                  plan: target.id,
                  amount: price,
                  interval,
                  status: target.monthly === 0 ? "trialing" : "active",
                  renewsAt: Date.now() + (interval === "yearly" ? 365 : 30) * 86_400_000,
                });
                toast.success(`Now on ${target.name}`, `Limits updated immediately.`);
                setPending(null);
              }}
            >
              Confirm switch
            </Button>
          </>
        }
      >
        <p className="text-[0.875rem] text-fg-muted">
          You are moving from <strong className="text-fg">{plan.name}</strong> to <strong className="text-fg">{PLANS.find((p) => p.id === pending)?.name}</strong> on a
          {" "}{interval} basis. Documents and templates are unaffected.
        </p>
      </Modal>
    </div>
  );
}

function Meter({ label, value, limit, display }: { label: string; value: number; limit: number | "unlimited"; display: string }) {
  const ratio = limit === "unlimited" ? 0.05 : usageRatio(value, limit);
  return (
    <div>
      <div className="flex items-center justify-between text-[0.75rem]">
        <span className="text-fg-muted">{label}</span>
        <span className="tabular-nums text-fg">{display}</span>
      </div>
      <div className="mt-1.5">
        <ProgressBar value={ratio} tone={ratio > 0.9 ? "danger" : ratio > 0.75 ? "gold" : "brand"} height={6} />
      </div>
    </div>
  );
}
