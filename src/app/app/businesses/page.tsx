"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Building2, Check, Mail, MapPin, Phone, Plus, Star } from "lucide-react";
import { Badge, Button, Card, EmptyState, Field, Input, Modal, SectionHeader } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth";
import { useWorkspace } from "@/store/workspace";
import { uid } from "@/lib/utils";
import { PLANS } from "@/lib/constants";
import type { BusinessProfile } from "@/lib/types";

export default function BusinessesPage() {
  const { user } = useAuth();
  const businesses = useWorkspace((s) => s.businesses);
  const documents = useWorkspace((s) => s.documents);
  const saveBusiness = useWorkspace((s) => s.saveBusiness);
  const deleteBusiness = useWorkspace((s) => s.deleteBusiness);
  const setDefaultBusiness = useWorkspace((s) => s.setDefaultBusiness);
  const subscription = useWorkspace((s) => s.subscription);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const plan = PLANS.find((p) => p.id === subscription.plan) ?? PLANS[0];
  const limit = plan.id === "business" || plan.id === "enterprise" ? 25 : plan.id === "professional" ? 5 : 1;

  const create = () => {
    if (!name.trim()) return;
    const profile: BusinessProfile = {
      id: uid("biz"),
      ownerId: user?.uid ?? "local",
      name: name.trim(),
      email: user?.email ?? "",
      phone: "",
      addressLine1: "",
      city: "",
      country: user?.country ?? "Zambia",
      primaryColor: "#0e908f",
      accentColor: "#f0a90e",
      currency: "ZMW",
      invoicePrefix: "INV",
      taxLabel: "VAT",
      taxRate: 16,
      paymentTerms: 30,
      isDefault: businesses.length === 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveBusiness(profile);
    setAdding(false);
    setName("");
    toast.success("Business profile created", "Add your logo, bank details and sign-off next.");
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.375rem] font-semibold tracking-tight text-fg sm:text-[1.5rem]">Business profiles</h1>
          <p className="mt-1 text-[0.875rem] text-fg-muted">
            Each profile carries its own logo, colours, bank details and sign-off. Documents pick the profile you choose.
          </p>
        </div>
        <Button variant="brand" icon={<Plus size={16} />} onClick={() => setAdding(true)} disabled={businesses.length >= limit}>
          New profile
        </Button>
      </header>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-3.5">
        <div className="flex items-center gap-2 text-[0.8125rem] text-fg-muted">
          <Building2 size={15} />
          {businesses.length} of {limit} profiles on the {plan.name} plan
        </div>
        {businesses.length >= limit ? (
          <Link href="/app/subscription" className="text-[0.8125rem] font-semibold text-[var(--brand)]">
            Upgrade for more profiles →
          </Link>
        ) : (
          <span className="text-[0.75rem] text-fg-subtle">{limit - businesses.length} remaining</span>
        )}
      </Card>

      {businesses.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Building2 size={20} />}
            title="No business profile yet"
            description="Your profile appears on every invoice, quotation and receipt. Add one and your documents look finished immediately."
            action={<Button variant="brand" onClick={() => setAdding(true)} icon={<Plus size={16} />}>Add your business</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {businesses.map((profile) => {
            const count = documents.filter((d) => d.businessId === profile.id && !d.archived).length;
            return (
              <Card key={profile.id} className="overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[0.875rem] font-bold text-white" style={{ background: profile.primaryColor }}>
                    {profile.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-[0.9375rem] font-semibold text-fg">{profile.name}</h2>
                      {profile.isDefault ? <Badge tone="brand" dot>Default</Badge> : null}
                    </div>
                    {profile.tagline ? <p className="mt-0.5 line-clamp-1 text-[0.8125rem] text-fg-muted">{profile.tagline}</p> : null}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-fg-subtle">
                      {profile.email ? (
                        <span className="inline-flex items-center gap-1">
                          <Mail size={12} /> {profile.email}
                        </span>
                      ) : null}
                      {profile.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone size={12} /> {profile.phone}
                        </span>
                      ) : null}
                      {profile.city ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} /> {profile.city}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[0.9375rem] font-semibold tabular-nums text-fg">{count}</div>
                    <div className="text-[0.6875rem] text-fg-subtle">documents</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2.5" style={{ borderColor: "var(--border)" }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="ghost" size="sm" icon={<Star size={14} />} disabled={profile.isDefault} onClick={() => { setDefaultBusiness(profile.id); toast.success(`${profile.name} is now the default profile`); }}>
                      {profile.isDefault ? "Default" : "Make default"}
                    </Button>
                    <Link href={`/app/businesses/${profile.id}`} className="btn btn-outline btn-sm">
                      Edit details
                    </Link>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (businesses.length === 1) {
                        toast.error("Keep at least one profile", "Create another profile before removing this one.");
                        return;
                      }
                      deleteBusiness(profile.id);
                      toast.success("Profile removed");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-4">
        <SectionHeader
          title="How profiles are used"
          description="Documents, templates and branding all follow the profile you pick in the editor."
        />
        <ul className="mt-3 grid gap-2 text-[0.8125rem] text-fg-muted sm:grid-cols-2">
          {[
            "Logo, stamp and signature print on every document.",
            "Bank and mobile-money details appear on invoices and receipts.",
            "Colour and font defaults carry into new documents.",
            "Numbering prefixes keep each business's records separate.",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2">
              <Check size={14} style={{ color: "var(--brand)" }} className="mt-0.5 shrink-0" />
              {line}
            </li>
          ))}
        </ul>
        <Link href="/app/settings" className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-[var(--brand)]">
          Workspace settings <ArrowRight size={14} />
        </Link>
      </Card>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="New business profile"
        description="You can fill in the rest at any time — nothing here is required to start writing documents."
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={create}>
              Create profile
            </Button>
          </>
        }
      >
        <Field label="Business name" required help="This appears on every document as the issuing company.">
          <Input autoFocus value={name} placeholder="e.g. Kwacha Trading Limited" onChange={(event) => setName(event.target.value)} />
        </Field>
      </Modal>
    </div>
  );
}
