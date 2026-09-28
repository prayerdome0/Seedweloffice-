"use client";

import { useMemo, useState } from "react";
import { Check, Image as ImageIcon, Palette, RotateCcw, Type } from "lucide-react";
import { Badge, Button, Field, Input, Select, Segmented, Switch } from "@/components/ui";
import { optimiseImage } from "@/lib/utils";
import { useWorkspace } from "@/store/workspace";
import { templatesFor } from "@/templates";
import { FONTS, TEMPLATE_CATEGORIES } from "@/lib/constants";
import { ACCENTS, accentById } from "@/lib/theme";
import { TemplateThumb } from "./template-thumb";
import { defaultQrTarget } from "@/lib/qr";

import { toast } from "@/components/ui/toast";
import type { BusinessProfile, DesignSettings, DocKind, FontKey } from "@/lib/types";

/** Everything about how the document looks — templates, colour, type, marks. */
export function DesignPanel({
  kind,
  design,
  business,
  onChange,
  onApplyTemplate,
}: {
  kind: DocKind;
  design: DesignSettings;
  business: BusinessProfile | null;
  onChange: (patch: Partial<DesignSettings>) => void;
  onApplyTemplate: (templateId: string) => void;
}) {
  const updateBusiness = useWorkspace((s) => s.saveBusiness);
  const [category, setCategory] = useState<string>("all");
  const templates = useMemo(() => {
    const list = templatesFor(kind);
    return category === "all" ? list : list.filter((t) => t.category === category);
  }, [kind, category]);

  const upload = async (file: File | undefined, field: "logoDataUrl" | "signatureDataUrl" | "stampDataUrl") => {
    if (!file) return;
    try {
      const { dataUrl } = await optimiseImage(file, { maxWidth: field === "logoDataUrl" ? 720 : 520, maxHeight: field === "logoDataUrl" ? 720 : 520, maxBytes: 400_000 });
      onChange({ [field]: dataUrl } as Partial<DesignSettings>);
      if (business) updateBusiness({ ...business, [field]: dataUrl } as BusinessProfile);
      toast.success("Image added", "It is saved to this business profile for every future document.");
    } catch {
      toast.error("Could not read that image", "Try a PNG or JPG under 5 MB.");
    }
  };

  return (
    <div className="space-y-5">
      <section>
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-[0.875rem] font-semibold text-fg">
            <Palette size={15} /> Design
          </h3>
          <Badge tone="neutral">{templatesFor(kind).length} for this module</Badge>
        </div>
        <Segmented
          value={category}
          onChange={setCategory}
          size="sm"
          options={[{ value: "all", label: "All" }, ...TEMPLATE_CATEGORIES.map((c) => ({ value: c.id as string, label: c.label }))]}
        />
        <div className="mt-3 grid max-h-[340px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {templates.map((template) => {
            const active = design.templateId === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onApplyTemplate(template.id)}
                className="rounded-xl border p-2.5 text-left transition-all"
                style={{
                  borderColor: active ? "var(--brand)" : "var(--border)",
                  background: active ? "color-mix(in oklab, var(--brand) 8%, var(--surface))" : "var(--surface)",
                  boxShadow: active ? "0 0 0 3px color-mix(in oklab, var(--brand) 16%, transparent)" : undefined,
                }}
              >
                <TemplateThumb accent={accentById(design.accent).hex} variant={template.category} active={active} />
                <div className="mt-2 flex items-start justify-between gap-1.5">
                  <div className="min-w-0">
                    <div className="truncate text-[0.8125rem] font-semibold text-fg">{template.name}</div>
                    <div className="truncate text-[0.6875rem] text-fg-subtle">{template.category}</div>
                  </div>
                  {active ? <Check size={14} style={{ color: "var(--brand)" }} /> : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
        <h3 className="mb-2.5 flex items-center gap-2 text-[0.875rem] font-semibold text-fg">
          <Type size={15} /> Colour & type
        </h3>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
          {ACCENTS.map((accent) => {
            const active = design.accent.toLowerCase() === accent.hex.toLowerCase();
            return (
              <button
                key={accent.id}
                type="button"
                title={`${accent.name} — ${accent.note}`}
                onClick={() => onChange({ accent: accent.hex, accentSoft: `color-mix(in oklab, ${accent.hex} 12%, transparent)` })}
                className="flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all"
                style={{ borderColor: active ? "var(--brand)" : "var(--border)", background: "var(--surface)" }}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: accent.hex }}>
                  {active ? <Check size={13} color="#fff" /> : null}
                </span>
                <span className="w-full truncate text-center text-[0.625rem] font-medium text-fg-muted">{accent.name.split(" ")[1] ?? accent.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Heading font">
            <Select value={design.fontHeading} onChange={(event) => onChange({ fontHeading: event.target.value as FontKey })}>
              {FONTS.map((font) => (
                <option key={font.key} value={font.key}>
                  {font.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Body font">
            <Select value={design.fontBody} onChange={(event) => onChange({ fontBody: event.target.value as FontKey })}>
              {FONTS.map((font) => (
                <option key={font.key} value={font.key}>
                  {font.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={`Text size · ${Math.round(design.fontScale * 100)}%`}>
            <input
              type="range"
              min="0.85"
              max="1.2"
              step="0.05"
              value={design.fontScale}
              onChange={(event) => onChange({ fontScale: Number(event.target.value) })}
              className="w-full accent-[var(--brand)]"
            />
          </Field>
          <Field label="Paper size">
            <Segmented
              value={design.paperSize}
              onChange={(value) => onChange({ paperSize: value })}
              options={[
                { value: "a4", label: "A4" },
                { value: "letter", label: "US Letter" },
              ]}
            />
          </Field>
          <Field label="Spacing">
            <Segmented
              value={design.density}
              onChange={(value) => onChange({ density: value })}
              options={[
                { value: "comfortable", label: "Comfortable" },
                { value: "compact", label: "Compact" },
              ]}
            />
          </Field>
        </div>
      </section>

      <section className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
        <h3 className="mb-2.5 flex items-center gap-2 text-[0.875rem] font-semibold text-fg">
          <ImageIcon size={15} /> Marks & details
        </h3>
        <div className="space-y-3">
          <Switch checked={design.showLogo} onChange={(v) => onChange({ showLogo: v })} label="Show logo" description="Uses the logo on this business profile." />
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-3 py-2.5 text-[0.75rem] font-medium text-fg-muted transition-colors hover:border-[var(--border-strong)]" style={{ borderColor: "var(--border-strong)" }}>
              <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={(event) => upload(event.target.files?.[0], "logoDataUrl")} />
              {design.logoDataUrl ? "Replace logo" : "Upload logo"}
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-3 py-2.5 text-[0.75rem] font-medium text-fg-muted transition-colors hover:border-[var(--border-strong)]" style={{ borderColor: "var(--border-strong)" }}>
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => upload(event.target.files?.[0], "signatureDataUrl")} />
              {design.signatureDataUrl ? "Replace signature" : "Upload signature"}
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-3 py-2.5 text-[0.75rem] font-medium text-fg-muted transition-colors hover:border-[var(--border-strong)]" style={{ borderColor: "var(--border-strong)" }}>
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => upload(event.target.files?.[0], "stampDataUrl")} />
              {design.stampDataUrl ? "Replace stamp" : "Upload stamp"}
            </label>
          </div>

          <Switch checked={design.showSignature} onChange={(v) => onChange({ showSignature: v })} label="Signature block" description="Signature image plus name and role." />
          <Switch checked={design.showStamp} onChange={(v) => onChange({ showStamp: v })} label="Company stamp" />
          <Switch checked={design.showBankDetails} onChange={(v) => onChange({ showBankDetails: v })} label="Payment details" description="Bank, mobile money and branch information." />
          <Switch checked={design.showSocial} onChange={(v) => onChange({ showSocial: v })} label="Social handles" />
          <Switch
            checked={design.showQr}
            onChange={(v) => onChange({ showQr: v, qrValue: design.qrValue || defaultQrTarget(kind, "", business) })}
            label="QR code"
            description="Verify the document or open your payment page."
          />
          {design.showQr ? (
            <Field label="QR destination" help="Leave blank to point at the document verification link.">
              <Input value={design.qrValue ?? ""} placeholder="https://…" onChange={(event) => onChange({ qrValue: event.target.value })} />
            </Field>
          ) : null}
          <Switch checked={design.showWatermark} onChange={(v) => onChange({ showWatermark: v })} label="Watermark" description="Useful for DRAFT or SPECIMEN copies." />
          {design.showWatermark ? (
            <Field label="Watermark text">
              <Input value={design.watermarkText} placeholder="DRAFT" onChange={(event) => onChange({ watermarkText: event.target.value })} />
            </Field>
          ) : null}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw size={14} />}
            onClick={() =>
              onChange({
                showLogo: true,
                showQr: false,
                showSignature: true,
                showStamp: false,
                showWatermark: false,
                showBankDetails: true,
                showSocial: true,
                showNotes: true,
                fontScale: 1,
                density: "comfortable",
                fontHeading: "jakarta",
                fontBody: "inter",
              })
            }
          >
            Reset design options
          </Button>
        </div>
      </section>
    </div>
  );
}
