"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, FileText, Lightbulb, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { Badge, Button, Card, EmptyState, Field, Segmented, Select, SectionHeader, Textarea } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import { useWorkspace } from "@/store/workspace";
import { TONES, assistLabel, assistReady, runAssist, type AssistLength, type AssistTone } from "@/lib/ai";
import { copyToClipboard, formatMoney, truncate } from "@/lib/utils";
import { computeTotals } from "@/lib/documents/compute";
import { docKindMeta } from "@/lib/constants";
import type { DocumentRecord } from "@/lib/types";

/**
 * The writing assistant as its own module: draft any piece of business writing,
 * with or without a document attached, then copy it or push it into a document.
 */
const TASKS: { id: string; label: string; group: string; type: "text" | "list" }[] = [
  { id: "proposalSummary", label: "Proposal executive summary", group: "Proposals", type: "text" },
  { id: "proposalProblem", label: "The challenge", group: "Proposals", type: "text" },
  { id: "proposalApproach", label: "Our approach", group: "Proposals", type: "text" },
  { id: "proposalScope", label: "Scope of work", group: "Proposals", type: "list" },
  { id: "proposalDeliverables", label: "Deliverables", group: "Proposals", type: "list" },
  { id: "proposalWhyUs", label: "Why choose us", group: "Proposals", type: "text" },
  { id: "proposalConclusion", label: "Next steps", group: "Proposals", type: "text" },
  { id: "quotationIntro", label: "Quotation introduction", group: "Sales documents", type: "text" },
  { id: "notes", label: "Thank-you note", group: "Sales documents", type: "text" },
  { id: "terms", label: "Terms & conditions", group: "Sales documents", type: "text" },
  { id: "receiptNotes", label: "Receipt acknowledgement", group: "Sales documents", type: "text" },
  { id: "coverOpening", label: "Cover letter opening", group: "Careers", type: "text" },
  { id: "coverBody", label: "Cover letter body", group: "Careers", type: "list" },
  { id: "coverClosing", label: "Cover letter closing", group: "Careers", type: "text" },
  { id: "cvSummary", label: "CV professional summary", group: "Careers", type: "text" },
  { id: "cvExperience", label: "CV achievement bullets", group: "Careers", type: "list" },
  { id: "cvSkills", label: "CV skills list", group: "Careers", type: "list" },
  { id: "companyIntro", label: "Company introduction", group: "Business", type: "text" },
  { id: "companyWhyUs", label: "Why clients choose us", group: "Business", type: "text" },
  { id: "companyMission", label: "Mission statement", group: "Business", type: "text" },
  { id: "companyValues", label: "Core values", group: "Business", type: "list" },
  { id: "contractRecitals", label: "Contract recitals", group: "Legal & reports", type: "text" },
  { id: "contractTerm", label: "Term & termination", group: "Legal & reports", type: "text" },
  { id: "reportSummary", label: "Report executive summary", group: "Legal & reports", type: "text" },
  { id: "reportConclusion", label: "Report recommendations", group: "Legal & reports", type: "text" },
  { id: "certificateCitation", label: "Certificate citation", group: "Legal & reports", type: "text" },
];

