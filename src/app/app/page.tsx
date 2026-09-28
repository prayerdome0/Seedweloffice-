"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight, BadgeCheck, Banknote, Clock, FileStack, FileText, HardDrive, Plus, Sparkles, Star, Wallet, Zap,
} from "lucide-react";
import { Badge, Button, ButtonLink, Card, EmptyState, ProgressBar, SectionHeader, StatTile } from "@/components/ui";
import { DocumentCard, DocumentRow } from "@/components/app/document-card";
import { QuickCreate } from "@/components/app/quick-create";
import { useAuth } from "@/lib/auth";
import { useWorkspace } from "@/store/workspace";
import { DOC_KINDS, docKindMeta, STATUS_META } from "@/lib/constants";
import { computeTotals, usageRatio, usageSnapshot } from "@/lib/documents/compute";
import { documentRevenue } from "@/lib/seed";
import { formatBytes, formatMoney, greeting, relativeTime, truncate } from "@/lib/utils";
import { TEMPLATES, totalTemplateCount } from "@/templates";
import { PLANS } from "@/lib/constants";

export default function DashboardPage() {
  const { user, cloud } = useAuth();
  const documents = useWorkspace((s) => s.documents);
  const businesses = useWorkspace((s) => s.businesses);
  const activity = useWorkspace((s) => s.activity);
  const subscription = useWorkspace((s) => s.subscription);
  const settings = useWorkspace((s) => s.settings);
  const [quick, setQuick] = useState(false);

  const active = useMemo(() => documents.filter((d) => !d.archived), [documents]);
  const recent = useMemo(() => [...active].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6), [active]);
  const starred = useMemo(() => active.filter((d) => d.starred).slice(0, 4), [active]);
  const revenue = useMemo(() => documentRevenue(active), [active]);
  const storageUsed = useMemo(() => active.reduce((sum, d) => sum + JSON.stringify(d).length, 0), [active]);
  const usage = useMemo(() => usageSnapshot(active, subscription.plan, storageUsed, Number(settings.aiUsed ?? 0)), [active, subscription.plan, storageUsed, settings.aiUsed]);
  const overdue = useMemo(
    () => active.filter((d) => d.kind === "invoice" && d.status === "overdue"),
    [active],
  );
  const drafts = useMemo(() => active.filter((d) => d.status === "draft"), [active]);
  const plan = PLANS.find((p) => p.id === subscription.plan) ?? PLANS[0];
  const currency = businesses.find((b) => b.isDefault)?.currency ?? businesses[0]?.currency ?? "ZMW";

  const kindBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const doc of active) map.set(doc.kind, (map.get(doc.kind) ?? 0) + 1);
    return DOC_KINDS.map((kind) => ({ ...kind, count: map.get(kind.kind) ?? 0 }))
      .filter((kind) => kind.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [active]);

  const setupSteps = [
    { label: "Add your business profile", done: businesses.length > 0, href: "/app/businesses" },
    { label: "Create your first document", done: active.length > 0, href: "/app/documents" },
    { label: "Upload your logo and signature", done: businesses.some((b) => b.logoDataUrl || b.signatureDataUrl), href: "/app/businesses" },
    { label: "Try the writing assistant", done: activity.some((a) => a.action === "ai.generated"), href: "/app/assist" },
    { label: "Connect cloud sync", done: cloud, href: "/app/settings#sync" },
  ];
  const setupDone = setupSteps.filter((s) => s.done).length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.375rem] font-semibold tracking-tight text-fg sm:text-[1.625rem]">
            {greeting()}, {user?.displayName?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mt-1 text-[0.875rem] text-fg-muted">
            {active.length
              ? `You have ${active.length} document${active.length === 1 ? "" : "s"} in play, ${drafts.length} still in draft.`
              : "Let's get your first document out the door."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ButtonLink href="/app/templates" variant="outline" size="sm" icon={<FileStack size={15} />}>
            Browse {totalTemplateCount} templates
          </ButtonLink>
          <Button variant="brand" onClick={() => setQuick(true)} icon={<Plus size={16} />}>
            New document
          </Button>
        </div>
      </header>

      {setupDone < setupSteps.length ? (
        <Card className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Zap size={16} style={{ color: "var(--gold)" }} />
                <h2 className="text-[0.9375rem] font-semibold text-fg">Finish setting up your workspace</h2>
              </div>
              <p className="mt-1 text-[0.8125rem] text-fg-muted">{setupDone} of {setupSteps.length} complete — takes about two minutes.</p>
            </div>
            <div className="w-full max-w-xs">
              <ProgressBar value={setupDone / setupSteps.length} tone="gold" />
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {setupSteps.map((step) => (
              <Link
                key={step.label}
                href={step.href}
                className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[0.8125rem] transition-colors hover:border-[var(--border-strong)]"
                style={{ borderColor: "var(--border)", background: step.done ? "var(--surface-2)" : "var(--surface)" }}
              >
                <span
                  className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border text-[0.625rem] font-bold"
                  style={{
                    width: 18,
                    height: 18,
                    background: step.done ? "var(--brand)" : "transparent",
                    borderColor: step.done ? "var(--brand)" : "var(--border-strong)",
                    color: "#fff",
                  }}
                >
                  {step.done ? "✓" : ""}
                </span>
                <span className={step.done ? "text-fg-muted line-through" : "font-medium text-fg"}>{step.label}</span>
                <ArrowRight size={13} className="ml-auto shrink-0 text-fg-subtle" />
              </Link>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Invoiced" value={formatMoney(revenue.invoiced, currency)} hint="Across all invoices" icon={<Banknote size={17} />} tone="brand" />
        <StatTile label="Collected" value={formatMoney(revenue.collected, currency)} hint={`${revenue.invoiced ? Math.round((revenue.collected / revenue.invoiced) * 100) : 0}% of invoiced value`} icon={<Wallet size={17} />} tone="success" />
        <StatTile label="Outstanding" value={formatMoney(revenue.outstanding, currency)} hint={overdue.length ? `${overdue.length} invoice${overdue.length === 1 ? "" : "s"} overdue` : "Nothing overdue"} icon={<Clock size={17} />} tone={overdue.length ? "danger" : "neutral"} />
        <StatTile label="Documents" value={active.length} hint={`${drafts.length} draft · ${starred.length} starred`} icon={<FileText size={17} />} tone="info" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-b px-4 py-3.5" style={{ borderColor: "var(--border)" }}>
            <SectionHeader
              title="Recent documents"
              description="Everything you touched most recently, across every module."
              action={<ButtonLink href="/app/documents" variant="ghost" size="sm" trailingIcon={<ArrowRight size={14} />}>View all</ButtonLink>}
            />
          </div>
          {recent.length ? (
            <div className="hidden sm:block">
              {recent.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} />
              ))}
            </div>
          ) : null}
          <div className={recent.length ? "space-y-3 p-3 sm:hidden" : "p-3"}>
            {recent.length ? (
              recent.slice(0, 4).map((doc) => <DocumentCard key={doc.id} doc={doc} compact />)
            ) : (
              <EmptyState
                icon={<FileText size={20} />}
                title="No documents yet"
                description="Start with an invoice, a quotation or a CV — every module comes with ready-made designs."
                action={<Button variant="brand" onClick={() => setQuick(true)} icon={<Plus size={16} />}>Create your first document</Button>}
                compact
              />
            )}
          </div>
        </Card>

        <div className="space-y-3">
          <Card className="p-4">
            <SectionHeader title="Plan & storage" description={`${plan.name} · ${formatMoney(subscription.amount, subscription.currency)}/${subscription.interval === "yearly" ? "yr" : "mo"}`} />
            <div className="mt-4 space-y-3.5">
              <MeterRow
                label="Documents this month"
                value={usage.documentsThisMonth}
                limit={usage.documentLimit}
                display={usage.documentLimit === "unlimited" ? `${usage.documentsThisMonth} · unlimited` : `${usage.documentsThisMonth} / ${usage.documentLimit}`}
              />
              <MeterRow
                label="Storage"
                value={usage.storageUsed}
                limit={usage.storageLimit}
                display={`${formatBytes(usage.storageUsed)} of ${formatBytes(usage.storageLimit)}`}
              />
              <MeterRow
                label="Assistant credits"
                value={usage.aiCreditsUsed}
                limit={usage.aiCreditLimit}
                display={`${usage.aiCreditsUsed} / ${usage.aiCreditLimit}`}
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <Badge tone={subscription.status === "active" ? "success" : subscription.status === "trialing" ? "gold" : "warning"}>
                {subscription.status === "active" ? "Active" : subscription.status === "trialing" ? "Trial" : subscription.status}
              </Badge>
              <ButtonLink href="/app/subscription" variant="outline" size="sm" trailingIcon={<ArrowRight size={14} />}>
                Manage
              </ButtonLink>
            </div>
          </Card>

          <Card className="p-4">
            <SectionHeader title="Your modules" description="Where your work is concentrated." />
            <div className="mt-3.5 space-y-2.5">
              {kindBreakdown.length ? (
                kindBreakdown.map((kind) => (
                  <Link key={kind.kind} href={`/app/documents?kind=${kind.kind}`} className="block">
                    <div className="flex items-center justify-between gap-2 text-[0.8125rem]">
                      <span className="flex items-center gap-2 font-medium text-fg">
                        <span className="h-2 w-2 rounded-full" style={{ background: kind.accent }} />
                        {kind.plural}
                      </span>
                      <span className="tabular-nums text-fg-muted">{kind.count}</span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar value={kind.count / Math.max(1, active.length)} height={5} />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-[0.8125rem] text-fg-muted">No documents yet — your most-used modules will appear here.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-b px-4 py-3.5" style={{ borderColor: "var(--border)" }}>
            <SectionHeader title="Activity" description="A running log of everything that happened in your workspace." action={<ButtonLink href="/app/activity" variant="ghost" size="sm" trailingIcon={<ArrowRight size={14} />}>Full log</ButtonLink>} />
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {activity.slice(0, 6).map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-3" style={{ borderColor: "var(--border)" }}>
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--brand)" }} />
                <div className="min-w-0 flex-1">
                  <div className="text-[0.8125rem] text-fg">{entry.detail}</div>
                  <div className="mt-0.5 text-[0.6875rem] text-fg-subtle">
                    {entry.entityName ? `${entry.entityName} · ` : ""}
                    {relativeTime(entry.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            {!activity.length ? <p className="px-4 py-8 text-center text-[0.8125rem] text-fg-muted">Your activity will appear here as you work.</p> : null}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Favourites" description="Documents you starred for quick access." />
          <div className="mt-3 space-y-2.5">
            {starred.length ? (
              starred.map((doc) => (
                <Link key={doc.id} href={`/app/documents/${doc.id}`} className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors hover:border-[var(--border-strong)]" style={{ borderColor: "var(--border)" }}>
                  <Star size={14} style={{ color: "var(--gold)" }} fill="currentColor" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.8125rem] font-medium text-fg">{truncate(doc.title, 40)}</span>
                    <span className="block text-[0.6875rem] text-fg-subtle">{doc.number} · {STATUS_META[doc.status].label}</span>
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-[0.8125rem] text-fg-muted">Star a document and it will sit here for one-tap access.</p>
            )}
          </div>

          <div className="mt-5 rounded-xl border p-3.5" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
            <div className="flex items-center gap-2">
              <Sparkles size={15} style={{ color: "var(--brand)" }} />
              <span className="text-[0.8125rem] font-semibold text-fg">Writing assistant</span>
            </div>
            <p className="mt-1.5 text-[0.75rem] leading-relaxed text-fg-muted">
              Draft proposals, CV summaries, contract clauses and payment terms in seconds — then edit every word.
            </p>
            <ButtonLink href="/app/assist" variant="outline" size="sm" className="mt-3" block trailingIcon={<ArrowRight size={14} />}>
              Open assistant
            </ButtonLink>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <SectionHeader
          title="Start something new"
          description={<span className="flex items-center gap-1.5">All {totalTemplateCount} designs are included in your plan. <BadgeCheck size={13} style={{ color: "var(--brand)" }} /></span>}
        />
        <div className="mt-3.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DOC_KINDS.slice(0, 8).map((kind) => (
            <Link
              key={kind.kind}
              href={`/app/templates/${kind.kind}`}
              className="card card-interactive flex items-center gap-3 p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[0.75rem] font-bold text-white" style={{ background: kind.accent }}>
                {kind.label.slice(0, 2)}
              </span>
              <span className="min-w-0">
                <span className="block text-[0.8125rem] font-semibold text-fg">{kind.label}</span>
                <span className="block text-[0.6875rem] text-fg-subtle">{TEMPLATES[kind.kind].length} designs</span>
              </span>
            </Link>
          ))}
        </div>
      </Card>

      <QuickCreate open={quick} onClose={() => setQuick(false)} />
    </div>
  );
}

function MeterRow({ label, value, limit, display }: { label: string; value: number; limit: number | "unlimited"; display: string }) {
  const ratio = usageRatio(value, limit);
  const tone = limit === "unlimited" ? "brand" : ratio > 0.9 ? "danger" : ratio > 0.75 ? "gold" : "brand";
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-[0.75rem]">
        <span className="flex items-center gap-1.5 text-fg-muted">
          {label === "Storage" ? <HardDrive size={13} /> : label === "Assistant credits" ? <Sparkles size={13} /> : <FileText size={13} />}
          {label}
        </span>
        <span className="tabular-nums text-fg">{display}</span>
      </div>
      <div className="mt-1.5">
        <ProgressBar value={limit === "unlimited" ? 0.08 : ratio} tone={tone} height={6} />
      </div>
    </div>
  );
}
