"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, KeyRound } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuth } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const { sendReset, cloud } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const result = await sendReset(email);
    setBusy(false);
    if (result.ok) {
      setSent(true);
      setMessage(result.message ?? "Check your inbox for the reset link.");
    } else {
      setSent(false);
      setMessage(result.message ?? "We could not send that message.");
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle={
        cloud
          ? "Enter the email you signed up with and we will send a secure reset link."
          : "This workspace runs without a cloud project, so password resets work differently."
      }
      footer={
        <Link href="/sign-in" className="font-semibold text-[var(--brand)]">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl border p-3.5" style={{ borderColor: "color-mix(in oklab, var(--brand) 35%, var(--border))", background: "color-mix(in oklab, var(--brand) 8%, var(--surface))" }}>
            <CheckCircle2 size={17} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
            <div className="text-[0.8125rem] text-fg">
              <div className="font-semibold">Reset link sent</div>
              <p className="mt-0.5 text-fg-muted">{message}</p>
            </div>
          </div>
          <p className="text-[0.8125rem] text-fg-muted">
            Nothing arrived? Check your spam folder, or{" "}
            <button type="button" className="font-semibold text-[var(--brand)]" onClick={() => setSent(false)}>
              try another address
            </button>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {message && !sent ? (
            <div className="flex items-start gap-2.5 rounded-xl border p-3 text-[0.8125rem]" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-fg-subtle" />
              <span className="text-fg-muted">{message}</span>
            </div>
          ) : null}

          <Field label="Email address" required>
            <Input type="email" value={email} placeholder="you@company.com" autoComplete="email" onChange={(event) => setEmail(event.target.value)} required />
          </Field>

          <Button type="submit" variant="brand" block size="lg" disabled={!cloud} loading={busy} trailingIcon={<ArrowRight size={16} />}>
            Send reset link
          </Button>

          {!cloud ? (
            <div className="rounded-xl border p-3.5" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
              <div className="flex items-center gap-2 text-[0.8125rem] font-semibold text-fg">
                <KeyRound size={15} /> Service unavailable
              </div>
              <p className="mt-1 text-[0.75rem] leading-relaxed text-fg-muted">
                Firebase is not configured, so password reset is unavailable. Contact the site administrator.
              </p>
            </div>
          ) : null}
        </form>
      )}
    </AuthShell>
  );
}
