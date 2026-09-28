import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { TemplateShowcase } from "@/components/marketing/template-showcase";
import { DOC_KINDS, docKindMeta } from "@/lib/constants";
import { templatesFor } from "@/templates";
import type { DocKind } from "@/lib/types";
import type { DocKindMeta } from "@/lib/constants";

/** Module-specific selling points, derived from what each module actually does. */
function contentItems(kind: DocKind, meta: DocKindMeta): string[] {
  const base: string[] = [];
  if (meta.hasLineItems) base.push("Line items with quantity, unit, tax and discount columns");
  if (meta.hasClients) base.push("Client block with contact, address and tax identification");
  if (meta.needsDueDate) base.push("Issue and due dates with payment terms in plain language");
  if (kind === "invoice") base.push("Balance carried over from any deposit already received", "Bank, mobile money and QR payment details");
  if (kind === "quotation") base.push("Validity period, lead time and acceptance signature block");
  if (kind === "receipt") base.push("Amount in words, payment method and balance outstanding");
  if (kind === "proposal") base.push("Objectives, scope, timeline, pricing table and terms");
  if (kind === "contract") base.push("Numbered clauses, obligations, termination and dual signature blocks");
  if (kind === "cv") base.push("Summary, experience, education, skills and referee sections");
  if (kind === "company-profile") base.push("Company history, services, team, certifications and references");
  if (kind === "purchase-order") base.push("Supplier details, delivery instructions and authorisation signature");
  if (kind === "delivery-note") base.push("Dispatched and received quantities with two signature blocks");
  if (kind === "certificate") base.push("Award wording, seal line, signature and certificate ID for verification");
  if (kind === "cover-letter") base.push("Addressee, role reference, value statement and closing block");
  if (kind === "business-card") base.push("Print-ready card grid — front and back, 85 × 55 mm trim size");
  if (kind === "report") base.push("Executive summary, findings, financial tables and recommendations");
  base.push("Your logo, accent colour and signature from any business profile");
  base.push("Export as PDF, Word, print or a share link");
  return base;
}

export function generateStaticParams() {
  return DOC_KINDS.map((kind) => ({ kind: kind.kind }));
}

export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }): Promise<Metadata> {
  const { kind } = await params;
  const meta = docKindMeta(kind as DocKind);
  if (!meta) return { title: "Templates" };
  const count = templatesFor(meta.kind).length;
  return {
    title: `${meta.plural} templates — ${count} designs`,
    description: `${count} professional ${meta.plural.toLowerCase()} designs for small businesses. ${meta.description} Preview every layout and start free.`,
    alternates: { canonical: `/templates/${meta.kind}` },
  };
}

export default async function PublicTemplateKindPage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const meta = docKindMeta(kind as DocKind);
  if (!meta) notFound();
  const designs = templatesFor(meta.kind);
  const siblings = DOC_KINDS.filter((item) => item.kind !== meta.kind);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="border-b" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <nav className="flex flex-wrap items-center gap-1.5 text-[0.75rem] text-fg-subtle">
            <Link href="/templates" className="hover:text-fg">
              Templates
            </Link>
            <span>/</span>
            <span className="text-fg-muted">{meta.plural}</span>
          </nav>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-[0.75rem] font-bold text-white" style={{ background: meta.accent }}>
                  {meta.label.slice(0, 2)}
                </span>
                <div>
                  <h1 className="text-[1.5rem] font-semibold tracking-tight text-fg sm:text-[1.875rem]">{meta.plural} templates</h1>
                  <p className="text-[0.75rem] text-fg-subtle">{designs.length} designs · every module on every plan</p>
                </div>
              </div>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">{meta.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href={`/sign-up?next=${encodeURIComponent(`/app/new/${meta.kind}`)}`} variant="brand" trailingIcon={<ArrowRight size={15} />}>
                Start a {meta.label.toLowerCase()}
              </ButtonLink>
              <ButtonLink href="/templates" variant="outline">
                All modules
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <TemplateShowcase kind={meta.kind} showFilters />

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-[1.0625rem] font-semibold text-fg">What these {meta.plural.toLowerCase()} include</h2>
            <ul className="mt-3 space-y-2">
              {contentItems(meta.kind, meta).map((item) => (
                <li key={item} className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-fg-muted">
                  <Check size={14} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <h2 className="text-[1.0625rem] font-semibold text-fg">Also available</h2>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-fg-muted">
              One workspace covers all thirteen modules, so the same branding, numbering and client list serves your whole business.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {siblings.map((item) => (
                <Link
                  key={item.kind}
                  href={`/templates/${item.kind}`}
                  className="rounded-full border px-3 py-1.5 text-[0.75rem] font-medium text-fg-muted transition-colors hover:text-fg"
                  style={{ borderColor: "var(--border)" }}
                >
                  {item.plural}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="brand">PDF</Badge>
              <Badge tone="neutral">Word</Badge>
              <Badge tone="neutral">Print</Badge>
              <Badge tone="neutral">Share link</Badge>
              <Badge tone="neutral">Email draft</Badge>
            </div>
          </Card>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
