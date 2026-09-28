"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Archive, Filter, LayoutGrid, List, Plus, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { Badge, Button, Card, EmptyState, Segmented, Select, StatusBadge } from "@/components/ui";
import { DocumentCard, DocumentRow } from "@/components/app/document-card";
import { QuickCreate } from "@/components/app/quick-create";
import { useWorkspace } from "@/store/workspace";
import { DOC_KINDS, docKindMeta, STATUS_META } from "@/lib/constants";
import { documentSearchText } from "@/lib/documents/compute";
import { formatMoney } from "@/lib/utils";
import type { DocKind, DocStatus } from "@/lib/types";

type SortKey = "recent" | "oldest" | "title" | "value";
type View = "grid" | "list";

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-[0.875rem] text-fg-muted">Loading documents…</div>}>
      <DocumentsContent />
    </Suspense>
  );
}

function DocumentsContent() {
  const params = useSearchParams();
  const documents = useWorkspace((s) => s.documents);
  const businesses = useWorkspace((s) => s.businesses);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<DocKind | "all">("all");
  const [status, setStatus] = useState<DocStatus | "all">("all");
  const [businessId, setBusinessId] = useState("all");
  const [scope, setScope] = useState<"active" | "starred" | "archived">("active");
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<View>("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quick, setQuick] = useState(false);

  useEffect(() => {
    const initialKind = params.get("kind") as DocKind | null;
    if (initialKind && DOC_KINDS.some((k) => k.kind === initialKind)) setKind(initialKind);
    const initialStatus = params.get("status") as DocStatus | null;
    if (initialStatus && STATUS_META[initialStatus]) setStatus(initialStatus);
  }, [params]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = documents.filter((doc) => {
      if (scope === "archived" && !doc.archived) return false;
      if (scope !== "archived" && doc.archived) return false;
      if (scope === "starred" && !doc.starred) return false;
      if (kind !== "all" && doc.kind !== kind) return false;
      if (status !== "all" && doc.status !== status) return false;
      if (businessId !== "all" && doc.businessId !== businessId) return false;
      if (q && !documentSearchText(doc).includes(q)) return false;
      return true;
    });

    const valueOf = (doc: (typeof list)[number]) =>
      (doc.payload.items ?? []).reduce((sum, item) => sum + item.qty * item.rate, 0);

    return list.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.updatedAt - b.updatedAt;
        case "title":
          return a.title.localeCompare(b.title);
        case "value":
          return valueOf(b) - valueOf(a);
        default:
          return b.updatedAt - a.updatedAt;
      }
    });
  }, [documents, query, kind, status, businessId, scope, sort]);

  const counts = useMemo(() => {
    const active = documents.filter((d) => !d.archived);
    return {
      all: active.length,
      starred: active.filter((d) => d.starred).length,
      archived: documents.filter((d) => d.archived).length,
      value: active.reduce((sum, doc) => sum + (doc.payload.items ?? []).reduce((s, i) => s + i.qty * i.rate, 0), 0),
    };
  }, [documents]);

  const currency = businesses.find((b) => b.isDefault)?.currency ?? businesses[0]?.currency ?? "ZMW";
  const activeFilters = [kind !== "all", status !== "all", businessId !== "all", scope !== "active"].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.375rem] font-semibold tracking-tight text-fg sm:text-[1.5rem]">Documents</h1>
          <p className="mt-1 text-[0.875rem] text-fg-muted">
            {counts.all} active · {counts.starred} starred · {counts.archived} archived · {formatMoney(counts.value, currency)} of value in play
          </p>
        </div>
        <Button variant="brand" onClick={() => setQuick(true)} icon={<Plus size={16} />}>
          New document
        </Button>
      </header>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
            <Search size={15} className="shrink-0 text-fg-subtle" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by number, title, client or amount…"
              className="w-full min-w-0 bg-transparent text-[0.875rem] text-fg outline-none placeholder:text-fg-subtle"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                <X size={14} className="text-fg-subtle" />
              </button>
            ) : null}
          </div>

          <Segmented
            value={scope}
            onChange={setScope}
            options={[
              { value: "active", label: "All" },
              { value: "starred", label: "Starred", icon: <Star size={13} /> },
              { value: "archived", label: "Archived", icon: <Archive size={13} /> },
            ]}
          />

          <Button variant="outline" size="sm" icon={<SlidersHorizontal size={15} />} onClick={() => setFiltersOpen((v) => !v)}>
            Filters{activeFilters ? ` · ${activeFilters}` : ""}
          </Button>

          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "grid", label: <LayoutGrid size={14} /> },
              { value: "list", label: <List size={14} /> },
            ]}
          />
        </div>

        {filtersOpen ? (
          <div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: "var(--border)" }}>
            <label className="field">
              <span className="label">Module</span>
              <Select value={kind} onChange={(event) => setKind(event.target.value as DocKind | "all")}>
                <option value="all">All modules</option>
                {DOC_KINDS.map((item) => (
                  <option key={item.kind} value={item.kind}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="field">
              <span className="label">Status</span>
              <Select value={status} onChange={(event) => setStatus(event.target.value as DocStatus | "all")}>
                <option value="all">Any status</option>
                {Object.entries(STATUS_META).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="field">
              <span className="label">Business</span>
              <Select value={businessId} onChange={(event) => setBusinessId(event.target.value)}>
                <option value="all">All businesses</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className="field">
              <span className="label">Sort by</span>
              <Select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
                <option value="recent">Recently updated</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Title A–Z</option>
                <option value="value">Highest value</option>
              </Select>
            </label>
            {activeFilters ? (
              <div className="sm:col-span-2 lg:col-span-4">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Filter size={14} />}
                  onClick={() => {
                    setKind("all");
                    setStatus("all");
                    setBusinessId("all");
                    setScope("active");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Search size={20} />}
            title={documents.length ? "No documents match those filters" : "No documents yet"}
            description={
              documents.length
                ? "Try a different module, clear the filters, or search for a client name."
                : "Create an invoice, quotation, receipt, CV or any of the nine other modules — each one comes with ready-made designs."
            }
            action={<Button variant="brand" onClick={() => setQuick(true)} icon={<Plus size={16} />}>New document</Button>}
          />
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          {filtered.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </Card>
      )}

      {kind !== "all" ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[0.9375rem] font-semibold text-fg">More {docKindMeta(kind).plural.toLowerCase()} designs</span>
              <Badge tone="brand">{DOC_KINDS.find((k) => k.kind === kind)?.templateCount} available</Badge>
            </div>
            <p className="mt-1 text-[0.8125rem] text-fg-muted">Every design is included — switch layouts without losing a word of content.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setKind("all")}>
            Show all modules
          </Button>
        </Card>
      ) : null}

      <QuickCreate open={quick} onClose={() => setQuick(false)} />
    </div>
  );
}
