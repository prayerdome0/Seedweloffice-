import type { Metadata } from "next";
import { ArrowRight, Banknote, BrainCircuit, Building2, FileDown, Gauge, Globe2, Layers, LockKeyhole, Palette, Printer, ShieldCheck, Smartphone, Sparkles, Users, WifiOff } from "lucide-react";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { DOC_KINDS } from "@/lib/constants";
import { totalTemplateCount } from "@/templates";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Features — documents, branding, exports and AI drafting",
  description:
    "Everything Seedwel Office does: thirteen document modules, 180 designs, multi-business branding, tax-aware calculations, PDF and Word export, share links, a writing assistant.",
  alternates: { canonical: "/features" },
};

const GROUPS = [
  {
    icon: <Layers size={19} />,
    title: "Thirteen document modules",
    body: "Each module has its own field set, numbering sequence, status flow and design family — not one generic form with renamed labels.",
    points: [
      "Invoices with VAT, discounts, deposits and amount in words",
      "Quotations with validity periods and acceptance blocks",
      "Receipts with payment method and outstanding balance",
      "CVs, cover letters and company profiles for winning work",
      "Proposals, contracts and reports for institutional clients",
      "Purchase orders, delivery notes, certificates and business cards",
    ],
  },
  {
    icon: <Palette size={19} />,
    title: "Branding that follows the business",
    body: "Give every trading name its own identity. Documents render with the profile you choose, including its colours, logo and signatures.",
    points: [
      "Logo, stamp and signature upload with size guidance",
      "Eight curated accents, custom hex, or per-document override",
      "Font pairing presets across serif, sans, geometric and mono",
      "Optional watermark for drafts and unpaid copies",
      "QR codes pointing at a payment page, website or verification URL",
      "Save any design as the module default",
    ],
  },
  {
    icon: <Banknote size={19} />,
    title: "Arithmetic you can trust",
    body: "Totals, tax and balances are computed once, consistently, and shown the same way in preview, print and export.",
    points: [
      "Per-line tax rates with document-level override",
      "Percentage or fixed discounts, shipping and deposits",
      "Balance due, amount paid and outstanding shown together",
      "Amount in words for cheque and receipt requirements",
      "Nineteen currencies with correct decimal handling",
      "Rounding shown explicitly, never silently",
    ],
  },
  {
    icon: <FileDown size={19} />,
    title: "Send it however the client wants it",
    body: "Export the finished page, not an approximation of it. The preview engine is the export engine.",
    points: [
      "PDF at print fidelity, ready for email or WhatsApp",
      "Word (.docx) export you can still edit in Office",
      "Native print with A4 and US Letter page rules",
      "Share link clients can open without an account",
      "Download, copy and archived snapshots",
      "Email draft pre-filled with subject, body and totals",
    ],
  },
  {
    icon: <BrainCircuit size={19} />,
    title: "A writing assistant that respects your content",
    body: "Draft proposals, contract clauses, CV summaries and payment terms from the facts already in your document — then edit every word before it counts.",
    points: [
      "Works on-device without an API key, so no waiting on a network",
      "Optional connected endpoint for richer generations",
      "Rewrite, shorten, formalise or translate a section",
      "Never overwrites silently — insert, replace or keep",
      "Tone and length controls per module",
      "Credit usage visible before you generate",
    ],
  },
  {
    icon: <Gauge size={19} />,
    title: "Fast where it matters",
    body: "Built mobile-first and tested on low-end Android hardware over slow connections, because that is where most of our users work.",
    points: [
      "Deferred preview rendering in galleries of 24 designs",
      "Local-first drafts with debounced autosave",
      "No layout shift, no horizontal scrolling, no clipped tables",
      "Installable as an app with offline shell caching",
      "Light, dark and system themes on every screen",
      "Keyboard-and-screen-reader accessible controls",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="border-b" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Badge tone="brand">
            <Sparkles size={12} /> {totalTemplateCount} designs · 13 modules · unlimited exports
          </Badge>
          <h1 className="mt-4 max-w-3xl text-[1.875rem] font-semibold leading-tight tracking-tight text-fg sm:text-[2.5rem]">
            Everything you need to send a document you are proud of
          </h1>
          <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-fg-muted">
            {APP_NAME} is deliberately complete rather than sprawling: fewer features, but each one finished, tested and honest about what
            it does.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/sign-up" variant="brand" size="lg" trailingIcon={<ArrowRight size={16} />}>
              Start free
            </ButtonLink>
            <ButtonLink href="/templates" variant="outline" size="lg">
              Browse designs
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          {GROUPS.map((group) => (
            <Card key={group.title} className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "color-mix(in oklab, var(--brand) 12%, var(--surface))", color: "var(--brand)" }}>
                  {group.icon}
                </span>
                <div>
                  <h2 className="text-[1rem] font-semibold text-fg">{group.title}</h2>
                  <p className="mt-1 text-[0.875rem] leading-relaxed text-fg-muted">{group.body}</p>
                </div>
              </div>
              <ul className="mt-4 grid gap-1.5">
                {group.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-fg-muted">
                    <span className="mt-[0.4375rem] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--brand)" }} />
                    {point}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-[1.375rem] font-semibold tracking-tight text-fg">All thirteen modules</h2>
          <p className="mt-2 max-w-2xl text-[0.875rem] text-fg-muted">
            Tap any module to preview its designs with real content.
          </p>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {DOC_KINDS.map((kind) => (
              <div key={kind.kind} className="card flex items-start gap-3 p-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[0.6875rem] font-bold text-white" style={{ background: kind.accent }}>
                  {kind.label.slice(0, 2)}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[0.875rem] font-semibold text-fg">{kind.plural}</span>
                    <Badge tone="neutral">{kind.templateCount}</Badge>
                  </div>
                  <p className="mt-0.5 text-[0.75rem] leading-relaxed text-fg-muted">{kind.description}</p>
                  <a href={`/templates/${kind.kind}`} className="mt-1.5 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-[var(--brand)]">
                    Preview designs <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: <Building2 size={17} />, title: "Multi-business profiles", body: "Trading names, addresses, tax IDs, bank and mobile-money details, each with its own branding and default design." },
            { icon: <Users size={17} />, title: "Built for small teams", body: "Share a workspace, keep numbering consistent and let staff issue documents under the right profile." },
            { icon: <Printer size={17} />, title: "Print-first layouts", body: "Margins, page breaks and table splitting designed for real A4 output rather than a browser screenshot." },
            { icon: <WifiOff size={17} />, title: "Offline drafting", body: "Keep writing through a power cut or a dead network — drafts save locally and reconcile later." },
            { icon: <Smartphone size={17} />, title: "Installs like an app", body: "Add to home screen for a full-screen workspace with app shortcuts to new documents." },
            { icon: <ShieldCheck size={17} />, title: "Your data, portable", body: "Export the whole workspace as JSON, or every document individually, whenever you like." },
            { icon: <Globe2 size={17} />, title: "Local conventions", body: "Currency formatting, date formats and tax labels that match how business is done in your market." },
            { icon: <LockKeyhole size={17} />, title: "Private by default", body: "No cloud project connected means nothing leaves your device. Connect one when you want sync." },
          ].map((item) => (
            <Card key={item.title} className="p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--surface-3)", color: "var(--fg-muted)" }}>
                {item.icon}
              </span>
              <h3 className="mt-3 text-[0.875rem] font-semibold text-fg">{item.title}</h3>
              <p className="mt-1 text-[0.75rem] leading-relaxed text-fg-muted">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-3xl px-6 py-8" style={{ background: "linear-gradient(140deg, #071022, #0d2c3c 70%)" }}>
          <div>
            <h2 className="text-[1.25rem] font-semibold tracking-tight text-white sm:text-[1.5rem]">See it working on your own business</h2>
            <p className="mt-1.5 max-w-xl text-[0.875rem] leading-relaxed text-white/70">
              Add your logo, pick a design and send a real document in the next ten minutes.
            </p>
          </div>
          <ButtonLink href="/sign-up" variant="brand" size="lg" trailingIcon={<ArrowRight size={16} />}>
            Create your workspace
          </ButtonLink>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