export default function AssistPage() {
  const router = useRouter();
  const documents = useWorkspace((s) => s.documents);
  const businesses = useWorkspace((s) => s.businesses);
  const subscription = useWorkspace((s) => s.subscription);
  const settings = useWorkspace((s) => s.settings);
  const updateSettings = useWorkspace((s) => s.updateSettings);
  const recordActivity = useWorkspace((s) => s.recordActivity);

  const [task, setTask] = useState("proposalSummary");
  const [docId, setDocId] = useState<string>("");
  const [tone, setTone] = useState<AssistTone>("professional");
  const [length, setLength] = useState<AssistLength>("medium");
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState<{ text: string; lines?: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [variant, setVariant] = useState(0);

  const active = useMemo(() => documents.filter((d) => !d.archived), [documents]);
  const doc: DocumentRecord | null = active.find((d) => d.id === docId) ?? null;
  const business = businesses.find((b) => b.id === doc?.businessId) ?? businesses.find((b) => b.isDefault) ?? businesses[0] ?? null;

  const creditsUsed = Number(settings.aiUsed ?? 0);
  const creditLimits: Record<string, number> = { starter: 100, professional: 600, business: 2000, enterprise: 10000 };
  const creditLimit = creditLimits[subscription.plan] ?? 100;

  const groups = useMemo(() => {
    const map = new Map<string, typeof TASKS>();
    for (const item of TASKS) map.set(item.group, [...(map.get(item.group) ?? []), item]);
    return Array.from(map.entries());
  }, []);

  const generate = async () => {
    setBusy(true);
    try {
      const output = await runAssist({ field: task, brief, tone, length, doc, business, variant });
      setResult({ text: output.text, lines: output.lines });
      if (output.credits > 0) updateSettings({ aiUsed: creditsUsed + output.credits });
      recordActivity("ai.generated", doc?.id, doc?.number, `Drafted “${TASKS.find((t) => t.id === task)?.label ?? task}” in the assistant`);
    } catch {
      toast.error("The assistant could not finish that draft", "Nothing was lost — try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-[1.375rem] font-semibold tracking-tight text-fg sm:text-[1.5rem]">
            <Sparkles size={20} style={{ color: "var(--brand)" }} /> Writing assistant
          </h1>
          <p className="mt-1 max-w-2xl text-[0.875rem] text-fg-muted">
            Draft proposals, contract clauses, CV summaries, payment terms and client messages in seconds. Everything is editable, and nothing is invented about your clients.
          </p>
        </div>
        <Badge tone={assistReady ? "brand" : "neutral"}>{assistLabel}</Badge>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card className="p-4">
          <SectionHeader title="What are we writing?" description={assistReady ? "Using your connected writing service." : "Rule-based drafts on your device — not a generative language model. Review every draft before sending."} />

          <div className="mt-4 space-y-3.5">
            <Field label="Piece of writing">
              <Select value={task} onChange={(event) => { setTask(event.target.value); setResult(null); }}>
                {groups.map(([group, items]) => (
                  <optgroup key={group} label={group}>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </Field>

            <Field label="Use a document for context" help={doc ? `${docKindMeta(doc.kind).label} · ${doc.number}` : "Optional — the assistant draws on your subject line, client and line items."}>
              <Select value={docId} onChange={(event) => setDocId(event.target.value)}>
                <option value="">No document (write from scratch)</option>
                {active.slice(0, 40).map((item) => (
                  <option key={item.id} value={item.id}>
                    {truncate(item.title, 46)} — {docKindMeta(item.kind).label}
                  </option>
                ))}
              </Select>
            </Field>

            <div>
              <span className="label">Tone</span>
              <div className="mt-1.5">
                <Segmented value={tone} onChange={setTone} size="sm" options={TONES.map((t) => ({ value: t.id, label: t.label }))} />
              </div>
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
            </div>

            <Field label="Brief" help="Add any specific point that must appear.">
              <Textarea rows={3} value={brief} placeholder="e.g. mention the six-week timeline and the ZMW 45,000 budget" onChange={(event) => setBrief(event.target.value)} />
            </Field>

            <Button variant="brand" block icon={<Wand2 size={16} />} onClick={generate} loading={busy}>
              {result ? "Generate again" : "Generate draft"}
            </Button>
          </div>

          <div className="mt-4 rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
            <div className="flex items-center gap-2 text-[0.8125rem] font-semibold text-fg">
              <Lightbulb size={15} style={{ color: "var(--gold)" }} /> Getting a better draft
            </div>
            <ul className="mt-1.5 space-y-1 text-[0.75rem] text-fg-muted">
              <li>· Attach the document so numbers and client names are used.</li>
              <li>· Add a brief with anything you have already promised.</li>
              <li>· Use Rewrite to see alternatives in the same tone.</li>
            </ul>
          </div>
        </Card>

        <Card className="flex flex-col p-4">
          <SectionHeader
            title="Draft"
            description={doc ? `Based on ${doc.number}${doc.payload.subject ? ` — ${truncate(String(doc.payload.subject), 60)}` : ""}` : "Written from your brief alone"}
            action={
              result ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<RefreshCw size={14} />}
                    loading={busy}
                    onClick={() => {
                      setVariant((v) => v + 1);
                      void generate();
                    }}
                  >
                    Rewrite
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Copy size={14} />}
                    onClick={async () => {
                      const ok = await copyToClipboard(result.lines?.length ? result.lines.join("\n") : result.text);
                      if (ok) toast.success("Copied to clipboard");
                    }}
                  >
                    Copy
                  </Button>
                </div>
              ) : null
            }
          />

          {busy ? (
            <div className="mt-4 space-y-2">
              {[80, 100, 60, 90, 70].map((width, index) => (
                <div key={index} className="skeleton h-3.5" style={{ width: `${width}%` }} />
              ))}
            </div>
          ) : result ? (
            <div className="mt-4 flex-1">
              <div className="rounded-xl border p-4 text-[0.875rem] leading-relaxed text-fg" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
                {result.lines?.length ? (
                  <ul className="list-disc space-y-1.5 pl-4">
                    {result.lines.map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-3">
                    {result.text.split(/\n{2,}/).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{result.lines?.length ? `${result.lines.length} items` : `${result.text.split(/\s+/).filter(Boolean).length} words`}</Badge>
                <Badge tone="neutral">{TONES.find((t) => t.id === tone)?.label}</Badge>
                {doc ? (
                  <Button
                    variant="brand"
                    size="sm"
                    icon={<Check size={14} />}
                    onClick={() => router.push(`/app/documents/${doc.id}`)}
                  >
                    Open {doc.number} to paste it
                  </Button>
                ) : (
                  <Button variant="brand" size="sm" icon={<FileText size={14} />} onClick={() => router.push("/app/documents")}>
                    Choose a document
                  </Button>
                )}
              </div>
              {doc ? (
                <p className="mt-2 text-[0.75rem] text-fg-subtle">
                  Tip: every field with a Write button accepts drafts directly — no copying needed.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="flex-1">
              <EmptyState
                icon={<Sparkles size={20} />}
                title="Your draft will appear here"
                description="Pick a piece of writing, choose a tone, add a brief and generate. You can rewrite as many times as you like."
                compact
              />
            </div>
          )}

          {doc && doc.payload.items?.length ? (
            <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--border)" }}>
              <div className="text-[0.75rem] font-semibold text-fg">Context the assistant can use</div>
              <div className="mt-1.5 space-y-1 text-[0.75rem] text-fg-muted">
                <div>
                  Client: {doc.payload.clientCompany || doc.payload.clientName || "—"} · Total{" "}
                  {formatMoney(computeTotals(doc.payload, doc.kind).total, doc.payload.currency ?? doc.currency)}
                </div>
                <ul className="list-disc pl-4">
                  {doc.payload.items.slice(0, 4).map((item) => (
                    <li key={item.id}>{truncate(item.description, 72)}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
