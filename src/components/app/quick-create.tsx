"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { Badge, Button, Modal } from "@/components/ui";
import { DOC_KINDS, DOC_GROUPS, docKindMeta } from "@/lib/constants";
import { useWorkspace } from "@/store/workspace";
import { TEMPLATES } from "@/templates";
import type { DocKind } from "@/lib/types";

/** The single entry point for starting any document, from anywhere in the app. */
export function QuickCreate({ open, onClose, defaultKind }: { open: boolean; onClose: () => void; defaultKind?: DocKind }) {
  const router = useRouter();
  const createDocument = useWorkspace((s) => s.createDocument);
  const businesses = useWorkspace((s) => s.businesses);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<DocKind | null>(defaultKind ?? null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DOC_KINDS.filter((k) => !q || `${k.label} ${k.plural} ${k.description}`.toLowerCase().includes(q));
  }, [query]);

  const templates = kind ? TEMPLATES[kind] : [];

  const start = () => {
    if (!kind) return;
    const doc = createDocument(kind, {
      templateId: templateId ?? undefined,
      businessId: businessId || undefined,
    });
    onClose();
    router.push(`/app/documents/${doc.id}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={kind ? `New ${docKindMeta(kind).label.toLowerCase()}` : "What would you like to create?"}
      description={kind ? "Pick a design — you can change it any time without losing content." : "Thirteen modules, 144 hand-built designs."}
      size="lg"
      footer={
        kind ? (
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setKind(null); setTemplateId(null); }}>
              ← Change type
            </Button>
            <Button variant="brand" onClick={start} icon={<ArrowRight size={16} />}>
              Start writing
            </Button>
          </div>
        ) : null
      }
    >
      {!kind ? (
        <div>
          <div className="mb-3 flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
            <Search size={15} className="text-fg-subtle" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search 13 document types…"
              className="w-full bg-transparent text-[0.875rem] text-fg outline-none placeholder:text-fg-subtle"
            />
          </div>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto">
            {DOC_GROUPS.map((group) => {
              const items = filtered.filter((k) => k.group === group);
              if (!items.length) return null;
              return (
                <div key={group}>
                  <div className="pb-2 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-fg-subtle">{group}</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {items.map((item) => (
                      <button
                        key={item.kind}
                        type="button"
                        onClick={() => {
                          setKind(item.kind);
                          setTemplateId(null);
                        }}
                        className="card card-interactive flex items-start gap-3 p-3.5 text-left"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[0.875rem] font-bold text-white" style={{ background: item.accent }}>
                          {item.label.slice(0, 1)}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="text-[0.875rem] font-semibold text-fg">{item.label}</span>
                            <Badge tone="neutral">{item.templateCount} designs</Badge>
                          </span>
                          <span className="mt-0.5 block text-[0.75rem] leading-relaxed text-fg-muted">{item.description}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.length > 1 ? (
            <label className="field">
              <span className="label">Trading as</span>
              <select className="select" value={businessId} onChange={(event) => setBusinessId(event.target.value)}>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                    {business.isDefault ? " (default)" : ""}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="max-h-[52vh] overflow-y-auto">
            <div className="grid gap-2 sm:grid-cols-2">
              {templates.map((template) => {
                const active = (templateId ?? "") === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setTemplateId(template.id)}
                    className="rounded-xl border p-3 text-left transition-all"
                    style={{
                      borderColor: active ? "var(--brand)" : "var(--border)",
                      background: active ? "color-mix(in oklab, var(--brand) 8%, var(--surface))" : "var(--surface)",
                      boxShadow: active ? "0 0 0 3px color-mix(in oklab, var(--brand) 16%, transparent)" : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[0.8125rem] font-semibold text-fg">{template.name}</span>
                      <Badge tone={template.category === "creative" ? "gold" : template.category === "modern" ? "brand" : "neutral"}>{template.category}</Badge>
                    </div>
                    <p className="mt-1 text-[0.75rem] leading-relaxed text-fg-muted">{template.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
