"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Download, Loader2, Printer, ShieldCheck } from "lucide-react";
import { Badge, Button, ButtonLink, Card, EmptyState } from "@/components/ui";
import { PaperPreview } from "@/components/document/paper-preview";
import { useWorkspace } from "@/store/workspace";
import { hasFirebaseConfig, APP_NAME } from "@/lib/config";
import { exportElementToPdf } from "@/lib/export/pdf";
import { docKindMeta } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import { computeTotals } from "@/lib/documents/compute";
import type { BusinessProfile, DocumentRecord } from "@/lib/types";

/**
 * Public, read-only document view.
 *
 * Published snapshots are looked up by their token in Firestore. A signed-in
 * owner may also view a locally loaded document while publishing is pending.
 */
export default function SharedDocumentPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? "";
  const documents = useWorkspace((s) => s.documents);
  const businesses = useWorkspace((s) => s.businesses);
  const status = useWorkspace((s) => s.status);
  const [remote, setRemote] = useState<DocumentRecord | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const local = documents.find((doc) => doc.shareToken === token);
    if (local) {
      setRemote(null);
      setChecking(false);
      return;
    }
    if (!hasFirebaseConfig()) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [{ getFirebaseApp }, fs] = await Promise.all([import("@/lib/firebase-app"), import("firebase/firestore")]);
        const app = await getFirebaseApp();
        const db = fs.getFirestore(app);
        const snapshot = await fs.getDoc(fs.doc(db, "publicShares", token));
        if (!cancelled && snapshot.exists()) setRemote(snapshot.data() as DocumentRecord);
      } catch {
        /* falls through to the not-found state */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, documents]);

  const doc = remote ?? documents.find((d) => d.shareToken === token) ?? null;
  const business: BusinessProfile | null =
    businesses.find((b) => b.id === doc?.businessId) ?? (remote ? (remote as unknown as { business?: BusinessProfile }).business ?? null : null) ?? businesses[0] ?? null;

  if (checking && status !== "ready") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-fg-muted">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-[0.875rem]">Opening shared document…</span>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
        <Card className="p-6">
          <EmptyState
            icon={<ShieldCheck size={20} />}
            title="This share link is unavailable"
            description="The link may not have been published, or it may have been removed. Ask the sender for a new link."
            action={<ButtonLink variant="brand" href="/sign-in">Sign in</ButtonLink>}
            secondaryAction={<ButtonLink variant="outline" href="/">Visit Seedwel Office</ButtonLink>}
          />
        </Card>
      </div>
    );
  }

  const meta = docKindMeta(doc.kind);
  const totals = computeTotals(doc.payload, doc.kind);
  const currency = doc.payload.currency ?? doc.currency;

  return (
    <div className="min-h-screen" style={{ background: "var(--canvas-tint)" }}>
      <header className="no-print sticky top-0 z-30 border-b" style={{ borderColor: "var(--border)", background: "var(--glass)", backdropFilter: "saturate(180%) blur(14px)" }}>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mark.svg" alt="" width={26} height={26} />
            <span className="text-[0.875rem] font-semibold tracking-tight text-fg">{APP_NAME}</span>
          </Link>
          <Badge tone="neutral">{meta.label}</Badge>
          <span className="text-[0.8125rem] font-medium text-fg-muted">{doc.number}</span>
          {meta.hasLineItems ? <span className="text-[0.8125rem] font-semibold text-fg">{formatMoney(totals.total, currency)}</span> : null}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download size={14} />}
              onClick={async () => {
                const element = document.querySelector<HTMLElement>(".print-root .paper, .paper");
                if (!element) return;
                await exportElementToPdf(element, {
                  filename: `${doc.number.replace(/\s+/g, "-").toLowerCase()}.pdf`,
                  title: `${doc.title} — ${doc.number}`,
                  footer: `${business?.name ?? APP_NAME} · ${doc.number}`,
                });
              }}
            >
              Download PDF
            </Button>
            <Button variant="outline" size="sm" icon={<Printer size={14} />} onClick={() => window.print()}>
              Print
            </Button>
          </div>
        </div>
      </header>

      <main className="print-root mx-auto max-w-5xl px-3 py-5">
        <PaperPreview doc={doc} business={business} maxScale={1} className="no-print-shadow" />
      </main>

      <footer className="no-print mx-auto max-w-5xl px-4 pb-10 pt-2">
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <div className="text-[0.875rem] font-semibold text-fg">Want documents like this for your business?</div>
            <p className="mt-0.5 text-[0.8125rem] text-fg-muted">180 designs, thirteen modules, no checkout connected.</p>
          </div>
          <ButtonLink href="/sign-up" variant="brand" size="sm" trailingIcon={<ArrowRight size={14} />}>
            Create your workspace
          </ButtonLink>
        </Card>
      </footer>
    </div>
  );
}
