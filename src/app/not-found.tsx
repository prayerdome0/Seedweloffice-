import { Compass } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
      <Card className="p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "var(--surface-3)", color: "var(--brand)" }}>
          <Compass size={20} />
        </div>
        <p className="mt-4 text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-fg-subtle">Error 404</p>
        <h1 className="mt-1 text-[1.375rem] font-semibold tracking-tight text-fg">We could not find that page</h1>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-fg-muted">
          The link may be out of date, or the document may have been moved. Everything below is one tap away.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonLink href="/app" variant="brand">Go to my workspace</ButtonLink>
          <ButtonLink href="/" variant="outline">Back to the homepage</ButtonLink>
        </div>
      </Card>
    </div>
  );
}
