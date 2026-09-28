"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Check, LayoutGrid, Search, Sparkles } from "lucide-react";
import { Badge, Button, Card, Input, Segmented } from "@/components/ui";
import { TemplateThumb } from "@/components/editor/template-thumb";
import { QuickCreate } from "@/components/app/quick-create";
import { DOC_KINDS, TEMPLATE_CATEGORIES } from "@/lib/constants";
import { TEMPLATES, totalTemplateCount } from "@/templates";
import { useWorkspace } from "@/store/workspace";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import type { TemplateCategory } from "@/lib/types";

export default function TemplatesPage() {
  const router = useRouter();
  const createDocument = useWorkspace((s) => s.createDocument);
  const businesses = useWorkspace((s) => s.businesses);
  const settings = useWorkspace((s) => s.settings);
  const updateSettings = useWorkspace((s) => s.updateSettings);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [quick, setQuick] = useState(false);

  const accent = businesses.find((b) => b.isDefault)?.primaryColor ?? "#0e908f";

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DOC_KINDS.map((kind) => {
      const designs = TEMPLATES[kind.kind].filter((t) =>
        (category === "all" || t.category === category) && (!q || `${t.name} ${t.description} ${t.tags.join(" ")} ${kind.label}`.toLowerCase().includes(q)),
      );
      return { kind, designs };
    }).filter((group) => group.designs.length > 0);
  }, [query, category]);

  const total = groups.reduce((sum, group) => sum + group.designs.length, 0);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.375rem] font-semibold tracking-tight text-fg sm:text-[1.5rem]">Template library</h1>
          <p className="mt-1 text-[0.875rem] text-fg-muted">
            {totalTemplateCount} hand-built designs across 13 modules. Every design is included in your plan — switch freely, your content stays put.
          </p>
        </div>
        <Button variant="brand" onClick={() => setQuick(true)} icon={<Sparkles size={16} />}>
          Start a document
        </Button>
      </header>

      <Card className="flex flex-wrap items-center gap-3 p-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
          <Search size={15} className="shrink-0 text-fg-subtle" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search designs — “ledger”, “minimal”, “creative”, “timeline”…"
            className="w-full min-w-0 bg-transparent text-[0.875rem] text-fg outline-none placeholder:text-fg-subtle"
          />
        </div>
        <Segmented
          value={category}
          onChange={setCategory}
          options={[{ value: "all", label: "All" }, ...TEMPLATE_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))]}
        />
      </Card>

      {groups.length === 0 ? (
        <Card>
          <div className="px-6 py-16 text-center">
            <p className="text-[0.9375rem] font-semibold text-fg">No designs matched “{query}”</p>
            <p className="mt-1 text-[0.8125rem] text-fg-muted">Try a category like “minimal”, or clear the search.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setQuery(""); setCategory("all"); }}>
              Clear filters
            </Button>
          </div>
        </Card>
      ) : (
        groups.map(({ kind, designs }) => (
          <section key={kind.kind}>
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[0.6875rem] font-bold text-white" style={{ background: kind.accent }}>
                  {kind.label.slice(0, 2)}
                </span>
                <h2 className="text-[0.9375rem] font-semibold text-fg">{kind.plural}</h2>
                <Badge tone="neutral">{TEMPLATES[kind.kind].length} designs</Badge>
                {settings.defaultTemplate?.[kind.kind] ? <Badge tone="brand">Default set</Badge> : null}
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/app/templates/${kind.kind}`} className="text-[0.8125rem] font-semibold text-[var(--brand)]">
                  Full gallery
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {designs.slice(0, 4).map((design) => {
                const isDefault = settings.defaultTemplate?.[kind.kind] === design.id;
                return (
                  <Card key={design.id} className="group overflow-hidden">
                    <button
                      type="button"
                      className="block w-full p-2.5 text-left"
                      onClick={() => {
                        const doc = createDocument(kind.kind, { templateId: design.id });
                        router.push(`/app/documents/${doc.id}`);
                      }}
                    >
                      <TemplateThumb accent={accent} variant={design.category} active />
                      <div className="mt-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-[0.8125rem] font-semibold text-fg">{design.name}</div>
                          <div className="mt-0.5 line-clamp-2 text-[0.6875rem] leading-relaxed text-fg-muted">{design.description}</div>
                        </div>
                        <Badge tone={design.category === "creative" ? "gold" : design.category === "modern" ? "brand" : "neutral"}>{design.category}</Badge>
                      </div>
                    </button>
                    <div className="flex items-center justify-between gap-2 border-t px-2.5 py-2" style={{ borderColor: "var(--border)" }}>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-[0.6875rem] font-semibold"
                        style={{ color: isDefault ? "var(--brand)" : "var(--fg-subtle)" }}
                        onClick={() => {
                          updateSettings({ defaultTemplate: { ...settings.defaultTemplate, [kind.kind]: isDefault ? undefined : design.id } });
                          toast.success(isDefault ? "Default cleared" : "Default design saved", isDefault ? undefined : `${design.name} will be used for new ${kind.plural.toLowerCase()}.`);
                        }}
                      >
                        {isDefault ? <Check size={12} /> : null}
                        {isDefault ? "Default design" : "Set as default"}
                      </button>
                      <Link
                        href={`/app/templates/${kind.kind}`}
                        className="flex items-center gap-1 text-[0.6875rem] font-semibold text-[var(--brand)]"
                      >
                        Preview <ArrowRight size={11} />
                      </Link>
                    </div>
                  </Card>
                );
              })}
              {designs.length > 4 ? (
                <Link href={`/app/templates/${kind.kind}`} className="card card-interactive flex flex-col items-center justify-center gap-2 p-6 text-center">
                  <LayoutGrid size={18} className="text-fg-subtle" />
                  <span className="text-[0.8125rem] font-semibold text-fg">+{designs.length - 4} more</span>
                  <span className="text-[0.6875rem] text-fg-muted">See the full {kind.label.toLowerCase()} gallery</span>
                </Link>
              ) : null}
            </div>
          </section>
        ))
      )}

      <QuickCreate open={quick} onClose={() => setQuick(false)} />
    </div>
  );
}
