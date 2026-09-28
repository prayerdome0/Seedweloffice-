"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Mail, Sparkles } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import { AuthShell } from "@/components/auth/auth-shell";
import { useAuth } from "@/lib/auth";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-[0.875rem] text-fg-muted">Opening sign in…</div>}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/app";
  const { signIn, signInWithGoogle, signInAsDemo, sendReset, ready, user, cloud, busy } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ tone: "error" | "success" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [ready, user, router, next]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    const result = await signIn(email, password);
    if (result.ok) {
      router.replace(next);
      return;
    }
    setMessage({ tone: result.needsVerification ? "info" : "error", text: result.message ?? "Could not sign you in." });
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up your documents, templates and client records where you left them."
      footer={
        <>
          New to Seedwel Office?{" "}
          <Link href="/sign-up" className="font-semibold text-[var(--brand)]">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {message ? (
          <div
            className="flex items-start gap-2.5 rounded-xl border p-3 text-[0.8125rem]"
            style={{
              borderColor: message.tone === "error" ? "color-mix(in oklab, #b91c1c 35%, var(--border))" : "color-mix(in oklab, var(--brand) 35%, var(--border))",
              background: message.tone === "error" ? "color-mix(in oklab, #b91c1c 8%, var(--surface))" : "color-mix(in oklab, var(--brand) 8%, var(--surface))",
            }}
          >
            {message.tone === "error" ? <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: "#b91c1c" }} /> : <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />}
            <span className="text-fg">{message.text}</span>
          </div>
        ) : null}

        <Field label="Email address" required>
          <Input type="email" autoComplete="email" value={email} placeholder="you@company.com" onChange={(event) => setEmail(event.target.value)} required />
        </Field>
        <Field label="Password" required>
          <Input type="password" autoComplete="current-password" value={password} placeholder="••••••••" onChange={(event) => setPassword(event.target.value)} required />
        </Field>

        <div className="flex items-center justify-between">
          <Link href="/forgot-password" className="text-[0.8125rem] font-medium text-[var(--brand)]">
            Forgot your password?
          </Link>
          <button
            type="button"
            className="text-[0.8125rem] font-medium text-fg-muted"
            onClick={async () => {
              const result = await sendReset(email);
              setMessage({ tone: result.ok ? "success" : "info", text: result.message ?? "Check your inbox for the reset link." });
            }}
          >
            Email me a reset link
          </button>
        </div>

        <Button type="submit" variant="brand" block size="lg" loading={busy} trailingIcon={<ArrowRight size={16} />}>
          Sign in
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1" style={{ background: "var(--border)" }} />
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-fg-subtle">or</span>
        <span className="h-px flex-1" style={{ background: "var(--border)" }} />
      </div>

      <div className="space-y-2.5">
        <Button variant="outline" block size="lg" icon={<GoogleMark />} onClick={async () => {
          const result = await signInWithGoogle();
          if (result.ok) router.replace(next);
          else setMessage({ tone: "info", text: result.message ?? "Google sign-in is unavailable." });
        }}>
          Continue with Google
        </Button>
        <Button
          variant="ghost"
          block
          size="lg"
          icon={<Sparkles size={16} />}
          onClick={async () => {
            await signInAsDemo();
            router.replace(next);
          }}
        >
          Explore the demo workspace
        </Button>
      </div>

      <p className="mt-4 flex items-start gap-2 text-[0.75rem] leading-relaxed text-fg-subtle">
        <Mail size={13} className="mt-0.5 shrink-0" />
        {cloud
          ? "Your sign-in is handled by Firebase Authentication — we never see your password."
          : "No cloud project is connected, so accounts created here live in this browser. The demo workspace gives you the full product instantly."}
      </p>
    </AuthShell>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.9 2.6 13.7l7.8 6.1C12.3 13.9 17.7 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v8.4h12.5c-.3 2.1-1.6 5.2-4.6 7.3l7.6 5.9c4.5-4.2 6.6-10.3 6.6-17.5Z" />
      <path fill="#FBBC05" d="M10.4 28.2a14.6 14.6 0 0 1 0-8.4l-7.8-6.1a24 24 0 0 0 0 20.6l7.8-6.1Z" />
      <path fill="#34A853" d="M24 47.5c6.2 0 11.4-2 15.5-5.5l-7.6-5.9c-2 1.4-4.7 2.4-7.9 2.4-6.3 0-11.7-4.4-13.6-10.3l-7.8 6.1C6.5 42.1 14.6 47.5 24 47.5Z" />
    </svg>
  );
}
