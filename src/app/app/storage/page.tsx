"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, Database, HardDrive, Image as ImageIcon, RefreshCw, Sparkles, Trash2, FileText } from "lucide-react";
import { Badge, Button, Card, ProgressBar, SectionHeader, StatTile } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useWorkspace } from "@/store/workspace";
import { computeTotals, usageRatio, usageSnapshot } from "@/lib/documents/compute";
import { PLANS } from "@/lib/constants";
import { formatBytes, formatMoney, relativeTime } from "@/lib/utils";

export default function StoragePage() {
  const documents = useWorkspace((s) => s.documents);
  const businesses = useWorkspace((s) => s.businesses);
  const settings = useWorkspace((s) => s.settings);
  const subscription = useWorkspace((s) => s.subscription);
  const deleteDocument = useWorkspace((s) => s.deleteDocument);
  const resetWorkspace = useWorkspace((s) => s.resetWorkspace);

  const usage = useMemo(() => {
    const active = documents.filter((d) => !d.archived);
    const documentBytes = active.reduce((sum, doc) => sum + JSON.stringify(doc).length, 0);
    const imageBytes = businesses.reduce(
      (sum, business) =>
        sum + (business.logoDataUrl?.length ?? 0) + (business.signatureDataUrl?.length ?? 0) + (business.stampDataUrl?.length ?? 0),
      0,
    );
    return { active, documentBytes, imageBytes };
  }, [documents, businesses]);

  const plan = PLANS.find((p) => p.id === subscription.plan) ?? PLANS[0];
  const storageLimit = plan.storageGb * 1024 * 1024 * 1024;
  const snapshot = usageSnapshot(documents, subscription.plan, usage.documentBytes + usage.imageBytes, Number(settings.aiUsed ?? 0));

  const largest = useMemo(
    () => [...documents].sort((a, b) => JSON.stringify(b).length - JSON.stringify(a).length).slice(0, 6),
    [documents],
  );

  const archived = documents.filter((d) => d.archived);
  const drafts = documents.filter((d) => d.status === "draft");

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.375rem] font-semibold tracking-tight text-fg sm:text-[1.5rem]">Storage & usage</h1>
          <p className="mt-1 text-[0.875rem] text-fg-muted">Where your allowance goes, and what you can clear out safely.</p>
        </div>
        <Link href="/app/subscription" className="btn btn-outline btn-sm">
          Change plan
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Documents" value={documents.length} hint={`${usage.active.length} active · ${archived.length} archived`} icon={<FileText size={17} />} />
        <StatTile label="Storage used" value={formatBytes(usage.documentBytes + usage.imageBytes)} hint={`of ${formatBytes(storageLimit)} on ${plan.name}`} icon={<HardDrive size={17} />} tone={usageRatio(usage.documentBytes, storageLimit) > 0.75 ? "warning" : "brand"} />
        <StatTile label="Brand images" value={formatBytes(usage.imageBytes)} hint="Logos, signatures and stamps" icon={<ImageIcon size={17} />} tone="info" />
        <StatTile label="Assistant credits" value={`${snapshot.aiCreditsUsed} / ${snapshot.aiCreditLimit}`} hint={`${Math.max(0, snapshot.aiCreditLimit - snapshot.aiCreditsUsed)} remaining this period`} icon={<Sparkles size={17} />} tone="gold" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <SectionHeader title="Allowance" description={`Your ${plan.name} plan renews ${relativeTime(subscription.renewsAt)}.`} />
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-[0.8125rem]">
                <span className="text-fg-muted">Documents this month</span>
                <span className="font-semibold tabular-nums text-fg">
                  {snapshot.documentsThisMonth} / {snapshot.documentLimit === "unlimited" ? "unlimited" : snapshot.documentLimit}
                </span>
              </div>
              <div className="mt-1.5">
                <ProgressBar value={snapshot.documentLimit === "unlimited" ? 0.1 : usageRatio(snapshot.documentsThisMonth, snapshot.documentLimit)} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[0.8125rem]">
                <span className="text-fg-muted">Storage</span>
                <span className="font-semibold tabular-nums text-fg">{formatBytes(usage.documentBytes + usage.imageBytes)} / {formatBytes(storageLimit)}</span>
              </div>
              <div className="mt-1.5">
                <ProgressBar value={usageRatio(usage.documentBytes + usage.imageBytes, storageLimit)} tone="brand" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[0.8125rem]">
                <span className="text-fg-muted">Assistant credits</span>
                <span className="font-semibold tabular-nums text-fg">{snapshot.aiCreditsUsed} / {snapshot.aiCreditLimit}</span>
              </div>
              <div className="mt-1.5">
                <ProgressBar value={usageRatio(snapshot.aiCreditsUsed, snapshot.aiCreditLimit)} tone="gold" />
              </div>
            </div>
          </div>
          {snapshot.aiCreditsUsed > snapshot.aiCreditLimit * 0.8 ? (
            <p className="mt-3 flex items-start gap-2 text-[0.75rem] text-fg-muted">
              <AlertTriangle size={14} style={{ color: "var(--gold)" }} className="mt-0.5 shrink-0" />
              You have used most of this month&apos;s assistant credits. The composer keeps working on your device — credits only apply to connected models.
            </p>
          ) : null}
        </Card>

        <Card className="p-4">
          <SectionHeader title="Housekeeping" description="Everything below is safe to remove." />
          <div className="mt-3 space-y-2.5 text-[0.8125rem]">
            <div className="flex items-center justify-between gap-2 rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
              <div>
                <div className="font-semibold text-fg">Archived documents</div>
                <div className="text-[0.75rem] text-fg-subtle">{archived.length} documents</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={!archived.length}
                onClick={() => {
                  archived.forEach((doc) => deleteDocument(doc.id));
                  toast.success(`${archived.length} archived document${archived.length === 1 ? "" : "s"} deleted`);
                }}
              >
                Delete
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
              <div>
                <div className="font-semibold text-fg">Unused drafts</div>
                <div className="text-[0.75rem] text-fg-subtle">{drafts.length} drafts never sent</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={!drafts.length}
                onClick={() => {
                  drafts.forEach((doc) => deleteDocument(doc.id));
                  toast.success("Drafts cleared");
                }}
              >
                Delete
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
              <div>
                <div className="font-semibold text-fg">Reload demo workspace</div>
                <div className="text-[0.75rem] text-fg-subtle">Restores the sample documents</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<RefreshCw size={14} />}
                onClick={() => {
                  resetWorkspace();
                  toast.success("Workspace reset", "The demo documents have been restored.");
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b px-4 py-3.5" style={{ borderColor: "var(--border)" }}>
          <SectionHeader title="Largest documents" description="Big documents usually mean large image fields or long CVs." />
        </div>
        <div>
          {largest.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 border-b px-4 py-2.5 last:border-0" style={{ borderColor: "var(--border)" }}>
              <Database size={15} className="shrink-0 text-fg-subtle" />
              <Link href={`/app/documents/${doc.id}`} className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium text-fg">
                {doc.title}
              </Link>
              <span className="hidden text-[0.75rem] text-fg-subtle sm:block">{doc.number}</span>
              {doc.payload.items?.length ? (
                <span className="hidden text-[0.75rem] tabular-nums text-fg-muted sm:block">
                  {formatMoney(computeTotals(doc.payload, doc.kind).total, doc.payload.currency ?? doc.currency)}
                </span>
              ) : null}
              <Badge tone="neutral">{formatBytes(JSON.stringify(doc).length)}</Badge>
              <button type="button" onClick={() => { deleteDocument(doc.id); toast.success("Deleted"); }} aria-label="Delete document" className="text-fg-subtle hover:text-[#b91c1c]">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
