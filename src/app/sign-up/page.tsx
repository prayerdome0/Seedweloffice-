"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { Button, Field, Input, Select } from "@/components/ui";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuth } from "@/lib/auth";
import { COUNTRIES } from "@/lib/constants";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, ready, user, cloud, busy } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "", country: "Zambia" });
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/app");
  }, [ready, user, router]);

  const strength = useMemo(() => {
    const value = form.password;
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return score;
  }, [form.password]);

  const strengthLabel = ["Too short", "Weak", "Fair", "Strong", "Excellent"][strength];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    if (form.password.length < 8) {
      setMessage({ tone: "error", text: "Choose a password with at least eight characters." });
      return;
    }
    if (!accepted) {
      setMessage({ tone: "error", text: "Please accept the terms to continue." });
      return;
    }
    const result = await signUp(form);
    if (result.ok) {
      router.replace("/app");
      return;
    }
    setMessage({ tone: "error", text: result.message ?? "Could not create your account." });
  };

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Free to start — every module and all 144 designs are available immediately."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-[var(--brand)]">
            Sign in
          </Link>
        </>
      }
      highlights={[
        "No card required — 20 documents a month free",
        "Bring your own logo, colours and signatures",
        "Your documents stay yours: export any time",
        "Works offline — drafts are composed on your device",
      ]}
    >
      <form onSubmit={submit} className="space-y-4">
        {message ? (
          <div
            className="flex items-start gap-2.5 rounded-xl border p-3 text-[0.8125rem]"
            style={{ borderColor: "color-mix(in oklab, #b91c1c 35%, var(--border))", background: "color-mix(in oklab, #b91c1c 8%, var(--surface))" }}
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: "#b91c1c" }} />
            <span className="text-fg">{message.text}</span>
          </div>
        ) : null}

        <Field label="Full name" required>
          <Input value={form.name} placeholder="e.g. Chanda Mwale" autoComplete="name" onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </Field>
        <Field label="Work email" required>
          <Input type="email" value={form.email} placeholder="you@company.com" autoComplete="email" onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </Field>
        <Field label="Business name" help="You can add more business profiles later.">
          <Input value={form.company} placeholder="e.g. Kwacha Trading Limited" autoComplete="organization" onChange={(event) => setForm({ ...form, company: event.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country">
            <Select value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })}>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Password" required hint={form.password ? strengthLabel : undefined}>
            <Input type="password" value={form.password} placeholder="At least 8 characters" autoComplete="new-password" onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </Field>
        </div>

        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className="h-1 flex-1 rounded-full"
              style={{ background: index < strength ? "var(--brand)" : "var(--surface-3)" }}
            />
          ))}
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-[0.8125rem] text-fg-muted">
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--brand)]" />
          <span>
            I agree to the{" "}
            <Link href="/legal/terms" className="font-semibold text-[var(--brand)]">
              terms of service
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="font-semibold text-[var(--brand)]">
              privacy policy
            </Link>
            .
          </span>
        </label>

        <Button type="submit" variant="brand" block size="lg" loading={busy} trailingIcon={<ArrowRight size={16} />}>
          Create account
        </Button>
      </form>

      <p className="mt-4 flex items-start gap-2 text-[0.75rem] leading-relaxed text-fg-subtle">
        {cloud ? <Mail size={13} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={13} className="mt-0.5 shrink-0" />}
        {cloud
          ? "We will email you a verification link. Verify when convenient — you can start working straight away."
          : "No cloud project is connected, so this account is created in this browser. Everything works locally, including exports."}
      </p>
    </AuthShell>
  );
}
