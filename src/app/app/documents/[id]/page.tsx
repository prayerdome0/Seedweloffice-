"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Archive, Check, ChevronLeft, Copy, Eye, FilePlus2, Loader2, Maximize2, Minus, Pencil, Plus, Save,
  Send, Sparkles, Star, Trash2, ZoomIn, ZoomOut,
} from "lucide-react";
import { Badge, Button, Card, EmptyState, Field, Input, Segmented, Select, StatusBadge, Textarea } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { FieldControl } from "@/components/editor/field-control";
import { ItemsEditor } from "@/components/editor/items-editor";
import { DesignPanel } from "@/components/editor/design-panel";
import { CvStudioPanel } from "@/components/editor/cv-studio-panel";
import { AssistDialog, type AssistTarget } from "@/components/editor/assist-dialog";
import { ExportMenu } from "@/components/editor/export-menu";
import { ShareSheet } from "@/components/editor/share-sheet";
import { PaperPreview } from "@/components/document/paper-preview";
import { useWorkspace } from "@/store/workspace";
import { SCHEMAS } from "@/lib/documents/schema";
import { computeTotals, docLabels } from "@/lib/documents/compute";
import { DOC_KINDS, STATUS_META, docKindMeta } from "@/lib/constants";
import { blankLineItem } from "@/lib/documents/compute";
import { runAssist } from "@/lib/ai";
import { templatesFor } from "@/templates";
import { formatMoney, relativeTime, uid } from "@/lib/utils";
import type { DocStatus, DocumentPayload, DocumentRecord, LineItem } from "@/lib/types";

type Tab = { id: string; label: string };

