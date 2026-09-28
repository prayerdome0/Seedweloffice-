"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Wand2 } from "lucide-react";
import { Badge, ButtonLink, Card, Segmented } from "@/components/ui";
import { LazyPaper } from "@/components/document/lazy-paper";
import { TEMPLATE_CATEGORIES, docKindMeta } from "@/lib/constants";
import { templatesFor } from "@/templates";
import { demoBusinesses, demoDocuments } from "@/lib/seed";
import { createDraft } from "@/lib/documents/compute";
import { blankPayload } from "@/lib/documents/schema";
import type { DocKind, TemplateCategory } from "@/lib/types";

/**
 * Public, read-only design gallery.
 *
 * The marketing pages must show what the product actually produces, so this
 * renders real templates through the same preview engine the editor uses, with
 * realistic sample content rather than lorem ipsum.
 */
export function TemplateShowcase({ kind, limit, showFilters = false }: { kind: DocKind; limit?: number; showFilters?: boolean }) {
  const meta = docKindMeta(kind);
  const designs = templatesFor(kind);
  const [category, setCategory] = useState<TemplateCategory | "all">("all");

  const { sample, business } = useMemo(() => {
    const businesses = demoBusinesses("showcase");
    const documents = demoDocuments("showcase");
    const shared = businesses[0];
    const demo = documents.find((d) => d.kind === kind);
    if (demo) return { sample: demo, business: shared };
    return {
      sample: createDraft(kind, { ownerId: "showcase", business: shared, templateId: designs[0]?.id ?? "", payload: blankPayload(kind) }),
      business: shared,
    };
  }, [kind, designs]);

  const filtered = (category === "all" ? designs : designs.filter((d) => d.category === category)).slice(0, limit ?? designs.length);

  if (!designs.length) return null;

  return (
    <div className="space-y-4">
      {showFilters ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-3">
          <Segmented
            value={category}
            onChange={setCategory}
            options={[
              { value: "all", label: `All ${designs.length}` },
              ...TEMPLATE_CATEGORIES.map((item) => ({
              value: item.id,
              label: `${item.label} (${designs.filter((d) => d.category === item.id).length})`,
            })),
            ]}
          />
          <span className="text-[0.75rem] text-fg-subtle">
            {filtered.length} of {designs.length} shown
          </span>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((design) => (
          <Card key={design.id} className="overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b px-3.5 py-3" style={{ borderColor: "var(--border)" }}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[0.875rem] font-semibold text-fg">{design.name}</h3>
                  <Badge tone={design.category === "creative" ? "gold" : design.category === "modern" ? "brand" : "neutral"}>{design.category}</Badge>
                  {design.premium ? <Badge tone="gold">Premium</Badge> : null}
                </div>
                <p className="mt-0.5 text-[0.75rem] leading-relaxed text-fg-muted">{design.description}</p>
              </div>
              <ButtonLink
                href={`/sign-up?next=${encodeURIComponent(`/app/new/${kind}?template=${design.id}`)}`}
                variant="brand"
                size="sm"
              >
                Use this design
              </ButtonLink>
            </div>
            <div className="p-3" style={{ background: "var(--canvas-tint)" }}>
              <LazyPaper
                doc={{ ...sample, design: { ...sample.design, templateId: design.id, accent: sample.design.accent || business.primaryColor } }}
                business={business}
                maxScale={0.62}
                placeholderHeight={720}
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-3 p-4" style={{ background: "var(--surface-2)" }}>
        <div className="flex items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "color-mix(in oklab, var(--brand) 12%, var(--surface))", color: "var(--brand)" }}>
            <Wand2 size={17} />
          </span>
          <div>
            <div className="text-[0.875rem] font-semibold text-fg">Every design edits in place</div>
            <p className="mt-0.5 text-[0.8125rem] text-fg-muted">
              Change design at any time in the editor — your words, amounts and branding follow you. No retyping.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/sign-up?next=${encodeURIComponent(`/app/new/${kind}`)}`} variant="brand" trailingIcon={<ArrowRight size={15} />}>
            Start a {meta.label.toLowerCase()}
          </ButtonLink>
          <Link href="/templates" className="btn btn-outline">
            All modules
          </Link>
        </div>
      </div>
    </div>
  );
}
