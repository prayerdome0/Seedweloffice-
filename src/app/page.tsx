import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, BadgeCheck, Banknote, BrainCircuit, Building2, Check, FileSignature, FileText, Gauge, Globe2, Layers,
  LockKeyhole, Palette, Printer, Star, Users, WifiOff,
} from "lucide-react";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { HeroPreview } from "@/components/marketing/hero-preview";
import { DOC_KINDS } from "@/lib/constants";
import { TEMPLATES, totalTemplateCount } from "@/templates";
import { PLANS } from "@/lib/constants";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/config";

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
  alternates: { canonical: "/" },
};

const PILLARS = [
  {
    icon: <Layers size={19} />,
    title: "Thirteen modules, one workspace",
    body: "Invoices, quotations, receipts, CVs, proposals, company profiles, contracts, purchase orders, delivery notes, certificates, cover letters, business cards and reports.",
  },
  {
    icon: <Palette size={19} />,
    title: "144 designs that look bought",
    body: "Corporate, modern, executive, minimal and creative layouts for every module. Switch design without losing a word — your content stays put.",
  },
  {
    icon: <Building2 size={19} />,
    title: "Multiple businesses, separate branding",
    body: "Give each trading name its own logo, colours, bank details, stamp and signature. Documents pick up the profile you choose.",
  },
  {
    icon: <BrainCircuit size={19} />,
    title: "Writing that starts itself",
    body: "Draft proposals, contract clauses, CV summaries and payment terms from the details already in your document — then edit every word.",
  },
  {
    icon: <Gauge size={19} />,
    title: "Fast on a slow connection",
    body: "Local-first drafting, no bloated bundles and a preview that stays smooth on a low-end Android phone.",
  },
  {
    icon: <LockKeyhole size={19} />,
    title: "PDF, Word, print, share",
    body: "Pixel-accurate PDF, editable Word, print-ready A4, share links your client can open without an account, and email drafts that write themselves.",
  },
];

const STEPS = [
  { title: "Add your business", body: "Logo, colours, banking details, stamp and signature. Once, then never again." },
  { title: "Pick a design", body: "Choose from the gallery, preview with your own content, then start writing." },
  { title: "Draft and send", body: "Fill in the details — the assistant can write the words. Send by link, email or PDF." },
];

