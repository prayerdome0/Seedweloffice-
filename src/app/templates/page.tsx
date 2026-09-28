import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Palette, Sparkles } from "lucide-react";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { TemplateShowcase } from "@/components/marketing/template-showcase";
import { DOC_KINDS, TEMPLATE_CATEGORIES } from "@/lib/constants";
import { TEMPLATES, totalTemplateCount } from "@/templates";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Template library — 180 business document designs",
  description:
    "Browse every Seedwel Office design: invoices, quotations, receipts, CVs, proposals, contracts, purchase orders, delivery notes, certificates, cover letters, business cards and reports.",
  alternates: { canonical: "/templates" },
};

export default function PublicTemplatesPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="border-b" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Badge tone="brand">
            <Sparkles size={12} /> {totalTemplateCount} original designs
          </Badge>
          <h1 className="mt-4 max-w-3xl text-[1.875rem] font-semibold leading-tight tracking-tight text-fg sm:text-[2.5rem]">
            The whole library, previewed with real content
          </h1>
          <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-fg-muted">
            Five design families — corporate, modern, executive, minimal and creative — applied to all thirteen modules. Every layout
            below is rendered live by the same engine that produces your PDF, so what you see is what your client receives.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {TEMPLATE_CATEGORIES.map((category) => (
              <Badge key={category.id} tone="neutral">
                <Palette size={11} /> {category.label} · {category.description}
              </Badge>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/sign-up" variant="brand" size="lg" trailingIcon={<ArrowRight size={16} />}>
              Start with any design
            </ButtonLink>
            <ButtonLink href="/pricing" variant="outline" size="lg">
              See pricing
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 className="text-[1.25rem] font-semibold tracking-tight text-fg">Browse by module</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DOC_KINDS.map((kind) => (
            <Card key={kind.kind} interactive className="p-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-[0.6875rem] font-bold text-white" style={{ background: kind.accent }}>
                  {kind.label.slice(0, 2)}
                </span>
                <div className="min-w-0">
                  <Link href={`/templates/${kind.kind}`} className="block truncate text-[0.9375rem] font-semibold text-fg">
                    {kind.plural}
                  </Link>
                  <span className="text-[0.6875rem] text-fg-subtle">{TEMPLATES[kind.kind].length} designs</span>
                </div>
              </div>
              <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-fg-muted">{kind.description}</p>
              <Link href={`/templates/${kind.kind}`} className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-[var(--brand)]">
                View designs <ArrowRight size={13} />
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="text-[1.25rem] font-semibold tracking-tight text-fg">Popular designs in the invoice family</h2>
          <p className="mt-2 max-w-2xl text-[0.875rem] text-fg-muted">
            Twelve of the twenty-four invoice designs, rendered with a real Lusaka trading company profile.
          </p>
          <div className="mt-5">
            <TemplateShowcase kind="invoice" limit={12} />
          </div>
        </div>
      </section>

      <section className="border-t" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-[1.375rem] font-semibold tracking-tight text-fg">Made to be personalised, not just picked</h2>
            <p className="mt-3 text-[0.875rem] leading-relaxed text-fg-muted">
              Designs are a starting point. Change the accent colour, page density and font, add your logo, stamp, signature and QR code,
              then save it as the default for that module.
            </p>
            <ButtonLink href="/features" variant="outline" className="mt-4" trailingIcon={<ArrowRight size={15} />}>
              How customisation works
            </ButtonLink>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {[
              "Eight curated accents or your own hex colour",
              "Serif, sans, geometric and mono type scales",
              "Logo, stamp and signature upload per business",
              "QR codes pointing at your payment page",
              "Compact, standard and airy page density",
              "Watermark for draft or unpaid states",
              "Show or hide tax, discount and shipping rows",
              "Amount in words for cheque-ready documents",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <Check size={14} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
                <span className="text-[0.8125rem] leading-relaxed text-fg-muted">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <p className="mx-auto max-w-6xl px-4 pt-8 text-[0.75rem] text-fg-subtle sm:px-6">
        {APP_NAME} designs are original work produced for this product. No third-party template files are redistributed.
      </p>

      <SiteFooter />
    </div>
  );
}
