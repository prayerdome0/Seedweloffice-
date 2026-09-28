"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button, ButtonLink, Card } from "@/components/ui";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[seedwel] render error", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
      <Card className="p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "color-mix(in oklab, #b45309 14%, var(--surface))", color: "#b45309" }}>
          <AlertTriangle size={20} />
        </div>
        <h1 className="mt-4 text-[1.25rem] font-semibold tracking-tight text-fg">Something went wrong</h1>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-fg-muted">
          Your documents are safe. This was a display problem, not a data one — reload the view to carry on.
        </p>
        {error.digest ? <p className="mt-2 font-mono text-[0.6875rem] text-fg-subtle">Reference: {error.digest}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="brand" icon={<RefreshCw size={15} />} onClick={reset}>
            Try again
          </Button>
          <ButtonLink href="/app" variant="outline">Open my workspace</ButtonLink>
        </div>
      </Card>
    </div>
  );
}
