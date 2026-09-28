"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, FilePlus2, FileText, LayoutDashboard, Search, Settings, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui";
import { useWorkspace } from "@/store/workspace";
import { DOC_KINDS, docKindMeta } from "@/lib/constants";
import { documentSearchText } from "@/lib/documents/compute";
import { ALL_TEMPLATES } from "@/templates";
import { formatMoney, relativeTime, truncate } from "@/lib/utils";
import type { DocKind } from "@/lib/types";

interface Result {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  run: () => void;
}

export function CommandPalette({ open, onClose, onNew }: { open: boolean; onClose: () => void; onNew: () => void }) {
  const router = useRouter();
  const documents = useWorkspace((s) => s.documents);
  const businesses = useWorkspace((s) => s.businesses);
  const createDocument = useWorkspace((s) => s.createDocument);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const out: Result[] = [];

    const createFor = (kind: DocKind) => {
      const doc = createDocument(kind);
      onClose();
      router.push(`/app/documents/${doc.id}`);
    };

    if (!q || "new create start".includes(q)) {
      out.push({ id: "new", group: "Actions", title: "Create a document", subtitle: "Choose from 13 modules", icon: <FilePlus2 size={16} />, run: () => { onClose(); onNew(); } });
    }

    for (const kind of DOC_KINDS) {
      const meta = docKindMeta(kind.kind);
      if (q && !`${meta.label} ${meta.plural} new`.toLowerCase().includes(q)) continue;
      out.push({
        id: `kind-${kind.kind}`,
        group: "Create",
        title: `New ${meta.label.toLowerCase()}`,
        subtitle: `${kind.templateCount} designs`,
        icon: <FileText size={16} />,
        run: () => createFor(kind.kind),
      });
      if (out.length > 40) break;
    }

    for (const doc of documents) {
      const haystack = documentSearchText(doc);
      if (q && !haystack.includes(q)) continue;
      out.push({
        id: doc.id,
        group: "Documents",
        title: doc.title,
        subtitle: `${doc.number} · ${relativeTime(doc.updatedAt)}${doc.payload.amountPaid ? ` · ${formatMoney(doc.payload.amountPaid, doc.currency)}` : ""}`,
        icon: <FileText size={16} />,
        run: () => {
          onClose();
          router.push(`/app/documents/${doc.id}`);
        },
      });
      if (out.length > 60) break;
    }

    if (q) {
      for (const template of ALL_TEMPLATES) {
        if (!`${template.name} ${template.category} ${template.kind} ${template.tags.join(" ")}`.toLowerCase().includes(q)) continue;
        out.push({
          id: `tpl-${template.id}`,
          group: "Templates",
          title: template.name,
          subtitle: `${docKindMeta(template.kind).label} · ${template.category}`,
          icon: <Sparkles size={16} />,
          run: () => {
            const doc = createDocument(template.kind, { templateId: template.id });
            onClose();
            router.push(`/app/documents/${doc.id}`);
          },
        });
        if (out.length > 80) break;
      }

      for (const business of businesses) {
        if (!`${business.name} ${business.city} ${business.email}`.toLowerCase().includes(q)) continue;
        out.push({
          id: business.id,
          group: "Businesses",
          title: business.name,
          subtitle: [business.city, business.phone].filter(Boolean).join(" · "),
          icon: <Building2 size={16} />,
          run: () => {
            onClose();
            router.push(`/app/businesses/${business.id}`);
          },
        });
      }
    }

    if (!q) {
      out.push(
        { id: "nav-dash", group: "Go to", title: "Dashboard", icon: <LayoutDashboard size={16} />, run: () => { onClose(); router.push("/app"); } },
        { id: "nav-settings", group: "Go to", title: "Settings", icon: <Settings size={16} />, run: () => { onClose(); router.push("/app/settings"); } },
      );
    }

    return out.slice(0, 60);
  }, [query, documents, businesses, createDocument, onClose, onNew, router]);

  useEffect(() => setCursor(0), [query]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((c) => Math.min(results.length - 1, c + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      results[cursor]?.run();
    }
  };

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const grouped = useMemo(() => {
    const map = new Map<string, Result[]>();
    results.forEach((result, index) => {
      const list = map.get(result.group) ?? [];
      list.push({ ...result, id: `${result.id}-${index}` });
      map.set(result.group, list);
    });
    return map;
  }, [results]);

  let flatIndex = -1;

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="-mx-5 -my-4">
        <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
          <Search size={17} className="text-fg-subtle" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search documents, templates, businesses, or type to create…"
            className="w-full bg-transparent text-[0.9375rem] text-fg outline-none placeholder:text-fg-subtle"
          />
          <span className="kbd">Esc</span>
        </div>
        <div ref={listRef} className="max-h-[62vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <p className="px-4 py-10 text-center text-[0.8125rem] text-fg-muted">
              Nothing matched “{query}”. Try a document number, a client name or an amount.
            </p>
          ) : (
            Array.from(grouped.entries()).map(([group, items]) => (
              <div key={group} className="pb-1">
                <div className="px-4 pb-1 pt-2 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-fg-subtle">{group}</div>
                {items.map((item) => {
                  flatIndex += 1;
                  const index = flatIndex;
                  const active = index === cursor;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-index={index}
                      onMouseEnter={() => setCursor(index)}
                      onClick={item.run}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
                      style={{ background: active ? "var(--surface-3)" : "transparent" }}
                    >
                      <span className="shrink-0 text-fg-subtle">{item.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.875rem] font-medium text-fg">{item.title}</span>
                        {item.subtitle ? <span className="block truncate text-[0.75rem] text-fg-subtle">{truncate(item.subtitle, 70)}</span> : null}
                      </span>
                      <ArrowRight size={14} className="shrink-0 text-fg-subtle" style={{ opacity: active ? 1 : 0 }} />
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
