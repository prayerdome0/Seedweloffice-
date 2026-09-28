"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Grid2X2, Rows3, Sparkles } from "lucide-react";
import { Badge, Button, ButtonLink, Card, EmptyState, Segmented } from "@/components/ui";
import { TemplateThumb } from "@/components/editor/template-thumb";
import { LazyPaper } from "@/components/document/lazy-paper";
import { useWorkspace } from "@/store/workspace";
import { TEMPLATE_CATEGORIES, docKindMeta } from "@/lib/constants";
import { templatesFor } from "@/templates";
import { toast } from "@/components/ui/toast";
import { blankPayload } from "@/lib/documents/schema";
import { createDraft } from "@/lib/documents/compute";
import type { DocKind, TemplateCategory } from "@/lib/types";

export default function TemplateGalleryPage() {
  const params = useParams<{ kind: string }>();
  const router = useRouter();
  const kind = (params?.kind ?? "invoice") as DocKind;
  const meta = docKindMeta(kind);
  const designs = templatesFor(kind);

  const businesses = useWorkspace((s) => s.businesses);
  const documents = useWorkspace((s) => s.documents);
  const settings = useWorkspace((s) => s.settings);
  const updateSettings = useWorkspace((s) => s.updateSettings);
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [density, setDensity] = useState<"grid" | "list">("grid");

  const business = businesses.find((b) => b.isDefault) ?? businesses[0] ?? null;
  const accent = business?.primaryColor ?? "#0e908f";

  /** Preview the user’s own document, or a blank new draft. */
  const sample = useMemo(() => {
    const existing = documents.find((d) => d.kind === kind);
    if (existing) return existing;
    return createDraft(kind, {
      ownerId: "preview",
      business,
      templateId: designs[0]?.id ?? "",
      payload: blankPayload(kind),
    });
  }, [documents, kind, business, designs]);

  const filtered = category === "all" ? designs : designs.filter((d) => d.category === category);

  const start = (templateId: string) => {
    const draft = createDraft(kind, {
      ownerId: "new",
      business,
      existing: documents,
      templateId,
      payload: blankPayload(kind),
    });
    useWorkspace.getState().saveDocument(draft, { silent: true });
    router.push(`/app/documents/${draft.id}`);
  };

  if (!designs.length) {
    return (
      <Card>
        <EmptyState
          icon={<Grid2X2 size={20} />}
          title="No designs for this module"
          description="Pick a different module from the templates home page."
          action={<ButtonLink variant="brand" href="/app/templates">Back to library</ButtonLink>}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Link href="/app/templates" className="btn btn-ghost btn-icon btn-sm mt-0.5" aria-label="Back to library">
            <ArrowLeft size={17} />
          </Link>
          <div>
            <h1 className="text-[1.375rem] font-semibold tracking-tight text-fg sm:text-[1.5rem]">{meta.plural} designs</h1>
            <p className="mt-1 max-w-2xl text-[0.875rem] text-fg-muted">
              {designs.length} layouts, previewed with real content from your workspace. {meta.description}
            </p>
          </div>
        </div>
        <Button variant="brand" onClick={() => start(settings.defaultTemplate?.[kind] ?? designs[0].id)} icon={<Sparkles size={16} />}>
          Use default design
        </Button>
      </header>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-3">
        <Segmented
          value={category}
          onChange={setCategory}
          options={[{ value: "all", label: `All ${designs.length}` }, ...TEMPLATE_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))]}
        />
        <Segmented
          value={density}
          onChange={setDensity}
          options={[
            { value: "grid", label: "Grid", icon: <Grid2X2 size={13} /> },
            { value: "list", label: "List", icon: <Rows3 size={13} /> },
          ]}
        />
      </Card>

      {density === "grid" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((design) => {
            const isDefault = settings.defaultTemplate?.[kind] === design.id;
            return (
              <Card key={design.id} className="overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-2 border-b px-3.5 py-3" style={{ borderColor: "var(--border)" }}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[0.875rem] font-semibold text-fg">{design.name}</h2>
                      <Badge tone={design.category === "creative" ? "gold" : design.category === "modern" ? "brand" : "neutral"}>{design.category}</Badge>
                      {design.premium ? <Badge tone="gold">Premium</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-[0.75rem] leading-relaxed text-fg-muted">{design.description}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={isDefault ? <Check size={14} /> : undefined}
                      onClick={() => {
                        updateSettings({ defaultTemplate: { ...settings.defaultTemplate, [kind]: isDefault ? undefined : design.id } });
                        toast.success(isDefault ? "Default cleared" : "Default design saved");
                      }}
                    >
                      {isDefault ? "Default" : "Set default"}
                    </Button>
                    <Button variant="brand" size="sm" onClick={() => start(design.id)}>
                      Use design
                    </Button>
                  </div>
                </div>
                <div className="p-3" style={{ background: "var(--canvas-tint)" }}>
                  <LazyPaper doc={{ ...sample, design: { ...sample.design, templateId: design.id, accent: sample.design.accent || accent }, createdAt: sample.createdAt, updatedAt: sample.updatedAt }} business={business} maxScale={0.62} placeholderHeight={720} />
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          {filtered.map((design) => (
            <div key={design.id} className="flex items-center gap-3 border-b px-3.5 py-3 last:border-0" style={{ borderColor: "var(--border)" }}>
              <div className="hidden w-28 shrink-0 sm:block">
                <TemplateThumb accent={accent} variant={design.category} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[0.875rem] font-semibold text-fg">{design.name}</span>
                  <Badge tone="neutral">{design.category}</Badge>
                </div>
                <p className="mt-0.5 text-[0.75rem] leading-relaxed text-fg-muted">{design.description}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => start(design.id)}>
                Use
              </Button>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
