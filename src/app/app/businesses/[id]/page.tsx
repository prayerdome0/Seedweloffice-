"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, Check, Image as ImageIcon, Landmark, Palette, Save, Share2, Sparkles } from "lucide-react";
import { Badge, Button, ButtonLink, Card, EmptyState, Field, Input, Segmented, Select, Switch, Textarea } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { AssistDialog, type AssistTarget } from "@/components/editor/assist-dialog";
import { useWorkspace } from "@/store/workspace";
import { CURRENCIES, COUNTRIES } from "@/lib/constants";
import { ACCENTS } from "@/lib/theme";
import { optimiseImage } from "@/lib/utils";
import type { BusinessProfile } from "@/lib/types";

type Section = "identity" | "contact" | "branding" | "payment" | "documents";

const SECTIONS: { value: Section; label: string; icon: React.ReactNode }[] = [
  { value: "identity", label: "Identity", icon: <Building2 size={14} /> },
  { value: "contact", label: "Contact & address", icon: <Share2 size={14} /> },
  { value: "branding", label: "Branding", icon: <Palette size={14} /> },
  { value: "payment", label: "Banking", icon: <Landmark size={14} /> },
  { value: "documents", label: "Document defaults", icon: <ImageIcon size={14} /> },
];

export default function BusinessDetailPage() {
  const params = useParams<{ id: string }>();
  const stored = useWorkspace((s) => s.businesses.find((b) => b.id === params?.id));
  const saveBusiness = useWorkspace((s) => s.saveBusiness);
  const [draft, setDraft] = useState<BusinessProfile | null>(null);
  const [section, setSection] = useState<Section>("identity");
  const [assist, setAssist] = useState<AssistTarget | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (stored && draft?.id !== stored.id) setDraft(structuredClone(stored));
  }, [stored, draft?.id]);

  const patch = (values: Partial<BusinessProfile>) => setDraft((current) => (current ? { ...current, ...values } : current));

  const commit = useMemo(
    () => () => {
      if (!draft) return;
      saveBusiness(draft);
      setSavedAt(Date.now());
      toast.success("Business profile saved", "New documents will use these details.");
    },
    [draft, saveBusiness],
  );

  const upload = async (file: File | undefined, field: "logoDataUrl" | "signatureDataUrl" | "stampDataUrl") => {
    if (!file) return;
    try {
      const { dataUrl } = await optimiseImage(file, {
        maxWidth: field === "logoDataUrl" ? 720 : 520,
        maxHeight: field === "logoDataUrl" ? 720 : 520,
        maxBytes: 400_000,
      });
      patch({ [field]: dataUrl } as Partial<BusinessProfile>);
      toast.success("Image added", "Press Save to keep it on this profile.");
    } catch {
      toast.error("Could not read that image", "Try a PNG or JPG under 5 MB.");
    }
  };

  if (!stored || !draft) {
    return (
      <Card>
        <EmptyState
          icon={<Building2 size={20} />}
          title="Profile not found"
          description="It may have been removed from this workspace."
          action={<ButtonLink variant="brand" href="/app/businesses">Back to profiles</ButtonLink>}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Link href="/app/businesses" className="btn btn-ghost btn-icon btn-sm mt-0.5" aria-label="Back">
            <ArrowLeft size={17} />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[1.25rem] font-semibold tracking-tight text-fg">{draft.name}</h1>
              {draft.isDefault ? <Badge tone="brand" dot>Default profile</Badge> : null}
            </div>
            <p className="mt-1 text-[0.8125rem] text-fg-muted">
              Everything here appears on the documents you issue from this profile.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.75rem] text-fg-subtle">{savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}` : "Unsaved changes save on click"}</span>
          <Button variant="brand" icon={<Save size={15} />} onClick={commit}>
            Save profile
          </Button>
        </div>
      </header>

      <div className="no-scrollbar overflow-x-auto">
        <Segmented value={section} onChange={setSection} options={SECTIONS} />
      </div>

      <Card className="p-4 sm:p-5">
        {section === "identity" ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Trading name" required>
                <Input value={draft.name} onChange={(event) => patch({ name: event.target.value })} />
              </Field>
              <Field label="Registered / legal name">
                <Input value={draft.legalName ?? ""} placeholder="As registered with PACRA" onChange={(event) => patch({ legalName: event.target.value })} />
              </Field>
              <Field label="Tagline" className="sm:col-span-2" hint="Shown under your logo on proposals and profiles.">
                <Input value={draft.tagline ?? ""} placeholder="What you do, in one line" onChange={(event) => patch({ tagline: event.target.value })} />
              </Field>
              <Field label="Registration number">
                <Input value={draft.registrationNumber ?? ""} onChange={(event) => patch({ registrationNumber: event.target.value })} />
              </Field>
              <Field label="Tax identification">
                <Input value={draft.taxId ?? ""} placeholder="TPIN / VAT number" onChange={(event) => patch({ taxId: event.target.value })} />
              </Field>
              <Field label="Tax label">
                <Select value={draft.taxLabel ?? "VAT"} onChange={(event) => patch({ taxLabel: event.target.value })}>
                  {["VAT", "GST", "TVA", "IVA", "Sales Tax", "None"].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Industry / sector" hint="Used to tailor the writing assistant.">
                <Input value={draft.industry ?? ""} placeholder="e.g. construction, training, retail" onChange={(event) => patch({ industry: event.target.value })} />
              </Field>
            </div>
          </div>
        ) : null}

        {section === "contact" ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Email" required>
                <Input type="email" value={draft.email} onChange={(event) => patch({ email: event.target.value })} />
              </Field>
              <Field label="Phone" required>
                <Input type="tel" value={draft.phone} onChange={(event) => patch({ phone: event.target.value })} />
              </Field>
              <Field label="Alternative phone">
                <Input type="tel" value={draft.altPhone ?? ""} onChange={(event) => patch({ altPhone: event.target.value })} />
              </Field>
              <Field label="Website">
                <Input value={draft.website ?? ""} placeholder="yourcompany.com" onChange={(event) => patch({ website: event.target.value })} />
              </Field>
              <Field label="Address line 1" className="sm:col-span-2">
                <Input value={draft.addressLine1} onChange={(event) => patch({ addressLine1: event.target.value })} />
              </Field>
              <Field label="Address line 2" className="sm:col-span-2">
                <Input value={draft.addressLine2 ?? ""} onChange={(event) => patch({ addressLine2: event.target.value })} />
              </Field>
              <Field label="City / town">
                <Input value={draft.city} onChange={(event) => patch({ city: event.target.value })} />
              </Field>
              <Field label="Region / province">
                <Input value={draft.region ?? ""} onChange={(event) => patch({ region: event.target.value })} />
              </Field>
              <Field label="Postal code">
                <Input value={draft.postalCode ?? ""} onChange={(event) => patch({ postalCode: event.target.value })} />
              </Field>
              <Field label="Country">
                <Select value={draft.country} onChange={(event) => patch({ country: event.target.value })}>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid gap-3 border-t pt-4 sm:grid-cols-2" style={{ borderColor: "var(--border)" }}>
              <Field label="WhatsApp">
                <Input type="tel" value={draft.whatsapp ?? ""} onChange={(event) => patch({ whatsapp: event.target.value })} />
              </Field>
              <Field label="LinkedIn">
                <Input value={draft.linkedin ?? ""} placeholder="linkedin.com/company/…" onChange={(event) => patch({ linkedin: event.target.value })} />
              </Field>
              <Field label="Facebook">
                <Input value={draft.facebook ?? ""} onChange={(event) => patch({ facebook: event.target.value })} />
              </Field>
              <Field label="Instagram">
                <Input value={draft.instagram ?? ""} onChange={(event) => patch({ instagram: event.target.value })} />
              </Field>
              <Field label="X / Twitter">
                <Input value={draft.twitter ?? ""} onChange={(event) => patch({ twitter: event.target.value })} />
              </Field>
            </div>
          </div>
        ) : null}

        {section === "branding" ? (
          <div className="space-y-5">
            <div>
              <span className="label">Primary colour</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {ACCENTS.map((accent) => (
                  <button
                    key={accent.id}
                    type="button"
                    title={accent.name}
                    onClick={() => patch({ primaryColor: accent.hex })}
                    className="flex h-9 items-center gap-2 rounded-xl border px-2.5 transition-all"
                    style={{ borderColor: draft.primaryColor === accent.hex ? "var(--brand)" : "var(--border)", background: "var(--surface)" }}
                  >
                    <span className="h-5 w-5 rounded-full" style={{ background: accent.hex }} />
                    <span className="text-[0.75rem] font-medium text-fg-muted">{accent.name}</span>
                    {draft.primaryColor === accent.hex ? <Check size={13} style={{ color: "var(--brand)" }} /> : null}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Custom primary colour" help="Any hex value, e.g. #0e908f">
                  <Input value={draft.primaryColor} onChange={(event) => patch({ primaryColor: event.target.value })} />
                </Field>
                <Field label="Secondary accent">
                  <Input value={draft.accentColor} onChange={(event) => patch({ accentColor: event.target.value })} />
                </Field>
              </div>
            </div>

            <div className="grid gap-3 border-t pt-4 sm:grid-cols-3" style={{ borderColor: "var(--border)" }}>
              {(
                [
                  { field: "logoDataUrl", label: "Logo", hint: "PNG or SVG, transparent background works best." },
                  { field: "signatureDataUrl", label: "Signature", hint: "A photo or scan on a white background." },
                  { field: "stampDataUrl", label: "Company stamp", hint: "Round or rectangular stamp image." },
                ] as const
              ).map((item) => (
                <div key={item.field} className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
                  <div className="text-[0.8125rem] font-semibold text-fg">{item.label}</div>
                  <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-fg-subtle">{item.hint}</p>
                  <div className="mt-2 flex h-20 items-center justify-center rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
                    {draft[item.field] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={draft[item.field]} alt="" className="max-h-16 max-w-full object-contain" />
                    ) : (
                      <span className="text-[0.6875rem] text-fg-subtle">Nothing uploaded</span>
                    )}
                  </div>
                  <label className="btn btn-outline btn-sm mt-2 w-full cursor-pointer">
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(event) => upload(event.target.files?.[0], item.field)} />
                    {draft[item.field] ? "Replace" : "Upload"}
                  </label>
                  {draft[item.field] ? (
                    <button type="button" className="mt-1.5 w-full text-[0.6875rem] font-semibold text-fg-subtle" onClick={() => patch({ [item.field]: undefined } as Partial<BusinessProfile>)}>
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="grid gap-3 border-t pt-4 sm:grid-cols-2" style={{ borderColor: "var(--border)" }}>
              <Field label="Signature name">
                <Input value={draft.signatureName ?? ""} onChange={(event) => patch({ signatureName: event.target.value })} />
              </Field>
              <Field label="Signature role">
                <Input value={draft.signatureRole ?? ""} onChange={(event) => patch({ signatureRole: event.target.value })} />
              </Field>
            </div>
          </div>
        ) : null}

        {section === "payment" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Bank name">
              <Input value={draft.bankName ?? ""} onChange={(event) => patch({ bankName: event.target.value })} />
            </Field>
            <Field label="Account name">
              <Input value={draft.bankAccountName ?? ""} onChange={(event) => patch({ bankAccountName: event.target.value })} />
            </Field>
            <Field label="Account number">
              <Input value={draft.bankAccountNumber ?? ""} onChange={(event) => patch({ bankAccountNumber: event.target.value })} />
            </Field>
            <Field label="Branch">
              <Input value={draft.bankBranch ?? ""} onChange={(event) => patch({ bankBranch: event.target.value })} />
            </Field>
            <Field label="SWIFT / sort code">
              <Input value={draft.bankSwift ?? ""} onChange={(event) => patch({ bankSwift: event.target.value })} />
            </Field>
            <Field label="Mobile money">
              <Input value={draft.mobileMoney ?? ""} placeholder="Airtel Money 097…" onChange={(event) => patch({ mobileMoney: event.target.value })} />
            </Field>
            <p className="text-[0.75rem] text-fg-subtle sm:col-span-2">
              These details print in the payment block on invoices, quotations and receipts. Switch the block off per document in the Design tab.
            </p>
          </div>
        ) : null}

        {section === "documents" ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Default currency">
                <Select value={draft.currency} onChange={(event) => patch({ currency: event.target.value })}>
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} — {currency.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Number prefix" help="Used for every document issued from this profile.">
                <Input value={draft.invoicePrefix} onChange={(event) => patch({ invoicePrefix: event.target.value.toUpperCase() })} />
              </Field>
              <Field label="Default tax rate %">
                <Input type="number" min="0" step="0.01" value={draft.taxRate} onChange={(event) => patch({ taxRate: Number(event.target.value) || 0 })} />
              </Field>
              <Field label="Payment terms (days)">
                <Input type="number" min="0" value={draft.paymentTerms} onChange={(event) => patch({ paymentTerms: Number(event.target.value) || 0 })} />
              </Field>
            </div>

            <Field label="Footer note" help="A friendly line that prints at the foot of your documents.">
              <Textarea rows={2} value={draft.footerNote ?? ""} onChange={(event) => patch({ footerNote: event.target.value })} />
            </Field>

            <div className="space-y-3 border-t pt-4" style={{ borderColor: "var(--border)" }}>
              <Switch checked={draft.isDefault} onChange={(value) => patch({ isDefault: value })} label="Use as the default profile" description="New documents start with this profile selected." />
            </div>

            <div className="flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: "var(--border)" }}>
              <Button
                variant="outline"
                size="sm"
                icon={<Sparkles size={14} />}
                onClick={() => setAssist({ field: "companyIntro", label: "company introduction", type: "text" })}
              >
                Draft a company introduction
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Sparkles size={14} />}
                onClick={() => setAssist({ field: "serviceDescription", label: "service description", type: "text" })}
              >
                Draft a service description
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <AssistDialog
        open={Boolean(assist)}
        onClose={() => setAssist(null)}
        target={assist}
        doc={null}
        business={draft}
        onApply={(result) => {
          if (!assist) return;
          if (result.lines?.length) {
            toast.success("Draft ready", "Copy the lines you want into your document.");
            return;
          }
          const key = assist.field === "companyIntro" ? "tagline" : "footerNote";
          patch({ [key]: result.text } as Partial<BusinessProfile>);
          toast.success("Draft added", "Press Save profile to keep it.");
        }}
      />
    </div>
  );
}
