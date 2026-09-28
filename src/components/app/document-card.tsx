"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, ExternalLink, MoreHorizontal, Star, Trash2, Archive, ArchiveRestore, Download } from "lucide-react";
import { Dropdown, MenuItem, StatusBadge } from "@/components/ui";
import { docKindMeta } from "@/lib/constants";
import { computeTotals } from "@/lib/documents/compute";
import { formatMoney, relativeTime, truncate } from "@/lib/utils";
import { useWorkspace } from "@/store/workspace";
import { toast } from "@/components/ui/toast";
import type { DocumentRecord } from "@/lib/types";

export function DocumentCard({ doc, compact }: { doc: DocumentRecord; compact?: boolean }) {
  const duplicate = useWorkspace((s) => s.duplicateDocument);
  const toggleStar = useWorkspace((s) => s.toggleStar);
  const toggleArchive = useWorkspace((s) => s.toggleArchive);
  const remove = useWorkspace((s) => s.deleteDocument);
  const [confirming, setConfirming] = useState(false);
  const meta = docKindMeta(doc.kind);
  const totals = computeTotals(doc.payload ?? {}, doc.kind);
  const currency = doc.payload.currency ?? doc.currency;
  const client = doc.payload.clientCompany || doc.payload.clientName || doc.payload.fullName || doc.payload.recipient || "No client yet";

  return (
    <div className="card card-interactive group relative overflow-hidden">
      <Link href={`/app/documents/${doc.id}`} className="block p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[0.8125rem] font-bold text-white" style={{ background: meta.accent }}>
            {meta.label.slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-fg-subtle">{meta.label}</span>
              {doc.starred ? <Star size={12} style={{ color: "var(--gold)" }} fill="currentColor" /> : null}
              {doc.archived ? <span className="text-[0.625rem] font-semibold text-fg-subtle">· archived</span> : null}
            </div>
            <div className="mt-0.5 truncate text-[0.875rem] font-semibold text-fg">{truncate(doc.title, 58)}</div>
            <div className="mt-0.5 truncate text-[0.75rem] text-fg-muted">
              {doc.number} · {client}
            </div>
            {!compact ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={doc.status} />
                <span className="text-[0.75rem] text-fg-subtle">{relativeTime(doc.updatedAt)}</span>
              </div>
            ) : null}
          </div>
          {meta.hasLineItems ? (
            <div className="shrink-0 text-right">
              <div className="text-[0.9375rem] font-semibold tabular-nums text-fg">{formatMoney(totals.total, currency)}</div>
              {totals.paid > 0 && totals.balance > 0 ? (
                <div className="text-[0.6875rem] text-fg-subtle">{formatMoney(totals.balance, currency)} due</div>
              ) : null}
            </div>
          ) : null}
        </div>
      </Link>

      <div className="absolute right-2.5 top-12 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <Dropdown
          width={216}
          trigger={({ toggle }) => (
            <button type="button" onClick={toggle} className="btn btn-ghost btn-icon btn-sm bg-[var(--surface)] shadow-sm" aria-label="Document actions">
              <MoreHorizontal size={16} />
            </button>
          )}
        >
          {(close) => (
            <div>
              <MenuItem icon={<ExternalLink size={15} />} href={`/app/documents/${doc.id}`} onClick={close}>
                Open document
              </MenuItem>
              <MenuItem
                icon={<Copy size={15} />}
                onClick={() => {
                  const copy = duplicate(doc.id);
                  close();
                  if (copy) toast.success("Document duplicated", `${copy.number} created from ${doc.number}.`);
                }}
              >
                Duplicate
              </MenuItem>
              <MenuItem
                icon={<Star size={15} />}
                onClick={() => {
                  toggleStar(doc.id);
                  close();
                }}
              >
                {doc.starred ? "Remove from favourites" : "Add to favourites"}
              </MenuItem>
              <MenuItem
                icon={doc.archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                onClick={() => {
                  toggleArchive(doc.id);
                  close();
                }}
              >
                {doc.archived ? "Restore" : "Archive"}
              </MenuItem>
              <MenuItem icon={<Download size={15} />} href={`/app/documents/${doc.id}#export`} onClick={close}>
                Export & share
              </MenuItem>
              <div className="divider my-1.5" />
              {confirming ? (
                <MenuItem
                  icon={<Trash2 size={15} />}
                  tone="danger"
                  onClick={() => {
                    remove(doc.id);
                    close();
                    toast.success("Document deleted", `${doc.number} has been removed.`);
                  }}
                >
                  Tap again to confirm delete
                </MenuItem>
              ) : (
                <MenuItem icon={<Trash2 size={15} />} tone="danger" onClick={() => setConfirming(true)}>
                  Delete
                </MenuItem>
              )}
            </div>
          )}
        </Dropdown>
      </div>
    </div>
  );
}

export function DocumentRow({ doc }: { doc: DocumentRecord }) {
  const meta = docKindMeta(doc.kind);
  const totals = computeTotals(doc.payload ?? {}, doc.kind);
  const currency = doc.payload.currency ?? doc.currency;
  const client = doc.payload.clientCompany || doc.payload.clientName || doc.payload.fullName || "—";
  return (
    <Link
      href={`/app/documents/${doc.id}`}
      className="flex items-center gap-3 border-b px-3 py-2.5 transition-colors last:border-0 hover:bg-[var(--surface-2)]"
      style={{ borderColor: "var(--border)" }}
    >
      <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: meta.accent }} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.8125rem] font-medium text-fg">{doc.title}</span>
        <span className="block truncate text-[0.6875rem] text-fg-subtle">
          {meta.label} · {doc.number} · {client}
        </span>
      </span>
      <span className="hidden shrink-0 text-[0.75rem] text-fg-subtle sm:block">{relativeTime(doc.updatedAt)}</span>
      <span className="shrink-0">
        <StatusBadge status={doc.status} />
      </span>
      {meta.hasLineItems ? (
        <span className="w-24 shrink-0 text-right text-[0.8125rem] font-semibold tabular-nums text-fg">{formatMoney(totals.total, currency)}</span>
      ) : (
        <span className="w-24 shrink-0" />
      )}
    </Link>
  );
}
