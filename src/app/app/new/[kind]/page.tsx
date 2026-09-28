"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, EmptyState, ButtonLink } from "@/components/ui";
import { useWorkspace } from "@/store/workspace";
import { docKindMeta } from "@/lib/constants";
import { defaultTemplateId, isTemplateForKind } from "@/templates";
import type { DocKind } from "@/lib/types";

/**
 * Deep-link entry point used by the PWA shortcuts, marketing links and
 * `New document` actions: creates a blank record and opens the editor.
 */
export default function NewDocumentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-fg-muted"><Loader2 size={22} className="animate-spin" /></div>}>
      <NewDocumentRoute />
    </Suspense>
  );
}

function NewDocumentRoute() {
  const params = useParams<{ kind: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const requested = search.get("template");
  const kind = params?.kind as DocKind;
  const status = useWorkspace((s) => s.status);
  const createDocument = useWorkspace((s) => s.createDocument);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (status !== "ready" || started.current) return;
    started.current = true;
    try {
      const meta = docKindMeta(kind);
      if (!meta) throw new Error("unknown-kind");
      const templateId = requested && isTemplateForKind(requested, kind) ? requested : defaultTemplateId[kind];
      const doc = createDocument(kind, { templateId });
      router.replace(`/app/documents/${doc.id}`);
    } catch {
      setError(kind);
    }
  }, [status, kind, createDocument, router, requested]);

  if (error) {
    return (
      <Card>
        <EmptyState
          icon={<Loader2 size={20} />}
          title="We do not recognise that document type"
          description={`“${error}” is not one of the thirteen modules. Pick one from the document library instead.`}
          action={<ButtonLink variant="brand" href="/app/documents">Choose a module</ButtonLink>}
        />
      </Card>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-fg-muted">
      <Loader2 size={22} className="animate-spin" />
      <span className="text-[0.875rem]">Preparing your new document…</span>
    </div>
  );
}