export default function LandingPage() {
  const featured = DOC_KINDS.slice(0, 6);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero ---------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="bg-mesh pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-20">
          <div>
            <Badge tone="brand" className="animate-fade-up">
              <Star size={12} /> {totalTemplateCount} designs · 13 modules
            </Badge>
            <h1 className="animate-fade-up delay-1 mt-4 text-[2rem] font-semibold leading-[1.08] tracking-tight text-fg sm:text-[2.75rem] lg:text-[3.1rem]">
              Documents that make a small business look <span className="text-gradient">serious</span>.
            </h1>
            <p className="animate-fade-up delay-2 mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-fg-muted sm:text-[1.0625rem]">
              Seedwel Office is the document workspace for African SMEs, NGOs, schools and consultants. Quote, invoice, hire and contract
              with layouts that hold their own against anything a big company sends you.
            </p>

            <div className="animate-fade-up delay-3 mt-6 flex flex-wrap items-center gap-3">
              <ButtonLink href="/sign-up" variant="brand" size="lg" trailingIcon={<ArrowRight size={17} />}>
                Start free — no card
              </ButtonLink>
              <ButtonLink href="/templates" variant="outline" size="lg" icon={<FileText size={16} />}>
                Browse the templates
              </ButtonLink>
            </div>

            <dl className="animate-fade-up delay-4 mt-8 grid max-w-lg grid-cols-3 gap-4">
              {[
                { value: "144", label: "Ready designs" },
                { value: "13", label: "Document modules" },
                { value: "Under 2s", label: "To first draft" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-[1.375rem] font-semibold tracking-tight text-fg">{stat.value}</dt>
                  <dd className="mt-0.5 text-[0.75rem] text-fg-muted">{stat.label}</dd>
                </div>
              ))}
            </dl>

            <ul className="animate-fade-up delay-5 mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[0.8125rem] text-fg-muted">
              {["Works offline", "Light, dark and system themes", "Export to PDF and Word", "Your data stays yours"].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <Check size={14} style={{ color: "var(--brand)" }} /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-up delay-2">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Modules strip ------------------------------------------------- */}
      <section className="border-y" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <p className="text-center text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-fg-subtle">
            Every document your business sends
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-7">
            {DOC_KINDS.map((kind) => (
              <Link
                key={kind.kind}
                href={`/templates/${kind.kind}`}
                className="group flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <span className="h-6 w-1 shrink-0 rounded-full" style={{ background: kind.accent }} />
                <span className="min-w-0">
                  <span className="block truncate text-[0.75rem] font-semibold text-fg">{kind.label}</span>
                  <span className="block text-[0.625rem] text-fg-subtle">{TEMPLATES[kind.kind].length} designs</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars ------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-18">
        <div className="max-w-2xl">
          <h2 className="text-[1.625rem] font-semibold tracking-tight text-fg sm:text-[2rem]">Built for how business actually works here</h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">
            Multi-currency amounts, VAT that calculates itself, mobile-money details on the invoice, and a quote that expires when you say
            it does. Plus the polish that makes a client pay on time.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <Card key={pillar.title} interactive className={`animate-fade-up delay-${(index % 5) + 1} p-5`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "color-mix(in oklab, var(--brand) 12%, var(--surface))", color: "var(--brand)" }}>
                {pillar.icon}
              </span>
              <h3 className="mt-3.5 text-[0.9375rem] font-semibold text-fg">{pillar.title}</h3>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-fg-muted">{pillar.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works -------------------------------------------------- */}
      <section className="border-y" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <h2 className="text-[1.625rem] font-semibold tracking-tight text-fg sm:text-[2rem]">Three steps from blank page to sent</h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">
                No onboarding call, no template marketplace, no upsell wall. Open the workspace and send something professional today.
              </p>
              <ol className="mt-6 space-y-4">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="flex gap-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-bold text-white" style={{ background: "var(--brand)" }}>
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-[0.875rem] font-semibold text-fg">{step.title}</div>
                      <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-fg-muted">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <ButtonLink href="/sign-up" variant="brand" className="mt-6" trailingIcon={<ArrowRight size={16} />}>
                Create your workspace
              </ButtonLink>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: <Printer size={17} />, title: "Print-ready", body: "A4 and US Letter, exact margins, no cut-off tables." },
                { icon: <FileSignature size={17} />, title: "Sign-off built in", body: "Signature images, stamps and dual signatory blocks." },
                { icon: <Banknote size={17} />, title: "Correct money", body: "Tax, discounts, shipping, deposits and amount in words." },
                { icon: <WifiOff size={17} />, title: "Offline first", body: "Keep writing on a slow or dropped connection." },
                { icon: <Users size={17} />, title: "Team ready", body: "Seats, roles and shared branding on higher plans." },
                { icon: <Globe2 size={17} />, title: "Local to you", body: "19 currencies, local tax labels and your own language." },
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
          </div>
        </div>
      </section>

      {/* Featured templates ------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[1.625rem] font-semibold tracking-tight text-fg sm:text-[2rem]">Start with a design you would pay for</h2>
            <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-fg-muted">
              Twelve sample designs across the most-used modules. Every layout is original work — no recoloured clones.
            </p>
          </div>
          <ButtonLink href="/templates" variant="outline" trailingIcon={<ArrowRight size={15} />}>
            See all {totalTemplateCount}
          </ButtonLink>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((kind) => (
            <Card key={kind.kind} interactive className="overflow-hidden">
              <div className="flex items-center gap-2.5 border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg text-[0.6875rem] font-bold text-white" style={{ background: kind.accent }}>
                  {kind.label.slice(0, 2)}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[0.875rem] font-semibold text-fg">{kind.plural}</div>
                  <div className="text-[0.6875rem] text-fg-subtle">{TEMPLATES[kind.kind].length} designs</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 p-4">
                {TEMPLATES[kind.kind].slice(0, 5).map((design) => (
                  <Badge key={design.id} tone="neutral">
                    {design.name}
                  </Badge>
                ))}
                {TEMPLATES[kind.kind].length > 5 ? <Badge tone="brand">+{TEMPLATES[kind.kind].length - 5} more</Badge> : null}
              </div>
              <div className="border-t px-4 py-3" style={{ borderColor: "var(--border)" }}>
                <Link href={`/templates/${kind.kind}`} className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-[var(--brand)]">
                  Preview every design <ArrowRight size={13} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing teaser ------------------------------------------------ */}
      <section className="border-y" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="text-center">
            <h2 className="text-[1.625rem] font-semibold tracking-tight text-fg sm:text-[2rem]">Pricing a business can justify</h2>
            <p className="mx-auto mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-fg-muted">
              Every plan includes all thirteen modules and all {totalTemplateCount} designs. You are paying for volume, seats and storage —
              never for access to a template.
            </p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <Card key={plan.id} className="flex flex-col p-5" interactive>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[0.9375rem] font-semibold text-fg">{plan.name}</h3>
                  {plan.highlight ? <Badge tone="brand">Popular</Badge> : null}
                </div>
                <p className="mt-1.5 text-[0.75rem] leading-relaxed text-fg-muted">{plan.tagline}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-[1.625rem] font-semibold text-fg">
                    {plan.monthly === 0 ? "Free" : `$${plan.monthly}`}
                  </span>
                  {plan.monthly > 0 ? <span className="text-[0.75rem] text-fg-subtle">/month</span> : null}
                </div>
                <ul className="mt-4 flex-1 space-y-1.5">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[0.75rem] text-fg-muted">
                      <Check size={13} style={{ color: "var(--brand)" }} className="mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <ButtonLink href="/pricing" variant={plan.highlight ? "brand" : "outline"} className="mt-5" block>
                  {plan.monthly === 0 ? "Compare plans" : `Choose ${plan.name}`}
                </ButtonLink>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials -------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              quote:
                "I used to send invoices in a Word file with the logo stretched across the top. Clients paid late every time. The first Seedwel invoice I sent was paid in four days.",
              name: "Mutinta P.",
              role: "Interior designer, Lusaka",
            },
            {
              quote:
                "We run three trading names from one office. Being able to switch the whole look — logo, colours, bank details — per document saves my finance assistant two hours a week.",
              name: "Joseph Z.",
              role: "Operations manager, Kitwe",
            },
            {
              quote:
                "Our grant proposals needed to look institutional. The proposal designs and the writing assistant got us to a submission-ready draft in an afternoon.",
              name: "Mary T.",
              role: "Executive director, NGO",
            },
          ].map((item) => (
            <Card key={item.name} className="flex flex-col p-5">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={14} style={{ color: "var(--gold)" }} fill="currentColor" />
                ))}
              </div>
              <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-fg">“{item.quote}”</p>
              <div className="mt-4 flex items-center gap-2.5 border-t pt-3.5" style={{ borderColor: "var(--border)" }}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-[0.6875rem] font-bold text-white" style={{ background: "var(--brand)" }}>
                  {item.name.slice(0, 2)}
                </span>
                <div>
                  <div className="text-[0.8125rem] font-semibold text-fg">{item.name}</div>
                  <div className="text-[0.6875rem] text-fg-subtle">{item.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ ----------------------------------------------------------- */}
      <section className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-[1.625rem] font-semibold tracking-tight text-fg sm:text-[2rem]">Questions, answered</h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">
              Still unsure? Write to us — a person replies, usually the same day.
            </p>
            <ButtonLink href="/contact" variant="outline" className="mt-4" trailingIcon={<ArrowRight size={15} />}>
              Contact support
            </ButtonLink>
          </div>
          <div className="space-y-2.5">
            {[
              { q: "Do I need a card to start?", a: "No. The free tier gives you 20 documents a month with every module and every design. Upgrade only when you need more volume." },
              { q: "Will my documents look right when printed?", a: "Yes. Every layout is built on a fixed A4 page with real print rules, and the preview you see is exactly what prints or exports as PDF." },
              { q: "Can I use my own logo and colours?", a: "Upload your logo, signature and stamp, choose from eight curated accents or set your own hex colour — per business profile." },
              { q: "What happens to my data?", a: "You own it. Export your whole workspace as JSON or every document as PDF or Word at any time. With no cloud project configured, everything stays in your browser." },
              { q: "Does it work on my phone?", a: "Seedwel Office is designed mobile-first and installs as an app from your browser. It keeps working when the connection drops." },
              { q: "Which currencies are supported?", a: "Nineteen, including ZMW, USD, ZAR, NGN, KES, GHS, TZS and UGX, with correct decimal handling per currency." },
            ].map((item) => (
              <details key={item.q} className="group rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <summary className="flex cursor-pointer items-center justify-between gap-3 text-[0.875rem] font-semibold text-fg">
                  {item.q}
                  <span className="text-fg-subtle transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-fg-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA ----------------------------------------------------- */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12" style={{ background: "linear-gradient(140deg, #071022, #0d2c3c 70%)" }}>
          <h2 className="text-[1.625rem] font-semibold tracking-tight text-white sm:text-[2rem]">Your next invoice can look like this</h2>
          <p className="mx-auto mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-white/70">
            Create a free workspace in under a minute. Add your logo, pick a design, send something you are proud of today.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/sign-up" variant="brand" size="lg" trailingIcon={<ArrowRight size={17} />}>
              Start free
            </ButtonLink>
            <ButtonLink href="/templates" variant="outline" size="lg" className="!border-white/25 !bg-white/5 !text-white hover:!bg-white/10">
              Browse designs
            </ButtonLink>
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 text-[0.75rem] text-white/55">
            <BadgeCheck size={14} /> No card required · Cancel or export any time
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
