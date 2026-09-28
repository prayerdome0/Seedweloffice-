"use client";

import { ArrowDown, ArrowUp, Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import type { DocKind, DocumentPayload, LineItem } from "@/lib/types";
import { blankLineItem, computeTotals } from "@/lib/documents/compute";
import { docKindMeta } from "@/lib/constants";
import { formatMoney, uid } from "@/lib/utils";

/**
 * Line-item editor. Reordering, duplicating and deleting are all keyboard
 * reachable, and every change recalculates totals in the parent immediately.
 */
export function ItemsEditor({
  kind,
  payload,
  currency,
  onChange,
  onAssistDescription,
}: {
  kind: DocKind;
  payload: DocumentPayload;
  currency: string;
  onChange: (patch: Partial<DocumentPayload>) => void;
  onAssistDescription?: (index: number) => void;
}) {
  const meta = docKindMeta(kind);
  const items = payload.items ?? [];
  const totals = computeTotals(payload, kind);

  const update = (next: LineItem[]) => onChange({ items: next });

  const patchItem = (id: string, patch: Partial<LineItem>) => update(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    update(next);
  };

  if (!meta.hasLineItems) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
            <div className="flex items-start gap-2">
              <span className="mt-2.5 hidden shrink-0 text-fg-subtle sm:block">
                <GripVertical size={15} />
              </span>
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-12">
                <div className="sm:col-span-12">
                  <div className="flex items-center gap-2">
                    <Input
                      value={item.description}
                      placeholder={`What are you ${kind === "purchase-order" ? "ordering" : "charging for"}?`}
                      onChange={(event) => patchItem(item.id, { description: event.target.value })}
                    />
                    {onAssistDescription ? (
                      <Button variant="outline" size="icon" className="shrink-0" title="Draft a description" onClick={() => onAssistDescription(index)}>
                        <span className="text-[0.6875rem] font-bold">AI</span>
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="sm:col-span-12">
                  <Input
                    value={item.detail ?? ""}
                    placeholder="Supporting detail (optional)"
                    onChange={(event) => patchItem(item.id, { detail: event.target.value })}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="label text-[0.6875rem]">Quantity</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={item.qty}
                    onChange={(event) => patchItem(item.id, { qty: Number(event.target.value) || 0 })}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="label text-[0.6875rem]">Unit</label>
                  <Input value={item.unit} placeholder="unit" onChange={(event) => patchItem(item.id, { unit: event.target.value })} />
                </div>
                <div className="sm:col-span-3">
                  <label className="label text-[0.6875rem]">Rate</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(event) => patchItem(item.id, { rate: Number(event.target.value) || 0 })}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="label text-[0.6875rem]">Tax %</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={item.taxRate ?? 0}
                    onChange={(event) => patchItem(item.id, { taxRate: Number(event.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button variant="ghost" size="icon" className="btn-sm" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">
                  <ArrowUp size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="btn-sm" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move down">
                  <ArrowDown size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="btn-sm"
                  aria-label="Duplicate line"
                  onClick={() => {
                    const next = [...items];
                    next.splice(index + 1, 0, { ...item, id: uid("itm") });
                    update(next);
                  }}
                >
                  <Copy size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="btn-sm"
                  aria-label="Remove line"
                  onClick={() => update(items.filter((i) => i.id !== item.id))}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[0.75rem] text-fg-muted">
              <span>
                Line total{" "}
                <strong className="font-semibold tabular-nums text-fg">{formatMoney(item.qty * item.rate, currency)}</strong>
              </span>
              {item.taxRate ? <span>Tax {(item.qty * item.rate * item.taxRate) / 100 > 0 ? formatMoney((item.qty * item.rate * item.taxRate) / 100, currency) : "—"}</span> : null}
            </div>
          </div>
        ))}

        {!items.length ? (
          <p className="rounded-xl border border-dashed px-3 py-6 text-center text-[0.8125rem] text-fg-muted" style={{ borderColor: "var(--border-strong)" }}>
            No line items yet. Add the first one below — or switch on the writing assistant to draft a starting list.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={() => update([...items, blankLineItem()])}>
          Add line
        </Button>
        {onAssistDescription ? (
          <Button variant="ghost" size="sm" onClick={() => onAssistDescription(-1)}>
            Draft a common list
          </Button>
        ) : null}
      </div>

      <div className="rounded-xl border p-3" style={{ borderColor: "var(--border)" }}>
        <div className="grid gap-3 sm:grid-cols-4">
          <label className="field">
            <span className="label">Discount type</span>
            <Select value={payload.discountType ?? "percent"} onChange={(event) => onChange({ discountType: event.target.value as "percent" | "fixed" })}>
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </Select>
          </label>
          <label className="field">
            <span className="label">Discount value</span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={payload.discountValue ?? 0}
              onChange={(event) => onChange({ discountValue: Number(event.target.value) || 0 })}
            />
          </label>
          <label className="field">
            <span className="label">Tax rate %</span>
            <Input type="number" min="0" step="0.01" value={payload.taxRate ?? 0} onChange={(event) => onChange({ taxRate: Number(event.target.value) || 0 })} />
          </label>
          <label className="field">
            <span className="label">Shipping / handling</span>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={payload.shipping ?? 0}
              onChange={(event) => onChange({ shipping: Number(event.target.value) || 0 })}
            />
          </label>
        </div>

        <dl className="mt-3 space-y-1.5 border-t pt-3 text-[0.8125rem]" style={{ borderColor: "var(--border)" }}>
          <Row label="Subtotal" value={formatMoney(totals.subtotal, currency)} />
          {totals.discount > 0 ? <Row label="Discount" value={`- ${formatMoney(totals.discount, currency)}`} /> : null}
          {totals.tax > 0 ? <Row label={`${payload.taxLabel ?? "Tax"} ${payload.taxRate ?? 0}%`} value={formatMoney(totals.tax, currency)} /> : null}
          {totals.shipping > 0 ? <Row label="Shipping" value={formatMoney(totals.shipping, currency)} /> : null}
          <Row label="Total" value={formatMoney(totals.total, currency)} strong />
          {totals.paid > 0 ? <Row label="Amount paid" value={formatMoney(totals.paid, currency)} /> : null}
          {totals.paid > 0 ? <Row label="Balance due" value={formatMoney(totals.balance, currency)} strong /> : null}
        </dl>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={strong ? "font-semibold text-fg" : "text-fg-muted"}>{label}</dt>
      <dd className={strong ? "font-semibold tabular-nums text-fg" : "tabular-nums text-fg"}>{value}</dd>
    </div>
  );
}
