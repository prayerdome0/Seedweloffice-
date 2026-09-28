"use client";

import { useState } from "react";
import { Check, ExternalLink } from "lucide-react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { SUPPORT_EMAIL } from "@/lib/config";

const TOPICS = [
  "Account, plan or billing question",
  "Document layout or template request",
  "Print or export problem",
  "Non-profit / education pricing",
  "Team onboarding or bulk setup",
  "Something else",
];

/**
 * Contact form.
 *
 * There is no mail server behind this deployment, so rather than pretending a
 * message was delivered, the form composes a complete, pre-filled message and
 * hands it to the visitor's own email client.
 */
export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", company: "", topic: TOPICS[0], message: "" });
  const [ready, setReady] = useState(false);

  const subject = `[${form.topic}] ${form.name || "Website enquiry"}`;
  const body = [
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    form.company ? `Business: ${form.company}` : null,
    `Topic: ${form.topic}`,
    "",
    form.message,
    "",
    "— sent from the Seedwel Office website",
  ]
    .filter(Boolean)
    .join("\n");

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const complete = form.name.trim().length > 1 && /.+@.+\..+/.test(form.email) && form.message.trim().length > 9;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setReady(true);
        window.location.href = mailto;
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" required>
          <Input value={form.name} placeholder="e.g. Chanda Mwale" autoComplete="name" onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </Field>
        <Field label="Email address" required>
          <Input type="email" value={form.email} placeholder="you@company.com" autoComplete="email" onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business or organisation" hint="Optional">
          <Input value={form.company} placeholder="e.g. Kwacha Trading Limited" autoComplete="organization" onChange={(event) => setForm({ ...form, company: event.target.value })} />
        </Field>
        <Field label="What is it about?" required>
          <Select value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })}>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Message" required help="The more detail you give, the more useful our first reply will be.">
        <Textarea rows={5} value={form.message} placeholder="Tell us what you are trying to do, and what is happening instead…" onChange={(event) => setForm({ ...form, message: event.target.value })} />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="brand" size="lg" disabled={!complete} icon={<ExternalLink size={16} />}>
          Open in my email app
        </Button>
        <span className="text-[0.75rem] text-fg-subtle">or write to {SUPPORT_EMAIL}</span>
      </div>

      {ready ? (
        <div className="flex items-start gap-2.5 rounded-xl border p-3 text-[0.8125rem]" style={{ borderColor: "color-mix(in oklab, var(--brand) 35%, var(--border))", background: "color-mix(in oklab, var(--brand) 8%, var(--surface))" }}>
          <Check size={16} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
          <span className="text-fg">
            Your message is prepared and your email app should be opening. If nothing happened, copy the address above and send it manually —
            this form does not transmit anything by itself.
          </span>
        </div>
      ) : null}
    </form>
  );
}