export default function DocumentEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  const document_ = useWorkspace((s) => s.documents.find((d) => d.id === id));
  const businesses = useWorkspace((s) => s.businesses);
  const saveDocument = useWorkspace((s) => s.saveDocument);
  const patchDocument = useWorkspace((s) => s.patchDocument);
  const deleteDocument = useWorkspace((s) => s.deleteDocument);
  const duplicateDocument = useWorkspace((s) => s.duplicateDocument);
  const toggleStar = useWorkspace((s) => s.toggleStar);
  const toggleArchive = useWorkspace((s) => s.toggleArchive);

  const [draft, setDraft] = useState<DocumentRecord | null>(null);
  const [tab, setTab] = useState("details");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [zoom, setZoom] = useState(1);
  const [assist, setAssist] = useState<AssistTarget | null>(null);
  const [assistIndex, setAssistIndex] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const loadedId = useRef<string>("");

  /* Load the working copy when the document changes ---------------------- */
  useEffect(() => {
    if (!document_) return;
    if (loadedId.current === document_.id) return;
    loadedId.current = document_.id;
    setDraft(structuredClone(document_));
    setTab("details");
  }, [document_]);

  /* Persist with a short debounce so typing stays instant ---------------- */
  useEffect(() => {
    if (!draft) return;
    const timer = window.setTimeout(() => {
      saveDocument(draft, { silent: true });
      setSavedAt(Date.now());
    }, 700);
    return () => window.clearTimeout(timer);
  }, [draft, saveDocument]);

  /* Measure the preview stage for correct paper scaling ------------------ */
  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const update = () => setStageWidth(element.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [mobileView, tab]);

  const schema = draft ? SCHEMAS[draft.kind] : null;
  const meta = draft ? docKindMeta(draft.kind) : null;
  const business = useMemo(
    () => businesses.find((b) => b.id === draft?.businessId) ?? businesses.find((b) => b.isDefault) ?? businesses[0] ?? null,
    [businesses, draft?.businessId],
  );

  const tabs = useMemo<Tab[]>(() => {
    if (!draft || !schema) return [];
    const base: Tab[] = [{ id: "details", label: "Details" }];
    if (meta?.hasLineItems) base.push({ id: "items", label: "Items" });
    for (const section of schema.sections) base.push({ id: section.id, label: section.label });
    for (const list of schema.lists) base.push({ id: `list:${list.key}`, label: list.label });
    if (draft.kind === "cv") base.push({ id: "cv-studio", label: "CV sections" });
    base.push({ id: "design", label: "Design" });
    return base;
  }, [draft, schema, meta]);

  const setPayload = useCallback((patch: Partial<DocumentPayload>) => {
    setDraft((current) => (current ? { ...current, payload: { ...current.payload, ...patch } } : current));
  }, []);

  const setDesign = useCallback((patch: Partial<DocumentRecord["design"]>) => {
    setDraft((current) => (current ? { ...current, design: { ...current.design, ...patch } } : current));
  }, []);

  /* Draft a line-item description --------------------------------------- */
  const draftItemDescription = useCallback(
    async (index: number) => {
      if (!draft) return;
      const items = draft.payload.items ?? [];
      if (index === -1) {
        // Draft a fresh set of five realistic lines from the document context.
        const result = await runAssist({ field: "itemDescription", doc: draft, business, variant: 0 });
        const lines = [
          result.text,
          `${draft.payload.subject || draft.title} — phase one`,
          `${draft.payload.subject || draft.title} — phase two`,
        ];
        const next: LineItem[] = lines.map((line, i) => ({ ...blankLineItem(), id: uid("itm"), description: line, qty: i === 0 ? 1 : i, rate: i === 0 ? 4800 : 2600, taxRate: draft.payload.taxRate ?? 0 }));
        setPayload({ items: [...items, ...next] });
        toast.success("Draft lines added", "Edit the quantities and rates to match your pricing.");
        return;
      }
      const item = items[index];
      if (!item) return;
      const result = await runAssist({ field: "itemDescription", doc: { ...draft, payload: { ...draft.payload, items: [item] } }, business, variant: index });
      const next = [...items];
      next[index] = { ...item, description: result.text };
      setPayload({ items: next });
      toast.success("Description drafted");
    },
    [draft, business, setPayload],
  );

  if (!document_ && !draft) {
    return (
      <Card>
        <EmptyState
          icon={<FilePlus2 size={20} />}
          title="Document not found"
          description="It may have been deleted, or the link may belong to another workspace."
          action={
            <Button variant="brand" onClick={() => router.push("/app/documents")}>
              Back to documents
            </Button>
          }
        />
      </Card>
    );
  }

  if (!draft) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-fg-muted">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-[0.8125rem]">Opening document…</span>
      </div>
    );
  }

  const labels = docLabels(draft.kind);
  const totals = computeTotals(draft.payload, draft.kind);
  const currency = draft.payload.currency ?? draft.currency;
  const assistPayload = draft.payload;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <Link href="/app/documents" className="btn btn-ghost btn-icon btn-sm mt-0.5 shrink-0" aria-label="Back to documents">
            <ChevronLeft size={17} />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-fg-subtle">{meta?.label}</span>
              <StatusBadge status={draft.status} />
              {draft.starred ? <Star size={13} style={{ color: "var(--gold)" }} fill="currentColor" /> : null}
            </div>
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              className="mt-1 w-full max-w-full truncate bg-transparent text-[1.125rem] font-semibold tracking-tight text-fg outline-none sm:text-[1.375rem]"
              aria-label="Document title"
            />
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] text-fg-muted">
              <span className="font-medium text-fg">{draft.number}</span>
              <span>·</span>
              <span>{draft.payload.clientCompany || draft.payload.clientName || labels.billTo}</span>
              {meta?.hasLineItems ? (
                <>
                  <span>·</span>
                  <span className="font-semibold text-fg">{formatMoney(totals.total, currency)}</span>
                </>
              ) : null}
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                {savedAt ? <Check size={12} style={{ color: "#047857" }} /> : <Save size={12} />}
                {savedAt ? "Saved" : "Saving…"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            className="!w-auto !min-h-9 !py-1.5 text-[0.8125rem]"
            value={draft.status}
            onChange={(event) => setDraft({ ...draft, status: event.target.value as DocStatus })}
            aria-label="Document status"
          >
            {Object.entries(STATUS_META).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
          <ExportMenu doc={draft} business={business} onShare={() => setShareOpen(true)} />
          <Button
            variant="brand"
            size="sm"
            icon={<Send size={15} />}
            onClick={() => setShareOpen(true)}
          >
            Send
          </Button>
        </div>
      </header>

      {/* Segmented control for mobile ------------------------------------- */}
      <div className="lg:hidden">
        <Segmented
          value={mobileView}
          onChange={setMobileView}
          options={[
            { value: "edit", label: "Edit", icon: <Pencil size={14} /> },
            { value: "preview", label: "Preview", icon: <Eye size={14} /> },
          ]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,620px)]">
        {/* Editor ------------------------------------------------------- */}
        <div className={mobileView === "edit" ? "space-y-3" : "hidden lg:block lg:space-y-3"}>
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>
              <Link href="/app/documents" className="btn btn-ghost btn-sm lg:hidden" aria-label="Back">
                <ArrowLeft size={15} />
              </Link>
              <div className="no-scrollbar flex flex-1 gap-1 overflow-x-auto">
                {tabs.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    data-active={tab === item.id}
                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-[0.8125rem] font-medium transition-colors"
                    style={{
                      background: tab === item.id ? "var(--surface-3)" : "transparent",
                      color: tab === item.id ? "var(--fg)" : "var(--fg-muted)",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => toggleStar(draft.id)}
                className="btn btn-ghost btn-icon btn-sm shrink-0"
                aria-label={draft.starred ? "Remove from favourites" : "Add to favourites"}
              >
                <Star size={15} style={draft.starred ? { color: "var(--gold)" } : undefined} fill={draft.starred ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="p-4">
              {tab === "cv-studio" && <CvStudioPanel payload={draft.payload} onChange={setPayload} />}
              {tab === "details" ? (
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Document number" required>
                      <Input value={draft.number} onChange={(event) => setDraft({ ...draft, number: event.target.value })} />
                    </Field>
                    <Field label="Trading as" help={businesses.length > 1 ? "Each profile carries its own logo, bank details and colours." : undefined}>
                      <Select value={draft.businessId ?? ""} onChange={(event) => setDraft({ ...draft, businessId: event.target.value })}>
                        {!businesses.length ? <option value="">No profile yet</option> : null}
                        {businesses.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                            {item.isDefault ? " (default)" : ""}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label={labels.dateLabel}>
                      <Input type="date" value={draft.issueDate} onChange={(event) => setDraft({ ...draft, issueDate: event.target.value })} />
                    </Field>
                    {meta?.needsDueDate ? (
                      <Field label={labels.dueLabel}>
                        <Input type="date" value={draft.dueDate ?? ""} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} />
                      </Field>
                    ) : null}
                    {draft.kind === "quotation" ? (
                      <Field label={labels.validLabel}>
                        <Input type="date" value={draft.validUntil ?? ""} onChange={(event) => setDraft({ ...draft, validUntil: event.target.value })} />
                      </Field>
                    ) : null}
                    <Field label="Currency">
                      <Input value={draft.payload.currency ?? draft.currency} onChange={(event) => setPayload({ currency: event.target.value.toUpperCase() })} />
                    </Field>
                  </div>

                  {schema?.client ? (
                    <section className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
                      <h3 className="text-[0.875rem] font-semibold text-fg">{schema.client.label}</h3>
                      <p className="mb-3 mt-0.5 text-[0.75rem] text-fg-muted">{schema.client.description}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          { key: "clientName", label: "Contact name", type: "text", placeholder: "e.g. Grace Banda" },
                          { key: "clientCompany", label: "Company", type: "text", placeholder: "e.g. Banda Logistics Ltd" },
                          { key: "clientEmail", label: "Email", type: "email", placeholder: "accounts@company.com" },
                          { key: "clientPhone", label: "Phone", type: "tel", placeholder: "+260 97 000 0000" },
                          { key: "clientTaxId", label: "Tax / VAT number", type: "text", placeholder: "TPIN 1000000000" },
                        ].map((field) => (
                          <FieldControl
                            key={field.key}
                            def={{ ...field, key: field.key, label: field.label, type: field.type as "text" }}
                            value={assistPayload[field.key]}
                            onChange={(value) => setPayload({ [field.key]: value } as Partial<DocumentPayload>)}
                          />
                        ))}
                        <FieldControl
                          def={{ key: "clientAddress", label: "Address", type: "textarea", rows: 2, span: 2, placeholder: "Plot 24, Cairo Road\nLusaka, Zambia" }}
                          value={assistPayload.clientAddress}
                          onChange={(value) => setPayload({ clientAddress: String(value) })}
                        />
                      </div>
                    </section>
                  ) : null}

                  <section className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
                    <h3 className="mb-3 text-[0.875rem] font-semibold text-fg">Labels & tags</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Tags" help="Comma separated — used for search and reporting.">
                        <Input
                          value={draft.tags.join(", ")}
                          onChange={(event) =>
                            setDraft({ ...draft, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })
                          }
                          placeholder="retainer, design"
                        />
                      </Field>
                      <Field label="Client name (for lists)">
                        <Input value={draft.clientName ?? ""} onChange={(event) => setDraft({ ...draft, clientName: event.target.value })} />
                      </Field>
                    </div>
                  </section>
                </div>
              ) : null}

              {tab === "items" && meta?.hasLineItems ? (
                <ItemsEditor
                  kind={draft.kind}
                  payload={draft.payload}
                  currency={currency}
                  onChange={setPayload}
                  onAssistDescription={(index) => {
                    if (index === -1) {
                      void draftItemDescription(-1);
                      return;
                    }
                    setAssistIndex(index);
                    setAssist({
                      field: "itemDescription",
                      label: draft.payload.items?.[index]?.description || "line item description",
                      type: "text",
                    });
                  }}
                />
              ) : null}

              {schema?.sections.map((section) =>
                tab === section.id ? (
                  <div key={section.id} className="space-y-4">
                    {section.description ? <p className="text-[0.8125rem] text-fg-muted">{section.description}</p> : null}
                    <div className={section.columns === 2 ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"}>
                      {section.fields.map((field) => (
                        <FieldControl
                          key={field.key}
                          def={field}
                          value={assistPayload[field.key]}
                          onChange={(value) => setPayload({ [field.key]: value } as Partial<DocumentPayload>)}
                          onAssist={(def) =>
                            setAssist({
                              field: def.ai ?? def.key,
                              label: def.label,
                              type: def.type === "tags" ? "list" : "text",
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                ) : null,
              )}

              {schema?.lists.map((list) =>
                tab === `list:${list.key}` ? (
                  <ListEditor
                    key={list.key}
                    list={list}
                    items={(draft.payload[list.key] as Record<string, unknown>[]) ?? []}
                    onChange={(items) => setPayload({ [list.key]: items } as Partial<DocumentPayload>)}
                    onAssist={(fieldKey) =>
                      setAssist({
                        field: fieldKey,
                        label: list.label,
                        type: fieldKey === "cvExperience" || fieldKey === "cvSkills" ? "list" : "text",
                      })
                    }
                  />
                ) : null,
              )}

              {tab === "design" ? (
                <DesignPanel
                  kind={draft.kind}
                  design={draft.design}
                  business={business}
                  onChange={setDesign}
                  onApplyTemplate={(templateId) => {
                    setDesign({ templateId });
                    const template = templatesFor(draft.kind).find((t) => t.id === templateId);
                    toast.success("Design applied", template ? `${template.name} is now active — your content is unchanged.` : undefined);
                  }}
                />
              ) : null}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[0.8125rem] text-fg-muted">
                Created {relativeTime(draft.createdAt)} · Updated {relativeTime(draft.updatedAt)}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Copy size={14} />}
                  onClick={() => {
                    const copy = duplicateDocument(draft.id);
                    if (copy) {
                      toast.success("Duplicated", `${copy.number} created.`);
                      router.push(`/app/documents/${copy.id}`);
                    }
                  }}
                >
                  Duplicate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Archive size={14} />}
                  onClick={() => {
                    toggleArchive(draft.id);
                    toast.success(draft.archived ? "Restored" : "Archived");
                    router.push("/app/documents");
                  }}
                >
                  {draft.archived ? "Restore" : "Archive"}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 size={14} />}
                  onClick={() => {
                    deleteDocument(draft.id);
                    toast.success("Document deleted", `${draft.number} has been removed.`);
                    router.push("/app/documents");
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Preview ------------------------------------------------------ */}
        <div className={mobileView === "preview" ? "block" : "hidden lg:block"}>
          <Card className="sticky top-[4.5rem] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <span className="text-[0.75rem] font-semibold text-fg">Live preview</span>
                <Badge tone="neutral">A4 · {templatesFor(draft.kind).length} designs</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="btn-sm" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(2)))} aria-label="Zoom out">
                  <ZoomOut size={15} />
                </Button>
                <span className="w-10 text-center text-[0.6875rem] tabular-nums text-fg-muted">{Math.round(zoom * 100)}%</span>
                <Button variant="ghost" size="icon" className="btn-sm" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))} aria-label="Zoom in">
                  <ZoomIn size={15} />
                </Button>
                <Button variant="ghost" size="icon" className="btn-sm" onClick={() => setZoom(1)} aria-label="Fit to width">
                  <Maximize2 size={14} />
                </Button>
              </div>
            </div>
            <div
              ref={stageRef}
              className="editor-stage max-h-[calc(100vh-11rem)] overflow-auto p-3"
              style={{ background: "var(--canvas-tint)" }}
            >
              <PaperPreview
                doc={draft}
                business={business}
                fitWidth={stageWidth ? Math.max(240, (stageWidth - 24) / zoom) : undefined}
                maxScale={zoom}
                printable
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2 text-[0.75rem] text-fg-muted" style={{ borderColor: "var(--border)" }}>
              <span>{labels.numberLabel} {draft.number}</span>
              {meta?.hasLineItems ? <span className="font-semibold text-fg">{formatMoney(totals.total, currency)}</span> : null}
            </div>
          </Card>
        </div>
      </div>

      <AssistDialog
        open={Boolean(assist)}
        onClose={() => {
          setAssist(null);
          setAssistIndex(null);
        }}
        target={assist}
        doc={draft}
        business={business}
        onApply={(result) => {
          if (!assist) return;
          if (assistIndex !== null && assist.field === "itemDescription") {
            const items = [...(draft.payload.items ?? [])];
            const item = items[assistIndex];
            if (item) items[assistIndex] = { ...item, description: result.text };
            setPayload({ items });
          } else if (result.lines?.length) {
            setPayload({ [assist.field]: result.lines } as Partial<DocumentPayload>);
          } else {
            setPayload({ [assist.field]: result.text } as Partial<DocumentPayload>);
          }
        }}
      />

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        doc={draft}
        business={business}
        onStatusChange={(status) => {
          setDraft({ ...draft, status });
          patchDocument(draft.id, { status });
        }}
      />
    </div>
  );
}

