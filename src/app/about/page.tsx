import type { Metadata } from "next";
import { ArrowRight, Building2, Compass, HeartHandshake, MapPin, Ruler, ShieldCheck, Users } from "lucide-react";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { DOC_KINDS } from "@/lib/constants";
import { totalTemplateCount } from "@/templates";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "About Seedwel Office",
  description:
    "Why Seedwel Office exists: business documents for African small businesses, built mobile-first, priced for real budgets and designed to be finished rather than sprawling.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="border-b" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Badge tone="brand">
            <Compass size={12} /> Our story
          </Badge>
          <h1 className="mt-4 max-w-3xl text-[1.875rem] font-semibold leading-tight tracking-tight text-fg sm:text-[2.5rem]">
            Built because a good business should never send a bad document
          </h1>
          <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-fg-muted">
            {APP_NAME} started with a simple observation from working with traders, contractors, schools and consultancies across southern
            and eastern Africa: the work was excellent, and the paperwork was embarrassing. Logos stretched out of proportion. Invoices
            with no tax line. Quotes that expired before the client replied. CVs in a font nobody chose.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4 text-[0.9375rem] leading-relaxed text-fg-muted">
            <p>
              The tools that solve this are either expensive global platforms built for accounting departments, or free template dumps that
              produce documents everyone recognises — and no one trusts. Neither fits a business that quotes on WhatsApp and gets paid by
              mobile money.
            </p>
            <p>
              So we built the alternative: a workspace with {totalTemplateCount} original designs across {DOC_KINDS.length} modules, priced in
              dollars but designed for local reality. Multi-currency from day one, tax labels you control, payment details for bank and
              mobile money, amount in words for receipts, and print output that survives a cheap printer in a shared office.
            </p>
            <p>
              It is mobile-first because most of our users are on a phone, often on a slow connection, sometimes offline. That constraint
              shaped the engineering: previews render only when they scroll into view, drafts save locally first, and the app installs from
              the browser so there is nothing to download from a store.
            </p>
            <p>
              We think software should be honest too. If a feature needs a service you have not connected, the product says so plainly
              rather than pretending to send an email. If your data is only on your device, it tells you that instead of implying a cloud.
              That is the standard we hold ourselves to.
            </p>
          </div>

          <div className="space-y-3">
            <Card className="p-5">
              <h2 className="text-[1rem] font-semibold text-fg">What we believe</h2>
              <ul className="mt-3 space-y-3">
                {[
                  { icon: <Ruler size={16} />, title: "Finish, then add", text: "A small number of complete features beats a long list of half-built ones." },
                  { icon: <Users size={16} />, title: "Design for the phone first", text: "If it is awkward on a mid-range Android, it is not finished." },
                  { icon: <HeartHandshake size={16} />, title: "Price for real budgets", text: "The free tier is genuinely usable, not a hostage negotiation." },
                  { icon: <ShieldCheck size={16} />, title: "Say what is true", text: "No invented testimonials, no fake security badges, no hidden limits." },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--surface-3)", color: "var(--brand)" }}>
                      {item.icon}
                    </span>
                    <div>
                      <div className="text-[0.875rem] font-semibold text-fg">{item.title}</div>
                      <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-fg-muted">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <h2 className="text-[1rem] font-semibold text-fg">Where we work</h2>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-fg-muted">
                A remote, distributed team supporting customers across Zambia, Zimbabwe, South Africa, Nigeria, Kenya, Ghana, Tanzania and
                Uganda — with documents available in nineteen currencies.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Zambia", "Zimbabwe", "South Africa", "Nigeria", "Kenya", "Ghana", "Tanzania", "Uganda"].map((country) => (
                  <Badge key={country} tone="neutral">
                    <MapPin size={11} /> {country}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-y" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: "180", label: "Professional designs", hint: "Includes 56 CV layouts across six categories" },
              { value: "13", label: "Document modules", hint: "From quotations to delivery notes and reports" },
              { value: "19", label: "Currencies", hint: "With correct symbols and decimal rules" },
              { value: "0", label: "Watermarks", hint: "On any plan, including free" },
            ].map((stat) => (
              <Card key={stat.label} className="p-5">
                <div className="text-[1.75rem] font-semibold tracking-tight text-fg">{stat.value}</div>
                <div className="mt-0.5 text-[0.875rem] font-semibold text-fg">{stat.label}</div>
                <p className="mt-1 text-[0.75rem] leading-relaxed text-fg-muted">{stat.hint}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Card className="flex flex-wrap items-center justify-between gap-5 p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: "var(--brand)" }}>
              <Building2 size={19} />
            </span>
            <div>
              <h2 className="text-[1.0625rem] font-semibold text-fg">Talk to a person</h2>
              <p className="mt-1 max-w-xl text-[0.875rem] leading-relaxed text-fg-muted">
                Questions about NGO pricing, bulk onboarding or migrating documents across from another tool? Write to{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[var(--brand)]">
                  {SUPPORT_EMAIL}
                </a>{" "}
                and a member of the team will reply — usually the same working day.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/contact" variant="brand" trailingIcon={<ArrowRight size={15} />}>
              Contact us
            </ButtonLink>
            <ButtonLink href="/sign-up" variant="outline">
              Start free
            </ButtonLink>
          </div>
        </Card>
      </section>

      <SiteFooter />
    </div>
  );
}
