"use client";

import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import type { BusinessProfile, DocumentRecord, DocumentPayload } from "@/lib/types";
import { computeTotals, docLabels } from "@/lib/documents/compute";
import { defaultTemplateId, templateById } from "@/templates";
import { defaultQrTarget, qrDataUrl } from "@/lib/qr";
import { Button } from "@/components/ui";

/**
 * Renders any document through its template.
 *
 * The paper is always laid out at A4 width (794 px) and scaled with a CSS
 * transform, so the preview is pixel-identical to the PDF and print output at
 * every screen size — no reflow, no clipped text, no horizontal scrolling.
 */

export interface PaperPreviewProps {
  doc: DocumentRecord;
  business: BusinessProfile | null;
  /** Overrides the document's own design (used by the template picker). */
  design?: Partial<DocumentRecord["design"]>;
  payload?: DocumentPayload;
  /** Externally measured container width in CSS pixels. */
  fitWidth?: number;
  maxScale?: number;
  className?: string;
  /** Marks the paper as the print target. */
  printable?: boolean;
}

export function PaperPreview({ doc, business, design: designOverride, payload, fitWidth, maxScale = 1, className, printable }: PaperPreviewProps) {
  const [qr, setQr] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(fitWidth ?? 794);
  const [broken, setBroken] = useState(false);
  const [boundaryKey, setBoundaryKey] = useState(0);

  const design = useMemo(() => ({ ...doc.design, ...designOverride }), [doc.design, designOverride]);
  const effectivePayload = payload ?? doc.payload;

  useEffect(() => {
    if (fitWidth) {
      setMeasuredWidth(fitWidth);
      return;
    }
    const element = wrapperRef.current;
    if (!element) return;
    const update = () => setMeasuredWidth(element.clientWidth || 794);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fitWidth]);

  useEffect(() => {
    let cancelled = false;
    if (!design.showQr) {
      setQr("");
      return;
    }
    const value = design.qrValue || defaultQrTarget(doc.kind, doc.number, business);
    qrDataUrl(value, { size: 260, color: "#101827" })
      .then((data) => {
        if (!cancelled) setQr(data);
      })
      .catch(() => {
        if (!cancelled) setQr("");
      });
    return () => {
      cancelled = true;
    };
  }, [design.qrValue, design.showQr, doc.kind, doc.number, business]);

  const template = templateById(design.templateId) ?? templateById(defaultTemplateId[doc.kind]);
  const totals = useMemo(
    () => computeTotals({ ...effectivePayload, currency: effectivePayload.currency ?? doc.currency }, doc.kind),
    [effectivePayload, doc.currency, doc.kind],
  );

  const scale = Math.min(maxScale, Math.min(794, measuredWidth || 794) / 794);

  if (!template || broken) {
    return (
      <div ref={wrapperRef} className={className}>
        <div className="paper flex min-h-[420px] flex-col items-center justify-center gap-4 p-12 text-center">
          <AlertTriangle size={26} style={{ color: "#b45309" }} />
          <h3 className="text-[1rem] font-semibold text-fg">This design could not be rendered</h3>
          <p className="max-w-sm text-[0.8125rem] text-fg-muted">
            {broken ? "Something in this layout failed. Your content is safe — try reloading the preview or picking another design." : "Choose a different design from the Design tab."}
          </p>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={14} />}
            onClick={() => {
              setBroken(false);
              setBoundaryKey((k) => k + 1);
            }}
          >
            Reload preview
          </Button>
          <span className="text-[0.75rem] text-fg-subtle">{doc.number}</span>
        </div>
      </div>
    );
  }

  const ctx = {
    doc: { ...doc, design, payload: effectivePayload },
    payload: effectivePayload,
    business,
    design,
    totals,
    qr,
    labels: docLabels(doc.kind),
    preview: true,
  };

  return (
    <div ref={wrapperRef} className={className}>
      <div className="paper-shell" style={{ height: 1123 * scale }}>
        <div style={{ width: 794 * scale, height: 1123 * scale, overflow: "hidden", flex: "0 0 auto" }}>
          <div
            className={printable ? "print-root" : undefined}
            style={{ width: 794, height: 1123, transform: `scale(${scale})`, transformOrigin: "top left" }}
          >
            <TemplateBoundary key={`${template.id}-${boundaryKey}`} onError={() => setBroken(true)}>
              {template.render(ctx)}
            </TemplateBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Keeps a broken template from taking the whole editor down. */
class TemplateBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  constructor(props: { children: ReactNode; onError: () => void }) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[seedwel] template render failed", error);
    this.props.onError();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
