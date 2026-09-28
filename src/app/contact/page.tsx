import type { Metadata } from "next";
import { ArrowRight, BookOpen, Clock, Mail, MessageSquare, Send } from "lucide-react";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { ContactForm } from "@/components/marketing/contact-form";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact & support",
  description:
    "Reach the Seedwel Office team: email support, sales and NGO pricing questions, plus answers to the most common support requests.",
  alternates: { canonical: "/contact" },
};

const TOPICS = [
  { title: "Account & billing", body: "Plan changes, invoices for your records, VAT details and refunds.", time: "Same working day" },
  { title: "Documents & templates", body: "Layout questions, missing fields, print alignment or a design request.", time: "Within one working day" },
  { title: "Non-profit & education pricing", body: "Send proof of registration from your organisation address for a discount.", time: "Two working days" },
  { title: "Teams & bulk setup", body: "Onboarding several staff, shared brand kits and numbering conventions.", time: "Within two working days" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="border-b" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Badge tone="brand">
            <MessageSquare size={12} /> Support
          </Badge>
          <h1 className="mt-4 max-w-3xl text-[1.875rem] font-semibold leading-tight tracking-tight text-fg sm:text-[2.5rem]">
            Tell us what you need and we will answer
          </h1>
          <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-fg-muted">
            Real replies from the team that builds {APP_NAME} — no ticket queues, no scripted chatbots.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <Card className="p-5 sm:p-6">
            <h2 className="text-[1.0625rem] font-semibold text-fg">Send a message</h2>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-fg-muted">
              Fill this in and we will open a pre-filled message in your email app, addressed to our support inbox. Nothing is stored on
              our servers by this form.
            </p>
            <div className="mt-5">
              <ContactForm />
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <h2 className="text-[1rem] font-semibold text-fg">Direct lines</h2>
              <div className="mt-3 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "color-mix(in oklab, var(--brand) 12%, var(--surface))", color: "var(--brand)" }}>
                    <Mail size={17} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[0.8125rem] font-semibold text-fg">Support & billing</div>
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="break-all text-[0.8125rem] text-[var(--brand)]">
                      {SUPPORT_EMAIL}
                    </a>
                    <p className="mt-0.5 text-[0.75rem] text-fg-muted">Include your workspace email so we can find your account quickly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--surface-3)", color: "var(--fg-muted)" }}>
                    <Clock size={17} />
                  </span>
                  <div>
                    <div className="text-[0.8125rem] font-semibold text-fg">Hours</div>
                    <p className="text-[0.75rem] text-fg-muted">Monday to Friday, 08:00–17:00 CAT. Messages sent over the weekend are answered on Monday.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--surface-3)", color: "var(--fg-muted)" }}>
                    <BookOpen size={17} />
                  </span>
                  <div>
                    <div className="text-[0.8125rem] font-semibold text-fg">Before you write</div>
                    <p className="text-[0.75rem] text-fg-muted">
                      Most questions — printing, exports, branding, plan limits — are answered on the{" "}
                      <a href="/features" className="font-medium text-[var(--brand)]">
                        features page
                      </a>{" "}
                      and{" "}
                      <a href="/pricing" className="font-medium text-[var(--brand)]">
                        pricing page
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              {TOPICS.map((topic) => (
                <Card key={topic.title} className="p-4">
                  <div className="text-[0.875rem] font-semibold text-fg">{topic.title}</div>
                  <p className="mt-1 text-[0.75rem] leading-relaxed text-fg-muted">{topic.body}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide" style={{ color: "var(--brand)" }}>
                    <Send size={11} /> {topic.time}
                  </div>
                </Card>
              ))}
            </div>

            <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="text-[0.8125rem] text-fg-muted">Prefer to explore first? The full product is free to try.</div>
              <ButtonLink href="/sign-up" variant="brand" size="sm" trailingIcon={<ArrowRight size={14} />}>
                Create a workspace
              </ButtonLink>
            </Card>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