/* ── Repeatable list editor ------------------------------------------------ */

function ListEditor({
  list,
  items,
  onChange,
  onAssist,
}: {
  list: { key: string; label: string; description?: string; summarize: (item: Record<string, unknown>) => [string, string]; fields: { key: string; label: string; type: string; span?: 1 | 2; rows?: number; placeholder?: string; ai?: string }[]; blank: () => Record<string, unknown>; aiAssist?: boolean };
  items: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
  onAssist: (fieldKey: string) => void;
}) {
  const patch = (index: number, key: string, value: unknown) => {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {list.description ? <p className="text-[0.8125rem] text-fg-muted">{list.description}</p> : null}
      {items.map((item, index) => (
        <div key={String(item.id ?? index)} className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[0.75rem] font-semibold text-fg">{list.summarize(item)[0] || `${list.label} ${index + 1}`}</div>
              <div className="truncate text-[0.6875rem] text-fg-subtle">{list.summarize(item)[1]}</div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="btn-sm"
                disabled={index === 0}
                onClick={() => {
                  const next = [...items];
                  const [moved] = next.splice(index, 1);
                  next.splice(index - 1, 0, moved);
                  onChange(next);
                }}
                aria-label="Move up"
              >
                <Minus size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="btn-sm"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label="Remove"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {list.fields.map((field) => (
              <FieldControl
                key={field.key}
                def={{ ...field, type: field.type as "text" }}
                value={item[field.key]}
                onChange={(value) => patch(index, field.key, value)}
                onAssist={field.ai ? () => onAssist(field.ai as string) : undefined}
              />
            ))}
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={() => onChange([...items, list.blank()])}>
        Add {list.label.toLowerCase().replace(/s$/, "")}
      </Button>

      {list.aiAssist ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed p-3 text-[0.75rem] text-fg-muted" style={{ borderColor: "var(--border-strong)" }}>
          <Sparkles size={14} style={{ color: "var(--brand)" }} />
          Need inspiration? Use the Write button on any field to draft it from your other details.
        </div>
      ) : null}
    </div>
  );
}
