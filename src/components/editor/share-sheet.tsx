"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Code2, Copy, Link2, Mail, MessageCircle, Printer, Share2 } from "lucide-react";
import { Badge, Button, Field, Input, Modal, Textarea } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useWorkspace } from "@/store/workspace";
import { buildEmailDraft, embedSnippet, mailtoHref, nativeShare, printDocument, shareUrl, whatsappHref } from "@/lib/export/share";
import { copyToClipboard } from "@/lib/utils";
import type { BusinessProfile, DocumentRecord } from "@/lib/types";

/** Everything needed to get the document in front of a client. */
export function ShareSheet({
  open,
  onClose,
  doc,
  business,
  onStatusChange,
}: {
  open: boolean;
  onClose: () => void;
  doc: DocumentRecord;
  business: BusinessProfile | null;
  onStatusChange: (status: DocumentRecord["status"]) => void;
}) {
  const attachShareLink = useWorkspace((s) => s.attachShareLink);
  const recordActivity = useWorkspace((s) => s.recordActivity);
  const [token, setToken] = useState<string | null>(doc.shareToken ?? null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (open) setToken(doc.shareToken ?? null);
  }, [open, doc.shareToken]);

  const email = useMemo(() => buildEmailDraft(doc, business, token ? shareUrl(token) : undefined), [doc, business, token]);

  const ensureToken = async () => {
    try {
      const created = token ?? attachShareLink(doc.id);
      const [{ getFirebaseApp }, fs] = await Promise.all([import("@/lib/firebase-app"), import("firebase/firestore")]);
      const database = fs.getFirestore(await getFirebaseApp());
      await fs.setDoc(fs.doc(database, "publicShares", created), JSON.parse(JSON.stringify({ ...doc, shareToken: created, business: business ?? null })));
      setToken(created);
      toast.success("Share link published", "Anyone with the link can view this document snapshot.");
      return created;
    } catch (error) {
      console.error(error);
      toast.error("Could not publish link", "Check your connection and try again.");
      return null;
    }
  };

  const copy = async (value: string, key: string) => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(key);
      window.setTimeout(() => setCopied(null), 2000);
      toast.success("Copied to clipboard");
    } else {
      toast.error("Could not access the clipboard", "Select the text and copy it manually.");
    }
  };

  const markSent = () => {
    if (doc.status === "draft") onStatusChange("sent");
    recordActivity("document.shared", doc.id, doc.number, `Shared ${doc.number} with ${doc.payload.clientCompany || doc.payload.clientName || "the client"}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share & send"
      description={`${doc.number} · ${doc.title}`}
      size="lg"
    >
      <div className="space-y-5">
        <section className="rounded-xl border p-3.5" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link2 size={15} className="text-fg-subtle" />
              <span className="text-[0.8125rem] font-semibold text-fg">Shareable link</span>
              {token ? <Badge tone="success" dot>Live</Badge> : <Badge tone="neutral">Not created</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!token ? (
                <Button variant="brand" size="sm" onClick={() => { void ensureToken(); }}>
                  Create link
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" icon={copied === "link" ? <Check size={14} /> : <Copy size={14} />} onClick={async () => { const published = await ensureToken(); if (published) await copy(shareUrl(published), "link"); }}>
                    Copy link
                  </Button>
                  <a className="btn btn-outline btn-sm" href={shareUrl(token)} target="_blank" rel="noreferrer">
                    Preview
                  </a>
                </>
              )}
            </div>
          </div>
          {token ? (
            <div className="mt-2.5">
              <Input readOnly value={shareUrl(token)} onFocus={(event) => event.currentTarget.select()} />
              <p className="mt-1.5 text-[0.75rem] text-fg-subtle">
                Anyone with this link can view a read-only copy — no account needed. Your workspace stays private.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-[0.75rem] text-fg-subtle">Create a link to email, WhatsApp or embed it anywhere.</p>
          )}
        </section>

        <section>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-[0.8125rem] font-semibold text-fg">
              <Mail size={15} className="text-fg-subtle" /> Email to the client
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={copied === "body" ? <Check size={14} /> : <Copy size={14} />}
                onClick={() => copy(email.body, "body")}
              >
                Copy message
              </Button>
              <a
                className="btn btn-brand btn-sm"
                href={mailtoHref(email)}
                onClick={markSent}
              >
                Open mail app
              </a>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="To">
              <Input readOnly value={email.to || "No client email on this document"} />
            </Field>
            <Field label="Subject">
              <Input readOnly value={email.subject} onFocus={(event) => event.currentTarget.select()} />
            </Field>
          </div>
          <div className="mt-3">
            <Textarea readOnly rows={8} value={email.body} />
          </div>
        </section>

        <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <a
            className="btn btn-outline"
            href={whatsappHref(doc, business, token ? shareUrl(token) : "")}
            target="_blank"
            rel="noreferrer"
            onClick={markSent}
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
          <Button
            variant="outline"
            icon={<Share2 size={15} />}
            onClick={async () => {
              const result = await nativeShare(doc, business, token ?? undefined);
              if (result === "unsupported") {
                const created = await ensureToken();
                if (!created) return;
                toast.info("Sharing is not available here", "The link is ready to copy instead.");
                await copy(shareUrl(created), "link");
              } else {
                markSent();
              }
            }}
          >
            Device share
          </Button>
          <Button
            variant="outline"
            icon={<Printer size={15} />}
            onClick={() => {
              markSent();
              printDocument();
            }}
          >
            Print / save PDF
          </Button>
          <Button
            variant="outline"
            icon={<Code2 size={15} />}
            onClick={async () => { const published = await ensureToken(); if (published) await copy(embedSnippet(published), "embed"); }}
          >
            Copy embed code
          </Button>
        </section>

        {doc.status === "draft" ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
            <span className="text-[0.8125rem] text-fg-muted">Mark this document as sent so your records stay accurate.</span>
            <Button variant="outline" size="sm" onClick={markSent}>
              Mark as sent
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
