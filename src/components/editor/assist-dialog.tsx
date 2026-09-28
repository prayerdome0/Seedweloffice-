"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { Badge, Button, Field, Modal, Segmented, Textarea } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useWorkspace } from "@/store/workspace";
import { TONES, assistLabel, assistReady, runAssist, type AssistLength, type AssistTone } from "@/lib/ai";
import { copyToClipboard } from "@/lib/utils";
import type { BusinessProfile, DocumentRecord } from "@/lib/types";

export interface AssistTarget {
  field: string;
  label: string;
  /** "text" replaces a value, "list" appends bullet items. */
  type: "text" | "list";
}

/**
 * The writing assistant dialog. Used from every field with a `Write` affordance,
 * and as a standalone composer in the Writing assistant module.
 */
export function AssistDialog({
  open,
  onClose,
  target,
  doc,
  business,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  target: AssistTarget | null;
  doc: DocumentRecord | null;
  business: BusinessProfile | null;
  onApply: (result: { text: string; lines?: string[] }) => void;
}) {
  const settings = useWorkspace((s) => s.settings);
  const updateSettings = useWorkspace((s) => s.updateSettings);
  const recordActivity = useWorkspace((s) => s.recordActivity);
  const [tone, setTone] = useState<AssistTone>("professional");
  const [length, setLength] = useState<AssistLength>("medium");
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState<{ text: string; lines?: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [variant, setVariant] = useState(0);

  useEffect(() => {
    if (open) {
      setResult(null);
      setBrief("");
      setVariant(0);
    }
  }, [open, target?.field]);

  const creditsUsed = Number(settings.aiUsed ?? 0);
  const plan = useWorkspace((s) => s.subscription.plan);
  const creditLimit = useMemo(() => {
    const limits: Record<string, number> = { starter: 100, professional: 600, business: 2000, enterprise: 10000 };
    return limits[plan] ?? 100;
  }, [plan]);

  const generate = async () => {
    if (!target) return;
    setBusy(true);
    try {
      const output = await runAssist({
        field: target.field,
        brief,
        tone,
        length,
        doc,
        business,
        variant,
      });
      setResult({ text: output.text, lines: output.lines });
      if (output.credits > 0) updateSettings({ aiUsed: creditsUsed + output.credits });
      recordActivity("ai.generated", doc?.id, doc?.number, `Drafted “${target.label}” with the writing assistant`);
    } catch {
      toast.error("The assistant could not finish that draft", "Try again, or write it manually — nothing was lost.");
    } finally {
      setBusy(false);
    }
  };

  const apply = () => {
    if (!result) return;
    onApply(result);
    onClose();
    toast.success("Added to your document", "Edit any part of it — the draft is a starting point, not a commitment.");
  };

  const preview = result ? (result.lines?.length ? result.lines.join("\n") : result.text) : "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: "var(--brand)" }} /> Write {target ? target.label.toLowerCase() : "content"}
        </span>
      }
      description={assistReady ? assistLabel : "Drafts are composed on your device from the details already in this document — no data leaves your browser."}
      size="lg"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <span className="text-[0.75rem] text-fg-subtle">
            {creditsUsed} / {creditLimit} credits used
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            {result ? (
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw size={14} />}
                onClick={() => {
                  setVariant((v) => v + 1);
                  void generate();
                }}
                loading={busy}
              >
                Rewrite
              </Button>
            ) : null}
            {result ? (
              <Button variant="brand" size="sm" icon={<Check size={15} />} onClick={apply}>
                Use this
              </Button>
            ) : (
              <Button variant="brand" size="sm" icon={<Wand2 size={15} />} onClick={generate} loading={busy}>
                Generate draft
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {doc ? (
          <div className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
            <div className="text-[0.75rem] font-semibold text-fg">{doc.title}</div>
            <div className="mt-0.5 text-[0.6875rem] text-fg-subtle">
              {doc.number}
              {doc.payload.subject ? ` · ${doc.payload.subject}` : ""}
              {doc.payload.items?.length ? ` · ${doc.payload.items.length} line items` : ""}
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <span className="label">Tone</span>
            <div className="mt-1.5">
              <Segmented value={tone} onChange={setTone} size="sm" options={TONES.map((t) => ({ value: t.id, label: t.label }))} />
            </div>
            <p className="mt-1.5 text-[0.6875rem] text-fg-subtle">{TONES.find((t) => t.id === tone)?.hint}</p>
          </div>
          <div>
            <span className="label">Length</span>
            <div className="mt-1.5">
              <Segmented
                value={length}
                onChange={setLength}
                size="sm"
                options={[
                  { value: "short", label: "Short" },
                  { value: "medium", label: "Medium" },
                  { value: "long", label: "Long" },
                ]}
              />
            </div>
            <p className="mt-1.5 text-[0.6875rem] text-fg-subtle">Longer drafts add context a client will appreciate.</p>
          </div>
        </div>

        <Field label="Your brief (optional)" help="Anything specific to include — a number, a date, an assurance you have given the client.">
          <Textarea
            rows={2}
            value={brief}
            placeholder="e.g. mention the three-week lead time and that the deposit is 50%"
            onChange={(event) => setBrief(event.target.value)}
          />
        </Field>

        {busy ? (
          <div className="space-y-2 rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>
            <div className="h-3 w-4/5 animate-pulse rounded bg-[var(--surface-3)]" />
            <div className="h-3 w-full animate-pulse rounded bg-[var(--surface-3)]" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-[var(--surface-3)]" />
            <p className="pt-1 text-[0.75rem] text-fg-subtle">Composing a draft from your document details…</p>
          </div>
        ) : result ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="label">Draft</span>
              <div className="flex items-center gap-2">
                <Badge tone="brand">{result.lines?.length ? `${result.lines.length} items` : `${preview.split(/\s+/).filter(Boolean).length} words`}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Copy size={13} />}
                  onClick={async () => {
                    const ok = await copyToClipboard(preview);
                    if (ok) toast.success("Copied to clipboard");
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto rounded-xl border p-3 text-[0.875rem] leading-relaxed text-fg" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
              {result.lines?.length ? (
                <ul className="list-disc space-y-1 pl-4">
                  {result.lines.map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="whitespace-pre-line">{result.text}</p>
              )}
            </div>
            <p className="text-[0.75rem] text-fg-subtle">Nothing is applied until you choose “Use this”.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-6 text-center" style={{ borderColor: "var(--border-strong)" }}>
            <Sparkles size={20} className="mx-auto text-fg-subtle" />
            <p className="mt-2 text-[0.8125rem] text-fg-muted">
              Set a tone and add a brief, then generate. You will always be able to edit every word before it reaches a client.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
